import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {anchors,onIsland,random,riverPoints,terrainY} from './layout';
import {Model,ModelInstances,type Placement} from './models';
import {Block,Blocks} from './props';
import {useReducedMotion} from './motion';
import {Butterflies} from './butterflies';
import {dusk} from './atmosphere';
import {bridgePosition,bridgeRotation,nearTrail,trailCurve,trailSegments,trailWidth} from './trail';

const fullStream=new THREE.CatmullRomCurve3(riverPoints.map(([x,z])=>new THREE.Vector3(x,3.63,z)));
const riverLip=fullStream.getPoints(180).findIndex(p=>!onIsland(p.x,p.z,1));
const stream=new THREE.CatmullRomCurve3(fullStream.getPoints(180).slice(0,riverLip<0?undefined:riverLip+1).filter((_,i)=>i%4===0||i===riverLip));
const mountainPoolT=.16;
const mountainPool=stream.getPoint(mountainPoolT);
const rugWidth=4.5,rugDepth=3.7;
const rugRadius=Math.hypot(rugWidth/2,rugDepth/2);
const picnicX=anchors.nature[0]-.2,picnicZ=anchors.nature[2]-.85;
function ribbon(curve:THREE.Curve<THREE.Vector3>,segments:number,width:(t:number)=>number,fallAcross?:THREE.Vector3) {
  const positions=[],indices=[],uv=[];
  for(let i=0;i<=segments;i++) {
    const t=i/segments,p=curve.getPoint(t),v=curve.getTangent(t),w=width(t);
    const side=fallAcross?.clone()??new THREE.Vector3(-v.z,0,v.x);
    side.normalize().multiplyScalar(w);
    positions.push(...p.clone().add(side).toArray(),...p.clone().sub(side).toArray());
    uv.push(0,t,1,t);
    if(i<segments)indices.push(i*2,i*2+2,i*2+1,i*2+1,i*2+2,i*2+3);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function Waterside() {
  const reduced=useReducedMotion();
  const flow=useRef<THREE.InstancedMesh>(null);
  const spray=useRef<THREE.InstancedMesh>(null);
  const foam=useRef<THREE.InstancedMesh>(null);
  const waterMaterial=useMemo(()=>new THREE.MeshBasicMaterial({color:'#559e99',side:THREE.DoubleSide}),[]);
  const daylight=useMemo(()=>new THREE.Color('#559e99'),[]);
  const evening=useMemo(()=>new THREE.Color('#386c73'),[]);
  const {water,shore,falls,stones,fall,spill,across,mountainAcross}=useMemo(()=>{
    const width=(t:number)=>{
      const impact=(t-mountainPoolT)/.035;
      return 1.35+.32*Math.sin(t*11)+t*.33+.43*Math.exp(-impact*impact);
    };
    const fall=new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.1,17,-15.4),
      new THREE.Vector3(-5.6,14,-17.1),
      new THREE.Vector3(-9.8,8.3,-19.8),
      new THREE.Vector3(-10.9,5.7,-20.6),
      // Pass through the pool surface so the fall and stream overlap at the join.
      mountainPool.clone().setY(mountainPool.y-.25),
    ]);
    const lip=stream.getPoint(1);
    const out=stream.getTangent(1),across=new THREE.Vector3(-out.z,0,out.x);
    const drop=(distance:number,y:number)=>lip.clone().addScaledVector(out,distance).setY(y);
    const spill=new THREE.CatmullRomCurve3([lip,drop(1.4,3.15),drop(2.7,-.7),drop(4.1,-12),drop(5.7,-35),drop(7.3,-45)]);
    const rocks=Array.from({length:27},(_,i):Placement=>{
      const t=.08+i*.03,p=stream.getPoint(t),v=stream.getTangent(t),offset=(i%2?-1:1)*(width(t)+.3);
      return {position:[p.x-v.z*offset,3.55,p.z+v.x*offset],height:.35+random(i+95)*.75,rotation:random(i+11)*6.28};
    }).filter(({position:[x,,z],height})=>
      !nearTrail(x,z,height)&&Math.hypot(x-picnicX,z-picnicZ)>rugRadius+height*1.5);
    const mountainAcross=new THREE.Vector3(.6,0,-.8);
    return {water:ribbon(stream,128,width),shore:ribbon(stream,128,t=>width(t)+.35),falls:[ribbon(fall,34,t=>.73+t*.52,mountainAcross),ribbon(spill,46,t=>width(1)*(1-.32*t),across)],stones:rocks,fall,spill,across,mountainAcross};
  },[]);
  const transform=useMemo(()=>new THREE.Object3D(),[]);
  const tangent=useMemo(()=>new THREE.Vector3(),[]);
  const vertical=useMemo(()=>new THREE.Vector3(0,1,0),[]);
  useFrame(({clock})=>{
    waterMaterial.color.copy(daylight).lerp(evening,dusk.value);
    if(!flow.current)return;
    const time=reduced?0:clock.elapsedTime;
    for(let i=0;i<32;i++){
      const t=.045+((i/32+time*.023)%1)*.855,p=stream.getPoint(t),v=stream.getTangent(t);
      const w=(random(i+5)-.5)*2.0;transform.position.set(p.x-v.z*w,3.68,p.z+v.x*w);
      transform.rotation.set(0,-Math.atan2(v.z,v.x),0);transform.scale.set(.4+random(i+33)*1.2,1,1);
      transform.updateMatrix();flow.current.setMatrixAt(i,transform.matrix);
    }
    flow.current.instanceMatrix.needsUpdate=true;
    if(spray.current){
      for(let i=0;i<60;i++){
        const upper=i<30,curve=upper?fall:spill;
        const phase=(i/30+time*(.42+random(i+4)*.13))%1;
        const t=.03+.94*phase**1.32;
        curve.getPoint(t,transform.position);
        curve.getTangent(t,tangent);
        transform.position.addScaledVector(upper?mountainAcross:across,(random(i+36)-.5)*(1.32+t*.46));
        transform.position.x-=upper?.14:.18;
        if(upper)transform.position.z-=.12;
        transform.quaternion.setFromUnitVectors(vertical,tangent);
        transform.scale.set(.035+random(i)*.065,.18+t*(upper?.49:.92),.045);
        transform.updateMatrix();spray.current.setMatrixAt(i,transform.matrix);
      }
      spray.current.instanceMatrix.needsUpdate=true;
    }
    if(foam.current){
      for(let i=0;i<25;i++){
        const phase=(i/25+time*(.66+random(i+90)*.26))%1;
        const angle=i*2.39996;
        const radius=.17+phase*(.48+random(i+82)*.43);
        const size=(.09+random(i+10)*.11)*Math.sin(Math.PI*phase);
        transform.position.set(mountainPool.x+Math.cos(angle)*radius,3.665+.19*Math.sin(Math.PI*phase)*random(i+25),mountainPool.z+Math.sin(angle)*radius);
        transform.rotation.set(-Math.PI/2,0,angle);
        transform.scale.set(size*1.35,size,1);
        transform.updateMatrix();foam.current.setMatrixAt(i,transform.matrix);
      }
      foam.current.instanceMatrix.needsUpdate=true;
    }
  });
  return <group>
    <mesh geometry={shore} position={[0,-.033,0]} receiveShadow><meshStandardMaterial color="#b9a584" side={THREE.DoubleSide}/></mesh>
    <mesh geometry={water} material={waterMaterial}/>
    {falls.map((geometry,i)=><mesh key={i} geometry={geometry} material={waterMaterial}/>)}
    <mesh position={[mountainPool.x,3.651,mountainPool.z]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[.63,.74,24]}/><meshBasicMaterial color="#d2e9d8" transparent opacity={.58}/>
    </mesh>
    <instancedMesh ref={spray} args={[undefined,undefined,60]} frustumCulled={false}><boxGeometry/><meshBasicMaterial color="#e2f7e9" transparent opacity={.66} depthWrite={false}/></instancedMesh>
    <instancedMesh ref={foam} args={[undefined,undefined,25]} frustumCulled={false}><circleGeometry args={[1,7]}/><meshBasicMaterial color="#effbf2" transparent opacity={.85} depthWrite={false}/></instancedMesh>
    <instancedMesh ref={flow} args={[undefined,undefined,32]} frustumCulled={false}><boxGeometry args={[1,.012,.027]}/><meshBasicMaterial color="#bbdfce" transparent opacity={.52}/></instancedMesh>
    <ModelInstances name="Rock_Medium_2" placements={stones}/>
    <Bridge/>
  </group>;
}
function Bridge() {
  return <group position={bridgePosition} rotation={[0,bridgeRotation,0]}>
    <Blocks items={Array.from({length:15},(_,i)=>({position:[0,.13+.56*Math.sin(i/14*Math.PI),(i-7)*.36],size:[2.35,.14,.34],color:i%3?'#a5805b':'#b39169'}))}/>
    {[-1,1].map(side=><group key={side} position={[side*1.08,0,0]}>
      {[-2.35,0,2.35].map((z,i)=><Block key={z} position={[0,i===1?1.04:.68,z]} size={[.15,1.2,.15]} color="#86634a"/>)}
      {[-1,1].map(s=><mesh key={s} position={[0,1.45,s*1.18]} rotation={[s*.17,0,0]} castShadow><boxGeometry args={[.15,.13,2.5]}/><meshStandardMaterial color="#937355"/></mesh>)}
    </group>)}
  </group>;
}
export function Trails(){
  const geometry=useMemo(()=>{
    const g=ribbon(trailCurve,trailSegments,trailWidth);
    const p=g.attributes.position;
    for(let i=0;i<p.count;i++)p.setY(i,terrainY(p.getX(i),p.getZ(i))+.04);
    g.computeVertexNormals();return g;
  },[]);
  return <mesh geometry={geometry} receiveShadow><meshStandardMaterial color="#c4ad81" side={THREE.DoubleSide}/></mesh>;
}
function Basket(){
  const weave=useMemo(()=>{
    const pieces:THREE.BufferGeometry[]=[];
    for(let i=0;i<15;i++){
      const t=i/14,g=new THREE.TorusGeometry(.69+t*.12,.031,4,32);
      g.rotateX(-Math.PI/2);g.scale(1,1,.69);g.translate(0,.12+t*.66,0);pieces.push(g);
    }
    for(let i=0;i<36;i++){
      const a=i*Math.PI/18,p0=new THREE.Vector3(Math.cos(a)*.69,.12,Math.sin(a)*.48),p1=new THREE.Vector3(Math.cos(a)*.82,.81,Math.sin(a)*.566);
      const g=new THREE.TubeGeometry(new THREE.LineCurve3(p0,p1),1,.027,4,false);pieces.push(g);
    }
    const joined=mergeGeometries(pieces);pieces.forEach(g=>g.dispose());return joined;
  },[]);
  return <group>
    <mesh position={[0,.44,0]} scale={[1,1,.69]} castShadow><cylinderGeometry args={[.8,.66,.72,28]}/><meshStandardMaterial color="#95613c" roughness={.96}/></mesh>
    <mesh geometry={weave} castShadow receiveShadow><meshStandardMaterial color="#c39255" roughness={.96}/></mesh>
    <mesh position={[0,.81,0]} scale={[1,1,.69]} castShadow><cylinderGeometry args={[.81,.8,.07,28]}/><meshStandardMaterial color="#dfbf8d" roughness={.96}/></mesh>
    <mesh position={[0,.79,0]} castShadow><torusGeometry args={[.67,.055,8,24,Math.PI]}/><meshStandardMaterial color="#a5713c" roughness={.92}/></mesh>
  </group>;
}
export function Picnic(){return <group position={[picnicX,terrainY(picnicX,picnicZ)-.05,picnicZ]} rotation={[0,-.55,0]}>
  <Butterflies/>
  <Block position={[0,.07,0]} size={[rugWidth,.04,rugDepth]} color="#aa6754"/>
  <Blocks castShadow={false} items={Array.from({length:16},(_,i)=>i<9?{position:[-2+i*.5,.102,0],size:[.065,.016,3.68],color:'#e4b98e'}:{position:[0,.106,-1.5+(i-9)*.5],size:[4.47,.014,.067],color:'#e4b98e'})}/>
  <group position={[-.68,.12,-.29]} rotation={[0,.24,0]}><Basket/></group>
  <Model name="plate" position={[1,.12,.41]} width={1.08}/>
  <Model name="croissant" position={[1.06,.19,.42]} width={.74} rotation={.61}/>
  <Model name="apple" position={[1.47,.12,-.76]} height={.39}/>
  <Model name="cup-tea" position={[-.14,.12,1.11]} height={.36}/>
  <Model name="loaf-baguette" position={[-1.51,.12,.95]} width={.76} rotation={-.76}/>
  <Model name="Fern_1" position={[3.4,0,-1.8]} height={.88}/><Model name="Flower_4_Group" position={[-3.2,0,-1.75]} height={.55}/>
  <Model name="Flower_3_Group" position={[2.9,0,1.9]} height={.59}/>
</group>}
