import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {useReducedMotion} from './motion';
import {useExperience} from '../store';

const source=[
  ['// the world between the lines','#91a999'],
  ['export function buildIsland() {','#c8adf1'],
  ['  const terrain = sculpt(seed);','#e3dfbf'],
  ['  const sky = paint("golden hour");','#e3dfbf'],
  ['  return { terrain, sky };','#8fd8be'],
  ['}','#c8adf1'],
] as const;

export function CodeDisplay({onSelect}:{onSelect?:()=>void}){
  const reduced=useReducedMotion();
  const previous=useRef(-1);
  const {canvas,texture}=useMemo(()=>{
    const canvas=document.createElement('canvas');
    canvas.width=512;canvas.height=240;
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    return {canvas,texture};
  },[]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  useFrame(({clock})=>{
    const state=useExperience.getState();
    const inOffice=state.destination==='office'||state.target==='office';
    const step=reduced||!inOffice?108:Math.floor(clock.elapsedTime*10)%137;
    if(step===previous.current)return;
    previous.current=step;
    const ctx=canvas.getContext('2d')!;
    ctx.fillStyle='#192b32';ctx.fillRect(0,0,512,240);
    ctx.fillStyle='#28434b';ctx.fillRect(0,0,512,33);
    ctx.font='16px monospace';ctx.fillStyle='#b0c8be';ctx.fillText('island.ts',18,22);
    let remaining=Math.min(108,step)*2;
    source.forEach(([line,color],i)=>{
      ctx.fillStyle='#637f84';ctx.fillText(String(i+1),15,59+i*25);
      ctx.fillStyle=color;ctx.fillText(line.slice(0,remaining),42,59+i*25);
      remaining=Math.max(0,remaining-line.length);
    });
    ctx.fillStyle='#28434b';ctx.fillRect(0,213,512,27);
    ctx.fillStyle='#91d4ae';ctx.fillText(step>=108?'build complete   ✓':'compiling island…',18,232);
    texture.needsUpdate=true;
  });
  return <mesh position={[1,2.62,-1.071]} onClick={onSelect?event=>{event.stopPropagation();onSelect()}:undefined}>
    <planeGeometry args={[1.04,.49]}/><meshBasicMaterial map={texture}/>
  </mesh>;
}
