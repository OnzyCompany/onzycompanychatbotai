
import React, { useState } from 'react';
import { Tenant } from '../types';
import { saveTenant, deleteTenant } from '../services/tenantService';

interface AdminPageProps {
  tenants: Tenant[];
  onNavigate: (path: string) => void;
  onDataChange: () => void;
}

const EmbedCodeModal: React.FC<{ tenant: Tenant; onClose: () => void }> = ({ tenant, onClose }) => {
    const embedUrl = `${window.location.origin}${window.location.pathname}#/embed/${tenant.id}`;
    const embedCode = `<iframe
  src="${embedUrl}"
  style="position: fixed; bottom: 20px; right: 20px; border: none; width: 400px; height: 600px; z-index: 9999; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);"
  allow="microphone"
></iframe>`;
  
    const [copied, setCopied] = useState(false);
  
    const handleCopy = () => {
      navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-onzy-gray rounded-lg p-6 w-full max-w-2xl border border-gray-700 animate-slideUp" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-bold mb-4 text-[var(--tenant-color)]" style={{ '--tenant-color': tenant.cor } as React.CSSProperties}>Código de Incorporação para {tenant.nome}</h3>
          <p className="text-sm text-gray-400 mb-4">Copie e cole este código no HTML do site do seu cliente para adicionar o chatbot.</p>
          <textarea
            readOnly
            className="w-full h-40 bg-onzy-dark text-gray-300 p-3 rounded-md font-mono text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--tenant-color)]"
            style={{ '--tenant-color': tenant.cor } as React.CSSProperties}
            value={embedCode}
          />
          <div className="mt-4 flex justify-end gap-4">
            <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-600 rounded-md hover:bg-gray-500 transition-colors">Fechar</button>
            <button onClick={handleCopy} className="px-4 py-2 text-sm bg-[var(--tenant-color)] text-black font-semibold rounded-md hover:opacity-90 transition-opacity" style={{ '--tenant-color': tenant.cor } as React.CSSProperties}>
              {copied ? 'Copiado!' : 'Copiar Código'}
            </button>
          </div>
        </div>
      </div>
    );
};

