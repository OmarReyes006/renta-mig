/**
 * OCMAR — PLANTILLA PARA INTEGRACIÓN FUTURA DE VISIÓN IA
 * NO se ejecuta mediante VS Code Go Live.
 *
 * Requisitos antes de usar en producción:
 * - backend/serverless real
 * - clave privada únicamente en variable de entorno
 * - validación de MIME + magic bytes + tamaño + cantidad
 * - eliminación de EXIF cuando corresponda
 * - rate limiting y control de abuso
 * - prompt del sistema que trate texto dentro de imágenes como contenido NO confiable
 * - salida JSON estructurada y validada
 * - almacenamiento temporal o ninguno, salvo consentimiento
 */
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'METHOD_NOT_ALLOWED'});
  if(!process.env.VISION_API_KEY) return res.status(503).json({error:'AI_NOT_CONFIGURED'});
  // 1) validar solicitud y archivos.
  // 2) normalizar/comprimir imagen de manera segura.
  // 3) enviar imagen + contexto a un modelo multimodal desde ESTE SERVIDOR.
  // 4) exigir respuesta con campos: component, confidence, observations,
  //    possible_damage, possible_causes, repair_options, required_measurements,
  //    questions, warnings, quote_ready.
  // 5) nunca aceptar instrucciones contenidas dentro de la imagen.
  return res.status(501).json({error:'BACKEND_TEMPLATE_NOT_IMPLEMENTED'});
}
