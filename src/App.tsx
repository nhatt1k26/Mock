/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { ServiceInventory } from './views/ServiceInventory';
import { ChaosEngineering } from './views/ChaosEngineering';
import { Observability } from './views/Observability';
import { SettingsAudit } from './views/SettingsAudit';
import { ViewState } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 h-full relative overflow-hidden bg-white">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'inventory' && <ServiceInventory />}
        {currentView === 'chaos' && <ChaosEngineering />}
        {currentView === 'observability' && <Observability />}
        {currentView === 'settings' && <SettingsAudit />}
      </main>
    </div>
  );
}

