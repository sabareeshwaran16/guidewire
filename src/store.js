// ─── CONSTANTS & CONFIG ───────────────────────────────────────────────────────

export const ZONES = ['Chennai', 'Mumbai', 'Delhi', 'Bengaluru', 'Coimbatore'];

export const ZONE_RISK = {
  Chennai: { level: 'Medium', score: 2 },
  Mumbai: { level: 'High', score: 3 },
  Delhi: { level: 'High', score: 3 },
  Bengaluru: { level: 'Medium', score: 2 },
  Coimbatore: { level: 'Low', score: 1 },
};

export const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    weeklyPremium: 30,
    coverage: 300,
    triggers: ['Rain', 'Heat'],
    color: 'bg-indigo-600',
    highlight: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    weeklyPremium: 50,
    coverage: 500,
    triggers: ['Rain', 'Heat', 'AQI', 'Curfew'],
    color: 'bg-indigo-600',
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    weeklyPremium: 70,
    coverage: 700,
    triggers: ['Rain', 'Heat', 'AQI', 'Curfew', 'Platform Downtime'],
    color: 'bg-indigo-600',
    highlight: false,
  },
];

export const TRIGGER_CONFIG = {
  Rain: { threshold: 50, unit: 'mm/day', icon: '🌧️' },
  Heat: { threshold: 42, unit: '°C', icon: '🌡️' },
  AQI: { threshold: 350, unit: 'AQI', icon: '💨' },
  Curfew: { threshold: null, unit: 'ON/OFF', icon: '🚫' },
  'Platform Downtime': { threshold: null, unit: 'ON/OFF', icon: '📵' },
};

// ─── SAMPLE DATA SEEDER ──────────────────────────────────────────────────────

const sampleWorkers = [
  {
    id: 'w1',
    name: 'Ravi Kumar',
    phone: '9876543210',
    whatsapp: '9876543210',
    zone: 'Chennai',
    platform: 'Swiggy',
    avgHours: 8,
    riskScore: 'Medium',
    planId: 'standard',
    walletBalance: 500,
    status: 'Active',
    suspicious: false,
    joinedAt: '2025-12-01',
  },
  {
    id: 'w2',
    name: 'Priya Sharma',
    phone: '9812345678',
    whatsapp: '9812345678',
    zone: 'Mumbai',
    platform: 'Zomato',
    avgHours: 10,
    riskScore: 'High',
    planId: 'premium',
    walletBalance: 1400,
    status: 'Active',
    suspicious: false,
    joinedAt: '2025-11-15',
  },
  {
    id: 'w3',
    name: 'Arjun Mehta',
    phone: '9765432109',
    whatsapp: '9765432109',
    zone: 'Bengaluru',
    platform: 'Both',
    avgHours: 6,
    riskScore: 'Medium',
    planId: 'basic',
    walletBalance: 300,
    status: 'Active',
    suspicious: false,
    joinedAt: '2026-01-10',
  },
  {
    id: 'w4',
    name: 'Kavya Reddy',
    phone: '9654321098',
    whatsapp: '9654321098',
    zone: 'Delhi',
    platform: 'Swiggy',
    avgHours: 9,
    riskScore: 'High',
    planId: 'premium',
    walletBalance: 700,
    status: 'Active',
    suspicious: true,
    joinedAt: '2026-01-20',
  },
  {
    id: 'w5',
    name: 'Suresh Pillai',
    phone: '9543210987',
    whatsapp: '9543210987',
    zone: 'Coimbatore',
    platform: 'Zomato',
    avgHours: 7,
    riskScore: 'Low',
    planId: 'basic',
    walletBalance: 0,
    status: 'Active',
    suspicious: false,
    joinedAt: '2026-02-05',
  },
];

const sampleClaims = [
  { id: 'c1', workerId: 'w1', date: '23/03/2026', event: 'Rain', payout: 500, status: 'Paid', zone: 'Chennai' },
  { id: 'c2', workerId: 'w2', date: '22/03/2026', event: 'Heat', payout: 700, status: 'Paid', zone: 'Mumbai' },
  { id: 'c3', workerId: 'w2', date: '20/03/2026', event: 'AQI', payout: 700, status: 'Paid', zone: 'Mumbai' },
  { id: 'c4', workerId: 'w3', date: '19/03/2026', event: 'Rain', payout: 300, status: 'Paid', zone: 'Bengaluru' },
  { id: 'c5', workerId: 'w4', date: '18/03/2026', event: 'Curfew', payout: 700, status: 'Paid', zone: 'Delhi' },
  { id: 'c6', workerId: 'w4', date: '17/03/2026', event: 'Rain', payout: 700, status: 'Paid', zone: 'Delhi' },
  { id: 'c7', workerId: 'w4', date: '16/03/2026', event: 'Heat', payout: 700, status: 'Paid', zone: 'Delhi' },
  { id: 'c8', workerId: 'w4', date: '15/03/2026', event: 'AQI', payout: 700, status: 'Paid', zone: 'Delhi' },
  { id: 'c9', workerId: 'w1', date: '14/03/2026', event: 'Heat', payout: 500, status: 'Paid', zone: 'Chennai' },
  { id: 'c10', workerId: 'w2', date: '13/03/2026', event: 'Platform Downtime', payout: 700, status: 'Paid', zone: 'Mumbai' },
  { id: 'c11', workerId: 'w2', date: '25/03/2026', event: 'Rain', payout: 700, status: 'Paid', zone: 'Mumbai' },
  { id: 'c12', workerId: 'w2', date: '26/03/2026', event: 'AQI', payout: 700, status: 'Paid', zone: 'Mumbai' },
];

