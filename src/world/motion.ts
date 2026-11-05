import {useSyncExternalStore} from 'react';
const query='(prefers-reduced-motion: reduce)';
export const prefersReducedMotion=()=>window.matchMedia(query).matches;
const subscribe=(change:()=>void)=>{
  const media=window.matchMedia(query);media.addEventListener('change',change);
  return ()=>media.removeEventListener('change',change);
};
export const useReducedMotion=()=>useSyncExternalStore(subscribe,prefersReducedMotion,()=>false);
