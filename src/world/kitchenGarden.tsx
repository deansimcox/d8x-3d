import {useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Block,Blocks} from './props';
import {useReducedMotion} from './motion';
import {useExperience} from '../store';
import {familyLawnPosition} from './familyPlay';
import {playChickenSquawk} from '../audio';

const henRoutes=[
  [[6.8,4.4],[8.3,3.6],[9.45,4.05],[8.6,5.15],[7,5.6]],
  [[6.25,6],[7.75,5.8],[8.25,7.2],[7.45,8.55],[6.6,7.45]],
  [[2.35,6.7],[3.6,6.8],[3.9,8.2],[2.7,9.1],[1.7,8.3]],
].map(points=>new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,0,z)),true));
const hopDuration=.58;

function Hen({index}:{index:number}){
  const hen=useRef<THREE.Group>(null),head=useRef<THREE.Group>(null),wings=useRef<THREE.Group>(null);
  const reduced=useReducedMotion(),invalidate=useThree(state=>state.invalidate);
  const route=henRoutes[index];
  const motion=useRef({progress:index*.19,direction:1,elapsed:0,hop:null as number|null,step:0});

  useFrame((_,delta)=>{
    if(!hen.current)return;
    const state=motion.current,dt=reduced?0:Math.min(delta,.06);
    const active=useExperience.getState().destination==='family';
    if(active)state.elapsed+=dt;
    const walking=THREE.MathUtils.smoothstep(Math.sin(state.elapsed*(.94+index*.17)+index*2.1),-.65,.1);
    if(active){
      const speed=state.hop===null?walking*(.74+index*.16):.6;
      state.progress=THREE.MathUtils.euclideanModulo(state.progress+state.direction*speed*dt/route.getLength(),1);
      state.step+=speed*dt*15;
    }
    if(state.hop!==null){
      state.hop+=dt;
      if(state.hop>=hopDuration){state.hop=null;state.direction*=-1}
    }
    const point=route.getPointAt(state.progress),tangent=route.getTangentAt(state.progress);
    const [x,y,z]=familyLawnPosition(point.x,point.z);
    const airborne=state.hop!==null;
    const arc=airborne?Math.sin(Math.PI*state.hop!/hopDuration):0;
    const bob=reduced?0:Math.abs(Math.sin(state.step))*.055*walking;
    hen.current.position.set(x,y+arc*.6+bob,z);
    const yaw=Math.atan2(tangent.x*state.direction,tangent.z*state.direction);
    const turn=THREE.MathUtils.euclideanModulo(yaw-hen.current.rotation.y+Math.PI,Math.PI*2)-Math.PI;
    hen.current.rotation.y+=turn*(reduced?1:1-Math.exp(-dt*11));
    if(head.current)head.current.rotation.x=reduced||airborne?0:(1-walking)*Math.max(0,Math.sin(state.elapsed*3.5+index))**4*.8;
    const flap=airborne?arc*(.45+.95*Math.abs(Math.sin(state.hop!*31))):0;
    wings.current?.children.forEach((wing,i)=>{wing.rotation.z=(i===0?-1:1)*flap});
  });
  function startle(){
    const {mode,destination}=useExperience.getState();
    if(mode!=='scene'||destination!=='family'||motion.current.hop!==null)return;
    if(reduced)motion.current.direction*=-1;
    else motion.current.hop=0;
    void playChickenSquawk();
    invalidate();
  }
  const plumage=['#f1e5d4','#ad7254','#d7a677'][index];
  return <group ref={hen} name={`Garden hen ${index+1}`} onClick={event=>{event.stopPropagation();startle()}}>
    <mesh position={[0,.34,0]}><sphereGeometry args={[.48,8,6]}/><meshBasicMaterial visible={false}/></mesh>
    <mesh position={[0,.33,0]} scale={[.20,.23,.35]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color={plumage}/></mesh>
    <mesh position={[0,.46,-.29]} rotation={[-.55,0,0]} scale={[.105,.17,.15]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color={plumage}/></mesh>
    <group ref={wings}>
      {[-1,1].map(side=><group key={side} position={[side*.15,.38,.02]}>
        <mesh position={[side*.105,-.025,-.045]} scale={[.13,.075,.2]}><sphereGeometry args={[1,9,6]}/>
          <meshStandardMaterial color={plumage}/>
        </mesh>
      </group>)}
    </group>
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
