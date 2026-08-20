import { MOCK_AUDIT_LOGS } from '../data';
import { History, Shield, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function SettingsAudit() {
  return (
    <div className="p-6 h-full overflow-y-auto max-w-6xl mx-auto text-slate-800 bg-slate-50">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 flex items-center">
          <History className="w-6 h-6 mr-3 text-slate-500" /> Audit Log & Versioning
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Lịch sử thay đổi cấu hình, kịch bản giả lập trên toàn hệ thống. Hỗ trợ truy vết và phục hồi nhanh.
        </p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
           <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center">
             <Shield className="w-4 h-4 mr-2 text-indigo-600" /> System Audit Trail
           </h2>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs font-mono text-slate-600">
            <thead className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Target</th>
                <th className="px-5 py-3 font-semibold">Details / Rollback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_AUDIT_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <td className="px-5 py-3 whitespace-nowrap text-slate-500 font-bold">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap text-slate-800">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] font-bold mr-2 uppercase shadow-sm">
                        {log.user.charAt(0)}
                      </div>
                      <span className="font-sans text-sm font-semibold">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full border border-slate-200 bg-white shadow-sm text-[9px] uppercase tracking-wider font-bold text-slate-600">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-indigo-600 font-sans text-sm font-semibold">
                    {log.targetName}
                  </td>
                  <td className="px-5 py-3 font-sans">
                    <div className="flex items-center justify-between gap-4">
                      <span className="truncate max-w-[200px] text-slate-500 text-xs font-medium">{log.details}</span>
                      <button className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-700 hover:text-indigo-600 transition-colors bg-indigo-50 border border-indigo-200 px-2 py-1 rounded shadow-sm">
                        [Rollback]
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
