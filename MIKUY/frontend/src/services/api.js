import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mikuy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginRequest(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function registerRequest(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function updateProfileRequest(payload) {
  const { data } = await api.put('/auth/profile', payload);
  return data;
}

export async function fetchSummary() {
  const { data } = await api.get('/summary');
  return data;
}

export async function fetchDonations(params = {}) {
  const { data } = await api.get('/donations', { params });
  return data;
}

export async function createDonation(payload) {
  const { data } = await api.post('/donations', payload);
  return data;
}

export async function updateDonation(id, payload) {
  const { data } = await api.put(`/donations/${id}`, payload);
  return data;
}

export async function retireDonation(id) {
  const { data } = await api.delete(`/donations/${id}`);
  return data;
}

export async function createFoodRequest(payload) {
  const { data } = await api.post('/requests', payload);
  return data;
}

export async function acceptFoodRequest(id, response = '') {
  const { data } = await api.post(`/requests/${id}/accept`, { response });
  return data;
}

export async function rejectFoodRequest(id, response = '') {
  const { data } = await api.post(`/requests/${id}/reject`, { response });
  return data;
}

export async function confirmDeliveryRequest(id) {
  const { data } = await api.post(`/deliveries/${id}/confirm`);
  return data;
}

export async function verifyCertificateCode(code) {
  const { data } = await api.get(`/verify/${encodeURIComponent(code)}`);
  return data;
}

export async function fetchMessages(requestId) {
  const { data } = await api.get(`/messages/${requestId}`);
  return data;
}

export async function sendMessageRequest(requestId, body) {
  const { data } = await api.post(`/messages/${requestId}`, { body });
  return data;
}

export async function fetchDonorDashboard() {
  const { data } = await api.get('/dashboards/donor');
  return data;
}

export async function fetchOrganizationDashboard() {
  const { data } = await api.get('/dashboards/organization');
  return data;
}

export async function createOrganizationNeed(payload) {
  const { data } = await api.post('/needs', payload);
  return data;
}

export async function fetchAdminDashboard() {
  const { data } = await api.get('/admin/dashboard');
  return data;
}

export async function toggleUserStatus(id) {
  const { data } = await api.patch(`/admin/users/${id}/toggle`);
  return data;
}

export async function fetchOptimizationBenchmark(district = 'Cusco') {
  const { data } = await api.get('/admin/optimization-benchmark', { params: { district } });
  return data;
}

export async function askAssistant(message, context = {}, history = []) {
  const { data } = await api.post('/assistant', { message, context, history });
  return data;
}

export default api;
