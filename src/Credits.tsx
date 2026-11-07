import {useEffect,useRef,useState} from 'react';
import {X} from 'lucide-react';
import {useArchiveDialog} from './useArchiveDialog';

export const creditsUrl=`${import.meta.env.BASE_URL}credits.html`;

export function Credits({onClose}:{onClose:()=>void}){
  const {dismiss,dialogProps}=useArchiveDialog(onClose);
  const content=useRef<HTMLDivElement>(null);
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading');

  useEffect(()=>{
    const controller=new AbortController();
    async function load(){
      try{
        const response=await fetch(creditsUrl,{signal:controller.signal});
        if(!response.ok)throw new Error('Credits unavailable');
        const page=new DOMParser().parseFromString(await response.text(),'text/html');
        const credits=page.querySelector('[data-asset-credits]');
        if(!credits)throw new Error('Credits unavailable');
        credits.querySelectorAll('h2').forEach(heading=>{
          const sectionTitle=page.createElement('h3');
          sectionTitle.textContent=heading.textContent;
          heading.replaceWith(sectionTitle);
        });
        for(const link of credits.querySelectorAll('a')){
          link.href=new URL(link.getAttribute('href')??'',response.url).href;
          link.target='_blank';
          link.rel='noopener noreferrer';
        }
        if(controller.signal.aborted)return;
        content.current?.replaceChildren(...credits.childNodes);
        setStatus('ready');
      }catch{
        if(!controller.signal.aborted)setStatus('error');
      }
    }
    void load();
    return ()=>controller.abort();
  },[]);

  return <dialog {...dialogProps} className="detail-modal credits-modal" aria-labelledby="credits-title">
    <div className="detail-inner">
      <div className="archive-controls">
        <button className="icon-button modal-close" aria-label="Close credits" autoFocus onClick={dismiss}>
          <X size={20} aria-hidden="true" focusable="false"/>
        </button>
      </div>
      <header className="archive-header"><h2 id="credits-title">Asset credits</h2></header>
      <div className="archive-body credits-body">
        {status==='loading'&&<p role="status">Loading credits…</p>}
        {status==='error'&&<p>Credits couldn’t load here. <a href={creditsUrl} target="_blank" rel="noopener noreferrer">Open the credits page</a>.</p>}
        <div ref={content}/>
      </div>
    </div>
  </dialog>;
}
