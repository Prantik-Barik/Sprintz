// Shared configuration for all k6 tests
export const config = {
  baseUrl: __ENV.BASE_URL || 'http://localhost:3000',
  authToken: __ENV.AUTH_TOKEN,
  orgId: __ENV.ORG_ID,
  orgSlug: __ENV.ORG_SLUG,
  projectId: __ENV.PROJECT_ID,
  sprintId: __ENV.SPRINT_ID,
};

// Common test stages
export const stages = {
  smoke: [
    { duration: '1m', target: 1 }, // Single user for 1 minute
  ],
  load: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
  stress: [
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

// Common thresholds
export const thresholds = {
  http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  http_reqs: ['rate>100'],          // Should handle at least 100 requests per second
};