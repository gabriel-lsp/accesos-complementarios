/* Cargador estable de la herramienta común de accesibilidad EVA. */
(function(){
  'use strict';
  if(document.querySelector('script[data-eva-accesibilidad-v2]')) return;
  const script=document.createElement('script');
  script.src='https://crebe-ucayali.github.io/accesos-complementarios/accesibilidad/accesibilidad-v2.js?v=2';
  script.async=false;
  script.dataset.evaAccesibilidadV2='true';
  document.head.appendChild(script);
})();