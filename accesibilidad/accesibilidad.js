/* Herramienta común de accesibilidad para EVA / Accesos Complementarios.
   Insertar en cualquier página junto al CSS común. */

(function(){
  const STORAGE_KEY = 'eva_accesibilidad_preferencias';
  const CLASES = ['eva-alto-contraste','eva-texto-grande','eva-texto-muy-grande','eva-espaciado-amplio','eva-reducir-movimiento'];
  const FAVICON_BASE = 'https://crebe-ucayali.github.io/accesos-complementarios/assets/favicon/';

  const opciones = [
    {
      id:'alto-contraste',
      texto:'Alto contraste',
      clase:'eva-alto-contraste'
    },
    {
      id:'texto-grande',
      texto:'Texto grande',
      clase:'eva-texto-grande',
      excluye:['eva-texto-muy-grande']
    },
    {
      id:'texto-muy-grande',
      texto:'Texto muy grande',
      clase:'eva-texto-muy-grande',
      excluye:['eva-texto-grande']
    }
  ];

  function implementarFaviconInstitucional(){
    const recursos = [
      { rel:'icon', href:FAVICON_BASE + 'favicon-crebe.ico', sizes:'any' },
      { rel:'icon', href:FAVICON_BASE + 'favicon-32x32.png', type:'image/png', sizes:'32x32' },
      { rel:'icon', href:FAVICON_BASE + 'favicon-16x16.png', type:'image/png', sizes:'16x16' },
      { rel:'apple-touch-icon', href:FAVICON_BASE + 'apple-touch-icon.png', sizes:'180x180' }
    ];

    recursos.forEach(recurso => {
      const selector = `link[rel="${recurso.rel}"][href="${recurso.href}"]`;
      if(document.head.querySelector(selector)) return;

      const enlace = document.createElement('link');
      enlace.rel = recurso.rel;
      enlace.href = recurso.href;
      if(recurso.type) enlace.type = recurso.type;
      if(recurso.sizes) enlace.sizes = recurso.sizes;
      document.head.appendChild(enlace);
    });

    if(!document.head.querySelector('meta[name="theme-color"]')){
      const colorTema = document.createElement('meta');
      colorTema.name = 'theme-color';
      colorTema.content = '#0b3550';
      document.head.appendChild(colorTema);
    }
  }

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
      // Si el navegador bloquea localStorage, la herramienta igual funciona durante la sesión.
    }
  }

  function limpiarPreferenciasObsoletas(preferencias){
    preferencias['eva-espaciado-amplio'] = false;
    preferencias['eva-reducir-movimiento'] = false;
    return preferencias;
  }

  function aplicarPreferencias(preferencias){
    const preferenciasLimpias = limpiarPreferenciasObsoletas(preferencias || {});
    CLASES.forEach(clase => document.documentElement.classList.remove(clase));
    opciones.forEach(opcion => {
      if(preferenciasLimpias[opcion.clase]){
        document.documentElement.classList.add(opcion.clase);
      }
    });
  }

  function actualizarBotones(panel, preferencias){
    panel.querySelectorAll('[data-eva-clase]').forEach(boton => {
      const clase = boton.getAttribute('data-eva-clase');
      boton.setAttribute('aria-pressed', preferencias[clase] ? 'true' : 'false');
    });
  }

  function alternarOpcion(opcion, panel){
    const preferencias = limpiarPreferenciasObsoletas(obtenerPreferencias());
    const nuevoEstado = !preferencias[opcion.clase];

    if(opcion.excluye){
      opcion.excluye.forEach(clase => {
        preferencias[clase] = false;
      });
    }

    preferencias[opcion.clase] = nuevoEstado;
    guardarPreferencias(preferencias);
    aplicarPreferencias(preferencias);
    actualizarBotones(panel, preferencias);
  }

  function corregirRutasAntiguas(){
    const inicioPrincipal = 'https://crebe-ucayali.github.io/';
    const contactoPrincipal = 'https://crebe-ucayali.github.io/accesos-complementarios/paginas/contacto.html';
    const inicioAC = 'https://crebe-ucayali.github.io/accesos-complementarios/';

    document.querySelectorAll('a[href]').forEach(enlace => {
      const hrefOriginal = enlace.getAttribute('href');
      if(!hrefOriginal) return;

      const hrefNormalizado = hrefOriginal.trim();

      if(hrefNormalizado.includes('crebe-ucayali.netlify.app')){
        enlace.setAttribute('href', inicioPrincipal);
        return;
      }

      if(hrefNormalizado === 'contacto.html' || hrefNormalizado.endsWith('/recursos/contacto.html') || hrefNormalizado.endsWith('/directorios/contacto.html') || hrefNormalizado.endsWith('/firma-tu-visita/contacto.html')){
        enlace.setAttribute('href', contactoPrincipal);
        return;
      }

      if(hrefNormalizado === 'index.html' && /\/(recursos|directorios|firma-tu-visita)\//.test(window.location.pathname)){
        enlace.setAttribute('href', inicioAC);
      }
    });
  }

  function crearPanel(){
    if(document.querySelector('.eva-accesibilidad-panel')) return;

    const panel = document.createElement('div');
    panel.className = 'eva-accesibilidad-panel';
    panel.innerHTML = `
      <button class="eva-accesibilidad-boton" type="button" aria-expanded="false" aria-controls="eva-accesibilidad-menu" aria-label="Abrir opciones de accesibilidad">Accesibilidad</button>
      <div class="eva-accesibilidad-menu" id="eva-accesibilidad-menu" hidden>
        <p class="eva-accesibilidad-titulo">Opciones de accesibilidad</p>
        <p class="eva-accesibilidad-descripcion">Ajustes visuales temporales para facilitar la lectura y navegación.</p>
        <div class="eva-accesibilidad-opciones"></div>
      </div>
    `;

    const botonPrincipal = panel.querySelector('.eva-accesibilidad-boton');
    const menu = panel.querySelector('.eva-accesibilidad-menu');
    const contenedorOpciones = panel.querySelector('.eva-accesibilidad-opciones');

    opciones.forEach(opcion => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'eva-accesibilidad-opcion';
      boton.setAttribute('data-eva-clase', opcion.clase);
      boton.setAttribute('aria-pressed', 'false');
      boton.textContent = opcion.texto;
      boton.addEventListener('click', () => alternarOpcion(opcion, panel));
      contenedorOpciones.appendChild(boton);
    });

    const restablecer = document.createElement('button');
    restablecer.type = 'button';
    restablecer.className = 'eva-accesibilidad-opcion eva-accesibilidad-restablecer';
    restablecer.textContent = 'Restablecer ajustes';
    restablecer.addEventListener('click', () => {
      guardarPreferencias({});
      aplicarPreferencias({});
      actualizarBotones(panel, {});
    });
    contenedorOpciones.appendChild(restablecer);

    botonPrincipal.addEventListener('click', () => {
      const abierto = menu.hasAttribute('hidden');
      menu.toggleAttribute('hidden', !abierto);
      botonPrincipal.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });

    document.addEventListener('keydown', evento => {
      if(evento.key === 'Escape' && !menu.hasAttribute('hidden')){
        menu.setAttribute('hidden','');
        botonPrincipal.setAttribute('aria-expanded','false');
        botonPrincipal.focus();
      }
    });

    document.addEventListener('click', evento => {
      if(!panel.contains(evento.target) && !menu.hasAttribute('hidden')){
        menu.setAttribute('hidden','');
        botonPrincipal.setAttribute('aria-expanded','false');
      }
    });

    document.body.appendChild(panel);
    actualizarBotones(panel, limpiarPreferenciasObsoletas(obtenerPreferencias()));
  }

  function iniciarHerramientasComunes(){
    implementarFaviconInstitucional();
    corregirRutasAntiguas();
    crearPanel();
  }

  const preferenciasIniciales = limpiarPreferenciasObsoletas(obtenerPreferencias());
  guardarPreferencias(preferenciasIniciales);
  aplicarPreferencias(preferenciasIniciales);

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', iniciarHerramientasComunes);
  }else{
    iniciarHerramientasComunes();
  }
})();