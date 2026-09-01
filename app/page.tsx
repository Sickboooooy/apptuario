'use client';

import { useEffect, useState, type SyntheticEvent } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Files,
  Gavel,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MapPin,
  Mic,
  Navigation,
  Plus,
  Route,
  Search,
  Settings,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuthScreen, type AppUser } from '@/components/auth-screen';
import { RoutePlanner } from '@/components/route-planner';

const notifications = [
  {
    time: '09:30',
    type: 'Personal',
    name: 'Oficialía de Partes — Zona Centro',
    address: 'Calle Degollado, Guadalajara Centro, Jalisco',
    case: 'Amparo indirecto 428/2026',
    status: 'Por iniciar',
    tone: 'blue' as const,
  },
  {
    time: '11:15',
    type: 'Citatorio',
    name: 'Coordinación Jurídica — San Juan de Dios',
    address: 'Instituto Cultural Cabañas, Guadalajara, Jalisco',
    case: 'Amparo indirecto 511/2026',
    status: 'Pendiente',
    tone: 'amber' as const,
  },
  {
    time: '13:00',
    type: 'Oficio',
    name: 'Autoridad responsable — Arcos Vallarta',
    address: 'La Minerva, Av. López Mateos Sur, Guadalajara, Jalisco',
    case: 'Amparo en revisión 92/2026',
    status: 'Pendiente',
    tone: 'slate' as const,
  },
];

const navItems = [
  { label: 'Inicio', icon: LayoutDashboard },
  { label: 'Expedientes', icon: Files },
  { label: 'Ruta diaria', icon: Route },
  { label: 'Calendario', icon: CalendarDays },
  { label: 'Plantillas', icon: FileCheck2 },
];

