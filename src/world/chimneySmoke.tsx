import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {CanvasTexture,MathUtils,type Group,type Sprite} from 'three';
import type {Vec3} from './layout';
import {useReducedMotion} from './motion';

const puffs=8;

export function ChimneySmoke({position}:{position:Vec3}){
  const plume=useRef<Group>(null);
  const reduced=useReducedMotion();
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=64;
    const ctx=canvas.getContext('2d')!;
    for(const [x,y,r] of [[25,32,22],[38,29,24],[34,39,20]]){
      const gradient=ctx.createRadialGradient(x,y,0,x,y,r);
      gradient.addColorStop(0,'rgba(255,255,255,.85)');
      gradient.addColorStop(.52,'rgba(255,255,255,.42)');
      gradient.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=gradient;
      ctx.fillRect(0,0,64,64);
    }
    return new CanvasTexture(canvas);
  },[]);
  useEffect(()=>()=>texture.dispose(),[texture]);

  useFrame(({clock})=>{
    const time=reduced?0:clock.elapsedTime;
    plume.current?.children.forEach((child,index)=>{
      const puff=child as Sprite;
      const age=(time*.22+(index+.45)/puffs)%1;
      const size=.42+age*2.6;
      puff.position.set(-2.7*age**1.35,.13+age*3.9,Math.sin(age*7+index)*age*.5);
      puff.scale.set(size,size*.82,1);
      puff.material.opacity=.46*MathUtils.smoothstep(age,0,.09)*(1-MathUtils.smoothstep(age,.37,1));
    });
  });

  return <group ref={plume} position={position}>
    {Array.from({length:puffs},(_,index)=><sprite key={index}>
      <spriteMaterial map={texture} color="#ede5d7" transparent opacity={0} depthWrite={false}/>
    </sprite>)}
  </group>;
}
