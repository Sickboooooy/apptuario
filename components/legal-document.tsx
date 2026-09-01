import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, FileWarning, Scale } from 'lucide-react';

export function LegalDocument({
  eyebrow,
  title,
  version,
  children,
}: {
  eyebrow: string;
  title: string;
  version: string;
  children: React.ReactNode;
}) {
  return (
    <main className="ambient-glow-wrapper min-h-screen px-4 py-8 text-foreground sm:px-6 lg:py-12">
      <div className="ambient-orb-1" aria-hidden="true" />
      <article className="relative z-10 mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 shadow-2xl backdrop-blur-2xl">
        <header className="border-b border-blue-100 bg-gradient-to-br from-primary via-blue-800 to-slate-950 p-6 text-white sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-bold transition hover:bg-white/20"
            >
              <ArrowLeft className="size-4" /> Volver a AppTuario
            </Link>
            <Image
              src="/apptuario-mark.png"
              alt="AppTuario"
              width={48}
              height={48}
              className="size-12 rounded-xl bg-white p-1"
            />
          </div>
          <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-100">
            {eyebrow}
          </p>
          <h1 className="mt-2 max-w-3xl font-heading text-3xl font-semibold sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-blue-100">Versión {version}</p>
        </header>

        <div className="p-5 sm:p-9">
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <FileWarning className="mt-0.5 size-5 shrink-0" />
            <p>
              <strong>Borrador para revisión jurídica.</strong> No debe
              publicarse ni usarse con expedientes reales hasta sustituir los
              campos pendientes y aprobarlo con el órgano responsable.
            </p>
          </div>
          <div className="legal-copy">{children}</div>

          <footer className="mt-10 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-950">
            <Scale className="mt-0.5 size-5 shrink-0" />
            Este documento es una herramienta de preparación y no sustituye
            asesoría jurídica individualizada ni la revisión de la Unidad de
            Transparencia competente.
          </footer>
        </div>
      </article>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
