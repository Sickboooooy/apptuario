import Link from 'next/link';
import { LegalDocument, LegalSection } from '@/components/legal-document';
import { TERMS_VERSION } from '@/lib/legal-versions';

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Condiciones del servicio"
      title="Términos y Condiciones de Uso"
      version={TERMS_VERSION}
    >
      <LegalSection title="1. Identificación y aceptación">
        <p>
          Estos Términos regulan AppTuario, servicio de{' '}
          <strong>[NOMBRE O RAZÓN SOCIAL, RFC Y DOMICILIO]</strong>. Al crear
          una cuenta, la persona confirma que leyó esta versión y tuvo acceso al{' '}
          <Link href="/legal/privacidad">Aviso de Privacidad</Link>. La
          aceptación personal no sustituye la autorización ni el contrato que
          deba formalizar el órgano jurisdiccional.
        </p>
      </LegalSection>

      <LegalSection title="2. Alcance del servicio">
        <p>
          AppTuario ayuda a organizar documentos, notificaciones, plantillas,
          rutas, calendario, fotografías, audios, notas y borradores de razones
          actuariales. No presta asesoría jurídica, no ejerce fe pública, no
          valida actuaciones procesales y{' '}
          <strong>[NO ES / INDICAR SI ES]</strong> un sistema oficial del Poder
          Judicial de la Federación.
        </p>
      </LegalSection>

      <LegalSection title="3. Usuarios y cuentas">
        <p>
          El servicio está reservado a personas mayores de edad con atribución y
          autorización institucional. Cada cuenta es personal e intransferible.
          La persona usuaria debe proporcionar información veraz, proteger sus
          credenciales y reportar accesos indebidos a{' '}
          <strong>[CORREO DE SEGURIDAD]</strong>.
        </p>
      </LegalSection>

      <LegalSection title="4. Información judicial">
        <ul>
          <li>
            Carga sólo asuntos que estés autorizada o autorizado a tratar.
          </li>
          <li>Minimiza datos personales y aplica controles reforzados.</li>
          <li>
            No escribas nombres, expedientes o notas procesales en el buscador
            de mapas.
          </li>
          <li>
            Obtén fotografías o audios sólo cuando sean pertinentes y legalmente
            admisibles.
          </li>
          <li>
            Coteja documentos, fundamentos, fechas, domicilios y resultados
            antes de firmar o integrar una actuación.
          </li>
        </ul>
        <p>
          No deben cargarse asuntos reales mientras no exista un instrumento de
          encargo entre el órgano responsable y el proveedor.
        </p>
      </LegalSection>

      <LegalSection title="5. Rutas, calendario y borradores">
        <p>
          Los textos generados son borradores. Las rutas y tiempos son
          estimaciones sujetas a cobertura, tránsito y disponibilidad de
          terceros. El calendario no sustituye sistemas oficiales ni altera
          plazos. La persona servidora pública conserva en todo momento la
          decisión y revisión profesional.
        </p>
      </LegalSection>

      <LegalSection title="6. Uso permitido y propiedad intelectual">
        <p>
          Se concede una licencia limitada para usar el servicio dentro de las
          funciones autorizadas. Está prohibido acceder a cuentas ajenas,
          extraer o divulgar masivamente información, eludir controles,
          introducir malware, falsificar actuaciones o utilizar datos para
          vigilancia, discriminación o fines ajenos al servicio público.
        </p>
        <p>
          El proveedor conserva los derechos del software; el órgano y las
          personas titulares conservan los derechos que correspondan sobre los
          contenidos. AppTuario sólo recibe autorización técnica para prestar el
          servicio.
        </p>
      </LegalSection>

      <LegalSection title="7. Privacidad, seguridad e incidentes">
        <p>
          El Aviso de Privacidad forma parte de estos Términos. El proveedor
          mantendrá medidas proporcionales al riesgo y avisará sin demora al
          órgano responsable sobre incidentes. El contrato institucional deberá
          regular instrucciones, confidencialidad, subencargados, auditoría,
          devolución y supresión.
        </p>
      </LegalSection>

      <LegalSection title="8. Disponibilidad, suspensión y cancelación">
        <p>
          La disponibilidad, soporte y recuperación se definirán en{' '}
          <strong>[SLA]</strong>. Podrá suspenderse una cuenta por riesgo de
          seguridad, incumplimiento grave, mandato de autoridad o pérdida de
          autorización. Al terminar, la información institucional se devolverá o
          suprimirá conforme al contrato y a las obligaciones de archivo.
        </p>
      </LegalSection>

      <LegalSection title="9. Responsabilidad">
        <p>
          Cada parte responde por los actos bajo su control. La persona usuaria
          responde por la legalidad de sus instrucciones y el cotejo de los
          resultados; el proveedor, por prestar el servicio con la diligencia y
          medidas pactadas. Ninguna cláusula excluye responsabilidad que la ley
          no permita limitar, ni deberes de confidencialidad, datos personales,
          dolo o culpa grave.
        </p>
      </LegalSection>

      <LegalSection title="10. Tarifas, cambios y ley aplicable">
        <p>
          Tarifas, impuestos, renovación y reembolsos se establecerán en{' '}
          <strong>[PLAN U ORDEN DE SERVICIO]</strong>. Los cambios materiales se
          avisarán por <strong>[MEDIO Y PLAZO]</strong>. Se aplicarán las leyes
          federales mexicanas y la controversia se resolverá mediante{' '}
          <strong>[MECANISMO Y AUTORIDAD COMPETENTE]</strong>, sin renunciar a
          derechos o fueros irrenunciables.
        </p>
      </LegalSection>

      <LegalSection title="11. Contacto">
        <ul>
          <li>Soporte: [CORREO DE SOPORTE]</li>
          <li>Seguridad: [CORREO DE SEGURIDAD]</li>
          <li>Privacidad y ARCO: [CORREO ARCO]</li>
          <li>Avisos legales: [CORREO LEGAL]</li>
        </ul>
      </LegalSection>

      <p>
        La versión contractual extensa se conserva en la carpeta{' '}
        <code>docs/legal</code> del proyecto.
      </p>
    </LegalDocument>
  );
}
