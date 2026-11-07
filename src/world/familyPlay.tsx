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
const gardenTrees=[
  {position:familyLawnPosition(-7.1,-4.1),height:12.7,rotation:.7},
  {position:familyLawnPosition(7.1,-5.1),height:13.2,rotation:2.3},
  {position:familyLawnPosition(10.6,-3.3),height:10.1,rotation:1.5},
  {position:familyLawnPosition(-4.8,-6.5),height:14.1,rotation:1.2},
  {position:familyLawnPosition(-.9,-7.5),height:16,rotation:2.7},
  {position:familyLawnPosition(3.3,-7.2),height:13.5,rotation:3.9},
  {position:familyLawnPosition(-10.2,-1.1),height:12.3,rotation:4.7},
  {position:familyLawnPosition(-9.6,2.6),height:10.4,rotation:3.1},
  {position:familyLawnPosition(13.7,-.6),height:12.7,rotation:5.1},
  {position:familyLawnPosition(14,3.8),height:10.6,rotation:.3},
  {position:familyLawnPosition(16.8,2.7),height:14.1,rotation:2.8},
  {position:familyLawnPosition(18.3,6.1),height:11.8,rotation:4.3},
  {position:familyLawnPosition(15.8,7.1),height:9.5,rotation:1.4},
];

export function FamilyTrees(){
  return <ModelInstances name="CommonTree_1" placements={gardenTrees} wind/>;
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
