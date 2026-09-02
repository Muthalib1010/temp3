import safeStorage, { StorageKeys } from './storage';
import {
  Farmer, Mandi, Crop, Slot, DateAvailability, Booking,
  DigitalPass, Payment, NotificationItem, AdminDashboardSummary,
  AdminQueueItem, LanguageCode
} from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await safeStorage.getItem(StorageKeys.AUTH_TOKEN);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeader();
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorDetail = 'Network request failed';
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch {
        errorDetail = `Server returned error ${response.status}`;
      }
      throw new Error(errorDetail);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const apiService = {
  // Auth
  async register(data: {
    name: string;
    mobile: string;
    password: string;
    village?: string;
    district?: string;
    state?: string;
    pincode?: string;
    preferred_language?: LanguageCode;
    farmer_id?: string;
    aadhaar_last4?: string;
  }): Promise<{ access_token: string; farmer: Farmer }> {
    const res = await request<{ access_token: string; farmer: Farmer }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await safeStorage.setItem(StorageKeys.AUTH_TOKEN, res.access_token);
    await safeStorage.setItem(StorageKeys.USER_PROFILE, JSON.stringify(res.farmer));
    return res;
  },

  async login(mobile: string, password: string): Promise<{ access_token: string; farmer: Farmer }> {
    const res = await request<{ access_token: string; farmer: Farmer }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mobile, password }),
    });
    await safeStorage.setItem(StorageKeys.AUTH_TOKEN, res.access_token);
    await safeStorage.setItem(StorageKeys.USER_PROFILE, JSON.stringify(res.farmer));
    return res;
  },

  async demoLogin(role: 'farmer' | 'admin' = 'farmer'): Promise<{ access_token: string; farmer: Farmer }> {
    const res = await request<{ access_token: string; farmer: Farmer }>('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    await safeStorage.setItem(StorageKeys.AUTH_TOKEN, res.access_token);
    await safeStorage.setItem(StorageKeys.USER_PROFILE, JSON.stringify(res.farmer));
    return res;
  },

  async otpLogin(mobile: string, otp: string): Promise<{ access_token: string; farmer: Farmer }> {
    const res = await request<{ access_token: string; farmer: Farmer }>('/api/auth/otp-login', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
    await safeStorage.setItem(StorageKeys.AUTH_TOKEN, res.access_token);
    await safeStorage.setItem(StorageKeys.USER_PROFILE, JSON.stringify(res.farmer));
    return res;
  },

  async logout(): Promise<void> {
    await safeStorage.removeItem(StorageKeys.AUTH_TOKEN);
    await safeStorage.removeItem(StorageKeys.USER_PROFILE);
  },

  // Farmers
  async getMe(): Promise<Farmer> {
    const res = await request<Farmer>('/api/farmers/me');
    await safeStorage.setItem(StorageKeys.USER_PROFILE, JSON.stringify(res));
    return res;
  },

  async updateMe(data: Partial<Farmer>): Promise<Farmer> {
    const res = await request<Farmer>('/api/farmers/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    await safeStorage.setItem(StorageKeys.USER_PROFILE, JSON.stringify(res));
    return res;
  },

  // Mandis
  async getMandis(params?: { query?: string; district?: string; latitude?: number; longitude?: number }): Promise<Mandi[]> {
    let queryStr = '';
    if (params) {
      const q = new URLSearchParams();
      if (params.query) q.append('query', params.query);
      if (params.district) q.append('district', params.district);
      if (params.latitude) q.append('latitude', params.latitude.toString());
      if (params.longitude) q.append('longitude', params.longitude.toString());
      queryStr = `?${q.toString()}`;
    }
    try {
      const mandis = await request<Mandi[]>(`/api/mandis${queryStr}`);
      await safeStorage.setItem(StorageKeys.CACHED_MANDIS, JSON.stringify(mandis));
      return mandis;
    } catch (e) {
      const cached = await safeStorage.getItem(StorageKeys.CACHED_MANDIS);
      if (cached) return JSON.parse(cached);
      throw e;
    }
  },

  // Crops
  async getCrops(): Promise<Crop[]> {
    try {
      const crops = await request<Crop[]>('/api/crops');
      await safeStorage.setItem(StorageKeys.CACHED_CROPS, JSON.stringify(crops));
      return crops;
    } catch (e) {
      const cached = await safeStorage.getItem(StorageKeys.CACHED_CROPS);
      if (cached) return JSON.parse(cached);
      throw e;
    }
  },

  // Slots
  async getDateAvailability(mandiId: number, daysAhead: number = 7): Promise<DateAvailability[]> {
    return request<DateAvailability[]>(`/api/slots/availability?mandi_id=${mandiId}&days_ahead=${daysAhead}`);
  },

  async getSlots(mandiId: number, date?: string): Promise<Slot[]> {
    const query = date ? `?mandi_id=${mandiId}&date=${date}` : `?mandi_id=${mandiId}`;
    return request<Slot[]>(`/api/slots${query}`);
  },

  // Bookings
  async createBooking(data: { mandi_id: number; crop_id: number; slot_id: number; quantity: number }): Promise<Booking> {
    const booking = await request<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await safeStorage.setItem(StorageKeys.CACHED_BOOKING, JSON.stringify(booking));
    return booking;
  },

  async getBookings(params?: { status?: string; crop_id?: number; search?: string }): Promise<Booking[]> {
    let queryStr = '';
    if (params) {
      const q = new URLSearchParams();
      if (params.status) q.append('status', params.status);
      if (params.crop_id) q.append('crop_id', params.crop_id.toString());
      if (params.search) q.append('search', params.search);
      queryStr = `?${q.toString()}`;
    }
    return request<Booking[]>(`/api/bookings${queryStr}`);
  },

  async getBookingById(id: string | number): Promise<Booking> {
    const booking = await request<Booking>(`/api/bookings/${id}`);
    await safeStorage.setItem(StorageKeys.CACHED_BOOKING, JSON.stringify(booking));
    return booking;
  },

  async cancelBooking(id: number): Promise<Booking> {
    return request<Booking>(`/api/bookings/${id}/cancel`, {
      method: 'PATCH',
    });
  },

  async advanceStage(id: number, stageIndex?: number): Promise<Booking> {
    return request<Booking>(`/api/bookings/${id}/advance-stage`, {
      method: 'PATCH',
      body: JSON.stringify(stageIndex !== undefined ? { stage_index: stageIndex } : {}),
    });
  },

  async getDigitalPass(bookingId: number): Promise<DigitalPass> {
    try {
      const pass = await request<DigitalPass>(`/api/bookings/${bookingId}/pass`);
      await safeStorage.setItem(StorageKeys.CACHED_DIGITAL_PASS, JSON.stringify(pass));
      return pass;
    } catch (e) {
      const cached = await safeStorage.getItem(StorageKeys.CACHED_DIGITAL_PASS);
      if (cached) return JSON.parse(cached);
      throw e;
    }
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    return request<Payment[]>('/api/payments');
  },

  async getPaymentById(id: number): Promise<Payment> {
    return request<Payment>(`/api/payments/${id}`);
  },

  async clearPayment(id: number): Promise<Payment> {
    return request<Payment>(`/api/payments/${id}/clear`, {
      method: 'POST',
    });
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>('/api/notifications');
  },

  async markNotificationRead(id: number): Promise<NotificationItem> {
    return request<NotificationItem>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsRead(): Promise<{ message: string; count: number }> {
    return request<{ message: string; count: number }>('/api/notifications/read-all', {
      method: 'PATCH',
    });
  },

  // Admin Dashboard & Queue Operations
  async getAdminDashboard(mandiId?: number): Promise<AdminDashboardSummary> {
    const q = mandiId ? `?mandi_id=${mandiId}` : '';
    return request<AdminDashboardSummary>(`/api/admin/dashboard${q}`);
  },

  async getAdminQueue(mandiId?: number, search?: string): Promise<AdminQueueItem[]> {
    const q = new URLSearchParams();
    if (mandiId) q.append('mandi_id', mandiId.toString());
    if (search) q.append('search', search);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return request<AdminQueueItem[]>(`/api/admin/queue${queryStr}`);
  },

  async adminCallNextFarmer(mandiId?: number): Promise<{ message: string; now_serving: number }> {
    const q = mandiId ? `?mandi_id=${mandiId}` : '';
    return request<{ message: string; now_serving: number }>(`/api/admin/call-next${q}`, {
      method: 'POST',
    });
  },
};
