import { useState } from 'react';
import {
  LogOut,
  MessageSquare,
  Zap,
  Settings,
  BarChart3,
  Building2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Business } from '../../types/database';
import { WhatsAppPanel } from './WhatsAppPanel';
import { MessagesPanel } from './MessagesPanel';
import { AutomationPanel } from './AutomationPanel';
import { SettingsPanel } from './SettingsPanel';

interface MainDashboardProps {
  business: Business;
  onBusinessUpdate: () => void;
}

type Tab = 'messages' | 'automation' | 'analytics' | 'settings';

export function MainDashboard({ business, onBusinessUpdate }: MainDashboardProps) {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('messages');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
                <p className="text-xs text-gray-500">{business.industry}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WhatsAppPanel businessId={business.id} />

        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center gap-2 pb-4 border-b-2 transition ${
                  activeTab === 'messages'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">Mensajes</span>
              </button>
              <button
                onClick={() => setActiveTab('automation')}
                className={`flex items-center gap-2 pb-4 border-b-2 transition ${
                  activeTab === 'automation'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Zap className="w-5 h-5" />
                <span className="font-medium">Automatización</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 pb-4 border-b-2 transition ${
                  activeTab === 'analytics'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Estadísticas</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 pb-4 border-b-2 transition ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Configuración</span>
              </button>
            </nav>
          </div>

          <div className="mt-8">
            {activeTab === 'messages' && <MessagesPanel businessId={business.id} />}
            {activeTab === 'automation' && <AutomationPanel businessId={business.id} />}
            {activeTab === 'analytics' && (
              <div className="bg-white rounded-xl p-8 text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Estadísticas Próximamente
                </h3>
                <p className="text-gray-600">
                  Pronto podrás ver métricas detalladas de tus conversaciones y automatización
                </p>
              </div>
            )}
            {activeTab === 'settings' && (
              <SettingsPanel business={business} onUpdate={onBusinessUpdate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
