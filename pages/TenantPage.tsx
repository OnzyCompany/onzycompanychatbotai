import React, { useState, useMemo } from 'react';
import { Tenant, View } from '../types';
import Chatbot from '../components/Chatbot';
import Dashboard from '../components/Dashboard';

interface TenantPageProps {
    tenant: Tenant;
    onNavigate: (path: string) => void;
}

const TenantPage: React.FC<TenantPageProps> = ({ tenant, onNavigate }) => {
  const [currentView, setCurrentView] = useState<View>(View.CHATBOT);

  const tenantThemeStyle = useMemo(() => {
    return {
      '--tenant-color': tenant.cor,
    } as React.CSSProperties;
  }, [tenant]);

  return (
    <div style={tenantThemeStyle} className="min-h-screen text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: tenant.cor }}>
                <span className="text-black font-bold text-lg">{tenant.nome.charAt(0)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {tenant.nome}
            </h1>
          </div>
          <button onClick={() => onNavigate('/')} className="mt-4 sm:mt-0 px-4 py-2 text-sm bg-onzy-gray border border-gray-600 rounded-md hover:border-gray-400 transition-colors">
            &larr; Voltar ao Painel
          </button>
        </header>
        
        <main className="w-full">
          <div className="flex justify-center mb-6 bg-onzy-gray p-1 rounded-lg w-full sm:w-auto mx-auto">
            <button 
              onClick={() => setCurrentView(View.CHATBOT)}
              className={`px-6 py-2 rounded-md transition-colors duration-300 text-sm sm:text-base font-semibold ${currentView === View.CHATBOT ? 'bg-[var(--tenant-color)] text-black' : 'text-gray-400 hover:bg-gray-700'}`}>
              Onzy Assistant
            </button>
            <button 
              onClick={() => setCurrentView(View.DASHBOARD)}
              className={`px-6 py-2 rounded-md transition-colors duration-300 text-sm sm:text-base font-semibold ${currentView === View.DASHBOARD ? 'bg-[var(--tenant-color)] text-black' : 'text-gray-400 hover:bg-gray-700'}`}>
              Tenant Dashboard
            </button>
          </div>

          <div className="bg-onzy-gray rounded-xl shadow-2xl shadow-black/30 p-4 sm:p-6 min-h-[70vh]">
            <div className={currentView === View.CHATBOT ? '' : 'hidden'}>
              <Chatbot tenant={tenant} />
            </div>
            <div className={currentView === View.DASHBOARD ? '' : 'hidden'}>
              <Dashboard tenant={tenant} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TenantPage;