const sampleUsers = [
  // Admins
  { email: 'superadmin@admin.org', password: 'Admin@1234', name: 'Super Admin', role: 'admin' },
  { email: 'ops@admin.org', password: 'Admin@1234', name: 'Operations', role: 'admin' },
  // Workers
  { email: 'ravi@worker.org', password: 'Worker@1234', name: 'Ravi Kumar', role: 'worker', workerId: 'w1' },
  { email: 'priya@worker.org', password: 'Worker@1234', name: 'Priya Sharma', role: 'worker', workerId: 'w2' },
  { email: 'arjun@worker.org', password: 'Worker@1234', name: 'Arjun Mehta', role: 'worker', workerId: 'w3' },
];

const defaultTriggers = {
  Rain: { active: false, value: 32, override: false },
  Heat: { active: false, value: 38, override: false },
  AQI: { active: false, value: 220, override: false },
  Curfew: { active: false, value: 0, override: false },
  'Platform Downtime': { active: false, value: 0, override: false },
};

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────

export function initStore() {
  if (!localStorage.getItem('sp_initialized_v2')) {
    // Clear old auth states
    localStorage.removeItem('sp_current_worker');
    localStorage.removeItem('sp_admin_auth');

    // Seed new structure
    localStorage.setItem('sp_workers', JSON.stringify(sampleWorkers));
    localStorage.setItem('sp_claims', JSON.stringify(sampleClaims));
    localStorage.setItem('sp_triggers', JSON.stringify(defaultTriggers));
    localStorage.setItem('sp_users', JSON.stringify(sampleUsers));
    localStorage.setItem('sp_session', '');
    
    // Using v2 so it triggers a re-seed on existing environments
    localStorage.setItem('sp_initialized_v2', 'true');
  }
}

// ─── AUTH HELPERS ────────────────────────────────────────────────────────────

export function getUsers() {
  return JSON.parse(localStorage.getItem('sp_users') || '[]');
}

export function saveUsers(users) {
  localStorage.setItem('sp_users', JSON.stringify(users));
}

export function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const session = { ...user, token: generateId('jwt') };
    delete session.password;
    localStorage.setItem('sp_session', JSON.stringify(session));
    if (user.role === 'worker') setCurrentWorker(user.workerId);
    return session;
  }
  return null;
}

export function logout() {
  localStorage.removeItem('sp_session');
  localStorage.removeItem('sp_current_worker');
}

export function getCurrentAuth() {
  try {
    return JSON.parse(localStorage.getItem('sp_session'));
  } catch {
    return null;
  }
}

export function getWorkers() {
  return JSON.parse(localStorage.getItem('sp_workers') || '[]');
}

export function saveWorkers(workers) {
  localStorage.setItem('sp_workers', JSON.stringify(workers));
}

export function getClaims() {
  return JSON.parse(localStorage.getItem('sp_claims') || '[]');
}

export function saveClaims(claims) {
  localStorage.setItem('sp_claims', JSON.stringify(claims));
}

export function getTriggers() {
  return JSON.parse(localStorage.getItem('sp_triggers') || '{}');
}

export function saveTriggers(triggers) {
  localStorage.setItem('sp_triggers', JSON.stringify(triggers));
}

export function getCurrentWorker() {
  const id = localStorage.getItem('sp_current_worker');
  if (!id) return null;
  const workers = getWorkers();
  return workers.find(w => w.id === id) || null;
}

export function setCurrentWorker(id) {
  localStorage.setItem('sp_current_worker', id || '');
}

export function updateWorker(updatedWorker) {
  const workers = getWorkers();
  const idx = workers.findIndex(w => w.id === updatedWorker.id);
  if (idx !== -1) {
    workers[idx] = updatedWorker;
    saveWorkers(workers);
  }
}

export function addWorker(worker) {
  const workers = getWorkers();
  workers.push(worker);
  saveWorkers(workers);
}

export function addClaim(claim) {
  const claims = getClaims();
  claims.unshift(claim);
  saveClaims(claims);
}

export function updateClaim(claimId, updates) {
  const claims = getClaims();
  const idx = claims.findIndex(c => c.id === claimId);
  if (idx !== -1) {
    claims[idx] = { ...claims[idx], ...updates };
    saveClaims(claims);
  }
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function formatDate(date = new Date()) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
