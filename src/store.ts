import {create} from 'zustand';
import type {Destination} from './content';

type Mode='welcome'|'transitioning'|'overview'|'scene';
type State={
  mode:Mode;destination:Destination;target:Destination;serial:number;sound:boolean;panelOpen:boolean;ready:boolean;failed:boolean;archive:{id:'office'|'city';entry?:number}|null;
  enter:()=>void;go:(d:Destination)=>void;arrived:()=>void;skip:()=>void;setSound:(sound:boolean)=>void;
  returnToIntro:()=>void;
  togglePanel:()=>void;setReady:(ready:boolean)=>void;fail:()=>void;
  openArchive:(id:'office'|'city',entry?:number)=>void;closeArchive:()=>void;
};
const settled=(d:Destination)=>({destination:d,target:d,mode:(d==='overview'?'overview':'scene') as Mode});
export const useExperience=create<State>((set,get)=>({
  mode:'welcome',destination:'overview',target:'overview',serial:0,sound:false,panelOpen:true,ready:false,failed:false,archive:null,
  enter:()=>get().go('overview'),
  returnToIntro:()=>set({mode:'welcome',destination:'overview',target:'overview',panelOpen:true,archive:null}),
  go:d=>set(s=>{
    if((s.mode==='transitioning'&&s.target===d)||(s.mode!=='welcome'&&s.mode!=='transitioning'&&s.destination===d))return s;
    return s.failed||!s.ready||window.matchMedia('(prefers-reduced-motion: reduce)').matches?{...settled(d),panelOpen:true,archive:null}:{mode:'transitioning',target:d,serial:s.serial+1,panelOpen:true,archive:null};
  }),
  arrived:()=>set(s=>s.mode==='transitioning'?settled(s.target):s),
  skip:()=>get().arrived(),
  setSound:sound=>set({sound}),togglePanel:()=>set(s=>({panelOpen:!s.panelOpen})),setReady:ready=>set({ready}),
  fail:()=>set(s=>s.failed?s:{failed:true,ready:false,...(s.mode==='transitioning'?settled(s.target):{})}),
  openArchive:(id,entry)=>set(s=>s.mode==='scene'&&s.destination===id?{archive:{id,entry}}:s),
  closeArchive:()=>set({archive:null}),
}));
