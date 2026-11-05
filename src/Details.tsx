import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,Building2,Code2,MoveUpRight,X} from 'lucide-react';
import {archives} from './content';

export function Details({id,entry,onClose}: {id:'office'|'city';entry?:number;onClose:()=>void}){
  const ref=useRef<HTMLDialogElement>(null);
  const [closing,setClosing]=useState(false);
  const entries=entry!==undefined&&archives[id][entry]?[archives[id][entry]]:archives[id];
  const project=id==='office',Icon=project?Code2:Building2;
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
  return <dialog ref={ref} className="detail-modal" data-kind={id} data-closing={closing||undefined}
    aria-labelledby="detail-title" onClose={onClose}
    onCancel={event=>{event.preventDefault();dismiss()}}
    onAnimationEnd={event=>{if(event.target===event.currentTarget&&event.animationName==='archive-out')ref.current?.close()}}
    onClick={event=>{if(event.target===event.currentTarget)dismiss()}}>
    <div className="detail-inner">
      <header className="archive-header">
        <button className="icon-button modal-close" aria-label="Close details" autoFocus onClick={dismiss}><X size={20}/></button>
        <span className="archive-icon" aria-hidden="true"><Icon size={22}/></span>
        <p className="eyebrow">{project?'01 / DESIGN AND CODE':'02 / FRONTEND DEVELOPMENT'}</p>
        <h2 id="detail-title">{project?'Project details':'Work history'}</h2>
      </header>
      <div className={project?'archive-body':'archive-body career-timeline'}>
        {entries.map(item=><article className="archive-entry" key={item.title}>
          {item.period&&<p className="archive-period">{item.period}</p>}
          <h3>{item.title}</h3>
          {item.role&&<p className="archive-role">{item.role}</p>}
          {item.image&&<img src={item.image.src} alt={item.image.alt}/>}
          <p className="archive-summary">{item.summary}</p>
          {item.steps&&<dl className="project-steps">{item.steps.map(step=><div key={step.title}><dt>{step.title}</dt><dd>{step.text}</dd></div>)}</dl>}
          {item.tags&&<ul className="archive-tags" aria-label="Tools and skills">{item.tags.map(tag=><li key={tag}>{tag}</li>)}</ul>}
          {item.links?.map(link=><a className="archive-link" key={link.href} href={link.href}>{link.label} <MoveUpRight size={15}/></a>)}
        </article>)}
      </div>
      <footer className="archive-footer"><button className="text-button" onClick={dismiss}><ArrowLeft size={16}/> Back to {project?'projects':'work'}</button></footer>
    </div>
  </dialog>;
}
