export interface Business {
  id: string;
  user_id: string;
  name: string;
  industry: string;
  description: string;
  business_info: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppConnection {
  id: string;
  business_id: string;
  phone_number: string;
  api_key: string;
  is_active: boolean;
  connected_at: string;
  last_sync: string;
}

export interface ChatMessage {
  id: string;
  business_id: string;
  contact_number: string;
  contact_name: string;
  message: string;
  is_from_customer: boolean;
  ai_generated: boolean;
  created_at: string;
}

export interface AutomationRule {
  id: string;
  business_id: string;
  rule_name: string;
  trigger_type: string;
  trigger_value: string;
  action_type: string;
  action_config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}
