'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import Logo from '@/components/interface/Logo';
import { WorkspaceThemeToggle } from '@/components/workspace/WorkspaceThemeToggle';
import { InviteTeamDialog } from '@/components/automation/InviteTeamDialog';

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
      { href: '/automation', label: 'WhatsApp Agents', icon: Zap },
      { href: '/campaigns', label: 'Campaigns', icon: Send },
      { href: '/dashboard/chat', label: 'Chats', icon: MessageSquare },
      { href: '/contacts', label: 'Contacts', icon: Contact },
      { href: '/calls', label: 'Calls', icon: PhoneCall },
      { href: '/templates', label: 'Templates', icon: Smartphone },
    ],
  },
  {
    title: 'OBSERVE',
    items: [
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
];

export function WhatsAppWorkspace({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

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
  const pathname = usePathname();
  const normalizedPathname = pathname.replace(/^\/[a-z]{2}(?=\/)/, '') || '/';
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const dashboardActive = normalizedPathname === '/dashboard' || normalizedPathname.startsWith('/dashboard/');
  const settingsActive = normalizedPathname === '/settings' || normalizedPathname.startsWith('/settings/');

  return (
    <aside className={`hidden h-dvh min-h-0 shrink-0 flex-col border-r border-zinc-200 bg-[#fbfbfa] text-zinc-700 transition-[width] duration-200 dark:border-[#272d2a] dark:bg-[#0c0e0f] dark:text-zinc-300 lg:flex ${collapsed ? 'w-[72px]' : 'w-[250px]'}`}>
      <div className={`flex h-12 shrink-0 items-center border-b border-zinc-200 px-4 dark:border-[#272d2a] ${collapsed ? 'justify-center' : 'justify-start'}`}>
        <Link href="/automation" className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <Logo className="h-7" />
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
            <span className="block truncate font-semibold text-zinc-950 dark:text-white">WhatsApp Agents</span>
            <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">Build message automations</span>
          </span>
          <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
        </button>
        {switcherOpen && (
          <div className="absolute left-3 right-3 top-[68px] z-30 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/10 dark:border-[#303630] dark:bg-[#151816]">
            <ProductOption href="/automation" icon={MessageSquare} title="WhatsApp Agents" description="Automate inbox, replies, and flows" active />
            <ProductOption href="/voice" icon={Mic} title="Voice Agents" description="Calls, campaigns, recordings" />
            <ProductOption href="/settings/developers" icon={Sparkles} title="Kyrn API" description="Keys, webhooks, integrations" />
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
            {!collapsed && <p className="mb-2 px-2 text-xs font-semibold text-zinc-500 dark:text-zinc-500">{group.title === 'BUILD' ? 'Workspace' : 'Observe'}</p>}
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
            <p className="text-sm font-semibold text-zinc-950 dark:text-white">Invite team members</p>
            <p className="mt-1 text-xs leading-4 text-zinc-500 dark:text-zinc-400">Bring your team into one inbox.</p>
          </button>
        )}
        <Link href="/settings" title="Settings" className={`mb-3 flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition ${collapsed ? 'justify-center' : 'gap-3'} ${settingsActive ? 'bg-[#35c45f] text-white shadow-sm shadow-green-600/20' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-[#1b211d] dark:hover:text-white'}`}>
          <Settings className="h-4 w-4" />
          {!collapsed && 'Settings'}
        </Link>
        <WorkspaceThemeToggle collapsed={collapsed} className="text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-[#1b211d] dark:hover:text-white" />
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
          aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          className={`mt-4 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:border-zinc-300 hover:text-zinc-950 dark:border-[#303630] dark:bg-[#151816] dark:text-zinc-300 dark:hover:text-white ${collapsed ? 'mx-auto' : ''}`}
        >
          <PanelLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <InviteTeamDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </aside>
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
    <Link href={href} className={`flex items-center gap-3 border-b border-zinc-100 px-3 py-3 last:border-b-0 ${active ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-zinc-950">{title}</span>
        <span className="block truncate text-xs text-zinc-500">{description}</span>
      </span>
    </Link>
  );
}
