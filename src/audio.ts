import type {Destination} from './content';
import {sceneCue} from './sceneSounds';

// Low-level synthesized beds. The AudioContext is created and resumed in the
// sound button's click handler, so the island is silent on arrival.
const mixes:Record<Destination,readonly [number,number,number]>={
  overview:[.13,.015,.014],office:[.038,.004,.01],city:[.035,.006,.012],
  stadium:[.026,.005,.016],nature:[.045,.045,.014],family:[.082,.015,.023],
};
const cueLevels={office:.13,city:.27,stadium:.68,nature:.092,family:.22};
const recordings={city:'city-square.mp3',stadium:'stadium-crowd.mp3',family:'chickens.mp3'};
type CueScene=keyof typeof cueLevels;
type Engine={
  ctx:AudioContext;master:GainNode;beds:GainNode[];
  cues:Partial<Record<CueScene,GainNode>>;loading:Set<CueScene>;
  destination:Destination;enabled:boolean;
};
let engine:Engine|undefined;
let revision=0;
function makeEngine():Engine{
  const ctx=new AudioContext(),master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
  const beds=[['lowpass',370,.32],['bandpass',1260,.55],['lowpass',660,.8]].map(([type,frequency,q],i)=>{
    const length=ctx.sampleRate*(8+i*2),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);
    let brown=0;
    for(let j=0;j<length;j++){
      const white=Math.random()*2-1;brown=(brown+white*.027)/1.027;
      const seam=Math.min(1,j/900,(length-1-j)/900);
      data[j]=(i===1?white*.55:brown*3.4)*(i===2?.66+.34*Math.sin(j/length*Math.PI*6)**2:1)*seam;
    }
    const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    src.buffer=buffer;src.loop=true;filter.type=type as BiquadFilterType;filter.frequency.value=Number(frequency);filter.Q.value=Number(q);gain.gain.value=0;
    src.connect(filter).connect(gain).connect(master);src.start();return gain;
  });
  return {ctx,master,beds,cues:{},loading:new Set(),destination:'overview',enabled:false};
}
async function loadCue(state:Engine,id:CueScene){
  const {ctx,master,cues,loading}=state;
  loading.add(id);
  try{
    let buffer:AudioBuffer;
    if(id==='office'||id==='nature'){
      buffer=sceneCue(ctx,id);
    }else{
      const response=await fetch(`${import.meta.env.BASE_URL}audio/${recordings[id]}`);
      if(!response.ok)return;
      buffer=await ctx.decodeAudioData(await response.arrayBuffer());
    }
    const source=ctx.createBufferSource(),gain=ctx.createGain();
    source.buffer=buffer;source.loop=true;gain.gain.value=0;
    source.connect(gain).connect(master);source.start();cues[id]=gain;
    if(state.destination===id&&state.enabled)gain.gain.setTargetAtTime(cueLevels[id],ctx.currentTime,.55);
  }catch{
    // Keep the ambient bed if a recording is unavailable.
  }finally{
    loading.delete(id);
  }
}
export function mixSound(destination:Destination){
  if(!engine)return;
  engine.destination=destination;
  if(!engine.enabled)return;
  const {ctx,beds,cues,loading}=engine;
  beds.forEach((bed,i)=>bed.gain.setTargetAtTime(mixes[destination][i],ctx.currentTime,.72));
  if(destination!=='overview'&&!cues[destination]&&!loading.has(destination)){
    void loadCue(engine,destination);
  }
  for(const id of Object.keys(cues) as CueScene[]){
    cues[id]?.gain.setTargetAtTime(destination===id?cueLevels[id]:0,ctx.currentTime,.55);
  }
}
export async function setAudio(enabled:boolean,destination:Destination){
  const request=++revision;
  if(enabled)engine??=makeEngine();
  if(engine)engine.enabled=enabled;
  if(enabled&&engine){
    mixSound(destination);
    try{await engine.ctx.resume()}catch(error){
      if(request===revision){engine.enabled=false;throw error}
    }
  }
  if(engine&&request===revision){
    const {ctx,master}=engine;
    master.gain.setTargetAtTime(enabled?.72:0,ctx.currentTime,.17);
    if(!enabled)window.setTimeout(()=>{if(request===revision)void ctx.suspend().catch(()=>{})},950);
  }
}
