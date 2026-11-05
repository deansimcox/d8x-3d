import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {Block,Blocks} from './props';
import {useReducedMotion} from './motion';

function Hen({index}:{index:number}){
  const hen=useRef<THREE.Group>(null),head=useRef<THREE.Group>(null),reduced=useReducedMotion();
  useFrame(({clock})=>{
    const t=reduced?0:clock.elapsedTime;
    const a=t*(.36+index*.027)+index*2.16;
    if(hen.current){
      hen.current.position.set(6.4+Math.cos(a)*(1+index*.14),-.10,4.4+Math.sin(a)*1.18);
      hen.current.rotation.y=-a;
    }
    if(head.current)head.current.rotation.x=reduced?0:Math.max(0,Math.sin(t*3.2+index))**6*.78;
  });
  const plumage=['#f1e5d4','#ad7254','#d7a677'][index];
  return <group ref={hen}>
    <mesh position={[0,.33,0]} scale={[.20,.23,.35]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color={plumage}/></mesh>
    <mesh position={[0,.46,-.29]} rotation={[-.55,0,0]} scale={[.105,.17,.15]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color={plumage}/></mesh>
    <group ref={head} position={[0,.48,.18]}>
      <mesh position={[0,.13,.10]}><sphereGeometry args={[.133,10,8]}/><meshStandardMaterial color={plumage}/></mesh>
      <mesh position={[0,.117,.255]} rotation={[Math.PI/2,0,0]}><coneGeometry args={[.055,.12,7]}/><meshStandardMaterial color="#d79a47"/></mesh>
      <mesh position={[0,.25,.10]} scale={[.055,.07,.103]}><sphereGeometry args={[1,8,5]}/><meshStandardMaterial color="#b74440"/></mesh>
      {[-1,1].map(side=><mesh key={side} position={[side*.108,.15,.16]}><sphereGeometry args={[.024,6,5]}/><meshStandardMaterial color="#29252a"/></mesh>)}
    </group>
    <Blocks items={[-.09,.09].map(x=>({position:[x,.10,0],size:[.034,.19,.039],color:'#c18449'}))}/>
  </group>;
}
export function KitchenGarden(){
  return <>
    <group position={[8.05,-.10,1.17]} rotation={[0,-.06,0]}>
      <Block position={[0,.16,0]} size={[2.6,.28,3.4]} color="#72503b"/>
      <Blocks items={[
        ...[-1.31,1.31].map(x=>({position:[x,.23,0] as [number,number,number],size:[.12,.39,3.52] as [number,number,number],color:'#b28a60'})),
        ...[-1.72,1.72].map(z=>({position:[0,.23,z] as [number,number,number],size:[2.68,.39,.12] as [number,number,number],color:'#b28a60'})),
        ...Array.from({length:15},(_,i)=>({position:[(i%3-1)*.73,.38,(Math.floor(i/3)-2)*.58] as [number,number,number],size:[.34,.21,.30] as [number,number,number],color:i%3===0?'#8fad65':i%3===1?'#557d4c':'#71965a',rotation:i*.76})),
      ]}/>
      <Blocks castShadow={false} items={Array.from({length:5},(_,i)=>({position:[-.72,.37,(i-2)*.58+.13],size:[.09,.10,.11],color:'#d98048'}))}/>
    </group>
    {[0,1,2].map(index=><Hen key={index} index={index}/>)}
  </>;
}
