import mongoose from 'mongoose';

const pipelineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pipeline name is required'],
    trim: true
  },
  environment: {
    type: String,
    required: [true, 'Environment is required'],
    enum: ['dev', 'production', 'devops', 'qa'],
    default: 'dev'
  },
  type: {
    type: String,
    required: [true, 'Pipeline type is required'],
    enum: ['simple', 'multi-branch'],
    default: 'simple'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'failed'],
    default: 'pending'
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  failedAt: {
    type: Date
  },
  failureReason: {
    type: String
  },
  github: {
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Credential',
      required: true
    },
    repository: {
      type: String,
      required: true
    },
    jenkinsfilePath: {
      type: String,
      default: 'Jenkinsfile'
    },
    branches: {
      type: [String],
      default: ['main']
    }
  },
  testingTools: {
    unitTesting: {
      type: Boolean,
      default: false
    },
    integrationTesting: {
      type: Boolean,
      default: false
    },
    e2eTesting: {
      type: Boolean,
      default: false
    }
  },
  security: {
    staticAnalysis: {
      enabled: {
        type: Boolean,
        default: false
      },
      tools: [{
        type: String,
        enum: ['sonarqube', 'coverity', 'snyk', 'owasp']
      }],
      credentialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Credential',
        default: null
      }
    },
    dependencyCheck: {
      enabled: {
        type: Boolean,
        default: false
      },
      tool: {
        type: String,
        enum: ['owasp', null],
        default: null
      },
      credentialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Credential',
        default: null
      }
    },
    containerScanning: {
      enabled: {
        type: Boolean,
        default: false
      },
      tools: [{
        type: String,
        enum: ['anchore', 'aqua', 'clair']
      }],
      credentialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Credential',
        default: null
      }
    }
  },
  docker: {
    buildType: {
      type: String,
      enum: ['image', 'compose', 'both'],
      default: 'both'
    },
    registry: {
      type: String,
      enum: ['dockerhub', 'azure', 'gcp'],
      default: 'dockerhub'
    },
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Credential',
      default: null
    }
  },
  continuousDeployment: {
    enabled: {
      type: Boolean,
      default: false
    },
    platform: {
      type: String,
      enum: ['aws-eks', 'azure-aks', 'gcp-gke', null],
      default: null
    },
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Credential',
      default: null
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
pipelineSchema.index({ createdBy: 1, status: 1 });
pipelineSchema.index({ startedAt: 1 });
pipelineSchema.index({ completedAt: 1 });
pipelineSchema.index({ failedAt: 1 });

export default mongoose.model('Pipeline', pipelineSchema); 