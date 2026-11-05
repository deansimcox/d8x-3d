import React,{Suspense,lazy,useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowLeft,ArrowRight,Volume2,VolumeX,Mountain,House,Building2,Trees,Trophy,Heart,SkipForward,MoveUpRight,Map} from 'lucide-react';
import {sceneIds,scenes,type Destination} from './content';
import {useExperience} from './store';
import {mixSound,setAudio} from './audio';
import {Details} from './Details';
import './style.css';

const World=lazy(()=>import('./world/World').then(module=>({default:module.World})));
const icons={office:House,city:Building2,stadium:Trophy,nature:Trees,family:Heart};

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
function Dock({active,move}: {active:Destination;move:(d:Destination)=>void}){
  return <nav className="dock" aria-label="Explore destinations">
    <button className="dock-item" onClick={()=>move('overview')} aria-label="Island overview" aria-current={active==='overview'?'page':undefined}><Mountain size={19}/><span>Overview</span></button>
    {sceneIds.map(id=>{const Icon=icons[id];return <button key={id} className="dock-item" onClick={()=>move(id)} aria-current={active===id?'page':undefined}><Icon size={19}/><span>{scenes[id].label}</span></button>})}
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
      <button ref={overviewButton} className="brand" onClick={()=>move('overview')} aria-label="d8x.dev, island overview"><span className="brand-symbol" aria-hidden="true">✳</span><span className="brand-name">d8x.dev</span></button>
      <div className="header-actions">
        <span className="edition">DEAN / DEVELOPER PORTFOLIO</span>
        {available&&!failed&&<button className="icon-button" aria-label={guide?'Show 3D world':'Open the illustrated guide'} aria-pressed={guide} title={guide?'Show 3D world':'Illustrated guide'} onClick={()=>setGuide(!guide)}><Map size={19}/></button>}
        <button className="icon-button" onClick={toggleSound} aria-label="Ambient sound" aria-pressed={sound} title={sound?'Mute ambient sound':'Enable ambient sound'}>{sound?<Volume2 size={19}/>:<VolumeX size={19}/>}</button>
      </div>
    </header>
    {mode==='welcome'&&<section className="welcome" aria-labelledby="welcome-title">
      <img className="welcome-avatar" src={`${import.meta.env.BASE_URL}dean-portrait.jpg`} width="96" height="96" alt="Photo of Dean"/>
      <div className="eyebrow">SENIOR FRONTEND ENGINEER</div>
      <h1 id="welcome-title">Hi, I’m <i>Dean.</i></h1>
      <p>I build fast, accessible websites and apps with React, React Native and TypeScript. I enjoy finding the small design and engineering details that make a complicated task feel simple.</p>
      <p>Right now I’m building with Next.js and Expo. You’ll find some of my work here, along with a few things I love away from the desk.</p>
      <button className="primary-button" onClick={()=>{enterFocus.current=true;move('overview')}}>{fallback?'Explore the guide':'Explore my portfolio'} <ArrowRight size={18}/></button>
      <nav className="profile-links" aria-label="Find Dean online">
        <a href="https://www.linkedin.com/in/dean-simcox/" target="_blank" rel="noopener noreferrer">LinkedIn <MoveUpRight size={13} aria-hidden="true"/></a>
        <a href="https://github.com/deansimcox" target="_blank" rel="noopener noreferrer">GitHub <MoveUpRight size={13} aria-hidden="true"/></a>
      </nav>
      {fallback&&!guide&&<span className="loading">3D is unavailable. The illustrated guide is open.</span>}
    </section>}
    {mode==='transitioning'&&<div className="transition-status" role="status"><span className="pulse-dot"/> {target==='overview'?'Back to the island':`On the way to ${scenes[target].title}`} <button onClick={skip}><SkipForward size={16}/> Skip</button></div>}
    {mode==='overview'&&<section className="overview-intro" aria-labelledby="overview-title"><div className="eyebrow">MY PORTFOLIO</div><h2 id="overview-title">Work &amp;<br/> <i>life.</i></h2><p>Start with a project, my work history or a stop away from the desk.</p></section>}
    {mode==='scene'&&scene&&<section className={`scene-panel${panelOpen?'':' collapsed'}`} key={destination} aria-labelledby={panelOpen?'scene-title':undefined} aria-label={panelOpen?undefined:scene.title}>
      <div className="panel-top"><span className="eyebrow">{scene.index} / 05 <span className="chapter-dot" style={{background:scene.color}}/></span><button className="panel-toggle" onClick={togglePanel} aria-expanded={panelOpen} aria-controls="scene-copy" aria-label={panelOpen?'Hide story':'Read story'}>{panelOpen?'−':'+'}</button></div>
      <div id="scene-copy" hidden={!panelOpen}><div className="eyebrow">{scene.eyebrow}</div><h2 id="scene-title">{scene.title}</h2><p>{scene.description}</p>
      {(destination==='office'||destination==='city')&&<button className="detail-button" onClick={()=>openArchive(destination)}>{destination==='office'?'View project details':'View work history'} <MoveUpRight size={15}/></button>}
      <button className="text-button" onClick={()=>move('overview')}><ArrowLeft size={16}/> Back to the island</button></div>
      {!panelOpen&&<span className="collapsed-label">{scene.title}</span>}
    </section>}
    {audioError&&<p className="audio-note" role="status">Ambient sound is unavailable on this device.</p>}
    {archive&&<Details {...archive} onClose={closeArchive}/>}
    {loading&&<div className="island-loading" role="status"><span className="loading-track" aria-hidden="true"/><span>The island is coming into view</span><small>Loading the 3D scenery</small></div>}
    <Dock active={active} move={move}/>
    <footer className="edge-mark"><span>✦</span> DEAN / SENIOR FRONTEND ENGINEER</footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
