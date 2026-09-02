export type LanguageCode = 'en' | 'hi' | 'ml' | 'ta' | 'te' | 'mr' | 'pa';

export interface Farmer {
  id: number;
  name: string;
  mobile: string;
  role: 'farmer' | 'admin';
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  preferred_language: LanguageCode;
  farmer_id?: string;
  aadhaar_last4?: string;
  created_at: string;
}

export interface Mandi {
  id: number;
  name: string;
  location: string;
  district: string;
  state: string;
  address: string;
  operating_hours: string;
  capacity_per_day: number;
  latitude?: number;
  longitude?: number;
  contact_phone: string;
  active: boolean;
  distance_km?: number;
  available_slots_today?: number;
  status?: string;
}

export interface Crop {
  id: number;
  name: string;
  local_name?: string;
  category: string;
  msp_price: number;
  rate_per_kg: number;
  active: boolean;
}

export interface Slot {
  id: number;
  mandi_id: number;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  available_count: number;
  status: 'OPEN' | 'ALMOST_FULL' | 'FULL' | 'CLOSED';
}

export interface DateAvailability {
  date: string;
  day_name: string;
  total_slots: number;
  available_slots: number;
  is_available: boolean;
  status_label: string;
}

export type ProcurementStageCode = 
  | 'BOOKED'
  | 'ARRIVED'
  | 'WEIGHING'
  | 'QUALITY_CHECK'
  | 'COMPLETED'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_COMPLETED'
  | 'CANCELLED';

export interface Booking {
  id: number;
  booking_id: string;
  farmer_id: number;
  farmer_name?: string;
  farmer_mobile?: string;
  mandi_id: number;
  mandi_name?: string;
  mandi_district?: string;
  crop_id: number;
  crop_name?: string;
  crop_category?: string;
  quantity: number;
  slot_id: number;
  date?: string;
  start_time?: string;
  end_time?: string;
  queue_number: number;
  now_serving_number: number;
  ahead_in_queue: number;
  estimated_wait_minutes: number;
  status: 'CONFIRMED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  procurement_status: ProcurementStageCode;
  current_stage_index: number;
  total_amount: number;
  qr_code_data?: string;
  created_at: string;
  updated_at: string;
}

export interface DigitalPass {
  booking_id: string;
  farmer_name: string;
  farmer_mobile: string;
  farmer_id_card?: string;
  mandi_name: string;
  mandi_address: string;
  mandi_phone: string;
  date: string;
  time_slot: string;
  crop_name: string;
  quantity: number;
  rate_per_kg: number;
  total_estimated_value: number;
  queue_number: number;
  status: string;
  qr_code_data: string;
  issued_at: string;
}

export interface Payment {
  id: number;
  booking_id: number;
  booking_code?: string;
  farmer_name?: string;
  crop_name?: string;
  quantity?: number;
  mandi_name?: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  transaction_id?: string;
  payment_date?: string;
  bank_name: string;
  ifsc_prefix: string;
  account_last4: string;
  pfms_reference?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  farmer_id: number;
  booking_id?: number;
  title: string;
  message: string;
  type: 'BOOKING' | 'QUEUE' | 'REMINDER' | 'PROCUREMENT' | 'PAYMENT' | 'SYSTEM' | 'INFO';
  read: boolean;
  created_at: string;
}

export interface AdminDashboardSummary {
  total_bookings_today: int;
  waiting_count: number;
  in_procurement_count: number;
  completed_count: number;
  payment_pending_count: number;
  payment_completed_count: number;
  now_serving: number;
  total_crop_procured_kg: number;
  total_payout_inr: number;
}

export interface AdminQueueItem {
  id: number;
  booking_id: string;
  farmer_name: string;
  farmer_mobile: string;
  crop_name: string;
  quantity: number;
  slot_time: string;
  queue_number: number;
  status: string;
  procurement_status: string;
  current_stage_index: number;
  estimated_wait_minutes: number;
  amount: number;
  payment_status: string;
}
