import {Model} from './models';
import {anchors,type Vec3} from './layout';
import {Block,Blocks,Lamp} from './props';
import {useExperience} from '../store';

const plaster='#e0c8a4',wood='#78543e',stone='#9d947a';
function Roof({home=false}: {home?:boolean}){
  return <><Model name="Roof_RoundTiles_6x8" position={[0,3.65,0]} dimensions={home?[10.5,3.6,8.8]:[9.8,3.3,8.1]}/><Model name="Prop_Chimney" position={[2.6,4.9,-1.55]} height={2.5}/></>;
}
function Planting({home=false}: {home?:boolean}){
  const groups:Vec3[]=home?[[-4.1,0,3.9],[-2.6,0,4.1],[3.2,0,4.2],[4.3,0,2.5],[5.3,0,-2]]:[[-4.2,0,3.9],[4.4,0,1.5],[-5.1,0,.5],[3.7,0,4.8]];
  return <>{groups.map((p,i)=><Model key={i} name={i%2?'Flower_4_Group':'Bush_Common_Flowers'} position={p} height={i%2?.55:.85} rotation={i*1.9}/>)}
    <Blocks items={Array.from({length:7},(_,i)=>({position:[Math.sin(i*.48)*.43,.02,3.6+i*.73],size:[1.55,.16,.61],color:i%2?'#c1b699':'#d1bda0',rotation:i*.16}))}/></>;
}
export function Workshop(){
  const active=useExperience(s=>s.mode==='scene'&&s.destination==='office');
  return <group position={anchors.office} rotation={[0,.23,0]}>
    <Block position={[0,.12,0]} size={[8.7,.38,7.4]} color={stone}/>
    <Block position={[0,.34,0]} size={[8.35,.18,7.05]} color="#af855d"/>
    <Block position={[0,2,-3.42]} size={[8.3,3.7,.25]} color={plaster}/>
    <Block position={[-4.02,2,0]} size={[.28,3.7,6.9]} color={plaster}/>
    <Block position={[4.02,2,-2.4]} size={[.28,3.7,2]} color={plaster}/>
    <Block position={[0,3.7,3.36]} size={[8.4,.36,.28]} color={wood}/>
    {[-3.95,3.95].map(x=><Block key={x} position={[x,2.02,3.36]} size={[.32,3.35,.32]} color={wood}/>)}
    <Roof/>
    <Model name="desk" position={[.95,.43,-1.13]} width={3.2} rotation={Math.PI}/>
    <Model name="chairDesk" position={[.92,.43,.55]} height={1.9}/>
    <Model name="computerScreen" position={[1,2.08,-1.3]} height={.81} rotation={Math.PI} onSelect={active?()=>useExperience.getState().openArchive('office'):undefined}/>
    <Block position={[1,2.62,-1.10]} size={[1.04,.49,.034]} color="#536b60" glow={.16}/>
    {[-.13,0,.13].map((y,i)=><Block key={y} position={[.88+i*.053,2.62+y,-1.079]} size={[.49-i*.07,.021,.011]} color={i===1?'#c6c991':'#e6d2a7'} glow={.12}/>)}
    <Model name="computerKeyboard" position={[.95,2.08,-.72]} width={.78}/>
    <Model name="lampRoundTable" position={[2.15,2.07,-1.2]} height={.78}/>
    <Model name="bookcaseOpen" position={[-2.43,.43,-2.88]} height={2.85}/>
    <Model name="books" position={[-2.37,1.1,-2.7]} width={1.2}/>
    <Model name="pottedPlant" position={[-2.82,.43,2.42]} height={1.38}/>
    <Model name="rugDoormat" position={[.1,.44,2.25]} width={2.5}/>
    <Model name="Prop_Vine1" position={[-4.23,.38,2.97]} height={2.85} rotation={-Math.PI/2}/>
    <pointLight position={[.6,2.75,.35]} intensity={13} color="#ffc788" distance={8}/>
    <Lamp position={[4.4,0,4.9]} short/>
    <Planting/>
  </group>;
}
export function Home(){
  return <group position={anchors.family} rotation={[0,.28,0]}>
    <Block position={[0,.15,0]} size={[9.2,.45,7.7]} color={stone}/>
    <Block position={[0,1.95,0]} size={[8.85,3.65,7.28]} color="#ead3af"/>
    <Block position={[0,3.61,0]} size={[9.05,.25,7.5]} color={wood}/>
    <Roof home/>
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
    <Planting home/>
  </group>;
}
