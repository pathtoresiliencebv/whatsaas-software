import type { ReactNode } from 'react';
import { getDashboardStats } from './actions';
import { getSession } from '@/lib/auth/session';
import { getUserWithTeam } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

const fallbackStages = ['Nieuw', 'Onderhandeling', 'Gewonnen', 'Verloren'];

type FunnelMetric = {
  name: string;
  count?: number;
  value?: number;
};

type AgentMetric = {
  name: string;
  total: number;
  funnels: Record<string, number>;
};

export default async function AnalyticsPage() {
  const t = await getTranslations('Analytics');
  const session = await getSession();
  if (!session?.user) {
    redirect('/sign-in');
  }

  const userTeamData = await getUserWithTeam(session.user.id);
  if (!userTeamData?.teamId) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#f8f8f7] text-sm text-zinc-500 dark:bg-[#252527] dark:text-zinc-400">
        {t('team_not_found')}
      </div>
    );
  }

  const { funnelMetrics, agentMetrics, trafficMetrics } = await getDashboardStats(userTeamData.teamId);
  const stages = normalizeFunnels(funnelMetrics);
  const maxValue = Math.max(4, ...stages.map((stage) => stage.count || 0));

  return (
    <div className="min-h-full overflow-auto bg-[#f8f8f7] p-8 text-zinc-950 dark:bg-[#252527] dark:text-white">
      <h1 className="mb-5 text-[32px] font-bold leading-tight tracking-tight">{t('dashboard_title')}</h1>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.49fr]">
        <AnalyticsPanel className="min-h-[395px]" title={t('conversations_by_funnel')}>
          <FunnelTrendChart stages={stages} maxValue={maxValue} />
        </AnalyticsPanel>

        <AnalyticsPanel className="min-h-[395px]" title={t('funnel_distribution')}>
          <FunnelRadar stages={stages} maxValue={maxValue} />
        </AnalyticsPanel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[0.93fr_1fr]">
        <AnalyticsPanel className="min-h-[440px]" title={t('conversations_by_agent')}>
          <AgentTable agents={agentMetrics as AgentMetric[]} stages={stages.map((stage) => stage.name)} />
        </AnalyticsPanel>

        <AnalyticsPanel className="min-h-[440px]" title={t('conversation_traffic')}>
          <TrafficGrid traffic={trafficMetrics} />
        </AnalyticsPanel>
      </div>
    </div>
  );
}

