# OCMAR WEB — versión profesional Go Live

Sitio estático preparado para abrirse directamente en **VS Code + Live Server / Go Live**. No necesita npm ni instalar librerías.

## Abrir
1. Descomprime el ZIP de OCMAR V5.
2. Abre la carpeta `OCMAR_WEB` en VS Code.
3. Abre `index.html`.
4. Pulsa **Go Live**.

## Incluye
- Loader OCMAR con engrane y progreso.
- Portada interactiva estilo panel técnico.
- Navegación responsive y progreso de scroll.
- Selector interactivo de necesidad.
- Presentación de OCMAR y servicios.
- Sección **PROYECTOS OCMAR** sin inventar trabajos realizados.
- Página `proyectos.html` preparada para ir agregando trabajos reales.
- Asistente OCMAR local con base industrial ampliada.
- Más de 40 familias de piezas/componentes y reglas de fallas, materiales y procesos.
- Respuestas para fabricación, reparación, identificación de pieza, procesos, materiales y síntomas.
- Subida y previsualización de hasta 5 fotografías.
- Revisión local de calidad de fotografía (resolución, iluminación y contraste).
- Expediente de cotización en 4 pasos.
- Fotografías + plano/croquis + medidas + condiciones de operación.
- Resumen en vivo y porcentaje de completitud del expediente.
- Transferencia automática de un caso del Asistente a Cotización.
- El número de OCMAR no se muestra públicamente en la interfaz de cotización; se conserva únicamente como destino interno de la prueba de WhatsApp.
- Página 404.

## Importante: imágenes y chatbot
Con **Go Live** todo funciona en frontend. Esta versión NO finge reconocer el contenido de una fotografía. Puede revisar calidad básica de la imagen y usar toda la descripción escrita para generar orientación industrial local.

Para que el asistente identifique visualmente engranes, fracturas, dientes desgastados, corrosión, etc. hace falta un modelo multimodal conectado desde un backend seguro. La carpeta `backend-template/` queda como punto de partida.

Nunca pongas una API key privada en HTML, `assets/js/` o `config.js`.

## Configuración OCMAR
Archivo: `assets/js/config.js`

Actualmente el número de WhatsApp de prueba está configurado internamente en `config.js`, pero no se muestra en la interfaz pública.

```js
whatsapp: '527731568378'
```

Cuando el sitio pase a producción, conviene mover cualquier integración automática a backend y mantener credenciales fuera del frontend.

## Cotización
`cotizar.html` utiliza un expediente de 4 pasos:
1. Contacto e identificación obligatoria: nombre completo, teléfono, correo, dirección, estado y municipio/alcaldía.
2. Pieza, servicio, condición, operación y prioridad real del caso.
3. Fotografías y plano/croquis.
4. Revisión, consentimiento de uso de datos y generación del PDF.

En Go Live los archivos seleccionados NO se envían a un servidor. Se mantienen localmente en la sesión del navegador. El resumen deja claro que las imágenes/plano deben enviarse al contacto OCMAR.

## Base de conocimiento
Archivo: `data/knowledge.js`

Contiene familias como engranes, piñones, sprockets, ejes, bujes, poleas, bridas, coples, chumaceras, rodamientos, roscas, chaveteros, rodillos, husillos, sinfines, coronas, bombas, reductores, placas, soportes, soldaduras, pernos, boquillas, cuchillas, matrices, troqueles, carcasas, guías, levas, cremalleras, tensores, válvulas, cilindros, transportadores, mezcladoras, molinos y componentes de máquinas para tortillas.

También contiene reglas sobre desgaste, vibración, ruido, calentamiento, juego, fractura, corrosión, fuga, deformación, materiales y procesos.

## Proyectos OCMAR
No se agregaron fotografías falsas como si fueran trabajos realizados. Cuando tengas un proyecto real, puedes sustituir las tarjetas `PRÓXIMAMENTE` de `index.html` / `proyectos.html` por fotos y datos del trabajo.

## Seguridad
- Sin claves privadas en frontend.
- Fotos locales no se cargan a un servidor.
- No se ejecutan archivos del visitante.
- El análisis real por IA debe realizarse en backend/serverless con variables de entorno.
- Para producción con backend: validar MIME/firma/tamaño, aplicar rate limiting, CSP, headers de seguridad y procesamiento temporal de imágenes.

## V3 - PDF de cotización + WhatsApp

El formulario de cotización genera un PDF local profesional desde el navegador.

- Teléfono / WhatsApp OCMAR configurado: 773 156 8378 (formato wa.me: 527731568378).
- Las fotografías JPG/PNG/WEBP seleccionadas se convierten e incrustan en el PDF.
- Si el plano es una imagen, también se incrusta en el PDF.
- Si el plano es un PDF externo, el expediente registra su nombre, pero el archivo original debe enviarse junto con la solicitud (la versión estática no fusiona PDFs externos).
- En celular, cuando el navegador soporta Web Share con archivos, el botón "Enviar PDF por WhatsApp" abre el menú nativo con el PDF adjunto. Selecciona WhatsApp y el contacto OCMAR.
- En PC, el botón descarga el PDF y abre el chat directo de OCMAR con un mensaje prellenado; el usuario debe adjuntar el PDF descargado.

