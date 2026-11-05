import {useEffect,useMemo,useRef} from 'react';
import {useGLTF} from '@react-three/drei';
import {useFrame} from '@react-three/fiber';
import {AnimationMixer,Box3,Group,Mesh} from 'three';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {useExperience} from '../store';
import {terrainY} from './layout';
import {useReducedMotion} from './motion';

const grazingAngle=1.8;
function placeDeer(group:Group,angle:number){
  const x=-21.4+Math.cos(angle)*2.3;
  const z=-20.6+Math.sin(angle)*1.2;
  group.position.set(x,terrainY(x,z)+.025,z);
  group.rotation.y=Math.atan2(-Math.sin(angle)*2.3,Math.cos(angle)*1.2);
}

export function WoodlandDeer(){
  const group=useRef<Group>(null);
  const time=useRef(0);
  const walking=useRef(false);
  const reduced=useReducedMotion();
  const {scene,animations}=useGLTF(`${import.meta.env.BASE_URL}models/woodlandDeer.glb`);
  const deer=useMemo(()=>{
    const model=clone(scene);
    model.traverse(object=>{
      if(object instanceof Mesh){object.castShadow=true;object.receiveShadow=true;object.frustumCulled=false}
    });
    // Update the skinned mesh's bind matrices before measuring its posed height.
    model.updateMatrixWorld(true);
    const bounds=new Box3().setFromObject(model,true);
    const scale=2.0/(bounds.max.y-bounds.min.y);
    const mixer=new AnimationMixer(model);
    const eat=mixer.clipAction(animations.find(clip=>clip.name==='Eating')!);
    const walk=mixer.clipAction(animations.find(clip=>clip.name==='Walk')!);
    return {model,scale,floor:bounds.min.y,mixer,eat,walk};
  },[scene,animations]);

  useEffect(()=>{
    if(group.current)placeDeer(group.current,grazingAngle);
    deer.eat.reset().play();
    deer.eat.time=.65;
    deer.mixer.update(0);
    return ()=>{deer.mixer.stopAllAction()};
  },[deer]);

  useFrame((_,delta)=>{
    const state=useExperience.getState();
    if(reduced||!group.current||(state.mode==='transitioning'?state.target:state.destination)!=='nature')return;
    const dt=Math.min(delta,.1);
    time.current=(time.current+dt)%19;
    const moving=time.current>=5;
    const progress=Math.max(0,(time.current-5)/14);
    placeDeer(group.current,grazingAngle+progress*Math.PI*2);
    if(moving!==walking.current){
      const outgoing=moving?deer.eat:deer.walk;
      const incoming=moving?deer.walk:deer.eat;
      incoming.reset().play().crossFadeFrom(outgoing,.35,false);
      walking.current=moving;
    }
    deer.mixer.update(dt);
  });

  return <group ref={group} dispose={null}>
    <group scale={deer.scale}><primitive object={deer.model} position={[0,-deer.floor,0]}/></group>
  </group>;
}
