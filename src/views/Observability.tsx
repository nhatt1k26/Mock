import { motion } from 'motion/react';
import { MOCK_SERVICES } from '../data';
import { Activity, Network, Box, ArrowRight, ShieldCheck, FileJson } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dummyChartData = [
  { time: '10:00', requests: 400, errors: 24, latency: 120 },
  { time: '10:05', requests: 300, errors: 13, latency: 98 },
  { time: '10:10', requests: 550, errors: 45, latency: 180 },
  { time: '10:15', requests: 800, errors: 120, latency: 450 }, // Chaos injected
  { time: '10:20', requests: 450, errors: 15, latency: 130 },
  { time: '10:25', requests: 500, errors: 20, latency: 125 },
];

export function Observability() {
  return (
    <div className="p-6 h-full overflow-y-auto text-slate-800 bg-slate-50">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-900 flex items-center">
          <Network className="w-5 h-5 mr-3 text-indigo-600" /> Observability & Health
        </h1>
        <p className="text-xs text-slate-500 mt-2 max-w-2xl">
          Theo dõi luồng dữ liệu, sức khỏe thực tế của 3rd-party và phát hiện sớm các thay đổi Contract.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Dependency Map */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center">
            <Box className="w-4 h-4 mr-2 text-indigo-600"/> Dependency Graph
          </h3>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 flex-1 p-8 flex flex-col items-center justify-center relative min-h-[300px]">
            {/* Core App */}
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-6 py-2.5 rounded-xl text-[10px] font-mono tracking-widest uppercase font-bold z-10 w-40 text-center relative shadow-sm">
              CORE-APP
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-12 mt-12 z-10 relative w-full">
              {MOCK_SERVICES.map(srv => (
                 <div key={srv.id} className="flex flex-col items-center relative">
                    <svg className="absolute -top-12 left-1/2 w-8 h-12 transform -translate-x-1/2 overflow-visible" fill="none">
                      <path d="M4 0 L4 45" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
                      <polygon points="1,40 7,40 4,45" fill="#cbd5e1" />
                    </svg>

                    <div className={`px-3 py-2 rounded-xl border text-center bg-white shadow-sm w-32 ${srv.status === 'mock' ? 'border-orange-200' : 'border-indigo-200'}`}>
                      <div className="text-[10px] font-mono text-slate-800 font-bold truncate">{srv.name}</div>
                      <div className={`mt-1 text-[9px] uppercase tracking-wider font-bold ${srv.status === 'mock' ? 'text-orange-600' : 'text-indigo-600'}`}>
                        {srv.status === 'mock' ? 'MOCK MODE' : 'REAL MODE'}
                      </div>
                    </div>
                 </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Traffic Graph */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col shadow-sm">
           <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center">
             <Activity className="w-4 h-4 mr-2 text-emerald-600"/> Lưu lượng API (Traffic & Errors)
           </h3>
           <div className="flex-1 min-h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dummyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorErr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontFamily: 'monospace', fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontFamily: 'monospace', fontWeight: 'bold'}} />
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="requests" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorReq)" />
                  <Area type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorErr)" />
                </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Contract Validation */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-indigo-600"/> Contract Validation
            </h3>
            <button className="text-[10px] uppercase tracking-wider font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition shadow-sm">
               Re-scan All
            </button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex justify-between items-center shadow-sm">
               <div className="flex items-center space-x-3">
                 <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                   <FileJson className="w-5 h-5 text-emerald-600" />
                 </div>
                 <div>
                   <h4 className="text-sm font-semibold text-slate-800">Payment Gateway (Stripe)</h4>
                   <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">100% Khớp OpenAPI v3</p>
                 </div>
               </div>
               <div className='flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-[10px] font-bold uppercase tracking-wider shadow-sm'>
                 <div className='w-1.5 h-1.5 rounded-full bg-emerald-500'></div> Passed
               </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex justify-between items-center shadow-sm">
               <div className="flex items-center space-x-3">
                 <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                   <FileJson className="w-5 h-5 text-rose-600" />
                 </div>
                 <div>
                   <h4 className="text-sm font-semibold text-slate-800">User Management (Auth0)</h4>
                   <p className="text-[10px] text-rose-500 font-bold mt-1">Missing field `email_verified`</p>
                 </div>
               </div>
               <div className='flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[10px] font-bold uppercase tracking-wider shadow-sm'>
                 <div className='w-1.5 h-1.5 rounded-full bg-rose-500'></div> Failed
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
