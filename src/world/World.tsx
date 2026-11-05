import {Suspense,useEffect,useLayoutEffect,useRef} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import * as THREE from 'three';
import {sceneIds,scenes} from '../content';
import {useExperience} from '../store';
import {anchors,poses} from './layout';
import {CameraRig} from './CameraRig';
import {Terrain} from './terrain';
import {Atmosphere,Avatar} from './atmosphere';
import {Vegetation} from './vegetation';
import {Workshop,Home} from './cottages';
import {City} from './city';
import {Stadium} from './stadium';
import {Picnic,Trails,Waterside} from './waterside';
import {useReducedMotion} from './motion';

function Markers({terrain}: {terrain:React.RefObject<THREE.Group>}) {
  const mode=useExperience(s=>s.mode),go=useExperience(s=>s.go);
  const {size,invalidate}=useThree();
  // The HTML labels mount in a separate DOM root. Request an extra frame after
  // commit so they follow the resized camera even in demand-rendering mode.
  useLayoutEffect(()=>{if(mode==='overview')invalidate(2)},[mode,size.width,size.height,invalidate]);
  if(mode!=='overview')return null;
  const names=['Workshop','Little City','Matchday','Riverside','Home'];
  return <group>{sceneIds.map((id,i)=><Html key={`${id}:${size.width}x${size.height}`} position={[anchors[id][0],anchors[id][1]+(id==='nature'?8.8:10),anchors[id][2]]} center occlude={[terrain]} zIndexRange={[3,1]}>
    <button className="world-marker" onClick={()=>go(id)} aria-label={'Visit '+scenes[id].title}><span className="marker-dot" style={{backgroundColor:scenes[id].color}}/><span className="marker-name">{names[i]}</span><span className="marker-number" aria-hidden="true">{scenes[id].index}</span></button>
  </Html>)}</group>;
}
function Ready(){
  const setReady=useExperience(s=>s.setReady),{gl,invalidate}=useThree();
  const welcome=useExperience(s=>s.mode==='welcome');
  useEffect(()=>{setReady(true);gl.shadowMap.autoUpdate=false;return()=>{setReady(false);gl.shadowMap.autoUpdate=true}},[setReady,gl]);
  useEffect(()=>{gl.shadowMap.needsUpdate=true;invalidate()},[gl,invalidate,welcome]);
  return null;
}
function ContextWatcher(){
  const {gl}=useThree(),fail=useExperience(s=>s.fail);
  useEffect(()=>{const canvas=gl.domElement;canvas.setAttribute('aria-hidden','true');canvas.addEventListener('webglcontextlost',fail);return()=>canvas.removeEventListener('webglcontextlost',fail)},[gl,fail]);return null;
}
function FrameMetrics(){
  const elapsed=useRef(0),frames=useRef(0);
  const enabled=import.meta.env.DEV||new URLSearchParams(location.search).has('metrics');
  useFrame(({gl},delta)=>{
    if(!enabled)return;
    elapsed.current+=delta;frames.current++;
    if(elapsed.current>2){gl.domElement.dataset.renderStats=JSON.stringify({fps:Math.round(frames.current/elapsed.current),calls:gl.info.render.calls,triangles:gl.info.render.triangles,textures:gl.info.memory.textures,geometries:gl.info.memory.geometries});elapsed.current=0;frames.current=0}
  });return null;
}
function Scene(){
  const terrain=useRef<THREE.Group>(null);
  const welcome=useExperience(s=>s.mode==='welcome');
  const shadowSize=window.matchMedia('(max-width: 800px)').matches?1024:2048;
  return <>
    <fog attach="fog" args={['#d9e0cd',123,265]}/>
    <hemisphereLight args={['#fff5e2','#83947d',1.75]}/>
    <directionalLight position={[-65,64,40]} intensity={2.13} color="#ffe3bb" castShadow shadow-mapSize={[shadowSize,shadowSize]} shadow-camera-left={-69} shadow-camera-right={69} shadow-camera-top={65} shadow-camera-bottom={-66} shadow-camera-far={200} shadow-normalBias={.055} shadow-bias={-.0003}/>
    <directionalLight position={[44,24,-45]} intensity={.75} color="#c5ddd1"/>
    <Atmosphere/><group ref={terrain}><Terrain/></group><Trails/>
    <Suspense fallback={null}><Vegetation/><Waterside/><Workshop/><City/><Stadium/><Picnic/><Home/>
    {welcome&&<Avatar/>}<Markers terrain={terrain}/><Ready/></Suspense>
  </>;
}
export function World(){
  const reduced=useReducedMotion();
  const dpr=Math.min(window.devicePixelRatio||1,window.matchMedia('(max-width: 800px)').matches?1.15:1.5);
  return <Canvas shadows="soft" dpr={dpr} frameloop={reduced?'demand':'always'} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} camera={{position:poses.welcome.position,fov:42,near:.2,far:720}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.05;gl.outputColorSpace=THREE.SRGBColorSpace}}>
    <CameraRig/><ContextWatcher/><FrameMetrics/><Scene/>
  </Canvas>;
}
