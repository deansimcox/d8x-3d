import {Model} from './models';
import {anchors,type Vec3} from './layout';
import {Block,Blocks,Lamp} from './props';
import {useExperience} from '../store';

const blocks:[string,Vec3,number,number][]=[
  ['building-a',[-5,.24,-3.9],4.5,.05],['building-f',[0,.24,-4.8],6,0],['building-j',[5.1,.24,-4],4.8,-.12],
  ['building-c',[-5.5,.24,2.3],3.4,0],['building-h',[.2,.24,2.9],4.9,.07],['building-c',[5.75,.24,2.6],3.9,-.24],
];
const tints=['#ffebce','#e6efdc','#ffe0ca','#f3edda','#f0dfc8','#edf2dc'];
export function City(){
  const active=useExperience(s=>s.mode==='scene'&&s.destination==='city');
  return <group position={anchors.city} rotation={[0,-.16,0]}>
  <Block position={[0,-.13,0]} size={[19.2,.58,15.9]} color="#a79e86"/>
  <Block position={[0,.18,0]} size={[18.8,.11,15.55]} color="#d1c4a6"/>
  <Block position={[0,.26,-.45]} size={[18.6,.04,2.02]} color="#858f87"/>
  <Block position={[2.7,.26,0]} size={[1.43,.04,15.4]} color="#858f87"/>
  <Blocks castShadow={false} items={Array.from({length:11},(_,i)=>({position:[-8.2+i*1.62,.285,-.45],size:[.78,.016,.043],color:'#f5dfae'}))}/>
  {blocks.map(([name,position,height,rotation],i)=><Model key={i} name={name} position={position} height={height} rotation={rotation} tint={tints[i]} onSelect={active?()=>useExperience.getState().openArchive('city',i):undefined}/>)}
  <Model name="detail-awning" position={[-5.45,1.7,3.95]} width={1.9}/>
  <Model name="bench" position={[.5,.25,6]} height={.85}/>
  <Lamp position={[-7.7,.25,5.7]}/><Lamp position={[7.7,.25,.95]}/><Lamp position={[1.7,.25,-1.7]}/>
  {[-7.5,-3.9,.2,6.6].map((x,i)=><Model key={x} name="Bush_Common_Flowers" position={[x,.24,6.8]} height={.76} rotation={i*1.8}/>)}
</group>}
