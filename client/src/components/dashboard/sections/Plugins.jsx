import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Plugins = () => {
  const navigate = useNavigate();
  
  // Plugin categories and their respective tools
  const pluginCategories = [
    {
      name: "CI/CD Tools",
      plugins: [
        {
          id: "github",
          name: "GitHub Integration",
          officialPlugin: "GitHub Integration",
          logo: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
          description: "Integrate your Jenkins pipelines with GitHub repositories"
        },
        {
          id: "docker",
          name: "Docker",
          officialPlugin: "Docker Pipeline",
          logo: "https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png",
          description: "Build and use Docker containers in Jenkins Pipeline"
        },
        {
          id: "kubernetes",
          name: "Kubernetes",
          officialPlugin: "Kubernetes CLI",
          logo: "https://kubernetes.io/images/favicon.png",
          description: "Deploy to Kubernetes clusters from your Jenkins pipeline"
        },
        {
          id: "aws-ecr",
          name: "AWS ECR",
          officialPlugin: "Amazon ECR",
          logo: "https://d1.awsstatic.com/icons/jp/AWS-page-icon_ECR.bca5849aaee7462b06e84eb068ebc55e9b9f1bd6.png",
          description: "Push/pull Docker images to/from Amazon ECR"
        },
        {
          id: "acr",
          name: "Azure Container Registry",
          officialPlugin: "Azure Container Registry Tasks",
          logo: "https://azurecomcdn.azureedge.net/cvt-1fb34a29d79f3a04366a147935108ae0cb585ce273654e416b037f5b87772440/images/page/services/container-registry/container-registry.svg",
          description: "Integrate Jenkins with Azure Container Registry"
        }
      ]
    },
    {
      name: "Code Analysis",
      plugins: [
        {
          id: "sonarqube",
          name: "SonarQube",
          officialPlugin: "SonarQube Scanner",
          logo: "https://www.sonarqube.org/assets/logo-31ad3115b1b4b120f3d1efd63e6b13ac9f1f89437f0cf6881cc4d8b5603a52b4.svg",
          description: "Analyze code quality with SonarQube integration"
        },
        {
          id: "coverity",
          name: "Coverity",
          officialPlugin: "Coverity",
          logo: "https://www.synopsys.com/content/dam/synopsys/sig-assets/images/coverity.svg.imgo.svg",
          description: "Find and fix defects and vulnerabilities in your code"
        },
        {
          id: "codacy",
          name: "Codacy",
          officialPlugin: "Codacy",
          logo: "https://docs.codacy.com/assets/images/codacy-logo.svg",
          description: "Automated code reviews & code analytics"
        }
      ]
    },
    {
      name: "GitOps",
      plugins: [
        {
          id: "argocd",
          name: "ArgoCD",
          officialPlugin: "Argo CD",
          logo: "https://argo-cd.readthedocs.io/en/stable/assets/logo.png",
          description: "Declarative, GitOps continuous delivery for Kubernetes"
        },
        {
          id: "spinnaker",
          name: "Spinnaker",
          officialPlugin: "Spinnaker",
          logo: "https://spinnaker.io/images/logo-spinnaker.png",
          description: "Multi-cloud continuous delivery platform"
        },
        {
          id: "fluxcd",
          name: "Flux CD",
          officialPlugin: "Flux CD",
          logo: "https://fluxcd.io/img/logos/flux-stacked-color.png",
          description: "Open and extensible continuous delivery solution for Kubernetes"
        }
      ]
    },
    {
      name: "Cloud Providers",
      plugins: [
        {
          id: "aws-eks",
          name: "AWS EKS",
          officialPlugin: "Amazon EKS",
          logo: "https://d1.awsstatic.com/icons/aws-icons-v2/Amazon-Elastic-Kubernetes-Service_64.png",
          description: "Deploy to Amazon Elastic Kubernetes Service"
        },
        {
          id: "azure-aks",
          name: "Azure AKS",
          officialPlugin: "Azure Kubernetes Service",
          logo: "https://azurecomcdn.azureedge.net/cvt-1fb34a29d79f3a04366a147935108ae0cb585ce273654e416b037f5b87772440/images/page/services/kubernetes-service/kubernetes-service.svg",
          description: "Deploy to Azure Kubernetes Service"
        },
        {
          id: "gcp-gke",
          name: "GCP GKE",
          officialPlugin: "Google Kubernetes Engine",
          logo: "https://www.gstatic.com/devrel-devsite/prod/vdbc400b97a86c8815ab6ee057e8dc91626aee8cf89b10f7d89037e5a33539f53/cloud/images/favicons/onecloud/favicon.ico",
          description: "Deploy to Google Kubernetes Engine"
        }
      ]
    },
    {
      name: "Other",
      plugins: [
        {
          id: "docker-hub",
          name: "Docker Hub",
          officialPlugin: "Docker Hub Notification",
          logo: "https://www.docker.com/wp-content/uploads/2022/03/horizontal-logo-monochromatic-white.png",
          description: "Integrate with Docker Hub"
        },
        {
          id: "ghcr",
          name: "GitHub Container Registry",
          officialPlugin: "GitHub Container Registry",
          logo: "https://github.githubassets.com/images/modules/site/features/packages-container.svg",
          description: "Publish and use container images from GitHub"
        }
      ]
    }
  ];

  const handlePluginClick = (category, plugin) => {
    navigate(`/dashboard/plugins/${plugin.id}`, { 
      state: { 
        plugin,
        category
      } 
    });
  };

  return (
    <div className="text-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Jenkins Plugins & Tools</h2>
        <p className="text-blue-200">Integrate your CI/CD pipeline with these powerful tools</p>
      </div>

      {pluginCategories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-10">
          <h3 className="text-xl font-semibold text-white mb-4 border-b border-blue-500 pb-2">
            {category.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.plugins.map((plugin, pluginIndex) => (
              <div 
                key={pluginIndex}
                onClick={() => handlePluginClick(category.name, plugin)}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-blue-800/50 hover:border-blue-500 cursor-pointer transition-all duration-300 flex flex-col h-full transform hover:scale-102 hover:shadow-lg"
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 mr-3 bg-white rounded-lg p-1 flex items-center justify-center overflow-hidden">
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
                    <h4 className="font-bold">{plugin.name}</h4>
                    <p className="text-xs text-blue-300">{plugin.officialPlugin}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 flex-grow">
                  {plugin.description}
                </p>
                <div className="mt-4 flex justify-end">
                  <span className="text-xs px-2 py-1 rounded bg-blue-900/50 text-blue-200">
                    View Details
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Plugins; 