import {ArrowLeft,Building2,Code2,MoveUpRight,X} from 'lucide-react';
import {archives} from './content';
import {useArchiveDialog} from './useArchiveDialog';

export function Details({id,entry,direct=false,onClose}: {id:'office'|'city';entry?:number;direct?:boolean;onClose:()=>void}){
  const {dismiss,dialogProps}=useArchiveDialog(onClose);
  const entries=entry!==undefined&&archives[id][entry]?[archives[id][entry]]:archives[id];
  const project=id==='office',Icon=project?Code2:Building2;
  return <dialog {...dialogProps} className="detail-modal" data-kind={id} aria-labelledby="detail-title">
    <div className="detail-inner">
      <div className="archive-controls">
        <button className="icon-button modal-close" aria-label="Close details" autoFocus onClick={dismiss}><X size={20} aria-hidden="true" focusable="false"/></button>
      </div>
      <header className="archive-header">
        <span className="archive-icon" aria-hidden="true"><Icon size={22} aria-hidden="true" focusable="false"/></span>
        <p className="eyebrow">{project?'01 / DESIGN AND CODE':'02 / FRONTEND DEVELOPMENT'}</p>
        <h2 id="detail-title">{project?'Project details':'Work history'}</h2>
      </header>
      <div className={project?'archive-body':'archive-body career-timeline'}>
        {entries.map(item=><article className="archive-entry" key={item.title}>
          {item.period&&<p className="archive-period">{item.period}</p>}
          <h3>{item.title}</h3>
          {item.role&&<p className="archive-role">{item.role}</p>}
          {item.image&&<img src={`${import.meta.env.BASE_URL}${item.image.src}`} alt={item.image.alt} width={item.image.width} height={item.image.height} loading="lazy" decoding="async"/>}
          <p className="archive-summary">{item.summary}</p>
          {item.steps&&<dl className="project-steps">{item.steps.map(step=><div key={step.title}><dt>{step.title}</dt><dd>{step.text}</dd></div>)}</dl>}
          {item.tags&&<ul className="archive-tags" aria-label="Tools and skills">{item.tags.map(tag=><li key={tag}>{tag}</li>)}</ul>}
          {item.links?.map(link=><a className="archive-link" key={link.href} href={link.href}>{link.label} <MoveUpRight size={15} aria-hidden="true" focusable="false"/></a>)}
        </article>)}
      </div>
      <footer className="archive-footer"><button className="text-button" onClick={dismiss}><ArrowLeft size={16} aria-hidden="true" focusable="false"/> {direct?'Back to intro':project?'Back to projects':'Back to work'}</button></footer>
    </div>
  </dialog>;
}
