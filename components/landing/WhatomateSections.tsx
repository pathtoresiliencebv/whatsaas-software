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
    label: 'Hot lead waits',
    value: '18 min',
    detail: 'Long enough to compare, doubt, or message someone else.',
    icon: Timer,
  },
  {
    label: 'Agent repeats context',
    value: '3x',
    detail: 'Every handoff feels colder when the customer starts over.',
    icon: AlertTriangle,
  },
  {
    label: 'Follow-up forgotten',
    value: '1 sale lost',
    detail: 'The painful part is not the message. It is the moment you missed.',
    icon: CircleDollarSign,
  },
];

const proofItems = [
  { label: 'Every lead answered', value: 'AI replies before intent fades' },
  { label: 'Agents feel lighter', value: 'Routine work moves automatically' },
  { label: 'Calls become useful', value: 'Summaries, recordings, next steps' },
  { label: 'Sales keeps moving', value: 'Follow-up, booking, handoff' },
  { label: 'Data stays close', value: 'Your storage, your controls' },
];

const salesFlow = [
  {
    title: 'Capture',
    detail: 'A lead messages, calls, clicks an ad, or replies to a campaign.',
    icon: MessageCircle,
  },
  {
    title: 'Qualify',
    detail: 'Kyrn asks the right questions and understands urgency, budget, and intent.',
    icon: BrainCircuit,
  },
  {
    title: 'Book',
    detail: 'The agent proposes times, confirms details, and keeps the customer warm.',
    icon: CalendarCheck,
  },
  {
    title: 'Handoff',
    detail: 'Your team receives the summary, tags, score, and next best action.',
    icon: UserCheck,
  },
];

const voiceAgentCards = [
  {
    title: 'Answers calls when your team cannot',
    description:
      'Kyrn can pick up, greet the customer, understand the reason for the call, and keep the conversation moving instead of letting it become a missed opportunity.',
    icon: PhoneCall,
  },
  {
    title: 'Qualifies without sounding cold',
    description:
      'The voice agent asks natural questions, captures the details sales needs, and avoids making customers feel like they are filling out a form.',
    icon: Mic,
  },
  {
    title: 'Books, routes, or escalates',
    description:
      'When the lead is ready, Kyrn can schedule a meeting, route the call to the right person, or create a clean follow-up for later.',
    icon: PhoneForwarded,
  },
];

const inboxRelief = [
  'AI handles first replies, FAQs, qualification, reminders, and lead routing',
  'Agents see the whole story: messages, calls, tags, notes, and summaries',
  'Quick replies keep speed high while still sounding human',
  'Campaign replies land in the same place as normal customer conversations',
  'Call recordings and summaries make coaching and handover easier',
  'Webhooks keep your CRM, billing, and operations tools in sync',
];

const trustControls = [
  {
    title: 'Recordings where you trust them',
    description:
      'Store call recordings in your own S3-compatible bucket for coaching, compliance, and dispute clarity.',
    icon: HardDrive,
  },
  {
    title: 'Human handoff stays respectful',
    description:
      'When a conversation needs care, Kyrn transfers it with context so the customer does not feel abandoned.',
    icon: HeartHandshake,
  },
  {
    title: 'API-ready from day one',
    description:
      'Connect contacts, events, recordings, and message flows to the systems your team already depends on.',
    icon: Code2,
  },
];

const apiCards = [
  {
    title: 'Sales events',
    description: 'Push qualified leads, booked demos, missed calls, and campaign replies into your CRM.',
  },
  {
    title: 'Voice events',
    description: 'React to call started, call ended, recording ready, transfer requested, and summary created.',
  },
  {
    title: 'Team events',
    description: 'Route conversations by owner, department, language, stage, or workload.',
  },
];

