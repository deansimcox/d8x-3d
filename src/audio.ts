import type {Destination} from './content';

// Low-level synthesized beds. The AudioContext is created and resumed in the
// sound button's click handler, so the island is silent on arrival.
const mixes:Record<Destination,readonly [number,number,number]>={
  overview:[.13,.015,.014],office:[.1,.012,.024],city:[.045,.012,.041],
  stadium:[.035,.018,.082],nature:[.045,.16,.014],family:[.082,.015,.023],
};
let engine:{ctx:AudioContext;master:GainNode;beds:GainNode[]}|undefined;
let revision=0;
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
  return {ctx,master,beds};
}
export function mixSound(destination:Destination){
  if(!engine)return;
  const {ctx,beds}=engine;
  beds.forEach((bed,i)=>bed.gain.setTargetAtTime(mixes[destination][i],ctx.currentTime,.72));
}
export async function setAudio(enabled:boolean,destination:Destination){
  const request=++revision;
  if(enabled){engine??=makeEngine();mixSound(destination);await engine.ctx.resume()}
  if(engine&&request===revision)engine.master.gain.setTargetAtTime(enabled?.72:0,engine.ctx.currentTime,.21);
}
