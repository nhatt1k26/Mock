export type ViewState = 'dashboard' | 'inventory' | 'chaos' | 'observability' | 'settings';

export interface InternalEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  consumerGroup: string;
  dependencies: string[];
}

export interface ServiceEndpoint {
  id: string;
  name: string;
  consumerGroup: string;
  description: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'real' | 'mock';
  health: 'healthy' | 'degraded' | 'down';
  latency: number; // in ms
  mockConfig?: MockConfig;
}

export interface MockConfig {
  type: 'static' | 'scriptable' | 'stateful';
  script?: string;
  latencyDelay?: number;
  errorRate?: number; // 0 to 100
  dataMutation?: boolean;
  isolationHeader?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  serviceId: string;
  targetName: string;
  timestamp: string;
  details: string;
}
