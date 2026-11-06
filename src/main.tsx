import React,{Suspense,lazy,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {animate} from 'motion/mini';
import {ArrowLeft,ArrowRight,Volume2,VolumeX,Mountain,House,Building2,Trees,Trophy,Heart,SkipForward,MoveUpRight,Minus,Plus} from 'lucide-react';
import {sceneIds,scenes,type Destination} from './content';
import {useExperience} from './store';
import {mixSound,setAudio} from './audio';
import {Details} from './Details';
import {useReducedMotion} from './world/motion';
import './style.css';

const World=lazy(()=>import('./world/World').then(module=>({default:module.World})));
const icons={office:House,city:Building2,stadium:Trophy,nature:Trees,family:Heart};
function linkedArchive():'office'|'city'|null{
  if(location.hash==='#projects')return 'office';
  if(location.hash==='#work')return 'city';
  return null;
}

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
function IslandIllustration(){return <img className="illustration" src={`${import.meta.env.BASE_URL}island-illustration.svg`} width="760" height="480" alt=""/>}
function Dock({active,move}: {active:Destination|null;move:(d:Destination)=>void}){
  const index=active&&active!=='overview'?sceneIds.indexOf(active)+1:0;
  return <nav className="dock" aria-label="Explore destinations" style={{'--dock-index':index} as React.CSSProperties}>
    <span className="dock-highlight" aria-hidden="true"/>
    <button className="dock-item" onClick={()=>move('overview')} aria-label="Island overview" aria-current={active==='overview'?'page':undefined}><Mountain size={19} aria-hidden="true" focusable="false"/><span>Overview</span></button>
    {sceneIds.map(id=>{const Icon=icons[id];return <button key={id} className="dock-item" data-destination={id} onClick={()=>move(id)} aria-current={active===id?'page':undefined}><Icon size={19} aria-hidden="true" focusable="false"/><span>{scenes[id].label}</span></button>})}
  </nav>;
}
function App(){
  const mode=useExperience(s=>s.mode),destination=useExperience(s=>s.destination),target=useExperience(s=>s.target),pending=useExperience(s=>s.pending);
  const go=useExperience(s=>s.go),skip=useExperience(s=>s.skip),ready=useExperience(s=>s.ready),failed=useExperience(s=>s.failed);
  const returnToIntro=useExperience(s=>s.returnToIntro);
  const sound=useExperience(s=>s.sound),setSound=useExperience(s=>s.setSound),panelOpen=useExperience(s=>s.panelOpen),togglePanel=useExperience(s=>s.togglePanel);
  const archive=useExperience(s=>s.archive),openArchive=useExperience(s=>s.openArchive),closeArchive=useExperience(s=>s.closeArchive);
  const [directArchive,setDirectArchive]=useState(linkedArchive);
  const [loadWorld,setLoadWorld]=useState(()=>!linkedArchive());
  const [audioError,setAudioError]=useState(false);
  const [available]=useState(supportsWebGL);
  const fallback=failed||!available,loading=loadWorld&&!fallback&&!ready;
  const [revealComplete,setRevealComplete]=useState(false);
  const revealing=loadWorld&&ready&&!fallback&&!revealComplete;
  const scene=destination==='overview'?null:scenes[destination],active=pending??(mode==='welcome'?null:mode==='transitioning'?target:destination);
  const move=(id:Destination)=>go(id);
  const overviewTitle=useRef<HTMLHeadingElement>(null),enterFocus=useRef(false);
  const welcome=useRef<HTMLElement>(null);
  const reducedMotion=useReducedMotion();
  useLayoutEffect(()=>{
    const intro=welcome.current;
    if(!intro||reducedMotion)return;
    const beats=[
      ['.welcome-avatar',0,.55,'translateY(14px) scale(.94)'],
      ['#welcome-title > :nth-child(1)',.71,.4,'translateY(16px) scale(.94)'],
      ['#welcome-title > :nth-child(2)',1.32,.3,'translateY(9px)'],
      ['#welcome-title > :nth-child(3)',1.43,.34,'translateY(9px)'],
      ['.eyebrow',1.97,.32,'translateY(6px)'],
      ['.welcome-bio > :first-child',2.09,.34,'translateY(5px)'],
      ['.welcome-bio > :last-child',2.23,.34,'translateY(5px)'],
    ] as const;
    const animations=beats.map(([selector,delay,duration,from])=>animate(
      intro.querySelectorAll(selector),
      {opacity:[0,1],transform:[from,'none']},
      {delay,duration,ease:[.2,.72,.22,1],transform:{delay,duration,ease:[.22,1.48,.44,1]}},
    ));
    return ()=>animations.forEach(animation=>animation.cancel());
  },[mode,reducedMotion]);
  useEffect(()=>{if(mode==='overview'&&enterFocus.current){overviewTitle.current?.focus({preventScroll:true});enterFocus.current=false}},[mode]);
  useEffect(()=>{if(!available)useExperience.getState().fail()},[available]);
  useEffect(()=>{
    if(!revealing)return;
    const timeout=window.setTimeout(()=>setRevealComplete(true),700);
    return ()=>window.clearTimeout(timeout);
  },[revealing]);
  useEffect(()=>mixSound(destination),[destination]);
  useEffect(()=>{
    const sync=()=>{
      const linked=linkedArchive();
      setDirectArchive(linked);
      if(!linked)setLoadWorld(true);
    };
    window.addEventListener('hashchange',sync);
    return ()=>window.removeEventListener('hashchange',sync);
  },[]);
  function closeDirectArchive(){
    history.replaceState(history.state,'',location.pathname+location.search);
    setDirectArchive(null);
    setLoadWorld(true);
  }
  async function toggleSound(){
    const enabled=!sound;setSound(enabled);setAudioError(false);
    try{await setAudio(enabled,destination)}catch{setSound(false);setAudioError(true)}
  }
  return <main className={`app mode-${mode}${fallback?' guide-mode':''}${loading?' is-loading':''}${revealing?' is-revealing':''}`}>
    <div className="world-canvas" ref={node=>{if(node)node.inert=loading}}>{fallback||!loadWorld?<IslandIllustration/>:<WorldBoundary><Suspense fallback={null}><World/></Suspense></WorldBoundary>}</div>
    <div className="wash" aria-hidden="true"/>
    <header className="topbar">
      <button className="brand" onClick={()=>{enterFocus.current=false;returnToIntro()}} aria-label="d8x.dev, back to intro" title="Back to intro"><img className="brand-symbol" src={`${import.meta.env.BASE_URL}favicon.svg`} width="28" height="28" alt=""/><span className="brand-name">d8x.dev</span></button>
      <div className="header-actions">
        <span className="edition">DEAN / DEVELOPER PORTFOLIO</span>
        <button className="icon-button" onClick={toggleSound} aria-label="Ambient sound" aria-pressed={sound} title={sound?'Mute ambient sound':'Enable ambient sound'}>{sound?<Volume2 size={19} aria-hidden="true" focusable="false"/>:<VolumeX size={19} aria-hidden="true" focusable="false"/>}</button>
      </div>
    </header>
    {mode==='welcome'&&<section className="welcome" ref={welcome} aria-labelledby="welcome-title">
      <img className="welcome-avatar" src={`${import.meta.env.BASE_URL}dean-portrait.jpg`} width="96" height="96" alt="Photo of Dean"/>
      <div className="eyebrow">SENIOR FRONTEND ENGINEER</div>
      <h1 id="welcome-title"><span>Hi,</span>{' '}<span>I’m</span>{' '}<i>Dean.</i></h1>
      <div className="welcome-bio">
        <p>I build fast, accessible websites and apps with React, React Native and TypeScript. I enjoy the design and engineering work that makes a complicated task feel simple.</p>
        <p>Lately I’ve been building with Next.js and Expo. The island brings together some of that work and a few things I care about outside it.</p>
      </div>
      <div className="welcome-actions">
        <button className="primary-button" onClick={()=>{enterFocus.current=true;move('overview')}}>{fallback?'Explore the guide':'Explore my portfolio'} <ArrowRight size={18} aria-hidden="true" focusable="false"/></button>
        <div className="archive-shortcuts">
          <a href="#projects" aria-haspopup="dialog">View projects</a>
          <a href="#work" aria-haspopup="dialog">Work history</a>
        </div>
      </div>
      <nav className="profile-links" aria-label="Profiles and credits">
        <a href="https://www.linkedin.com/in/dean-simcox/" target="_blank" rel="noopener noreferrer">LinkedIn <MoveUpRight size={13} aria-hidden="true" focusable="false"/></a>
        <a href="https://github.com/deansimcox" target="_blank" rel="noopener noreferrer">GitHub <MoveUpRight size={13} aria-hidden="true" focusable="false"/></a>
        <a className="intro-credits" href={`${import.meta.env.BASE_URL}credits.html`}>Asset credits</a>
      </nav>
      {fallback&&<span className="loading">3D is unavailable. The illustrated guide is open.</span>}
    </section>}
    {mode==='transitioning'&&<div className="transition-status" role="status"><span className="pulse-dot"/> {target==='overview'?'Back to the island':`Travelling to ${scenes[target].label}`} <button onClick={skip}><SkipForward size={16} aria-hidden="true" focusable="false"/> Skip</button></div>}
    {mode==='overview'&&<section className="overview-intro" aria-labelledby="overview-title"><div className="eyebrow">MY PORTFOLIO</div><h2 id="overview-title" ref={overviewTitle} tabIndex={-1}>Work &amp;<br/> <i>life.</i></h2><p>{fallback?'Pick a stop to explore my work and life away from the desk.':'Drag to turn the island. Scroll or pinch to zoom.'}</p></section>}
    {scene&&<section hidden={mode!=='scene'} className={`scene-panel${panelOpen?'':' collapsed'}`} aria-labelledby={panelOpen?'scene-title':undefined} aria-label={panelOpen?undefined:scene.title}>
      <div className="panel-top">{panelOpen?<span className="eyebrow">{scene.index} / 05 <span className="chapter-dot" style={{background:scene.color}}/></span>:<span className="collapsed-label" aria-hidden="true">{scene.title}</span>}<button className="panel-toggle" onClick={togglePanel} aria-expanded={panelOpen} aria-controls="scene-copy" aria-label={panelOpen?'Hide story':'Read story'}>{panelOpen?<Minus size={18} aria-hidden="true" focusable="false"/>:<Plus size={18} aria-hidden="true" focusable="false"/>}</button></div>
      <div className="scene-panel-body"><div id="scene-copy" ref={node=>{if(node)node.inert=!panelOpen}} aria-hidden={!panelOpen}><div className="eyebrow">{scene.eyebrow}</div><h2 id="scene-title">{scene.title}</h2><p>{scene.description}</p>
      {(destination==='office'||destination==='city')&&<button className="detail-button" onClick={()=>openArchive(destination)}>{destination==='office'?'View project details':'View work history'} <MoveUpRight size={15} aria-hidden="true" focusable="false"/></button>}
      <button className="text-button" onClick={()=>move('overview')}><ArrowLeft size={16} aria-hidden="true" focusable="false"/> Back to the island</button></div>
      </div>
    </section>}
    {audioError&&<p className="audio-note" role="status">Ambient sound is unavailable on this device.</p>}
    {directArchive?<Details key={directArchive} id={directArchive} direct onClose={closeDirectArchive}/>:archive&&<Details key={archive.id} {...archive} onClose={closeArchive}/>}
    {(loading||revealing)&&<div className="island-loading" role={loading?'status':undefined} aria-hidden={!loading}><span className="loading-track" aria-hidden="true"/><span>The island is coming into view</span><small>Loading the 3D scenery</small></div>}
    <Dock active={active} move={move}/>
    <footer className="edge-mark"><svg width="9" height="9" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M6 0Q7 5 12 6Q7 7 6 12Q5 7 0 6Q5 5 6 0Z" fill="currentColor"/></svg> DEAN / SENIOR FRONTEND ENGINEER</footer>
  </main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
