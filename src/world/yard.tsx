import {Block} from './props';
import {Model} from './models';
import type {Vec3} from './layout';

function FrameBar({from,to,color}:{from:[number,number];to:[number,number];color:string}){
  const dx=to[0]-from[0],dy=to[1]-from[1];
  return <mesh position={[(from[0]+to[0])/2,(from[1]+to[1])/2,0]} rotation={[0,0,Math.atan2(-dx,dy)]}>
    <cylinderGeometry args={[.031,.031,Math.hypot(dx,dy),7]}/><meshStandardMaterial color={color}/>
  </mesh>;
}
function Bike({position,color,scale=1}:{position:Vec3;color:string;scale?:number}){
  return <group position={position} rotation={[.13,-.36,0]} scale={scale}>
    {[-.41,.41].map(x=><group key={x} position={[x,.237,0]}>
      <mesh><torusGeometry args={[.218,.028,8,22]}/><meshStandardMaterial color="#38363c"/></mesh>
      <mesh><torusGeometry args={[.189,.012,6,22]}/><meshStandardMaterial color="#c5c0ab" metalness={.45}/></mesh>
      <Block position={[0,0,0]} size={[.025,.37,.02]} color="#c5c0ab"/>
      <Block position={[0,0,0]} size={[.37,.025,.02]} color="#c5c0ab"/>
    </group>)}
    <FrameBar from={[-.41,.237]} to={[.01,.25]} color={color}/>
    <FrameBar from={[-.41,.237]} to={[-.17,.52]} color={color}/>
    <FrameBar from={[-.17,.52]} to={[.25,.53]} color={color}/>
    <FrameBar from={[.01,.25]} to={[-.17,.52]} color={color}/>
    <FrameBar from={[.01,.25]} to={[.25,.53]} color={color}/>
    <FrameBar from={[.41,.237]} to={[.21,.67]} color={color}/>
    <Block position={[-.19,.55,0]} size={[.21,.07,.13]} color="#3e383d"/>
    <Block position={[.21,.67,0]} size={[.07,.045,.29]} color="#3e383d"/>
  </group>;
}
export function YardToys(){
  return <>
    <Bike position={[-4.75,.02,4.27]} color="#5e8d88" scale={1.3}/>
    <Bike position={[-4.35,.02,4.96]} color="#da9a53" scale={.98}/>
    <Model name="bear" position={[2.76,.09,5.31]} height={.47} rotation={.32}/>
    <Block position={[2.23,.16,5.61]} size={[.24,.24,.23]} color="#da9160" rotation={.16}/>
    <Block position={[2.48,.13,5.77]} size={[.2,.19,.19]} color="#708ec2" rotation={.35}/>
    <mesh position={[1.98,.24,5.27]}><sphereGeometry args={[.205,14,10]}/><meshStandardMaterial color="#c77756"/></mesh>
  </>;
}
