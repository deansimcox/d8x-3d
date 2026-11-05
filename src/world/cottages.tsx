import {Model} from './models';
import {anchors,random,terrainY,workshopAngle,type Vec3} from './layout';
import {Block,Blocks,Lamp} from './props';
import {useExperience} from '../store';
import {Shape} from 'three';
import {YardToys} from './yard';
import {KitchenGarden} from './kitchenGarden';
import {DeveloperScreens} from './codeDisplay';
import {DeskChair,WritingDesk} from './workshopFurniture';
import {cottageSteps} from './trail';

const plaster='#e0c8a4',wood='#78543e',stone='#9d947a';
const gable=new Shape().moveTo(-3.9,-.7).lineTo(3.9,-.7).lineTo(0,1.61).closePath();
function Roof({home=false}: {home?:boolean}){
  return <><Model name="Roof_RoundTiles_6x8" position={[0,3.65,0]} dimensions={home?[10.5,3.6,8.8]:[9.8,3.3,8.1]}/><Model name="Prop_Chimney" position={[2.6,4.9,-1.55]} height={2.5}/></>;
}
function Planting({home=false}: {home?:boolean}){
  const groups:Vec3[]=home?[[-4.1,0,3.9],[-2.6,0,4.1],[3.2,0,4.2],[4.3,0,2.5],[5.3,0,-2]]:[[-4.2,0,3.9],[4.4,0,1.5],[-5.1,0,.5],[3.7,0,4.8]];
  return <>{groups.map((p,i)=><Model key={i} name={i%2?'Flower_4_Group':'Bush_Common_Flowers'} position={p} height={i%2?.55:.85} rotation={i*1.9}/>)}</>;
}
const stoneShapes=Array.from({length:8},(_,index)=>{
  const shape=new Shape();
  for(let vertex=0;vertex<9;vertex++){
    const angle=vertex*Math.PI*2/9;
    const variation=.82+random(index*31+vertex+70)*.22;
    const x=Math.cos(angle)*(.50+random(index+64)*.17)*variation;
    const y=Math.sin(angle)*(.23+random(index+20)*.07)*variation;
    if(vertex===0)shape.moveTo(x,y);
    else shape.lineTo(x,y);
  }
  shape.closePath();
  return shape;
});
const stoneEdges={depth:.075,bevelEnabled:true,bevelSize:.028,bevelThickness:.025,bevelSegments:1};
function SteppingStones({home=false}:{home?:boolean}){
  const anchorY=(home?anchors.family:anchors.office)[1];
  return <group name={home?'Family stepping stones':'Workshop stepping stones'}>
    {cottageSteps(home).map(({index,x,z,worldX,worldZ})=>{
      return <group key={index} position={[x,terrainY(worldX,worldZ)-anchorY-.025,z]} rotation={[0,(random(index+19)-.5)*.48,0]}>
        <mesh rotation={[-Math.PI/2,0,0]} castShadow receiveShadow>
          <extrudeGeometry args={[stoneShapes[index],stoneEdges]}/>
          <meshStandardMaterial color={['#a79f88','#b6ac94','#9c9c89'][index%3]} roughness={.96}/>
        </mesh>
      </group>;
    })}
  </group>;
}
export function Workshop(){
  const active=useExperience(s=>s.mode==='scene'&&s.destination==='office');
  return <group position={anchors.office} rotation={[0,workshopAngle,0]}>
    <Block position={[0,.12,0]} size={[8.7,.38,7.4]} color={stone}/>
    <Block position={[0,.34,0]} size={[8.35,.18,7.05]} color="#af855d"/>
    <Block position={[0,2,-3.42]} size={[8.3,3.7,.25]} color={plaster}/>
    <Block position={[-4.02,2,0]} size={[.28,3.7,6.9]} color={plaster}/>
    <Block position={[4.02,2,0]} size={[.28,3.7,6.9]} color={plaster}/>
    <Block position={[-2.29,2,3.42]} size={[3.82,3.65,.24]} color={plaster}/>
    <Block position={[3.21,2,3.42]} size={[2,3.65,.24]} color={plaster}/>
    <Block position={[.95,.86,3.42]} size={[2.66,1.39,.24]} color={plaster}/>
    <Block position={[.95,3.61,3.42]} size={[2.66,.50,.24]} color={plaster}/>
    <Block position={[0,3.82,3.42]} size={[8.48,.18,.3]} color={wood}/>
    <Model name="Door_1_Round" position={[-2.25,.28,3.57]} height={2.67}/>
    {[1.55,3.31].map(y=><Block key={y} position={[.92,y,3.45]} size={[2.76,.15,.38]} color={wood}/>)}
    {[-.37,2.21].map((x,i)=><group key={x} position={[x,2.43,3.55]}>
      <Block position={[0,0,0]} size={[.13,1.68,.24]} color={wood}/>
      <group rotation={[0,i===0?.63:-.63,0]}>
        <Block position={[i===0?-.43:.43,0,0]} size={[.82,1.57,.09]} color="#54715f"/>
        {[-.43,0,.43].map(y=><Block key={y} position={[i===0?-.43:.43,y,.06]} size={[.82,.045,.04]} color="#91a18a"/>)}
      </group>
    </group>)}
    <mesh position={[0,4.61,3.38]}><shapeGeometry args={[gable]}/><meshStandardMaterial color={plaster}/></mesh>
    <Roof/>
    <WritingDesk/>
    <DeskChair/>
    <DeveloperScreens onSelect={active?()=>useExperience.getState().openArchive('office'):undefined}/>
    <Model name="computerKeyboard" position={[.85,2.08,-.63]} width={.78} tint="#d5c5ae"/>
    <Model name="computerMouse" position={[1.47,2.08,-.62]} width={.17} tint="#a5a594"/>
    <Model name="officePlantPalm" position={[-2.72,.43,-2.53]} height={2.54} rotation={.58}/>
    <Model name="officePlantZZ" position={[3.12,.43,-2.3]} height={2.22} rotation={2.5}/>
    <Block position={[-1.76,.56,-2.74]} size={[.53,.27,.53]} color="#9d7357"/>
    <Model name="officePlantPothos" position={[-1.64,.43,-2.61]} height={1.17} rotation={1.6}/>
    <Model name="officePlantZZ" position={[-2.82,.43,1.5]} height={1.73} rotation={1.2}/>
    <Block position={[3.44,.565,.21]} size={[.55,.28,.55]} color="#9d7357"/>
    <Model name="officePlantPothos" position={[3.26,.43,.18]} height={1.22} rotation={-.8}/>
    <Model name="Prop_Vine1" position={[-4.23,.38,2.97]} height={2.85} rotation={-Math.PI/2}/>
    <pointLight position={[1.9,3.25,.2]} intensity={2.6} color="#ffd09d" distance={5}/>
    <Block position={[0,3.86,0]} size={[8.1,.1,6.75]} color="#bc9b73"/>
    <Lamp position={[4.4,0,4.9]} short/>
    <Planting/>
    <SteppingStones/>
  </group>;
}
function GardenLookout(){
  return <group position={[6.5,-.10,7.4]} rotation={[0,.3,0]}>
    <Block position={[0,.06,0]} size={[2.54,.23,1.93]} color="#76543e"/>
    <Blocks items={Array.from({length:6},(_,i)=>({
      position:[(i-2.5)*.412,.19,0],
      size:[.397,.095,1.99],
      color:i%2?'#b78a61':'#c3976e',
    }))}/>
    {[-1.13,1.13].map(side=><Block key={side} position={[side,.62,.87]} size={[.12,.86,.13]} color="#805b43"/>)}
    <Block position={[0,1.01,.87]} size={[2.43,.12,.15]} color="#92664a"/>
    <Model name="ridgeTelescope" position={[0,.238,-.13]} height={1.67} rotation={.62}/>
  </group>;
}

