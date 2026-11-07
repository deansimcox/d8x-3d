import {Info,X} from 'lucide-react';
import {useArchiveDialog} from './useArchiveDialog';

export function BrandExplainer({onClose}:{onClose:()=>void}){
  const {dismiss,dialogProps}=useArchiveDialog(onClose);
  return <dialog {...dialogProps} className="detail-modal brand-modal" aria-labelledby="brand-explainer-title" aria-describedby="brand-explainer-copy">
    <div className="detail-inner">
      <div className="archive-controls">
        <button className="icon-button modal-close" aria-label="Close Why d8x?" autoFocus onClick={dismiss}>
          <X size={20} aria-hidden="true" focusable="false"/>
        </button>
      </div>
      <header className="archive-header">
        <span className="archive-icon" aria-hidden="true"><Info size={22} focusable="false"/></span>
        <h2 id="brand-explainer-title">Why d8x?</h2>
      </header>
      <div className="archive-body">
        <p id="brand-explainer-copy">I’m Dean Simcox. Take the <strong>D</strong> and <strong>x</strong> from my name and replace the eight letters between them with <strong>8</strong>. It’s the same idea as <strong>a11y</strong>, which is short for accessibility.</p>
      </div>
    </div>
  </dialog>;
}
