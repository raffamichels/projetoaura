'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, Crown, User, Settings, LogOut, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Mobile Menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden hover:bg-zinc-800">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-zinc-900 border-zinc-800">
              <VisuallyHidden>
                <SheetTitle>Menu de Navegação</SheetTitle>
              </VisuallyHidden>
              <Sidebar isMobile onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Logo (mobile only) */}
          <h1 className="text-xl font-bold bg-gradient-to-r from-aura-400 to-blue-400 bg-clip-text text-transparent lg:hidden">
            Aura
          </h1>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notificações */}
          <Button variant="ghost" size="icon" className="relative hover:bg-zinc-800">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 hover:bg-zinc-800">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-aura-500 to-blue-500 text-white text-sm">
                    {getInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[150px]">{session?.user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-zinc-900 border-zinc-800 p-0">
              {/* Header do Menu */}
              <div className="p-4 bg-gradient-to-br from-aura-500/10 via-blue-500/10 to-purple-500/10 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-aura-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-aura-500 to-blue-500 text-white text-lg font-bold">
                      {getInitials(session?.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{session?.user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Crown className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                        Plano {session?.user?.plano}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-zinc-800 rounded-lg px-3 py-2.5 flex items-center gap-3 transition-colors"
                  onClick={() => router.push('/dashboard/perfil')}
                >
                  <div className="p-1.5 bg-aura-500/10 rounded-lg">
                    <User className="w-4 h-4 text-aura-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Meu Perfil</p>
                    <p className="text-xs text-gray-500">Ver e editar informações</p>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer hover:bg-zinc-800 rounded-lg px-3 py-2.5 flex items-center gap-3 transition-colors"
                  onClick={() => router.push('/dashboard/settings')}
                >
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <Settings className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Configurações</p>
                    <p className="text-xs text-gray-500">Preferências do sistema</p>
                  </div>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-zinc-800 my-1" />

              {/* Upgrade CTA */}
              {session?.user?.plano === 'FREE' && (
                <>
                  <div className="p-2">
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-gradient-to-r hover:from-yellow-500/20 hover:to-orange-500/20 rounded-lg px-3 py-2.5 flex items-center gap-3 transition-all border border-yellow-500/20"
                    >
                      <div className="p-1.5 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">Fazer Upgrade</p>
                        <p className="text-xs text-gray-500">Desbloquear recursos premium</p>
                      </div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-zinc-800 my-1" />
                </>
              )}

              {/* Logout */}
              <div className="p-2">
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-red-500/10 rounded-lg px-3 py-2.5 flex items-center gap-3 transition-colors group"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  <div className="p-1.5 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                    <LogOut className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-400">Sair</p>
                    <p className="text-xs text-gray-500">Encerrar sessão</p>
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