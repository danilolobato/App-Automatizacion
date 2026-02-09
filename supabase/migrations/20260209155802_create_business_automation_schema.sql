/*
  # Schema de Automatización de Negocios

  1. Nuevas Tablas
    - `businesses` - Información de las empresas/emprendimientos
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key a auth.users)
      - `name` (text) - Nombre del negocio
      - `industry` (text) - Industria/rubro
      - `description` (text) - Descripción del negocio
      - `business_info` (text) - Información detallada para la IA
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `whatsapp_connections` - Conexiones de WhatsApp
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key a businesses)
      - `phone_number` (text) - Número de WhatsApp
      - `api_key` (text) - API key encriptada
      - `is_active` (boolean) - Estado de la conexión
      - `connected_at` (timestamp)
      - `last_sync` (timestamp)
    
    - `chat_messages` - Mensajes del chat
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key a businesses)
      - `contact_number` (text) - Número del contacto
      - `contact_name` (text) - Nombre del contacto
      - `message` (text) - Contenido del mensaje
      - `is_from_customer` (boolean) - Si es del cliente o respuesta de IA
      - `ai_generated` (boolean) - Si fue generado por IA
      - `created_at` (timestamp)
    
    - `automation_rules` - Reglas de automatización
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key a businesses)
      - `rule_name` (text) - Nombre de la regla
      - `trigger_type` (text) - Tipo de trigger (new_message, keyword, etc)
      - `trigger_value` (text) - Valor del trigger
      - `action_type` (text) - Tipo de acción
      - `action_config` (jsonb) - Configuración de la acción
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. Seguridad
    - Enable RLS en todas las tablas
    - Políticas para que usuarios solo accedan a sus propios datos
*/

-- Tabla de negocios
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  industry text DEFAULT '',
  description text DEFAULT '',
  business_info text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own business"
  ON businesses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own business"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business"
  ON businesses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own business"
  ON businesses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tabla de conexiones WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  phone_number text NOT NULL,
  api_key text DEFAULT '',
  is_active boolean DEFAULT false,
  connected_at timestamptz DEFAULT now(),
  last_sync timestamptz DEFAULT now()
);

ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own whatsapp connections"
  ON whatsapp_connections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = whatsapp_connections.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own whatsapp connections"
  ON whatsapp_connections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = whatsapp_connections.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own whatsapp connections"
  ON whatsapp_connections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = whatsapp_connections.business_id
      AND businesses.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = whatsapp_connections.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own whatsapp connections"
  ON whatsapp_connections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = whatsapp_connections.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Tabla de mensajes de chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  contact_number text NOT NULL,
  contact_name text DEFAULT '',
  message text NOT NULL,
  is_from_customer boolean DEFAULT true,
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = chat_messages.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = chat_messages.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Tabla de reglas de automatización
CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  rule_name text NOT NULL,
  trigger_type text NOT NULL,
  trigger_value text DEFAULT '',
  action_type text NOT NULL,
  action_config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automation rules"
  ON automation_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = automation_rules.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own automation rules"
  ON automation_rules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = automation_rules.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own automation rules"
  ON automation_rules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = automation_rules.business_id
      AND businesses.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = automation_rules.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own automation rules"
  ON automation_rules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = automation_rules.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_business_id ON whatsapp_connections(business_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_business_id ON chat_messages(business_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_rules_business_id ON automation_rules(business_id);