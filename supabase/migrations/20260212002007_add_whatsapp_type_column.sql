/*
  # Agregar tipo de conexión WhatsApp

  1. Modificaciones
    - Agregar columna `connection_type` a la tabla `whatsapp_connections`
    - Permite distinguir entre WhatsApp normal y WhatsApp Business
    - Valores: 'normal' o 'business'
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_connections' AND column_name = 'connection_type'
  ) THEN
    ALTER TABLE whatsapp_connections ADD COLUMN connection_type text DEFAULT 'business';
  END IF;
END $$;