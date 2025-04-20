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

  // Test 1: Get Issues for Sprint
  const getIssuesResponse = http.get(
    `${config.baseUrl}/api/issues/sprint/${config.sprintId}`,
    { headers }
  );
  check(getIssuesResponse, {
    ...checks.success(getIssuesResponse),
    'returns array of issues': (r) => Array.isArray(JSON.parse(r.body)),
  });
  sleep(1);

  // Test 2: Create Issue
  const issueData = generators.issue();
  const createIssueResponse = http.post(
    `${config.baseUrl}/api/issues`,
    JSON.stringify(issueData),
    { headers }
  );
  check(createIssueResponse, checks.create(createIssueResponse, issueData));
  const createdIssue = JSON.parse(createIssueResponse.body);
  sleep(1);

  // Test 3: Update Issue Order
  const updateOrderData = [{
    id: createdIssue.id,
    status: 'IN_PROGRESS',
    order: 1
  }];
  const updateOrderResponse = http.put(
    `${config.baseUrl}/api/issues/order`,
    JSON.stringify(updateOrderData),
    { headers }
  );
  check(updateOrderResponse, {
    ...checks.success(updateOrderResponse),
    'order updated successfully': (r) => JSON.parse(r.body).success === true,
  });
  sleep(1);

  // Test 4: Update Issue
  const updateData = {
    status: 'DONE',
    priority: 'HIGH'
  };
  const updateIssueResponse = http.put(
    `${config.baseUrl}/api/issues/${createdIssue.id}`,
    JSON.stringify(updateData),
    { headers }
  );
  check(updateIssueResponse, {
    ...checks.success(updateIssueResponse),
    'issue updated correctly': (r) => {
      const response = JSON.parse(r.body);
      return response.status === 'DONE' && response.priority === 'HIGH';
    },
  });
  sleep(1);

  // Test 5: Delete Issue
  const deleteIssueResponse = http.del(
    `${config.baseUrl}/api/issues/${createdIssue.id}`,
    null,
    { headers }
  );
  check(deleteIssueResponse, checks.delete(deleteIssueResponse));
  sleep(1);
} 