import {useMemo} from 'react';
import {useFrame} from '@react-three/fiber';
import {Color,DodecahedronGeometry,Float32BufferAttribute,Mesh} from 'three';
import {anchors,terrainY,type Vec3} from './layout';
import {Model,ModelInstances,useModel} from './models';
import {useReducedMotion} from './motion';
import {FootballGoal} from './footballGoal';

export function familyLawnPosition(x:number,z:number):Vec3{
  const [homeX,homeY,homeZ]=anchors.family;
  const angle=.28;
  const worldX=homeX+x*Math.cos(angle)+z*Math.sin(angle);
  const worldZ=homeZ-x*Math.sin(angle)+z*Math.cos(angle);
  return [x,terrainY(worldX,worldZ)-homeY-.035,z];
}

const swingPosition=familyLawnPosition(5.2,9);
const sandpitPosition=familyLawnPosition(1.8,11.65);
const goalPosition=familyLawnPosition(-5.45,7.8);
const ballPosition=familyLawnPosition(-4.6,9.45);
type TreeSpec=[x:number,z:number,height:number,rotation:number];
const familyGrove:{name:string;trees:TreeSpec[]}[]=[
  {name:'CommonTree_1',trees:[
    [-12.1,-3.7,12.7,.7],[-16.1,-2.8,11.8,4.7],[-13.6,2.6,10.4,3.1],
    [7.1,-5.1,13.2,2.3],[13.7,-.6,12.7,5.1],[16.8,2.7,14.1,2.8],
    [-7.2,-10.4,5.8,2.8],[-2.9,-10.8,4.3,4.1],[1.7,-10.8,5.2,.5],
    [6.8,-8.2,5.1,3.5],[-10.7,5.2,4.7,1.2],[-16.6,.5,6.3,3.9],
  ]},
  {name:'CommonTree_3',trees:[
    [-11,-7.4,13.1,1.2],[-5.8,-8.2,14.6,2.4],[3.3,-7.2,13.5,3.9],[10.6,-3.3,10.1,1.5],
    [18.3,6.1,11.8,4.3],[14,3.8,10.6,.3],
    [-10.7,-10.3,5.2,.8],[-5.4,-10.9,6.1,2.3],[-.4,-11.4,4.8,1.9],
    [4.7,-9.6,5.6,2.7],[8,-7.6,4.1,3.4],[-13.3,-7.1,6.4,1.7],
    [-15.4,-5.6,5.1,2.5],[-11.7,3.9,5.8,2.1],
  ]},
  {name:'Pine_1',trees:[
    [-.9,-7.5,15.3,2.7],[-15.7,-7.1,12.4,1.8],[15.8,7.1,9.5,1.4],
    [-12.5,-9.2,6.1,2.9],[-8.9,-11.3,4.6,.2],[-3.9,-12,5.3,1.2],
    [.1,-9.7,6.2,4.8],[3.8,-10.8,4.9,3.8],[-14.9,-1.3,7.2,2],
    [-9.2,5.2,5.7,.2],
  ]},
];
const familyTreeModels=familyGrove.map(({name,trees})=>({
  name,placements:trees.map(([x,z,height,rotation])=>({position:familyLawnPosition(x,z),height,rotation})),
}));

export function FamilyTrees(){
  return <>{familyTreeModels.map(({name,placements})=><ModelInstances key={name} name={name} placements={placements} wind/>)}</>;
}
function Football(){
  const geometry=useMemo(()=>{
    const ball=new DodecahedronGeometry(.23);
    const dark=new Color('#343e36'),cream=new Color('#fff4d9');
    const colors=[];
    for(let i=0;i<ball.attributes.position.count;i++){
      const color=[0,3,5,9,11].includes(Math.floor(i/9))?dark:cream;
      colors.push(color.r,color.g,color.b);
    }
    ball.setAttribute('color',new Float32BufferAttribute(colors,3));
    return ball;
  },[]);
  return <group position={ballPosition}>
    <mesh position={[0,.24,0]} rotation={[.43,.25,.32]} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial vertexColors flatShading roughness={.85}/>
    </mesh>
  </group>;
}

function WoodenSwing(){
  const {scene,size,offset}=useModel('familySwing');
  const reduced=useReducedMotion();
  const {swing,seat}=useMemo(()=>{
    const model=scene.clone(true);
    model.traverse(part=>{
      if(part instanceof Mesh){part.castShadow=true;part.receiveShadow=true}
    });
    return {swing:model,seat:model.getObjectByName('SwingSeatPivot')};
  },[scene]);

  useFrame(({clock})=>{
    if(seat)seat.rotation.x=reduced?0:Math.sin(clock.elapsedTime*1.65)*.10;
  });

  return <group position={swingPosition} rotation={[0,-.33,0]} scale={2.7/size.y} dispose={null}>
    <primitive object={swing} position={offset}/>
  </group>;
}

export function FamilyPlay(){
  return <>
    <WoodenSwing/>
    <Model name="familySandpit" position={sandpitPosition} width={2.15} rotation={.24}/>
    <group position={goalPosition} rotation={[0,1.9,0]} scale={.94}><FootballGoal/></group>
    <Football/>
  </>;
}
