import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {anchors,random} from './layout';
import {Block} from './props';
import {Model} from './models';
import {useReducedMotion} from './motion';
import {dusk} from './atmosphere';
import {useExperience} from '../store';

const stadiumScale=.114;
const supporterRows=[
  {distance:45.4,height:1.7},{distance:49.4,height:3.32},
  {distance:53.4,height:5.15},{distance:57.4,height:7.18},
  {distance:68.6,height:18.03},{distance:73.4,height:21.17},
  {distance:78.2,height:24.59},
];

function Crowd(){
  const torsos=useRef<THREE.InstancedMesh>(null),heads=useRef<THREE.InstancedMesh>(null);
  const reduced=useReducedMotion();
  const transform=useMemo(()=>new THREE.Object3D(),[]);
  const supporters=useMemo(()=>[0,1,2,3].flatMap(stand=>supporterRows.flatMap(({distance,height},row)=>{
    const alongTouchline=stand<2,side=stand%2===0?-1:1,count=alongTouchline?27:17;
    const shirts=side<0?['#633c94','#e88945']:['#232532','#f2ece3'];
    return Array.from({length:count},(_,i)=>{
      const spacing=alongTouchline?.44:.47;
      const along=(i-(count-1)/2)*spacing+(random(i+row*73+stand*110)-.5)*.24;
      const outward=side*(distance+(alongTouchline?0:20))*stadiumScale;
      const color=shirts[random(i+row*13+stand*49)>.68?1:0];
      return {x:alongTouchline?along:outward,y:.16+height*stadiumScale,z:alongTouchline?outward:along,color};
    });
  })),[]);
  const pose=(mesh:THREE.InstancedMesh,i:number,head:boolean,bob:number,lean:number)=>{
    const {x,y,z}=supporters[i];
    transform.position.set(x+lean*(head?.09:.035),y+(head?.34:.145)+bob,z);
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
    <instancedMesh ref={torsos} args={[undefined,undefined,supporters.length]} onUpdate={mesh=>initialize(mesh,false)}><capsuleGeometry args={[.105,.13,2,6]}/><meshStandardMaterial roughness={1}/></instancedMesh>
    <instancedMesh ref={heads} args={[undefined,undefined,supporters.length]} onUpdate={mesh=>initialize(mesh,true)}><sphereGeometry args={[.09,7,5]}/><meshStandardMaterial roughness={1}/></instancedMesh>
  </>;
}
function Floodlight({x,z}:{x:number;z:number}){
  const lamp=useRef<THREE.SpotLight>(null);
  const target=useMemo(()=>{const node=new THREE.Object3D();node.position.set(-x*.64,.05,-z*.64);return node},[x,z]);
  useFrame(()=>{if(lamp.current)lamp.current.intensity=dusk.value*140});
  return <><primitive object={target}/><spotLight ref={lamp} position={[0,4.18,0]} target={target} angle={.67} penumbra={.57} color="#ffe9c9" distance={25} intensity={0}/></>;
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
  return <group position={[2.8,1.87,-6.10]}>
    <Block position={[0,0,0]} size={[3.0,1.18,.14]} color="#3a5142"/>
    <mesh position={[0,0,.075]}><planeGeometry args={[2.8,1.03]}/><meshBasicMaterial map={texture}/></mesh>
  </group>;
}
export function Stadium(){
  return <group position={anchors.stadium} rotation={[0,.12,0]}>
    <Model name="footballStadium" position={[0,.06,0]} scale={stadiumScale}/>
    <Crowd/>
    {[-6.2,6.2].flatMap(x=>[-4.6,4.6].map(z=><group key={`${x}/${z}`} position={[x,0,z]}>
      <Floodlight x={x} z={z}/>
    </group>))}
    <Scoreboard/>
  </group>;
}
