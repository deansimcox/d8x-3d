type Cue=(t:number,length:number)=>number;
const tau=Math.PI*2;
const noise=()=>Math.random()*2-1;
const chirp=(pitch:number,sweep:number,texture=0):Cue=>(t,length)=>{
  const progress=t/length,phase=tau*(pitch*t+sweep*t*progress*.5);
  const envelope=Math.sin(Math.PI*progress)**1.7;
  return envelope*(Math.sin(phase)+texture*(Math.sin(phase*2.03)*.45+noise()*.3));
};
function tap(t:number){
  return (noise()*.34+Math.sin(tau*520*t)*.33)*Math.exp(-t*95)
    +Math.sin(tau*174*t)*Math.exp(-t*48)*.35;
}
function step(t:number){
  return Math.min(1,t/.011)*Math.exp(-t*36)*(noise()*.17+Math.sin(tau*(117*t-140*t*t))*.55);
}
export function sceneCue(ctx:AudioContext,scene:'office'|'city'|'nature'|'family'){
  const rate=22050,seconds=32,buffer=ctx.createBuffer(2,rate*seconds,rate);
  const left=buffer.getChannelData(0),right=buffer.getChannelData(1);
  function add(start:number,length:number,gain:number,pan:number,cue:Cue){
    const offset=Math.round(start*rate);
    for(let i=0;i<length*rate&&offset+i<left.length;i++){
      const sample=cue(i/rate,length)*gain;
      left[offset+i]+=sample*Math.sqrt((1-pan)/2);
      right[offset+i]+=sample*Math.sqrt((1+pan)/2);
    }
  }
  if(scene==='office'){
    for(const start of [.7,3.6,8.9,13.6,16.2,22,25,29.5]){
      let time=start;
      for(let i=0,count=3+Math.floor(Math.random()*7);i<count;i++){
        add(time,.065,i===count-1?.54:.32+Math.random()*.15,.16,tap);
        time+=.08+Math.random()*.17;
      }
    }
  }else if(scene==='nature'){
    for(const [start,pan,pitch] of [[.8,-.46,1890],[4.7,.55,2360],[10,-.7,2050],[16.1,.22,1770],[20.4,.6,2560],[27.3,-.38,2050]]){
      add(start,.11,.32,pan,chirp(pitch,630,.12));
      add(start+.19,.145,.25,pan,chirp(pitch+360,-710,.12));
      add(start+.39,.09,.17,pan,chirp(pitch-160,410,.12));
    }
  }else if(scene==='family'){
    for(const [start,pan] of [[1.2,-.44],[7.7,.25],[13.8,-.21],[21,.48],[28.2,-.51]]){
      for(let i=0;i<3;i++){
        const pitch=430+Math.random()*95;
        add(start+i*.15,.1+i*.018,.46-i*.074,pan,chirp(pitch,95+i*75,.9));
      }
    }
  }else{
    for(const [start,pan] of [[.9,-.45],[6.4,.31],[14,.53],[20.2,-.31],[27,.05]]){
      for(let i=0;i<5;i++)add(start+i*.48,.12,.4*Math.sin((i+1)*Math.PI/6),pan,step);
    }
  }
  return buffer;
}
