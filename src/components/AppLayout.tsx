import { NavLink, useLocation } from 'react-router-dom';
import { Home, FileText, ImageIcon, User as UserIcon, LogOut } from 'lucide-react';
import { authApi, useAuth } from '@/lib/store';
import { Avatar } from '@/components/Avatar';
import type { Tab } from '@/types';

const TABS: { id: Tab; label: string; icon: typeof Home; to: string }[] = [
  { id: 'home', label: 'Home', icon: Home, to: '/' },
  { id: 'documents', label: 'Documents', icon: FileText, to: '/documents' },
  { id: 'pictures', label: 'Pictures', icon: ImageIcon, to: '/pictures' },
  { id: 'profile', label: 'Profile', icon: UserIcon, to: '/profile' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-navy text-white flex-col z-30">
        <div className="px-6 py-6 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Home size={18} />
          </div>
          <span className="font-semibold tracking-tight text-lg">LejersNet</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {TABS.map((t) => {
            const active =
              t.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(t.to);
            return (
              <NavLink
                key={t.id}
                to={t.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <t.icon size={18} />
                {t.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name={user?.name ?? ''} src={user?.avatar} size={36} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => authApi.signOut()}
              className="text-white/60 hover:text-white p-1.5 rounded-lg"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-navy text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <Home size={14} />
            </div>
            <span className="font-semibold">LejersNet</span>
          </div>
          <Avatar name={user?.name ?? ''} src={user?.avatar} size={32} />
        </header>

        <main className="pb-24 lg:pb-8 max-w-3xl mx-auto px-4 sm:px-6 py-4 lg:py-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-border">
        <div className="grid grid-cols-4">
          {TABS.map((t) => {
            const active =
              t.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(t.to);
            return (
              <NavLink
                key={t.id}
                to={t.to}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? 'text-navy' : 'text-ink-muted'
                }`}
              >
                <t.icon size={20} />
                {t.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
