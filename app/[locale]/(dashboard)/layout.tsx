'use client';

import Link from 'next/link';
import { useState, Suspense, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, MessageCircle, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/[locale]/(login)/actions';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';
import { Sidebar } from '@/components/interface/Sidebar';
import Logo from '@/components/interface/Logo';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { CentralBrainOnboarding } from '@/components/dashboard/CentralBrainOnboarding';
import { WhatsAppWorkspace } from '@/components/automation/WhatsAppWorkspace';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const authT = useTranslations('Auth');
  const sidebarT = useTranslations('Sidebar');
  const pricingT = useTranslations('Pricing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Link
          href="/#pricing"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {pricingT('nav_label')}
        </Link>
        <Button asChild className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/sign-up">{authT('sign_up')}</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9 border border-border">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1 w-48">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/dashboard" className="flex w-full items-center">
            <MessageCircle className="mr-2 h-4 w-4" />
            <span>{sidebarT('dashboard')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/settings" className="flex w-full items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>{sidebarT('settings')}</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{sidebarT('sign_out')}</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
        
        <div className="hidden md:flex items-center space-x-4">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <Suspense fallback={<div className="h-9 w-9 bg-muted rounded-full animate-pulse" />}>
            <UserMenu />
          </Suspense>
        </div>


        <div className="md:hidden flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4">
             <Suspense>
                <UserMenu />
             </Suspense>
          </div>
      )}
    </header>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/' || /^\/[a-z]{2}$/.test(pathname);
  const isVoiceWorkspace = /^\/(?:[a-z]{2}\/)?voice(?:\/|$)/.test(pathname);
  const isWhatsAppWorkspace = /^\/(?:[a-z]{2}\/)?(?:automation|campaigns|contacts|templates|analytics|dashboard|settings|calls)(?:\/|$)/.test(pathname);
  
  const { data: team } = useSWR('/api/team', fetcher);

  useEffect(() => {
    if (team && typeof team === 'object' && 'id' in team && !team.planId) {
      if (!isHomePage && !pathname.startsWith('/pricing')) {
        router.push('/pricing');
      }
    }
  }, [team, pathname, isHomePage, router]);

  if (isHomePage) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1">
            {children}
        </main>
      </div>
    );
  }

  if (isWhatsAppWorkspace && !isVoiceWorkspace) {
    return (
      <WhatsAppWorkspace>
        {children}
        <CentralBrainOnboarding />
      </WhatsAppWorkspace>
    );
  }

  return (
    <div className="flex h-screen bg-muted overflow-hidden">
      {!isVoiceWorkspace && <Sidebar />}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {children}
      </main>
      <CentralBrainOnboarding />
    </div>
  );
}
