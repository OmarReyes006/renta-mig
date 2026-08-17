# TULAFEST — Web Interactiva Demo

Demo estática de una experiencia web premium para evento juvenil nocturno.

## Abrir en Visual Studio Code

1. Descomprime el ZIP.
2. Abre la carpeta en Visual Studio Code.
3. Abre `index.html`.
4. Puedes usar la extensión Live Server y pulsar **Go Live**.

## Publicar

El proyecto utiliza rutas relativas y no necesita backend, `.env`, claves privadas ni base de datos.

Es compatible con hosting estático como:

- GitHub Pages
- Netlify

## Archivos principales

- `index.html` — estructura de la página.
- `css/styles.css` — diseño y responsive.
- `js/main.js` — countdown, audio, modales, navegación, galería y animaciones.
- `assets/images/` — recursos visuales SVG de la demo.
- `assets/audio/` — pista de audio demo local.

## Datos rápidos que puedes modificar

En `js/main.js` puedes cambiar la fecha del evento en:

```js
const EVENT_DATE = new Date('2026-11-14T20:00:00-06:00');
```

Los nombres, precios, lugar y textos están directamente en `index.html` para que puedas modificarlos sin herramientas adicionales.

## Nota

TULAFEST es un concepto ficticio creado únicamente como demo comercial. Los precios de entradas y disponibilidad son demostrativos y no procesan pagos reales.


## Soundtrack

Esta versión usa el video de YouTube indicado por el cliente como soundtrack mediante el YouTube IFrame Player API. No se descarga ni se incluye una copia del audio dentro del ZIP. Por ello, la música requiere conexión a internet y depende de que el video continúe disponible y permita reproducción embebida.

Video configurado: `jNk9tM6VtKM` — L-GANTE RKT — DJ TAO ft. PAPU DJ.

## Paleta Premium Neon V2

La paleta se refinó a obsidian black + sapphire electric + ultraviolet + ice cyan + orchid suave. Se redujo el magenta intenso y se eliminó el verde neón para conservar una apariencia más premium.
