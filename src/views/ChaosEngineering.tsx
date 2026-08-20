import { useState } from 'react';
import { motion } from 'motion/react';
import { MOCK_SERVICES } from '../data';
import { AlertOctagon, Timer, ShieldAlert, Zap, Skull, Save } from 'lucide-react';
import { cn } from '../lib/utils';

export function ChaosEngineering() {
  const [services, setServices] = useState(MOCK_SERVICES);

  const updateChaos = (id: string, updates: any) => {
    setServices(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          mockConfig: s.mockConfig ? { ...s.mockConfig, ...updates } : { type: 'static', ...updates }
        };
      }
      return s;
    }));
  };

  return (
    <div className="p-6 h-full overflow-y-auto text-slate-800 bg-slate-50">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-900 flex items-center">
          <Skull className="w-5 h-5 mr-3 text-rose-600" /> Chaos Engineering Control
        </h1>
        <p className="text-xs text-slate-500 mt-2 max-w-2xl">
          Giả lập các tình huống xấu để kiểm tra cơ chế chịu lỗi của ứng dụng.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <Timer className="w-5 h-5 text-orange-500 mb-3" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Latency Injection</h3>
          <p className="text-xs text-slate-600 mt-1">Giả lập độ trễ mạng hoặc 3rd-party xử lý chậm.</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <AlertOctagon className="w-5 h-5 text-rose-500 mb-3" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Error Rate Injection</h3>
          <p className="text-xs text-slate-600 mt-1">Trả về lỗi 500, 502, 503 ngẫu nhiên theo tỷ lệ %.</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-purple-500 mb-3" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Data Mutation</h3>
          <p className="text-xs text-slate-600 mt-1">Tự động làm sai lệch schema để test Validation.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Cấu hình Chaos theo từng Dịch vụ</h2>
          <button className="flex items-center text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-sm">
            <Save className="w-3 h-3 mr-1" /> Lưu cài đặt
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {services.map(srv => (
            <div key={srv.id} className="p-5 flex flex-col xl:flex-row xl:items-center gap-6 hover:bg-slate-50 transition-colors">
              <div className="xl:w-1/4">
                <h3 className="font-semibold text-sm text-slate-800">{srv.name}</h3>
                <p className="text-[10px] font-mono text-slate-500 truncate w-48 mt-1">{srv.url}</p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-xl border bg-slate-50 border-slate-200 text-[9px] uppercase tracking-wider text-slate-600 shadow-sm font-bold">
                  {srv.status === 'mock' ? (
                     <><Zap className="w-3 h-3 text-orange-500 mr-1"/> Đang Mock</>
                  ) : (
                     <><Database className="w-3 h-3 text-indigo-600 mr-1"/> Đang Real</>
                  )}
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Latency Control */}
                <div className="space-y-2">
                  <label className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Độ trễ</span>
                    <span className="text-orange-600 font-bold">{srv.mockConfig?.latencyDelay || 0}ms</span>
                  </label>
                  <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner border border-slate-300">
                     <div className="absolute top-0 left-0 h-full bg-orange-500 shadow-sm" style={{ width: `${Math.min(100, ((srv.mockConfig?.latencyDelay || 0) / 10000) * 100)}%` }}></div>
                     <input 
                      type="range" 
                      min="0" max="10000" step="100"
                      value={srv.mockConfig?.latencyDelay || 0}
                      onChange={(e) => updateChaos(srv.id, { latencyDelay: parseInt(e.target.value) })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={srv.status === 'real'}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 font-bold">
                    <span>0ms</span><span>10000ms</span>
                  </div>
                </div>

                {/* Error Rate Control */}
                <div className="space-y-2">
                  <label className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Tỷ lệ Lỗi 5xx</span>
                    <span className="text-rose-600 font-bold">{srv.mockConfig?.errorRate || 0}%</span>
                  </label>
                  <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner border border-slate-300">
                     <div className="absolute top-0 left-0 h-full bg-rose-500 shadow-sm" style={{ width: `${srv.mockConfig?.errorRate || 0}%` }}></div>
                     <input 
                      type="range" 
                      min="0" max="100" step="5"
                      value={srv.mockConfig?.errorRate || 0}
                      onChange={(e) => updateChaos(srv.id, { errorRate: parseInt(e.target.value) })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={srv.status === 'real'}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-400 font-bold">
                    <span>0%</span><span>100%</span>
                  </div>
                </div>

                {/* Data Mutation Toggle */}
                <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Data Mutation</div>
                    <div className="text-xs font-bold mt-0.5 text-slate-800">
                       {srv.mockConfig?.dataMutation ? <span className="text-purple-600">ACTIVE</span> : 'INACTIVE'}
                    </div>
                  </div>
                  <button 
                    disabled={srv.status === 'real'}
                    onClick={() => updateChaos(srv.id, { dataMutation: !srv.mockConfig?.dataMutation })}
                    className={cn(
                      "w-10 h-6 rounded-full transition-colors relative cursor-pointer border shadow-inner",
                      srv.status === 'real' ? "opacity-50 cursor-not-allowed bg-slate-200 border-slate-300" :
                      srv.mockConfig?.dataMutation ? "bg-purple-500 border-purple-600" : "bg-slate-200 border-slate-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm",
                      srv.mockConfig?.dataMutation ? "transform translate-x-4" : ""
                    )} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Thêm icon giả để thay thế cho lucide-react import
function Database(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>;
}
