'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname as useNextPathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  BarChart3,
  ChevronDown,
  Contact,
  Home,
  MessageSquare,
  Mic,
  PanelLeft,
  PhoneCall,
  Send,
  Settings,
  Smartphone,
  Sparkles,
  Zap,
  Globe,
} from 'lucide-react';
import Logo from '@/components/interface/Logo';
import { WorkspaceThemeToggle } from '@/components/workspace/WorkspaceThemeToggle';
import { InviteTeamDialog } from '@/components/automation/InviteTeamDialog';
import { usePathname as useLocalizedPathname, useRouter } from '@/i18n/routing';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const navGroups: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'BUILD',
    items: [
      { href: '/automation', label: 'WhatsApp-agents', icon: Zap },
      { href: '/campaigns', label: 'Campagnes', icon: Send },
      { href: '/dashboard/chat', label: 'Chats', icon: MessageSquare },
      { href: '/contacts', label: 'Contacten', icon: Contact },
      { href: '/calls', label: 'Gesprekken', icon: PhoneCall },
      { href: '/templates', label: 'Sjablonen', icon: Smartphone },
    ],
  },
  {
    title: 'OBSERVE',
    items: [
      { href: '/analytics', label: 'Analyse', icon: BarChart3 },
    ],
  },
];

export function WhatsAppWorkspace({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="flex h-dvh min-h-0 flex-1 overflow-hidden bg-[#f8f8f7] text-zinc-950 dark:bg-[#111314] dark:text-white">
      <WhatsAppSidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <main className="min-w-0 flex-1 overflow-auto border-l border-zinc-200 bg-[#f8f8f7] text-zinc-950 dark:border-[#272d2a] dark:bg-[#17191b] dark:text-white">
        {children}
      </main>
    </div>
  );
}

function WhatsAppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = useNextPathname();
  const normalizedPathname = pathname.replace(/^\/[a-z]{2}(?=\/)/, '') || '/';
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const dashboardActive = normalizedPathname === '/dashboard' || normalizedPathname.startsWith('/dashboard/');
  const settingsActive = normalizedPathname === '/settings' || normalizedPathname.startsWith('/settings/');

  return (
    <aside className={`hidden h-dvh min-h-0 shrink-0 flex-col border-r border-zinc-200 bg-[#fbfbfa] text-zinc-700 transition-[width] duration-200 dark:border-[#272d2a] dark:bg-[#0c0e0f] dark:text-zinc-300 lg:flex ${collapsed ? 'w-[56px]' : 'w-[232px]'}`}>
      <div className={`flex h-12 shrink-0 items-center border-b border-zinc-200 dark:border-[#272d2a] ${collapsed ? 'justify-center px-2' : 'justify-start px-4'}`}>
        <Link href="/automation" className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          {collapsed ? (
            <img src="/images/icon.png" alt="Kyrn" className="h-7 w-7 object-contain" />
          ) : (
            <Logo className="h-7" />
          )}
          {!collapsed && <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">WhatsApp v1</span>}
        </Link>
      </div>

      {!collapsed && <div className="relative shrink-0 border-b border-zinc-200 p-3 dark:border-[#272d2a]">
        <button
          type="button"
          onClick={() => setSwitcherOpen((value) => !value)}
          className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left text-sm shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-[#303630] dark:bg-[#171b18] dark:hover:bg-[#202620]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f9ed] text-[#14933a]">
            <MessageSquare className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-zinc-950 dark:text-white">WhatsApp-agents</span>
            <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">Bouw berichtautomatisering</span>
          </span>
          <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
        </button>
        {switcherOpen && (
          <div className="absolute left-3 right-3 top-[68px] z-30 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/10 dark:border-[#303630] dark:bg-[#151816]">
            <ProductOption href="/automation" icon={MessageSquare} title="WhatsApp-agents" description="Automatiseer inbox, antwoorden en flows" active />
            <ProductOption href="/voice" icon={Mic} title="Spraakagents" description="Gesprekken, campagnes en opnames" />
            <ProductOption href="/settings/developers" icon={Sparkles} title="Kyrn API" description="Sleutels, webhooks en integraties" />
          </div>
        )}
      </div>}

      <nav className={`min-h-0 flex-1 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${collapsed ? 'p-2 pt-3' : 'p-3'}`}>
        <Link href="/dashboard">
          <span
            title="Dashboard"
            className={`mb-7 flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition ${collapsed ? 'justify-center' : 'gap-3'} ${dashboardActive ? 'bg-[#35c45f] text-white shadow-sm shadow-green-600/20' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-[#1b211d] dark:hover:text-white'}`}
          >
            <Home className="h-4 w-4" />
            {!collapsed && 'Dashboard'}
          </span>
        </Link>

        {navGroups.map((group) => (
          <div key={group.title} className="mb-7">
            {!collapsed && <p className="mb-2 px-2 text-xs font-semibold text-zinc-500 dark:text-zinc-500">{group.title === 'BUILD' ? 'Werkruimte' : 'Monitoren'}</p>}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.exact
                  ? normalizedPathname === item.href
                  : normalizedPathname === item.href || normalizedPathname.startsWith(`${item.href}/`);
                return (
                  <Link key={item.href} href={item.href}>
                    <span title={item.label} className={`group flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition ${collapsed ? 'justify-center' : 'gap-3'} ${active ? 'bg-[#35c45f] text-white shadow-sm shadow-green-600/20' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-[#1b211d] dark:hover:text-white'}`}>
                      <Icon className="h-4 w-4" />
                      {!collapsed && item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={`shrink-0 border-t border-zinc-200 dark:border-[#272d2a] ${collapsed ? 'p-2' : 'p-3'}`}>
        {!collapsed && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="mb-3 w-full rounded-xl border border-zinc-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-[#303630] dark:bg-[#151816] dark:hover:border-[#3b443d]"
          >
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-[#202620] dark:text-zinc-300">
              <Send className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold text-zinc-950 dark:text-white">Teamleden uitnodigen</p>
            <p className="mt-1 text-xs leading-4 text-zinc-500 dark:text-zinc-400">Breng je team samen in één inbox.</p>
          </button>
        )}
        <Link href="/settings" title="Instellingen" className={`mb-3 flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition ${collapsed ? 'justify-center' : 'gap-3'} ${settingsActive ? 'bg-[#35c45f] text-white shadow-sm shadow-green-600/20' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-[#1b211d] dark:hover:text-white'}`}>
          <Settings className="h-4 w-4" />
          {!collapsed && 'Instellingen'}
        </Link>
        <div className={`mt-4 flex gap-2 ${collapsed ? 'flex-col items-center' : 'items-center'}`}>
          <CompactLanguageSelector />
          <WorkspaceThemeToggle
            collapsed
            iconOnly
            className="border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 dark:border-[#303630] dark:bg-[#151816] dark:text-zinc-300 dark:hover:bg-[#202620] dark:hover:text-white"
          />
          <button
            type="button"
            onClick={onToggle}
            title={collapsed ? 'Menu uitklappen' : 'Menu inklappen'}
            aria-label={collapsed ? 'Menu uitklappen' : 'Menu inklappen'}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 dark:border-[#303630] dark:bg-[#151816] dark:text-zinc-300 dark:hover:bg-[#202620] dark:hover:text-white"
          >
            <PanelLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      <InviteTeamDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </aside>
  );
}

function CompactLanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = useLocalizedPathname();
  const [isPending, startTransition] = useTransition();

  function onSelectChange(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <Select value={locale} onValueChange={onSelectChange} disabled={isPending}>
      <SelectTrigger
        title="Taal"
        aria-label="Taal"
        className="!h-10 !w-10 justify-center rounded-full border-zinc-200 bg-white p-0 text-zinc-500 shadow-sm hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950 focus-visible:ring-[#35c45f]/25 dark:border-[#303630] dark:bg-[#151816] dark:text-zinc-300 dark:hover:bg-[#202620] dark:hover:text-white [&>svg:last-child]:hidden"
      >
        <Globe className="h-4 w-4" />
        <span className="sr-only">
          <SelectValue placeholder="Taal" />
        </span>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="en">Engels</SelectItem>
        <SelectItem value="pt">Portugees</SelectItem>
        <SelectItem value="es">Español</SelectItem>
        <SelectItem value="nl">Nederlands</SelectItem>
      </SelectContent>
    </Select>
  );
}

function ProductOption({
  href,
  icon: Icon,
  title,
  description,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 border-b border-zinc-100 px-3 py-3 transition last:border-b-0 dark:border-[#272d2a] ${
        active
          ? 'bg-[#0000170b] dark:bg-[#1b211d]'
          : 'hover:bg-[#0000170b] dark:hover:bg-[#1b211d]'
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white dark:border-[#303630] dark:bg-[#202620] ${
          active ? 'text-[#14933a] dark:text-[#35c45f]' : 'text-zinc-500 dark:text-zinc-300'
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-zinc-950 dark:text-white">{title}</span>
        <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{description}</span>
      </span>
    </Link>
  );
}
