import { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Power, PowerOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AutomationRule } from '../../types/database';

interface AutomationPanelProps {
  businessId: string;
}

export function AutomationPanel({ businessId }: AutomationPanelProps) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rule_name: '',
    trigger_type: 'new_message',
    trigger_value: '',
    action_type: 'ai_response',
  });

  useEffect(() => {
    loadRules();
  }, [businessId]);

  const loadRules = async () => {
    const { data } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (data) {
      setRules(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await supabase.from('automation_rules').insert({
      business_id: businessId,
      ...formData,
      action_config: {},
    });

    setFormData({
      rule_name: '',
      trigger_type: 'new_message',
      trigger_value: '',
      action_type: 'ai_response',
    });
    setShowForm(false);
    loadRules();
  };

  const toggleRule = async (ruleId: string, currentStatus: boolean) => {
    await supabase
      .from('automation_rules')
      .update({ is_active: !currentStatus })
      .eq('id', ruleId);

    loadRules();
  };

  const deleteRule = async (ruleId: string) => {
    await supabase.from('automation_rules').delete().eq('id', ruleId);
    loadRules();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Reglas de Automatización
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Define cómo la IA debe responder a diferentes situaciones
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Regla
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Crear Regla de Automatización
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Regla
              </label>
              <input
                type="text"
                value={formData.rule_name}
                onChange={(e) =>
                  setFormData({ ...formData, rule_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Respuesta automática a consultas de precio"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Trigger
                </label>
                <select
                  value={formData.trigger_type}
                  onChange={(e) =>
                    setFormData({ ...formData, trigger_type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="new_message">Nuevo Mensaje</option>
                  <option value="keyword">Palabra Clave</option>
                  <option value="time_based">Basado en Tiempo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor del Trigger
                </label>
                <input
                  type="text"
                  value={formData.trigger_value}
                  onChange={(e) =>
                    setFormData({ ...formData, trigger_value: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: precio, horario, etc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Acción
              </label>
              <select
                value={formData.action_type}
                onChange={(e) =>
                  setFormData({ ...formData, action_type: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ai_response">Respuesta con IA</option>
                <option value="template">Respuesta con Plantilla</option>
                <option value="forward">Reenviar a Humano</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Crear Regla
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
      )}

      <div className="grid gap-4">
        {rules.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No hay reglas de automatización
            </h4>
            <p className="text-gray-600">
              Crea tu primera regla para comenzar a automatizar
            </p>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {rule.rule_name}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {rule.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Trigger:</span>{' '}
                      {rule.trigger_type}
                      {rule.trigger_value && ` - ${rule.trigger_value}`}
                    </p>
                    <p>
                      <span className="font-medium">Acción:</span>{' '}
                      {rule.action_type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRule(rule.id, rule.is_active)}
                    className={`p-2 rounded-lg transition ${
                      rule.is_active
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {rule.is_active ? (
                      <Power className="w-5 h-5" />
                    ) : (
                      <PowerOff className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
