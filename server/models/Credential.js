import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Credential name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: [
      'github',
      'docker',
      'aws',
      'azure',
      'gcp',
      'sonarqube',
      'coverity',
      'snyk',
      'owasp',
      'anchore',
      'aqua',
      'clair',
      'aws-eks',
      'azure-aks',
      'gcp-gke',
      'jenkins',
      'kubernetes'
    ],
    required: [true, 'Credential type is required']
  },
  credentials: {
    // GitHub
    token: String,
    
    // Docker Registry
    username: String,
    password: String,
    registryUrl: String,
    
    // AWS
    accessKeyId: String,
    secretAccessKey: String,
    region: String,
    
    // Azure
    clientId: String,
    clientSecret: String,
    tenantId: String,
    
    // GCP
    projectId: String,
    serviceAccountKey: String,
    
    // SonarQube
    url: String,
    
    // Coverity
    url: String,
    
    // Snyk
    token: String,
    
    // OWASP
    url: String,
    apiKey: String,
    
    // Container Scanning Tools
    url: String,
    
    // AWS EKS
    clusterName: String,
    
    // Azure AKS
    resourceGroup: String,
    subscriptionId: String,
    
    // GCP GKE
    zone: String,
    
    // Jenkins
    username: String,
    
    // Kubernetes
    endpoint: String,
    caCert: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  orgId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Update the updatedAt field before saving
credentialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Credential = mongoose.model('Credential', credentialSchema);

export default Credential; 