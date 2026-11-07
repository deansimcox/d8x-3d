import {useEffect,useMemo,useRef} from 'react';
import {useGLTF} from '@react-three/drei';
import {useFrame} from '@react-three/fiber';
import {AnimationMixer,LoopOnce,Mesh,type Group} from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {useExperience} from '../store';
import {terrainY} from './layout';
import {useReducedMotion} from './motion';

const x = -19.2, z = -27.8;
const rockTop = .43;
const facing = -1.65;

function Robin({url}: {url:string}){
  const reduced = useReducedMotion();
  const perch = useRef<Group>(null);
  const elapsed = useRef(0);
  const actionIndex = useRef(0);
  const {scene,animations} = useGLTF(url);
  const bird = useMemo(()=>{
    const model = clone(scene);
    model.traverse(object=>{
      if(object instanceof Mesh){object.castShadow=true;object.frustumCulled=false}
    });
    const mixer = new AnimationMixer(model);
    const actions = ['A_Idle_01','A_Hop_01','A_Preen_01'].map(name=>mixer.clipAction(animations.find(clip=>clip.name===name)!));
    actions[1].setLoop(LoopOnce,1).clampWhenFinished=true;
    return {model,mixer,actions};
  },[scene,animations]);

  useEffect(()=>{
    elapsed.current=0;
    actionIndex.current=0;
    bird.actions[0].reset().play();
    bird.mixer.update(0);
    return ()=>{bird.mixer.stopAllAction()};
  },[bird,reduced]);

  useFrame((_,delta)=>{
    const {mode,target,destination} = useExperience.getState();
    if(reduced||(mode==='transitioning'?target:destination)!=='nature')return;
    const step = Math.min(delta,.05);
    elapsed.current = (elapsed.current+step)%14;
    const time = elapsed.current;
    const next = time<4||time>=9.33 ? 0 : time<4.33 ? 1 : 2;
    if(next!==actionIndex.current){
      bird.actions[next].reset().play().crossFadeFrom(bird.actions[actionIndex.current],.09,false);
      actionIndex.current=next;
    }
    bird.mixer.update(step);
    if(perch.current){
      perch.current.rotation.y = time>=9.33 ? facing+.23*Math.sin((time-9.33)*Math.PI/4.67) : facing;
    }
  });

  return <group position={[x,terrainY(x,z),z]} dispose={null}>
    <mesh position={[0,.19,0]} rotation={[0,.35,0]} scale={[1,1,.81]} castShadow receiveShadow>
      <cylinderGeometry args={[.5,.71,.48,7]}/>
      <meshStandardMaterial color="#8b8871" flatShading/>
    </mesh>
    <group ref={perch} position={[0,rockTop,0]} rotation={[0,facing,0]}>
      <primitive object={bird.model} scale={3.5}/>
    </group>
  </group>;
}

// The creator permits shipping the bird inside the app. Supply the model separately for a build.
const [localRobin] = Object.values(import.meta.glob<string>('/src/assets/americanRobin.glb', {query:'?url',import:'default',eager:true}));
export function RiversideRobin(){
  return localRobin ? <Robin url={localRobin}/> : null;
}
