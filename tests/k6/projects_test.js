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

  // Test 1: Create Project
  const projectData = generators.project();
  const createProjectResponse = http.post(
    `${config.baseUrl}/api/projects`,
    JSON.stringify(projectData),
    { headers }
  );
  check(createProjectResponse, checks.create(createProjectResponse, projectData));
  const createdProject = JSON.parse(createProjectResponse.body);
  sleep(1);

  // Test 2: Get Project
  const getProjectResponse = http.get(
    `${config.baseUrl}/api/projects/${createdProject.id}`,
    { headers }
  );
  check(getProjectResponse, {
    ...checks.success(getProjectResponse),
    'returns correct project': (r) => {
      const response = JSON.parse(r.body);
      return response.id === createdProject.id;
    },
  });
  sleep(1);

  // Test 3: Delete Project
  const deleteProjectResponse = http.del(
    `${config.baseUrl}/api/projects/${createdProject.id}`,
    null,
    { headers }
  );
  check(deleteProjectResponse, checks.delete(deleteProjectResponse));
  sleep(1);
} 