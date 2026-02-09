import { useState, useEffect } from 'react';
import { MessageSquare, User, Bot, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ChatMessage } from '../../types/database';

interface MessagesPanelProps {
  businessId: string;
}

export function MessagesPanel({ businessId }: MessagesPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    loadMessages();
  }, [businessId]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessage.trim()) return;

    const newMessage: Partial<ChatMessage> = {
      business_id: businessId,
      contact_number: '+1234567890',
      contact_name: 'Cliente Demo',
      message: testMessage,
      is_from_customer: true,
      ai_generated: false,
    };

    await supabase.from('chat_messages').insert(newMessage);

    const aiResponse: Partial<ChatMessage> = {
      business_id: businessId,
      contact_number: '+1234567890',
      contact_name: 'AutomaBiz IA',
      message: `Gracias por tu mensaje: "${testMessage}". Como IA, puedo ayudarte con información sobre tu negocio. En producción, conectaría con una API de IA real como OpenAI.`,
      is_from_customer: false,
      ai_generated: true,
    };

    await supabase.from('chat_messages').insert(aiResponse);

    setTestMessage('');
    loadMessages();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <p className="text-gray-600">Cargando mensajes...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8">
        <div className="text-center mb-8">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay mensajes aún
          </h3>
          <p className="text-gray-600 mb-6">
            Los mensajes de WhatsApp aparecerán aquí una vez que conectes tu cuenta
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Prueba el sistema de mensajes:
          </h4>
          <form onSubmit={handleSendTest} className="flex gap-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Escribe un mensaje de prueba..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Conversaciones Recientes
        </h3>
      </div>

      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 ${
              message.is_from_customer ? 'bg-white' : 'bg-blue-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  message.is_from_customer
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {message.is_from_customer ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {message.contact_name || message.contact_number}
                  </span>
                  {message.ai_generated && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      IA
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{message.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSendTest} className="flex gap-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enviar mensaje de prueba..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
