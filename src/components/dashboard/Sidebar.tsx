'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SquaresFour, Calendar, Wallet, BookOpen, Books, Gear, Crown, CaretLeft, CaretRight, Heart } from '@phosphor-icons/react';
import { useState } from 'react';
import { usePlano } from '@/hooks/usePlano';

interface SidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ isMobile = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const t = useTranslations('sidebar');
  const { ehFree } = usePlano();

  const menuItems = [
    { icon: SquaresFour, label: t('dashboard'), href: '/dashboard' },
    { icon: Heart, label: t('habits'), href: '/dashboard/habitos' },
    { icon: Calendar, label: t('agenda'), href: '/dashboard/agenda'},
    { icon: Wallet, label: t('financial'), href: '/dashboard/financeiro' },
    { icon: BookOpen, label: t('studies'), href: '/dashboard/estudos' },
    { icon: Books, label: t('library'), href: '/dashboard/biblioteca' },
  ];

  return (
    <aside className={`${isMobile ? 'flex w-full h-full' : 'hidden lg:flex'} flex-col bg-surface border-r border-line transition-all duration-150 ${isMobile ? '' : isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Branding (mobile) / Collapse toggle (desktop) */}
      {isMobile ? (
        <div className="flex items-center px-6 py-5 border-b border-line">
          <Link href="/dashboard" onClick={onNavigate}>
            <h1 className="text-xl font-extrabold text-brand">Aura</h1>
            <p className="text-xs text-ink-faint">{t('personalManagement')}</p>
          </Link>
        </div>
      ) : (
        <div className={`flex items-center py-2 ${isCollapsed ? 'justify-center' : 'justify-end pr-3'}`}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-ink-faint hover:text-ink hover:bg-surface-hover transition-colors duration-150 p-1.5 rounded-md"
            aria-label={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          >
            {isCollapsed ? <CaretRight className="w-5 h-5" /> : <CaretLeft className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 relative
                ${isActive
                  ? 'bg-brand-soft text-brand-dark font-semibold'
                  : 'text-ink-soft hover:text-ink hover:bg-surface-hover'
                }
                ${isCollapsed && !isMobile ? 'justify-center' : ''}
              `}
              title={isCollapsed && !isMobile ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={isActive ? 2.4 : 2} />
              {(!isCollapsed || isMobile) && (
                <span className="flex-1 text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade Card - Only show for free plan */}
      {ehFree && (!isCollapsed || isMobile) && (
        <div className="p-4 border-t border-line">
          <div className="bg-navy rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-gold" />
              <h3 className="font-semibold text-sm text-white">{t('freePlan')}</h3>
            </div>
            <p className="text-xs text-white/70 mb-3">
              {t('unlockPremiumFeatures')}
            </p>
            <button
              onClick={() => router.push('/premium')}
              className="w-full bg-brand hover:bg-brand-dark text-white text-sm font-semibold py-2 rounded-lg transition-colors duration-150">
              {t('upgrade')}
            </button>
          </div>
        </div>
      )}

      {ehFree && isCollapsed && !isMobile && (
        <div className="p-4 border-t border-line flex justify-center">
          <button
            onClick={() => router.push('/premium')}
            className="bg-navy hover:bg-brand-blue text-gold p-2 rounded-lg transition-colors duration-150"
            title={t('upgrade')}>
            <Crown className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Settings */}
      <div className={`border-t border-line ${isCollapsed && !isMobile ? 'p-2 flex justify-center' : 'px-3 py-2'}`}>
        <Link
          href="/dashboard/settings"
          onClick={onNavigate}
          className={`flex items-center rounded-lg transition-colors duration-150 ${
            pathname === '/dashboard/settings'
              ? 'bg-brand-soft text-brand-dark font-semibold'
              : 'text-ink-soft hover:text-ink hover:bg-surface-hover'
          } ${isCollapsed && !isMobile ? 'justify-center p-2.5' : 'w-full gap-3 px-3 py-2.5'}`}
          title={isCollapsed && !isMobile ? t('settings') : ''}
        >
          <Gear className="w-5 h-5 shrink-0" />
          {(!isCollapsed || isMobile) && (
            <span className="text-sm">{t('settings')}</span>
          )}
        </Link>
      </div>
    </aside>
  );
}
