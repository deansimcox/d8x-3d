import {useEffect,useMemo,useRef,type RefObject} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {useExperience} from '../store';
import {useReducedMotion} from './motion';

const route=new THREE.CatmullRomCurve3([
  [-45,32,42],[7,36,48],[49,38,27],[53,36,-17],[26,34,-45],[-14,32,-49],
  [-54,32,-63],[-103,31,-99],[-146,27,-121],[-137,34,-47],[-68,32,-11],[-58,32,24],
].map(([x,y,z])=>new THREE.Vector3(x,y,z)),true);
const flightSpeed=17;
const ringRadius=8;
const totalLength=route.getLength();

function gate(progress:number,side:number,height:number){
  const center=route.getPointAt(progress);
  const direction=route.getTangentAt(progress);
  center.addScaledVector(new THREE.Vector3(-direction.z,0,direction.x).normalize(),side);
  center.y+=height;
  return {progress,side,height,center,rotation:Math.atan2(direction.x,direction.z)};
}
const rings=[gate(.14,-9,0),gate(.27,8.5,2),gate(.40,-9,-2)];
// Place the delivery ring on the straight approach before the lighthouse turn.
const lighthouse=gate(.627,0,0);

export function AirMailFlight({plane,propeller}:{
  plane:RefObject<THREE.Group>;propeller:RefObject<THREE.Group>;
}){
  const {camera,gl}=useThree();
  const reduced=useReducedMotion();
  const collected=useExperience(s=>s.flightRings);
  const delivered=useExperience(s=>s.flightDelivered);
  const input=useRef({keys:new Set<string>(),x:0,y:0});
  const run=useRef({progress:0,side:0,height:0,elapsed:0,bank:0,pitch:0});
  const vectors=useMemo(()=>({
    position:new THREE.Vector3(),direction:new THREE.Vector3(),right:new THREE.Vector3(),
    chase:new THREE.Vector3(),aim:new THREE.Vector3(),start:camera.position.clone(),
    startAim:camera.position.clone().addScaledVector(camera.getWorldDirection(new THREE.Vector3()),55),
  }),[camera]);

  useEffect(()=>{
    const canvas=gl.domElement;
    let drag:{id:number;x:number;y:number}|undefined;
    const release=()=>{drag=undefined;input.current.keys.clear();input.current.x=0;input.current.y=0};
    const down=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();useExperience.getState().exitFlight();return}
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
      window.removeEventListener('keydown',down);
      window.removeEventListener('keyup',up);
      window.removeEventListener('blur',release);
      canvas.removeEventListener('pointerdown',start);
      canvas.removeEventListener('pointermove',move);
      canvas.removeEventListener('pointerup',end);
      canvas.removeEventListener('pointercancel',end);
      canvas.removeEventListener('lostpointercapture',end);
    };
  },[gl]);

  useFrame(({camera:raw,clock},delta)=>{
    if(!plane.current||!propeller.current)return;
    const camera=raw as THREE.PerspectiveCamera;
    const dt=Math.min(delta,.08),state=run.current,controls=input.current;
    const key=(key:string)=>Number(controls.keys.has(key));
    const steer=THREE.MathUtils.clamp(controls.x+key('ArrowRight')-key('ArrowLeft'),-1,1);
    const climb=THREE.MathUtils.clamp(controls.y+key('ArrowUp')-key('ArrowDown'),-1,1);
    const old=state.progress;
    state.elapsed+=dt;
    if(reduced||state.elapsed>.85){
      state.progress=(state.progress+flightSpeed*dt/totalLength)%1;
      state.side=THREE.MathUtils.clamp(state.side+steer*12*dt,-17,17);
      state.height=THREE.MathUtils.clamp(state.height+climb*10*dt,-10,12);
    }
    const flight=useExperience.getState();
    const next=rings[flight.flightRings];
    const crosses=(progress:number)=>old<=progress&&state.progress>=progress;
    if(next&&crosses(next.progress)&&Math.hypot(state.side-next.side,state.height-next.height)<=ringRadius){
      flight.recordRing();
    }else if(!next&&!flight.flightDelivered&&crosses(lighthouse.progress)&&Math.hypot(state.side,state.height)<11){
      flight.deliverMail();
    }

    const {position,direction,right,chase,aim,start,startAim}=vectors;
    route.getPointAt(state.progress,position);
    route.getTangentAt(state.progress,direction);
    right.set(-direction.z,0,direction.x).normalize();
    position.addScaledVector(right,state.side);
    position.y+=state.height;
    plane.current.visible=true;
    plane.current.position.copy(position);
    const yaw=Math.atan2(direction.x,direction.z);
    state.bank=reduced?steer*.22:THREE.MathUtils.damp(state.bank,steer*.22,steer===0?4:8,dt);
    state.pitch=reduced?-climb*.12:THREE.MathUtils.damp(state.pitch,-climb*.12,climb===0?4:8,dt);
    plane.current.rotation.set(state.pitch,yaw,state.bank,'YXZ');
    propeller.current.rotation.z=reduced?0:clock.elapsedTime*24;
    chase.copy(position).addScaledVector(direction,-21);
    chase.y+=9;
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
    {rings.map(({center,rotation},index)=>index>=collected&&<mesh key={index} position={center} rotation={[0,rotation,0]}>
      <torusGeometry args={[ringRadius,.42,8,36]}/>
      <meshBasicMaterial color={index===collected?'#ffd087':'#d4b782'} fog={false}/>
    </mesh>)}
    {collected===rings.length&&!delivered&&<mesh position={lighthouse.center} rotation={[0,lighthouse.rotation,0]}>
      <torusGeometry args={[11,.42,8,40]}/>
      <meshBasicMaterial color="#a6ecbd" fog={false}/>
    </mesh>}
  </group>;
}