export function Home(){
  return <group position={anchors.family} rotation={[0,.28,0]}>
    <Block position={[0,.15,0]} size={[9.2,.45,7.7]} color={stone}/>
    <Block position={[0,1.95,0]} size={[8.85,3.65,7.28]} color="#ead3af"/>
    <Block position={[0,3.61,0]} size={[9.05,.25,7.5]} color={wood}/>
    <Roof home/>
    <mesh position={[0,4.48,3.64]} scale={[1.12,1.15,1]} castShadow receiveShadow>
      <shapeGeometry args={[gable]}/><meshStandardMaterial color="#ead3af"/>
    </mesh>
    <Model name="Door_1_Round" position={[0,.36,3.71]} height={2.68}/>
    {[-2.65,2.65].map(x=><group key={x} position={[x,1.24,3.72]}>
      <Block position={[0,.84,.011]} size={[1.17,1.4,.04]} color="#ffcf86" glow={.8}/>
      <Model name="Window_Wide_Round1" height={1.8}/>
      <Block position={[0,-.14,.23]} size={[1.63,.2,.5]} color="#9c6c4e"/>
      <Model name="Flower_4_Group" position={[0,-.06,.29]} height={.38}/>
    </group>)}
    <Model name="Prop_Vine1" position={[-4.45,.29,3.75]} height={3.4}/>
    <Model name="bench" position={[3.3,0,5.7]} height={.94} rotation={-.35}/>
    <Model name="rugDoormat" position={[0,.14,4.1]} width={1.6}/>
    {[-6.4,6.4].map(x=><group key={x}>{[-2.1,.3,2.7].map(z=><Model key={z} name="Prop_WoodenFence_Single" position={[x,0,z]} width={2.4} rotation={Math.PI/2}/>)}</group>)}
    <Lamp position={[-1.45,.25,3.95]} short/>
    <YardToys/>
    <KitchenGarden/>
    <GardenLookout/>
    <Planting home/>
    <SteppingStones home/>
  </group>;
}
