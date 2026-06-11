'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Menu, Crown, User, Settings, LogOut, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { NotificationBell } from '@/components/ui/NotificationBell';

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = useTranslations('header');

  // Sempre usar o valor mais recente da sessão diretamente
  const currentPlano = session?.user?.plano || 'FREE';

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="shrink-0 z-50 bg-[#178E96] text-white shadow-[0_1px_3px_rgba(14,42,63,0.2)]">
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 lg:px-5 h-14">
        {/* Mobile Menu + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Sidebar */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/15 hover:text-white h-9 w-9">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-white border-[#E9E7DC]">
              <VisuallyHidden>
                <SheetTitle>{t('navigationMenu')}</SheetTitle>
              </VisuallyHidden>
              <Sidebar isMobile onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/dashboard" className="hover:opacity-90 transition-opacity duration-150">
            <h1 className="text-xl font-extrabold tracking-tight text-white">Aura</h1>
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notificações */}
          <NotificationBell />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1.5 sm:gap-2 px-1.5 sm:px-2 text-white hover:bg-white/15 hover:text-white h-9">
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8 border border-white/30">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="bg-[#0E2A3F] text-white text-xs sm:text-sm">
                    {getInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold leading-none text-white">{session?.user?.name}</p>
                  <p className="text-xs text-white/70 mt-0.5 truncate max-w-[150px]">{session?.user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-white border-[#E3E1D6] p-0 shadow-lg">
              {/* Header do Menu */}
              <div className="p-4 bg-[#F4F3EC] border-b border-[#E9E7DC]">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-[#178E96]/30">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback className="bg-[#178E96] text-white text-lg font-bold">
                      {getInitials(session?.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0E2A3F] truncate">{session?.user?.name}</p>
                    <p className="text-xs text-[#5E7081] truncate">{session?.user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Crown className={`w-3 h-3 ${currentPlano === 'PREMIUM' ? 'text-[#D9A441]' : 'text-[#8395A5]'}`} />
                      <span className={`text-xs font-semibold ${
                        currentPlano === 'PREMIUM' ? 'text-[#117178]' : 'text-[#5E7081]'
                      }`}>
                        {t('plan')} {currentPlano || 'FREE'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-[#F4F3EC] focus:bg-[#F4F3EC] rounded-lg px-3 py-2.5 flex items-center gap-3 transition-colors duration-150"
                  onClick={() => router.push('/dashboard/perfil')}
                >
                  <div className="p-1.5 bg-[#E5F1F1] rounded-lg">
                    <User className="w-4 h-4 text-[#117178]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0E2A3F]">{t('myProfile')}</p>
                    <p className="text-xs text-[#8395A5]">{t('viewAndEdit')}</p>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer hover:bg-[#F4F3EC] focus:bg-[#F4F3EC] rounded-lg px-3 py-2.5 flex items-center gap-3 transition-colors duration-150"
                  onClick={() => router.push('/dashboard/settings')}
                >
                  <div className="p-1.5 bg-[#EFF4F8] rounded-lg">
                    <Settings className="w-4 h-4 text-[#154F6D]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0E2A3F]">{t('settings')}</p>
                    <p className="text-xs text-[#8395A5]">{t('systemPreferences')}</p>
                  </div>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-[#E9E7DC] my-1" />

              {/* Upgrade CTA */}
              {currentPlano === 'FREE' && (
                <>
                  <div className="p-2">
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-[#E5F1F1] focus:bg-[#E5F1F1] rounded-lg px-3 py-2.5 flex items-center gap-3 transition-colors duration-150 border border-[#178E96]/25"
                      onClick={() => router.push('/premium')}
                    >
                      <div className="p-1.5 bg-[#178E96]/10 rounded-lg">
                        <Sparkles className="w-4 h-4 text-[#117178]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#117178]">{t('upgrade')}</p>
                        <p className="text-xs text-[#8395A5]">{t('unlockPremium')}</p>
                      </div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-[#E9E7DC] my-1" />
                </>
              )}

              {/* Logout */}
              <div className="p-2">
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-red-50 focus:bg-red-50 rounded-lg px-3 py-2.5 flex items-center gap-3 transition-colors duration-150 group"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  <div className="p-1.5 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors duration-150">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-600">{t('logout')}</p>
                    <p className="text-xs text-[#8395A5]">{t('endSession')}</p>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
