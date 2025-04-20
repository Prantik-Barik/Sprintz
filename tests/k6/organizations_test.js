import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

// Test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
let authToken = __ENV.AUTH_TOKEN;
let orgId = __ENV.ORG_ID;
let orgSlug = __ENV.ORG_SLUG;

// Test cases
export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  };

  // Test 1: Get Organization by Slug
  const getOrgResponse = http.get(`${BASE_URL}/api/organizations/${orgSlug}`, { headers });
  check(getOrgResponse, {
    'Get Organization status is 200': (r) => r.status === 200,
    'Get Organization returns organization object': (r) => {
      const response = JSON.parse(r.body);
      return response.id && response.slug === orgSlug;
    },
  });
  sleep(1);

  // Test 2: Get Projects for Organization
  const getProjectsResponse = http.get(`${BASE_URL}/api/organizations/${orgId}/projects`, { headers });
  check(getProjectsResponse, {
    'Get Projects status is 200': (r) => r.status === 200,
    'Get Projects returns array': (r) => Array.isArray(JSON.parse(r.body)),
  });
  sleep(1);

  // Test 3: Get User Issues
  const getIssuesResponse = http.get(`${BASE_URL}/api/organizations/${orgId}/issues`, { headers });
  check(getIssuesResponse, {
    'Get User Issues status is 200': (r) => r.status === 200,
    'Get User Issues returns array': (r) => Array.isArray(JSON.parse(r.body)),
  });
  sleep(1);

  // Test 4: Get Organization Users
  const getUsersResponse = http.get(`${BASE_URL}/api/organizations/${orgId}/users`, { headers });
  check(getUsersResponse, {
    'Get Organization Users status is 200': (r) => r.status === 200,
    'Get Organization Users returns array': (r) => Array.isArray(JSON.parse(r.body)),
  });
  sleep(1);
}