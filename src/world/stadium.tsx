import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {anchors,random,type Vec3} from './layout';
import {Block,Blocks} from './props';
import {useReducedMotion} from './motion';
import {dusk} from './atmosphere';
import {useExperience} from '../store';

const chalk='#f3ecd1',forest='#416d50';
function Crowd(){
  const torsos=useRef<THREE.InstancedMesh>(null),heads=useRef<THREE.InstancedMesh>(null);
  const reduced=useReducedMotion();
  const transform=useMemo(()=>new THREE.Object3D(),[]);
  const supporters=useMemo(()=>[-1,1].flatMap(side=>Array.from({length:104},(_,i)=>{
    const row=Math.floor(i/26);
    const x=(i%26-12.5)*.64+(random(i+side*36)-.5)*.17;
    const y=.81+row*.59;
    const z=side*(5.94+row*.76);
    const color=(side<0?['#633c94','#e88945']:['#232532','#f2ece3'])[i%4===0?1:0];
    return {x,y,z,color};
  })).concat([-1,1].flatMap(side=>Array.from({length:39},(_,i)=>{
    const row=Math.floor(i/13);
    const z=(i%13-6)*.64+(random(i+side*67)-.5)*.14;
    const shirts=side<0?['#232532','#f2ece3']:['#633c94','#e88945'];
    return {x:side*(9.77+row*.74),y:.73+row*.50,z,color:shirts[i%4===0?1:0]};
  }))),[]);
  const pose=(mesh:THREE.InstancedMesh,i:number,head:boolean,bob:number,lean:number)=>{
    const {x,y,z}=supporters[i];
    transform.position.set(x+lean*(head?.09:.035),y+(head?.49:.20)+bob,z);
    transform.rotation.set(0,0,lean*.19);
    transform.scale.set(1,1,1);
    transform.updateMatrix();
    mesh.setMatrixAt(i,transform.matrix);
  };
  const initialize=(mesh:THREE.InstancedMesh,head:boolean)=>{
    const color=new THREE.Color();
    supporters.forEach((supporter,i)=>{
      pose(mesh,i,head,0,0);
      mesh.setColorAt(i,color.set(head?['#bc8e71','#e5b28c','#826051','#d3a78f'][i%4]:supporter.color));
    });
    mesh.instanceMatrix.needsUpdate=true;
    mesh.computeBoundingSphere();
  };
  const animated=useRef(false);
  useFrame(({clock})=>{
    if(!torsos.current||!heads.current)return;
    const state=useExperience.getState();
    const active=!reduced&&(state.mode==='transitioning'?state.target:state.destination)==='stadium';
    if(!active&&!animated.current)return;
    for(let i=0;i<supporters.length;i+=3){
      const phase=clock.elapsedTime*(2.7+random(i)*1.4)+i*.49;
      const bob=active?Math.max(0,Math.sin(phase))**3*.14:0;
      const lean=active?Math.sin(phase*.67)*.43:0;
      pose(torsos.current,i,false,bob,lean);pose(heads.current,i,true,bob,lean);
    }
    torsos.current.instanceMatrix.needsUpdate=true;heads.current.instanceMatrix.needsUpdate=true;
    animated.current=active;
  });
  return <>
    <instancedMesh ref={torsos} args={[undefined,undefined,supporters.length]} onUpdate={mesh=>initialize(mesh,false)}><capsuleGeometry args={[.155,.16,3,8]}/><meshStandardMaterial roughness={1}/></instancedMesh>
    <instancedMesh ref={heads} args={[undefined,undefined,supporters.length]} onUpdate={mesh=>initialize(mesh,true)}><sphereGeometry args={[.12,8,6]}/><meshStandardMaterial roughness={1}/></instancedMesh>
  </>;
}
function Floodlight({x,z}:{x:number;z:number}){
  const lamp=useRef<THREE.SpotLight>(null);
  const target=useMemo(()=>{const node=new THREE.Object3D();node.position.set(-x*.83,.3,-z*.91);return node},[x,z]);
  useFrame(()=>{if(lamp.current)lamp.current.intensity=dusk.value*310});
  return <><primitive object={target}/><spotLight ref={lamp} position={[0,6.55,0]} target={target} angle={.56} penumbra={.57} color="#ffe9c9" distance={25} intensity={0}/></>;
}
function Scoreboard(){
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=384;canvas.height=144;
    const ctx=canvas.getContext('2d')!;ctx.fillStyle='#2d4a3b';ctx.fillRect(0,0,384,144);
    ctx.strokeStyle='#b49d68';ctx.lineWidth=3;ctx.strokeRect(9,9,366,126);
    ctx.textAlign='center';ctx.fillStyle='#f3d893';ctx.font='bold 19px monospace';ctx.fillText('HOME',89,39);ctx.fillText('AWAY',295,39);
    ctx.font='bold 66px monospace';ctx.fillText('3 : 2',192,105);
    ctx.font='15px monospace';ctx.fillText("78′",192,127);
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
    for(let i=0;i<=18;i++) {const z=(i-9)*.154;lines.push(0,1.7,z,1.15,.02,z)}
    for(let j=1;j<=12;j++){
      const t=j/12,x=t*1.15,y=(1-t)*1.7;
      lines.push(x,y,-1.386,x,y,1.386);
      for(const z of [-1.386,1.386])lines.push(0,y,z,x,y,z,x,0,z,x,y,z);
    }
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
    <Block position={[0,.06,0]} size={[24.5,.46,18.3]} color="#ad9c7d"/>
    <Blocks castShadow={false} items={Array.from({length:8},(_,i)=>({position:[(i-3.5)*2.08,.265,0],size:[2.08,.065,10.3],color:i%2?'#698653':'#78935c'}))}/>
    {[-1,1].map(s=><group key={s}>
      <Block position={[0,.313,s*5]} size={[16.4,.024,.056]} color={chalk}/>
      <Block position={[s*8.17,.313,0]} size={[.056,.024,10.03]} color={chalk}/>
      <Block position={[s*5.9,.316,0]} size={[.056,.024,6.15]} color={chalk}/>
      {[-1,1].map(z=><Block key={z} position={[s*7.03,.316,z*3.05]} size={[2.3,.024,.056]} color={chalk}/>)}
      <Goals side={s}/>
      <Blocks items={Array.from({length:3},(_,row)=>{
        const x=s*(9.77+row*.74);
        return [
          {position:[x,.38+row*.25,0] as Vec3,size:[.75,.42+row*.50,9.85] as Vec3,color:'#bba07d'},
          {position:[x,.66+row*.50,0] as Vec3,size:[.39,.13,9.25] as Vec3,color:row%2?'#677e67':'#879674'},
        ];
      }).flat()}/>
      <Block position={[s*11.52,1.86,0]} size={[.23,.22,10.1]} color={forest}/>
      <Blocks items={Array.from({length:7},(_,i)=>({
        position:[s*11.52,1.61,(i-3)*1.63],size:[.11,.62,.11],color:'#8a735d',
      }))}/>
      <Blocks items={Array.from({length:4},(_,i)=>{
        const z=s*(5.95+i*.76);
        return [{position:[0,.45+i*.29,z] as Vec3,size:[18.9,.45+i*.58,.73] as Vec3,color:i%2?'#b49b77':'#bfa784'},
          {position:[0,.74+i*.59,z] as Vec3,size:[18.2,.14,.38] as Vec3,color:i%2?'#667e63':'#84916e'}];
      }).flat()}/>
      <Block position={[0,3.24,s*8.72]} size={[19.4,.23,.24]} color={forest}/>
      <Blocks items={[
        ...[-9.34,9.34].flatMap(x=>Array.from({length:7},(_,i)=>({position:[x,.37+i*.33,s*(5.45+i*.47)] as Vec3,size:[1.15,.24,.49] as Vec3,color:i%2?'#b6aa96':'#c0b29d'}))),
        ...Array.from({length:11},(_,i)=>({position:[(i-5)*1.77,2.85,s*8.71] as Vec3,size:[.08,.77,.08] as Vec3,color:'#927960'})),
      ]}/>
    </group>)}
    <Block position={[0,.314,0]} size={[.055,.024,10]} color={chalk}/>
    <mesh position={[0,.331,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[1.39,1.45,44]}/><meshBasicMaterial color={chalk}/></mesh>
    <mesh position={[0,.335,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.08,12]}/><meshBasicMaterial color={chalk}/></mesh>
    {[-1,1].flatMap(side=>[-1,1].map(end=><group key={side+'/'+end} position={[end*8.12,.32,side*4.96]}>
      <Block position={[0,.34,0]} size={[.037,.7,.037]} color={chalk}/>
      <mesh position={[.15,.61,0]}><planeGeometry args={[.28,.19]}/><meshStandardMaterial color="#dc8c4e" side={THREE.DoubleSide}/></mesh>
    </group>))}
    <mesh position={[.52,.47,-.68]}><icosahedronGeometry args={[.14,1]}/><meshStandardMaterial color="#f3ebd9" roughness={.85}/></mesh>
    <Crowd/>
    {[-10.2,10.2].flatMap(x=>[-7.95,7.95].map(z=><group key={`${x}/${z}`} position={[x,0,z]}>
      <Block position={[0,3.25,0]} size={[.19,6.5,.19]} color="#506457"/>
      <Block position={[0,6.6,0]} size={[1.35,.65,.32]} color="#57665b"/>
      {[-.42,0,.42].map(dx=><Block key={dx} position={[dx,6.61,z>0?-.18:.18]} size={[.31,.42,.062]} color="#ffe6b6" glow={.85}/>)}
      <Floodlight x={x} z={z}/>
    </group>))}
    <Scoreboard/>
    <Block position={[0,3.47,-8.75]} size={[19.6,.18,.46]} color="#937154"/>
    <Block position={[0,3.47,8.75]} size={[19.6,.18,.46]} color="#937154"/>
    <group ref={flags}>{Array.from({length:7},(_,i)=><group key={i} position={[(i-3)*2.6,3.1,-8.5]}>
      <Block position={[0,.66,0]} size={[.06,1.3,.06]} color={chalk}/>
      <mesh position={[.38,1.07,0]}><planeGeometry args={[.76,.43]}/><meshStandardMaterial color={i%2?'#e88945':'#7047a3'} side={THREE.DoubleSide}/></mesh>
    </group>)}</group>
  </group>;
}
