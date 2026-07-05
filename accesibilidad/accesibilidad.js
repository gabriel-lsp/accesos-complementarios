/* Herramienta común de accesibilidad para EVA / Accesos Complementarios.
   Insertar en cualquier página junto al CSS común. */

(function(){
  const STORAGE_KEY = 'eva_accesibilidad_preferencias';
  const CLASES = ['eva-alto-contraste','eva-texto-grande','eva-texto-muy-grande','eva-espaciado-amplio','eva-reducir-movimiento'];

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

  function insertarRefuerzoContraste(){
    if(document.getElementById('eva-refuerzo-contraste')) return;
    const estilo = document.createElement('style');
    estilo.id = 'eva-refuerzo-contraste';
    estilo.textContent = `
      html.eva-alto-contraste body .panel-presentacion,
      html.eva-alto-contraste body .aviso-pedagogico,
      html.eva-alto-contraste body .tarjeta-material,
      html.eva-alto-contraste body .nota{
        color:#ffffff!important;
        background:#000000!important;
        border-color:#ffffff!important;
        box-shadow:none!important;
      }
      html.eva-alto-contraste body .panel-presentacion h2,
      html.eva-alto-contraste body .panel-presentacion p,
      html.eva-alto-contraste body .aviso-pedagogico h2,
      html.eva-alto-contraste body .aviso-pedagogico p,
      html.eva-alto-contraste body .tarjeta-material h3,
      html.eva-alto-contraste body .tarjeta-material p,
      html.eva-alto-contraste body .nota h2,
      html.eva-alto-contraste body .nota p{
        color:#ffffff!important;
        background:transparent!important;
        text-shadow:none!important;
        opacity:1!important;
      }
      html.eva-alto-contraste body .material-icono,
      html.eva-alto-contraste body .estado-material,
      html.eva-alto-contraste body .enlace-material{
        color:#ffff00!important;
        background:#07324a!important;
        border:1px solid #ffff00!important;
      }
    `;
    document.head.appendChild(estilo);
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
    insertarRefuerzoContraste();
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

  const preferenciasIniciales = limpiarPreferenciasObsoletas(obtenerPreferencias());
  guardarPreferencias(preferenciasIniciales);
  aplicarPreferencias(preferenciasIniciales);

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', crearPanel);
  }else{
    crearPanel();
  }
})();