### Por qué no se adjunta automáticamente a un número desde Go Live

Un sitio HTML estático no tiene permiso para insertar automáticamente un archivo en una conversación específica de WhatsApp. Para envío 100% automático al 773 156 8378 se necesita un backend seguro y la API oficial de WhatsApp Business/Cloud API. Esa integración debe guardar las credenciales únicamente en variables de entorno del servidor.

### Correo

La arquitectura puede ampliarse para enviar el mismo PDF por correo. Para hacerlo automáticamente también se requiere un backend o servicio transaccional; no se deben exponer credenciales SMTP/API en JavaScript del navegador.


## V4 - datos obligatorios + prioridad de cotización

- Se eliminó el bloque público “¿Prefieres explicarlo por teléfono?” y el número visible de la página de cotización.
- Son obligatorios: nombre completo, teléfono, correo electrónico, dirección completa, estado y municipio/alcaldía.
- El teléfono requiere un formato de al menos 10 dígitos y el correo se valida antes de permitir continuar.
- La prioridad es obligatoria: puede esperar, prioritaria, urgente por equipo/producción detenida o fecha límite específica.
- Si se selecciona fecha límite específica, la fecha se vuelve obligatoria.
- Se informa claramente que marcar un caso como urgente no garantiza respuesta inmediata ni fecha de entrega.
- El PDF incluye dirección, estado, municipio, prioridad y la nota realista sobre tiempo de revisión/cotización.
- Se añadió autorización para usar los datos únicamente para revisar, preparar y dar seguimiento a la solicitud.


## V5 - identidad visual + vista previa + entrega del PDF

- La portada ahora hace protagonista al logotipo OCMAR.
- Se integró un torno industrial oscuro como ambientación fija y muy sutil en toda la página, con una presencia mayor en el hero.
- Se agregó una ruta visual de 4 pasos: recibir, analizar, proponer y cotizar.
- La pantalla de revisión muestra también una tira con las fotografías/plano seleccionados.
- Al generar el expediente ya no se descarga inmediatamente: primero aparece una **vista previa real del PDF dentro de la página**.
- Los botones de envío permanecen bloqueados hasta que el cliente confirme que revisó el PDF.
- Se agregó un botón genérico **Compartir PDF** que utiliza Web Share con el archivo adjunto cuando el navegador lo permite.
- El botón **WhatsApp** intenta compartir el PDF como archivo en móvil; en PC descarga el PDF y abre el chat configurado para que se adjunte manualmente.
- Se agregó **Correo electrónico**. El correo se configura en `assets/js/config.js` con `email: '...'`. En dispositivos compatibles puede compartirse el PDF como archivo; en PC se descarga y se prepara un `mailto:` con asunto y mensaje.
- No se inventó un correo de OCMAR. Hasta que agregues el correo real, el botón de correo permanece deshabilitado.

### Envío automático real en producción

Para que el cliente pulse un botón y el PDF llegue automáticamente a un WhatsApp o correo específico sin abrir el menú de compartir ni adjuntarlo manualmente, se necesita un backend. En Vercel puede conectarse una función `/api/send-quote` con:

- API oficial de WhatsApp Business / Cloud API para WhatsApp.
- Un proveedor de correo transaccional o SMTP seguro para correo.
- Variables de entorno para credenciales.
- Validación server-side, límites de tamaño y protección contra abuso.

No coloques tokens de WhatsApp, SMTP ni claves de correo en `config.js`.

## V6 — Revisión física + Ingeniería útil

Esta versión agrega:

- Solicitud condicional de revisión física en sitio.
- Datos de empresa/planta, ubicación exacta, estado, municipio, responsable, teléfono, horario, Maps y requisitos de acceso.
- Validación obligatoria de los datos de visita cuando el cliente solicita revisión física.
- Inclusión de la revisión física dentro del resumen y PDF.
- Botones de revisión/envío rediseñados con microinteracciones.
- Explorador interactivo de materiales en la página principal.
- Datos industriales sobre acero al carbono, acero aleado, inoxidable, aluminio, bronce y polímeros de ingeniería.
- Notas educativas sobre desgaste, contexto de cotización y criterio reparación vs. fabricación.

### Importante sobre materiales
La información de materiales en la página es orientativa. OCMAR no afirma el grado, dureza, tratamiento térmico o aptitud definitiva de un material únicamente por una fotografía; la selección final puede requerir muestra, plano, medición o datos de operación.

### Correo de cotizaciones
El botón de correo queda preparado, pero requiere colocar el correo oficial de OCMAR en `assets/js/config.js` en la propiedad `email`. No se inventó un correo de empresa.


## V7 — Aviso previo a cotización
Antes de mostrar el formulario de cotización se presenta un aviso informativo para que el cliente prepare mínimo 4 fotografías de la pieza y, si cuenta con plano o croquis, lo tenga completo. La carga de archivos sigue realizándose exclusivamente en el paso 03 — Evidencia.
