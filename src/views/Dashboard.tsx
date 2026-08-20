import { motion } from 'motion/react';
import { MOCK_SERVICES } from '../data';
import { Activity, Server, Zap, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function Dashboard() {
  const totalServices = MOCK_SERVICES.length;
  const mockedCount = MOCK_SERVICES.filter(s => s.status === 'mock').length;
  const downCount = MOCK_SERVICES.filter(s => s.health === 'down').length;
  const avgLatency = Math.round(MOCK_SERVICES.reduce((acc, s) => acc + s.latency, 0) / totalServices);

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto text-slate-800">
      <header className="mb-4 border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-900">Platform Overview</h1>
        <p className="text-xs text-slate-500 mt-1">Tổng quan trạng thái các dịch vụ 3rd-party và cấu hình Mocking hiện tại.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Dịch Vụ 3rd-Party" 
          value={totalServices.toString()} 
          icon={Server} 
          trend="+2 tuần này" 
          trendUp={true} 
          color="blue"
        />
        <StatCard 
          title="Đang Mock (Giả lập)" 
          value={mockedCount.toString()} 
          icon={Zap} 
          subtitle={`${Math.round((mockedCount / totalServices) * 100)}% tổng hệ thống`}
          color="indigo"
        />
        <StatCard 
          title="Dịch vụ Cảnh báo / Down" 
          value={downCount.toString()} 
          icon={AlertTriangle} 
          color={downCount > 0 ? 'red' : 'green'}
        />
        <StatCard 
          title="Độ trễ trung bình" 
          value={`${avgLatency}ms`} 
          icon={Activity} 
          trend="-15ms so với hôm qua"
          trendUp={false}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Trạng thái API Endpoint</h3>
          <div className="space-y-3">
            {MOCK_SERVICES.map(srv => (
              <div key={srv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                <div>
                  <h4 className="font-semibold text-slate-700 text-sm">{srv.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono truncate w-48 lg:w-64 mt-1">{srv.url}</p>
                </div>
                <div className="flex flex-col items-end">
                  <StatusBadge health={srv.health} />
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">{srv.latency}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
           <div className="w-full max-w-[240px]">
             <div className="aspect-square relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[6px] border-slate-100"></div>
                <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
                   <circle 
                     cx="50" cy="50" r="47" 
                     fill="transparent" 
                     stroke="currentColor" 
                     strokeWidth="6" 
                     strokeDasharray={`${(mockedCount/totalServices) * 295} 295`}
                     className="text-orange-500 drop-shadow-md"
                   />
                </svg>
                <div className="text-center">
                  <span className="text-4xl font-bold text-slate-800">{Math.round((mockedCount/totalServices)*100)}%</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">MOCKED</p>
                </div>
             </div>
           </div>
           <p className="mt-6 text-xs text-slate-500 max-w-sm">
             Hệ thống ưu tiên chạy giả lập để duy trì môi trường độc lập.
           </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, subtitle, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm',
    red: 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm',
    slate: 'bg-slate-50 text-slate-600 border-slate-200 shadow-sm',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-2">{value}</h3>
        </div>
        <div className={`p-2 rounded-xl border ${colorMap[color] || colorMap.slate}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(trend || subtitle) && (
        <div className="mt-4 flex items-center text-[10px] font-mono tracking-wider">
          {trend && (
            <>
              {trendUp ? <ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" /> : <ArrowDownRight className="w-3 h-3 text-emerald-500 mr-1" />}
              <span className="text-emerald-600 font-semibold mr-2">{trend}</span>
            </>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </motion.div>
  );
}

function StatusBadge({ health }: { health: string }) {
  if (health === 'healthy') return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 uppercase font-bold text-emerald-600 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Healthy</span>;
  if (health === 'degraded') return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 uppercase font-bold text-amber-600 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Degraded</span>;
  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 uppercase font-bold text-rose-600 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> Down</span>;
}
