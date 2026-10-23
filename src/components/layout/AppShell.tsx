import React, { Suspense, useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { Button, OfflineBanner, Skeleton } from '../ui/primitives';

const ChangePasswordModal = React.lazy(() =>
  import('../../pages/auth/ChangePasswordModal').then((m) => ({
    default: m.ChangePasswordModal,
  }))
);

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <Skeleton lines={4} className="h-12 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const AppShell: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, language, setLanguage, isOffline } = usePreferences();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard'), shortCode: '01' },
    { to: '/profile', label: t('nav.profile'), shortCode: '02' },
    { to: '/assessment', label: t('nav.assessment'), shortCode: '03' },
    { to: '/careers', label: t('nav.careers'), shortCode: '04' },
    { to: '/skills', label: t('nav.skills'), shortCode: '05' },
    { to: '/roadmap', label: t('nav.roadmap'), shortCode: '06' },
    { to: '/portfolio', label: t('nav.portfolio'), shortCode: '07' },
    { to: '/design', label: t('nav.design'), shortCode: 'DS' },
  ];

  const mobileBottomItems = [
    { to: '/dashboard', label: t('nav.dashboard') },
    { to: '/profile', label: t('nav.profile') },
    { to: '/assessment', label: t('nav.assessment') },
    { to: '/careers', label: t('nav.careers') },
    { to: '/design', label: t('nav.design') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-fg pb-16 md:pb-0">
      <OfflineBanner isOffline={isOffline} />

      {/* Top Wayfinding Bar */}
      <header className="border-b border-border bg-surface sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-[60px] py-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs font-bold px-2 py-1 rounded-sm bg-primary text-primary-fg">
              CN
            </span>
            <span className="font-display font-bold text-base tracking-tight text-fg whitespace-nowrap">
              {t('app.brand')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              aria-label={t('nav.language')}
              className="px-3 py-2 min-h-[44px] text-xs font-medium rounded-md border border-border bg-surface text-fg hover:bg-surface-muted whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {language === 'en' ? 'हिन्दी' : 'English'}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-2 min-h-[44px] text-xs font-medium rounded-md border border-border bg-surface text-fg hover:bg-surface-muted whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {theme === 'light' ? t('nav.themeDark') : t('nav.themeLight')}
            </button>
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="hidden sm:inline-flex items-center px-3 py-2 min-h-[44px] text-xs font-medium rounded-md border border-border bg-surface text-fg hover:bg-surface-muted whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {t('nav.changePassword')}
                </button>
                <Button variant="secondary" size="sm" onClick={() => logout()}>
                  {t('nav.logout')}
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {/* Body Layout: Sidebar on Desktop (md+), Single Column on Mobile */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <aside
          aria-label="Desktop sidebar navigation"
          className="hidden md:flex md:w-64 md:shrink-0 md:flex-col border-r border-border bg-surface p-4"
        >
          <nav aria-label="Primary" className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? 'bg-primary text-primary-fg font-semibold'
                      : 'text-fg-muted hover:text-fg hover:bg-surface-muted'
                  }`
                }
              >
                <span className="font-mono text-xs tabular-nums">{item.shortCode}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 sm:py-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar (<768px) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border grid grid-cols-5"
      >
        {mobileBottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-center px-1 py-2 min-h-[48px] text-center text-xs font-medium truncate transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? 'border-t-2 border-primary text-primary font-semibold bg-surface-muted/40'
                  : 'text-fg-muted hover:text-fg'
              }`
            }
          >
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {isPasswordModalOpen ? (
        <Suspense fallback={null}>
          <ChangePasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
          />
        </Suspense>
      ) : null}
    </div>
  );
};
