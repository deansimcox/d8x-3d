import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {useReducedMotion} from './motion';
import {Block} from './props';
import type {Vec3} from './layout';

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
    balloon.current?.position.set(42+Math.sin(t*.075)*8,39+Math.sin(t*.22)*1.1,-39+Math.sin(t*.063)*7);
    if(balloon.current)balloon.current.rotation.y=t*.075;
  });
  return <group ref={balloon} position={[42,39,-39]}>
    <mesh geometry={panels}><meshStandardMaterial vertexColors roughness={.83}/></mesh>
    <Block position={[0,-4.45,0]} size={[1.43,.88,1.23]} color="#a67c4e"/>
    {[-.47,.47].flatMap(x=>[-.42,.42].map(z=><Block key={x+'/'+z} position={[x,-3.54,z]} size={[.04,1.26,.04]} color="#735942"/>))}
  </group>;
}
function Flock(){
  const birds=useRef<THREE.Group>(null),reduced=useReducedMotion();
  useFrame(({clock})=>{
    const t=reduced?0:clock.elapsedTime;
    birds.current?.children.forEach((bird,i)=>{
      const a=t*.20+i*.085+1.85;
      bird.position.set(Math.cos(a)*(36+i*.75),25+i*.76+Math.sin(a*2)*2.4,Math.sin(a)*31-5);
      bird.rotation.y=-a;
      const flap=reduced?.15:Math.sin(t*6+i*.78)*.7;
      bird.children[1].rotation.z=flap;
      bird.children[2].rotation.z=-flap;
    });
  });
  return <group ref={birds}>{Array.from({length:6},(_,i)=><group key={i}>
    <mesh scale={[.15,.12,.36]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color="#4a464d"/></mesh>
    {[-1,1].map(side=><group key={side}><mesh position={[side*.38,.035,-.09]} rotation={[0,side*.24,side*.12]} scale={[.5,.046,.15]}><sphereGeometry args={[1,8,5]}/><meshStandardMaterial color="#f2e9d3"/></mesh></group>)}
  </group>)}</group>;
}
const islets:{position:Vec3;scale:number;turn:number}[]=[
  {position:[-106,-5,-91],scale:1.5,turn:.32},{position:[-5,-13,-145],scale:1.1,turn:1.2},
  {position:[122,-10,-51],scale:1.3,turn:2.3},{position:[-117,-11,81],scale:1.15,turn:1.2},
  {position:[92,-23,94],scale:.82,turn:.8},
];
export function SkyDetails({dusk}:{dusk:{value:number}}){
  const sunlight=useRef<THREE.MeshBasicMaterial>(null);
  useFrame(()=>{if(sunlight.current)sunlight.current.opacity=1-dusk.value});
  return <>
    <mesh position={[-87,57,-153]}><sphereGeometry args={[5.8,24,16]}/><meshBasicMaterial ref={sunlight} color="#fff0b0" fog={false} transparent depthWrite={false}/></mesh>
    {islets.map(({position:[x,y,z],scale,turn},i)=><group key={i} position={[x*1.46,y-7,z*1.46]} scale={scale*.83} rotation={[0,turn,0]}>
      <mesh position={[0,-4.1,0]} rotation={[Math.PI,0,0]} scale={[1,1,.72]}><coneGeometry args={[10.5,11,7]}/><meshStandardMaterial color="#789295" fog={false} flatShading/></mesh>
      <mesh position={[0,1.45,0]} scale={[1,1,.74]}><cylinderGeometry args={[9.6,10.7,1.4,9]}/><meshStandardMaterial color="#91a89a" fog={false} flatShading/></mesh>
      <mesh position={[-2.35,4.5,-.3]} rotation={[0,.32,.10]}><coneGeometry args={[4.5,5.4,5]}/><meshStandardMaterial color="#a1b4ae" fog={false} flatShading/></mesh>
      <mesh position={[3.2,3.55,-1.2]}><coneGeometry args={[2.5,3.2,5]}/><meshStandardMaterial color="#86a197" fog={false} flatShading/></mesh>
    </group>)}
    <Balloon/><Flock/>
  </>;
}
