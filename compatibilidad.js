// Datos del plan son JSON: esta copia funciona también sin structuredClone.
function clonePlan(value) { return JSON.parse(JSON.stringify(value)); }

function openPanel(panel) {
  panel.previousFocus=document.activeElement;
  if(typeof panel.showModal==='function') {
    try {panel.showModal();return;}catch{}
  }
  panel.setAttribute('open','');
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-modal','true');
  panel.classList.add('fallback-dialog');
  document.body.classList.add('panel-open');
}
function closePanel(panel) {
  if(typeof panel.close==='function'&&!panel.classList.contains('fallback-dialog')) panel.close();
  else {panel.removeAttribute('open');panel.classList.remove('fallback-dialog');}
  if(!document.querySelector('dialog[open]')) document.body.classList.remove('panel-open');
  panel.previousFocus?.focus();
}

// Confirmación dentro de la página: no depende de las ventanas confirm del navegador.
function askConfirmation(message) {
  return new Promise(resolve=>{
    const panel=document.getElementById('confirmation');
    document.getElementById('confirmMessage').textContent=message;
    let done=false;
    function finish(value) {
      if(done)return;done=true;
      panel.oncancel=null;panel.onclose=null;panel.cancelFallback=null;
      closePanel(panel);resolve(value);
    }
    document.getElementById('confirmCancel').onclick=()=>finish(false);
    document.getElementById('confirmAccept').onclick=()=>finish(true);
    panel.oncancel=e=>{e.preventDefault();finish(false);};
    panel.onclose=()=>finish(false);
    panel.cancelFallback=()=>finish(false);
    openPanel(panel);document.getElementById('confirmCancel').focus();
  });
}
document.addEventListener('keydown',e=>{
  const panels=[...document.querySelectorAll('.fallback-dialog[open]')];
  const panel=panels[panels.length-1];if(!panel)return;
  if(e.key==='Escape') {e.preventDefault();panel.cancelFallback?panel.cancelFallback():closePanel(panel);}
  if(e.key==='Tab') {
    const nodes=[...panel.querySelectorAll('button,input,select,textarea,a[href]')].filter(n=>!n.disabled&&!n.hidden&&n.offsetParent!==null);
    const first=nodes[0],last=nodes[nodes.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
    if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
  }
});
function showLoadError() {
  const feedback=document.getElementById('feedback');
  if(feedback) feedback.textContent='No se pudo completar una acción. Recarga la página. Si continúa, comprueba que todos los archivos publicados sean de la versión 3.1.';
}
window.addEventListener('error',showLoadError);
window.addEventListener('unhandledrejection',showLoadError);
