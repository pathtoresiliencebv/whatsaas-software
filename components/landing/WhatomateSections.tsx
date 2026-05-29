'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Braces,
  BrainCircuit,
  CalendarCheck,
  CheckCircle2,
  CircleDollarSign,
  Code2,
  HardDrive,
  HeartHandshake,
  Inbox,
  MessageCircle,
  MessageSquare,
  Mic,
  Network,
  PhoneCall,
  PhoneForwarded,
  Server,
  Timer,
  TrendingUp,
  UserCheck,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const cardMotion =
  'transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5';

const reveal = 'animate-in fade-in slide-in-from-bottom-4 duration-700';

const painPoints = [
  {
    label: 'Warme lead wacht',
    value: '18 min',
    detail: 'Lang genoeg om te vergelijken, te twijfelen of iemand anders te appen.',
    icon: Timer,
  },
  {
    label: 'Agent herhaalt context',
    value: '3x',
    detail: 'Elke overdracht voelt kouder wanneer de klant opnieuw moet beginnen.',
    icon: AlertTriangle,
  },
  {
    label: 'Follow-up vergeten',
    value: '1 deal kwijt',
    detail: 'Het pijnlijke is niet het bericht. Het is het moment dat je mist.',
    icon: CircleDollarSign,
  },
];

const proofItems = [
  { label: 'Elke lead beantwoord', value: 'AI reageert voordat intentie afkoelt' },
  { label: 'Agents werken rustiger', value: 'Routinewerk loopt automatisch' },
  { label: 'Calls worden bruikbaar', value: 'Samenvattingen, opnames, vervolgstappen' },
  { label: 'Sales blijft bewegen', value: 'Follow-up, afspraak, overdracht' },
  { label: 'Data blijft dichtbij', value: 'Jouw opslag, jouw controle' },
];

const salesFlow = [
  {
    title: 'Vangen',
    detail: 'Een lead appt, belt, klikt op een advertentie of reageert op een campagne.',
    icon: MessageCircle,
  },
  {
    title: 'Kwalificeren',
    detail: 'Kyrn stelt de juiste vragen en begrijpt urgentie, budget en intentie.',
    icon: BrainCircuit,
  },
  {
    title: 'Inplannen',
    detail: 'De agent stelt tijden voor, bevestigt details en houdt de klant warm.',
    icon: CalendarCheck,
  },
  {
    title: 'Overdragen',
    detail: 'Je team krijgt de samenvatting, tags, score en beste vervolgstap.',
    icon: UserCheck,
  },
];

const voiceAgentCards = [
  {
    title: 'Neemt op wanneer je team niet kan',
    description:
      'Kyrn kan opnemen, de klant begroeten, de reden van het gesprek begrijpen en het gesprek verder brengen in plaats van de kans te missen.',
    icon: PhoneCall,
  },
  {
    title: 'Kwalificeert zonder koud te klinken',
    description:
      'De spraakagent stelt natuurlijke vragen, verzamelt wat sales nodig heeft en laat klanten niet voelen alsof ze een formulier invullen.',
    icon: Mic,
  },
  {
    title: 'Plant, routeert of escaleert',
    description:
      'Wanneer de lead klaar is, plant Kyrn een afspraak, routeert het gesprek naar de juiste persoon of maakt een nette follow-up voor later.',
    icon: PhoneForwarded,
  },
];

const inboxRelief = [
  'AI handelt eerste reacties, veelgestelde vragen, kwalificatie, reminders en lead-routing af',
  'Agents zien het hele verhaal: berichten, gesprekken, tags, notities en samenvattingen',
  'Snelle antwoorden houden tempo hoog zonder onmenselijk te klinken',
  'Campagnereacties komen binnen op dezelfde plek als normale klantgesprekken',
  'Gespreksopnames en samenvattingen maken coaching en overdracht makkelijker',
  'Webhooks houden je CRM, facturatie en operationele tools synchroon',
];

const trustControls = [
  {
    title: 'Opnames waar jij ze vertrouwt',
    description:
      'Sla gespreksopnames op in je eigen S3-compatible bucket voor coaching, compliance en duidelijke afspraken.',
    icon: HardDrive,
  },
  {
    title: 'Menselijke overdracht blijft netjes',
    description:
      'Wanneer een gesprek aandacht nodig heeft, draagt Kyrn het met context over zodat de klant zich niet achtergelaten voelt.',
    icon: HeartHandshake,
  },
  {
    title: 'API-klaar vanaf dag een',
    description:
      'Koppel contacten, events, opnames en berichtflows aan de systemen waar je team al op draait.',
    icon: Code2,
  },
];

