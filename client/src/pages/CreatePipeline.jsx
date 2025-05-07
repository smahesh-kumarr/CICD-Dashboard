import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

// Mock function to fetch credentials (replace with API call)
// (This should ideally be in a shared service file)
const fetchCredentialsFromAPI = async () => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
  // Return mock data matching ManageCredentials
  return [
    { id: 'cred1', name: 'GitHub Token - User A', type: 'github', data: { token: 'ghp_xxx' } },
    { id: 'cred2', name: 'DockerHub Pass - User B', type: 'docker', data: { username: 'userB', password: 'pass' } },
    { id: 'cred3', name: 'AWS Key - Project X', type: 'aws', data: { accessKeyId: 'AKIA...', secretAccessKey: 'secret...' } },
    { id: 'cred4', name: 'SonarQube - Main', type: 'sonarqube', data: { token: 'sq_xxx'} },
    { id: 'cred5', name: 'K8s Cluster - Dev', type: 'k8s', data: { endpoint: 'https://... '} },
    { id: 'cred6', name: 'Argo CD - Staging', type: 'argocd', data: { serverUrl: 'https://...'} },
    { id: 'cred7', name: 'GitHub Token - Org Bot', type: 'github', data: { token: 'ghp_yyy' } },
  ];
};

const mockTestingTools = [
  { id: 'selenium', name: 'Selenium' },
  { id: 'jmeter', name: 'Apache JMeter' },
  { id: 'appium', name: 'Appium' },
  { id: 'junit', name: 'JUnit' },
  { id: 'maven', name: 'Maven' },
];

const securityTools = [
  { id: 'none', name: 'None' },
  { id: 'sonarqube', name: 'SonarQube' },
  { id: 'coverity', name: 'Coverity' },
  { id: 'codeaxy', name: 'Codeaxy' },
];

const dockerRegistries = [
  { id: 'dockerhub', name: 'Docker Hub' },
  { id: 'ecr', name: 'AWS ECR' },
  { id: 'acr', name: 'Azure ACR' },
  { id: 'ghcr', name: 'GitHub CR' },
];

const cdTools = [
  { id: 'none', name: 'None' },
  { id: 'argocd', name: 'Argo CD' },
  { id: 'spinnaker', name: 'Spinnaker' },
  { id: 'fluxcd', name: 'Flux CD' },
];

const k8sTargets = [
  { id: 'azure', name: 'Azure Kubernetes (AKS)' },
  { id: 'aws', name: 'AWS Kubernetes (EKS)' },
  { id: 'gcp', name: 'GCP Kubernetes (GKE)' },
];

