import React from 'react';
import { 
  Vote, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  BookOpen, 
  Lock, 
  AlertCircle,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdmin: boolean;
  adminEmail: string | null;
  onOpenAdminAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isAdmin,
  adminEmail,
  onOpenAdminAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Overview', icon: BookOpen },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'vote', label: 'Cast Ballot', icon: Vote, highlight: true },
    { id: 'results', label: 'Live Results', icon: BarChart3 },
    { id: 'methodology', label: 'Methodology & Privacy', icon: ShieldCheck },
    { id: 'admin', label: 'Admin', icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Neutrality Disclaimer Ribbon */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-300">UNOFFICIAL COMMUNITY POLL:</span>
            <span className="hidden sm:inline text-slate-300">
              Not affiliated with the Town of Milton or any election authority. Non-probability public opinion research.
            </span>
            <span className="sm:hidden text-slate-300">Unofficial public-opinion poll.</span>
          </div>
          <div className="flex items-center gap-3 text-xs shrink-0">
            <span className="text-slate-400 hidden md:inline">Milton, Ontario • 2026 Mayoral Race</span>
            <button 
              onClick={() => setCurrentTab('methodology')}
              className="text-slate-300 hover:text-white underline decoration-slate-500 transition-colors"
            >
              Methodology
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
                  Milton Mayoral Poll
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                  2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
                Independent Civic Opinion Gauge
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              if (item.highlight) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className="ml-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.id === 'admin' && isAdmin && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setCurrentTab('vote')}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white shadow-sm"
            >
              <Vote className="w-3.5 h-3.5" />
              <span>Vote</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="text-xs bg-indigo-600 text-white font-semibold px-2 py-0.5 rounded">
                    Action
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
