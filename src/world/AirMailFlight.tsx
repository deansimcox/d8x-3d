import {useEffect,useMemo,useRef,type RefObject} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {useExperience} from '../store';
import {airMailDelivery,airMailGates} from '../airMail';
import {FlightRing,ParcelDrop,type Drop} from './airMailEffects';
import {useReducedMotion} from './motion';

const route=new THREE.CatmullRomCurve3([
  [-48,25,-14],[-48,24,10],[-39,25,35],[-7,27,49],[29,29,42],[52,29,16],
  [53,28,-18],[31,26,-42],[-4,25,-51],[-38,25,-47],[-65,27,-46],
  [-91,29,-61],[-117,25,-87],[-146,22,-118],[-178,25,-127],[-203,31,-104],
  [-201,33,-69],[-176,32,-44],[-140,31,-40],[-104,30,-48],[-76,28,-49],[-56,26,-36],
].map(([x,y,z])=>new THREE.Vector3(x,y,z)),true);
route.arcLengthDivisions=1600;
const flightSpeed=17;
const ringRadius=8;
const turnRadius=7;
const turnDuration=Math.PI*turnRadius/flightSpeed;
const wrap=(progress:number)=>THREE.MathUtils.euclideanModulo(progress,1);
const totalLength=route.getLength();

function gate(progress:number,side:number,height:number){
  const center=route.getPointAt(progress);
  const direction=route.getTangentAt(progress);
  center.addScaledVector(new THREE.Vector3(-direction.z,0,direction.x).normalize(),side);
  center.y+=height;
  return {progress,side,height,center,rotation:Math.atan2(direction.x,direction.z)};
}
const rings=airMailGates.map(({progress,side,height})=>gate(progress,side,height));
// Place the delivery ring on the straight approach before the lighthouse turn.
const lighthouse=gate(airMailDelivery,0,0);

