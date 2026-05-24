import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { GitMerge, Trash2, MoreHorizontal, Search, Plus, LayoutTemplate, Bot, Smartphone, CalendarDays } from 'lucide-react';
import { getAutomations, deleteAutomation } from './actions';
import { AutomationStatusToggle } from '@/components/automation/AutomationStatusToggle';
import { SessionsSheet } from '@/components/sessions/SessionsSheet';
import { enforceFeature } from '@/lib/limits';
import { getTeamForUser, getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

export default async function AutomationListPage() {
  const t = await getTranslations('Automation');
  const [team, user] = await Promise.all([getTeamForUser(), getUser()]);
  
  if(!team) redirect('/sign-in');
  
  try {
    await enforceFeature(team.id, 'isFlowBuilderEnabled');
  } catch (e) {
    return redirect('/dashboard');
  }
  
  const automationsList = await getAutomations();
  const ownerEmail = user?.email || team.teamMembers?.[0]?.user?.email || 'Workspace owner';

  return (
    <div className="min-h-full bg-[#f8f8f7] px-6 py-8 text-zinc-950 dark:bg-[#17191b] dark:text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Create, connect, and monitor your WhatsApp automation agents.</p>
        </div>
        <div className="flex items-center gap-2">
          <SessionsSheet type="automation" />
          <Button variant="outline" className="h-9 rounded-lg border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-[#303630] dark:bg-[#111412] dark:text-white dark:hover:bg-[#1d221f]" asChild>
            <Link href="/templates">
              <LayoutTemplate className="mr-2 h-4 w-4" />
              Browse templates
            </Link>
          </Button>
          <Button className="h-9 rounded-lg bg-black px-4 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200" asChild>
            <Link href="/automation/new">
              <Plus className="mr-2 h-4 w-4" />
              New agent
            </Link>
          </Button>
        </div>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          readOnly
          placeholder="Search agents..."
          className="h-11 rounded-xl border-zinc-200 bg-white pl-10 shadow-sm dark:border-[#303630] dark:bg-[#111412]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="h-7 rounded-full bg-white px-3 text-xs dark:border-[#303630] dark:bg-[#111412]">
          <Plus className="mr-1 h-3 w-3" />
          Creator
        </Button>
        <Button variant="outline" size="sm" className="h-7 rounded-full bg-white px-3 text-xs dark:border-[#303630] dark:bg-[#111412]">
          <Plus className="mr-1 h-3 w-3" />
          Archived
        </Button>
      </div>

      {automationsList.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white text-center shadow-sm dark:border-[#303630] dark:bg-[#111412]">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f9ed] text-[#14933a]">
            <GitMerge className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">{t('empty_title')}</h3>
          <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{t('empty_desc')}</p>
          <Button className="mt-6 rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200" asChild>
            <Link href="/automation/new">
              <Plus className="mr-2 h-4 w-4" />
              New agent
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-[#303630] dark:bg-[#111412]">
          <div className="grid grid-cols-[minmax(260px,1.1fr)_minmax(220px,0.9fr)_180px_120px] border-b border-zinc-100 px-4 py-3 text-xs font-medium text-zinc-500 dark:border-[#252b27] dark:text-zinc-400">
            <span>Name</span>
            <span>Created by</span>
            <span>Created at</span>
            <span className="text-right">Actions</span>
          </div>
          {automationsList.map((bot) => (
            <div key={bot.id} className="grid grid-cols-[minmax(260px,1.1fr)_minmax(220px,0.9fr)_180px_120px] items-center border-b border-zinc-100 px-4 py-4 text-sm last:border-b-0 hover:bg-zinc-50/80 dark:border-[#252b27] dark:hover:bg-[#171b18]">
              <Link href={`/automation/${bot.id}`} className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${bot.isActive ? 'bg-[#e8f9ed] text-[#14933a]' : 'bg-zinc-100 text-zinc-500 dark:bg-[#202620] dark:text-zinc-300'}`}>
                    <Bot className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium text-zinc-950 dark:text-white">{bot.name}</span>
                      {bot.isActive && <Badge className="h-5 rounded-full bg-[#e8f9ed] px-2 text-[10px] text-[#14933a] hover:bg-[#e8f9ed]">Live</Badge>}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <Smartphone className="h-3 w-3" />
                      {bot.instance?.instanceName || t('no_instance')}
                    </span>
                  </span>
                </div>
              </Link>
              <span className="truncate text-zinc-700 dark:text-zinc-300">{ownerEmail}</span>
              <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(bot.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <div className="flex items-center justify-end gap-2">
                <AutomationStatusToggle id={bot.id} initialActive={bot.isActive} />
                <form action={deleteAutomation.bind(null, bot.id)}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500" asChild>
                  <Link href={`/automation/${bot.id}`} aria-label={`Open ${bot.name}`}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
