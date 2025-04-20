import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { config } from './config.js';

// Common headers for all requests
export function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.authToken}`,
  };
}

// Data generators
export const generators = {
  // Project data generator
  project: () => ({
    name: `Project ${randomString(8)}`,
    key: randomString(4).toUpperCase(),
    description: `Test Description ${randomString(20)}`,
    organizationId: config.orgId,
  }),

  // Sprint data generator
  sprint: () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14); // 2 weeks sprint

    return {
      name: `Sprint ${randomString(8)}`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      projectId: config.projectId,
    };
  },

  // Issue data generator
  issue: () => ({
    title: `Issue ${randomString(8)}`,
    description: `Test Description ${randomString(20)}`,
    status: 'TODO',
    priority: 'MEDIUM',
    projectId: config.projectId,
    sprintId: config.sprintId,
  }),
};

// Common response checks
export const checks = {
  // Generic success check
  success: (response) => ({
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'response is valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  }),

  // Create operation checks
  create: (response, data) => ({
    'status is 201': (r) => r.status === 201,
    'returns created object': (r) => {
      const response = JSON.parse(r.body);
      return response.id && response.name === data.name;
    },
  }),

  // Delete operation checks
  delete: (response) => ({
    'status is 200': (r) => r.status === 200,
    'returns success': (r) => JSON.parse(r.body).success === true,
  }),
}; 