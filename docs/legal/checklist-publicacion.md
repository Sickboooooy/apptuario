# Checklist legal y operativo previo a publicar AppTuario

Estado: **bloqueante para uso con expedientes reales**.

## Datos que debe proporcionar el titular de AppTuario

- [ ] Nombre o razón social, tipo societario y RFC.
- [ ] Domicilio legal completo.
- [ ] Correo de soporte, correo legal, correo de seguridad y correo ARCO.
- [ ] Persona o departamento de datos personales.
- [ ] URL pública definitiva y fecha de entrada en vigor.
- [ ] Modelo comercial: gratuito, prueba, suscripción individual o contrato institucional.
- [ ] Ley, tribunales o mecanismo de solución de controversias legalmente procedente.

## Infraestructura y proveedores

- [ ] Confirmar cuenta y contrato de Cloudflare, regiones de D1/R2, respaldos y subencargados.
- [ ] Inventariar telemetría, correo, soporte, analítica y monitoreo; no habilitar proveedores no incluidos en el aviso.
- [ ] Confirmar condiciones de OpenFreeMap, OpenStreetMap/Nominatim y openrouteservice.
- [ ] Definir si la geocodificación pública se sustituirá por Nominatim/OSRM/VROOM autohospedados antes de tratar casos reales.
- [ ] Documentar todas las remisiones o transferencias nacionales e internacionales.

## Gobierno de datos

- [ ] Formalizar contrato de encargo con cada órgano responsable, incluyendo instrucciones, seguridad, incidentes, subencargados, devolución y supresión.
- [ ] Realizar con el órgano responsable una evaluación de impacto en protección de datos antes de operar un tratamiento intensivo o relevante.
- [ ] Aprobar tabla de conservación por categoría y ciclo de eliminación de respaldos.
- [ ] Documentar procedimiento ARCO y canalización a la Unidad de Transparencia para información judicial.
- [ ] Definir y probar respuesta a incidentes, notificación al responsable y preservación de evidencias.
- [ ] Adoptar controles reforzados para datos sensibles, menores, víctimas y expedientes reservados.
- [ ] Confirmar por contrato que los datos judiciales no se usan para publicidad ni entrenamiento de modelos generales.

## Producto

- [ ] Mostrar aviso simplificado antes de obtener datos y enlazar el aviso integral.
- [ ] Exigir aceptación de Términos y registrar versión, fecha, usuario y evidencia técnica mínima.
- [ ] Solicitar permisos de ubicación, cámara y micrófono sólo al activar cada función.
- [ ] Permitir cerrar sesión, solicitar cancelación y exportar/devolver información.
- [ ] Mantener revisión humana obligatoria en documentos, rutas, fechas y recordatorios.
- [ ] Separar datos por usuario y órgano; aplicar mínimo privilegio y bitácoras de acceso.
- [ ] Realizar pruebas de seguridad y restauración antes del piloto.

## Aprobaciones

- [ ] Revisión de abogada o abogado mexicano especialista en privacidad, tecnología y contratación pública.
- [ ] Revisión de la Unidad de Transparencia y del área de seguridad/tecnologías del órgano piloto.
- [ ] Aprobación de identidad, marca y cualquier referencia al Poder Judicial de la Federación.
- [ ] Firma del contrato institucional, encargo de tratamiento y SLA antes de cargar información real.

Hasta concluir estos puntos, usar exclusivamente datos ficticios o anonimizados.
