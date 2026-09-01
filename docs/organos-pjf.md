# Catálogo de órganos del Poder Judicial de la Federación

Actualización de referencia: 31 de agosto de 2026.

## Estructura jurídica

El artículo 1 de la Ley Orgánica del Poder Judicial de la Federación enumera
ocho clases de órganos:

1. Suprema Corte de Justicia de la Nación.
2. Tribunal Electoral.
3. Plenos Regionales.
4. Tribunales Colegiados de Circuito.
5. Tribunales Colegiados de Apelación.
6. Juzgados de Distrito.
7. Tribunal de Disciplina Judicial.
8. Órgano de Administración Judicial.

Fuente primaria: [Ley Orgánica del Poder Judicial de la Federación, artículo 1](https://www.scjn.gob.mx/sites/default/files/conoce_la_corte/marco_normativo/documento/pdf/2025-01/Ley-Organica-PJF-20241220.pdf).

## Alcance del selector de adscripción

El registro de AppTuario muestra órganos que ejercen jurisdicción y en los que
puede existir trabajo de notificación: SCJN, salas del TEPJF y los órganos que
publica el directorio del OAJ por los 32 circuitos. El catálogo operativo del
OAJ también comprende Centros de Justicia Penal Federal, Tribunales Laborales
Federales, el Centro Nacional de Justicia Especializado y órganos auxiliares.

El Tribunal de Disciplina Judicial y el Órgano de Administración Judicial sí
forman parte del PJF, pero no se presentan como órganos jurisdiccionales
ordinarios en este selector. Si posteriormente se habilitan perfiles
administrativos o disciplinarios, deberán aparecer en un tipo de adscripción
separado.

## Fuente de datos

- [Directorio oficial de órganos jurisdiccionales del OAJ](https://www.oaj.gob.mx/DIrectorios/OrgJurisdiccionales.aspx).
- [Salas Regionales del Tribunal Electoral](https://www.te.gob.mx/front3/ContenidoSalas/salasRegionales).
- [Ley Orgánica del Poder Judicial de la Federación](https://www.scjn.gob.mx/conoce-la-corte/marco-normativo/leyes-expedidas-por-el-congreso-de-la-union/ley-organica-del-poder).

La API `GET /api/federal-courts?circuit={1..32}` consulta el directorio oficial
sin enviar información personal y conserva el resultado en memoria durante 12
horas. La fuente oficial es dinámica, por lo que altas, cierres, cambios de
denominación o residencia se reflejan al renovarse la caché.