export default function Home() {
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeView, setActiveView] = useState('Inicio');
  const [modal, setModal] = useState<
    'upload' | 'notification' | 'evidence' | null
  >(null);
  const [routeStarted, setRouteStarted] = useState(false);

  useEffect(() => {
    void fetch('/api/auth/session')
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as { user?: AppUser };
        return data.user ?? null;
      })
      .then((user) => setAppUser(user))
      .finally(() => setAuthChecked(true));
  }, []);

  async function logout() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    setAppUser(null);
  }

  if (!authChecked) {
    return (
      <main className="ambient-glow-wrapper grid min-h-screen place-items-center text-primary">
        <span className="grid place-items-center gap-3 text-sm font-bold">
          <LoaderCircle className="size-8 animate-spin" />
          Preparando tu espacio seguro…
        </span>
      </main>
    );
  }

  if (!appUser) return <AuthScreen onAuthenticated={setAppUser} />;

  return (
    <div className="ambient-glow-wrapper overflow-x-hidden text-foreground">
      {/* Ambient background light orbs for rich glassmorphic refraction */}
      <div className="ambient-orb-1" aria-hidden="true" />
      <div className="ambient-orb-2" aria-hidden="true" />
      <div className="ambient-orb-3" aria-hidden="true" />

      {/* Glassmorphic Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[256px] border-r border-white/60 bg-white/70 backdrop-blur-2xl shadow-[4px_0_24px_rgba(30,58,138,0.03)] dark:border-white/10 dark:bg-slate-900/70 lg:flex lg:flex-col">
        <div className="flex h-20 items-center gap-3.5 border-b border-white/50 px-6 dark:border-white/10">
          <div className="grid size-11 place-items-center overflow-hidden rounded-2xl bg-white/90 p-1 shadow-sm ring-1 ring-white/80 backdrop-blur-md">
            <Image
              src="/apptuario-mark.png"
              alt="AppTuario"
              width={44}
              height={44}
              className="size-full object-contain"
              priority
            />
          </div>
          <div>
            <p className="font-heading text-[23px] font-bold leading-none tracking-tight text-primary">
              AppTuario
            </p>
            <p className="mt-1 text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
              Gestión actuarial
            </p>
          </div>
        </div>

        <nav
          aria-label="Navegación principal"
          className="flex-1 space-y-1.5 p-4"
        >
          {navItems.map(({ label, icon: Icon }) => (
            <button
              type="button"
              key={label}
              onClick={() => setActiveView(label)}
              aria-current={activeView === label ? 'page' : undefined}
              className={`group flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                activeView === label
                  ? 'glass-sidebar-active text-white'
                  : 'text-foreground/70 hover:border-white/60 hover:bg-white/75 hover:text-foreground hover:shadow-xs border border-transparent'
              }`}
            >
              <Icon
                aria-hidden="true"
                className={`size-[18px] transition-transform duration-200 group-hover:scale-110 ${activeView === label ? 'text-white' : 'text-primary/70'}`}
              />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="m-4 glass-panel rounded-2xl p-4 shadow-sm border border-white/80">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-primary">
            <span className="grid size-6 place-items-center rounded-lg bg-amber-500/15 text-amber-700">
              <Sparkles aria-hidden="true" className="size-3.5" />
            </span>
            Consejo del día
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Revisa las direcciones antes de iniciar. La ruta está optimizada
            para evitar traslados innecesarios.
          </p>
        </div>

        <div className="m-4 mt-0 grid gap-1">
          <button
            type="button"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3.5 text-sm font-semibold text-foreground/70 transition-all hover:border-white/60 hover:bg-white/70 hover:text-foreground"
          >
            <Settings
              aria-hidden="true"
              className="size-[18px] text-muted-foreground"
            />
            <span>Configuración</span>
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3.5 text-sm font-semibold text-foreground/70 transition-all hover:border-red-200 hover:bg-red-50/80 hover:text-red-800"
          >
            <LogOut aria-hidden="true" className="size-[18px]" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="relative z-10 lg:pl-[256px]">
        {/* Glassmorphic Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/50 bg-white/65 px-4 backdrop-blur-xl shadow-xs dark:border-white/10 dark:bg-slate-900/65 sm:px-6 lg:h-20 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white/90 p-1 shadow-sm ring-1 ring-white/80 backdrop-blur-md">
              <Image
                src="/apptuario-mark.png"
                alt="AppTuario"
                width={40}
                height={40}
                className="size-full object-contain"
                priority
              />
            </div>
            <span className="font-heading text-xl font-bold text-primary">
              AppTuario
            </span>
          </div>

          <div className="hidden lg:block">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground">
              Domingo, 30 de agosto
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground/90">
              {appUser.courtName ?? 'Órgano jurisdiccional federal'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <Button
              variant="glass"
              size="icon-lg"
              aria-label="Ver notificaciones"
              className="relative size-10 rounded-full"
            >
              <Bell
                aria-hidden="true"
                className="size-4.5 text-foreground/80"
              />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-amber-500 ring-2 ring-white shadow-xs" />
            </Button>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold leading-tight">
                {appUser.displayName ?? appUser.username}
              </p>
              <p className="text-[11px] font-semibold text-muted-foreground">
                Actuaria judicial
              </p>
            </div>

            <div
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary to-blue-700 text-sm font-bold text-white shadow-md ring-2 ring-white/80"
            >
              {initials(appUser.displayName ?? appUser.username)}
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        <main
          id="inicio"
          className="mx-auto min-w-0 max-w-[1480px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8"
        >
          {activeView === 'Inicio' ? (
            <>
              {/* Hero Section */}
              <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-50/80 px-3 py-1 text-xs font-extrabold text-amber-900 shadow-xs backdrop-blur-md">
                    <Sparkles className="size-3.5 text-amber-600" />
                    <span>Jornada Actuarial Activa</span>
                  </div>
                  <h1 className="mt-2.5 font-heading text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
                    Tu jornada de notificaciones
                  </h1>
                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    Organiza los asuntos de hoy, documenta cada diligencia y
                    genera razones actuariales con respaldo de evidencia.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 min-[430px]:flex-row">
                  <Button
                    onClick={() => setModal('upload')}
                    variant="glass"
                    size="lg"
                    className="h-11 justify-center px-4 font-semibold"
                  >
                    <Upload aria-hidden="true" className="text-primary" />
                    Cargar acuerdo
                  </Button>
                  <Button
                    onClick={() => setModal('notification')}
                    variant="glass-accent"
                    size="lg"
                    className="h-11 justify-center px-5 font-semibold text-white"
                  >
                    <Plus aria-hidden="true" />
                    Nueva notificación
                  </Button>
                </div>
              </section>

              {/* Metrics Grid */}
              <section
                aria-label="Resumen del día"
                className="mt-7 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4"
              >
                <Metric
                  icon={Gavel}
                  label="Diligencias de hoy"
                  value="6"
                  note="3 aún pendientes"
                  tone="primary"
                />
                <Metric
                  icon={FileCheck2}
                  label="Razones por elaborar"
                  value="3"
                  note="2 con evidencia completa"
                  tone="amber"
                />
                <Metric
                  icon={CalendarDays}
                  label="Próximos vencimientos"
                  value="2"
                  note="Dentro de las próximas 48 h"
                  tone="blue"
                />
                <Metric
                  icon={Navigation}
                  label="Recorrido estimado"
                  value="6 km+"
                  note="Ruta demo en Guadalajara"
                  tone="teal"
                />
              </section>

              {/* Main Content Split: Route & HUD Card */}
              <section className="mt-7 grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)]">
                {/* Route List Card */}
                <div className="glass-panel rounded-3xl border border-white/80 p-0 shadow-[0_12px_36px_rgba(30,58,138,0.04)] overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/60 bg-white/40 p-5 sm:px-6">
                    <div>
                      <h2 className="font-heading text-xl font-semibold">
                        Ruta de hoy
                      </h2>
                      <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                        3 de 6 diligencias pendientes · Inicia en 18 minutos
                      </p>
                    </div>
                    <Button
                      onClick={() => setActiveView('Ruta diaria')}
                      variant="glass"
                      size="sm"
                      className="font-semibold text-xs"
                    >
                      <Route
                        aria-hidden="true"
                        className="text-primary size-3.5"
                      />
                      Ver mapa completo
                    </Button>
                  </div>

                  <ol className="divide-y divide-white/50 p-2 sm:p-3">
                    {notifications.map((item, index) => (
                      <li key={`${item.time}-${item.name}`}>
                        <button
                          type="button"
                          onClick={() => setModal('evidence')}
                          aria-label={`Diligencia a ${item.name}, ${item.address}, programada a las ${item.time}`}
                          className="group grid min-h-[104px] w-full cursor-pointer grid-cols-[52px_minmax(0,1fr)_auto] gap-3 rounded-2xl p-3.5 text-left transition-all duration-200 hover:border-white/90 hover:bg-white/80 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:grid-cols-[68px_minmax(0,1fr)_auto] sm:gap-4 sm:p-4"
                        >
                          <div className="pt-0.5 text-center">
                            <span className="block font-heading text-base font-bold tabular-nums text-primary sm:text-lg">
                              {item.time}
                            </span>
                            <span className="mt-0.5 block text-[9.5px] font-extrabold uppercase tracking-wider text-muted-foreground">
                              Parada {index + 1}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant={
                                  item.tone === 'amber'
                                    ? 'glass-amber'
                                    : item.tone === 'blue'
                                      ? 'glass-blue'
                                      : 'glass'
                                }
                              >
                                {item.type}
                              </Badge>
                              <span className="text-xs font-semibold text-muted-foreground/90">
                                {item.case}
                              </span>
                            </div>
                            <h3 className="mt-1.5 truncate text-sm font-bold sm:text-base text-foreground group-hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                            <p className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground sm:text-sm">
                              <MapPin
                                aria-hidden="true"
                                className="mt-0.5 size-3.5 shrink-0 text-primary/70"
                              />
                              <span className="truncate">{item.address}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-center pr-1">
                            <span className="hidden text-xs font-semibold text-muted-foreground md:block">
                              {item.status}
                            </span>
                            <span className="grid size-8 place-items-center rounded-xl bg-white/70 border border-white/80 text-muted-foreground shadow-2xs transition-all group-hover:translate-x-0.5 group-hover:bg-primary group-hover:text-white">
                              <ChevronRight
                                aria-hidden="true"
                                className="size-4"
                              />
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Right Column: Navy Glass Status & Quick Actions */}
                <div className="space-y-6">
                  {/* Navy Glassmorphic Journey Card */}
                  <div className="glass-card-navy rounded-3xl p-6 text-white">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="grid size-10 place-items-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-xs">
                        <Navigation
                          aria-hidden="true"
                          className="size-5 text-white"
                        />
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-0.5 text-xs font-extrabold text-white backdrop-blur-md">
                        Ruta optimizada
                      </span>
                    </div>

                    <h2 className="font-heading text-2xl font-bold text-white tracking-tight">
                      Todo listo para salir
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-blue-100/90">
                      Las primeras tres direcciones fueron ordenadas por
                      cercanía, horario hábil y juzgado correspondiente.
                    </p>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-xs font-bold text-blue-100">
                        <span>Preparación de jornada</span>
                        <span>82%</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20 p-0.5 backdrop-blur-md">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 shadow-sm"
                          style={{ width: '82%' }}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => setRouteStarted((value) => !value)}
                      size="lg"
                      className="mt-6 h-12 w-full font-bold bg-white text-primary hover:bg-blue-50 shadow-md transition-all active:scale-[0.98]"
                    >
                      <Navigation
                        aria-hidden="true"
                        className={routeStarted ? 'animate-pulse' : ''}
                      />
                      {routeStarted
                        ? 'Recorrido en curso'
                        : 'Iniciar recorrido'}
                    </Button>
                  </div>

                  {/* Evidence Quick Access */}
                  <div className="glass-panel rounded-3xl p-5 border border-white/80 shadow-[0_10px_30px_rgba(30,58,138,0.04)]">
                    <h3 className="font-heading text-lg font-semibold text-foreground">
                      Evidencia por completar
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Capturas pendientes de tus últimas diligencias
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <EvidenceButton
                        onClick={() => setModal('evidence')}
                        icon={Camera}
                        label="Fotografías"
                        count="2 pendientes"
                      />
                      <EvidenceButton
                        onClick={() => setModal('evidence')}
                        icon={Mic}
                        label="Notas de voz"
                        count="1 sin revisar"
                      />
                    </div>
                  </div>

                  {/* Amber Follow-up Alert */}
                  <div className="glass-card-amber rounded-2xl p-4.5 text-amber-950 flex items-start gap-3.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-800 border border-amber-500/30">
                      <Clock3 aria-hidden="true" className="size-4.5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-amber-950">
                        Citatorio para seguimiento
                      </p>
                      <p className="mt-1 text-xs leading-5 text-amber-900/85">
                        La segunda visita de A.I. 376/2026 está programada para
                        mañana a las 10:00 h.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <WorkspaceView
              view={activeView}
              onBack={() => setActiveView('Inicio')}
              onOpen={setModal}
            />
          )}
        </main>
      </div>

      {/* Floating Glass Bottom Nav for Mobile */}
      <nav
        aria-label="Navegación móvil"
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-white/75 bg-white/80 p-1.5 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/80 lg:hidden"
      >
        {navItems.map(({ label, icon: Icon }) => (
          <button
            type="button"
            onClick={() => setActiveView(label)}
            key={label}
            aria-current={activeView === label ? 'page' : undefined}
            aria-label={label}
            className={`flex min-h-12 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeView === label
                ? 'bg-primary text-white shadow-xs'
                : 'text-muted-foreground hover:bg-white/60 hover:text-foreground'
            }`}
          >
            <Icon aria-hidden="true" className="size-4.5" />
            <span className="max-w-full truncate px-1">
              {label === 'Ruta diaria' ? 'Ruta' : label}
            </span>
          </button>
        ))}
      </nav>

      {modal ? (
        <ActionModal mode={modal} onClose={() => setModal(null)} />
      ) : null}
    </div>
  );
}

