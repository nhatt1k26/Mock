import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_SERVICES, MOCK_INTERNAL_ENDPOINTS } from '../data';
import { ServiceEndpoint, InternalEndpoint } from '../types';
import { Search, Code2, Database, Save, Play, Settings2, ChevronDown, Network, Terminal, Activity, ArrowRightLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export function ServiceInventory() {
  const [services, setServices] = useState<ServiceEndpoint[]>(MOCK_SERVICES);
  const [selectedService, setSelectedService] = useState<ServiceEndpoint | null>(null);
  const [activePane, setActivePane] = useState<'empty' | 'service-detail' | 'proxy-logger'>('empty');
  
  // Group selection state
  const consumerGroups = useMemo(() => Array.from(new Set(services.map(s => s.consumerGroup).filter(Boolean))) as string[], [services]);
  const [selectedGroup, setSelectedGroup] = useState<string>(consumerGroups[0] || '');
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [groupSearch, setGroupSearch] = useState('');

  // Internal Endpoint state
  const [selectedInternal, setSelectedInternal] = useState<string>('');
  const [isInternalOpen, setIsInternalOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState('');
  
  const internalEndpoints = useMemo(() => MOCK_INTERNAL_ENDPOINTS.filter(i => i.consumerGroup === selectedGroup), [selectedGroup]);
  const filteredInternal = internalEndpoints.filter(i => i.path.toLowerCase().includes(internalSearch.toLowerCase()));

  // 3rd party search
  const [searchQuery, setSearchQuery] = useState('');

  // Draft changes
  const [draftStatuses, setDraftStatuses] = useState<Record<string, 'mock' | 'real'>>({});

  // Proxy Logger State
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testLogs, setTestLogs] = useState<any[]>([]);

  const filteredGroups = consumerGroups.filter(g => g.toLowerCase().includes(groupSearch.toLowerCase()));

  const filteredServices = services.filter(s => 
    s.consumerGroup === selectedGroup &&
    (!selectedInternal || internalEndpoints.find(i => i.id === selectedInternal)?.dependencies.includes(s.id)) &&
    (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.url.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectGroup = (g: string) => {
    setSelectedGroup(g);
    setIsGroupOpen(false);
    setGroupSearch('');
    setSelectedInternal('');
    setActivePane('empty');
  };

  const handleSelectInternal = (id: string) => {
    setSelectedInternal(id);
    setIsInternalOpen(false);
    setInternalSearch('');
    if (id) {
      setActivePane('proxy-logger');
    }
  };

  const toggleStatus = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const srv = services.find(s => s.id === id);
    if (!srv) return;
    
    const currentStatus = draftStatuses[id] || srv.status;
    const newStatus = currentStatus === 'real' ? 'mock' : 'real';

    if (newStatus === srv.status) {
      const newDrafts = { ...draftStatuses };
      delete newDrafts[id];
      setDraftStatuses(newDrafts);
    } else {
      setDraftStatuses(prev => ({ ...prev, [id]: newStatus }));
    }

    // Auto-open details if mocked
    if (newStatus === 'mock' && selectedService?.id !== id) {
      setSelectedService(srv);
      setActivePane('service-detail');
    }
  };

  const applyChanges = () => {
    setServices(prev => prev.map(s => {
      if (draftStatuses[s.id]) {
        return { ...s, status: draftStatuses[s.id] };
      }
      return s;
    }));
    setDraftStatuses({});
  };

  const hasChanges = Object.keys(draftStatuses).length > 0;

  const updateMockConfig = (id: string, updates: any) => {
     setServices(prev => prev.map(s => {
       if (s.id === id) {
         const newSrv = { ...s, mockConfig: { ...s.mockConfig, ...updates } };
         if (selectedService?.id === id) setSelectedService(newSrv as ServiceEndpoint);
         return newSrv as ServiceEndpoint;
       }
       return s;
     }));
  };

  const runProxyTest = () => {
    setIsRunningTest(true);
    setTestLogs([]);
    setTimeout(() => {
      const endpoint = internalEndpoints.find(e => e.id === selectedInternal);
      if (!endpoint) return;

      const generatedLogs = endpoint.dependencies.map((depId, idx) => {
         const srv = services.find(s => s.id === depId);
         const status = draftStatuses[depId] || srv?.status || 'real';
         return {
            id: `log-${Date.now()}-${idx}`,
            serviceName: srv?.name || depId,
            url: srv?.url || '',
            method: srv?.method || 'GET',
            status: status,
            durationMs: status === 'mock' ? Math.floor(Math.random() * 20) + 10 : 245 + Math.floor(Math.random() * 100),
            reqBody: { traceId: `trc_${Math.random().toString(36).substring(7)}`, data: "sample_payload" },
            resBody: status === 'mock' ? { mocked: true, message: "Intercepted by OmniMock" } : { success: true, ref: "real_target_123" }
         }
      });
      setTestLogs(generatedLogs);
      setIsRunningTest(false);
    }, 800);
  };

  const detailStatus = selectedService ? (draftStatuses[selectedService.id] || selectedService.status) : 'real';
  const selectedInternalData = internalEndpoints.find(i => i.id === selectedInternal);

  return (
    <div className="h-full flex text-slate-800">
      {/* List Sidebar */}
      <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col relative z-10 shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-white">
          <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-2 block">1. Select Core Service</label>
          <div className="relative">
            <button 
              onClick={() => { setIsGroupOpen(!isGroupOpen); setIsInternalOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-slate-300 shadow-sm transition-colors text-left"
            >
              <span className="truncate">{selectedGroup || 'Select a service...'}</span>
              <ChevronDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
            </button>
            {isGroupOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <input
                    type="text"
                    placeholder="Search core service..."
                    value={groupSearch}
                    onChange={e => setGroupSearch(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredGroups.map(g => (
                    <div 
                      key={g} 
                      onClick={() => handleSelectGroup(g)}
                      className={cn(
                        "px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 transition-colors",
                        selectedGroup === g ? "text-indigo-700 font-semibold bg-indigo-50/50" : "text-slate-600"
                      )}
                    >
                      {g}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex justify-between items-center mb-2">
             <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 block">2. Filter by Internal API</label>
             {selectedInternal && (
                <button 
                  onClick={() => setActivePane('proxy-logger')}
                  className="text-[9px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center hover:bg-emerald-100 transition-colors shadow-sm"
                >
                  <Network className="w-3 h-3 mr-1" /> Open Proxy
                </button>
             )}
          </div>
          <div className="relative">
            <button 
              onClick={() => { setIsInternalOpen(!isInternalOpen); setIsGroupOpen(false); }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 border rounded-xl text-sm transition-colors text-left shadow-sm",
                selectedInternal ? "bg-indigo-50 border-indigo-200 text-indigo-800" : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              )}
            >
              <span className="truncate">{selectedInternalData ? `${selectedInternalData.method} ${selectedInternalData.path}` : 'All Endpoints (No Filter)'}</span>
              <ChevronDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
            </button>
            {isInternalOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <input
                    type="text"
                    placeholder="Search internal endpoint..."
                    value={internalSearch}
                    onChange={e => setInternalSearch(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <div 
                    onClick={() => handleSelectInternal('')}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 text-slate-500 border-b border-slate-100"
                  >
                    Clear Filter (Show All)
                  </div>
                  {filteredInternal.map(ie => (
                    <div 
                      key={ie.id} 
                      onClick={() => handleSelectInternal(ie.id)}
                      className={cn(
                        "px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-2",
                        selectedInternal === ie.id ? "text-indigo-700 font-semibold bg-indigo-50/50" : "text-slate-600"
                      )}
                    >
                      <span className={cn(
                        "text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border shadow-sm",
                        ie.method === 'GET' ? "bg-blue-50 text-blue-600 border-blue-200" :
                        ie.method === 'POST' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200"
                      )}>{ie.method}</span>
                      <span className="truncate">{ie.path}</span>
                    </div>
                  ))}
                  {filteredInternal.length === 0 && (
                    <div className="px-3 py-3 text-xs text-slate-500 text-center">No internal endpoints found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-b border-slate-200">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">3. Configure 3rd-Party Targets</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search dependencies..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 shadow-sm transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-24">
          {filteredServices.map(srv => {
            const currentStatus = draftStatuses[srv.id] || srv.status;
            return (
              <button
                key={srv.id}
                onClick={() => { setSelectedService(srv); setActivePane('service-detail'); }}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden shadow-sm",
                  selectedService?.id === srv.id && activePane === 'service-detail'
                    ? "bg-white border-indigo-200 shadow-md" 
                    : "bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300"
                )}
              >
                {selectedService?.id === srv.id && activePane === 'service-detail' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{srv.name}</h3>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono truncate w-36">{srv.url}</p>
                  </div>
                  <div 
                    onClick={(e) => toggleStatus(srv.id, e)} 
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 border",
                      currentStatus === 'mock' ? 'bg-orange-500 border-orange-600' : 'bg-slate-200 border-slate-300'
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                        currentStatus === 'mock' ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <span className={cn(
                    "px-2 py-0.5 text-[9px] font-mono tracking-wider font-bold uppercase rounded-full border shadow-sm",
                    srv.method === 'GET' ? "bg-blue-50 text-blue-600 border-blue-200" :
                    srv.method === 'POST' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                    srv.method === 'PATCH' ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200"
                  )}>
                    {srv.method}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 text-[9px] font-mono tracking-wider font-bold uppercase rounded-full border shadow-sm",
                    currentStatus === 'mock' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  )}>
                    {currentStatus === 'mock' ? 'MOCK MODE' : 'REAL MODE'}
                  </span>
                  {draftStatuses[srv.id] && (
                    <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full border bg-yellow-50 text-yellow-600 border-yellow-200 shadow-sm">
                      DRAFT
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {filteredServices.length === 0 && (
            <div className="text-center text-slate-500 text-xs py-8">
              No 3rd-party dependencies matched.
            </div>
          )}
        </div>

        {hasChanges && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur border-t border-slate-200 shadow-2xl z-20">
            <button 
              onClick={applyChanges}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 transition shadow-lg shadow-indigo-200"
            >
              Apply Configurations ({Object.keys(draftStatuses).length})
            </button>
          </div>
        )}
      </div>

      {/* Detail Pane */}
      <div className="flex-1 bg-slate-50 overflow-y-auto relative">
        {activePane === 'empty' && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
            Select an endpoint or open Proxy Logger to configure
          </div>
        )}

        {/* Proxy Logger Pane */}
        {activePane === 'proxy-logger' && selectedInternalData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-h-full">
            <div className="p-6 border-b border-slate-200 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <Network className="text-indigo-600 w-6 h-6" /> Proxy Logger
                  </h1>
                  <div className="mt-3 flex items-center gap-3">
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-mono tracking-wider font-bold uppercase rounded-full border shadow-sm",
                      selectedInternalData.method === 'GET' ? "bg-blue-50 text-blue-600 border-blue-200" :
                      selectedInternalData.method === 'POST' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-50 text-slate-600 border-slate-200"
                    )}>
                      {selectedInternalData.method}
                    </span>
                    <span className="font-mono text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 shadow-sm">
                      {selectedInternalData.path}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={runProxyTest}
                  disabled={isRunningTest}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isRunningTest ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Trigger Request
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-6">
              {isRunningTest ? (
                <div className="flex items-center justify-center h-48 text-indigo-600 flex-col gap-4">
                  <Activity className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest">Intercepting 3rd-Party Calls...</span>
                </div>
              ) : testLogs.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-2">Intercepted Dependencies Trace</h3>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {testLogs.map((log) => (
                      <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Timeline marker */}
                        <div className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm",
                          log.status === 'mock' ? 'text-orange-500' : 'text-indigo-600'
                        )}>
                          <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        
                        {/* Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-shadow shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-slate-800 text-sm">{log.serviceName}</h4>
                            <span className={cn(
                              "px-2 py-0.5 text-[9px] font-mono tracking-wider font-bold uppercase rounded-full border shadow-sm",
                              log.status === 'mock' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            )}>
                              {log.status === 'mock' ? 'MOCKED' : 'REAL API'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-mono text-slate-500 font-bold">{log.method}</span>
                            <span className="text-[10px] font-mono text-slate-500 truncate">{log.url}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-4">
                             <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 shadow-sm">
                               <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Request Payload</div>
                               <pre className="text-[10px] text-emerald-700 font-mono overflow-hidden text-ellipsis">{JSON.stringify(log.reqBody, null, 2)}</pre>
                             </div>
                             <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 relative shadow-sm">
                               <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold flex justify-between">
                                 Response 
                                 <span className="text-slate-500 font-normal">{log.durationMs}ms</span>
                               </div>
                               <pre className={cn("text-[10px] font-mono overflow-hidden text-ellipsis", log.status === 'mock' ? 'text-orange-700' : 'text-indigo-700')}>{JSON.stringify(log.resBody, null, 2)}</pre>
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400 space-y-4 border border-dashed border-slate-300 rounded-2xl bg-white shadow-sm">
                  <Terminal className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Click "Trigger Request" to simulate a call and capture 3rd-party logs.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 3rd Party Detail Pane */}
        {activePane === 'service-detail' && selectedService && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-h-full">
            <div className="p-6 border-b border-slate-200 flex-shrink-0 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">{selectedService.name}</h1>
                  <p className="text-xs text-slate-500 mt-1">{selectedService.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div 
                    className="flex items-center gap-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors shadow-sm" 
                    onClick={() => toggleStatus(selectedService.id)}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {detailStatus === 'mock' ? 'Mock Engine Active' : 'Real Target Active'}
                    </div>
                    <div 
                      className={cn(
                        "relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 border border-slate-300 shadow-inner",
                        detailStatus === 'mock' ? 'bg-orange-500 border-orange-600' : 'bg-slate-200'
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm border border-slate-100",
                          detailStatus === 'mock' ? 'translate-x-6' : 'translate-x-1'
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 flex items-center p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                <span className={cn(
                    "px-2 py-0.5 text-[10px] font-mono tracking-wider font-bold uppercase rounded-full border mr-3 shadow-sm",
                    selectedService.method === 'GET' ? "bg-blue-50 text-blue-600 border-blue-200" :
                    selectedService.method === 'POST' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                    selectedService.method === 'PATCH' ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-slate-50 text-slate-600 border-slate-200"
                  )}>
                    {selectedService.method}
                  </span>
                  <span className="font-mono text-xs text-slate-600">{selectedService.url}</span>
              </div>
            </div>

            <div className="p-6 flex-1">
              {detailStatus === 'real' ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 mt-12">
                  <Database className="w-12 h-12 opacity-30 text-indigo-600" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Endpoint Routed to Real 3rd-Party</h3>
                  <p className="max-w-md text-center text-[11px] text-slate-500">Các request sẽ được đẩy thẳng sang dịch vụ thật. Bật Mock Mode để can thiệp Response.</p>
                  <button 
                    onClick={() => toggleStatus(selectedService.id)}
                    className="mt-4 px-4 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-100 transition shadow-sm"
                  >
                    ACTIVATE MOCK ENGINE
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center mb-4"><Settings2 className="w-4 h-4 mr-2 text-indigo-600" /> Engine Strategy</h3>
                     
                     <div className="grid grid-cols-3 gap-3">
                        <button 
                          onClick={() => updateMockConfig(selectedService.id, { type: 'static' })}
                          className={cn("p-4 border rounded-2xl text-left transition-all bg-slate-50", selectedService.mockConfig?.type === 'static' ? "border-indigo-200 bg-white shadow-md ring-1 ring-indigo-500" : "border-slate-200 hover:border-slate-300 hover:bg-white")}
                        >
                          <div className="font-semibold text-sm text-slate-800">Static Payload</div>
                          <div className="text-[10px] text-slate-500 mt-1">Trả về file JSON tĩnh.</div>
                        </button>
                        <button 
                           onClick={() => updateMockConfig(selectedService.id, { type: 'scriptable' })}
                          className={cn("p-4 border rounded-2xl text-left transition-all bg-slate-50", selectedService.mockConfig?.type === 'scriptable' ? "border-indigo-200 bg-white shadow-md ring-1 ring-indigo-500" : "border-slate-200 hover:border-slate-300 hover:bg-white")}
                        >
                          <div className="font-semibold text-sm text-slate-800">Dynamic Script</div>
                          <div className="text-[10px] text-slate-500 mt-1">Viết logic JS để kiểm tra Request.</div>
                        </button>
                        <button 
                           onClick={() => updateMockConfig(selectedService.id, { type: 'stateful' })}
                          className={cn("p-4 border rounded-2xl text-left transition-all bg-slate-50", selectedService.mockConfig?.type === 'stateful' ? "border-indigo-200 bg-white shadow-md ring-1 ring-indigo-500" : "border-slate-200 hover:border-slate-300 hover:bg-white")}
                        >
                          <div className="font-semibold text-sm text-slate-800">Stateful Mock</div>
                          <div className="text-[10px] text-slate-500 mt-1">Lưu trạng thái nội bộ.</div>
                        </button>
                     </div>
                  </div>

                  {selectedService.mockConfig?.type === 'scriptable' && (
                    <div className="bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-hidden">
                       <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                         <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center"><Code2 className="w-4 h-4 mr-2 text-emerald-600" /> JavaScript Logic</h3>
                         <div className="flex gap-2">
                           <button className="flex items-center text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm">
                             <Play className="w-3 h-3 mr-1" /> TEST
                           </button>
                           <button className="flex items-center text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 shadow-sm">
                             <Save className="w-3 h-3 mr-1" /> SAVE
                           </button>
                         </div>
                       </div>
                       <div className="relative p-4 font-mono text-[11px] bg-[#f8fafc] flex-1">
                         <textarea 
                           value={selectedService.mockConfig.script || ''}
                           onChange={(e) => updateMockConfig(selectedService.id, { script: e.target.value })}
                           className="w-full h-full min-h-[200px] bg-transparent text-slate-800 focus:outline-none focus:ring-0 leading-relaxed resize-y"
                           spellCheck={false}
                         />
                       </div>
                    </div>
                  )}

                  {selectedService.mockConfig?.type === 'stateful' && (
                     <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Stateful Configuration</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Isolation Routing Header</label>
                            <input 
                              type="text" 
                              className="w-full max-w-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm"
                              value={selectedService.mockConfig.isolationHeader || 'x-mock-session'}
                              onChange={(e) => updateMockConfig(selectedService.id, { isolationHeader: e.target.value })}
                            />
                          </div>
                        </div>
                     </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
