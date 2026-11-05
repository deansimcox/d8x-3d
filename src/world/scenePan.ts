import {useEffect,useRef} from 'react';
import {useThree} from '@react-three/fiber';
import {MathUtils} from 'three';
import {useExperience} from '../store';

export function useScenePan(){
  const angles=useRef({yaw:0,pitch:0});
  const {gl,invalidate}=useThree();
  useEffect(()=>{
    const canvas=gl.domElement;
    let drag:{id:number;x:number;y:number;moved:boolean}|undefined;
    let suppressClick=false;
    const enabled=()=>{
      const {mode,ready}=useExperience.getState();
      return ready&&(mode==='overview'||mode==='scene');
    };
    const shift=(x:number,y:number)=>{
      const indoor=useExperience.getState().destination==='office';
      const limit=indoor?.105:.19;
      angles.current.yaw=MathUtils.clamp(angles.current.yaw+x,-limit,limit);
      angles.current.pitch=MathUtils.clamp(angles.current.pitch+y,-limit*.62,limit*.62);
      invalidate();
    };
    const reset=()=>{angles.current.yaw=0;angles.current.pitch=0;invalidate()};
    const start=(event:PointerEvent)=>{
      if(event.button!==0||!event.isPrimary||!enabled())return;
      suppressClick=false;
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
    };
    const move=(event:PointerEvent)=>{
      if(!drag||event.pointerId!==drag.id||!enabled())return;
      const x=event.clientX-drag.x,y=event.clientY-drag.y;
      if(!drag.moved&&Math.hypot(x,y)<5)return;
      drag.moved=true;
      canvas.classList.add('is-panning');
      drag.x=event.clientX;drag.y=event.clientY;
      shift(x*.003,y*.003);
    };
    const end=(event:PointerEvent)=>{
      if(drag?.id!==event.pointerId)return;
      suppressClick=drag.moved;
      drag=undefined;
      canvas.classList.remove('is-panning');
    };
    const click=(event:MouseEvent)=>{
      if(!suppressClick)return;
      suppressClick=false;
      event.stopImmediatePropagation();
    };
    const key=(event:KeyboardEvent)=>{
      if(!enabled())return;
      const step=.035;
      switch(event.key){
        case 'ArrowLeft':shift(step,0);break;
        case 'ArrowRight':shift(-step,0);break;
        case 'ArrowUp':shift(0,-step);break;
        case 'ArrowDown':shift(0,step);break;
        case 'Home':reset();break;
        default:return;
      }
      event.preventDefault();
    };
    const unsubscribe=useExperience.subscribe((state,previous)=>{
      if(state.mode!==previous.mode||state.destination!==previous.destination||state.serial!==previous.serial){
        drag=undefined;suppressClick=false;canvas.classList.remove('is-panning');reset();
      }
    });
    canvas.addEventListener('pointerdown',start);
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerup',end);
    window.addEventListener('pointercancel',end);
    canvas.addEventListener('click',click,true);
    canvas.addEventListener('keydown',key);
    return ()=>{
      unsubscribe();
      canvas.removeEventListener('pointerdown',start);
      window.removeEventListener('pointermove',move);
      window.removeEventListener('pointerup',end);
      window.removeEventListener('pointercancel',end);
      canvas.removeEventListener('click',click,true);
      canvas.removeEventListener('keydown',key);
    };
  },[gl,invalidate]);
  return angles;
}
