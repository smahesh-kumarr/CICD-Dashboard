import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiGithub, FiLock, FiCode, FiPackage, FiServer, FiCloud, FiCheck, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const API_BASE_URL = 'http://localhost:5000/api';

const dockerRegistries = [
  { id: 'dockerhub', name: 'Docker Hub' },
  { id: 'ecr', name: 'AWS ECR' },
  { id: 'acr', name: 'Azure ACR' },
  { id: 'ghcr', name: 'GitHub CR' },
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
  const [activeSection, setActiveSection] = useState('basic');
  const [credentials, setCredentials] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    environment: 'dev',
    type: 'simple',
    organization: {
      id: '',
      name: ''
    },
    team: {
      name: 'development',
      email: ''
    },
    github: {
      credentialId: '',
      repository: '',
      jenkinsfilePath: 'Jenkinsfile',
      branches: ['main']
    },
    testingTools: {
      unitTesting: false,
      integrationTesting: false,
      e2eTesting: false,
      selectedTools: []
    },
    security: {
      staticAnalysis: {
        enabled: false,
        tool: '',
        credentialId: ''
      },
      dependencyCheck: {
        enabled: false,
        tool: 'owasp',
        credentialId: ''
      },
      containerScanning: {
        enabled: false,
        tool: '',
        credentialId: ''
      }
    },
    docker: {
      build: false,
      push: false,
      buildType: 'both',
      registry: 'dockerhub',
      credentialId: ''
    },
    continuousDeployment: {
      enabled: false,
      platform: '',
      credentialId: '',
      namespace: 'default'
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
        if (response.data.success) {
          setCredentials(response.data.credentials);
        } else {
          setError('Failed to fetch credentials');
        }
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

      // Validate organization and team fields
      if (!formData.organization.id || !formData.organization.name || !formData.team.email) {
        setError('Organization and team details are required');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/pipelines`,
        formData,
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

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  const toggleTestingTool = (tool) => {
    setFormData(prev => {
      const isSelected = prev.testingTools.selectedTools.includes(tool);
      return {
        ...prev,
        testingTools: {
          ...prev.testingTools,
          selectedTools: isSelected
            ? prev.testingTools.selectedTools.filter(t => t !== tool)
            : [...prev.testingTools.selectedTools, tool]
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Create New Pipeline</h1>
            <p className="text-gray-600">Configure your CI/CD workflow with ease</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Create Pipeline
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">Error creating pipeline</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">Configuration Steps</h2>
              </div>
              <nav className="divide-y divide-gray-200">
                <button
                  onClick={() => toggleSection('basic')}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between ${activeSection === 'basic' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">1</span>
                    </div>
                    <span className="font-medium">Basic Information</span>
                  </div>
                  {activeSection === 'basic' ? <FiChevronDown /> : <FiChevronRight />}
                </button>
                
                <button
                  onClick={() => toggleSection('github')}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between ${activeSection === 'github' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <FiGithub className="text-blue-600" />
                    </div>
                    <span className="font-medium">Source Control</span>
                  </div>
                  {activeSection === 'github' ? <FiChevronDown /> : <FiChevronRight />}
                </button>
                
                <button
                  onClick={() => toggleSection('testing')}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between ${activeSection === 'testing' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <FiCode className="text-blue-600" />
                    </div>
                    <span className="font-medium">Testing</span>
                  </div>
                  {activeSection === 'testing' ? <FiChevronDown /> : <FiChevronRight />}
                </button>
                
                <button
                  onClick={() => toggleSection('security')}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between ${activeSection === 'security' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <FiLock className="text-blue-600" />
                    </div>
                    <span className="font-medium">Security</span>
                  </div>
                  {activeSection === 'security' ? <FiChevronDown /> : <FiChevronRight />}
                </button>
                
                <button
                  onClick={() => toggleSection('docker')}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between ${activeSection === 'docker' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <FiPackage className="text-blue-600" />
                    </div>
                    <span className="font-medium">Containerization</span>
                  </div>
                  {activeSection === 'docker' ? <FiChevronDown /> : <FiChevronRight />}
                </button>
                
                <button
                  onClick={() => toggleSection('deployment')}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between ${activeSection === 'deployment' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <FiServer className="text-blue-600" />
                    </div>
                    <span className="font-medium">Deployment</span>
                  </div>
                  {activeSection === 'deployment' ? <FiChevronDown /> : <FiChevronRight />}
                </button>
              </nav>
            </div>

            {/* Progress Summary */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-medium mb-3">Pipeline Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${formData.name ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Basic Info</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${formData.github.repository ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Source Control</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${formData.testingTools.unitTesting || formData.testingTools.integrationTesting || formData.testingTools.e2eTesting ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Testing</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${formData.security.staticAnalysis.enabled || formData.security.dependencyCheck.enabled || formData.security.containerScanning.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Security</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${formData.docker.build ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Containerization</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${formData.continuousDeployment.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm">Deployment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Basic Information Section */}
            {(activeSection === 'basic' || activeSection === '') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200">
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium">1</span>
                    </div>
                    Basic Information
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm placeholder-gray-400"
                      placeholder="e.g., Frontend Production Pipeline"
                    />
                  </div>

                  {/* Organization Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organization ID *</label>
                      <input
                        type="text"
                        name="organization.id"
                        value={formData.organization.id}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="e.g., org_123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
                      <input
                        type="text"
                        name="organization.name"
                        value={formData.organization.name}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="e.g., Acme Corp"
                      />
                    </div>
                  </div>

                  {/* Team Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Team *</label>
                      <select
                        name="team.name"
                        value={formData.team.name}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                      >
                        <option value="development">Development</option>
                        <option value="devops">DevOps</option>
                        <option value="operations">Operations</option>
                        <option value="qa">QA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Team Email *</label>
                      <input
                        type="email"
                        name="team.email"
                        value={formData.team.email}
                        onChange={handleChange}
                        required
                        className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="team@organization.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Environment *</label>
                    <select
                      name="environment"
                      value={formData.environment}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                    >
                      <option value="dev">Development</option>
                      <option value="production">Production</option>
                      <option value="devops">DevOps</option>
                      <option value="qa">QA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline Type</label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'simple'})}
                        className={`px-4 py-3 rounded-lg border ${formData.type === 'simple' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors`}
                      >
                        <div className="font-medium">Simple Pipeline</div>
                        <p className="text-sm text-gray-500 mt-1">Single repository with main branch</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, type: 'multi-branch'})}
                        className={`px-4 py-3 rounded-lg border ${formData.type === 'multi-branch' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'} transition-colors`}
                      >
                        <div className="font-medium">Multi-Branch</div>
                        <p className="text-sm text-gray-500 mt-1">Multiple branches with different configs</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GitHub Configuration Section */}
            {(activeSection === 'github' || activeSection === '') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200">
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <FiGithub className="text-blue-600" />
                    </div>
                    Source Control Configuration
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Credentials *</label>
                    <select
                      name="github.credentialId"
                      value={formData.github.credentialId}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                    >
                      <option value="">Select GitHub Credentials</option>
                      {getCredentialsByType('github').map(cred => (
                        <option key={cred._id} value={cred._id}>{cred.name}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">Select credentials with access to your repository</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Repository *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        github.com/
                      </span>
                      <input
                        type="text"
                        name="github.repository"
                        value={formData.github.repository}
                        onChange={handleChange}
                        required
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="username/repository"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenkinsfile Path</label>
                    <input
                      type="text"
                      name="github.jenkinsfilePath"
                      value={formData.github.jenkinsfilePath}
                      onChange={handleChange}
                      className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="Jenkinsfile"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <input
                      type="text"
                      name="github.branches"
                      value={formData.github.branches}
                      onChange={handleChange}
                      className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="main"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Testing Tools Section */}
            {(activeSection === 'testing' || activeSection === '') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200">
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <FiCode className="text-blue-600" />
                    </div>
                    Testing Configuration
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Test Types</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div 
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${formData.testingTools.unitTesting ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                        onClick={() => setFormData({...formData, testingTools: {...formData.testingTools, unitTesting: !formData.testingTools.unitTesting}})}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="testingTools.unitTesting"
                            checked={formData.testingTools.unitTesting}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 font-medium">Unit Testing</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">Run unit tests for your application</p>
                      </div>
                      <div 
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${formData.testingTools.integrationTesting ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                        onClick={() => setFormData({...formData, testingTools: {...formData.testingTools, integrationTesting: !formData.testingTools.integrationTesting}})}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="testingTools.integrationTesting"
                            checked={formData.testingTools.integrationTesting}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 font-medium">Integration Testing</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">Test integration between components</p>
                      </div>
                      <div 
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${formData.testingTools.e2eTesting ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                        onClick={() => setFormData({...formData, testingTools: {...formData.testingTools, e2eTesting: !formData.testingTools.e2eTesting}})}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="testingTools.e2eTesting"
                            checked={formData.testingTools.e2eTesting}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 font-medium">End-to-End Testing</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">Full system testing from user perspective</p>
                      </div>
                    </div>
                  </div>

                  {formData.testingTools.unitTesting && (
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">Unit Testing Tools</h3>
                      <div className="flex flex-wrap gap-3">
                        {['JUnit', 'Mocha', 'Jest', 'Pytest', 'RSpec'].map(tool => (
                          <button
                            key={tool}
                            type="button"
                            onClick={() => toggleTestingTool(tool)}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${formData.testingTools.selectedTools.includes(tool) ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'}`}
                          >
                            {tool}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Section */}
            {(activeSection === 'security' || activeSection === '') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200">
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <FiLock className="text-blue-600" />
                    </div>
                    Security Analysis
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className={`p-4 rounded-lg border ${formData.security.staticAnalysis.enabled ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="security.staticAnalysis.enabled"
                            checked={formData.security.staticAnalysis.enabled}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 font-medium">Static Code Analysis</span>
                        </div>
                        <p className="mt-1 ml-7 text-sm text-gray-500">Analyze source code for vulnerabilities</p>
                      </div>
                      {formData.security.staticAnalysis.enabled && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Enabled
                        </span>
                      )}
                    </div>
                    {formData.security.staticAnalysis.enabled && (
                      <div className="mt-4 ml-7 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tool</label>
                          <select
                            name="security.staticAnalysis.tool"
                            value={formData.security.staticAnalysis.tool}
                            onChange={handleChange}
                            className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                          >
                            <option value="">Select Tool</option>
                            <option value="sonarqube">SonarQube</option>
                            <option value="coverity">Coverity</option>
                            <option value="snyk">Snyk</option>
                          </select>
                        </div>
                        {formData.security.staticAnalysis.tool && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Credentials</label>
                            <select
                              name="security.staticAnalysis.credentialId"
                              value={formData.security.staticAnalysis.credentialId}
                              onChange={handleChange}
                              className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                            >
                              <option value="">Select Credentials</option>
                              {getCredentialsByType('sonarqube').map(cred => (
                                <option key={cred._id} value={cred._id}>{cred.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={`p-4 rounded-lg border ${formData.security.dependencyCheck.enabled ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="security.dependencyCheck.enabled"
                            checked={formData.security.dependencyCheck.enabled}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 font-medium">Dependency Check</span>
                        </div>
                        <p className="mt-1 ml-7 text-sm text-gray-500">Scan for vulnerable dependencies</p>
                      </div>
                      {formData.security.dependencyCheck.enabled && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Enabled
                        </span>
                      )}
                    </div>
                    {formData.security.dependencyCheck.enabled && (
                      <div className="mt-4 ml-7 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tool</label>
                          <select
                            name="security.dependencyCheck.tool"
                            value={formData.security.dependencyCheck.tool}
                            onChange={handleChange}
                            className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                          >
                            <option value="owasp">OWASP Dependency Check</option>
                            <option value="snyk">Snyk</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Credentials</label>
                          <select
                            name="security.dependencyCheck.credentialId"
                            value={formData.security.dependencyCheck.credentialId}
                            onChange={handleChange}
                            className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                          >
                            <option value="">Select Credentials</option>
                            {getCredentialsByType('dependency-check').map(cred => (
                              <option key={cred._id} value={cred._id}>{cred.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Docker Section */}
            {(activeSection === 'docker' || activeSection === '') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200">
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <FiPackage className="text-blue-600" />
                    </div>
                    Container Configuration
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className={`p-4 rounded-lg border ${formData.docker.build ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="docker.build"
                            checked={formData.docker.build}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 font-medium">Build Docker Image</span>
                        </div>
                        <p className="mt-1 ml-7 text-sm text-gray-500">Create container images from your application</p>
                      </div>
                      {formData.docker.build && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Enabled
                        </span>
                      )}
                    </div>
                    {formData.docker.build && (
                      <div className="mt-4 ml-7 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Build Type</label>
                          <div className="grid grid-cols-3 gap-4">
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, docker: {...formData.docker, buildType: 'frontend'}})}
                              className={`px-4 py-3 rounded-lg border ${formData.docker.buildType === 'frontend' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                            >
                              Frontend
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, docker: {...formData.docker, buildType: 'backend'}})}
                              className={`px-4 py-3 rounded-lg border ${formData.docker.buildType === 'backend' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                            >
                              Backend
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData({...formData, docker: {...formData.docker, buildType: 'both'}})}
                              className={`px-4 py-3 rounded-lg border ${formData.docker.buildType === 'both' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                            >
                              Both
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`p-4 rounded-lg border ${formData.docker.push ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="docker.push"
                            checked={formData.docker.push}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 font-medium">Push to Registry</span>
                        </div>
                        <p className="mt-1 ml-7 text-sm text-gray-500">Upload built images to a container registry</p>
                      </div>
                      {formData.docker.push && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Enabled
                        </span>
                      )}
                    </div>
                    {formData.docker.push && (
                      <div className="mt-4 ml-7 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Registry</label>
                          <div className="grid grid-cols-2 gap-4">
                            {dockerRegistries.map(registry => (
                              <button
                                key={registry.id}
                                type="button"
                                onClick={() => setFormData({...formData, docker: {...formData.docker, registry: registry.id}})}
                                className={`px-4 py-3 rounded-lg border flex items-center ${formData.docker.registry === registry.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                              >
                                <FiCloud className="mr-2" />
                                {registry.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Registry Credentials</label>
                          <select
                            name="docker.credentialId"
                            value={formData.docker.credentialId}
                            onChange={handleChange}
                            className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                          >
                            <option value="">Select Credentials</option>
                            {getCredentialsByType('docker').map(cred => (
                              <option key={cred._id} value={cred._id}>{cred.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Deployment Section */}
            {(activeSection === 'deployment' || activeSection === '') && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200">
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <FiServer className="text-blue-600" />
                    </div>
                    Deployment Configuration
                  </h2>
                </div>
                <div className="p-6">
                  <div className={`p-4 rounded-lg border ${formData.continuousDeployment.enabled ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            name="continuousDeployment.enabled"
                            checked={formData.continuousDeployment.enabled}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 font-medium">Enable Continuous Deployment</span>
                        </div>
                        <p className="mt-1 ml-7 text-sm text-gray-500">Automatically deploy to your infrastructure</p>
                      </div>
                      {formData.continuousDeployment.enabled && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Enabled
                        </span>
                      )}
                    </div>
                    {formData.continuousDeployment.enabled && (
                      <div className="mt-4 ml-7 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Target Platform</label>
                          <div className="grid grid-cols-3 gap-4">
                            {k8sTargets.map(target => (
                              <button
                                key={target.id}
                                type="button"
                                onClick={() => setFormData({...formData, continuousDeployment: {...formData.continuousDeployment, platform: target.id}})}
                                className={`px-4 py-3 rounded-lg border flex items-center ${formData.continuousDeployment.platform === target.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                              >
                                <FiCloud className="mr-2" />
                                {target.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cluster Credentials</label>
                          <select
                            name="continuousDeployment.credentialId"
                            value={formData.continuousDeployment.credentialId}
                            onChange={handleChange}
                            className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                          >
                            <option value="">Select Credentials</option>
                            {getCredentialsByType('kubernetes').map(cred => (
                              <option key={cred._id} value={cred._id}>{cred.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Namespace</label>
                          <input
                            type="text"
                            name="continuousDeployment.namespace"
                            value={formData.continuousDeployment.namespace}
                            onChange={handleChange}
                            className="block w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="default"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePipeline;