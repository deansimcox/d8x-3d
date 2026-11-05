import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {useReducedMotion} from './motion';

const wingShape=new THREE.Shape().moveTo(0,0).bezierCurveTo(.03,.22,.25,.23,.24,.07).bezierCurveTo(.23,-.04,.15,-.03,.15,-.04).bezierCurveTo(.25,-.20,.08,-.22,0,0);
function Butterfly({index,color}:{index:number;color:string}){
  const flight=useRef<THREE.Group>(null);
  const left=useRef<THREE.Group>(null),right=useRef<THREE.Group>(null);
  const reduced=useReducedMotion();
  const geometry=useMemo(()=>new THREE.ShapeGeometry(wingShape,10),[]);
  useFrame(({clock})=>{
    const time=reduced?0:clock.elapsedTime;
    const angle=time*(.63+index*.13)+index*2.2;
    const centerX=index===0?-2.3:index===1?2.7:.75;
    const centerZ=index===0?-1.2:index===1?.8:-1.7;
    if(flight.current){
      flight.current.position.set(centerX+Math.cos(angle)*.84,1.02+index*.26+.18*Math.sin(angle*2.3),centerZ+Math.sin(angle)*.72);
      flight.current.rotation.y=-angle+.3;
    }
    const flap=.9*Math.sin(time*19+index)+.22;
    if(left.current)left.current.rotation.y=flap;
    if(right.current)right.current.rotation.y=-flap;
  });
  return <group ref={flight}>
    <group rotation={[-Math.PI/2,0,0]}>
      <group ref={left}><mesh geometry={geometry}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.12} side={THREE.DoubleSide}/></mesh></group>
      <group ref={right}><mesh geometry={geometry} scale={[-1,1,1]}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.12} side={THREE.DoubleSide}/></mesh></group>
      <mesh><sphereGeometry args={[.034,7,5]}/><meshStandardMaterial color="#302a29"/></mesh>
    </group>
  </group>;
}
export function Butterflies(){
  return <>{['#e7864e','#edc158','#9676cc'].map((color,index)=><Butterfly key={color} color={color} index={index}/>)}</>;
}
