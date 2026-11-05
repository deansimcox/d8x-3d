import {Suspense,useEffect,useLayoutEffect,useRef} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import * as THREE from 'three';
import {sceneIds,scenes} from '../content';
import {useExperience} from '../store';
import {anchors,poses} from './layout';
import {CameraRig} from './CameraRig';
import {Terrain} from './terrain';
import {Atmosphere,Avatar,dusk} from './atmosphere';
import {Vegetation} from './vegetation';
import {Workshop,Home} from './cottages';
import {City} from './city';
import {Stadium} from './stadium';
import {Picnic,Trails,Waterside} from './waterside';
import {useReducedMotion} from './motion';
import {windClock,windEnabled} from './wind';
import {WoodlandDeer} from './woodlandDeer';

function Wind(){
  const reduced=useReducedMotion();
  useFrame(({clock})=>{windClock.value=clock.elapsedTime;windEnabled.value=reduced?0:1},-2);
  return null;
}

function Markers({terrain}: {terrain:React.RefObject<THREE.Group>}) {
  const mode=useExperience(s=>s.mode),go=useExperience(s=>s.go);
  const {size,invalidate}=useThree();
  // The HTML labels mount in a separate DOM root. Request an extra frame after
  // commit so they follow the resized camera even in demand-rendering mode.
  useLayoutEffect(()=>{if(mode==='overview')invalidate(2)},[mode,size.width,size.height,invalidate]);
  if(mode!=='overview')return null;
  return <group>{sceneIds.map(id=><Html key={`${id}:${size.width}x${size.height}`} position={[anchors[id][0],anchors[id][1]+(id==='nature'?8.8:10),anchors[id][2]]} center occlude={[terrain]} zIndexRange={[3,1]}>
    <button className="world-marker" onClick={()=>go(id)}><span className="marker-dot" style={{backgroundColor:scenes[id].color}}/><span className="marker-name">{scenes[id].label}</span><span className="marker-number" aria-hidden="true">{scenes[id].index}</span></button>
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
  useEffect(()=>{
    const canvas=gl.domElement;
    canvas.tabIndex=0;
    canvas.setAttribute('aria-label','Island view. Drag or use arrow keys to look around. Press Home to recenter.');
    canvas.addEventListener('webglcontextlost',fail);
    return()=>canvas.removeEventListener('webglcontextlost',fail);
  },[gl,fail]);return null;
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
  const skyLight=useRef<THREE.HemisphereLight>(null),sun=useRef<THREE.DirectionalLight>(null),fill=useRef<THREE.DirectionalLight>(null);
  const welcome=useExperience(s=>s.mode==='welcome');
  const reduced=useReducedMotion();
  useFrame((_,delta)=>{
    const state=useExperience.getState();
    const night=(state.mode==='transitioning'?state.target:state.destination)==='stadium'?1:0;
    dusk.value=reduced?night:THREE.MathUtils.damp(dusk.value,night,2.5,delta);
    if(skyLight.current)skyLight.current.intensity=THREE.MathUtils.lerp(1.75,.52,dusk.value);
    if(sun.current)sun.current.intensity=THREE.MathUtils.lerp(2.13,.10,dusk.value);
    if(fill.current)fill.current.intensity=THREE.MathUtils.lerp(.75,.22,dusk.value);
  },-2);
  const shadowSize=window.matchMedia('(max-width: 800px)').matches?1024:2048;
  return <>
    <fog attach="fog" args={['#d9e0cd',123,265]}/>
    <hemisphereLight ref={skyLight} args={['#fff5e2','#83947d',1.75]}/>
    <directionalLight ref={sun} position={[-65,64,40]} intensity={2.13} color="#ffe3bb" castShadow shadow-mapSize={[shadowSize,shadowSize]} shadow-camera-left={-69} shadow-camera-right={69} shadow-camera-top={65} shadow-camera-bottom={-66} shadow-camera-far={200} shadow-normalBias={.055} shadow-bias={-.0003}/>
    <directionalLight ref={fill} position={[44,24,-45]} intensity={.75} color="#c5ddd1"/>
    <Atmosphere/><group ref={terrain}><Terrain/></group><Trails/>
    <Suspense fallback={null}><Vegetation/><Waterside/><Workshop/><City/><Stadium/><Picnic/><WoodlandDeer/><Home/>
    {welcome&&<Avatar/>}<Markers terrain={terrain}/><Ready/></Suspense>
  </>;
}
export function World(){
  const reduced=useReducedMotion();
  const dpr=Math.min(window.devicePixelRatio||1,window.matchMedia('(max-width: 800px)').matches?1.15:1.5);
  return <Canvas shadows="soft" dpr={dpr} frameloop={reduced?'demand':'always'} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} camera={{position:poses.welcome.position,fov:42,near:.2,far:720}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.05;gl.outputColorSpace=THREE.SRGBColorSpace}}>
    <Wind/><CameraRig/><ContextWatcher/><FrameMetrics/><Scene/>
  </Canvas>;
}
