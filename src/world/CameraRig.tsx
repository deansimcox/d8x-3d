import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {useExperience} from '../store';
import {poses,type Pose} from './layout';
import {useReducedMotion} from './motion';

const vec=(v:Pose['position'])=>new THREE.Vector3(...v);
const ease=(t:number)=>t*t*t*(t*(t*6-15)+10);
type Journey={serial:number;start:number;duration:number;route:THREE.CatmullRomCurve3;look:THREE.Vector3;fov:number;offsetX:number;offsetY:number};
function route(from:THREE.Vector3,to:THREE.Vector3) {
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
  points.push(to);
  return new THREE.CatmullRomCurve3(points);
}
export function CameraRig() {
  const journey=useRef<Journey|null>(null),look=useRef(vec(poses.welcome.target));
  const offset=useRef({x:0,y:0});
  const reduced=useReducedMotion();
  const invalidate=useThree(s=>s.invalidate);
  useEffect(()=>useExperience.subscribe(()=>invalidate()),[invalidate]);
  useFrame(({camera:raw,clock,size})=>{
    const camera=raw as THREE.PerspectiveCamera;
    const state=useExperience.getState(),travel=state.mode==='transitioning';
    const id=state.mode==='welcome'?'welcome':travel?state.target:state.destination;
    const pose=poses[id],portrait=size.width/size.height<1.05;
    const portraitFov={welcome:30,overview:35,office:16,city:19,stadium:24,nature:13,family:17};
    const fov=pose.fov+(portrait?portraitFov[id]:0);
    const x=portrait?0:id==='welcome'?-.145:id==='overview'?-.075:state.panelOpen?-.115:0;
    const y=portrait?(id==='welcome'?.185:id==='overview'?-.015:state.panelOpen?.17:.035):0;
    const final=()=>{camera.position.set(...pose.position);look.current.set(...pose.target);camera.fov=fov;offset.current={x,y}};
    if(!travel||reduced) {
      final();journey.current=null;
      if(travel)state.arrived();
    } else {
      if(journey.current?.serial!==state.serial) {
        const destination=vec(pose.position);
        journey.current={serial:state.serial,start:clock.elapsedTime,duration:THREE.MathUtils.clamp(2.35+camera.position.distanceTo(destination)/85,2.5,4),route:route(camera.position.clone(),destination),look:look.current.clone(),fov:camera.fov,offsetX:offset.current.x,offsetY:offset.current.y};
      }
      const flight=journey.current,t=Math.min(1,(clock.elapsedTime-flight.start)/flight.duration),k=ease(t);
      flight.route.getPointAt(k,camera.position);
      look.current.copy(flight.look).lerp(vec(pose.target),k);
      if(id!=='overview')look.current.lerp(new THREE.Vector3(0,10,0),Math.sin(k*Math.PI)*.22);
      camera.fov=THREE.MathUtils.lerp(flight.fov,fov,k);
      offset.current={x:THREE.MathUtils.lerp(flight.offsetX,x,k),y:THREE.MathUtils.lerp(flight.offsetY,y,k)};
      if(t===1){final();journey.current=null;state.arrived()}
    }
    camera.lookAt(look.current);
    camera.setViewOffset(size.width,size.height,offset.current.x*size.width,offset.current.y*size.height,size.width,size.height);
  },-1);
  return null;
}
