'use client';

import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import Image from 'next/image';
import {
  BadgeCheck,
  Building2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FederalCourt } from '@/lib/federal-courts';
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/legal-versions';

type Circuit = { id: number; name: string };

export type AppUser = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  courtName: string | null;
  courtId?: string | null;
  courtCircuit?: number | null;
  courtType?: string | null;
};

export function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (user: AppUser) => void;
}) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [courts, setCourts] = useState<FederalCourt[]>([]);
  const [circuit, setCircuit] = useState(3);
  const [courtId, setCourtId] = useState('');
  const [courtSearch, setCourtSearch] = useState('');
  const [courtsLoading, setCourtsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void fetch('/api/federal-courts')
      .then(async (response) => {
        if (!response.ok)
          throw new Error('No fue posible cargar los circuitos.');
        return response.json() as Promise<{ circuits: Circuit[] }>;
      })
      .then((data) => setCircuits(data.circuits))
      .catch((error: unknown) => {
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'No fue posible cargar el directorio.',
        );
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/federal-courts?circuit=${circuit}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = (await response.json()) as {
          courts?: FederalCourt[];
          error?: string;
        };
        if (!response.ok)
          throw new Error(data.error ?? 'No fue posible cargar los órganos.');
        return data.courts ?? [];
      })
      .then((records) => {
        setCourts(records);
        setCourtsLoading(false);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        setCourts([]);
        setCourtsLoading(false);
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'No fue posible cargar el directorio.',
        );
      });
    return () => controller.abort();
  }, [circuit]);

  const filteredCourts = useMemo(() => {
    const needle = courtSearch.trim().toLocaleLowerCase('es-MX');
    if (!needle) return courts;
    return courts.filter((court) =>
      `${court.name} ${court.type} ${court.address}`
        .toLocaleLowerCase('es-MX')
        .includes(needle),
    );
  }, [courtSearch, courts]);

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus('submitting');
    setMessage('');

    try {
      if (mode === 'register') {
        const passwordValue = form.get('password');
        const confirmationValue = form.get('passwordConfirmation');
        const password = typeof passwordValue === 'string' ? passwordValue : '';
        const confirmation =
          typeof confirmationValue === 'string' ? confirmationValue : '';
        if (password !== confirmation)
          throw new Error('Las contraseñas no coinciden.');
        const selectedCourt = courts.find((court) => court.id === courtId);
        if (!selectedCourt)
          throw new Error(
            'Selecciona tu órgano jurisdiccional de adscripción.',
          );
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: form.get('displayName'),
            email: form.get('email'),
            username: form.get('username'),
            password,
            courtId: selectedCourt.id,
            courtName: selectedCourt.name,
            courtAddress: selectedCourt.address,
            courtCircuit: selectedCourt.circuit,
            courtType: selectedCourt.type,
            courtSource: selectedCourt.source,
            acceptedLegal: form.get('acceptedLegal') === 'on',
            termsVersion: TERMS_VERSION,
            privacyVersion: PRIVACY_VERSION,
          }),
        });
        const data = (await response.json()) as {
          user?: AppUser;
          error?: string;
        };
        if (!response.ok || !data.user)
          throw new Error(data.error ?? 'No fue posible crear la cuenta.');
        onAuthenticated(data.user);
      } else {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: form.get('identity'),
            password: form.get('password'),
          }),
        });
        const data = (await response.json()) as {
          user?: AppUser;
          error?: string;
        };
        if (!response.ok || !data.user)
          throw new Error(data.error ?? 'No fue posible iniciar sesión.');
        onAuthenticated(data.user);
      }
    } catch (error) {
      setStatus('error');
      setMessage(
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      );
    }
  }

  return (
    <main className="ambient-glow-wrapper relative min-h-screen overflow-hidden px-4 py-8 text-foreground sm:px-6 lg:grid lg:place-items-center lg:py-12">
      <div className="ambient-orb-1" aria-hidden="true" />
      <div className="ambient-orb-2" aria-hidden="true" />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/72 shadow-2xl backdrop-blur-2xl lg:grid-cols-[0.78fr_1.22fr]">
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-800 to-slate-950 p-7 text-white sm:p-10 lg:p-12">
          <div
            className="absolute -right-24 -top-20 size-72 rounded-full bg-blue-400/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="grid size-14 place-items-center rounded-2xl bg-white/95 p-1.5 shadow-lg">
                <Image
                  src="/apptuario-mark.png"
                  alt="AppTuario"
                  width={52}
                  height={52}
                  className="size-full object-contain"
                  priority
                />
              </div>
              <div>
                <p className="font-heading text-3xl font-bold">AppTuario</p>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
                  Gestión actuarial
                </p>
              </div>
            </div>
            <h1 className="mt-10 max-w-md font-heading text-3xl font-semibold leading-tight sm:text-4xl">
              Tu adscripción judicial, desde el primer acceso.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-blue-100 sm:text-base">
              Configura una cuenta individual y vincúlala con el órgano
              jurisdiccional federal donde prestas servicio.
            </p>
            <div className="mt-9 space-y-4 text-sm">
              {[
                [
                  'Directorio oficial',
                  '32 circuitos judiciales y órganos nacionales',
                ],
                [
                  'Cuenta protegida',
                  'Contraseña derivada con PBKDF2 y sesión segura',
                ],
                [
                  'Datos separados',
                  'Cada usuario conserva su propia adscripción y asuntos',
                ],
              ].map(([title, description]) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-400/15 text-emerald-200">
                    <BadgeCheck className="size-4" />
                  </span>
                  <span>
                    <strong className="block">{title}</strong>
                    <span className="text-blue-100/80">{description}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="p-5 sm:p-8 lg:p-10">
          <div
            className="mb-7 flex rounded-xl border border-slate-200 bg-slate-100/80 p-1"
            role="tablist"
            aria-label="Acceso a AppTuario"
          >
            {(['register', 'login'] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => {
                  setMode(value);
                  setMessage('');
                  setStatus('idle');
                }}
                className={`min-h-10 flex-1 rounded-lg px-3 text-sm font-bold transition ${mode === value ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'}`}
              >
                {value === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {mode === 'register'
                ? 'Registro institucional'
                : 'Bienvenido de vuelta'}
            </p>
            <h2 className="mt-1 font-heading text-2xl font-semibold sm:text-3xl">
              {mode === 'register'
                ? 'Crea tu espacio de trabajo'
                : 'Accede a tu jornada'}
            </h2>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' ? (
              <>
                <Field icon={UserRound} label="Nombre completo">
                  <input
                    name="displayName"
                    autoComplete="name"
                    required
                    minLength={3}
                    className="auth-input"
                    placeholder="Lic. Alejandra Torres"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field icon={Mail} label="Correo electrónico">
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="auth-input"
                      placeholder="nombre@correo.gob.mx"
                    />
                  </Field>
                  <Field icon={UserRound} label="Nombre de usuario">
                    <input
                      name="username"
                      autoComplete="username"
                      required
                      minLength={4}
                      maxLength={30}
                      pattern="[A-Za-z0-9._-]+"
                      className="auth-input"
                      placeholder="alejandra.torres"
                    />
                  </Field>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/55 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-primary">
                    <Building2 className="size-4" /> Adscripción jurisdiccional
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-xs font-bold text-foreground/80">
                      Circuito judicial
                      <select
                        value={circuit}
                        onChange={(event) => {
                          setCourtsLoading(true);
                          setCourtId('');
                          setCourtSearch('');
                          setCircuit(Number(event.target.value));
                        }}
                        className="auth-input"
                        required
                      >
                        <option value={0}>
                          Órganos de competencia nacional
                        </option>
                        {circuits.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.id}.º circuito — {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1.5 text-xs font-bold text-foreground/80">
                      Filtrar directorio
                      <span className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          value={courtSearch}
                          onChange={(event) =>
                            setCourtSearch(event.target.value)
                          }
                          className="auth-input pl-9"
                          placeholder="Materia, ciudad u órgano"
                        />
                      </span>
                    </label>
                  </div>
                  <label className="mt-3 grid gap-1.5 text-xs font-bold text-foreground/80">
                    Órgano jurisdiccional
                    <select
                      value={courtId}
                      onChange={(event) => setCourtId(event.target.value)}
                      className="auth-input"
                      required
                      disabled={courtsLoading}
                    >
                      <option value="">
                        {courtsLoading
                          ? 'Consultando directorio oficial…'
                          : `Selecciona entre ${filteredCourts.length} órganos`}
                      </option>
                      {filteredCourts.map((court) => (
                        <option key={court.id} value={court.id}>
                          {court.name} — {court.address}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                    Fuente:{' '}
                    <a
                      href="https://www.oaj.gob.mx/DIrectorios/OrgJurisdiccionales.aspx"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-primary underline-offset-2 hover:underline"
                    >
                      Directorio oficial del OAJ
                    </a>
                    . La consulta sólo envía el número de circuito.
                  </p>
                </div>
              </>
            ) : (
              <Field icon={UserRound} label="Usuario o correo">
                <input
                  name="identity"
                  autoComplete="username"
                  required
                  className="auth-input"
                  placeholder="alejandra.torres"
                />
              </Field>
            )}

            <div
              className={`grid gap-4 ${mode === 'register' ? 'sm:grid-cols-2' : ''}`}
            >
              <Field icon={LockKeyhole} label="Contraseña">
                <span className="relative block">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={
                      mode === 'register' ? 'new-password' : 'current-password'
                    }
                    required
                    minLength={mode === 'register' ? 12 : 1}
                    className="auth-input pr-11"
                    placeholder={
                      mode === 'register' ? '12+ caracteres' : 'Tu contraseña'
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-slate-100"
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </span>
              </Field>
              {mode === 'register' ? (
                <Field icon={ShieldCheck} label="Confirmar contraseña">
                  <input
                    name="passwordConfirmation"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={12}
                    className="auth-input"
                    placeholder="Repite tu contraseña"
                  />
                </Field>
              ) : null}
            </div>
            {mode === 'register' ? (
              <p className="text-[11px] leading-4 text-muted-foreground">
                Usa al menos 12 caracteres con mayúscula, minúscula y número.
                AppTuario nunca conserva la contraseña en texto legible.
              </p>
            ) : null}

            {mode === 'register' ? (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/55 p-3.5 text-xs leading-5 text-slate-700">
                <input
                  name="acceptedLegal"
                  type="checkbox"
                  required
                  className="mt-1 size-4 shrink-0 accent-blue-800"
                />
                <span>
                  Leí y acepto los{' '}
                  <a
                    href="/legal/terminos"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-primary underline underline-offset-2"
                  >
                    Términos y Condiciones
                  </a>{' '}
                  versión {TERMS_VERSION}. Confirmo que se puso a mi disposición
                  el{' '}
                  <a
                    href="/legal/privacidad"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-primary underline underline-offset-2"
                  >
                    Aviso de Privacidad
                  </a>{' '}
                  versión {PRIVACY_VERSION}.
                </span>
              </label>
            ) : null}

            {message ? (
              <p
                role="alert"
                className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-950"
              >
                {message}
              </p>
            ) : null}
            <Button
              type="submit"
              variant="glass-primary"
              size="lg"
              disabled={
                status === 'submitting' ||
                (mode === 'register' && courtsLoading)
              }
              className="h-12 w-full font-bold"
            >
              {status === 'submitting' ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <ShieldCheck />
              )}
              {status === 'submitting'
                ? 'Procesando…'
                : mode === 'register'
                  ? 'Crear cuenta y continuar'
                  : 'Iniciar sesión'}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof UserRound;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-bold text-foreground/80">
      <span className="flex items-center gap-1.5">
        <Icon className="size-3.5 text-primary" />
        {label}
      </span>
      {children}
    </label>
  );
}
