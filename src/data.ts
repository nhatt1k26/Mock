import { ServiceEndpoint, AuditLog, InternalEndpoint } from './types';

export const MOCK_INTERNAL_ENDPOINTS: InternalEndpoint[] = [
  {
    id: 'ie-1',
    path: '/api/v1/checkout/process',
    method: 'POST',
    consumerGroup: 'Order & Checkout Service',
    dependencies: ['srv-1', 'srv-3']
  },
  {
    id: 'ie-2',
    path: '/api/v1/checkout/validate',
    method: 'GET',
    consumerGroup: 'Order & Checkout Service',
    dependencies: ['srv-1']
  },
  {
    id: 'ie-3',
    path: '/api/v1/auth/login',
    method: 'POST',
    consumerGroup: 'Identity & Access Service',
    dependencies: ['srv-2', 'srv-4']
  }
];

export const MOCK_SERVICES: ServiceEndpoint[] = [
  {
    id: 'srv-1',
    name: 'Payment Gateway',
    consumerGroup: 'Order & Checkout Service',
    description: 'Stripe API for processing user payments',
    url: 'https://api.stripe.com/v1/charges',
    method: 'POST',
    status: 'mock',
    health: 'healthy',
    latency: 120,
    mockConfig: {
      type: 'scriptable',
      script: 'if (req.body.amount > 10000) return { status: 400, error: "Amount too large" }; return { status: 200, id: "ch_mock_123" };',
      latencyDelay: 0,
      errorRate: 0,
    }
  },
  {
    id: 'srv-2',
    name: 'User Management',
    consumerGroup: 'Identity & Access Service',
    description: 'Auth0 identity provider API',
    url: 'https://auth0.com/api/v2/users',
    method: 'GET',
    status: 'real',
    health: 'degraded',
    latency: 850,
  },
  {
    id: 'srv-3',
    name: 'Logistics Partner',
    consumerGroup: 'Order & Checkout Service',
    description: 'FedEx shipping rate calculator',
    url: 'https://api.fedex.com/rate/v1',
    method: 'POST',
    status: 'mock',
    health: 'healthy',
    latency: 45,
    mockConfig: {
      type: 'stateful',
      errorRate: 15,
      latencyDelay: 2000,
      dataMutation: true,
      isolationHeader: 'x-mock-session',
    }
  },
  {
    id: 'srv-4',
    name: 'CRM Sync',
    consumerGroup: 'Identity & Access Service',
    description: 'Salesforce bulk data sync',
    url: 'https://api.salesforce.com/services/data/v52.0',
    method: 'PATCH',
    status: 'real',
    health: 'down',
    latency: 5000,
  }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    user: 'admin@company.com',
    action: 'TOGGLE_MODE',
    serviceId: 'srv-1',
    targetName: 'Payment Gateway',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    details: 'Changed from REAL to MOCK mode',
  },
  {
    id: 'log-2',
    user: 'dev_lead@company.com',
    action: 'UPDATE_MOCK_SCRIPT',
    serviceId: 'srv-1',
    targetName: 'Payment Gateway',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    details: 'Updated script logic for >$10k payments',
  },
  {
    id: 'log-3',
    user: 'qa_engineer@company.com',
    action: 'INJECT_CHAOS',
    serviceId: 'srv-3',
    targetName: 'Logistics Partner',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    details: 'Added 15% error rate and 2000ms latency delay',
  }
];
