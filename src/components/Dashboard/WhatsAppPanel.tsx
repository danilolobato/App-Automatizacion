import { useState, useEffect } from 'react';
import { MessageCircle, Check, X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { WhatsAppConnection } from '../../types/database';

interface WhatsAppPanelProps {
  businessId: string;
}

type ConnectionType = 'normal' | 'business';

export function WhatsAppPanel({ businessId }: WhatsAppPanelProps) {
  const [connections, setConnections] = useState<WhatsAppConnection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<ConnectionType>('business');
  const [formData, setFormData] = useState({
    phone_number: '',
    api_key: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConnections();
  }, [businessId]);

  const loadConnections = async () => {
    const { data } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('business_id', businessId);

    if (data) {
      setConnections(data);
    }
  };

  const getConnectionByType = (type: ConnectionType) => {
    return connections.find((c) => c.connection_type === type);
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
        connection_type: selectedType,
      });

      if (error) throw error;

      await loadConnections();
      setShowForm(false);
      setFormData({ phone_number: '', api_key: '' });
      setSelectedType('business');
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      await supabase
        .from('whatsapp_connections')
        .delete()
        .eq('id', connectionId);

      await loadConnections();
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
    }
  };

  const normalConnection = getConnectionByType('normal');
  const businessConnection = getConnectionByType('business');

  const renderConnectionCard = (
    connection: WhatsAppConnection | undefined,
    type: ConnectionType
  ) => {
    const typeLabel = type === 'normal' ? 'WhatsApp Normal' : 'WhatsApp Business';
    const gradientClass =
      type === 'normal'
        ? 'from-blue-500 to-cyan-600'
        : 'from-green-500 to-emerald-600';

    if (connection) {
      return (
        <div
          className={`bg-gradient-to-r ${gradientClass} rounded-xl p-6 text-white`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold">{typeLabel}</h3>
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-white/90 text-sm">{connection.phone_number}</p>
                <p className="text-white/70 text-xs mt-1">
                  La IA está respondiendo automáticamente
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDisconnect(connection.id)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Desconectar
            </button>
          </div>
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
                Conecta {typeLabel}
              </h3>
              <p className="text-gray-600 text-sm">
                Respuestas automáticas con IA para tus clientes
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedType(type);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Conectar
          </button>
        </div>
      </div>
    );
  };

  if (showForm) {
    const typeLabel =
      selectedType === 'normal' ? 'WhatsApp Normal' : 'WhatsApp Business';
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Conectar {typeLabel}
        </h3>
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de {typeLabel}
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
              API Key o Token
            </label>
            <input
              type="password"
              value={formData.api_key}
              onChange={(e) =>
                setFormData({ ...formData, api_key: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                selectedType === 'business'
                  ? 'Tu API Key de WhatsApp Business'
                  : 'Tu token de acceso'
              }
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              {selectedType === 'business'
                ? 'Obtén tu API Key desde WhatsApp Business API'
                : 'Para propósitos de prueba, puedes usar cualquier clave'}
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
    <div className="space-y-4">
      {renderConnectionCard(businessConnection, 'business')}
      {renderConnectionCard(normalConnection, 'normal')}
    </div>
  );
}
