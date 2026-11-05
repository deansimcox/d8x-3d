import {useMemo} from 'react';
import * as THREE from 'three';
import {ModelInstances,type Placement} from './models';
import {nearRiver,onIsland,protectedView,random,terrainY} from './layout';
import {windMaterial} from './wind';
import {cottageSteps,nearTrail} from './trail';

const steps=[...cottageSteps(false),...cottageSteps(true)];
const nearSteps=(x:number,z:number)=>steps.some(({worldX,worldZ})=>Math.hypot(x-worldX,z-worldZ)<1.15);

export function Vegetation(){
  const groups=useMemo(()=>{
    const trees:Placement[][]=[[],[],[]],rocks:Placement[]=[],flowers:Placement[]=[],bushes:Placement[]=[];
    // Break the sightline from the pitch to the cottage without crossing the path.
    const ridgeTrees=[[33,-14.3,13.4],[31,-17.4,14.1],[27,-20.5,13.2]];
    ridgeTrees.forEach(([x,z,height],i)=>{
      trees[i%2].push({position:[x,terrainY(x,z)-.05,z],height,rotation:i*1.1});
    });
    const maxTrees=window.matchMedia('(max-width: 800px)').matches?104:146;
    let treesPlaced=0;
    for(let i=0;i<1250;i++) {
      const x=(random(i*5+10)-.5)*116,z=(random(i*5+11)-.5)*96;
      if(!onIsland(x,z,.93)||Math.hypot(x,z+5)<18||nearRiver(x,z,3)||nearTrail(x,z,1.25)||nearSteps(x,z))continue;
      const rotation=random(i+44)*Math.PI*2;
      const y=terrainY(x,z);
      if(!protectedView(x,z,1.8)&&!nearTrail(x,z,2.5)&&treesPlaced<maxTrees&&random(i+4)>.38){trees[i%3].push({position:[x,y-.05,z],height:5+random(i+71)*5,rotation});treesPlaced++}
      else if(!protectedView(x,z,-2)&&bushes.length<55)bushes.push({position:[x,y,z],height:.6+random(i)*.7,rotation});
      if(rocks.length<55&&!protectedView(x,z,0))rocks.push({position:[x,y-.08,z],height:.6+random(i+85)*1.1,rotation});
      if(flowers.length<95&&random(i+33)>.6)flowers.push({position:[x,y,z],height:.25+random(i+82)*.3,rotation});
    }
    return {trees,rocks,flowers,bushes};
  },[]);
  const groves=useMemo(()=>groups.trees.map(placements=>{
    const cells=new Map<string,Placement[]>();
    for(const p of placements){const [x,,z]=p.position,key=`${Math.floor(x/30)}/${Math.floor(z/30)}`;const cell=cells.get(key)??[];cell.push(p);cells.set(key,cell)}
    return Array.from(cells);
  }),[groups]);
  return <group>
    {groves.map((cells,i)=>cells.map(([key,placements])=><ModelInstances key={`${i}/${key}`} name={['CommonTree_1','CommonTree_3','Pine_1'][i]} placements={placements} wind/>))}
    <ModelInstances name="Rock_Medium_1" placements={groups.rocks}/><ModelInstances name="Bush_Common_Flowers" placements={groups.bushes}/><ModelInstances name="Flower_3_Group" placements={groups.flowers}/><Meadow/>
  </group>;
}

function Meadow(){
  const material=useMemo(()=>windMaterial(new THREE.MeshStandardMaterial({side:THREE.DoubleSide,roughness:1}),.48,.12),[]);
  const {geometry,patches}=useMemo(()=>{
    const vertices=[];
    for(let i=0;i<6;i++){
      const a=i*2.4,r=.1+random(i)*.26,x=Math.cos(a)*r,z=Math.sin(a)*r,h=.22+random(i+3)*.35;
      vertices.push(x-.055,0,z,x+.055,0,z,x+Math.cos(a)*.18,h,z+Math.sin(a)*.16);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();
    const patches=[];
    for(let i=0;i<1500;i++){
      const x=(random(i*4+700)-.5)*115,z=(random(i*4+701)-.5)*96;
      if(!onIsland(x,z,.95)||Math.hypot(x,z+4)<16||nearRiver(x,z,2.45)||protectedView(x,z,-3.8)||nearTrail(x,z,.65))continue;
      if(nearSteps(x,z))continue;
      const obj=new THREE.Object3D();obj.position.set(x,terrainY(x,z),z);obj.rotation.y=random(i+93)*6.28;obj.scale.setScalar(.45+random(i+22)*.88);obj.updateMatrix();patches.push(obj.matrix);
    }
    return {geometry,patches};
  },[]);
  return <instancedMesh args={[geometry,material,patches.length]} receiveShadow onUpdate={mesh=>{
    const color=new THREE.Color();
    patches.forEach((m,i)=>{mesh.setMatrixAt(i,m);mesh.setColorAt(i,color.set(i%3===0?'#b1b37b':i%3===1?'#80935e':'#99a56e'))});
    mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();
  }}/>;
}
