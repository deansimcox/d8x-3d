import {create} from 'zustand';
import {sceneIds,type Destination} from './content';
import {airMailGates} from './airMail';

type Mode='welcome'|'transitioning'|'overview'|'scene'|'flight';
type State={
  mode:Mode;destination:Destination;target:Destination;pending:Destination|null;serial:number;sound:boolean;panelOpen:boolean;ready:boolean;failed:boolean;archive:{id:'office'|'city';entry?:number}|null;
  enter:()=>void;go:(d:Destination)=>void;arrived:()=>void;skip:()=>void;setSound:(sound:boolean)=>void;
  returnToIntro:()=>void;
  togglePanel:()=>void;setReady:(ready:boolean)=>void;fail:()=>void;
  openArchive:(id:'office'|'city',entry?:number)=>void;closeArchive:()=>void;
  flightRings:number;flightDelivered:boolean;flightFreestyle:boolean;flightTurn:number;turnFlight:()=>void;continueFlight:()=>void;startFlight:()=>void;recordRing:()=>void;deliverMail:()=>void;exitFlight:()=>void;
};
const settled=(d:Destination)=>({destination:d,target:d,mode:(d==='overview'?'overview':'scene') as Mode});
const sessionKey='d8x.last-scene';
function readScene(){
  if(location.hash==='#projects'||location.hash==='#work')return;
  try{
    const saved=sessionStorage.getItem(sessionKey);
    if(saved==='overview')return settled(saved);
    const scene=sceneIds.find(id=>id===saved);
    if(scene)return settled(scene);
  }catch{/* Storage can be disabled. */}
}
const restoredScene=readScene();
function navigate(state:State,destination:Destination):Partial<State>{
  const instant=state.failed||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!state.ready&&!instant)return {pending:destination};
  const next=instant?settled(destination):{mode:'transitioning' as const,target:destination,serial:state.serial+1};
  return {...next,pending:null,panelOpen:true,archive:null};
}
export const useExperience=create<State>((set,get)=>({
  mode:'welcome',destination:'overview',target:'overview',...restoredScene,pending:null,serial:0,sound:false,panelOpen:true,ready:false,failed:false,archive:null,
  enter:()=>get().go('overview'),
  returnToIntro:()=>set({mode:'welcome',destination:'overview',target:'overview',pending:null,panelOpen:true,archive:null}),
  go:d=>set(s=>{
    if((s.mode==='transitioning'&&s.target===d)||((s.mode==='overview'||s.mode==='scene')&&s.destination===d))return s;
    return navigate(s,d);
  }),
  arrived:()=>set(s=>s.mode==='transitioning'?settled(s.target):s),
  skip:()=>get().arrived(),
  setSound:sound=>set({sound}),togglePanel:()=>set(s=>({panelOpen:!s.panelOpen})),
  setReady:ready=>set(s=>ready&&s.pending?{...navigate({...s,ready},s.pending),ready}:{ready}),
  fail:()=>set(s=>{
    if(s.failed)return s;
    const requested=s.pending??(s.mode==='transitioning'?s.target:s.mode==='flight'?'overview':null);
    return {failed:true,ready:false,pending:null,...(requested?settled(requested):{})};
  }),
  openArchive:(id,entry)=>set(s=>s.mode==='scene'&&s.destination===id?{archive:{id,entry}}:s),
  closeArchive:()=>set({archive:null}),
  flightRings:0,flightDelivered:false,flightFreestyle:false,flightTurn:0,
  startFlight:()=>set(s=>s.mode==='overview'&&s.ready&&!s.failed?{mode:'flight',flightRings:0,flightDelivered:false,flightFreestyle:false,flightTurn:0}:s),
  recordRing:()=>set(s=>s.mode==='flight'&&s.flightRings<airMailGates.length?{flightRings:s.flightRings+1}:s),
  deliverMail:()=>set(s=>s.mode==='flight'?{flightDelivered:true}:s),
  turnFlight:()=>set(s=>s.mode==='flight'&&!s.flightDelivered?{flightTurn:s.flightTurn+1}:s),
  continueFlight:()=>set(s=>s.mode==='flight'&&s.flightDelivered?{flightFreestyle:true}:s),
  exitFlight:()=>set(s=>s.mode==='flight'?navigate(s,'overview'):s),
}));
useExperience.subscribe((state,previous)=>{
  if(state.mode===previous.mode&&state.destination===previous.destination)return;
  try{
    if(state.mode==='welcome')sessionStorage.removeItem(sessionKey);
    if(state.mode==='scene'||state.mode==='overview')sessionStorage.setItem(sessionKey,state.destination);
  }catch{/* Navigation works without storage. */}
});
