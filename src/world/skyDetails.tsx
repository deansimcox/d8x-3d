import {Suspense,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {useReducedMotion} from './motion';
import {Block} from './props';
import type {Vec3} from './layout';
import {Model} from './models';
import {useExperience} from '../store';
import {AirMailFlight} from './AirMailFlight';
import {SkyFlocks} from './skyFlocks';

function Balloon(){
  const balloon=useRef<THREE.Group>(null),reduced=useReducedMotion();
  const panels=useMemo(()=>{
    const profile=[[.65,-2.8],[1.35,-2.45],[2.65,-1.15],[3.45,.4],[3.44,1.65],[2.85,2.8],[1.6,3.46],[0,3.68]].map(([x,y])=>new THREE.Vector2(x,y));
    const geometry=new THREE.LatheGeometry(profile,48),position=geometry.attributes.position;
    const colors=[];
    for(let i=0;i<position.count;i++){
      const panel=Math.min(11,Math.floor(i/profile.length/4));
      const color=new THREE.Color(panel%2?'#f3c06f':'#bd5949');
      colors.push(color.r,color.g,color.b);
    }
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    return geometry;
  },[]);
  useFrame(({clock})=>{
    const t=reduced?0:clock.elapsedTime;
    balloon.current?.position.set(42+Math.sin(t*.13)*16,39+Math.sin(t*.32)*2.3,-39+Math.sin(t*.10)*11);
    if(balloon.current)balloon.current.rotation.set(0,t*.105,Math.sin(t*.37)*.065);
  });
  return <group ref={balloon} position={[42,39,-39]}>
    <mesh geometry={panels}><meshStandardMaterial vertexColors roughness={.83}/></mesh>
    <Block position={[0,-4.45,0]} size={[1.43,.88,1.23]} color="#a67c4e"/>
    {[-.47,.47].flatMap(x=>[-.42,.42].map(z=><Block key={x+'/'+z} position={[x,-3.54,z]} size={[.04,1.26,.04]} color="#735942"/>))}
  </group>;
}
function VintagePlane(){
  const plane=useRef<THREE.Group>(null),propeller=useRef<THREE.Group>(null);
  const reduced=useReducedMotion();
  const flying=useExperience(s=>s.mode==='flight');
  const canFly=useExperience(s=>s.mode==='overview'&&s.ready);
  useFrame(({clock})=>{
    if(flying||!plane.current||!propeller.current)return;
    const time=(clock.elapsedTime+5)%43;
    const progress=time/23;
    plane.current.visible=!reduced&&progress<1;
    if(!plane.current.visible)return;
    plane.current.position.set(-208+448*progress,52+Math.sin(progress*Math.PI)*7,-77+30*progress);
    plane.current.rotation.set(.06*Math.sin(progress*Math.PI*3),Math.PI/2-.067,.025*Math.cos(progress*Math.PI));
    propeller.current.rotation.z=clock.elapsedTime*24;
  });
  return <>
  {flying&&<AirMailFlight plane={plane} propeller={propeller}/>}
  <group ref={plane} visible={false} scale={1.15}
    onClick={canFly?event=>{if(!plane.current?.visible)return;event.stopPropagation();useExperience.getState().startFlight()}:undefined}>
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.59,.25,4.7,10]}/><meshStandardMaterial color="#9b4435" flatShading/></mesh>
    <mesh position={[0,.45,-.15]} scale={[.39,.26,.67]}><sphereGeometry args={[1,10,6]}/><meshStandardMaterial color="#513e32"/></mesh>
    {[.03,1.28].map(y=><group key={y} position={[0,y,.28]}>
      <Block position={[0,0,0]} size={[7.6,.17,1.26]} color="#e2bc82"/>
      {[-3.42,3.42].map(x=><Block key={x} position={[x,.015,.01]} size={[.45,.18,1.27]} color="#a84b3b"/>)}
    </group>)}
    {[-2.45,2.45].flatMap(x=>[-.12,.57].map(z=><Block key={x+'/'+z} position={[x,.66,z]} size={[.08,1.22,.08]} color="#654c39"/>))}
    <Block position={[0,.04,-1.94]} size={[2.65,.13,.66]} color="#e2bc82"/>
    <mesh position={[0,.46,-1.9]} scale={[.12,.72,.52]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color="#9b4435" flatShading/></mesh>
    {[-.49,.49].map(x=><mesh key={x} position={[x,-.61,.75]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.25,.25,.13,10]}/><meshStandardMaterial color="#4b433c"/></mesh>)}
    <group ref={propeller} position={[0,0,2.48]}><Block position={[0,0,0]} size={[.19,2.32,.10]} color="#614932"/></group>
    <mesh position={[0,0,2.4]}><sphereGeometry args={[.28,10,7]}/><meshStandardMaterial color="#c99b62"/></mesh>
  </group></>;
}
const islets:{position:Vec3;scale:number;turn:number}[]=[
  {position:[-106,-5,-91],scale:1.5,turn:.32},{position:[-5,-13,-145],scale:1.1,turn:1.2},
  {position:[122,-10,-51],scale:1.3,turn:2.3},{position:[-117,-11,81],scale:1.15,turn:1.2},
  {position:[92,-23,94],scale:.82,turn:.8},
];
function Lighthouse({dusk}:{dusk:{value:number}}){
  const beam=useRef<THREE.Group>(null),material=useRef<THREE.MeshBasicMaterial>(null);
  const reduced=useReducedMotion();
  useFrame(({clock})=>{
    if(beam.current)beam.current.rotation.y=reduced?.35:clock.elapsedTime*.46;
    if(material.current)material.current.opacity=.065+dusk.value*.105;
  });
  return <group position={[0,2.1,0]}>
    <Suspense fallback={null}>
      <Model name="isletLighthouse" height={14} rotation={.9} fog={false}/>
      <group position={[0,11.75,0]}>
        <mesh><sphereGeometry args={[.62,12,8]}/><meshBasicMaterial color="#ffe1a0" fog={false}/></mesh>
        <group ref={beam}>
          <mesh position={[0,0,11]} rotation={[-Math.PI/2,0,0]}>
            <coneGeometry args={[2.7,22,18,1,true]}/>
            <meshBasicMaterial ref={material} color="#ffe6ad" transparent opacity={.065} depthWrite={false} fog={false} side={THREE.DoubleSide}/>
          </mesh>
        </group>
      </group>
    </Suspense>
  </group>;
}
function SkyFerry(){
  const ferry=useRef<THREE.Group>(null);
  const reduced=useReducedMotion();
  useFrame(({clock})=>{
    if(!ferry.current)return;
    // An oval route links the lighthouse islet and its neighbour without a jump.
    const time=reduced?0:clock.elapsedTime;
    const angle=1.18+time*.072;
    const along=Math.cos(angle),across=Math.sin(angle);
    ferry.current.position.set(-81+65*along+10*across,30+1.7*Math.sin(time*.41),-169-34*along+19*across);
    ferry.current.rotation.set(.035*Math.sin(time*.31),Math.atan2(-65*across+10*along,34*across+19*along),.075*Math.sin(time*.27));
  });
  return <group ref={ferry} position={[-47,30,-165]}>
    <Suspense fallback={null}>
      <Model name="skyFerry" height={9} fog={false}/>
      <Block position={[0,1.7,0]} size={[7.0,.19,.24]} color="#7a5038"/>
      {[-3.05,3.05].map(x=><group key={x} position={[x,1.72,0]}>
        <mesh scale={[.86,.77,2.85]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color="#c4884d" fog={false} flatShading/></mesh>
        {[-.95,.95].map(z=><mesh key={z} position={[0,0,z]} scale={[.77,.69,1]}><torusGeometry args={[1,.045,5,14]}/><meshStandardMaterial color="#815b3b" fog={false}/></mesh>)}
      </group>)}
      <mesh position={[0,2.15,-3.2]}><sphereGeometry args={[.18,8,6]}/><meshBasicMaterial color="#ffdf9c" fog={false}/></mesh>
    </Suspense>
  </group>;
}
export function SkyDetails({dusk}:{dusk:{value:number}}){
  const sunlight=useRef<THREE.MeshBasicMaterial>(null);
  useFrame(()=>{if(sunlight.current)sunlight.current.opacity=1-dusk.value});
  return <>
    <mesh position={[-87,57,-153]}><sphereGeometry args={[5.8,24,16]}/><meshBasicMaterial ref={sunlight} color="#fff0b0" fog={false} transparent depthWrite={false}/></mesh>
    {islets.map(({position:[x,y,z],scale,turn},i)=><group key={i} position={[x*1.46,y-7,z*1.46]} scale={scale*.83} rotation={[0,turn,0]}>
      <mesh position={[0,-4.1,0]} rotation={[Math.PI,0,0]} scale={[1,1,.72]}><coneGeometry args={[10.5,11,7]}/><meshStandardMaterial color="#789295" fog={false} flatShading/></mesh>
      <mesh position={[0,1.45,0]} scale={[1,1,.74]}><cylinderGeometry args={[9.6,10.7,1.4,9]}/><meshStandardMaterial color="#91a89a" fog={false} flatShading/></mesh>
      {i===0?<Lighthouse dusk={dusk}/>:<>
        <mesh position={[-2.35,4.5,-.3]} rotation={[0,.32,.10]}><coneGeometry args={[4.5,5.4,5]}/><meshStandardMaterial color="#a1b4ae" fog={false} flatShading/></mesh>
        <mesh position={[3.2,3.55,-1.2]}><coneGeometry args={[2.5,3.2,5]}/><meshStandardMaterial color="#86a197" fog={false} flatShading/></mesh>
      </>}
    </group>)}
    <Balloon/><SkyFlocks/><VintagePlane/><SkyFerry/>
  </>;
}