const CreatePipeline = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    environment: 'dev',
    type: 'simple',
    github: {
      credentialId: '',
      repository: '',
      jenkinsfilePath: 'Jenkinsfile',
      branches: ['main']
    },
    testingTools: {
      unitTesting: false,
      integrationTesting: false,
      e2eTesting: false
    },
    security: {
      staticAnalysis: {
        enabled: false,
        tools: [],
        credentialId: ''
      },
      dependencyCheck: {
        enabled: false,
        tool: 'owasp',
        credentialId: ''
      },
      containerScanning: {
        enabled: false,
        tools: [],
        credentialId: ''
      }
    },
    docker: {
      buildType: 'both',
      registry: 'dockerhub',
      credentialId: ''
    },
    continuousDeployment: {
      enabled: false,
      platform: '',
      credentialId: ''
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchCredentials = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/credentials`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCredentials(response.data.credentials);
      } catch (error) {
        setError('Failed to fetch credentials');
        console.error('Error fetching credentials:', error);
      }
    };

    fetchCredentials();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, grandChild] = name.split('.');
      if (grandChild) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandChild]: type === 'checkbox' ? checked : value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'checkbox' ? checked : value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Clean up the form data before sending
      const cleanFormData = {
        ...formData,
        security: {
          staticAnalysis: {
            ...formData.security.staticAnalysis,
            credentialId: formData.security.staticAnalysis.enabled ? formData.security.staticAnalysis.credentialId : null
          },
          dependencyCheck: {
            ...formData.security.dependencyCheck,
            credentialId: formData.security.dependencyCheck.enabled ? formData.security.dependencyCheck.credentialId : null
          },
          containerScanning: {
            ...formData.security.containerScanning,
            credentialId: formData.security.containerScanning.enabled ? formData.security.containerScanning.credentialId : null
          }
        },
        docker: {
          ...formData.docker,
          credentialId: formData.docker.registry !== 'none' ? formData.docker.credentialId : null
        },
        continuousDeployment: {
          ...formData.continuousDeployment,
          credentialId: formData.continuousDeployment.enabled ? formData.continuousDeployment.credentialId : null
        }
      };

      const response = await axios.post(
        `${API_BASE_URL}/pipelines`,
        cleanFormData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Failed to create pipeline');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create pipeline');
      console.error('Error creating pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCredentialsByType = (type) => {
    return credentials.filter(cred => cred.type === type);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Pipeline</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Pipeline Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Environment</label>
              <select
                name="environment"
                value={formData.environment}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="dev">Development</option>
                <option value="production">Production</option>
                <option value="devops">DevOps</option>
                <option value="qa">QA</option>
              </select>
            </div>
          </div>
        </div>

        {/* GitHub Configuration */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">GitHub Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Pipeline Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="simple">Simple Pipeline (Single Repo)</option>
                <option value="multi-branch">Multi-Branch Pipeline</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GitHub Credentials</label>
              <select
                name="github.credentialId"
                value={formData.github.credentialId}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select GitHub Credentials</option>
                {getCredentialsByType('github').map(cred => (
                  <option key={cred._id} value={cred._id}>{cred.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Repository</label>
              <input
                type="text"
                name="github.repository"
                value={formData.github.repository}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jenkinsfile Path</label>
              <input
                type="text"
                name="github.jenkinsfilePath"
                value={formData.github.jenkinsfilePath}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch</label>
              <input
                type="text"
                name="github.branch"
                value={formData.github.branch}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Testing Tools */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Testing Tools</h2>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="testingTools.unitTesting"
                checked={formData.testingTools.unitTesting}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2">Unit Testing</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="testingTools.integrationTesting"
                checked={formData.testingTools.integrationTesting}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2">Integration Testing</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="testingTools.e2eTesting"
                checked={formData.testingTools.e2eTesting}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2">End-to-End Testing</span>
            </label>
          </div>
        </div>

        {/* Security Analysis */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Security Analysis</h2>
          <div className="space-y-4">
            {/* Static Analysis */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="security.staticAnalysis.enabled"
                  checked={formData.security.staticAnalysis.enabled}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2">Static Code Analysis</span>
              </label>
              {formData.security.staticAnalysis.enabled && (
                <div className="ml-6 mt-2 space-y-2">
                  <select
                    name="security.staticAnalysis.tool"
                    value={formData.security.staticAnalysis.tool}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="none">Select Tool</option>
                    <option value="sonarqube">SonarQube</option>
                    <option value="coverity">Coverity</option>
                    <option value="snyk">Snyk</option>
                  </select>
                  <select
                    name="security.staticAnalysis.credentialId"
                    value={formData.security.staticAnalysis.credentialId}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Credentials</option>
                    {getCredentialsByType('sonarqube').map(cred => (
                      <option key={cred._id} value={cred._id}>{cred.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Dependency Check */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="security.dependencyCheck.enabled"
                  checked={formData.security.dependencyCheck.enabled}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2">Dependency Check</span>
              </label>
              {formData.security.dependencyCheck.enabled && (
                <div className="ml-6 mt-2 space-y-2">
                  <select
                    name="security.dependencyCheck.tool"
                    value={formData.security.dependencyCheck.tool}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="none">Select Tool</option>
                    <option value="owasp">OWASP Dependency Check</option>
                    <option value="snyk">Snyk</option>
                  </select>
                  <select
                    name="security.dependencyCheck.credentialId"
                    value={formData.security.dependencyCheck.credentialId}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Credentials</option>
                    {getCredentialsByType('dependency-check').map(cred => (
                      <option key={cred._id} value={cred._id}>{cred.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Container Scanning */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="security.containerScanning.enabled"
                  checked={formData.security.containerScanning.enabled}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2">Container Scanning</span>
              </label>
              {formData.security.containerScanning.enabled && (
                <div className="ml-6 mt-2 space-y-2">
                  <select
                    name="security.containerScanning.tool"
                    value={formData.security.containerScanning.tool}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="none">Select Tool</option>
                    <option value="anchore">Anchore</option>
                    <option value="aqua">Aqua Security</option>
                    <option value="clair">Clair</option>
                  </select>
                  <select
                    name="security.containerScanning.credentialId"
                    value={formData.security.containerScanning.credentialId}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Credentials</option>
                    {getCredentialsByType('container-scanning').map(cred => (
                      <option key={cred._id} value={cred._id}>{cred.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Docker Configuration */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Docker Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="docker.build"
                  checked={formData.docker.build}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2">Build Docker Image</span>
              </label>
              {formData.docker.build && (
                <div className="ml-6 mt-2">
                  <select
                    name="docker.buildType"
                    value={formData.docker.buildType}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="none">Select Build Type</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="docker.push"
                  checked={formData.docker.push}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2">Push to Registry</span>
              </label>
              {formData.docker.push && (
                <div className="ml-6 mt-2 space-y-2">
                  <select
                    name="docker.registry"
                    value={formData.docker.registry}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="none">Select Registry</option>
                    <option value="dockerhub">Docker Hub</option>
                    <option value="azure">Azure Container Registry</option>
                    <option value="aws">AWS ECR</option>
                    <option value="gcp">Google Container Registry</option>
                  </select>
                  <select
                    name="docker.credentialId"
                    value={formData.docker.credentialId}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Registry Credentials</option>
                    {getCredentialsByType('docker').map(cred => (
                      <option key={cred._id} value={cred._id}>{cred.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Continuous Deployment */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-4">Continuous Deployment</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="continuousDeployment.enabled"
                  checked={formData.continuousDeployment.enabled}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2">Enable Continuous Deployment</span>
              </label>
              {formData.continuousDeployment.enabled && (
                <div className="ml-6 mt-2 space-y-2">
                  <select
                    name="continuousDeployment.platform"
                    value={formData.continuousDeployment.platform}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="none">Select Platform</option>
                    <option value="aws-eks">AWS EKS</option>
                    <option value="azure-aks">Azure AKS</option>
                    <option value="gcp-gke">Google GKE</option>
                  </select>
                  <select
                    name="continuousDeployment.credentialId"
                    value={formData.continuousDeployment.credentialId}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Platform Credentials</option>
                    {getCredentialsByType('kubernetes').map(cred => (
                      <option key={cred._id} value={cred._id}>{cred.name}</option>
                    ))}
                  </select>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Namespace</label>
                    <input
                      type="text"
                      name="continuousDeployment.namespace"
                      value={formData.continuousDeployment.namespace}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Pipeline'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePipeline; 