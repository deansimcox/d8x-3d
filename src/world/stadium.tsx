import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {anchors,type Vec3} from './layout';
import {Block,Blocks} from './props';
import {useReducedMotion} from './motion';

const chalk='#f3ecd1',forest='#416d50';
function Scoreboard(){
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=384;canvas.height=144;
    const ctx=canvas.getContext('2d')!;ctx.fillStyle='#2d4a3b';ctx.fillRect(0,0,384,144);
    ctx.strokeStyle='#b49d68';ctx.lineWidth=3;ctx.strokeRect(9,9,366,126);
    ctx.textAlign='center';ctx.fillStyle='#f3d893';ctx.font='bold 19px monospace';ctx.fillText('HOME',89,39);ctx.fillText('AWAY',295,39);
    ctx.font='bold 66px monospace';ctx.fillText('0 : 0',192,105);
    const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;return t;
  },[]);
  return <group position={[0,3.9,-8.48]}>
    <Block position={[0,0,0]} size={[4.15,1.68,.3]} color="#3a5142"/>
    <mesh position={[0,0,.16]}><planeGeometry args={[3.88,1.46]}/><meshBasicMaterial map={texture}/></mesh>
  </group>;
}
function Goals({side}: {side:number}) {
  const net=useMemo(()=>{
    const lines=[];
    for(let i=0;i<=12;i++) {const z=(i-6)*.23;lines.push(0,1.7,z,1.15,.02,z)}
    for(let j=1;j<=6;j++){const t=j/6;lines.push(t*1.15,(1-t)*1.7,-1.38,t*1.15,(1-t)*1.7,1.38)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));return g;
  },[]);
  return <group position={[side*8.1,.29,0]} rotation={[0,side===1?0:Math.PI,0]}>
    {[-1.4,1.4].map(z=><Block key={z} position={[0,.85,z]} size={[.1,1.7,.1]} color={chalk}/>)}
    <Block position={[0,1.72,0]} size={[.1,.1,2.9]} color={chalk}/>
    <lineSegments geometry={net}><lineBasicMaterial color="#e9ead5" transparent opacity={.82}/></lineSegments>
  </group>;
}
export function Stadium(){
  const flags=useRef<THREE.Group>(null),reduced=useReducedMotion();
  useFrame(({clock})=>{if(!reduced)flags.current?.children.forEach((flag,i)=>flag.rotation.y=.28*Math.sin(clock.elapsedTime*1.5+i))});
  return <group position={anchors.stadium} rotation={[0,.12,0]}>
    <Block position={[0,.06,0]} size={[22.4,.46,17.9]} color="#ad9c7d"/>
    <Blocks castShadow={false} items={Array.from({length:8},(_,i)=>({position:[(i-3.5)*2.08,.265,0],size:[2.08,.065,10.3],color:i%2?'#698653':'#78935c'}))}/>
    {[-1,1].map(s=><group key={s}>
      <Block position={[0,.313,s*5]} size={[16.4,.024,.056]} color={chalk}/>
      <Block position={[s*8.17,.313,0]} size={[.056,.024,10.03]} color={chalk}/>
      <Block position={[s*5.9,.316,0]} size={[.056,.024,6.15]} color={chalk}/>
      {[-1,1].map(z=><Block key={z} position={[s*7.03,.316,z*3.05]} size={[2.3,.024,.056]} color={chalk}/>)}
      <Goals side={s}/>
      <Blocks items={Array.from({length:4},(_,i)=>{
        const z=s*(5.95+i*.76);
        return [{position:[0,.45+i*.29,z] as Vec3,size:[18.9,.45+i*.58,.73] as Vec3,color:i%2?'#b49b77':'#bfa784'},
          {position:[0,.74+i*.59,z] as Vec3,size:[18.2,.14,.38] as Vec3,color:i%2?'#667e63':'#84916e'}];
      }).flat()}/>
      <Block position={[0,3.24,s*8.72]} size={[19.4,.23,.24]} color={forest}/>
    </group>)}
    <Block position={[0,.314,0]} size={[.055,.024,10]} color={chalk}/>
    <mesh position={[0,.331,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[1.39,1.45,44]}/><meshBasicMaterial color={chalk}/></mesh>
    <mesh position={[0,.335,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.08,12]}/><meshBasicMaterial color={chalk}/></mesh>
    {[-10.2,10.2].flatMap(x=>[-7.95,7.95].map(z=><group key={`${x}/${z}`} position={[x,0,z]}>
      <Block position={[0,3.25,0]} size={[.19,6.5,.19]} color="#545f55"/>
      <Block position={[0,6.6,0]} size={[1.35,.65,.32]} color="#57665b"/>
      {[-.42,0,.42].map(dx=><Block key={dx} position={[dx,6.61,z>0?-.18:.18]} size={[.31,.42,.062]} color="#ffe6b6" glow={.85}/>)}
    </group>))}
    <Scoreboard/>
    <group ref={flags}>{Array.from({length:7},(_,i)=><group key={i} position={[(i-3)*2.6,3.1,-8.5]}>
      <Block position={[0,.66,0]} size={[.06,1.3,.06]} color={chalk}/>
      <mesh position={[.38,1.07,0]}><planeGeometry args={[.76,.43]}/><meshStandardMaterial color={i%2?'#b57855':'#e2c58e'} side={THREE.DoubleSide}/></mesh>
    </group>)}</group>
  </group>;
}