const apiCards = [
  {
    title: 'Sales-events',
    description: 'Stuur gekwalificeerde leads, geboekte demo’s, gemiste gesprekken en campagnereacties naar je CRM.',
  },
  {
    title: 'Voice-events',
    description: 'Reageer op gesprek gestart, gesprek beeindigd, opname klaar, overdracht gevraagd en samenvatting gemaakt.',
  },
  {
    title: 'Team-events',
    description: 'Routeer gesprekken op eigenaar, afdeling, taal, fase of werkdruk.',
  },
];

const platformCapabilities = [
  {
    title: 'Gesprekken worden opgenomen',
    description: 'Elk belangrijk spraakgesprek kan worden opgeslagen, samengevat en aan de klanttijdlijn gekoppeld.',
    icon: HardDrive,
  },
  {
    title: 'Je eigen AI-modellen',
    description: 'Koppel de modelopzet die je team vertrouwt en vorm agents rond je toon, aanbod en salesproces.',
    icon: BrainCircuit,
  },
  {
    title: 'API’s en webhooks',
    description: 'Stuur leads, berichten, opnames, campagnereacties en overdrachten naar de systemen die je al gebruikt.',
    icon: Code2,
  },
  {
    title: 'Campagne-opvolging',
    description: 'Verstuur broadcasts, vang reacties op, kwalificeer antwoorden en zet warme leads direct in follow-up.',
    icon: MessageCircle,
  },
  {
    title: 'Kanban salesbord',
    description: 'Bekijk elk gesprek per fase zodat je team exact weet wat als volgende aandacht nodig heeft.',
    icon: Users,
  },
  {
    title: 'Interactieve workflows',
    description: 'Bouw paden met voorwaarden, vertragingen, voice follow-up, menselijke overdracht en beste vervolgstappen.',
    icon: Workflow,
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
      <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">{title}</h2>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">{description}</p>
    </div>
  );
}

