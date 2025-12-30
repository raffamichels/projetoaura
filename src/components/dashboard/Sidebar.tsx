'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Wallet, 
  BookOpen, 
  Target,
  Dumbbell,
  Plane,
  Settings,
  Crown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Agenda', href: '/dashboard/agenda', badge: 'Em breve' },
  { icon: Wallet, label: 'Financeiro', href: '/dashboard/financeiro', badge: 'Em breve' },
  { icon: BookOpen, label: 'Estudos', href: '/dashboard/estudos', badge: 'Em breve' },
  { icon: Target, label: 'Metas', href: '/dashboard/metas', badge: 'Em breve', premium: true },
  { icon: Dumbbell, label: 'Treinos', href: '/dashboard/treinos', badge: 'Em breve', premium: true },
  { icon: Plane, label: 'Viagens', href: '/dashboard/viagens', badge: 'Em breve', premium: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-aura-400 to-blue-400 bg-clip-text text-transparent">
          Aura
        </h1>
        <p className="text-xs text-gray-500 mt-1">Gerenciamento Pessoal</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                ${isActive 
                  ? 'bg-aura-500/10 text-aura-400 border border-aura-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-zinc-800/50'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 font-medium text-sm">{item.label}</span>
              {item.premium && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
              {item.badge && (
                <Badge variant="secondary" className="text-xs bg-zinc-800 text-gray-400 border-0">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Card */}
      <div className="p-4 border-t border-zinc-800">
        <div className="bg-gradient-to-br from-aura-500/10 to-blue-500/10 border border-aura-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-sm">Plano FREE</h3>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Desbloqueie recursos premium
          </p>
          <button className="w-full bg-gradient-to-r from-aura-500 to-blue-500 hover:from-aura-600 hover:to-blue-600 text-white text-sm font-medium py-2 rounded-lg transition-all">
            Fazer Upgrade
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-zinc-800">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800/50 transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Configurações</span>
        </Link>
      </div>
    </aside>
  );
}