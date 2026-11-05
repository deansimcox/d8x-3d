import {useMemo} from 'react';
import * as THREE from 'three';
import {Model} from './models';
import {anchors,terrainY,type Vec3} from './layout';
import {Block,Blocks,Lamp} from './props';
import {useExperience} from '../store';

const buildings:[string,Vec3,number,number,string][]=[
  ['building-skyscraper-a',[-6,0,-5.8],9.5,.16,'#fae9d1'],
  ['building-skyscraper-c',[.3,0,-8],12,-.12,'#e6efdc'],
  ['building-l',[6.6,0,-5.9],7.5,-.25,'#ffe0ca'],
  ['building-f',[-6.6,0,1],5,.2,'#f3edda'],
  ['building-h',[6.8,0,1.2],5.8,-.2,'#f0dfc8'],
  ['building-j',[7.4,0,6],4.1,-.32,'#edf2dc'],
];
const [cityX,cityY,cityZ]=anchors.city;
const angle=-.16;
function ground(x:number,z:number){
  return terrainY(cityX+x*Math.cos(angle)+z*Math.sin(angle),cityZ-x*Math.sin(angle)+z*Math.cos(angle))-cityY;
}
function Street({width,color,offset=0}: {width:number;color:string;offset?:number}){
  const geometry=useMemo(()=>{
    const path=new THREE.CatmullRomCurve3([[0,9],[.6,5],[-.25,1],[-1,-3.4],[1.2,-6],[4,-7.4],[9,-8]].map(([x,z])=>new THREE.Vector3(x,0,z)));
    const vertices:number[]=[],indices:number[]=[];
    for(let i=0;i<=64;i++){
      const p=path.getPoint(i/64),t=path.getTangent(i/64);
      for(const side of [-1,1]){
        const x=p.x+t.z*width*.5*side,z=p.z-t.x*width*.5*side;
        vertices.push(x,ground(x,z)+.11+offset,z);
      }
      if(i){const n=i*2;indices.push(n-2,n-1,n,n,n-1,n+1)}
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    g.setIndex(indices);g.computeVertexNormals();return g;
  },[width,offset]);
  return <mesh geometry={geometry} receiveShadow><meshStandardMaterial color={color} side={THREE.DoubleSide}/></mesh>;
}
function Cafe(){
  const sign=useMemo(()=>{
    const canvas=document.createElement('canvas');
    canvas.width=256;canvas.height=64;
    const ctx=canvas.getContext('2d')!;
    ctx.fillStyle='#30463e';ctx.fillRect(0,0,256,64);
    ctx.fillStyle='#f4d9ad';ctx.font='bold 32px Georgia';ctx.textAlign='center';
    ctx.fillText('COFFEE',128,43);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
  },[]);
  return <group position={[-3.85,ground(-3.85,4.9),4.9]} rotation={[0,.32,0]}>
    <Block position={[0,1.31,0]} size={[3.6,2.63,2.45]} color="#b77658"/>
    <Block position={[0,2.65,0]} size={[3.85,.19,2.68]} color="#3f5c4c"/>
    <Block position={[.55,.93,1.23]} size={[1.8,1.26,.08]} color="#f0bd78" glow={.32}/>
    <Block position={[-1.05,.94,1.24]} size={[.69,1.65,.07]} color="#415e50"/>
    <Blocks items={Array.from({length:8},(_,i)=>({position:[-1.58+i*.45,1.88,1.53],size:[.44,.095,.85],color:i%2?'#e8d9ba':'#b76b51'}))}/>
    <mesh position={[0,2.32,1.235]}><planeGeometry args={[2.65,.55]}/><meshBasicMaterial map={sign}/></mesh>
    <Model name="tableCoffee" position={[.95,.11,2.24]} height={.55}/>
    <Model name="cup-coffee" position={[.95,.68,2.24]} height={.19}/>
    <Model name="bench" position={[-.97,.11,2.29]} height={.59}/>
  </group>;
}
export function City(){
  const active=useExperience(s=>s.mode==='scene'&&s.destination==='city');
  return <group position={anchors.city} rotation={[0,angle,0]}>
    <Street width={3.12} color="#c0af89"/><Street width={2.24} offset={.018} color="#777e73"/>
    {buildings.map(([name,[x,,z],height,rotation,tint],i)=><Model key={name} name={name} position={[x,ground(x,z),z]} height={height} rotation={rotation} tint={tint} onSelect={active?()=>useExperience.getState().openArchive('city',i):undefined}/>)}
    <Cafe/>
    <Lamp position={[-1.7,ground(-1.7,4.5),4.5]} short/><Lamp position={[1.1,ground(1.1,-2),-2]} short/><Lamp position={[4.2,ground(4.2,-6),-6]} short/>
    {[[2,6.4],[3.7,4.2],[-8.4,4.6],[-7.2,6.7],[5,-3]].map(([x,z],i)=><Model key={i} name="Bush_Common_Flowers" position={[x,ground(x,z),z]} height={.64} rotation={i*1.8}/>)}
  </group>;
}
