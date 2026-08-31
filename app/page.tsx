'use client';

import { useState, type SyntheticEvent } from 'react';
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
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const notifications = [
  {
    time: '09:30',
    type: 'Personal',
    name: 'María Fernanda Ruiz López',
    address: 'Av. Paseo de la Reforma 250, Cuauhtémoc',
    case: 'Amparo indirecto 428/2026',
    status: 'Por iniciar',
    tone: 'blue',
  },
  {
    time: '11:15',
    type: 'Citatorio',
    name: 'Director General de Procedimientos',
    address: 'Bucareli 99, Centro, Cuauhtémoc',
    case: 'Amparo indirecto 511/2026',
    status: 'Pendiente',
    tone: 'amber',
  },
  {
    time: '13:00',
    type: 'Oficio',
    name: 'Juzgado Décimo de Distrito',
    address: 'Eduardo Molina 2, El Parque, Venustiano Carranza',
    case: 'Amparo en revisión 92/2026',
    status: 'Pendiente',
    tone: 'slate',
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
  const [activeView, setActiveView] = useState('Inicio');
  const [modal, setModal] = useState<'upload' | 'notification' | 'evidence' | null>(null);
  const [routeStarted, setRouteStarted] = useState(false);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-20 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="grid size-11 place-items-center overflow-hidden rounded-xl bg-white p-0.5 shadow-sm ring-1 ring-sidebar-border">
            <Image src="/apptuario-mark.png" alt="" width={44} height={44} className="size-full object-contain" priority />
          </div>
          <div>
            <p className="font-heading text-[22px] font-semibold leading-none tracking-tight">AppTuario</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Gestión actuarial</p>
          </div>
        </div>

        <nav aria-label="Navegación principal" className="flex-1 space-y-1.5 p-4">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              type="button"
              key={label}
              onClick={() => setActiveView(label)}
              aria-current={activeView === label ? 'page' : undefined}
              className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                activeView === label
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon aria-hidden="true" className="size-[18px]" />
              {label}
            </button>
          ))}
        </nav>

        <div className="m-4 rounded-xl border border-sidebar-border bg-white p-4 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-primary">
            <Sparkles aria-hidden="true" className="size-4 text-accent-foreground" />
            Consejo del día
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Revisa las direcciones antes de iniciar. La ruta está optimizada para evitar traslados innecesarios.
          </p>
        </div>

        <button type="button" className="m-4 mt-0 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3.5 text-sm font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent">
          <Settings aria-hidden="true" className="size-[18px]" />
          Configuración
        </button>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 lg:h-20 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center overflow-hidden rounded-lg bg-white p-0.5 shadow-sm ring-1 ring-border">
              <Image src="/apptuario-mark.png" alt="" width={40} height={40} className="size-full object-contain" priority />
            </div>
            <span className="font-heading text-xl font-semibold">AppTuario</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Domingo, 30 de agosto</p>
            <p className="mt-0.5 text-sm font-semibold">Juzgado Segundo de Distrito en Materia Administrativa</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="icon-lg" aria-label="Ver notificaciones" className="relative cursor-pointer rounded-full">
              <Bell aria-hidden="true" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent-foreground ring-2 ring-background" />
            </Button>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold leading-tight">Lic. Alejandra Torres</p>
              <p className="text-xs text-muted-foreground">Actuaria judicial</p>
            </div>
            <div aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">AT</div>
          </div>
        </header>

        <main id="inicio" className="mx-auto max-w-[1480px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          {activeView === 'Inicio' ? (
            <>
          <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-1 text-sm font-semibold text-accent-foreground">Buen día, Alejandra</p>
              <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Tu jornada de notificaciones</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Organiza los asuntos de hoy, documenta cada diligencia y deja listas tus razones actuariales.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[430px]:flex-row">
              <Button onClick={() => setModal('upload')} variant="outline" size="lg" className="h-11 cursor-pointer justify-center px-4">
                <Upload aria-hidden="true" />
                Cargar acuerdo
              </Button>
              <Button onClick={() => setModal('notification')} size="lg" className="h-11 cursor-pointer justify-center bg-accent-foreground px-4 text-white hover:bg-accent-foreground/90">
                <Plus aria-hidden="true" />
                Nueva notificación
              </Button>
            </div>
          </section>

          <section aria-label="Resumen del día" className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={Gavel} label="Diligencias de hoy" value="6" note="3 aún pendientes" />
            <Metric icon={FileCheck2} label="Razones por elaborar" value="3" note="2 con evidencia completa" />
            <Metric icon={CalendarDays} label="Próximos vencimientos" value="2" note="Dentro de las próximas 48 h" />
            <Metric icon={Navigation} label="Recorrido estimado" value="28 km" note="1 h 42 min en traslado" />
          </section>

          <section className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.75fr)]">
            <Card className="border-0 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-border">
              <CardHeader className="border-b border-border py-5">
                <CardTitle className="font-heading text-xl font-semibold">Ruta de hoy</CardTitle>
                <CardDescription>3 de 6 diligencias pendientes · inicia en 18 minutos</CardDescription>
                <CardAction>
                  <Button onClick={() => setActiveView('Ruta diaria')} variant="outline" size="sm" className="cursor-pointer">
                    <Route aria-hidden="true" />
                    Ver ruta
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="p-0">
                <ol className="divide-y divide-border">
                  {notifications.map((item, index) => (
                    <li key={`${item.time}-${item.name}`}>
                      <button type="button" onClick={() => setModal('evidence')} className="group grid min-h-[112px] w-full cursor-pointer grid-cols-[52px_minmax(0,1fr)_auto] gap-3 p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:gap-4 sm:p-5">
                        <div className="pt-0.5 text-center">
                          <span className="block text-sm font-extrabold tabular-nums text-primary">{item.time}</span>
                          <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Parada {index + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={item.tone === 'amber' ? 'border-amber-300 bg-amber-50 text-amber-800' : item.tone === 'blue' ? 'border-blue-200 bg-blue-50 text-blue-800' : 'bg-slate-50'}>{item.type}</Badge>
                            <span className="text-xs font-semibold text-muted-foreground">{item.case}</span>
                          </div>
                          <h2 className="mt-2 truncate text-sm font-bold sm:text-base">{item.name}</h2>
                          <p className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground sm:text-sm">
                            <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                            <span>{item.address}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 self-center">
                          <span className="hidden text-xs font-semibold text-muted-foreground md:block">{item.status}</span>
                          <ChevronRight aria-hidden="true" className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-0 bg-primary text-primary-foreground shadow-[0_12px_32px_rgba(30,58,138,0.18)] ring-0">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-white/12"><Navigation aria-hidden="true" className="size-5" /></span>
                    <Badge className="bg-white/12 text-white">Ruta optimizada</Badge>
                  </div>
                  <CardTitle className="font-heading text-xl font-semibold text-white">Todo listo para salir</CardTitle>
                  <CardDescription className="text-blue-100">Las primeras tres direcciones fueron ordenadas por cercanía y horario.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center justify-between text-xs font-semibold text-blue-100">
                    <span>Preparación de jornada</span>
                    <span>82%</span>
                  </div>
                  <Progress value={82} className="[&_[data-slot=progress-track]]:bg-white/20 [&_[data-slot=progress-indicator]]:bg-amber-400" />
                  <Button onClick={() => setRouteStarted((value) => !value)} size="lg" className="mt-5 h-11 w-full cursor-pointer bg-white text-primary hover:bg-blue-50">
                    <Navigation aria-hidden="true" />
                    {routeStarted ? 'Recorrido en curso' : 'Iniciar recorrido'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-border">
                <CardHeader>
                  <CardTitle className="font-heading text-lg font-semibold">Evidencia por completar</CardTitle>
                  <CardDescription>Capturas pendientes de tus últimas diligencias</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <EvidenceButton onClick={() => setModal('evidence')} icon={Camera} label="Fotografías" count="2 pendientes" />
                  <EvidenceButton onClick={() => setModal('evidence')} icon={Mic} label="Notas de voz" count="1 sin revisar" />
                </CardContent>
              </Card>

              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                <Clock3 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-700" />
                <div>
                  <p className="text-sm font-bold">Citatorio para seguimiento</p>
                  <p className="mt-1 text-xs leading-5 text-amber-900/80">La segunda visita de A.I. 376/2026 está programada mañana a las 10:00.</p>
                </div>
              </div>
            </div>
          </section>
            </>
          ) : (
            <WorkspaceView view={activeView} onBack={() => setActiveView('Inicio')} onOpen={setModal} />
          )}
        </main>
      </div>

      <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/97 px-1 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur lg:hidden">
        {navItems.map(({ label, icon: Icon }) => (
          <button type="button" onClick={() => setActiveView(label)} key={label} aria-current={activeView === label ? 'page' : undefined} aria-label={label} className={`flex min-h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeView === label ? 'text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
            <Icon aria-hidden="true" className="size-5" />
            <span className="max-w-full truncate px-1">{label === 'Ruta diaria' ? 'Ruta' : label}</span>
          </button>
        ))}
      </nav>

      {modal ? <ActionModal mode={modal} onClose={() => setModal(null)} /> : null}
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
    Expedientes: 'Consulta los juicios, acuerdos, destinatarios y diligencias relacionadas.',
    'Ruta diaria': 'Ordena tus destinos por cercanía, horario y prioridad procesal.',
    Calendario: 'Programa segundas visitas, vencimientos y diligencias pendientes.',
    Plantillas: 'Administra tus formatos de citatorio, aviso, notificación personal y razón.',
  };

  return (
    <section aria-labelledby="workspace-title">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Button onClick={onBack} variant="ghost" size="sm" className="mb-3 -ml-2 cursor-pointer lg:hidden">
            <ArrowLeft aria-hidden="true" /> Volver
          </Button>
          <p className="mb-1 text-sm font-semibold text-accent-foreground">Espacio de trabajo</p>
          <h1 id="workspace-title" className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{view}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{descriptions[view]}</p>
        </div>
        {view === 'Expedientes' ? (
          <Button onClick={() => onOpen('upload')} size="lg" className="h-11 cursor-pointer bg-accent-foreground px-4 text-white hover:bg-accent-foreground/90">
            <Upload aria-hidden="true" /> Cargar acuerdo
          </Button>
        ) : view === 'Plantillas' ? (
          <Button onClick={() => onOpen('upload')} size="lg" className="h-11 cursor-pointer bg-accent-foreground px-4 text-white hover:bg-accent-foreground/90">
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
    ['428/2026', 'Juzgado Segundo de Distrito', 'María Fernanda Ruiz López', 'Personal', 'Hoy, 09:30'],
    ['511/2026', 'Juzgado Cuarto de Distrito', 'Director General de Procedimientos', 'Citatorio', 'Hoy, 11:15'],
    ['376/2026', 'Juzgado Primero de Distrito', 'José Antonio Mejía', 'Segunda visita', 'Mañana, 10:00'],
    ['92/2026', 'Tribunal Colegiado', 'Juzgado Décimo de Distrito', 'Oficio', 'Hoy, 13:00'],
  ];
  return (
    <div className="mt-7 space-y-4">
      <label className="flex h-11 max-w-xl items-center gap-2 rounded-lg border border-input bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
        <Search aria-hidden="true" className="size-4 text-muted-foreground" />
        <span className="sr-only">Buscar expediente</span>
        <input type="search" placeholder="Buscar por expediente, juzgado o destinatario" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </label>
      <Card className="border-0 shadow-sm ring-1 ring-border">
        <CardContent className="p-0">
          <div className="hidden grid-cols-[120px_1fr_1.3fr_130px_130px_44px] gap-4 border-b border-border bg-muted/40 px-5 py-3 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground md:grid">
            <span>Expediente</span><span>Órgano</span><span>Destinatario</span><span>Actuación</span><span>Programación</span><span />
          </div>
          <div className="divide-y divide-border">
            {cases.map((item) => (
              <button onClick={() => onOpen('evidence')} type="button" key={item[0]} className="grid w-full cursor-pointer gap-2 px-4 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[120px_1fr_1.3fr_130px_130px_44px] md:items-center md:gap-4 md:px-5">
                <span className="font-extrabold text-primary">A.I. {item[0]}</span>
                <span className="text-sm font-semibold">{item[1]}</span>
                <span className="text-sm">{item[2]}</span>
                <Badge variant="outline" className="w-fit">{item[3]}</Badge>
                <span className="text-xs font-semibold text-muted-foreground">{item[4]}</span>
                <ChevronRight aria-hidden="true" className="hidden size-4 text-muted-foreground md:block" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
        <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-blue-700" />
        <p className="text-xs leading-5"><strong>Control humano obligatorio.</strong> AppTuario puede proponer datos a partir del documento, pero el actuario debe cotejarlos con el acuerdo o sentencia antes de generar cualquier formato.</p>
      </div>
    </div>
  );
}

function RouteView({ onOpen }: { onOpen: (mode: ModalMode) => void }) {
  return (
    <div className="mt-7 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <Card className="min-h-[430px] border-0 bg-[#e8edf1] shadow-sm ring-1 ring-border">
        <CardContent className="relative min-h-[430px] overflow-hidden p-0">
          <div aria-hidden="true" className="absolute inset-0 opacity-45 [background-image:linear-gradient(#cbd5df_1px,transparent_1px),linear-gradient(90deg,#cbd5df_1px,transparent_1px)] [background-size:42px_42px]" />
          <svg viewBox="0 0 700 430" className="absolute inset-0 h-full w-full">
            <title>Representación esquemática de la ruta diaria</title>
            <path d="M95 320 C170 260, 160 145, 265 130 S410 230, 500 150 S585 90, 625 65" fill="none" stroke="#1E3A8A" strokeWidth="7" strokeLinecap="round" strokeDasharray="2 14" />
            {[[95,320],[265,130],[500,150],[625,65]].map(([x,y], i) => <g key={i}><circle cx={x} cy={y} r="20" fill="#1E3A8A"/><text x={x} y={y+5} textAnchor="middle" fill="white" fontSize="14" fontWeight="700">{i+1}</text></g>)}
          </svg>
          <div className="absolute left-4 top-4 rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ruta sugerida</p>
            <p className="mt-1 text-xl font-extrabold">28 km · 1 h 42 min</p>
            <p className="mt-1 text-xs text-muted-foreground">Sin considerar tiempo de diligencia</p>
          </div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm ring-1 ring-border">
        <CardHeader><CardTitle className="font-heading text-xl font-semibold">Orden de visita</CardTitle><CardDescription>Calculado por cercanía y horarios registrados</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((item, index) => (
            <button onClick={() => onOpen('evidence')} key={item.time} type="button" className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-extrabold text-white">{index + 1}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{item.name}</span><span className="block truncate text-xs text-muted-foreground">{item.time} · {item.address}</span></span>
              <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
            </button>
          ))}
          <Button className="mt-2 h-11 w-full cursor-pointer"><Navigation aria-hidden="true" />Abrir primera diligencia</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CalendarView() {
  const days = ['Lun 31', 'Mar 1', 'Mié 2', 'Jue 3', 'Vie 4'];
  return (
    <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_340px]">
      <Card className="border-0 shadow-sm ring-1 ring-border">
        <CardHeader><CardTitle className="font-heading text-xl font-semibold">Semana de trabajo</CardTitle><CardDescription>31 de agosto al 4 de septiembre de 2026</CardDescription></CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="grid min-w-[720px] grid-cols-5 divide-x divide-border rounded-xl border border-border">
            {days.map((day, index) => (
              <div key={day} className="min-h-[390px] p-3">
                <p className={`rounded-lg px-2 py-2 text-center text-xs font-extrabold ${index === 0 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>{day}</p>
                {index === 0 ? <CalendarEvent time="10:00" title="Segunda visita" note="A.I. 376/2026" tone="amber" /> : null}
                {index === 1 ? <CalendarEvent time="09:30" title="Notificación personal" note="A.I. 601/2026" tone="blue" /> : null}
                {index === 2 ? <CalendarEvent time="12:00" title="Vence plazo" note="A.I. 428/2026" tone="red" /> : null}
                {index === 3 ? <CalendarEvent time="11:15" title="Entrega de oficio" note="A.R. 92/2026" tone="blue" /> : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Card className="border-0 shadow-sm ring-1 ring-border"><CardHeader><CardTitle className="font-heading text-lg font-semibold">Pendientes de reprogramar</CardTitle></CardHeader><CardContent className="space-y-3"><Pending title="Domicilio cerrado" caseId="A.I. 455/2026" /><Pending title="Esperando horario hábil" caseId="A.I. 390/2026" /></CardContent></Card>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950"><strong>Regla de agenda:</strong> las segundas visitas derivadas de citatorio se muestran como pendientes hasta que el usuario confirme fecha y hora.</div>
      </div>
    </div>
  );
}

function TemplatesView() {
  const templates = [
    ['Citatorio — Amparo indirecto', 'DOCX', 'Formato propio', 'Actualizada hace 2 días'],
    ['Aviso de notificación', 'DOCX', 'Formato básico', 'Lista para usar'],
    ['Notificación personal', 'DOCX', 'Formato propio', 'Actualizada el 18 ago'],
    ['Razón actuarial de comparecencia', 'DOCX', 'Formato básico', 'Lista para usar'],
  ];
  return (
    <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => (
        <Card key={template[0]} className="border-0 shadow-sm ring-1 ring-border">
          <CardHeader><div className="mb-3 grid size-11 place-items-center rounded-xl bg-secondary text-primary"><FileText aria-hidden="true" className="size-5" /></div><CardTitle className="font-heading text-lg font-semibold">{template[0]}</CardTitle><CardDescription>{template[3]}</CardDescription></CardHeader>
          <CardContent><div className="flex items-center gap-2"><Badge variant="outline">{template[1]}</Badge><Badge variant="secondary">{template[2]}</Badge></div><div className="mt-5 flex gap-2"><Button variant="outline" className="flex-1 cursor-pointer">Vista previa</Button><Button variant="ghost" size="icon" aria-label="Descargar plantilla" className="cursor-pointer"><Download aria-hidden="true" /></Button></div></CardContent>
        </Card>
      ))}
      <button type="button" className="min-h-[230px] cursor-pointer rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Plus aria-hidden="true" className="mx-auto size-7 text-primary" /><span className="mt-3 block font-bold">Cargar formato propio</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Usa un archivo Word editable con los campos que acostumbras.</span>
      </button>
    </div>
  );
}

function ActionModal({ mode, onClose }: { mode: ModalMode; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const titles = { upload: 'Cargar documento', notification: 'Nueva notificación', evidence: 'Registrar diligencia' };
  const descriptions = {
    upload: 'Agrega un acuerdo, sentencia o plantilla en Word o PDF.',
    notification: 'Captura los datos mínimos para incorporar un destino a tu jornada.',
    evidence: 'Registra el resultado y conserva evidencia para preparar la razón actuarial.',
  };

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    setErrorMessage('');

    if (mode !== 'upload') {
      setSubmitted(true);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/documents', { method: 'POST', body: new FormData(event.currentTarget) });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'No fue posible guardar el documento.');
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible guardar el documento.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div role="presentation" className="fixed inset-0 z-50 grid place-items-end bg-slate-950/45 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-5" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <dialog open aria-modal="true" aria-labelledby="modal-title" className="relative m-0 max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-2xl bg-card p-5 text-card-foreground shadow-2xl sm:max-w-xl sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-wider text-accent-foreground">AppTuario</p><h2 id="modal-title" className="mt-1 font-heading text-2xl font-semibold">{titles[mode]}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{descriptions[mode]}</p></div>
          <Button onClick={onClose} variant="ghost" size="icon" aria-label="Cerrar" className="cursor-pointer"><X aria-hidden="true" /></Button>
        </div>

        {submitted ? (
          <div className="py-10 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check aria-hidden="true" className="size-7" /></span><h3 className="mt-4 text-lg font-bold">Registro guardado</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Quedó en borrador para que puedas cotejarlo antes de incorporarlo a una actuación oficial.</p><Button onClick={onClose} className="mt-6 cursor-pointer">Volver al espacio de trabajo</Button></div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'upload' ? <UploadFields /> : null}
            {mode === 'notification' ? <NotificationFields /> : null}
            {mode === 'evidence' ? <EvidenceFields /> : null}
            {errorMessage ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{errorMessage}</p> : null}
            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end"><Button type="button" onClick={onClose} variant="outline" className="h-11 cursor-pointer">Cancelar</Button><Button disabled={saving} type="submit" className="h-11 cursor-pointer bg-accent-foreground px-5 text-white hover:bg-accent-foreground/90">{saving ? 'Guardando…' : 'Guardar borrador'}</Button></div>
          </form>
        )}
      </dialog>
    </div>
  );
}

function UploadFields() {
  return <><label className="grid min-h-36 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-5 text-center hover:border-primary/40 hover:bg-secondary"><input name="file" required type="file" accept=".doc,.docx,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" /><span><Upload aria-hidden="true" className="mx-auto size-7 text-primary" /><span className="mt-3 block text-sm font-bold">Selecciona Word o PDF</span><span className="mt-1 block text-xs text-muted-foreground">Máximo permitido: 25 MB</span></span></label><Field label="Tipo de documento"><select name="category" required className="form-control"><option value="">Seleccionar…</option><option value="agreement">Acuerdo</option><option value="judgment">Sentencia</option><option value="template">Plantilla propia</option></select></Field><div className="rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-950"><strong>Privacidad:</strong> el archivo se asociará únicamente a tu cuenta. La extracción automática será una propuesta y nunca sustituye tu cotejo.</div></>;
}

function NotificationFields() {
  return <div className="grid gap-4 sm:grid-cols-2"><Field label="Expediente"><input required className="form-control" placeholder="Ej. 428/2026" /></Field><Field label="Tipo"><select required className="form-control"><option>Personal</option><option>Citatorio</option><option>Aviso</option><option>Oficio</option></select></Field><div className="sm:col-span-2"><Field label="Destinatario"><input required className="form-control" placeholder="Nombre o autoridad" /></Field></div><div className="sm:col-span-2"><Field label="Domicilio"><textarea required className="form-control min-h-20 resize-y" placeholder="Calle, número, colonia, alcaldía o municipio" /></Field></div><Field label="Fecha"><input required type="date" className="form-control" /></Field><Field label="Hora sugerida"><input required type="time" className="form-control" /></Field></div>;
}

function EvidenceFields() {
  return <><Field label="Resultado de la diligencia"><select required className="form-control"><option value="">Seleccionar…</option><option>Notificación practicada</option><option>Se dejó citatorio</option><option>Se fijó aviso</option><option>Domicilio cerrado</option><option>Domicilio incorrecto</option><option>No atendió persona alguna</option><option>Otro resultado</option></select></Field><div className="grid grid-cols-2 gap-3"><label className="capture-control"><Camera aria-hidden="true" className="size-5" /><span className="font-bold">Tomar foto</span><span className="text-[11px] text-muted-foreground">Cámara o archivo</span><input type="file" accept="image/*" capture="environment" className="sr-only" /></label><label className="capture-control"><Mic aria-hidden="true" className="size-5" /><span className="font-bold">Nota de voz</span><span className="text-[11px] text-muted-foreground">Audio de apoyo</span><input type="file" accept="audio/*" capture className="sr-only" /></label></div><Field label="Notas privadas de campo"><textarea className="form-control min-h-24 resize-y" placeholder="Rasgos del inmueble, quién atendió, circunstancias y datos que debas recordar…" /></Field><label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 text-xs leading-5"><input required type="checkbox" className="mt-1 size-4 accent-blue-800" /><span>Confirmo que la evidencia es pertinente para la diligencia y que revisaré el borrador de razón antes de firmarlo o integrarlo al expediente.</span></label></>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5 text-sm font-bold"><span>{label}</span>{children}</label>;
}

function CalendarEvent({ time, title, note, tone }: { time: string; title: string; note: string; tone: 'amber' | 'blue' | 'red' }) {
  const color = tone === 'amber' ? 'border-amber-300 bg-amber-50 text-amber-950' : tone === 'red' ? 'border-red-300 bg-red-50 text-red-950' : 'border-blue-300 bg-blue-50 text-blue-950';
  return <div className={`mt-3 rounded-lg border-l-4 p-3 ${color}`}><span className="text-xs font-extrabold">{time}</span><span className="mt-1 block text-xs font-bold">{title}</span><span className="mt-1 block text-[11px] opacity-75">{note}</span></div>;
}

function Pending({ title, caseId }: { title: string; caseId: string }) {
  return <button type="button" className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-muted"><Clock3 aria-hidden="true" className="size-4 text-amber-700" /><span className="flex-1"><span className="block text-sm font-bold">{title}</span><span className="text-xs text-muted-foreground">{caseId}</span></span><ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" /></button>;
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof Gavel; label: string; value: string; note: string }) {
  return (
    <Card className="border-0 shadow-xs ring-1 ring-border">
      <CardContent className="flex items-center gap-4 py-1">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><Icon aria-hidden="true" className="size-5" /></span>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight tabular-nums">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{note}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EvidenceButton({ icon: Icon, label, count, onClick }: { icon: typeof Camera; label: string; count: string; onClick: () => void }) {
  return (
    <button onClick={onClick} type="button" className="min-h-[104px] cursor-pointer rounded-xl border border-border bg-muted/40 p-3 text-left transition-colors hover:border-primary/30 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Icon aria-hidden="true" className="size-5 text-primary" />
      <span className="mt-3 block text-sm font-bold">{label}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">{count}</span>
    </button>
  );
}
