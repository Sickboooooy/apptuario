import Link from 'next/link';
import { LegalDocument, LegalSection } from '@/components/legal-document';
import { PRIVACY_VERSION } from '@/lib/legal-versions';

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Protección de datos personales"
      title="Aviso de Privacidad Integral"
      version={PRIVACY_VERSION}
    >
      <LegalSection title="1. Responsable y distribución de funciones">
        <p>
          <strong>[NOMBRE O RAZÓN SOCIAL]</strong>, con domicilio en{' '}
          <strong>[DOMICILIO COMPLETO]</strong> y correo{' '}
          <strong>[CORREO DE PRIVACIDAD]</strong>, es responsable de los datos
          utilizados para crear cuentas, autenticar, dar soporte y operar
          AppTuario.
        </p>
        <p>
          Cuando se tratan expedientes, domicilios, rutas, fotografías, audios o
          constancias judiciales, el órgano jurisdiccional conserva el carácter
          de responsable y AppTuario actúa como persona encargada, únicamente
          bajo instrucciones formalizadas. AppTuario{' '}
          <strong>[NO ES / INDICAR SI ES]</strong> un sistema oficial del Poder
          Judicial de la Federación.
        </p>
      </LegalSection>

      <LegalSection title="2. Datos tratados">
        <ul>
          <li>
            Identificación, correo, usuario, contraseña protegida y datos de
            adscripción.
          </li>
          <li>
            Datos técnicos y de seguridad, como sesiones, IP, dispositivo y
            registros de diagnóstico.
          </li>
          <li>
            Domicilios, coordenadas, punto de partida, ubicación autorizada y
            rutas.
          </li>
          <li>
            Expedientes, acuerdos, sentencias, plantillas, destinatarios,
            notificaciones y razones actuariales.
          </li>
          <li>
            Fotografías, audios, notas de campo, calendario, resultados y
            seguimientos.
          </li>
        </ul>
        <p>
          Los documentos pueden contener datos sensibles, de menores, víctimas o
          terceros. Sólo debe incorporarse información necesaria, proporcional y
          legalmente autorizada.
        </p>
      </LegalSection>

      <LegalSection title="3. Finalidades">
        <p>
          Los datos de cuenta se utilizan para registrar y autenticar a la
          persona usuaria, asociar su adscripción, prestar las funciones del
          servicio, brindar soporte, prevenir incidentes y cumplir obligaciones
          legales. La información judicial se trata sólo para organizar
          notificaciones, planear diligencias, registrar resultados y elaborar
          borradores sujetos a revisión humana.
        </p>
        <p>
          No se utilizarán expedientes, evidencia, ubicación o datos sensibles
          para publicidad, venta de datos ni entrenamiento de modelos generales
          <strong> [CONFIRMAR ANTES DE PUBLICAR]</strong>.
        </p>
      </LegalSection>

      <LegalSection title="4. Permisos y decisiones humanas">
        <p>
          La ubicación precisa, cámara y micrófono se activan sólo cuando la
          persona usuaria habilita la función y concede el permiso del
          dispositivo. Las rutas, fechas, extracciones y documentos generados
          son apoyos: no adoptan decisiones judiciales y deben cotejarse antes
          de utilizarse en una actuación.
        </p>
      </LegalSection>

      <LegalSection title="5. Servicios externos">
        <p>
          La infraestructura puede utilizar Cloudflare D1/R2. Los mapas pueden
          utilizar OpenFreeMap y datos de OpenStreetMap; la geocodificación usa
          Nominatim o, si se configura, openrouteservice. A los servicios de
          mapas sólo debe enviarse el domicilio o las coordenadas necesarias,
          nunca nombres, expedientes o notas del juicio. Proveedores, regiones,
          subencargados y transferencias deben confirmarse antes del
          lanzamiento.
        </p>
      </LegalSection>

      <LegalSection title="6. Conservación y seguridad">
        <p>
          Los datos se conservarán por <strong>[PLAZOS POR DEFINIR]</strong> y
          después serán bloqueados, devueltos, eliminados o anonimizados según
          su categoría. La información judicial seguirá las instrucciones y el
          catálogo de disposición documental del órgano responsable.
        </p>
        <p>
          AppTuario aplicará controles de acceso, cifrado en tránsito,
          protección de contraseñas, respaldos, bitácoras y respuesta a
          incidentes <strong>[VALIDAR IMPLEMENTACIÓN]</strong>. Las
          vulneraciones relevantes se comunicarán sin demora al órgano
          responsable.
        </p>
      </LegalSection>

      <LegalSection title="7. Derechos ARCO y contacto">
        <p>
          Para ejercer acceso, rectificación, cancelación u oposición, revocar
          consentimiento o limitar el uso de datos de cuenta, escribe a{' '}
          <strong>[CORREO ARCO]</strong> e incluye nombre, medio de respuesta,
          acreditación de identidad, datos involucrados y derecho solicitado.
          Las solicitudes sobre expedientes se canalizarán a la Unidad de
          Transparencia del órgano responsable.
        </p>
      </LegalSection>

      <LegalSection title="8. Cambios">
        <p>
          Las modificaciones se comunicarán por{' '}
          <strong>[CORREO / AVISO EN LA APP]</strong>. Si se agregan finalidades
          que requieren consentimiento, éste se solicitará antes del nuevo
          tratamiento.
        </p>
      </LegalSection>

      <p>
        Consulta también los{' '}
        <Link href="/legal/terminos">Términos y Condiciones</Link>. El documento
        fuente completo se conserva en la carpeta <code>docs/legal</code> del
        proyecto.
      </p>
    </LegalDocument>
  );
}