type ModalMode = 'upload' | 'notification' | 'evidence';

function WorkspaceView({
  view,
  onBack,
  onOpen,
}: {
  view: string;
  onBack: () => void;
  onOpen: (mode: ModalMode) => void;
}) {
  const descriptions: Record<string, string> = {
    Expedientes:
      'Consulta los juicios, acuerdos, destinatarios y diligencias relacionadas.',
    'Ruta diaria':
      'Ordena tus destinos por cercanía, horario y prioridad procesal.',
    Calendario:
      'Programa segundas visitas, vencimientos y diligencias pendientes.',
    Plantillas:
      'Administra tus formatos de citatorio, aviso, notificación personal y razón.',
  };

  return (
    <section aria-labelledby="workspace-title" className="min-w-0">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Button
            onClick={onBack}
            variant="glass"
            size="sm"
            className="mb-3 -ml-1 lg:hidden"
          >
            <ArrowLeft aria-hidden="true" /> Volver
          </Button>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-blue-50/75 px-3 py-0.5 text-xs font-extrabold text-primary shadow-xs backdrop-blur-md">
            Espacio de trabajo
          </div>
          <h1
            id="workspace-title"
            className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {view}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {descriptions[view]}
          </p>
        </div>

        {view === 'Expedientes' ? (
          <Button
            onClick={() => onOpen('upload')}
            variant="glass-accent"
            size="lg"
            className="h-11 px-5 font-semibold text-white"
          >
            <Upload aria-hidden="true" /> Cargar acuerdo
          </Button>
        ) : view === 'Plantillas' ? (
          <Button
            onClick={() => onOpen('upload')}
            variant="glass-accent"
            size="lg"
            className="h-11 px-5 font-semibold text-white"
          >
            <Plus aria-hidden="true" /> Agregar plantilla
          </Button>
        ) : null}
      </div>

      {view === 'Expedientes' ? <CasesView onOpen={onOpen} /> : null}
      {view === 'Ruta diaria' ? <RouteView onOpen={onOpen} /> : null}
      {view === 'Calendario' ? <CalendarView /> : null}
      {view === 'Plantillas' ? <TemplatesView /> : null}
    </section>
  );
}