const platformCapabilities = [
  {
    title: 'Calls are recorded',
    description: 'Every important voice conversation can be stored, summarized, and attached to the customer timeline.',
    icon: HardDrive,
  },
  {
    title: 'Your own AI models',
    description: 'Connect the model setup your team trusts and shape agents around your tone, offer, and sales process.',
    icon: BrainCircuit,
  },
  {
    title: 'APIs and webhooks',
    description: 'Push leads, messages, recordings, campaign replies, and handoffs into the systems you already use.',
    icon: Code2,
  },
  {
    title: 'Campaign recovery',
    description: 'Send broadcasts, catch replies, qualify responses, and move warm leads straight into follow-up.',
    icon: MessageCircle,
  },
  {
    title: 'Kanban sales board',
    description: 'See every conversation by stage so your team knows exactly what needs attention next.',
    icon: Users,
  },
  {
    title: 'Interactive workflows',
    description: 'Build paths with conditions, delays, voice follow-up, human handoff, and next-best actions.',
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
          Built for teams that cannot afford missed leads, tired agents, or cold customer moments
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Voice agent</p>
              <p className="font-semibold">Live qualification call</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Speaking</span>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  AF
                </div>
                <div>
                  <p className="text-sm font-semibold">Alice Freeman</p>
                  <p className="text-xs text-muted-foreground">Inbound call from WhatsApp</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                "We need something that answers leads after hours and books demos for our sales team."
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Lead score', '92%', TrendingUp],
                ['Intent', 'Book demo', CalendarCheck],
                ['Urgency', 'This week', Zap],
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
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">Next best action</p>
              <p className="text-sm font-semibold">Book a demo, tag as Hot Lead, and notify Sales.</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Kyrn keeps the customer warm and gives your team the full context before they step in.
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
    'Lead asks a question at 21:47',
    'Team replies the next morning',
    'Agent asks for details again',
    'Follow-up depends on memory',
  ];
  const after = [
    'Kyrn replies in seconds',
    'AI qualifies and scores the lead',
    'Voice agent books or routes the call',
    'Sales receives summary and next step',
  ];

  return (
    <CleanBrowserFrame label="kyrn.nl/revenue-recovery">
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <div className="rounded-2xl bg-muted/30 p-5">
          <p className="mb-4 text-sm font-semibold text-muted-foreground">Without Kyrn</p>
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
          <p className="mb-4 text-sm font-semibold text-primary">With Kyrn</p>
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
    ['Greeting', 'Warm welcome', 'left-6 top-8'],
    ['Qualify', 'Budget + urgency', 'left-[38%] top-24'],
    ['Book demo', 'Calendar path', 'right-6 top-10'],
    ['Transfer', 'Sales with context', 'left-16 bottom-8'],
    ['Follow-up', 'No lead left cold', 'right-12 bottom-12'],
  ];

  return (
    <CleanBrowserFrame label="kyrn.nl/flow-builder">
      <div className="relative min-h-[430px] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Sales + voice flow</p>
            <p className="font-semibold">From first message to booked meeting</p>
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
              <p className="font-semibold">Hot conversations</p>
            </div>
            <Inbox className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {[
              ['Alice Freeman', 'Ready to switch this week', 'Hot'],
              ['TechBuild Inc', 'Asked for API pricing', 'Demo'],
              ['Diana Morales', 'Missed call recovered', 'Call'],
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
              Can someone call me today? We are ready to switch.
              <span className="mt-1 block text-right text-[10px] text-muted-foreground">10:32</span>
            </div>
            <div className="ml-auto max-w-[86%] rounded-2xl rounded-tr-sm border border-primary/20 bg-primary/10 p-3 text-sm">
              Absolutely. I can help now and book a time with our team.
              <span className="mt-1 block text-right text-[10px] text-primary/70">10:32</span>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="mb-2 text-xs font-semibold text-primary">AI summary</p>
              <p className="text-sm text-muted-foreground">
                Hot lead. Needs WhatsApp automation, voice follow-up, and team inbox. Demo requested this week.
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold">recovery_campaign</span>
                <span className="text-muted-foreground">2,847 / 3,500 sent</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full w-[81%] rounded-full bg-primary" />
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span>94% delivered</span>
                <span>67% read</span>
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
    ['AF', 'Alice Freeman', 'Demo booked from voice call', '04:56'],
    ['TI', 'TechBuild Inc', 'Needs API + team routing', '02:08'],
    ['DM', 'Diana Morales', 'Missed call recovered', '00:42'],
    ['AK', 'Arjun Kapoor', 'Campaign reply qualified', '07:13'],
  ];

  return (
    <CleanBrowserFrame label="kyrn.nl/call-memory">
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Call memory</p>
            <p className="font-semibold">Recordings + summaries</p>
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
    ['New', 'Ad reply: wants pricing', 'Voice callback requested'],
    ['Qualified', 'Demo booked by AI', 'Budget confirmed'],
    ['Won', 'Contract sent', 'Onboarding call planned'],
  ];

  return (
    <CleanBrowserFrame label="kyrn.nl/operations">
      <div className="grid min-h-[560px] md:grid-cols-[220px_1fr]">
        <div className="border-r border-border/60 bg-muted/10 p-5">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
          <div className="space-y-2">
            {[
              ['Voice agents', PhoneCall],
              ['AI models', BrainCircuit],
              ['Campaigns', MessageCircle],
              ['Kanban board', Users],
              ['API events', Code2],
              ['Recordings', HardDrive],
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
              <p className="font-semibold">Voice, campaigns, kanban and workflows in one layer</p>
            </div>
            <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Recorded automatically
            </span>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            {[
              ['AI model', 'Sales qualifier v2'],
              ['Campaign', 'Recovery sequence live'],
              ['API', '12 events synced'],
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
                    <p className="mt-1 text-xs text-muted-foreground">AI summary + next action ready</p>
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Your business</p>
          <p className="mt-2 font-semibold">CRM, website, ads, support</p>
          <p className="text-sm text-muted-foreground">REST + webhooks</p>
        </div>
        <ArrowRight className="hidden h-5 w-5 text-primary md:block" />
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Kyrn</p>
          <p className="mt-2 font-semibold">Voice agents + WhatsApp AI</p>
          <p className="text-sm text-muted-foreground">Inbox, routing, campaigns, summaries</p>
        </div>
        <ArrowRight className="hidden h-5 w-5 text-primary md:block" />
        <div className="space-y-3">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="font-semibold">Meta Cloud API</p>
            <p className="text-sm text-muted-foreground">WhatsApp messaging</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="font-semibold">Your S3</p>
            <p className="text-sm text-muted-foreground">Recordings and media</p>
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
                eyebrow="Sales line"
                title="Your fastest sales rep is the one that answers first."
                description="Kyrn turns WhatsApp into a 24/7 sales line: it replies, qualifies, calls back, books meetings, and hands warm conversations to your team before momentum disappears."
              />
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/sign-up">
                    Start capturing leads <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="#voice-agents">See voice agents</Link>
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
              eyebrow="Voice agents"
              title="Let Kyrn answer, qualify, and book while your team is busy."
              description="Not every customer wants to type. Some want a voice, a quick answer, and a clear next step. Kyrn gives them that moment without forcing your team to sit by the phone all day."
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
              eyebrow="Automation that sells"
              title="Build the path from first question to booked meeting."
              description="Create flows that feel human: welcome the lead, ask what matters, route by urgency, trigger voice follow-up, and notify sales with the story already prepared."
            />
            <div className="mt-8 grid gap-3">
              {[
                'Recover leads that message outside office hours',
                'Trigger voice follow-up when intent is high',
                'Route VIP customers without making them repeat context',
                'Send reminders, confirmations, and post-call follow-ups',
                'Pause AI whenever a human should take over',
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
                  Build my sales flow <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="#shared-inbox">See the inbox</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="shared-inbox" className="border-y border-border bg-muted/20 py-24">
        <div className={`mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:items-center ${reveal}`}>
          <div>
            <SectionHeading
              eyebrow="Team relief"
              title="Give your team the relief of one clear revenue inbox."
              description="No more jumping between tools, guessing who owns a lead, or losing context after a call. Kyrn gives agents a calmer queue and customers a faster, more personal answer."
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
                  Calm my inbox <ArrowRight className="ml-2 h-4 w-4" />
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
              eyebrow="Complete operating layer"
              title="Everything your WhatsApp sales team needs, in one clean system."
              description="Kyrn is not just an inbox. It brings recorded calls, your own AI models, APIs, campaigns, kanban stages, and interactive workflows into one high-end revenue workspace."
            />
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button asChild className="rounded-full">
                <Link href="/sign-up">
                  Build my workspace <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="#recording">See call memory</Link>
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
              eyebrow="Memory and trust"
              title="The conversation does not disappear when the call ends."
              description="Some calls become coaching moments. Some protect trust. Some save a deal. Kyrn keeps recordings, summaries, and follow-up steps available where your team can use them."
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
              eyebrow="Control"
              title="Built for trust before it is built for scale."
              description="Kyrn gives you the power of WhatsApp automation, voice agents, and campaigns without asking you to hand over the relationship. Keep your data, recordings, and customer moments close."
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
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-primary">Get started</p>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                Start with the next lead that would normally slip away.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Connect WhatsApp, invite your team, and let Kyrn take pressure off the inbox before another customer moment goes cold.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/sign-up">
                    Start with Kyrn <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="/docs">Read the docs</Link>
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
                  ['# Connect WhatsApp', '1 business number'],
                  ['# Activate AI sales agent', 'Replies, qualification, booking'],
                  ['# Add voice follow-up', 'Calls, routing, recordings'],
                  ['# Watch the inbox calm down', 'Leads handled in one place'],
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
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-primary">Premium voice agents</p>
            <h2 className="mx-auto max-w-4xl text-3xl font-bold tracking-tight md:text-5xl">
              Give every serious lead a voice agent that sounds prepared, calm, and ready to sell.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              Kyrn does more than reply. It can answer, qualify, call back, book meetings, summarize the conversation,
              and hand your team a lead that already feels understood.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/sign-up">
                  Launch my voice agent <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href="/contact">Talk to us first</Link>
              </Button>
            </div>
            <div className="mx-auto mt-8 grid max-w-4xl gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
              {['Inbound voice agent', 'AI lead qualification', 'Calendar booking', 'Human handoff'].map((item) => (
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
