import { config, stages, thresholds } from './shared/config.js';
import { getHeaders } from './shared/utils.js';
import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  stages: stages.stress, // Use stress test configuration for comprehensive testing
  thresholds: thresholds,
};

// Test scenarios
export default function () {
  const headers = getHeaders();

  // Run all test scenarios in sequence
  const scenarios = [
    {
      name: 'Projects API',
      test: () => {
        // Create Project
        const projectData = {
          name: `Project ${Date.now()}`,
          key: `PROJ${Date.now()}`,
          description: 'Test Project',
          organizationId: config.orgId,
        };
        const createProjectResponse = http.post(
          `${config.baseUrl}/api/projects`,
          JSON.stringify(projectData),
          { headers }
        );
        check(createProjectResponse, {
          'Create Project status is 201': (r) => r.status === 201,
        });
        const createdProject = JSON.parse(createProjectResponse.body);
        sleep(1);

        // Get Project
        const getProjectResponse = http.get(
          `${config.baseUrl}/api/projects/${createdProject.id}`,
          { headers }
        );
        check(getProjectResponse, {
          'Get Project status is 200': (r) => r.status === 200,
        });
        sleep(1);

        // Delete Project
        const deleteProjectResponse = http.del(
          `${config.baseUrl}/api/projects/${createdProject.id}`,
          null,
          { headers }
        );
        check(deleteProjectResponse, {
          'Delete Project status is 200': (r) => r.status === 200,
        });
      },
    },
    {
      name: 'Sprints API',
      test: () => {
        // Create Sprint
        const sprintData = {
          name: `Sprint ${Date.now()}`,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          projectId: config.projectId,
        };
        const createSprintResponse = http.post(
          `${config.baseUrl}/api/sprints`,
          JSON.stringify(sprintData),
          { headers }
        );
        check(createSprintResponse, {
          'Create Sprint status is 201': (r) => r.status === 201,
        });
        const createdSprint = JSON.parse(createSprintResponse.body);
        sleep(1);

        // Update Sprint Status
        const updateStatusResponse = http.put(
          `${config.baseUrl}/api/sprints/${createdSprint.id}/status`,
          JSON.stringify({ status: 'ACTIVE' }),
          { headers }
        );
        check(updateStatusResponse, {
          'Update Sprint Status status is 200': (r) => r.status === 200,
        });
      },
    },
    {
      name: 'Issues API',
      test: () => {
        // Create Issue
        const issueData = {
          title: `Issue ${Date.now()}`,
          description: 'Test Issue',
          status: 'TODO',
          priority: 'MEDIUM',
          projectId: config.projectId,
          sprintId: config.sprintId,
        };
        const createIssueResponse = http.post(
          `${config.baseUrl}/api/issues`,
          JSON.stringify(issueData),
          { headers }
        );
        check(createIssueResponse, {
          'Create Issue status is 201': (r) => r.status === 201,
        });
        const createdIssue = JSON.parse(createIssueResponse.body);
        sleep(1);

        // Update Issue
        const updateIssueResponse = http.put(
          `${config.baseUrl}/api/issues/${createdIssue.id}`,
          JSON.stringify({ status: 'IN_PROGRESS', priority: 'HIGH' }),
          { headers }
        );
        check(updateIssueResponse, {
          'Update Issue status is 200': (r) => r.status === 200,
        });
        sleep(1);

        // Delete Issue
        const deleteIssueResponse = http.del(
          `${config.baseUrl}/api/issues/${createdIssue.id}`,
          null,
          { headers }
        );
        check(deleteIssueResponse, {
          'Delete Issue status is 200': (r) => r.status === 200,
        });
      },
    },
  ];

  // Run each scenario
  scenarios.forEach((scenario) => {
    console.log(`Running ${scenario.name}...`);
    scenario.test();
    sleep(2); // Add delay between scenarios
  });
} 