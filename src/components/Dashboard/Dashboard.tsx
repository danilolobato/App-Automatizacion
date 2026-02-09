import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Business } from '../../types/database';
import { BusinessSetup } from './BusinessSetup';
import { MainDashboard } from './MainDashboard';

export function Dashboard() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusiness();
  }, [user]);

  const loadBusiness = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setBusiness(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!business) {
    return <BusinessSetup onComplete={loadBusiness} />;
  }

  return <MainDashboard business={business} onBusinessUpdate={loadBusiness} />;
}
