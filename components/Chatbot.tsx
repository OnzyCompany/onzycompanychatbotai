import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Tenant, Message, ChatMode } from '../types';
import { getChatResponse } from '../services/geminiService';

interface ChatbotProps {
  tenant: Tenant;
}

const Chatbot: React.FC<ChatbotProps> = ({ tenant }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInstanceRef = useRef<any>(null); // To hold the chat session instance
  const sessionIdRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Reset chat when tenant changes
    setMessages([
        { id: 'initial-ai-message', text: `Olá! Eu sou o assistente virtual da ${tenant.nome}. Como posso ajudar?`, sender: 'ai' }
    ]);
    setInput('');
    setIsLoading(false);
    chatInstanceRef.current = null;
    sessionIdRef.current = Date.now().toString(); // Create a new session ID for this chat instance
  }, [tenant]);

  const handleSend = useCallback(async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getChatResponse(input, ChatMode.ASSISTANT, tenant, chatInstanceRef, sessionIdRef.current);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'ai',
        sources: response.sources
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      
      let userFriendlyMessage = 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.';
      
      // Check for quota error from Gemini API
      if (error && error.message && (error.message.includes('429') || error.message.toLowerCase().includes('quota'))) {
          userFriendlyMessage = 'O limite de uso da API foi atingido. Por favor, verifique sua cota no Google AI Studio.';
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: userFriendlyMessage,
        sender: 'ai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, tenant]);

  return (
    <div className="flex flex-col h-full animate-slideUp">
      <div className="flex-1 overflow-y-auto p-4 bg-onzy-dark rounded-lg custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${msg.sender === 'user' ? 'bg-[var(--tenant-color)] text-black rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-600">
                    <h4 className="text-xs font-bold mb-1 opacity-80">Sources:</h4>
                    {msg.sources.map((source, i) => (
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" key={i} className="text-xs block truncate text-gray-300 hover:underline">{source.title || source.uri}</a>
                    ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start mb-4">
                <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-gray-700 text-white rounded-bl-none flex items-center gap-2">
                    <div className="w-2 h-2 bg-onzy-neon rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-onzy-neon rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-onzy-neon rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center bg-onzy-dark rounded-xl border border-gray-600 focus-within:ring-2 focus-within:ring-[var(--tenant-color)] transition-shadow">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua mensagem..."
            className="w-full bg-transparent p-4 text-white placeholder-gray-500 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className="m-2 px-4 py-2 rounded-lg bg-[var(--tenant-color)] text-black font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;