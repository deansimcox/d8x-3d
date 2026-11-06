import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import type {Destination} from '../content';
import {useExperience} from '../store';
import {anchors,poses,workshopAngle,workshopApproach,workshopWindow,type Pose} from './layout';
import {useReducedMotion} from './motion';
import {useScenePan} from './scenePan';

const vec=(v:Pose['position'])=>new THREE.Vector3(...v);
const worldUp=new THREE.Vector3(0,1,0);
const welcomeOrbitSpeed=.035;
const overviewTurn=.075;
const ease=(t:number)=>t*t*t*(t*(t*6-15)+10);
type Journey={serial:number;start:number;duration:number;move:(t:number,p:THREE.Vector3)=>void;look:THREE.Vector3;fov:number;offsetX:number;offsetY:number;entering:boolean};
function route(from:THREE.Vector3,to:THREE.Vector3,leadIn?:THREE.Vector3) {
  const a=Math.atan2(from.z,from.x),b=Math.atan2(to.z,to.x);
  const delta=Math.atan2(Math.sin(b-a),Math.cos(b-a));
  const r0=Math.hypot(from.x,from.z),r1=Math.hypot(to.x,to.z);
  const points=[from];
  for(const t of [.28,.52,.76]) {
    const angle=a+delta*t;
    const radius=Math.max(32,THREE.MathUtils.lerp(r0,r1,t)+Math.sin(t*Math.PI)*Math.min(12,Math.abs(delta)*7));
    const y=THREE.MathUtils.lerp(from.y,to.y,t)+Math.sin(t*Math.PI)*(5+Math.abs(delta)*4);
    points.push(new THREE.Vector3(Math.cos(angle)*radius,y,Math.sin(angle)*radius));
  }
  if(leadIn)points.push(leadIn);
  points.push(to);
  return new THREE.CatmullRomCurve3(points);
}
function introGlide(from:THREE.Vector3,to:THREE.Vector3){
  const heading=Math.atan2(from.x,from.z);
  const startRadius=Math.hypot(from.x,from.z),endRadius=Math.hypot(to.x,to.z);
  return (t:number,position:THREE.Vector3)=>{
    const progress=ease(t),angle=heading+overviewTurn*progress;
    const radius=THREE.MathUtils.lerp(startRadius,endRadius,progress);
    position.set(Math.sin(angle)*radius,THREE.MathUtils.lerp(from.y,to.y,progress),Math.cos(angle)*radius);
  };
}
function flightPath(from:THREE.Vector3,to:THREE.Vector3,destination:Destination){
  const approach=vec(workshopApproach),dx=from.x-anchors.office[0],dz=from.z-anchors.office[2];
  const localX=dx*Math.cos(workshopAngle)-dz*Math.sin(workshopAngle);
  const localZ=dx*Math.sin(workshopAngle)+dz*Math.cos(workshopAngle);
  const atWindow=Math.abs(localX-.95)<.25&&Math.abs(from.y-workshopWindow[1])<.35&&localZ>=2.7&&localZ<7.19;
  if(destination==='office'){
    if(atWindow)return (t:number,p:THREE.Vector3)=>p.lerpVectors(from,to,ease(t));

    // Align the final outdoor segment with the window, then ease across both
    // curves together so the camera carries its speed through the join.
    const leadDistance=Math.min(2.4,from.distanceTo(approach)*.12);
    const leadIn=approach.clone().addScaledVector(approach.clone().sub(to).normalize(),leadDistance);
    const path=new THREE.CurvePath<THREE.Vector3>();
    path.add(route(from,approach,leadIn));
    path.add(new THREE.LineCurve3(approach,to));
    return (t:number,p:THREE.Vector3)=>p.copy(path.getPoint(ease(t)));
  }
  const origin=atWindow?approach:from;
  const angle=Math.atan2(origin.x,origin.z)-Math.atan2(to.x,to.z);
  const approachAngle=Math.atan2(Math.sin(angle),Math.cos(angle));
  const leadIn=destination==='overview'&&Math.abs(approachAngle)>.01
    ?to.clone().applyAxisAngle(worldUp,THREE.MathUtils.clamp(approachAngle*.18,-overviewTurn,overviewTurn))
    :undefined;
  const outside=route(origin,to,leadIn);
  return (t:number,p:THREE.Vector3)=>{
    if(atWindow){
      if(t<.25)p.lerpVectors(from,approach,ease(t/.25));
      else outside.getPointAt(ease((t-.25)/.75),p);
    }else outside.getPointAt(ease(t),p);
  };
}
export function CameraRig() {
  const journey=useRef<Journey|null>(null),look=useRef(vec(poses.welcome.target));
  const offset=useRef({x:0,y:0});
  const welcomeOrbit=useRef(0);
  const overviewYaw=useRef(0);
  const settledScene=useRef<string|null>(null);
  const reduced=useReducedMotion();
  const pan=useScenePan();
  const invalidate=useThree(s=>s.invalidate);
  useEffect(()=>useExperience.subscribe(()=>invalidate()),[invalidate]);
  useFrame(({camera:raw,clock,size},delta)=>{
    const camera=raw as THREE.PerspectiveCamera;
    const state=useExperience.getState(),travel=state.mode==='transitioning';
    const id=state.mode==='welcome'?'welcome':travel?state.target:state.destination;
    const enteringOverview=travel&&id==='overview'&&welcomeOrbit.current>0&&!reduced;
    if(id!=='welcome'||reduced)welcomeOrbit.current=0;
    if(id!=='overview'||reduced)overviewYaw.current=0;
    if(enteringOverview){
      overviewYaw.current=Math.atan2(camera.position.x,camera.position.z)+overviewTurn
        -Math.atan2(poses.overview.position[0],poses.overview.position[2]);
    }
    const pose=poses[id],portrait=size.width/size.height<1.05;
    const portraitFov={welcome:30,overview:35,office:22,city:19,stadium:16,nature:13,family:17};
    const fov=pose.fov+(portrait?portraitFov[id]:0);
    const x=portrait?(id==='office'?.16:0):id==='welcome'?-.145:id==='overview'?-.075:state.panelOpen?-.115:0;
    const y=portrait?(id==='welcome'?.185:id==='overview'?-.015:state.panelOpen?.17:.035):0;
    const final=()=>{
      camera.position.set(...pose.position);
      if(id==='overview')camera.position.applyAxisAngle(worldUp,overviewYaw.current);
      look.current.set(...pose.target);camera.fov=fov;offset.current={x,y};
    };
    if(!travel||reduced) {
      const previousOffset=offset.current;
      final();journey.current=null;
      if(id==='welcome'&&state.ready&&!reduced){
        welcomeOrbit.current=(welcomeOrbit.current+welcomeOrbitSpeed*Math.min(delta,.1))%(Math.PI*2);
        camera.position.sub(look.current).applyAxisAngle(worldUp,welcomeOrbit.current).add(look.current);
      }
      if(!reduced&&state.mode==='scene'&&settledScene.current===id){
        offset.current={
          x:THREE.MathUtils.damp(previousOffset.x,x,12,delta),
          y:THREE.MathUtils.damp(previousOffset.y,y,12,delta),
        };
      }
      if(travel)state.arrived();
    } else {
      if(journey.current?.serial!==state.serial) {
        const destination=vec(pose.position);
        if(id==='overview')destination.applyAxisAngle(worldUp,overviewYaw.current);
        const from=camera.position.clone();
        const move=enteringOverview?introGlide(from,destination):flightPath(from,destination,state.target);
        journey.current={serial:state.serial,start:clock.elapsedTime,duration:id==='office'?3.85:THREE.MathUtils.clamp(2.35+from.distanceTo(destination)/85,2.5,4),move,look:look.current.clone(),fov:camera.fov,offsetX:offset.current.x,offsetY:offset.current.y,entering:id==='office'};
      }
      const flight=journey.current,t=Math.min(1,(clock.elapsedTime-flight.start)/flight.duration),k=ease(t);
      flight.move(t,camera.position);
      if(flight.entering){
        look.current.copy(flight.look).lerp(vec(workshopWindow),ease(Math.min(1,t/.64)));
        look.current.lerp(vec(pose.target),ease(Math.max(0,(t-.70)/.30)));
      }else{
        look.current.copy(flight.look).lerp(vec(pose.target),k);
        if(id!=='overview')look.current.lerp(new THREE.Vector3(0,10,0),Math.sin(k*Math.PI)*.22);
      }
      camera.fov=THREE.MathUtils.lerp(flight.fov,fov,k);
      offset.current={x:THREE.MathUtils.lerp(flight.offsetX,x,k),y:THREE.MathUtils.lerp(flight.offsetY,y,k)};
      if(t===1){final();journey.current=null;state.arrived()}
    }
    settledScene.current=state.mode==='scene'?id:null;
    camera.lookAt(look.current);
    if(!travel&&state.mode!=='welcome'){
      if(state.mode==='scene')camera.rotateOnWorldAxis(worldUp,pan.current.yaw);
      else camera.rotateY(pan.current.yaw);
      camera.rotateX(pan.current.pitch);
    }
    camera.setViewOffset(size.width,size.height,offset.current.x*size.width,offset.current.y*size.height,size.width,size.height);
  },-1);
  return null;
}
