import type {Vec3} from './layout';
import * as THREE from 'three';

type BlockSpec={position:Vec3;size:Vec3;color:string;rotation?:number};
export function Block({position, size, color, rotation=0, glow=0}: BlockSpec&{glow?:number}) {
  return <mesh position={position} rotation={[0,rotation,0]} castShadow={!glow} receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.88} emissive={glow?color:'#000000'} emissiveIntensity={glow}/></mesh>;
}
export function Blocks({items,castShadow=true}: {items:BlockSpec[];castShadow?:boolean}){
  return <instancedMesh args={[undefined,undefined,items.length]} castShadow={castShadow} receiveShadow onUpdate={mesh=>{
    const transform=new THREE.Object3D(),color=new THREE.Color();
    items.forEach((item,i)=>{
      transform.position.set(...item.position);transform.scale.set(...item.size);transform.rotation.y=item.rotation??0;transform.updateMatrix();
      mesh.setMatrixAt(i,transform.matrix);mesh.setColorAt(i,color.set(item.color));
    });
    mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();
  }}><boxGeometry/><meshStandardMaterial roughness={.88}/></instancedMesh>;
}
export function Lamp({position,short=false}: {position:Vec3;short?:boolean}){
  const h=short?1.15:2.8;
  return <group position={position}>
    <Block position={[0,h*.5,0]} size={[.12,h,.12]} color="#465550"/>
    <Block position={[0,h-.17,0]} size={[.34,.34,.34]} color="#ffcf83" glow={.8}/>
    <Block position={[0,h+.04,0]} size={[.45,.14,.45]} color="#465550"/>
  </group>;
}
