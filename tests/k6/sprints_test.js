import http from 'k6/http';
import { check, sleep } from 'k6';
import { config, stages, thresholds } from './shared/config.js';
import { getHeaders, generators, checks } from './shared/utils.js';

// Test configuration
export const options = {
  stages: stages.load,
  thresholds: thresholds,
};

// Test scenarios
export default function () {
  const headers = getHeaders();

  // Test 1: Create Sprint
  const sprintData = generators.sprint();
  const createSprintResponse = http.post(
    `${config.baseUrl}/api/sprints`,
    JSON.stringify(sprintData),
    { headers }
  );
  check(createSprintResponse, checks.create(createSprintResponse, sprintData));
  const createdSprint = JSON.parse(createSprintResponse.body);
  sleep(1);

  // Test 2: Update Sprint Status to ACTIVE
  const updateStatusResponse = http.put(
    `${config.baseUrl}/api/sprints/${createdSprint.id}/status`,
    JSON.stringify({ status: 'ACTIVE' }),
    { headers }
  );
  check(updateStatusResponse, {
    ...checks.success(updateStatusResponse),
    'status updated to ACTIVE': (r) => {
      const response = JSON.parse(r.body);
      return response.sprint.status === 'ACTIVE';
    },
  });
  sleep(1);

  // Test 3: Update Sprint Status to COMPLETED
  const completeStatusResponse = http.put(
    `${config.baseUrl}/api/sprints/${createdSprint.id}/status`,
    JSON.stringify({ status: 'COMPLETED' }),
    { headers }
  );
  check(completeStatusResponse, {
    ...checks.success(completeStatusResponse),
    'status updated to COMPLETED': (r) => {
      const response = JSON.parse(r.body);
      return response.sprint.status === 'COMPLETED';
    },
  });
  sleep(1);
} 