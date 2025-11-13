
import React, { useState, useEffect, useCallback } from 'react';
import { Tenant } from './types';
import AdminPage from './pages/AdminPage';
import TenantPage from './pages/TenantPage';
import EmbedPage from './pages/EmbedPage';
import { getTenants } from './services/tenantService';

type Route =
  | { view: 'admin' }
  | { view: 'tenant'; id: string }
  | { view: 'embed'; id: string }
  | { view: 'not_found'; path: string };

const App: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route>({ view: 'admin' });
  const [loading, setLoading] = useState(true);

  const refreshTenants = useCallback(async () => {
    setLoading(true);
    try {
      const loadedTenants = await getTenants();
      setTenants(loadedTenants);
    } catch (error) {
      console.error("Failed to load tenants:", error);
      // Handle error state if necessary
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTenants(); // Initial load

    const parseHash = (hash: string): Route => {
      const path = hash.startsWith('#/') ? hash.substring(2) : (hash.startsWith('#') ? hash.substring(1) : '');

      if (path.startsWith('embed/')) {
        const id = path.substring('embed/'.length);
        return { view: 'embed', id };
      }
      if (path && path !== '/') {
        return { view: 'tenant', id: path };
      }
      if (path === '' || path === '/') {
          return { view: 'admin' };
      }
      return { view: 'not_found', path: path };
    };
    
    const handleHashChange = () => {
      setCurrentRoute(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial route check

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []); // refreshTenants is now stable due to useCallback

  const handleNavigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen bg-onzy-dark text-white">
          Loading Application...
        </div>
      );
    }
    
    switch (currentRoute.view) {
      case 'admin':
        return <AdminPage tenants={tenants} onNavigate={handleNavigate} onDataChange={refreshTenants} />;
      
      case 'tenant': {
        const tenant = tenants.find(t => t.id === currentRoute.id);
        return tenant 
          ? <TenantPage tenant={tenant} onNavigate={handleNavigate} /> 
          : <NotFoundPage path={currentRoute.id} onNavigate={handleNavigate} />;
      }

      case 'embed': {
        const tenant = tenants.find(t => t.id === currentRoute.id);
        // Embed page should not show "Not Found", it should just be blank if tenant doesn't exist.
        return tenant ? <EmbedPage tenant={tenant} /> : null;
      }
        
      case 'not_found':
      default:
        return <NotFoundPage path={currentRoute.path} onNavigate={handleNavigate} />;
    }
  };

  return <div className="min-h-screen bg-onzy-dark">{renderContent()}</div>;
};

const NotFoundPage: React.FC<{ path: string, onNavigate: (path: string) => void }> = ({ path, onNavigate }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-onzy-dark text-white text-center p-4">
    <h1 className="text-4xl font-bold text-red-500 mb-4">404 - Not Found</h1>
    <p className="text-lg">O recurso em <span className="font-mono bg-onzy-gray px-2 py-1 rounded">{path}</span> não foi encontrado.</p>
    <button onClick={() => onNavigate('/')} className="mt-6 px-4 py-2 bg-onzy-neon text-black font-semibold rounded-lg hover:opacity-90 transition-opacity">
      Voltar ao Painel Principal
    </button>
  </div>
);


export default App;