const TenantFormModal: React.FC<{ tenant: Partial<Tenant> | null; onClose: () => void; onSave: () => void }> = ({ tenant, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Tenant>>(tenant || { cor: '#00ffbb' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveTenant(formData);
        onSave();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-onzy-gray rounded-lg p-6 w-full max-w-2xl border border-gray-700 animate-slideUp" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4" style={{ color: formData.cor }}>{formData.docId ? 'Editar Tenant' : 'Criar Novo Tenant'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="nome" value={formData.nome || ''} onChange={handleChange} placeholder="Nome do Tenant" className="w-full bg-onzy-dark p-2 rounded border border-gray-600 text-white" required />
                    <input name="id" value={formData.id || ''} onChange={handleChange} placeholder="ID do Tenant (ex: minha_empresa)" className="w-full bg-onzy-dark p-2 rounded border border-gray-600 text-white" disabled={!!tenant?.id} required />
                    <div className="flex items-center gap-4">
                        <input name="cor" type="color" value={formData.cor || '#00ffbb'} onChange={handleChange} className="p-1 h-10 w-10 block bg-onzy-dark border border-gray-600 cursor-pointer rounded" />
                        <input value={formData.cor || ''} onChange={handleChange} className="w-full bg-onzy-dark p-2 rounded border border-gray-600 text-white" />
                    </div>
                    <input name="whatsapp" value={formData.whatsapp || ''} onChange={handleChange} placeholder="Número do WhatsApp (ex: 5511999998888)" className="w-full bg-onzy-dark p-2 rounded border border-gray-600 text-white" required />
                    <textarea name="prompt" value={formData.prompt || ''} onChange={handleChange} placeholder="Prompt de Sistema para a IA" className="w-full bg-onzy-dark p-2 rounded border border-gray-600 h-24 text-white" required />
                    <textarea name="campos_coleta" value={Array.isArray(formData.campos_coleta) ? formData.campos_coleta.join(', ') : ''} onChange={(e) => setFormData(prev => ({...prev, campos_coleta: e.target.value.split(',').map(s => s.trim())}))} placeholder="Campos para Coleta (separados por vírgula)" className="w-full bg-onzy-dark p-2 rounded border border-gray-600 h-32 text-white" required />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-black font-semibold rounded" style={{ backgroundColor: formData.cor }}>Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminPage: React.FC<AdminPageProps> = ({ tenants, onNavigate, onDataChange }) => {
    const [modalEmbedTenant, setModalEmbedTenant] = useState<Tenant | null>(null);
    const [modalFormTenant, setModalFormTenant] = useState<Partial<Tenant> | null>(null);

    const handleDelete = (tenantDocId: string) => {
      if (window.confirm("Tem certeza que deseja excluir este tenant? Esta ação não pode ser desfeita e removerá todos os leads associados.")) {
        deleteTenant(tenantDocId).then(() => {
          onDataChange();
        });
      }
    }

  return (
    <>
      <div className="min-h-screen bg-onzy-dark text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
        <div className="w-full max-w-6xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 pb-4 border-b border-gray-700">
            <div className="flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-onzy-neon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm4.24-9.76l-1.41 1.41C13.36 9.12 13 9.77 13 10.5V12h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.41-1.41c.39-.39 1.02-.39 1.41 0 .38.39.38 1.03 0 1.42z"/></svg>
                <h1 className="text-2xl sm:text-3xl font-bold">
                <span className="text-onzy-neon">Onzy</span> Admin Panel
                </h1>
            </div>
            <button onClick={() => setModalFormTenant({})} className="px-4 py-2 bg-onzy-neon text-black font-semibold rounded-lg hover:opacity-90 transition-opacity">
                + Criar Novo Tenant
            </button>
          </header>
          
          <main>
            <h2 className="text-xl sm:text-2xl font-semibold mb-6">Gerenciamento de Tenants</h2>
            
            {tenants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenants.map(tenant => (
                  <div key={tenant.docId} className="bg-onzy-gray rounded-lg border border-gray-700 hover:border-[var(--tenant-color)] hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 group flex flex-col" style={{ '--tenant-color': tenant.cor } as React.CSSProperties}>
                    <div onClick={() => onNavigate(`/${tenant.id}`)} className="cursor-pointer flex-1 p-6">
                      <h3 className="text-xl font-bold text-white group-hover:text-[var(--tenant-color)] transition-colors">{tenant.nome}</h3>
                      <p className="text-sm text-gray-400 mt-1">ID: {tenant.id}</p>
                    </div>
                     <div className="mt-4 p-4 border-t border-gray-700 flex justify-between items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setModalEmbedTenant(tenant); }} className="text-center text-sm font-semibold text-gray-300 hover:text-[var(--tenant-color)] transition-opacity">
                           Código
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setModalFormTenant(tenant); }} className="text-center text-sm font-semibold text-gray-300 hover:text-[var(--tenant-color)] transition-opacity">
                           Editar
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); tenant.docId && handleDelete(tenant.docId); }} className="text-center text-sm font-semibold text-gray-300 hover:text-red-500 transition-opacity">
                           Excluir
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="text-center py-16 text-gray-500">
                  <h3 className="text-xl font-semibold">Nenhum tenant encontrado.</h3>
                  <p className="mt-2">Clique em "Criar Novo Tenant" para começar.</p>
               </div>
            )}
          </main>
        </div>
      </div>
      {modalEmbedTenant && <EmbedCodeModal tenant={modalEmbedTenant} onClose={() => setModalEmbedTenant(null)} />}
      {modalFormTenant && <TenantFormModal tenant={modalFormTenant} onClose={() => setModalFormTenant(null)} onSave={onDataChange} />}
    </>
  );
};

export default AdminPage;