import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExternalLinkAlt, FaPuzzlePiece, FaCode, FaFileCode, FaBook, FaLink } from 'react-icons/fa';

const PluginDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { plugin, category } = location.state || {};

  // Documentation URLs for each plugin
  const documentationUrls = {
    // CI/CD Tools
    github: "https://plugins.jenkins.io/github/",
    docker: "https://plugins.jenkins.io/docker-workflow/",
    kubernetes: "https://plugins.jenkins.io/kubernetes/",
    "aws-ecr": "https://plugins.jenkins.io/amazon-ecr/",
    acr: "https://plugins.jenkins.io/azure-container-registry-tasks/",
    
    // Code Analysis
    sonarqube: "https://plugins.jenkins.io/sonarqube/",
    coverity: "https://plugins.jenkins.io/coverity/",
    codacy: "https://plugins.jenkins.io/codacy/",
    
    // GitOps
    argocd: "https://plugins.jenkins.io/argo-cd/",
    spinnaker: "https://plugins.jenkins.io/spinnaker/",
    fluxcd: "https://plugins.jenkins.io/fluxcd/",
    
    // Cloud Providers
    "aws-eks": "https://plugins.jenkins.io/eks-cluster/",
    "azure-aks": "https://plugins.jenkins.io/azure-aks/",
    "gcp-gke": "https://plugins.jenkins.io/google-kubernetes-engine/",
    
    // Other
    "docker-hub": "https://plugins.jenkins.io/dockerhub-notification/",
    ghcr: "https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry"
  };

  // Get documentation URL for the current plugin
  const getDocumentationUrl = () => {
    return documentationUrls[id] || `https://plugins.jenkins.io/search/?query=${encodeURIComponent(plugin?.officialPlugin || "")}`;
  };

  // Code examples for different plugins
  const codeExamples = {
    // CI/CD Tools
    github: {
      jenkinsfile: `
pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
  }
}`,
      react: `
// In your React component
import { useEffect, useState } from 'react';

function GitHubIntegration() {
  const [repos, setRepos] = useState([]);
  
  useEffect(() => {
    // Fetch repos from your API that connects to GitHub
    fetch('/api/github/repos')
      .then(res => res.json())
      .then(data => setRepos(data));
  }, []);

  return (
    <div>
      <h2>GitHub Repositories</h2>
      <ul>
        {repos.map(repo => (
          <li key={repo.id}>{repo.name}</li>
        ))}
      </ul>
    </div>
  );
}`
    },
    docker: {
      jenkinsfile: `
pipeline {
  agent {
    docker { 
      image 'node:16-alpine' 
    }
  }
  stages {
    stage('Build') {
      steps {
        sh 'npm install'
        sh 'npm run build'
      }
    }
  }
}`,
      react: `
// Docker integration component
function DockerStatus() {
  const [containers, setContainers] = useState([]);
  
  useEffect(() => {
    // Fetch container stats from your API
    fetch('/api/docker/containers')
      .then(res => res.json())
      .then(data => setContainers(data));
  }, []);

  return (
    <div className="docker-dashboard">
      <h3>Running Containers</h3>
      <div className="container-list">
        {containers.map(container => (
          <div key={container.id} className="container-item">
            <span>{container.name}</span>
            <span className="status">{container.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`
    },
    kubernetes: {
      jenkinsfile: `
pipeline {
  agent {
    kubernetes {
      yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: node
    image: node:16-alpine
    command:
    - cat
    tty: true
"""
    }
  }
  stages {
    stage('Build and Test') {
      steps {
        container('node') {
          sh 'npm install'
          sh 'npm test'
        }
      }
    }
  }
}`,
      react: `
// Kubernetes Pods component
function KubernetesPods() {
  const [pods, setPods] = useState([]);
  
  useEffect(() => {
    // Fetch pods from your K8s API
    fetch('/api/kubernetes/pods')
      .then(res => res.json())
      .then(data => setPods(data));
  }, []);

  return (
    <div className="k8s-dashboard">
      <h3>Kubernetes Pods</h3>
      <table className="pods-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Namespace</th>
          </tr>
        </thead>
        <tbody>
          {pods.map(pod => (
            <tr key={pod.name}>
              <td>{pod.name}</td>
              <td className={pod.status}>{pod.status}</td>
              <td>{pod.namespace}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`
    },
    // Code Analysis
    sonarqube: {
      jenkinsfile: `
pipeline {
  agent any
  stages {
    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('SonarQube') {
          sh 'npm install'
          sh 'npm run sonar'
        }
      }
    }
    stage("Quality Gate") {
      steps {
        timeout(time: 1, unit: 'HOURS') {
          waitForQualityGate abortPipeline: true
        }
      }
    }
  }
}`,
      react: `
// SonarQube Analysis Results component
function SonarQubeMetrics() {
  const [metrics, setMetrics] = useState(null);
  
  useEffect(() => {
    fetch('/api/sonarqube/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data));
  }, []);

  if (!metrics) return <div>Loading SonarQube metrics...</div>;

  return (
    <div className="sonarqube-card">
      <h3>Code Quality</h3>
      <div className="metrics-grid">
        <div className="metric">
          <h4>Bugs</h4>
          <span className={metrics.bugs > 0 ? "text-red" : "text-green"}>
            {metrics.bugs}
          </span>
        </div>
        <div className="metric">
          <h4>Code Coverage</h4>
          <span>{metrics.coverage}%</span>
        </div>
        <div className="metric">
          <h4>Code Smells</h4>
          <span>{metrics.codeSmells}</span>
        </div>
      </div>
    </div>
  );
}`
    }
  };

  // Default code examples for plugins without specific examples
  const defaultCodeExamples = {
    jenkinsfile: `
pipeline {
  agent any
  stages {
    stage('Integration') {
      steps {
        // Add your integration steps here
        echo 'Integrating with ${plugin?.name || "Plugin"}'
      }
    }
  }
}`,
    react: `
// ${plugin?.name || "Plugin"} integration component
import React, { useState, useEffect } from 'react';

function ${(plugin?.id || "Plugin").replace(/-/g, "_").replace(/^[a-z]/, (match) => match.toUpperCase())}Integration() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch data from your API that connects to ${plugin?.name || "the service"}
    fetch('/api/${plugin?.id || "service"}/data')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="integration-panel">
      <h3>${plugin?.name || "Plugin"} Integration</h3>
      {data ? (
        <div className="data-display">
          {/* Display your data here */}
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
}`
  };

  // Get code examples for the current plugin
  const getCodeExamples = () => {
    const pluginExamples = codeExamples[id];
    return {
      jenkinsfile: (pluginExamples?.jenkinsfile || defaultCodeExamples.jenkinsfile).trim(),
      react: (pluginExamples?.react || defaultCodeExamples.react).trim()
    };
  };

  const [activeTab, setActiveTab] = useState('jenkinsfile');
  
  const examples = getCodeExamples();

  if (!plugin) {
    return (
      <div className="text-white p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-blue-300 hover:text-blue-100 mr-4 flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </button>
        </div>
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p>Plugin information not found. Please go back and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-blue-300 hover:text-blue-100 mr-4 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        <h2 className="text-2xl font-bold">{plugin.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Plugin Info Card */}
        <div className="col-span-1 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 mr-4 bg-white rounded-lg p-2 flex items-center justify-center">
              <img 
                src={plugin.logo} 
                alt={`${plugin.name} logo`} 
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://www.jenkins.io/images/logos/jenkins/jenkins.png";
                }}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold">{plugin.name}</h3>
              <p className="text-sm text-blue-300">
                <FaPuzzlePiece className="inline mr-1" />
                {plugin.officialPlugin}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Category</h4>
            <p className="text-blue-200 mb-4">{category}</p>
            
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-gray-300 mb-4">{plugin.description}</p>
            
            <div className="space-y-2 mt-6">
              <a 
                href={getDocumentationUrl()}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-100 inline-flex items-center bg-blue-900/30 px-4 py-2 rounded-md w-full"
              >
                <FaBook className="mr-2" /> Official Documentation
                <FaExternalLinkAlt className="ml-auto text-xs" />
              </a>
              
              <a 
                href={`https://plugins.jenkins.io/search/?query=${encodeURIComponent(plugin.officialPlugin)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-100 inline-flex items-center bg-blue-900/30 px-4 py-2 rounded-md w-full"
              >
                <FaLink className="mr-2" /> Jenkins Plugin Marketplace
                <FaExternalLinkAlt className="ml-auto text-xs" />
              </a>
            </div>
          </div>
        </div>

        {/* Code Examples Section */}
        <div className="col-span-1 lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4">Integration Examples</h3>
          
          {/* Tabs */}
          <div className="flex mb-4 border-b border-blue-800">
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'jenkinsfile' ? 'text-blue-300 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('jenkinsfile')}
            >
              <FaFileCode className="inline mr-2" />
              Jenkinsfile
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'react' ? 'text-blue-300 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('react')}
            >
              <FaCode className="inline mr-2" />
              React Component
            </button>
          </div>
          
          {/* Code Block */}
          <div className="relative">
            <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm text-gray-200">
              <code>{examples[activeTab]}</code>
            </pre>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(examples[activeTab]);
              }}
              className="absolute top-2 right-2 bg-blue-800 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-4">Getting Started</h3>
        <p className="mb-3">To integrate {plugin.name} with Jenkins, follow these steps:</p>
        
        <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-6">
          <li>Install the {plugin.officialPlugin} plugin from the Jenkins Plugin Manager</li>
          <li>Configure the plugin in Jenkins system configuration</li>
          <li>Add the appropriate steps to your Jenkinsfile as shown in the example above</li>
          <li>Use the React component example to display integration results in your dashboard</li>
        </ol>
        
        <p className="text-sm text-gray-400">
          Note: Exact configuration steps may vary depending on your Jenkins setup and version.
          Always refer to the official documentation for the most up-to-date information.
        </p>
      </div>
    </div>
  );
};

export default PluginDetail; 