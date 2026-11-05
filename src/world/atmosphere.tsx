import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {random} from './layout';
import {useReducedMotion} from './motion';

const vertex=`varying vec3 direction;
void main(){direction=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment=`varying vec3 direction;
uniform vec3 high; uniform vec3 horizon; uniform vec3 low; uniform vec3 warmth;
uniform float dusk;
void main(){
  vec3 d=normalize(direction); float h=d.y;
  vec3 col=mix(horizon,high,smoothstep(-.06,.69,h));
  col=mix(col,low,smoothstep(.08,.7,-h));
  float sunlight=pow(max(0.,dot(d,normalize(vec3(-.58,.18,.55)))),6.);
  col=mix(col,warmth,sunlight*.52);
  vec3 evening=mix(vec3(.028,.044,.085),vec3(.22,.115,.15),1.-smoothstep(0.,.62,abs(h+.07)));
  col=mix(col,evening,dusk);
  gl_FragColor=vec4(col,1.);
  #include <colorspace_fragment>
}`;
export const dusk={value:0};
export function Atmosphere(){
  const uniforms=useMemo(()=>({high:{value:new THREE.Color('#8db3bd')},horizon:{value:new THREE.Color('#e5e6d5')},low:{value:new THREE.Color('#a5c6c4')},warmth:{value:new THREE.Color('#fff0c7')},dusk}),[]);
  return <><mesh renderOrder={-10} frustumCulled={false}><sphereGeometry args={[350,26,18]}/><shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} side={THREE.BackSide} depthWrite={false}/></mesh><Clouds/></>;
}
function Clouds(){
  const reduced=useReducedMotion(),group=useRef<THREE.Group>(null);
  const mountain=useRef<THREE.Group>(null);
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
    const ctx=canvas.getContext('2d')!;
    [[65,74,62],[120,54,58],[182,74,61],[148,76,75]].forEach(([x,y,r])=>{
      const g=ctx.createRadialGradient(x,y,5,x,y,r);g.addColorStop(0,'rgba(255,253,245,1)');g.addColorStop(.42,'rgba(247,247,238,.92)');g.addColorStop(.73,'rgba(217,229,229,.54)');g.addColorStop(1,'rgba(211,225,227,0)');ctx.fillStyle=g;ctx.fillRect(0,0,256,128);
    });
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;return tex;
  },[]);
  useFrame(({clock})=>{
    const t=reduced?0:clock.elapsedTime;
    if(group.current)group.current.rotation.y=t*.011;
    const shade=1-dusk.value*.66;
    group.current?.children.forEach(cloud=>{(cloud as THREE.Sprite).material.color.setScalar(shade)});
    mountain.current?.children.forEach((cloud,i)=>{
      const a=2.1+i*1.48+t*(.037+i*.005);
      cloud.position.set(Math.cos(a)*(19+i*2.7),17+i*3.5+Math.sin(a*2)*.65,-4+Math.sin(a)*(17+i*1.6));
      (cloud as THREE.Sprite).material.color.setScalar(shade);
    });
  });
  return <><group ref={group}>{Array.from({length:25},(_,i)=>{
    const a=i*2.399,r=74+random(i+13)*115,s=24+random(i+37)*28;
    return <sprite key={i} position={[Math.cos(a)*r,-12+random(i+3)*43,Math.sin(a)*r]} scale={[s,s*.36,1]}><spriteMaterial map={texture} transparent opacity={.54+random(i+1)*.35} depthWrite={false} fog={false}/></sprite>;
  })}</group><group ref={mountain}>{[0,1,2,3].map(i=><sprite key={i} scale={[19+i*2.2,6.1+i*.55,1]}>
    <spriteMaterial map={texture} transparent opacity={.7-i*.065} depthWrite={false} fog={false}/>
  </sprite>)}</group></>;
}
export function Avatar(){
  const arm=useRef<THREE.Group>(null),reduced=useReducedMotion();
  useFrame(({clock})=>{if(arm.current)arm.current.rotation.z=reduced?-.34:-.35+Math.sin(clock.elapsedTime*2.7)*.28});
  return <group position={[6,3.63,38]} rotation={[0,.55,0]} scale={1.3}>
    <mesh position={[0,1.02,0]} castShadow><capsuleGeometry args={[.34,.85,5,12]}/><meshStandardMaterial color="#b27752"/></mesh>
    <mesh position={[0,1.94,0]} castShadow><sphereGeometry args={[.42,15,10]}/><meshStandardMaterial color="#e5b98e"/></mesh>
    <mesh position={[0,2.12,-.04]} scale={[1,.55,1]} castShadow><sphereGeometry args={[.44,14,10]}/><meshStandardMaterial color="#5a4e41"/></mesh>
    <group position={[-.32,1.44,0]} ref={arm}><mesh position={[-.17,.38,0]} rotation={[0,0,.45]} castShadow><capsuleGeometry args={[.12,.64,4,8]}/><meshStandardMaterial color="#b27752"/></mesh><mesh position={[-.36,.78,0]}><sphereGeometry args={[.13,10,7]}/><meshStandardMaterial color="#e5b98e"/></mesh></group>
  </group>;
}
