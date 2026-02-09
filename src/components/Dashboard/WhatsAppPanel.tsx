import { useState, useEffect } from 'react';
import { MessageCircle, Check, X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { WhatsAppConnection } from '../../types/database';

interface WhatsAppPanelProps {
  businessId: string;
}

export function WhatsAppPanel({ businessId }: WhatsAppPanelProps) {
  const [connection, setConnection] = useState<WhatsAppConnection | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: '',
    api_key: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConnection();
  }, [businessId]);

  const loadConnection = async () => {
    const { data } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('business_id', businessId)
      .maybeSingle();

    if (data) {
      setConnection(data);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('whatsapp_connections').insert({
        business_id: businessId,
        phone_number: formData.phone_number,
        api_key: formData.api_key,
        is_active: true,
      });

      if (error) throw error;

      await loadConnection();
      setShowForm(false);
      setFormData({ phone_number: '', api_key: '' });
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;

    try {
      await supabase
        .from('whatsapp_connections')
        .delete()
        .eq('id', connection.id);

      setConnection(null);
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
    }
  };

  if (connection && !showForm) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">WhatsApp Conectado</h3>
                <Check className="w-5 h-5" />
              </div>
              <p className="text-white/90 text-sm">{connection.phone_number}</p>
              <p className="text-white/70 text-xs mt-1">
                La IA está respondiendo automáticamente a tus mensajes
              </p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Desconectar
          </button>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Conectar WhatsApp Business
        </h3>
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de WhatsApp
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1234567890"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={formData.api_key}
              onChange={(e) =>
                setFormData({ ...formData, api_key: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tu API Key de WhatsApp Business"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              Obtén tu API Key desde{' '}
              <a
                href="https://business.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                WhatsApp Business API
              </a>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'Conectando...' : 'Conectar'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Conecta WhatsApp Business
            </h3>
            <p className="text-gray-600 text-sm">
              Permite que la IA responda automáticamente a tus clientes
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Conectar
        </button>
      </div>
    </div>
  );
}
