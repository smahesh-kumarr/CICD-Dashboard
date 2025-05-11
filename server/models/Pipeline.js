import mongoose from 'mongoose';

const pipelineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pipeline name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Pipeline type is required'],
    enum: ['simple', 'multi-branch'],
    default: 'simple'
  },
  orgId: { type: String, required: true},
  team: {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      enum: ['dev', 'devops', 'operations', 'qa']
    },
    email: {
      type: String,
      required: [true, 'Team email is required'],
      trim: true,
      lowercase: true
    }
  },
  status: {
    type: String,
    enum: ['created', 'active', 'completed', 'failed'],
    default: 'created'
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
      required: true,
      trim: true
    },
    jenkinsfilePath: {
      type: String,
      required: true,
      default: 'Jenkinsfile'
    },
    branches: [{
      type: String,
      required: true
    }]
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
    },
    imageName: {
      type: String,
      trim: true
    },
    tag: {
      type: String,
      trim: true
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
  aws: {
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Credential'
    },
    region: {
      type: String,
      trim: true
    },
    service: {
      type: String,
      trim: true
    }
  },
  sonarqube: {
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Credential'
    },
    projectKey: {
      type: String,
      trim: true
    }
  },
  kubernetes: {
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Credential'
    },
    namespace: {
      type: String,
      trim: true
    },
    cluster: {
      type: String,
      trim: true
    }
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
  }
}, {
  timestamps: true
});

// Index for faster queries
pipelineSchema.index({ createdBy: 1, status: 1 });
pipelineSchema.index({ startedAt: 1 });
pipelineSchema.index({ completedAt: 1 });
pipelineSchema.index({ failedAt: 1 });
pipelineSchema.index({ 'organization.id': 1 });

export default mongoose.model('Pipeline', pipelineSchema); 