'use client';

import { useSession, signOut } from 'next-auth/react';
import { Menu, Bell, Crown } from 'lucide-react';
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
} from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

export function Header() {
  const { data: session } = useSession();

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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-zinc-900 border-zinc-800">
              <Sidebar />
            </SheetContent>
          </Sheet>

          {/* Logo (mobile only) */}
          <h1 className="text-xl font-bold bg-gradient-to-r from-aura-400 to-blue-400 bg-clip-text text-transparent lg:hidden">
            Aura
          </h1>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Notificações */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-aura-500 to-blue-500 text-white text-sm">
                    {getInitials(session?.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{session?.user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-gray-400">{session?.user?.email}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Crown className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs font-semibold text-yellow-500">
                      Plano {session?.user?.plano}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem className="cursor-pointer">
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                Fazer Upgrade
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem 
                className="cursor-pointer text-red-400 focus:text-red-400"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}