import {useEffect,useRef} from 'react';
import {useThree} from '@react-three/fiber';
import {MathUtils} from 'three';
import {useExperience} from '../store';

export function useScenePan(){
  const angles=useRef({yaw:0,pitch:0,zoom:0,held:false,idleAfter:0});
  const {gl,invalidate}=useThree();
  useEffect(()=>{
    const canvas=gl.domElement;
    let drag:{id:number;x:number;y:number;moved:boolean}|undefined;
    let suppressClick=false;
    const touches=new Map<number,PointerEvent>();
    const pinchDistance=()=>{
      const [a,b]=touches.values();
      return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
    };
    const enabled=()=>{
      const {mode,ready}=useExperience.getState();
      return ready&&mode!=='transitioning'&&mode!=='flight';
    };
    const overview=()=>useExperience.getState().mode==='overview';
    const deferIdle=()=>{angles.current.idleAfter=performance.now()+1400};
    const zoomBy=(amount:number)=>{
      angles.current.zoom=MathUtils.clamp(angles.current.zoom+amount,0,.2);
      deferIdle();
      invalidate();
    };
    const shift=(x:number,y:number)=>{
      const inScene=useExperience.getState().mode==='scene';
      const yaw=angles.current.yaw+x;
      angles.current.yaw=MathUtils.euclideanModulo(yaw+Math.PI,Math.PI*2)-Math.PI;
      if(inScene)angles.current.pitch=MathUtils.clamp(angles.current.pitch+y,-.78,.78);
      deferIdle();
      invalidate();
    };
    const reset=()=>{angles.current={yaw:0,pitch:0,zoom:0,held:false,idleAfter:0};invalidate()};
    const start=(event:PointerEvent)=>{
      if(event.button!==0||!enabled())return;
      if(overview()&&event.pointerType==='touch'){
        touches.set(event.pointerId,event);
        if(touches.size>1){drag=undefined;suppressClick=true;canvas.classList.remove('is-panning');return}
      }
      if(!event.isPrimary)return;
      suppressClick=false;
      angles.current.held=true;
      drag={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};
    };
    const move=(event:PointerEvent)=>{
      if(touches.has(event.pointerId)){
        const previous=touches.size===2?pinchDistance():0;
        touches.set(event.pointerId,event);
        if(previous>0){zoomBy((pinchDistance()-previous)*.0018);return}
      }
      if(!drag||event.pointerId!==drag.id||!enabled())return;
      const x=event.clientX-drag.x,y=event.clientY-drag.y;
      const inScene=useExperience.getState().mode==='scene';
      if(!drag.moved&&(inScene?Math.hypot(x,y):Math.abs(x))<5)return;
      drag.moved=true;
      canvas.classList.add('is-panning');
      drag.x=event.clientX;drag.y=event.clientY;
      shift(x*.003,y*.003);
    };
    const end=(event:PointerEvent)=>{
      if(touches.delete(event.pointerId)&&touches.size===0)angles.current.held=false;
      if(drag?.id!==event.pointerId)return;
      angles.current.held=false;
      deferIdle();
      suppressClick=drag.moved;
      drag=undefined;
      canvas.classList.remove('is-panning');
    };
    const wheel=(event:WheelEvent)=>{
      if(!enabled()||!overview())return;
      event.preventDefault();
      const units=event.deltaMode===1?16:event.deltaMode===2?canvas.clientHeight:1;
      zoomBy(MathUtils.clamp(-event.deltaY*units*.00045,-.08,.08));
    };
    const click=(event:MouseEvent)=>{
      if(!suppressClick)return;
      suppressClick=false;
      event.stopImmediatePropagation();
    };
    const key=(event:KeyboardEvent)=>{
      if(!enabled())return;
      const inScene=useExperience.getState().mode==='scene';
      const step=inScene?.12:.09;
      switch(event.key){
        case 'ArrowLeft':shift(step,0);break;
        case 'ArrowRight':shift(-step,0);break;
        case 'ArrowUp':if(!inScene)return;shift(0,-step);break;
        case 'ArrowDown':if(!inScene)return;shift(0,step);break;
        case '+':case '=':if(!overview())return;zoomBy(.04);break;
        case '-':if(!overview())return;zoomBy(-.04);break;
        case 'Home':if(useExperience.getState().mode==='welcome')return;reset();deferIdle();break;
        default:return;
      }
      event.preventDefault();
    };
    const unsubscribe=useExperience.subscribe((state,previous)=>{
      if(state.mode!==previous.mode||state.destination!==previous.destination||state.serial!==previous.serial){
        drag=undefined;touches.clear();suppressClick=false;canvas.classList.remove('is-panning');reset();
      }
    });
    canvas.addEventListener('pointerdown',start);
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerup',end);
    window.addEventListener('pointercancel',end);
    canvas.addEventListener('click',click,true);
    canvas.addEventListener('keydown',key);
    canvas.addEventListener('wheel',wheel,{passive:false});
    return ()=>{
      unsubscribe();
      canvas.removeEventListener('pointerdown',start);
      window.removeEventListener('pointermove',move);
      window.removeEventListener('pointerup',end);
      window.removeEventListener('pointercancel',end);
      canvas.removeEventListener('click',click,true);
      canvas.removeEventListener('keydown',key);
      canvas.removeEventListener('wheel',wheel);
    };
  },[gl,invalidate]);
  return angles;
}