function AnalyticsPanel({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-[#303236] dark:bg-[#18191c] ${className}`}>
      <h2 className="text-lg font-bold text-zinc-950 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}

function FunnelTrendChart({ stages, maxValue }: { stages: FunnelMetric[]; maxValue: number }) {
  const yTicks = [4, 3, 2, 1, 0];

  return (
    <div className="mt-8 grid h-[315px] grid-cols-[44px_1fr] grid-rows-[1fr_auto] text-xs text-zinc-700 dark:text-zinc-100">
      <div className="relative row-span-2">
        {yTicks.map((tick, index) => (
          <span key={tick} className="absolute right-3 text-sm" style={{ top: `${index * 20}%`, transform: 'translateY(-50%)' }}>
            {tick}
          </span>
        ))}
      </div>

      <div className="relative">
        {yTicks.map((tick, index) => (
          <div
            key={tick}
            className="absolute left-0 right-0 border-t border-dashed border-zinc-200 dark:border-[#292b30]"
            style={{ top: `${index * 20}%` }}
          />
        ))}
        <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
          <polyline
            fill="none"
            points={stages.map((stage, index) => `${(index / Math.max(stages.length - 1, 1)) * 100},${100 - ((stage.count || 0) / maxValue) * 100}`).join(' ')}
            stroke="#35c45f"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
            vectorEffect="non-scaling-stroke"
          />
          {stages.map((stage, index) => (
            <circle
              key={stage.name}
              cx={(index / Math.max(stages.length - 1, 1)) * 100}
              cy={100 - ((stage.count || 0) / maxValue) * 100}
              fill="#35c45f"
              r="1.3"
            />
          ))}
        </svg>
      </div>

      <div className="col-start-2 grid pt-3" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
        {stages.map((stage) => (
          <span key={stage.name} className="text-center text-sm text-zinc-800 dark:text-white">
            {stage.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function FunnelRadar({ stages, maxValue }: { stages: FunnelMetric[]; maxValue: number }) {
  const labels = stages.slice(0, 4);
  while (labels.length < 4) {
    labels.push({ name: fallbackStages[labels.length], count: 0 });
  }

  const center = 150;
  const radius = 112;
  const labelPositions = [
    { x: center, y: center - radius - 16, anchor: 'middle' },
    { x: center + radius + 36, y: center, anchor: 'start' },
    { x: center, y: center + radius + 22, anchor: 'middle' },
    { x: center - radius - 36, y: center, anchor: 'end' },
  ] as const;

  const pointsFor = (scale: number) => [
    `${center},${center - radius * scale}`,
    `${center + radius * scale},${center}`,
    `${center},${center + radius * scale}`,
    `${center - radius * scale},${center}`,
  ].join(' ');

  const dataPoints = labels
    .map((stage, index) => {
      const scale = Math.min((stage.count || 0) / maxValue, 1);
      const coords = [
        [center, center - radius * scale],
        [center + radius * scale, center],
        [center, center + radius * scale],
        [center - radius * scale, center],
      ];
      return `${coords[index][0]},${coords[index][1]}`;
    })
    .join(' ');

  return (
    <div className="mt-8 flex h-[300px] items-center justify-center">
      <svg viewBox="0 0 300 300" className="h-[300px] w-[360px] overflow-visible">
        {[1, 0.75, 0.5, 0.25].map((scale) => (
          <polygon key={scale} points={pointsFor(scale)} fill="none" strokeWidth="1" className="stroke-zinc-200 dark:stroke-[#2f3238]" />
        ))}
        <line x1={center} y1={center - radius} x2={center} y2={center + radius} className="stroke-zinc-200 dark:stroke-[#2b2d32]" />
        <line x1={center - radius} y1={center} x2={center + radius} y2={center} className="stroke-zinc-200 dark:stroke-[#2b2d32]" />
        <polygon points={dataPoints} fill="rgba(53,196,95,0.18)" stroke="#35c45f" strokeWidth="2" />
        {labels.map((stage, index) => (
          <text
            key={stage.name}
            x={labelPositions[index].x}
            y={labelPositions[index].y}
            textAnchor={labelPositions[index].anchor}
            dominantBaseline="middle"
            className="fill-zinc-800 text-[12px] font-semibold dark:fill-white"
          >
            {stage.name}
          </text>
        ))}
      </svg>
    </div>
  );
}

function AgentTable({ agents, stages }: { agents: AgentMetric[]; stages: string[] }) {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-[1fr_1.45fr_80px] border-b border-zinc-200 px-2 pb-3 text-sm font-bold dark:border-[#303236]">
        <span>Agent</span>
        <span>Funnelverdeling</span>
        <span className="text-right">Totaal</span>
      </div>
      {agents?.length ? (
        <div className="divide-y divide-zinc-100 dark:divide-[#292b30]">
          {agents.map((agent) => (
            <div key={agent.name} className="grid grid-cols-[1fr_1.45fr_80px] items-center px-2 py-4 text-sm">
              <span>{agent.name}</span>
              <div className="flex flex-wrap gap-2">
                {stages.map((stage) => (
                  <span key={stage} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-[#22252a] dark:text-zinc-300">
                    {stage}: {agent.funnels?.[stage] || 0}
                  </span>
                ))}
              </div>
              <span className="text-right font-semibold">{agent.total}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-[210px] items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">Geen agents gevonden</div>
      )}
    </div>
  );
}

function TrafficGrid({ traffic }: { traffic?: any }) {
  const values = Array.isArray(traffic) ? traffic : [];
  const days = ['Ma', 'Wo', 'Vr'];
  const cells = Array.from({ length: 12 * 7 }, (_, index) => {
    const value = Number(values[index]?.count || 0);
    return Math.min(value, 4);
  });

  return (
    <div className="mt-10 flex h-[300px] flex-col items-center justify-center">
      <div className="grid grid-cols-[42px_auto] items-center gap-x-4">
        <div className="grid h-[220px] grid-rows-3 text-sm text-zinc-500 dark:text-zinc-400">
          {days.map((day) => (
            <span key={day} className="flex items-center justify-end">
              {day}
            </span>
          ))}
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
          {cells.map((intensity, index) => (
            <span key={index} className={`h-8 w-8 rounded-lg ${heatmapClass(intensity)}`} />
          ))}
        </div>
      </div>
      <div className="mt-8 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-300">
        <span>Minder</span>
        {[0, 1, 2, 3, 4].map((intensity) => (
          <span key={intensity} className={`h-4 w-4 rounded-sm ${heatmapClass(intensity)}`} />
        ))}
        <span>Meer</span>
      </div>
    </div>
  );
}

function heatmapClass(intensity: number) {
  const classes = [
    'bg-zinc-100 dark:bg-[#202126]',
    'bg-emerald-50 dark:bg-[#263b2d]',
    'bg-emerald-200 dark:bg-[#2d6a3f]',
    'bg-emerald-400 dark:bg-[#32a852]',
    'bg-[#35c45f] dark:bg-[#35c45f]',
  ];
  return classes[intensity] || classes[0];
}

function normalizeFunnels(metrics: FunnelMetric[] | undefined): FunnelMetric[] {
  const byName = new Map((metrics || []).map((metric) => [metric.name, Number(metric.count ?? metric.value ?? 0)]));
  const names = metrics?.length ? metrics.map((metric) => metric.name) : fallbackStages;
  const orderedNames = Array.from(new Set([...fallbackStages, ...names])).slice(0, 4);
  return orderedNames.map((name) => ({ name, count: byName.get(name) || 0 }));
}
