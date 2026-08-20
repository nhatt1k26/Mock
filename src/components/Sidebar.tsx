import { LayoutDashboard, ServerCrash, Activity, Settings, CodeSquare, Network } from 'lucide-react';
import { ViewState } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const navItems: { id: ViewState; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Tổng quan (Dashboard)', icon: LayoutDashboard },
  { id: 'inventory', label: 'Dịch vụ & Mocking', icon: CodeSquare },
  { id: 'chaos', label: 'Chaos & Resilience', icon: ServerCrash },
  { id: 'observability', label: 'Giám sát & Graph', icon: Network },
  { id: 'settings', label: 'Audit Logs', icon: Settings },
];

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
  return (
    <div className="w-56 bg-white h-screen flex flex-col border-r border-slate-200 text-slate-600 shrink-0">
      <div className="h-16 border-b border-slate-200 flex items-center px-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-sm">OM</div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">OMNIMOCK</span>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1 mt-4">
        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3 px-2 mt-2">Navigation</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all relative",
              currentView === item.id 
                ? "bg-indigo-50 text-indigo-700 font-semibold" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            {currentView === item.id && <div className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full"></div>}
            <item.icon className="w-4 h-4 ml-1" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">Current User Context</div>
          <div className="text-sm font-semibold text-indigo-700 truncate mt-1">admin-session-042</div>
        </div>
      </div>
    </div>
  );
}
