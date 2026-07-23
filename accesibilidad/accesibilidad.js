/* Herramienta común de accesibilidad para EVA.
   Se carga desde CAP, MEA, NI, RA y Accesos Complementarios. */

(function(){
  'use strict';

  const STORAGE_KEY = 'eva_accesibilidad_preferencias';
  const FAVICON_BASE = 'https://crebe-ucayali.github.io/accesos-complementarios/assets/favicon/';
  const CLASES = [
    'eva-alto-contraste',
    'eva-texto-grande',
    'eva-texto-muy-grande',
    'eva-fuente-legible',
    'eva-espaciado-amplio',
    'eva-enlaces-resaltados',
    'eva-escala-grises',
    'eva-reducir-movimiento'
  ];

  const opciones = [
    { id:'alto-contraste', texto:'Alto contraste', clase:'eva-alto-contraste' },
    { id:'texto-grande', texto:'Texto grande', clase:'eva-texto-grande', excluye:['eva-texto-muy-grande'] },
    { id:'texto-muy-grande', texto:'Texto muy grande', clase:'eva-texto-muy-grande', excluye:['eva-texto-grande'] },
    { id:'fuente-legible', texto:'Fuente legible', clase:'eva-fuente-legible' },
    { id:'espaciado-amplio', texto:'Espaciado amplio', clase:'eva-espaciado-amplio' },
    { id:'enlaces-resaltados', texto:'Resaltar enlaces', clase:'eva-enlaces-resaltados' },
    { id:'escala-grises', texto:'Escala de grises', clase:'eva-escala-grises' },
    { id:'reducir-movimiento', texto:'Reducir movimiento', clase:'eva-reducir-movimiento' }
  ];

  let lecturaActiva = false;
  let fragmentosLectura = [];
  let indiceLectura = 0;
  let ultimoFoco = null;

  function obtenerPreferencias(){
    try{
      const guardado = localStorage.getItem(STORAGE_KEY);
      return guardado ? JSON.parse(guardado) : {};
    }catch(error){
      return {};
    }
  }

  function guardarPreferencias(preferencias){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferencias));
    }catch(error){
      /* La herramienta continúa funcionando durante la sesión. */
    }
  }

  function aplicarPreferencias(preferencias){
    const raiz = document.documentElement;
    CLASES.forEach(clase => raiz.classList.remove(clase));
    opciones.forEach(opcion => {
      if(preferencias && preferencias[opcion.clase]) raiz.classList.add(opcion.clase);
    });
  }

  function implementarFaviconInstitucional(){
    const recursos = [
      { rel:'icon', href:FAVICON_BASE + 'favicon-crebe.ico', sizes:'any' },
      { rel:'icon', href:FAVICON_BASE + 'favicon-32x32.png', type:'image/png', sizes:'32x32' },
      { rel:'icon', href:FAVICON_BASE + 'favicon-16x16.png', type:'image/png', sizes:'16x16' },
      { rel:'apple-touch-icon', href:FAVICON_BASE + 'apple-touch-icon.png', sizes:'180x180' }
    ];

    recursos.forEach(recurso => {
      if(document.head.querySelector(`link[rel="${recurso.rel}"][href="${recurso.href}"]`)) return;
      const enlace = document.createElement('link');
      Object.assign(enlace, recurso);
      document.head.appendChild(enlace);
    });

    if(!document.head.querySelector('meta[name="theme-color"]')){
      const colorTema = document.createElement('meta');
      colorTema.name = 'theme-color';
      colorTema.content = '#0b3550';
      document.head.appendChild(colorTema);
    }
  }

  function corregirRutasAntiguas(){
    const inicioPrincipal = 'https://crebe-ucayali.github.io/';
    const contactoPrincipal = 'https://crebe-ucayali.github.io/accesos-complementarios/paginas/contacto.html';
    const inicioAC = 'https://crebe-ucayali.github.io/accesos-complementarios/';

    document.querySelectorAll('a[href]').forEach(enlace => {
      const hrefOriginal = enlace.getAttribute('href');
      if(!hrefOriginal) return;
      const href = hrefOriginal.trim();

      if(href.includes('crebe-ucayali.netlify.app')){
        enlace.setAttribute('href', inicioPrincipal);
      }else if(href === 'contacto.html' || href.endsWith('/recursos/contacto.html') || href.endsWith('/directorios/contacto.html') || href.endsWith('/firma-tu-visita/contacto.html')){
        enlace.setAttribute('href', contactoPrincipal);
      }else if(href === 'index.html' && /\/(recursos|directorios|firma-tu-visita)\//.test(window.location.pathname)){
        enlace.setAttribute('href', inicioAC);
      }
    });
  }

  function reforzarEstructuraBase(){
    if(!document.documentElement.lang) document.documentElement.lang = 'es';

    let principal = document.querySelector('main');
    if(principal && !principal.id) principal.id = 'contenido-principal';

    if(principal && !document.querySelector('.eva-salto-contenido')){
      const salto = document.createElement('a');
      salto.className = 'eva-salto-contenido';
      salto.href = `#${principal.id}`;
      salto.textContent = 'Saltar al contenido principal';
      document.body.prepend(salto);
    }

    document.querySelectorAll('a[target="_blank"]').forEach(enlace => {
      const valores = new Set((enlace.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
      valores.add('noopener');
      valores.add('noreferrer');
      enlace.setAttribute('rel', Array.from(valores).join(' '));
    });

    const actual = new URL(window.location.href);
    document.querySelectorAll('nav a[href]').forEach(enlace => {
      try{
        const destino = new URL(enlace.href, actual);
        if(destino.origin === actual.origin && destino.pathname.replace(/index\.html$/,'') === actual.pathname.replace(/index\.html$/,'')){
          enlace.setAttribute('aria-current','page');
        }
      }catch(error){
        /* Se ignoran direcciones no válidas. */
      }
    });

    document.querySelectorAll('iframe:not([title])').forEach((marco, indice) => {
      const etiqueta = marco.getAttribute('aria-label') || `Contenido integrado ${indice + 1}`;
      marco.setAttribute('title', etiqueta);
    });
  }

  function crearAnunciador(){
    let anunciador = document.querySelector('#eva-anunciador-accesibilidad');
    if(anunciador) return anunciador;
    anunciador = document.createElement('div');
    anunciador.id = 'eva-anunciador-accesibilidad';
    anunciador.className = 'eva-solo-lectores';
    anunciador.setAttribute('aria-live','polite');
    anunciador.setAttribute('aria-atomic','true');
    document.body.appendChild(anunciador);
    return anunciador;
  }

  function anunciar(mensaje){
    const anunciador = crearAnunciador();
    anunciador.textContent = '';
    window.setTimeout(() => { anunciador.textContent = mensaje; }, 30);
  }

  function actualizarBotones(panel, preferencias){
    panel.querySelectorAll('[data-eva-clase]').forEach(boton => {
      const clase = boton.getAttribute('data-eva-clase');
      boton.setAttribute('aria-pressed', preferencias[clase] ? 'true' : 'false');
    });
  }

  function alternarOpcion(opcion, panel){
    const preferencias = obtenerPreferencias();
    const nuevoEstado = !preferencias[opcion.clase];

    if(opcion.excluye){
      opcion.excluye.forEach(clase => { preferencias[clase] = false; });
    }

    preferencias[opcion.clase] = nuevoEstado;
    guardarPreferencias(preferencias);
    aplicarPreferencias(preferencias);
    actualizarBotones(panel, preferencias);
    anunciar(`${opcion.texto}: ${nuevoEstado ? 'activado' : 'desactivado'}.`);
  }

  function obtenerTextoLectura(){
    const principal = document.querySelector('main') || document.body;
    const copia = principal.cloneNode(true);
    copia.querySelectorAll('script,style,noscript,[hidden],[aria-hidden="true"],.eva-accesibilidad-panel,.eva-solo-lectores').forEach(nodo => nodo.remove());
    return (copia.innerText || copia.textContent || '').replace(/\s+/g,' ').trim();
  }

  function dividirTexto(texto, limite){
    const oraciones = texto.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [texto];
    const partes = [];
    let actual = '';

    oraciones.forEach(oracion => {
      const limpia = oracion.trim();
      if(!limpia) return;
      if((actual + ' ' + limpia).trim().length <= limite){
        actual = (actual + ' ' + limpia).trim();
      }else{
        if(actual) partes.push(actual);
        if(limpia.length <= limite){
          actual = limpia;
        }else{
          for(let i = 0; i < limpia.length; i += limite) partes.push(limpia.slice(i, i + limite));
          actual = '';
        }
      }
    });

    if(actual) partes.push(actual);
    return partes;
  }

  function detenerLectura(panel, anunciarEstado){
    if('speechSynthesis' in window) window.speechSynthesis.cancel();
    lecturaActiva = false;
    fragmentosLectura = [];
    indiceLectura = 0;
    const boton = panel && panel.querySelector('[data-eva-accion="lectura"]');
    if(boton){
      boton.textContent = 'Leer página';
      boton.setAttribute('aria-pressed','false');
    }
    if(anunciarEstado !== false) anunciar('Lectura detenida.');
  }

  function reproducirSiguiente(panel){
    if(!lecturaActiva || indiceLectura >= fragmentosLectura.length){
      detenerLectura(panel, false);
      anunciar('Lectura finalizada.');
      return;
    }

    const voz = new SpeechSynthesisUtterance(fragmentosLectura[indiceLectura]);
    voz.lang = 'es-PE';
    voz.rate = 0.95;
    voz.onend = () => {
      indiceLectura += 1;
      reproducirSiguiente(panel);
    };
    voz.onerror = () => detenerLectura(panel, false);
    window.speechSynthesis.speak(voz);
  }

  function alternarLectura(panel){
    if(!('speechSynthesis' in window)){
      anunciar('La lectura en voz alta no está disponible en este navegador.');
      return;
    }

    if(lecturaActiva){
      detenerLectura(panel);
      return;
    }

    const texto = obtenerTextoLectura();
    if(!texto){
      anunciar('No se encontró contenido para leer.');
      return;
    }

    fragmentosLectura = dividirTexto(texto, 220);
    indiceLectura = 0;
    lecturaActiva = true;
    const boton = panel.querySelector('[data-eva-accion="lectura"]');
    boton.textContent = 'Detener lectura';
    boton.setAttribute('aria-pressed','true');
    anunciar('Lectura en voz alta iniciada.');
    reproducirSiguiente(panel);
  }

  function crearPanel(){
    if(document.querySelector('.eva-accesibilidad-panel')) return;

    const panel = document.createElement('div');
    panel.className = 'eva-accesibilidad-panel';
    panel.innerHTML = `
      <button class="eva-accesibilidad-boton" type="button" aria-expanded="false" aria-controls="eva-accesibilidad-menu" aria-label="Abrir opciones de accesibilidad">Accesibilidad</button>
      <section class="eva-accesibilidad-menu" id="eva-accesibilidad-menu" hidden aria-labelledby="eva-accesibilidad-titulo">
        <h2 class="eva-accesibilidad-titulo" id="eva-accesibilidad-titulo">Opciones de accesibilidad</h2>
        <p class="eva-accesibilidad-descripcion">Personalice la lectura y visualización. Las preferencias se guardan en este dispositivo.</p>
        <div class="eva-accesibilidad-opciones"></div>
      </section>
    `;

    const botonPrincipal = panel.querySelector('.eva-accesibilidad-boton');
    const menu = panel.querySelector('.eva-accesibilidad-menu');
    const contenedor = panel.querySelector('.eva-accesibilidad-opciones');

    opciones.forEach(opcion => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'eva-accesibilidad-opcion';
      boton.setAttribute('data-eva-clase', opcion.clase);
      boton.setAttribute('aria-pressed','false');
      boton.textContent = opcion.texto;
      boton.addEventListener('click', () => alternarOpcion(opcion, panel));
      contenedor.appendChild(boton);
    });

    const lectura = document.createElement('button');
    lectura.type = 'button';
    lectura.className = 'eva-accesibilidad-opcion';
    lectura.setAttribute('data-eva-accion','lectura');
    lectura.setAttribute('aria-pressed','false');
    lectura.textContent = 'Leer página';
    lectura.addEventListener('click', () => alternarLectura(panel));
    if(!('speechSynthesis' in window)) lectura.disabled = true;
    contenedor.appendChild(lectura);

    const restablecer = document.createElement('button');
    restablecer.type = 'button';
    restablecer.className = 'eva-accesibilidad-opcion eva-accesibilidad-restablecer';
    restablecer.textContent = 'Restablecer ajustes';
    restablecer.addEventListener('click', () => {
      guardarPreferencias({});
      aplicarPreferencias({});
      actualizarBotones(panel, {});
      detenerLectura(panel, false);
      anunciar('Se restablecieron las opciones de accesibilidad.');
    });
    contenedor.appendChild(restablecer);

    function cerrarMenu(){
      menu.hidden = true;
      botonPrincipal.setAttribute('aria-expanded','false');
      if(ultimoFoco === botonPrincipal) botonPrincipal.focus();
    }

    botonPrincipal.addEventListener('click', () => {
      const abrir = menu.hidden;
      ultimoFoco = document.activeElement;
      menu.hidden = !abrir;
      botonPrincipal.setAttribute('aria-expanded', String(abrir));
      if(abrir) menu.querySelector('button')?.focus();
    });

    document.addEventListener('keydown', evento => {
      if(evento.altKey && evento.shiftKey && evento.key.toLowerCase() === 'a'){
        evento.preventDefault();
        botonPrincipal.click();
      }
      if(evento.key === 'Escape'){
        if(lecturaActiva) detenerLectura(panel);
        if(!menu.hidden) cerrarMenu();
      }
    });

    document.addEventListener('click', evento => {
      if(!panel.contains(evento.target) && !menu.hidden) cerrarMenu();
    });

    window.addEventListener('beforeunload', () => {
      if('speechSynthesis' in window) window.speechSynthesis.cancel();
    });

    document.body.appendChild(panel);
    actualizarBotones(panel, obtenerPreferencias());
  }

  function iniciar(){
    if(document.documentElement.dataset.evaAccesibilidadInicializada === 'true') return;
    document.documentElement.dataset.evaAccesibilidadInicializada = 'true';
    implementarFaviconInstitucional();
    corregirRutasAntiguas();
    reforzarEstructuraBase();
    crearAnunciador();
    aplicarPreferencias(obtenerPreferencias());
    crearPanel();
  }

  aplicarPreferencias(obtenerPreferencias());

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', iniciar);
  }else{
    iniciar();
  }
})();