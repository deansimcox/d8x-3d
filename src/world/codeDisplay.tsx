import {useEffect,useMemo,useRef} from 'react';
import type {ReactNode} from 'react';
import {useFrame} from '@react-three/fiber';
import {CanvasTexture,SRGBColorSpace} from 'three';
import {useReducedMotion} from './motion';
import {useExperience} from '../store';
import {Block} from './props';
import type {Vec3} from './layout';

type ScreenKind='editor'|'preview'|'tests';
const checkIcon=new Path2D('M2 7l4 4 7-8');
const chevronIcon=new Path2D('m5 3 5 4-5 4');
const editingIcon=new Path2D('M5 7a2 2 0 1 0 4 0 2 2 0 1 0-4 0');
const source=[
  ['export function Island() {','#c8adf1'],
  ['  return <World','#e3dfbf'],
  ['    terrain={sculpt(seed)}','#8fd8be'],
  ['    sky="golden-hour"','#e3dfbf'],
  ['  />;','#c8adf1'],
  ['}','#c8adf1'],
] as const;

function drawScreen(ctx:CanvasRenderingContext2D,kind:ScreenKind,step:number){
  const rect=(x:number,y:number,w:number,h:number,color:string)=>{
    ctx.fillStyle=color;
    ctx.fillRect(x,y,w,h);
  };
  const text=(value:string,x:number,y:number,color:string)=>{
    ctx.fillStyle=color;
    ctx.fillText(value,x,y);
  };
  const icon=(path:Path2D,x:number,y:number,color:string)=>{
    ctx.save();
    ctx.translate(x,y);
    ctx.strokeStyle=color;
    ctx.lineWidth=2;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.stroke(path);
    ctx.restore();
  };
  rect(0,0,480,256,'#192b32');
  rect(0,0,480,32,'#28434b');
  ctx.font='17px monospace';
  text({editor:'Island.tsx',preview:'localhost / preview',tests:'Terminal / checks'}[kind],16,22,'#b0c8be');

  if(kind==='editor'){
    let remaining=step*2;
    source.forEach(([line,color],i)=>{
      text(String(i+1),16,58+i*27,'#759092');
      text(line.slice(0,remaining),49,58+i*27,color);
      remaining=Math.max(0,remaining-line.length);
    });
    const complete=step>55;
    icon(complete?checkIcon:editingIcon,16,224,'#91d4ae');
    text(complete?'build complete':'editing',44,237,'#91d4ae');
  }else if(kind==='preview'){
    rect(15,44,450,199,'#eae5d1');
    rect(29,57,420,19,'#314e46');
    const width=step<45?420:300;
    const inset=(420-width)/2;
    rect(29+inset,86,width,83,'#abc7bb');
    ctx.fillStyle='#637f68';
    ctx.beginPath();
    ctx.moveTo(54+inset,169);
    ctx.lineTo(129+inset,111);
    ctx.lineTo(191+inset,169);
    ctx.fill();
    text('The island',203+inset,132,'#273c37');
    for(let i=0;i<3;i++)rect(29+inset+i*(width/3),182,width/3-9,43,i===Math.floor(step/18)%3?'#d6a37a':'#c4cbb7');
  }else{
    ctx.font='21px monospace';
    text('$ npm run check',16,67,'#f0d29a');
    ['TypeScript','Accessibility','Production build'].forEach((label,i)=>{
      const passed=step>16+i*16;
      icon(passed?checkIcon:chevronIcon,18,97+i*44,passed?'#92d8ad':'#c7a776');
      text(label,48,112+i*44,'#e4e6d8');
    });
  }
}

function Screen({kind,position,size,onSelect}:{
  kind:ScreenKind;position:Vec3;size:[number,number];onSelect?:()=>void;
}){
  const reduced=useReducedMotion(),previous=useRef(-1);
  const {ctx,texture}=useMemo(()=>{
    const canvas=document.createElement('canvas');
    canvas.width=480;canvas.height=256;
    const ctx=canvas.getContext('2d')!;
    drawScreen(ctx,kind,76);
    const texture=new CanvasTexture(canvas);
    texture.colorSpace=SRGBColorSpace;
    return {ctx,texture};
  },[kind]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  useFrame(({clock})=>{
    const {destination,target}=useExperience.getState();
    const active=destination==='office'||target==='office';
    const step=reduced||!active?76:Math.floor(clock.elapsedTime*7)%88;
    if(step===previous.current)return;
    previous.current=step;
    drawScreen(ctx,kind,step);
    texture.needsUpdate=true;
  });
  return <mesh position={position} onClick={onSelect?event=>{event.stopPropagation();onSelect()}:undefined}>
    <planeGeometry args={size}/><meshBasicMaterial map={texture} toneMapped={false}/>
  </mesh>;
}

function Monitor({position,rotation=0,children}:{position:Vec3;rotation?:number;children:ReactNode}){
  return <group position={position} rotation={[0,rotation,0]}>
    <Block position={[0,.035,0]} size={[.49,.07,.31]} color="#303936"/>
    <Block position={[0,.22,-.067]} size={[.105,.35,.085]} color="#303936"/>
    <Block position={[0,.58,0]} size={[1.25,.69,.078]} color="#252e2e"/>
    {children}
  </group>;
}

export function DeveloperScreens({onSelect}:{onSelect?:()=>void}){
  return <>
    <Monitor position={[.69,2.08,-1.37]}>
      <Screen kind="editor" position={[0,.59,.041]} size={[1.19,.635]} onSelect={onSelect}/>
    </Monitor>
    <Monitor position={[1.97,2.08,-1.37]} rotation={-.11}>
      <Screen kind="preview" position={[0,.59,.041]} size={[1.19,.635]} onSelect={onSelect}/>
    </Monitor>
    <group position={[-.30,2.08,-.99]} rotation={[0,.14,0]}>
      <Block position={[0,.023,.073]} size={[.67,.046,.47]} color="#67726d"/>
      <Block position={[0,.049,.025]} size={[.57,.009,.20]} color="#303936"/>
      <Block position={[0,.048,.21]} size={[.20,.008,.12]} color="#87918a"/>
      <group position={[0,.22,-.165]} rotation={[-.18,0,0]}>
        <Block position={[0,0,0]} size={[.67,.39,.033]} color="#343e3b"/>
        <Screen kind="tests" position={[0,.003,.018]} size={[.62,.34]} onSelect={onSelect}/>
      </group>
    </group>
  </>;
}
