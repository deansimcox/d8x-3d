import {useMemo} from 'react';
import {useFrame} from '@react-three/fiber';
import {Mesh} from 'three';
import {anchors,terrainY,type Vec3} from './layout';
import {Model,useModel} from './models';
import {useReducedMotion} from './motion';

function lawnPosition(x:number,z:number):Vec3{
  const [homeX,homeY,homeZ]=anchors.family;
  const angle=.28;
  const worldX=homeX+x*Math.cos(angle)+z*Math.sin(angle);
  const worldZ=homeZ-x*Math.sin(angle)+z*Math.cos(angle);
  return [x,terrainY(worldX,worldZ)-homeY-.035,z];
}

const swingPosition=lawnPosition(5.85,5.1);
const sandpitPosition=lawnPosition(3.3,7.55);

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
  </>;
}
