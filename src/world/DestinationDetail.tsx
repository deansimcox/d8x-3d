import {Suspense,useEffect,useState,type ReactNode} from 'react';
import {useThree} from '@react-three/fiber';
import type {SceneId} from '../content';
import {useExperience} from '../store';

function RefreshShadows(){
  const {gl,invalidate}=useThree();
  useEffect(()=>{
    gl.shadowMap.needsUpdate=true;
    invalidate();
  },[gl,invalidate]);
  return null;
}

export function DestinationDetail({id,children}:{id:SceneId;children:ReactNode}){
  const approaching=useExperience(state=>state.destination===id||state.target===id);
  const [visited,setVisited]=useState(false);
  useEffect(()=>{
    if(approaching)setVisited(true);
  },[approaching]);

  if(!approaching&&!visited)return null;
  return <Suspense fallback={null}>{children}<RefreshShadows/></Suspense>;
}
