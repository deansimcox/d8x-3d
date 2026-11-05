import {useMemo} from 'react';
import {useGLTF} from '@react-three/drei';
import * as THREE from 'three';
import type {Vec3} from './layout';
import {windMaterial} from './wind';

const url=(name:string)=>`${import.meta.env.BASE_URL}models/${name}.glb`;
export function useModel(name:string) {
  const {scene}=useGLTF(url(name));
  return useMemo(()=>{
    const bounds=new THREE.Box3().setFromObject(scene);
    const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
    return {scene,size,offset:new THREE.Vector3(-center.x,-bounds.min.y,-center.z)};
  },[scene]);
}
export function Model({name,position=[0,0,0],height,width,dimensions,scale=1,rotation=0,tint,onSelect}: {
  name:string;position?:Vec3;height?:number;width?:number;dimensions?:Vec3;scale?:number;rotation?:number;tint?:string;onSelect?:()=>void;
}) {
  const model=useModel(name);
  const object=useMemo(()=>{
    const clone=model.scene.clone(true);
    const recolor=(m:THREE.Material)=>{
      if(!tint||!(m instanceof THREE.MeshStandardMaterial))return m;
      const copy=m.clone();copy.color.multiply(new THREE.Color(tint));return copy;
    };
    clone.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;if(tint)o.material=Array.isArray(o.material)?o.material.map(recolor):recolor(o.material)}});
    return clone;
  },[model,tint]);
  const factor=dimensions?dimensions.map((n,i)=>n/model.size.getComponent(i)) as Vec3:height?height/model.size.y:width?width/model.size.x:scale;
  return <group position={position} rotation={[0,rotation,0]} scale={factor} dispose={null} onClick={onSelect?e=>{e.stopPropagation();onSelect()}:undefined}><primitive object={object} position={model.offset}/></group>;
}
export type Placement={position:Vec3;height:number;rotation:number};
// Each source mesh is drawn once for the whole grove. Shared cached geometry,
// textures and materials avoid a separate scene graph for every tree.
export function ModelInstances({name,placements,wind=false}: {name:string;placements:Placement[];wind?:boolean}) {
  const model=useModel(name);
  const meshes=useMemo(()=>{
    model.scene.updateMatrixWorld(true);
    const list:THREE.Mesh[]=[];
    model.scene.traverse(o=>{if(o instanceof THREE.Mesh)list.push(o)});
    return list;
  },[model]);
  const materials=useMemo(()=>meshes.map(mesh=>{
    if(!wind)return mesh.material;
    const bend=(m:THREE.Material)=>windMaterial(m,model.size.y,model.size.y*.033,-model.offset.y);
    return Array.isArray(mesh.material)?mesh.material.map(bend):bend(mesh.material);
  }),[meshes,model,wind]);
  const matrices=useMemo(()=>placements.map(p=>{
    const factor=p.height/model.size.y;
    return new THREE.Matrix4().compose(new THREE.Vector3(...p.position),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),p.rotation),new THREE.Vector3(factor,factor,factor))
      .multiply(new THREE.Matrix4().makeTranslation(...model.offset.toArray() as Vec3));
  }),[placements,model]);
  return <group>{meshes.map((mesh,index)=><instancedMesh key={index} args={[mesh.geometry,materials[index],placements.length]} castShadow receiveShadow dispose={null} onUpdate={instance=>{
    matrices.forEach((matrix,i)=>instance.setMatrixAt(i,matrix.clone().multiply(mesh.matrixWorld)));
    instance.instanceMatrix.needsUpdate=true;instance.computeBoundingSphere();
  }}/>)}</group>;
}