function CleanBrowserFrame({
  children,
  label = 'kyrn.nl/dashboard',
  className = '',
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/5 ${reveal} ${className}`}>
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-3">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div className="hidden h-7 min-w-[280px] items-center justify-center rounded-lg border border-border/60 bg-background px-8 text-[10px] font-medium text-muted-foreground sm:flex">
          {label}
        </div>
        <div className="w-14" />
      </div>
      {children}
    </div>
  );
}

function PainStrip() {
  return (
    <section className="border-y border-border bg-muted/20 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Gebouwd voor teams die zich geen gemiste leads, vermoeide agents of koude klantmomenten kunnen veroorloven
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {painPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.label} className={`rounded-2xl border border-border bg-background p-6 ${cardMotion}`}>
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-bold tracking-tight text-foreground">{point.value}</span>
                </div>
                <h3 className="font-semibold">{point.label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{point.detail}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {proofItems.map((item) => (
            <div key={item.label} className={`rounded-xl border border-border bg-background p-4 text-center ${cardMotion}`}>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VoiceAgentCockpit() {
  return (
    <CleanBrowserFrame label="kyrn.nl/voice-agent">
      <div className="grid min-h-[460px] bg-background md:grid-cols-[72px_1fr]">
        <div className="hidden border-r border-border/60 bg-muted/10 p-4 md:block">
          <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div className="space-y-4 text-muted-foreground">
            {[PhoneCall, BrainCircuit, CalendarCheck, UserCheck].map((Icon, index) => (
              <div
                key={index}
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  index === 1 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Spraakagent</p>
              <p className="font-semibold">Live kwalificatiegesprek</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">In gesprek</span>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  AF
                </div>
                <div>
                  <p className="text-sm font-semibold">Alice Freeman</p>
                  <p className="text-xs text-muted-foreground">Inkomend gesprek via WhatsApp</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                "We zoeken iets dat leads buiten werktijd beantwoordt en demo’s plant voor ons salesteam."
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Leadscore', '92%', TrendingUp],
                ['Intentie', 'Demo plannen', CalendarCheck],
                ['Urgentie', 'Deze week', Zap],
              ].map(([label, value, Icon]) => {
                const TileIcon = Icon as typeof TrendingUp;
                return (
                  <div key={label as string} className="rounded-xl border border-border bg-background p-3">
                    <TileIcon className="mb-2 h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">{label as string}</p>
                    <p className="mt-1 text-sm font-semibold">{value as string}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">Beste vervolgstap</p>
              <p className="text-sm font-semibold">Plan een demo, tag als warme lead en waarschuw sales.</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Kyrn houdt de klant warm en geeft je team alle context voordat ze instappen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CleanBrowserFrame>
  );
}

function SalesFlow() {
  return (
    <div className="mt-12 grid gap-5 md:grid-cols-4">
      {salesFlow.map((step, index) => {
        const Icon = step.icon;
        return (
          <div key={step.title} className={`relative rounded-2xl border border-border bg-card p-6 ${cardMotion}`}>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-primary">{String(index + 1).padStart(2, '0')}</span>
            </div>
            <h3 className="font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.detail}</p>
          </div>
        );
      })}
    </div>
  );
}

function BeforeAfter() {
  const before = [
    'Lead stelt om 21:47 een vraag',
    'Team reageert de volgende ochtend',
    'Agent vraagt details opnieuw',
    'Follow-up hangt af van geheugen',
  ];
  const after = [
    'Kyrn reageert binnen seconden',
    'AI kwalificeert en scoort de lead',
    'Spraakagent plant of routeert het gesprek',
    'Sales krijgt samenvatting en vervolgstap',
  ];

  return (
    <CleanBrowserFrame label="kyrn.nl/revenue-recovery">
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <div className="rounded-2xl bg-muted/30 p-5">
          <p className="mb-4 text-sm font-semibold text-muted-foreground">Zonder Kyrn</p>
          <div className="space-y-3">
            {before.map((item) => (
              <div key={item} className="flex gap-3 text-sm text-muted-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5">
          <p className="mb-4 text-sm font-semibold text-primary">Met Kyrn</p>
          <div className="space-y-3">
            {after.map((item) => (
              <div key={item} className="flex gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CleanBrowserFrame>
  );
}

function FlowCanvas() {
  const nodes = [
    ['Begroeting', 'Warm welkom', 'left-6 top-8'],
    ['Kwalificeer', 'Budget + urgentie', 'left-[38%] top-24'],
    ['Demo plannen', 'Agenda-pad', 'right-6 top-10'],
    ['Overdragen', 'Sales met context', 'left-16 bottom-8'],
    ['Follow-up', 'Geen lead koelt af', 'right-12 bottom-12'],
  ];

  return (
    <CleanBrowserFrame label="kyrn.nl/flow-builder">
      <div className="relative min-h-[430px] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Sales + voice flow</p>
            <p className="font-semibold">Van eerste bericht naar geplande afspraak</p>
          </div>
          <Workflow className="h-5 w-5 text-primary" />
        </div>
        <div className="absolute inset-x-8 top-28 h-px bg-primary/25" />
        <div className="absolute bottom-28 left-24 right-24 h-px bg-primary/20" />
        <div className="absolute left-1/2 top-32 h-44 w-px bg-primary/20" />
        {nodes.map(([title, detail, position]) => (
          <div
            key={title}
            className={`absolute ${position} w-40 rounded-xl border border-border bg-background p-3 shadow-md`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <p className="text-sm font-semibold">{title}</p>
            </div>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>
    </CleanBrowserFrame>
  );
}

function InboxMockup() {
  return (
    <CleanBrowserFrame label="kyrn.nl/revenue-inbox">
      <div className="grid min-h-[500px] md:grid-cols-[42%_58%]">
        <div className="border-r border-border/60 bg-muted/10 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Revenue inbox</p>
              <p className="font-semibold">Warme gesprekken</p>
            </div>
            <Inbox className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {[
              ['Alice Freeman', 'Wil deze week overstappen', 'Warm'],
              ['TechBuild Inc', 'Vroeg naar API-prijzen', 'Demo'],
              ['Diana Morales', 'Gemiste oproep hersteld', 'Call'],
            ].map(([name, detail, tag]) => (
              <div key={name} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                    {tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5">
          <div className="space-y-4">
            <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-muted p-3 text-sm">
              Kan iemand mij vandaag bellen? We zijn klaar om over te stappen.
              <span className="mt-1 block text-right text-[10px] text-muted-foreground">10:32</span>
            </div>
            <div className="ml-auto max-w-[86%] rounded-2xl rounded-tr-sm border border-primary/20 bg-primary/10 p-3 text-sm">
              Zeker. Ik kan nu helpen en meteen een afspraak met ons team plannen.
              <span className="mt-1 block text-right text-[10px] text-primary/70">10:32</span>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="mb-2 text-xs font-semibold text-primary">AI-samenvatting</p>
              <p className="text-sm text-muted-foreground">
                Warme lead. Heeft WhatsApp-automatisering, voice follow-up en teaminbox nodig. Demo gevraagd voor deze week.
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold">recovery_campaign</span>
                <span className="text-muted-foreground">2.847 / 3.500 verzonden</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full w-[81%] rounded-full bg-primary" />
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span>94% afgeleverd</span>
                <span>67% gelezen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CleanBrowserFrame>
  );
}

function RecordingPanel() {
  const rows = [
    ['AF', 'Alice Freeman', 'Demo geboekt via spraakgesprek', '04:56'],
    ['TI', 'TechBuild Inc', 'Heeft API + teamrouting nodig', '02:08'],
    ['DM', 'Diana Morales', 'Gemiste oproep opgevolgd', '00:42'],
    ['AK', 'Arjun Kapoor', 'Campagnereactie gekwalificeerd', '07:13'],
  ];

  return (
    <CleanBrowserFrame label="kyrn.nl/call-memory">
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Gespreksgeheugen</p>
            <p className="font-semibold">Opnames + samenvattingen</p>
          </div>
          <HardDrive className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-3">
          {rows.map(([initials, name, detail, duration]) => (
            <div key={name} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-xl bg-muted/40 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background text-xs font-bold text-primary">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{detail}</p>
              </div>
              <div className="text-right text-sm font-semibold">
                {duration}
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">S3</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CleanBrowserFrame>
  );
}

function ProductSuiteMockup() {
  const columns = [
    ['Nieuw', 'Advertentiereactie: wil prijzen', 'Terugbelverzoek via voice'],
    ['Gekwalificeerd', 'Demo geboekt door AI', 'Budget bevestigd'],
    ['Gewonnen', 'Contract verstuurd', 'Onboardinggesprek gepland'],
  ];

  return (
    <CleanBrowserFrame label="kyrn.nl/operations">
      <div className="grid min-h-[560px] md:grid-cols-[220px_1fr]">
        <div className="border-r border-border/60 bg-muted/10 p-5">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Werkruimte</p>
          <div className="space-y-2">
            {[
              ['Spraakagents', PhoneCall],
              ['AI-modellen', BrainCircuit],
              ['Campagnes', MessageCircle],
              ['Kanbanbord', Users],
              ['API-events', Code2],
              ['Opnames', HardDrive],
            ].map(([label, Icon], index) => {
              const RowIcon = Icon as typeof PhoneCall;
              return (
                <div
                  key={label as string}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                    index === 0 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <RowIcon className="h-4 w-4" />
                  <span>{label as string}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Sales command center</p>
              <p className="font-semibold">Voice, campagnes, kanban en workflows in een laag</p>
            </div>
            <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Automatisch opgenomen
            </span>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {[
              ['AI-model', 'Saleskwalificatie v2'],
              ['Campagne', 'Herstelreeks live'],
              ['API', '12 events gesynchroniseerd'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {columns.map(([title, first, second]) => (
              <div key={title} className="rounded-2xl border border-border bg-muted/20 p-3">
                <p className="mb-3 text-sm font-semibold">{title}</p>
                {[first, second].map((item) => (
                  <div key={item} className="mb-3 rounded-xl border border-border bg-background p-3 text-sm shadow-sm">
                    <p className="font-medium">{item}</p>
                    <p className="mt-1 text-xs text-muted-foreground">AI-samenvatting + vervolgstap klaar</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CleanBrowserFrame>
  );
}

function ArchitectureDiagram() {
  return (
    <div className={`rounded-2xl border border-border bg-card p-6 shadow-xl ${reveal}`}>
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Jouw bedrijf</p>
          <p className="mt-2 font-semibold">CRM, website, advertenties, support</p>
          <p className="text-sm text-muted-foreground">REST + webhooks</p>
        </div>
        <ArrowRight className="hidden h-5 w-5 text-primary md:block" />
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Kyrn</p>
          <p className="mt-2 font-semibold">Spraakagents + WhatsApp AI</p>
          <p className="text-sm text-muted-foreground">Inbox, routing, campagnes, samenvattingen</p>
        </div>
        <ArrowRight className="hidden h-5 w-5 text-primary md:block" />
        <div className="space-y-3">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="font-semibold">Meta Cloud API</p>
            <p className="text-sm text-muted-foreground">WhatsApp-berichten</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="font-semibold">Jouw S3</p>
            <p className="text-sm text-muted-foreground">Opnames en media</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WhatomateSections() {
  return (
    <div className="bg-background">
      <PainStrip />

      <section id="sales-line" className="py-24 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center ${reveal}`}>
            <div>
              <SectionHeading
                eyebrow="Saleslijn"
                title="Je snelste salesmedewerker is degene die als eerste antwoordt."
                description="Kyrn verandert WhatsApp in een 24/7 saleslijn: het reageert, kwalificeert, belt terug, plant afspraken en draagt warme gesprekken over voordat momentum verdwijnt."
              />
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/sign-up">
                    Start met leads vangen <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="#voice-agents">Bekijk spraakagents</Link>
                </Button>
              </div>
            </div>
            <BeforeAfter />
          </div>
          <SalesFlow />
        </div>
      </section>

      <section id="voice-agents" className="border-y border-border bg-muted/20 py-24 scroll-mt-20">
        <div className={`mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:items-center ${reveal}`}>
          <div>
            <SectionHeading
              eyebrow="Spraakagents"
              title="Laat Kyrn opnemen, kwalificeren en plannen terwijl je team bezig is."
              description="Niet iedere klant wil typen. Sommigen willen een stem, snel antwoord en een duidelijke vervolgstap. Kyrn geeft ze dat moment zonder dat je team de hele dag naast de telefoon hoeft te zitten."
            />
            <div className="mt-8 grid gap-4">
              {voiceAgentCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className={`flex gap-4 rounded-2xl border border-border bg-background p-5 ${cardMotion}`}>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{card.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <VoiceAgentCockpit />
        </div>
      </section>

      <section id="sales-flow-builder" className="py-24 scroll-mt-20">
        <div className={`mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8 lg:items-center ${reveal}`}>
          <FlowCanvas />
          <div>
            <SectionHeading
              eyebrow="Automatisering die verkoopt"
              title="Bouw het pad van eerste vraag naar geplande afspraak."
              description="Maak flows die menselijk voelen: verwelkom de lead, vraag wat ertoe doet, routeer op urgentie, start voice follow-up en waarschuw sales met het verhaal al klaar."
            />
            <div className="mt-8 grid gap-3">
              {[
                'Haal leads terug die buiten kantooruren appen',
                'Start voice follow-up wanneer intentie hoog is',
                'Routeer VIP-klanten zonder dat ze context moeten herhalen',
                'Stuur reminders, bevestigingen en follow-ups na gesprekken',
                'Pauzeer AI zodra een mens moet overnemen',
              ].map((feature) => (
                <div key={feature} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {feature}
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full">
                <Link href="/sign-up">
                  Bouw mijn salesflow <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="#shared-inbox">Bekijk de inbox</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="shared-inbox" className="border-y border-border bg-muted/20 py-24">
        <div className={`mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:items-center ${reveal}`}>
          <div>
            <SectionHeading
              eyebrow="Rust voor je team"
              title="Geef je team de rust van een duidelijke revenue inbox."
              description="Niet meer springen tussen tools, raden wie eigenaar is van een lead of context verliezen na een gesprek. Kyrn geeft agents een rustigere wachtrij en klanten sneller, persoonlijker antwoord."
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {inboxRelief.map((feature) => (
                <li key={feature} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/sign-up">
                  Breng rust in mijn inbox <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <InboxMockup />
        </div>
      </section>

      <section id="product-suite" className="py-24 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`mb-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end ${reveal}`}>
            <SectionHeading
              eyebrow="Complete werklaag"
              title="Alles wat je WhatsApp-salesteam nodig heeft, in een strak systeem."
              description="Kyrn is meer dan een inbox. Het brengt opgenomen gesprekken, je eigen AI-modellen, API’s, campagnes, kanbanfases en interactieve workflows samen in een hoogwaardige revenue workspace."
            />
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button asChild className="rounded-full">
                <Link href="/sign-up">
                  Bouw mijn werkruimte <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="#recording">Bekijk gespreksgeheugen</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platformCapabilities.map((capability) => {
              const Icon = capability.icon;
              return (
                <div key={capability.title} className={`rounded-2xl border border-border bg-card p-5 ${cardMotion}`}>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{capability.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{capability.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <ProductSuiteMockup />
          </div>
        </div>
      </section>

      <section id="recording" className="border-y border-border bg-muted/20 py-24">
        <div className={`mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:items-center ${reveal}`}>
          <div>
            <SectionHeading
              eyebrow="Geheugen en vertrouwen"
              title="Het gesprek verdwijnt niet wanneer de call eindigt."
              description="Sommige gesprekken worden coachingmomenten. Sommige beschermen vertrouwen. Sommige redden een deal. Kyrn houdt opnames, samenvattingen en follow-up stappen beschikbaar waar je team ze nodig heeft."
            />
            <div className="mt-8 grid gap-4">
              {trustControls.map((control) => {
                const Icon = control.icon;
                return (
                  <div key={control.title} className={`flex gap-4 rounded-2xl border border-border bg-card p-5 ${cardMotion}`}>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{control.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{control.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <RecordingPanel />
        </div>
      </section>

      <section id="architecture" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center ${reveal}`}>
            <SectionHeading
              eyebrow="Controle"
              title="Gebouwd voor vertrouwen voordat het gebouwd is voor schaal."
              description="Kyrn geeft je de kracht van WhatsApp-automatisering, spraakagents en campagnes zonder dat je de klantrelatie uit handen geeft. Houd je data, opnames en klantmomenten dichtbij."
            />
            <ArchitectureDiagram />
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {apiCards.map((card) => (
              <div key={card.title} className={`rounded-2xl border border-border bg-background p-6 ${cardMotion}`}>
                <Network className="mb-4 h-5 w-5 text-primary" />
                <h3 className="font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="get-started" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`grid gap-8 rounded-2xl border border-border bg-card p-6 shadow-xl md:grid-cols-[0.95fr_1.05fr] md:p-10 md:items-center ${reveal}`}>
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-primary">Aan de slag</p>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                Begin met de volgende lead die normaal zou wegglippen.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Koppel WhatsApp, nodig je team uit en laat Kyrn druk van de inbox halen voordat het volgende klantmoment afkoelt.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/sign-up">
                    Start met Kyrn <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="/docs">Lees de documentatie</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Server className="h-5 w-5 text-primary" />
                kyrn-setup
              </div>
              <div className="space-y-3 font-mono text-sm">
                {[
                  ['# Koppel WhatsApp', '1 zakelijk nummer'],
                  ['# Activeer AI-salesagent', 'Antwoorden, kwalificatie, planning'],
                  ['# Voeg voice follow-up toe', 'Gesprekken, routing, opnames'],
                  ['# Zie de inbox rustiger worden', 'Leads op een plek afgehandeld'],
                ].map(([label, command]) => (
                  <div key={label} className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 text-foreground">{command}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="voice-agent-cta" className="border-t border-border bg-muted/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-xl md:p-12 ${reveal}`}>
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-primary">Premium spraakagents</p>
            <h2 className="mx-auto max-w-4xl text-3xl font-bold tracking-tight md:text-5xl">
              Geef elke serieuze lead een spraakagent die voorbereid, rustig en verkoopklaar klinkt.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              Kyrn doet meer dan reageren. Het kan opnemen, kwalificeren, terugbellen, afspraken plannen, het gesprek samenvatten
              en je team een lead geven die zich al begrepen voelt.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/sign-up">
                  Lanceer mijn spraakagent <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/contact">Praat eerst met ons</Link>
              </Button>
            </div>
            <div className="mx-auto mt-8 grid max-w-4xl gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
              {['Inkomende spraakagent', 'AI-leadkwalificatie', 'Agenda-afspraken', 'Menselijke overdracht'].map((item) => (
                <div key={item} className="rounded-full border border-border bg-background px-4 py-2">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
