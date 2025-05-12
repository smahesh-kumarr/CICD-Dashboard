import mongoose from 'mongoose';

const pipelineActivitySchema = new mongoose.Schema({
  pipelineName: {
    type: String,
    required: [true, 'Pipeline name is required'],
    trim: true
  },
  pipelineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pipeline',
    required: true
  },
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
  triggeredBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  triggerDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  completionTime: {
    type: Date
  },
  state: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  failureReason: {
    type: String
  },
  orgId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const PipelineActivity = mongoose.model('PipelineActivity', pipelineActivitySchema);

export default PipelineActivity;