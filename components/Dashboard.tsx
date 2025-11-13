import React, { useState, useEffect } from 'react';
import { Tenant, Lead } from '../types';
import { sendToWhatsApp } from '../services/whatsappService';
import { db } from '../firebase/config';
// FIX: Changed firebase/firestore to @firebase/firestore for consistency.
import { collection, query, orderBy, onSnapshot } from '@firebase/firestore';

interface DashboardProps {
  tenant: Tenant;
}

const Dashboard: React.FC<DashboardProps> = ({ tenant }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant.docId) return;

    setLoading(true);
    const leadsCollectionRef = collection(db, 'tenants', tenant.docId, 'leads');
    const q = query(leadsCollectionRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // FIX: Correctly type the mapped document data as Lead.
      const tenantLeads = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            ...data,
            docId: doc.id,
        } as Lead;
      });
      setLeads(tenantLeads);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to leads collection:", error);
      setLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [tenant.docId]);
  
  const handleSendToWhatsApp = (lead: Lead) => {
    let message = `Novo Lead de ${tenant.nome}:\n\n`;
    for (const key in lead) {
      if (key !== 'id' && key !== 'timestamp' && key !== 'sessionId' && key !== 'docId') {
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
          message += `${formattedKey}: ${lead[key]}\n`;
      }
    }
    message += `\nRecebido em: ${new Date(lead.timestamp).toLocaleString()}`;
    sendToWhatsApp(tenant.whatsapp, message);
  };
  
  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center text-gray-400">
            <p>Carregando leads...</p>
        </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center text-gray-400 animate-slideUp">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <h2 className="text-xl font-semibold">Nenhuma informação recebida.</h2>
        <p>Os dados coletados pelo Onzy Assistant aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="animate-slideUp">
      <h2 className="text-2xl font-bold mb-6 text-[var(--tenant-color)]">Leads & Informações Coletadas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.map(lead => (
          <div key={lead.docId} className="bg-onzy-dark rounded-lg p-5 border border-gray-700 hover:border-[var(--tenant-color)] transition-all duration-300 shadow-lg flex flex-col">
            <div className="border-b border-gray-600 pb-3 mb-3">
              <h3 className="font-bold text-lg text-white">Lead #{lead.id.substring(0,6)}</h3>
              <p className="text-xs text-gray-400">{new Date(lead.timestamp).toLocaleString()}</p>
            </div>
            <div className="space-y-2 text-sm mb-4 flex-1">
              {Object.entries(lead).map(([key, value]) => {
                if (key !== 'id' && key !== 'timestamp' && key !== 'sessionId' && key !== 'docId') {
                  const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                  return (
                    <div key={key} className="flex justify-between">
                      <span className="font-semibold text-gray-400 truncate pr-2">{formattedKey}: </span>
                      <span className="text-white text-right">{String(value)}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            <button onClick={() => handleSendToWhatsApp(lead)} className="w-full mt-auto bg-[var(--tenant-color)] text-black font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 22.118L2.173 14.42 12.03 12 .057 9.882 2.173 2.185 23.943 12 .057 22.118z"/></svg>
              Enviar para WhatsApp
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;