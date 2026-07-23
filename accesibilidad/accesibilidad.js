/* Cargador estable de la herramienta común de accesibilidad EVA. */
(function(){
  'use strict';

  function corregirTabulacionesNoInteractivas(){
    document.querySelectorAll('.item-recurso[tabindex="0"]').forEach(elemento=>{
      elemento.removeAttribute('tabindex');
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',corregirTabulacionesNoInteractivas);
  }else{
    corregirTabulacionesNoInteractivas();
  }

  if(document.querySelector('script[data-eva-accesibilidad-v2]')) return;
  const script=document.createElement('script');
  script.src='https://crebe-ucayali.github.io/accesos-complementarios/accesibilidad/accesibilidad-v2.js?v=2';
  script.async=false;
  script.dataset.evaAccesibilidadV2='true';
  document.head.appendChild(script);
})();