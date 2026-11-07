import {useEffect,useRef,useState,type AnimationEvent,type MouseEvent,type SyntheticEvent} from 'react';

export function useArchiveDialog(onClose:()=>void){
  const ref=useRef<HTMLDialogElement>(null);
  const [closing,setClosing]=useState(false);

  useEffect(()=>{
    const dialog=ref.current;
    if(dialog&&!dialog.open)dialog.showModal();
  },[]);
  useEffect(()=>{
    if(!closing)return;
    const timer=window.setTimeout(()=>ref.current?.close(),350);
    return ()=>window.clearTimeout(timer);
  },[closing]);

  function dismiss(){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)ref.current?.close();
    else setClosing(true);
  }

  return {dismiss,dialogProps:{
    ref,onClose,'data-closing':closing||undefined,
    onCancel:(event:SyntheticEvent<HTMLDialogElement>)=>{event.preventDefault();dismiss()},
    onAnimationEnd:(event:AnimationEvent<HTMLDialogElement>)=>{
      if(event.target===event.currentTarget&&event.animationName==='archive-out')ref.current?.close();
    },
    onClick:(event:MouseEvent<HTMLDialogElement>)=>{if(event.target===event.currentTarget)dismiss()},
  }};
}