export function AirMailFlight({plane,propeller}:{
  plane:RefObject<THREE.Group>;propeller:RefObject<THREE.Group>;
}){
  const {camera,gl}=useThree();
  const reduced=useReducedMotion();
  const collected=useExperience(s=>s.flightRings);
  const delivered=useExperience(s=>s.flightDelivered);
  const freestyle=useExperience(s=>s.flightFreestyle);
  const paused=delivered&&!freestyle;
  const drops=useRef<Drop[]>([]);
  const input=useRef({keys:new Set<string>(),x:0,y:0});
  const freeFlight=useRef<{position:THREE.Vector3;yaw:number}|null>(null);
  const course=useRef({heading:1,request:0,turn:null as {progress:number;side:number;sign:number;time:number}|null});
  const run=useRef({progress:0,side:0,height:0,elapsed:0,bank:0,pitch:0});
  const vectors=useMemo(()=>({
    position:new THREE.Vector3(),direction:new THREE.Vector3(),right:new THREE.Vector3(),
    chase:new THREE.Vector3(),aim:new THREE.Vector3(),start:camera.position.clone(),
    startAim:camera.position.clone().addScaledVector(camera.getWorldDirection(new THREE.Vector3()),55),
  }),[camera]);

  useEffect(()=>{
    if(paused)return;
    const canvas=gl.domElement;
    let drag:{id:number;x:number;y:number}|undefined;
    const release=()=>{
      if(drag&&canvas.hasPointerCapture(drag.id))canvas.releasePointerCapture(drag.id);
      drag=undefined;
      input.current.keys.clear();
      input.current.x=0;
      input.current.y=0;
    };
    const down=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();useExperience.getState().exitFlight();return}
      if(event.key.toLowerCase()==='r'&&!freestyle){
        event.preventDefault();
        if(!event.repeat)useExperience.getState().turnFlight();
        return;
      }
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
      event.preventDefault();input.current.keys.add(event.key);
    };
    const up=(event:KeyboardEvent)=>input.current.keys.delete(event.key);
    const start=(event:PointerEvent)=>{
      if(!event.isPrimary||event.button!==0)return;
      drag={id:event.pointerId,x:event.clientX,y:event.clientY};
      canvas.setPointerCapture(event.pointerId);
    };
    const move=(event:PointerEvent)=>{
      if(!drag||drag.id!==event.pointerId)return;
      input.current.x=THREE.MathUtils.clamp((event.clientX-drag.x)/55,-1,1);
      input.current.y=THREE.MathUtils.clamp((drag.y-event.clientY)/55,-1,1);
    };
    const end=(event:PointerEvent)=>{
      if(drag?.id!==event.pointerId)return;
      drag=undefined;input.current.x=0;input.current.y=0;
    };
    canvas.focus({preventScroll:true});
    window.addEventListener('keydown',down);
    window.addEventListener('keyup',up);
    window.addEventListener('blur',release);
    canvas.addEventListener('pointerdown',start);
    canvas.addEventListener('pointermove',move);
    canvas.addEventListener('pointerup',end);
    canvas.addEventListener('pointercancel',end);
    canvas.addEventListener('lostpointercapture',end);
    return ()=>{
      release();
      window.removeEventListener('keydown',down);
      window.removeEventListener('keyup',up);
      window.removeEventListener('blur',release);
      canvas.removeEventListener('pointerdown',start);
      canvas.removeEventListener('pointermove',move);
      canvas.removeEventListener('pointerup',end);
      canvas.removeEventListener('pointercancel',end);
      canvas.removeEventListener('lostpointercapture',end);
    };
  },[gl,paused,freestyle]);

  useFrame(({camera:raw,clock},delta)=>{
    if(paused||!plane.current||!propeller.current)return;
    const camera=raw as THREE.PerspectiveCamera;
    const dt=Math.min(delta,.08),state=run.current,controls=input.current;
    const key=(key:string)=>Number(controls.keys.has(key));
    const steer=THREE.MathUtils.clamp(controls.x+key('ArrowRight')-key('ArrowLeft'),-1,1);
    const climb=THREE.MathUtils.clamp(controls.y+key('ArrowUp')-key('ArrowDown'),-1,1);
    const old=state.progress,oldSide=state.side,oldHeight=state.height;
    const flight=useExperience.getState();
    const next=rings[flight.flightRings];
    const track=course.current;
    let forward=track.heading,lateral=0,bank=steer*.22;
    state.elapsed+=dt;
    if(!freestyle&&(reduced||state.elapsed>.85)){
      if(flight.flightTurn!==track.request){
        track.request=flight.flightTurn;
        if(!track.turn){
          // Turn toward the next hoop when there is room on both sides of the course.
          const sign=Math.abs(state.side)<=3?Math.sign((next?.side??0)-state.side)||1:-Math.sign(state.side);
          track.turn={progress:state.progress,side:state.side,sign,time:0};
        }
      }
      const turn=track.turn;
      if(turn){
        turn.time=Math.min(turnDuration,turn.time+dt);
        const angle=Math.PI*turn.time/turnDuration;
        state.progress=wrap(turn.progress+track.heading*turnRadius*Math.sin(angle)/totalLength);
        state.side=turn.side+turn.sign*turnRadius*(1-Math.cos(angle));
        forward=track.heading*Math.cos(angle);
        lateral=turn.sign*Math.sin(angle);
        bank=track.heading*lateral*.35;
        if(turn.time===turnDuration){
          track.heading*=-1;
          track.turn=null;
        }
      }else{
        state.progress=wrap(state.progress+track.heading*flightSpeed*dt/totalLength);
        state.side=THREE.MathUtils.clamp(state.side+track.heading*steer*12*dt,-17,17);
      }
      state.height=THREE.MathUtils.clamp(state.height+climb*10*dt,-8,12);
    }
    const {position,direction,right,chase,aim,start,startAim}=vectors;
    if(freestyle){
      const free=freeFlight.current??={
        position:plane.current.position.clone(),
        yaw:plane.current.rotation.y,
      };
      const distance=Math.hypot(free.position.x,free.position.z);
      const boundary=THREE.MathUtils.smoothstep(distance,175,235);
      const home=Math.atan2(-free.position.x,-free.position.z);
      const correction=Math.atan2(Math.sin(home-free.yaw),Math.cos(home-free.yaw));
      const turn=THREE.MathUtils.lerp(-steer,THREE.MathUtils.clamp(correction*2,-1,1),boundary);
      free.yaw+=turn*.57*dt;
      direction.set(Math.sin(free.yaw),0,Math.cos(free.yaw));
      free.position.addScaledVector(direction,flightSpeed*dt);
      const mountainDistance=Math.hypot(free.position.x,free.position.z+5);
      const floor=THREE.MathUtils.lerp(36,21,THREE.MathUtils.smoothstep(mountainDistance,10,32));
      free.position.y=Math.min(76,free.position.y+climb*10*dt);
      if(free.position.y<floor)free.position.y=THREE.MathUtils.damp(free.position.y,floor,5,dt);
      position.copy(free.position);
    }else{
      route.getPointAt(state.progress,position);
      route.getTangentAt(state.progress,direction);
      right.set(-direction.z,0,direction.x).normalize();
      position.addScaledVector(right,state.side);
      position.y+=state.height;
      direction.multiplyScalar(forward).addScaledVector(right,lateral).normalize();
    }
    right.set(-direction.z,0,direction.x).normalize();
    // Work in the shortest signed interval so crossings also work in reverse and at the loop seam.
    const travel=wrap(state.progress-old+.5)-.5;
    const passes=(hoop:ReturnType<typeof gate>,radius:number)=>{
      const distance=wrap(hoop.progress-old+.5)-.5;
      if(travel===0)return false;
      const fraction=distance/travel;
      if(fraction<=0||fraction>1)return false;
      const side=THREE.MathUtils.lerp(oldSide,state.side,fraction)-hoop.side;
      const height=THREE.MathUtils.lerp(oldHeight,state.height,fraction)-hoop.height;
      return Math.hypot(side,height)<=radius;
    };
    const hit=next&&passes(next,ringRadius);
    const delivery=!next&&!flight.flightDelivered&&passes(lighthouse,11);
    if(hit||delivery){
      drops.current.push({origin:position.clone().setY(position.y-.7),direction:direction.clone()});
      if(hit)flight.recordRing();
      else flight.deliverMail();
    }
    plane.current.visible=true;
    plane.current.position.copy(position);
    const yaw=Math.atan2(direction.x,direction.z);
    state.bank=reduced?bank:THREE.MathUtils.damp(state.bank,bank,bank===0?4:8,dt);
    state.pitch=reduced?-climb*.12:THREE.MathUtils.damp(state.pitch,-climb*.12,climb===0?4:8,dt);
    plane.current.rotation.set(state.pitch,yaw,state.bank,'YXZ');
    propeller.current.rotation.z=reduced?0:clock.elapsedTime*24;
    chase.copy(position).addScaledVector(direction,-27);
    chase.y+=10;
    aim.copy(position).addScaledVector(direction,22).addScaledVector(right,-6);
    aim.y-=3;
    const blend=reduced?1:THREE.MathUtils.smoothstep(state.elapsed,0,.85);
    camera.clearViewOffset();
    camera.fov=gl.domElement.clientWidth<600?73:59;
    camera.updateProjectionMatrix();
    camera.position.lerpVectors(start,chase,blend);
    camera.lookAt(aim.lerpVectors(startAim,aim,blend));
  },-1);

  return <group>
    {!freestyle&&rings.map(({center,rotation},index)=><FlightRing key={index} center={center} rotation={rotation}
      radius={ringRadius} active={index===collected} complete={index<collected}/>)}
    {!freestyle&&collected===rings.length&&<FlightRing center={lighthouse.center} rotation={lighthouse.rotation}
      radius={11} active={!delivered} complete={delivered} delivery/>}
    {!reduced&&drops.current.map((drop,index)=><ParcelDrop key={index} drop={drop}/>)}
  </group>;
}