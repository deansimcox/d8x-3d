import {create} from 'zustand';
import type {Destination} from './content';

type Mode='welcome'|'transitioning'|'overview'|'scene';
type State={
  mode:Mode;destination:Destination;target:Destination;pending:Destination|null;serial:number;sound:boolean;panelOpen:boolean;ready:boolean;failed:boolean;archive:{id:'office'|'city';entry?:number}|null;
  enter:()=>void;go:(d:Destination)=>void;arrived:()=>void;skip:()=>void;setSound:(sound:boolean)=>void;
  returnToIntro:()=>void;
  togglePanel:()=>void;setReady:(ready:boolean)=>void;fail:()=>void;
  openArchive:(id:'office'|'city',entry?:number)=>void;closeArchive:()=>void;
};
const settled=(d:Destination)=>({destination:d,target:d,mode:(d==='overview'?'overview':'scene') as Mode});
function navigate(state:State,destination:Destination):Partial<State>{
  const instant=state.failed||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!state.ready&&!instant)return {pending:destination};
  const next=instant?settled(destination):{mode:'transitioning' as const,target:destination,serial:state.serial+1};
  return {...next,pending:null,panelOpen:true,archive:null};
}
export const useExperience=create<State>((set,get)=>({
  mode:'welcome',destination:'overview',target:'overview',pending:null,serial:0,sound:false,panelOpen:true,ready:false,failed:false,archive:null,
  enter:()=>get().go('overview'),
  returnToIntro:()=>set({mode:'welcome',destination:'overview',target:'overview',pending:null,panelOpen:true,archive:null}),
  go:d=>set(s=>{
    if((s.mode==='transitioning'&&s.target===d)||(s.mode!=='welcome'&&s.mode!=='transitioning'&&s.destination===d))return s;
    return navigate(s,d);
  }),
  arrived:()=>set(s=>s.mode==='transitioning'?settled(s.target):s),
  skip:()=>get().arrived(),
  setSound:sound=>set({sound}),togglePanel:()=>set(s=>({panelOpen:!s.panelOpen})),
  setReady:ready=>set(s=>ready&&s.pending?{...navigate({...s,ready},s.pending),ready}:{ready}),
  fail:()=>set(s=>{
    if(s.failed)return s;
    const requested=s.pending??(s.mode==='transitioning'?s.target:null);
    return {failed:true,ready:false,pending:null,...(requested?settled(requested):{})};
  }),
  openArchive:(id,entry)=>set(s=>s.mode==='scene'&&s.destination===id?{archive:{id,entry}}:s),
  closeArchive:()=>set({archive:null}),
}));
