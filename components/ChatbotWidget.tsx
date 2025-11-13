import React, { useState } from 'react';
import { Tenant } from '../types';
import Chatbot from './Chatbot';

interface ChatbotWidgetProps {
  tenant: Tenant;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ tenant }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[370px] h-[550px] bg-onzy-gray rounded-xl shadow-2xl flex flex-col border border-gray-700 animate-slideUp">
          <header className="flex items-center justify-between p-4 bg-onzy-dark rounded-t-xl border-b border-gray-600">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: tenant.cor }}>
                    <span className="text-black font-bold text-sm">{tenant.nome.charAt(0)}</span>
                </div>
                <h2 className="font-semibold text-white">{tenant.nome} Assistant</h2>
             </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </header>
          <div className="flex-1 p-4 overflow-hidden">
            <div className="h-full">
                <Chatbot tenant={tenant} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform"
          style={{ backgroundColor: tenant.cor }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;