import type {Destination} from './content';

// Low-level synthesized beds. The AudioContext is created and resumed in the
// sound button's click handler, so the island is silent on arrival.
const mixes:Record<Destination,readonly [number,number,number]>={
  overview:[.13,.015,.014],office:[.1,.012,.024],city:[.045,.012,.041],
  stadium:[.035,.018,.082],nature:[.045,.16,.014],family:[.082,.015,.023],
};
let engine:{ctx:AudioContext;master:GainNode;beds:GainNode[];crowd:GainNode}|undefined;
let revision=0;
function makeCrowd(ctx:AudioContext,master:GainNode){
  const duration=12,rate=22050;
  const buffer=ctx.createBuffer(1,rate*duration,rate),samples=buffer.getChannelData(0);
  // Overlap short, pitched shouts with different vowels and onsets.
  for(let voice=0;voice<56;voice++){
    const start=Math.floor(Math.random()*samples.length),length=.35+Math.random()*.95;
    const pitch=105+Math.random()*155,drift=10+Math.random()*60;
    const vowel=580+Math.random()*360;
    for(let i=0;i<length*rate;i++){
      const t=i/rate,progress=t/length;
      const phase=2*Math.PI*(pitch*t+drift*t*t*.5/length);
      const syllable=Math.sin(phase)*.24+Math.sin(phase*2)*.14+Math.sin(phase*3)*.1;
      const formant=Math.sin(2*Math.PI*vowel*t)*(.42+.36*Math.sin(phase));
      const envelope=Math.sin(Math.PI*progress)**1.4;
      samples[(start+i)%samples.length]+=(syllable+formant*.36)*envelope*.13;
    }
  }
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
  source.buffer=buffer;source.loop=true;
  filter.type='lowpass';filter.frequency.value=1340;gain.gain.value=0;
  source.connect(filter).connect(gain).connect(master);source.start();
  return gain;
}
function makeEngine(){
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
  return {ctx,master,beds,crowd:makeCrowd(ctx,master)};
}
export function mixSound(destination:Destination){
  if(!engine)return;
  const {ctx,beds,crowd}=engine;
  beds.forEach((bed,i)=>bed.gain.setTargetAtTime(mixes[destination][i],ctx.currentTime,.72));
  crowd.gain.setTargetAtTime(destination==='stadium'?.105:0,ctx.currentTime,.85);
}
export async function setAudio(enabled:boolean,destination:Destination){
  const request=++revision;
  if(enabled){engine??=makeEngine();mixSound(destination);await engine.ctx.resume()}
  if(engine&&request===revision)engine.master.gain.setTargetAtTime(enabled?.72:0,engine.ctx.currentTime,.21);
}