function CasesView({ onOpen }: { onOpen: (mode: ModalMode) => void }) {
  const cases = [
    [
      '428/2026',
      'Juzgado Segundo de Distrito',
      'María Fernanda Ruiz López',
      'Personal',
      'Hoy, 09:30',
    ],
    [
      '511/2026',
      'Juzgado Cuarto de Distrito',
      'Director General de Procedimientos',
      'Citatorio',
      'Hoy, 11:15',
    ],
    [
      '376/2026',
      'Juzgado Primero de Distrito',
      'José Antonio Mejía',
      'Segunda visita',
      'Mañana, 10:00',
    ],
    [
      '92/2026',
      'Tribunal Colegiado',
      'Juzgado Décimo de Distrito',
      'Oficio',
      'Hoy, 13:00',
    ],
  ];

  return (
    <div className="mt-7 space-y-4">
      <label className="flex h-12 max-w-xl items-center gap-3 rounded-2xl border border-white/80 bg-white/70 px-4 shadow-xs backdrop-blur-md transition-all focus-within:border-primary focus-within:bg-white/95 focus-within:ring-3 focus-within:ring-primary/20">
        <Search aria-hidden="true" className="size-4.5 text-muted-foreground" />
        <span className="sr-only">Buscar expediente</span>
        <input
          type="search"
          placeholder="Buscar por expediente, juzgado o destinatario…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="glass-panel overflow-hidden rounded-3xl border border-white/80 shadow-sm">
        <div className="hidden grid-cols-[120px_1fr_1.3fr_130px_130px_44px] gap-4 border-b border-white/60 bg-white/40 px-6 py-3.5 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground md:grid">
          <span>Expediente</span>
          <span>Órgano</span>
          <span>Destinatario</span>
          <span>Actuación</span>
          <span>Programación</span>
          <span />
        </div>

        <div className="divide-y divide-white/50">
          {cases.map((item) => (
            <button
              onClick={() => onOpen('evidence')}
              type="button"
              key={item[0]}
              className="group grid w-full cursor-pointer gap-2 p-4 text-left transition-all duration-200 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-[120px_1fr_1.3fr_130px_130px_44px] md:items-center md:gap-4 md:px-6 md:py-4"
            >
              <span className="font-extrabold text-primary">
                A.I. {item[0]}
              </span>
              <span className="text-sm font-semibold">{item[1]}</span>
              <span className="text-sm text-foreground/90">{item[2]}</span>
              <Badge variant="glass-blue" className="w-fit">
                {item[3]}
              </Badge>
              <span className="text-xs font-semibold text-muted-foreground">
                {item[4]}
              </span>
              <span className="hidden size-7 place-items-center rounded-lg bg-white/70 border border-white/80 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:bg-primary group-hover:text-white md:grid">
                <ChevronRight aria-hidden="true" className="size-4" />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card-blue-alert flex items-start gap-3.5 rounded-2xl p-4.5 text-blue-950">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-blue-500/20 text-blue-800 border border-blue-500/30">
          <CircleAlert aria-hidden="true" className="size-4.5" />
        </span>
        <p className="text-xs leading-5">
          <strong>Control humano obligatorio:</strong> AppTuario puede proponer
          datos a partir del documento, pero el actuario debe cotejarlos con el
          acuerdo o sentencia antes de generar cualquier formato formal.
        </p>
      </div>
    </div>
  );
}

function RouteView({ onOpen }: { onOpen: (mode: ModalMode) => void }) {
  return <RoutePlanner onOpenEvidence={() => onOpen('evidence')} />;
}

function CalendarView() {
  const days = ['Lun 31', 'Mar 1', 'Mié 2', 'Jue 3', 'Vie 4'];

  return (
    <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="glass-panel rounded-3xl border border-white/80 p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-heading text-xl font-semibold">
            Semana de trabajo
          </h2>
          <p className="text-xs text-muted-foreground">
            31 de agosto al 4 de septiembre de 2026
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="grid min-w-[720px] grid-cols-5 divide-x divide-white/60 rounded-2xl border border-white/70 bg-white/30 backdrop-blur-md">
            {days.map((day, index) => (
              <div key={day} className="min-h-[390px] p-3.5">
                <p
                  className={`rounded-xl px-2 py-2 text-center text-xs font-extrabold shadow-xs ${
                    index === 0
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white/70 text-foreground/80 border border-white/75'
                  }`}
                >
                  {day}
                </p>
                {index === 0 ? (
                  <CalendarEvent
                    time="10:00"
                    title="Segunda visita"
                    note="A.I. 376/2026"
                    tone="amber"
                  />
                ) : null}
                {index === 1 ? (
                  <CalendarEvent
                    time="09:30"
                    title="Notificación personal"
                    note="A.I. 601/2026"
                    tone="blue"
                  />
                ) : null}
                {index === 2 ? (
                  <CalendarEvent
                    time="12:00"
                    title="Vence plazo"
                    note="A.I. 428/2026"
                    tone="red"
                  />
                ) : null}
                {index === 3 ? (
                  <CalendarEvent
                    time="11:15"
                    title="Entrega de oficio"
                    note="A.R. 92/2026"
                    tone="blue"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="glass-panel rounded-3xl border border-white/80 p-5 shadow-sm">
          <h3 className="font-heading text-lg font-semibold">
            Pendientes de reprogramar
          </h3>
          <div className="mt-3.5 space-y-2.5">
            <Pending title="Domicilio cerrado" caseId="A.I. 455/2026" />
            <Pending title="Esperando horario hábil" caseId="A.I. 390/2026" />
          </div>
        </div>

        <div className="glass-card-amber rounded-2xl p-4 text-xs leading-5 text-amber-950">
          <strong>Regla de agenda:</strong> Las segundas visitas derivadas de
          citatorio se muestran como pendientes hasta que el usuario confirme
          fecha y hora.
        </div>
      </div>
    </div>
  );
}

function TemplatesView() {
  const templates = [
    [
      'Citatorio — Amparo indirecto',
      'DOCX',
      'Formato propio',
      'Actualizada hace 2 días',
    ],
    ['Aviso de notificación', 'DOCX', 'Formato básico', 'Lista para usar'],
    [
      'Notificación personal',
      'DOCX',
      'Formato propio',
      'Actualizada el 18 ago',
    ],
    [
      'Razón actuarial de comparecencia',
      'DOCX',
      'Formato básico',
      'Lista para usar',
    ],
  ];

  return (
    <div className="mt-7 grid gap-4.5 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => (
        <div
          key={template[0]}
          className="glass-panel-interactive flex flex-col justify-between rounded-3xl border border-white/80 p-5.5"
        >
          <div>
            <div className="mb-3.5 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-white/90 to-blue-50/80 text-primary border border-white/90 shadow-xs">
              <FileText aria-hidden="true" className="size-5.5" />
            </div>
            <h3 className="font-heading text-lg font-semibold leading-snug">
              {template[0]}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{template[3]}</p>
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-2">
              <Badge variant="glass">{template[1]}</Badge>
              <Badge variant="glass-blue">{template[2]}</Badge>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="glass"
                className="flex-1 font-semibold text-xs h-9"
              >
                Vista previa
              </Button>
              <Button
                variant="glass"
                size="icon"
                aria-label="Descargar plantilla"
                className="size-9"
              >
                <Download aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="glass-panel flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/30 p-6 text-center transition-all duration-200 hover:border-primary hover:bg-white/85 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Plus aria-hidden="true" className="size-6" />
        </span>
        <span className="mt-3 block font-bold text-sm text-foreground">
          Cargar formato propio
        </span>
        <span className="mt-1 block max-w-xs text-xs leading-5 text-muted-foreground">
          Usa un archivo Word editable (.docx) con las variables que
          acostumbras.
        </span>
      </button>
    </div>
  );
}

function ActionModal({
  mode,
  onClose,
}: {
  mode: ModalMode;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const titles = {
    upload: 'Cargar documento',
    notification: 'Nueva notificación',
    evidence: 'Registrar diligencia',
  };
  const descriptions = {
    upload: 'Agrega un acuerdo, sentencia o plantilla en Word o PDF.',
    notification:
      'Captura los datos mínimos para incorporar un destino a tu jornada.',
    evidence:
      'Registra el resultado y conserva evidencia para preparar la razón actuarial.',
  };

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    setErrorMessage('');

    if (mode !== 'upload') {
      setSubmitted(true);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: new FormData(event.currentTarget),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok)
        throw new Error(
          payload.error ?? 'No fue posible guardar el documento.',
        );
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible guardar el documento.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 grid place-items-end bg-slate-950/40 p-0 backdrop-blur-md sm:place-items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <dialog
        open
        aria-modal="true"
        aria-labelledby="modal-title"
        className="glass-panel relative m-0 max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-3xl border border-white/85 bg-white/90 p-6 text-card-foreground shadow-[0_25px_60px_rgba(15,23,42,0.25)] backdrop-blur-2xl sm:max-w-xl sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full border border-amber-300/70 bg-amber-50/80 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-900 shadow-xs">
              AppTuario
            </span>
            <h2
              id="modal-title"
              className="mt-2 font-heading text-2xl font-bold text-foreground"
            >
              {titles[mode]}
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
              {descriptions[mode]}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="glass"
            size="icon"
            aria-label="Cerrar"
            className="size-9 rounded-full"
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </div>

        {submitted ? (
          <div className="py-10 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 shadow-xs">
              <Check aria-hidden="true" className="size-8" />
            </span>
            <h3 className="mt-4 font-heading text-xl font-bold">
              Registro guardado
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-muted-foreground sm:text-sm">
              Quedó en borrador para que puedas cotejarlo antes de incorporarlo
              a una actuación oficial.
            </p>
            <Button
              onClick={onClose}
              variant="glass-primary"
              size="lg"
              className="mt-6 font-bold"
            >
              Volver al espacio de trabajo
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'upload' ? <UploadFields /> : null}
            {mode === 'notification' ? <NotificationFields /> : null}
            {mode === 'evidence' ? <EvidenceFields /> : null}

            {errorMessage ? (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50/90 p-3 text-xs font-semibold text-red-800"
              >
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 border-t border-white/60 pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                onClick={onClose}
                variant="glass"
                className="h-11 font-semibold"
              >
                Cancelar
              </Button>
              <Button
                disabled={saving}
                type="submit"
                variant="glass-accent"
                className="h-11 px-6 font-bold text-white"
              >
                {saving ? 'Guardando…' : 'Guardar borrador'}
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}

function UploadFields() {
  return (
    <>
      <label
        aria-label="Cargar archivo Word o PDF"
        className="glass-panel grid min-h-36 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-primary/30 p-5 text-center transition-all hover:border-primary hover:bg-white/80"
      >
        <input
          name="file"
          required
          type="file"
          accept=".doc,.docx,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
        />
        <span>
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Upload aria-hidden="true" className="size-6" />
          </span>
          <span className="mt-3 block text-sm font-bold text-foreground">
            Selecciona Word o PDF
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Máximo permitido: 25 MB
          </span>
        </span>
      </label>

      <Field label="Tipo de documento">
        <select name="category" required className="form-control">
          <option value="">Seleccionar…</option>
          <option value="agreement">Acuerdo</option>
          <option value="judgment">Sentencia</option>
          <option value="template">Plantilla propia</option>
        </select>
      </Field>

      <div className="glass-card-blue-alert rounded-xl p-3.5 text-xs leading-5 text-blue-950">
        <strong>Privacidad:</strong> El archivo se asociará únicamente a tu
        cuenta. La extracción automática será una propuesta y nunca sustituye tu
        cotejo.
      </div>
    </>
  );
}

function NotificationFields() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Expediente">
        <input required className="form-control" placeholder="Ej. 428/2026" />
      </Field>
      <Field label="Tipo">
        <select required className="form-control">
          <option>Personal</option>
          <option>Citatorio</option>
          <option>Aviso</option>
          <option>Oficio</option>
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="Destinatario">
          <input
            required
            className="form-control"
            placeholder="Nombre o autoridad"
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Domicilio">
          <textarea
            required
            className="form-control min-h-20 resize-y"
            placeholder="Calle, número, colonia, alcaldía o municipio"
          />
        </Field>
      </div>
      <Field label="Fecha">
        <input required type="date" className="form-control" />
      </Field>
      <Field label="Hora sugerida">
        <input required type="time" className="form-control" />
      </Field>
    </div>
  );
}

function EvidenceFields() {
  return (
    <>
      <Field label="Resultado de la diligencia">
        <select required className="form-control">
          <option value="">Seleccionar…</option>
          <option>Notificación practicada</option>
          <option>Se dejó citatorio</option>
          <option>Se fijó aviso</option>
          <option>Domicilio cerrado</option>
          <option>Domicilio incorrecto</option>
          <option>No atendió persona alguna</option>
          <option>Otro resultado</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <label className="capture-control">
          <Camera aria-hidden="true" className="size-5" />
          <span className="font-bold">Tomar foto</span>
          <span className="text-[11px] text-muted-foreground">
            Cámara o archivo
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
          />
        </label>
        <label className="capture-control">
          <Mic aria-hidden="true" className="size-5" />
          <span className="font-bold">Nota de voz</span>
          <span className="text-[11px] text-muted-foreground">
            Audio de apoyo
          </span>
          <input type="file" accept="audio/*" capture className="sr-only" />
        </label>
      </div>

      <Field label="Notas privadas de campo">
        <textarea
          className="form-control min-h-24 resize-y"
          placeholder="Rasgos del inmueble, quién atendió, circunstancias y datos que debas recordar…"
        />
      </Field>

      <label className="glass-panel flex cursor-pointer items-start gap-3 rounded-xl border border-white/70 p-3.5 text-xs leading-5">
        <input
          required
          type="checkbox"
          className="mt-1 size-4 accent-blue-800"
        />
        <span>
          Confirmo que la evidencia es pertinente para la diligencia y que
          revisaré el borrador de razón antes de firmarlo o integrarlo al
          expediente.
        </span>
      </label>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground/80">
      <span>{label}</span>
      {children}
    </label>
  );
}

function CalendarEvent({
  time,
  title,
  note,
  tone,
}: {
  time: string;
  title: string;
  note: string;
  tone: 'amber' | 'blue' | 'red';
}) {
  const colorClass =
    tone === 'amber'
      ? 'border-amber-400/80 bg-amber-50/85 text-amber-950'
      : tone === 'red'
        ? 'border-red-400/80 bg-red-50/85 text-red-950'
        : 'border-blue-400/80 bg-blue-50/85 text-blue-950';

  return (
    <div
      className={`mt-3 rounded-xl border-l-4 p-3 shadow-2xs backdrop-blur-sm ${colorClass}`}
    >
      <span className="text-xs font-extrabold">{time}</span>
      <span className="mt-1 block text-xs font-bold">{title}</span>
      <span className="mt-0.5 block text-[11px] opacity-80">{note}</span>
    </div>
  );
}

function Pending({ title, caseId }: { title: string; caseId: string }) {
  return (
    <button
      type="button"
      className="glass-panel-interactive flex w-full cursor-pointer items-center gap-3 rounded-2xl p-3 text-left border border-white/70"
    >
      <Clock3 aria-hidden="true" className="size-4 text-amber-700 shrink-0" />
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-foreground truncate">
          {title}
        </span>
        <span className="text-xs text-muted-foreground font-medium">
          {caseId}
        </span>
      </span>
      <ChevronRight
        aria-hidden="true"
        className="size-4 text-muted-foreground"
      />
    </button>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  note,
  tone: _tone,
}: {
  icon: typeof Gavel;
  label: string;
  value: string;
  note: string;
  tone?: 'primary' | 'amber' | 'blue' | 'teal';
}) {
  return (
    <div className="glass-panel-interactive flex items-center gap-4 rounded-3xl border border-white/80 p-4.5 shadow-[0_8px_24px_rgba(30,58,138,0.04)]">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-white/90 to-blue-50/80 text-primary border border-white/90 shadow-xs">
        <Icon aria-hidden="true" className="size-5.5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 font-heading text-2xl font-bold tracking-tight tabular-nums text-foreground sm:text-3xl">
          {value}
        </p>
        <p className="truncate text-xs text-muted-foreground">{note}</p>
      </div>
    </div>
  );
}

function EvidenceButton({
  icon: Icon,
  label,
  count,
  onClick,
}: {
  icon: typeof Camera;
  label: string;
  count: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="glass-panel-interactive min-h-[108px] cursor-pointer rounded-2xl border border-white/80 p-3.5 text-left transition-all hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon aria-hidden="true" className="size-4.5" />
      </span>
      <span className="mt-3 block text-sm font-bold text-foreground">
        {label}
      </span>
      <span className="mt-0.5 block text-xs text-muted-foreground font-medium">
        {count}
      </span>
    </button>
  );
}

function initials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase('es-MX'))
    .join('');
}
