# Estructura práctica del repositorio AC

Este repositorio corresponde a **AC = Accesos Complementarios**. Su función es reunir páginas generales de apoyo que complementan los módulos principales de la plataforma CREBE Ucayali.

## Criterio de organización

La página raíz `index.html` funciona como portada general de AC.

Por compatibilidad con otros módulos, algunas páginas públicas se conservan en la raíz, especialmente `contacto.html`, porque otros repositorios enlazan directamente a esa ruta.

La organización recomendada para el crecimiento del repositorio es:

```text
accesos-complementarios/
├── index.html
├── estilos.css
├── README.md
├── assets/
│   └── logo-crebe.png
├── paginas/
│   ├── contacto.html
│   ├── nosotros.html
│   ├── que-hacemos.html
│   └── lineas-de-accion.html
├── directorios/
│   ├── directorio-ciudadano.html
│   └── directorio-institucional.html
├── recursos/
│   ├── calendario.html
│   └── galeria.html
├── firma-tu-visita/
│   ├── index.html
│   ├── estilos.css
│   └── app.js
└── docs/
    ├── estructura-del-proyecto.md
    ├── bitacora-de-cambios.md
    ├── uso-permitido.md
    └── fuentes-y-creditos.md
```

## Uso de carpetas

- `assets/`: recursos visuales generales, como el logo institucional.
- `paginas/`: páginas informativas generales de AC.
- `directorios/`: páginas relacionadas con directorios y entidades.
- `recursos/`: páginas de apoyo visual o informativo, como calendario y galería.
- `firma-tu-visita/`: módulo específico de registro de visita.
- `docs/`: documentación del repositorio.

## Criterio técnico

- HTML: estructura y contenido.
- CSS: diseño visual en archivos separados.
- JS: funcionamiento o interactividad, solo cuando sea necesario.

## Nota de compatibilidad

Si una página ya está enlazada desde otros repositorios, puede mantenerse una ruta de compatibilidad en la raíz para evitar enlaces rotos. Esto aplica especialmente a `contacto.html`.
