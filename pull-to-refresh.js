(() => {
  'use strict';
  // Prevent the browser's native pull-to-refresh from interrupting project scrolling.
  const style = document.createElement('style');
  style.textContent = 'html,body{overscroll-behavior-y:contain}';
  document.head.appendChild(style);
  let start = null, armed = false, indicator;
  function projectOpen() {
    return (typeof current !== 'undefined' && !!current)
      || !!document.querySelector('#app .section.active, dialog[open], .diagram-expanded');
  }
  function atTop() { return window.scrollY <= 8 && (document.scrollingElement?.scrollTop || 0) <= 8; }
  function eligible(target) {
    return !projectOpen() && atTop() && window.accountReady?.()
      && !target?.closest?.('input,textarea,select,button,a,[contenteditable],.scroll,.schematic');
  }
  function reset() {
    start = null; armed = false;
    if (indicator) indicator.hidden = true;
  }
  function setup() {
    if (document.getElementById('gp-atualizar-pagina')) return;
    const button = document.createElement('button');
    button.id = 'gp-atualizar-pagina'; button.type = 'button';
    button.className = 'secondary'; button.textContent = '↻ Atualizar';
    button.onclick = () => window.location.reload();
    (document.querySelector('header nav') || document.querySelector('header'))?.appendChild(button);
  }
  document.addEventListener('touchstart', event => {
    reset();
    if (event.touches.length === 1 && eligible(event.target)) start = event.touches[0].clientY;
  }, {passive:true});
  document.addEventListener('touchmove', event => {
    if (start === null) return;
    if (event.touches.length !== 1 || !eligible(event.target)) { reset(); return; }
    const distance = event.touches[0].clientY - start;
    armed = distance >= 90;
    if (distance < 12) { if (indicator) indicator.hidden = true; return; }
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'gp-pull-refresh'; indicator.setAttribute('role','status');
      Object.assign(indicator.style,{position:'fixed',top:'12px',left:'50%',transform:'translateX(-50%)',zIndex:'9999',background:'#103e35',color:'#fff',padding:'10px 16px',borderRadius:'24px',pointerEvents:'none'});
      document.body.appendChild(indicator);
    }
    indicator.hidden = false;
    indicator.textContent = armed ? 'Solte para atualizar' : '↓ Puxe para atualizar';
  }, {passive:true});
  document.addEventListener('touchend', () => {
    const refresh = start !== null && armed && eligible(null);
    reset();
    if (refresh) window.location.reload();
  }, {passive:true});
  document.addEventListener('touchcancel', reset, {passive:true});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();