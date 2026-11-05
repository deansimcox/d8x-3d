import React,{Suspense,lazy,useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowLeft,ArrowRight,Volume2,VolumeX,Mountain,House,Building2,Trees,Trophy,Heart,SkipForward,MoveUpRight,X,Map} from 'lucide-react';
import {archives,sceneIds,scenes,type Destination,type SceneId} from './content';
import {useExperience} from './store';
import {mixSound,setAudio} from './audio';
import './style.css';

const World=lazy(()=>import('./world/World').then(module=>({default:module.World})));
const icons={office:House,city:Building2,stadium:Trophy,nature:Trees,family:Heart};
const labels:Record<SceneId,string>={office:'Workshop',city:'City',stadium:'Matchday',nature:'Riverside',family:'Home'};

class WorldBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(){useExperience.getState().fail()}
  render(){return this.state.failed?null:this.props.children}
}
function supportsWebGL(){
  try{
    const context=document.createElement('canvas').getContext('webgl2');
    if(!context)return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();return true;
  }catch{return false}
}
function IslandIllustration(){return <svg className="illustration" viewBox="0 0 700 420" aria-hidden="true">
  <defs><linearGradient id="earth" x2="0" y2="1"><stop stopColor="#a29c7e"/><stop offset="1" stopColor="#687a69"/></linearGradient></defs>
  <path d="M28 202 Q88 176 139 190 Q117 156 193 165 Q225 156 254 191 M479 268 Q552 246 602 264 Q642 252 685 271" fill="none" stroke="#f9f5df" strokeWidth="8" strokeLinecap="round" opacity=".7"/>
  <path d="M99 222 L158 305 270 333 347 389 466 342 554 298 617 224 526 185 358 162 179 177Z" fill="url(#earth)"/>
  <path d="M99 222 179 177 358 162 526 185 617 224 520 249 384 259 247 253Z" fill="#a2b181"/>
  <path d="M232 215 341 57 429 187 468 217 351 235Z" fill="#7b8e80"/><path d="M305 112 341 57 381 117 358 111 341 128 330 109Z" fill="#f5eee0"/>
  <path d="M342 64 351 234 429 187Z" fill="#c8c5ab" opacity=".5"/><path d="M359 156 Q334 182 360 195 Q398 215 321 229 L282 252 290 305" fill="none" stroke="#b9dcd1" strokeWidth="7"/>
  {[[176,212],[210,224],[486,214],[521,226],[461,231],[203,197],[548,214]].map(([x,y],i)=><path key={x} d={`M${x-10} ${y} L${x} ${y-26-i%3*4} ${x+10} ${y}Z`} fill={i%2?'#64896b':'#537a60'}/>)}
</svg>}
function Details({id,entry,onClose}: {id:'office'|'city';entry?:number;onClose:()=>void}){
  const ref=useRef<HTMLDialogElement>(null);
  const entries=entry!==undefined&&archives[id][entry]?[archives[id][entry]]:archives[id];
  useEffect(()=>{ref.current?.showModal()},[]);
  return <dialog ref={ref} className="detail-modal" aria-labelledby="detail-title" onClose={onClose} onClick={e=>{if(e.target===e.currentTarget)ref.current?.close()}}>
    <div className="detail-inner">
      <button className="icon-button modal-close" aria-label="Close details" autoFocus onClick={()=>ref.current?.close()}><X size={20}/></button>
      <p className="eyebrow">{scenes[id].eyebrow}</p>
      <h2 id="detail-title">{id==='office'?'The work behind the windows.':'A city built from experience.'}</h2>
      {entries.length?entries.map(item=><article className="archive-entry" key={item.title}>
        <h3>{item.title}</h3>{item.period&&<span className="eyebrow">{item.period}</span>}
        {item.image&&<img src={item.image.src} alt={item.image.alt}/>}
        <p>{item.summary}</p>{item.tags&&<p>{item.tags.join(' · ')}</p>}
        {item.links?.map(link=><a key={link.href} href={link.href}>{link.label} <MoveUpRight size={14}/></a>)}
      </article>):<><p>{id==='office'?'The workshop is where project case studies will live. Check back for a closer look at the work.':'The city will trace the roles and projects that shaped my career. Check back as those chapters are added.'}</p>
      <span className="archive-note">{id==='office'?'Project archive':'Career archive'} · Coming soon</span></>}
      <button className="text-button" onClick={()=>ref.current?.close()}><ArrowLeft size={16}/> Return to the island</button>
    </div>
  </dialog>;
}
function Dock({active,move}: {active:Destination;move:(d:Destination)=>void}){
  return <nav className="dock" aria-label="Explore destinations">
    <button className="dock-item" onClick={()=>move('overview')} aria-label="Island overview" aria-current={active==='overview'?'page':undefined}><Mountain size={19}/><span>Overview</span></button>
    {sceneIds.map(id=>{const Icon=icons[id];return <button key={id} className="dock-item" onClick={()=>move(id)} aria-current={active===id?'page':undefined}><Icon size={19}/><span>{labels[id]}</span></button>})}
  </nav>;
}
function App(){
  const mode=useExperience(s=>s.mode),destination=useExperience(s=>s.destination),target=useExperience(s=>s.target);
  const go=useExperience(s=>s.go),skip=useExperience(s=>s.skip),ready=useExperience(s=>s.ready),failed=useExperience(s=>s.failed);
  const sound=useExperience(s=>s.sound),setSound=useExperience(s=>s.setSound),panelOpen=useExperience(s=>s.panelOpen),togglePanel=useExperience(s=>s.togglePanel);
  const archive=useExperience(s=>s.archive),openArchive=useExperience(s=>s.openArchive),closeArchive=useExperience(s=>s.closeArchive);
  const [guide,setGuide]=useState(()=>new URLSearchParams(location.search).get('view')==='guide');
  const [audioError,setAudioError]=useState(false);
  const [available]=useState(supportsWebGL);
  const fallback=failed||!available||guide,loading=!fallback&&!ready;
  const scene=destination==='overview'?null:scenes[destination],active=mode==='transitioning'?target:destination;
  const move=(id:Destination)=>go(id);
  const overviewButton=useRef<HTMLButtonElement>(null),enterFocus=useRef(false);
  useEffect(()=>{if(mode==='overview'&&enterFocus.current){overviewButton.current?.focus({preventScroll:true});enterFocus.current=false}},[mode]);
  useEffect(()=>{if(fallback&&mode==='transitioning')skip()},[fallback,mode,skip]);
  useEffect(()=>mixSound(destination),[destination]);
  async function toggleSound(){
    const enabled=!sound;setSound(enabled);setAudioError(false);
    try{await setAudio(enabled,destination)}catch{setSound(false);setAudioError(true)}
  }
  return <main className={`app mode-${mode}${fallback?' guide-mode':''}`}>
    <div className="world-canvas">{fallback?<IslandIllustration/>:<WorldBoundary><Suspense fallback={null}><World/></Suspense></WorldBoundary>}</div>
    <div className="wash" aria-hidden="true"/>
    <header className="topbar">
      <button ref={overviewButton} className="brand" onClick={()=>move('overview')} aria-label="Island overview"><span className="brand-symbol" aria-hidden="true">✳</span><span>THE WORLD<br/>BETWEEN THE LINES</span></button>
      <div className="header-actions">
        <span className="edition">A SMALL WORLD IN FIVE CHAPTERS</span>
        {available&&!failed&&<button className="icon-button" aria-label={guide?'Show 3D world':'Open the illustrated guide'} aria-pressed={guide} title={guide?'Show 3D world':'Illustrated guide'} onClick={()=>setGuide(!guide)}><Map size={19}/></button>}
        <button className="icon-button" onClick={toggleSound} aria-label="Ambient sound" aria-pressed={sound} title={sound?'Mute ambient sound':'Enable ambient sound'}>{sound?<Volume2 size={19}/>:<VolumeX size={19}/>}</button>
      </div>
    </header>
    {mode==='welcome'&&<section className="welcome" aria-labelledby="welcome-title">
      <div className="eyebrow">FIELD NOTES &nbsp; / &nbsp; VOL. 01</div>
      <h1 id="welcome-title">The world<br/> between <i>the lines.</i></h1>
      <p>A little island for the work I do, the places I go, and the things I come home to.</p>
      <button className="primary-button" onClick={()=>{enterFocus.current=true;move('overview')}}>{fallback?'Explore the guide':'Come on in'} <ArrowRight size={18}/></button>
      {loading&&<span className="loading" role="status"><span/> The island is coming into view</span>}
      {fallback&&!guide&&<span className="loading">3D is unavailable. The illustrated guide is open.</span>}
    </section>}
    {mode==='transitioning'&&<div className="transition-status" role="status"><span className="pulse-dot"/> {target==='overview'?'Back to the island':`On the way to ${scenes[target].title}`} <button onClick={skip}><SkipForward size={16}/> Skip</button></div>}
    {mode==='overview'&&<section className="overview-intro" aria-labelledby="overview-title"><div className="eyebrow">THE ISLAND &nbsp; / &nbsp; 01–05</div><h2 id="overview-title">Pick a place<br/> to <i>begin.</i></h2><p>{fallback?'Choose a destination from the dock.':'Choose a marker on the island, or use the dock.'}</p></section>}
    {mode==='scene'&&scene&&<section className={`scene-panel${panelOpen?'':' collapsed'}`} key={destination} aria-labelledby={panelOpen?'scene-title':undefined} aria-label={panelOpen?undefined:scene.title}>
      <div className="panel-top"><span className="eyebrow">{scene.index} / 05 <span className="chapter-dot" style={{background:scene.color}}/></span><button className="panel-toggle" onClick={togglePanel} aria-expanded={panelOpen} aria-controls="scene-copy" aria-label={panelOpen?'Hide story':'Read story'}>{panelOpen?'−':'+'}</button></div>
      <div id="scene-copy" hidden={!panelOpen}><div className="eyebrow">{scene.eyebrow}</div><h2 id="scene-title">{scene.title}</h2><p>{scene.description}</p>
      {(destination==='office'||destination==='city')&&<button className="detail-button" onClick={()=>openArchive(destination)}>{destination==='office'?'Project archive':'Career archive'} <MoveUpRight size={15}/></button>}
      <button className="text-button" onClick={()=>move('overview')}><ArrowLeft size={16}/> Back to the island</button></div>
      {!panelOpen&&<span className="collapsed-label">{scene.title}</span>}
    </section>}
    {audioError&&<p className="audio-note" role="status">Ambient sound is unavailable on this device.</p>}
    {archive&&<Details {...archive} onClose={closeArchive}/>}
    <Dock active={active} move={move}/>
    <footer className="edge-mark"><span>✦</span> FIVE PLACES, ONE LITTLE WORLD</footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
