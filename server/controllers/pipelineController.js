import Pipeline from '../models/Pipeline.js';
import Credential from '../models/Credential.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import PipelineActivity from '../models/PipelineActivity.js';

// Get all pipelines with optional status filter
export const getPipelines = async (req, res) => {
  try {
    const { status, team } = req.query;
    const query = { orgId: req.user.orgId };
    
    // If team is specified, filter by team
    if (team) {
      query['team.name'] = team;
    }
    
    if (status) {
      query.status = status;
    }

    const pipelines = await Pipeline.find(query)
      .populate('github.credentialId')
      .populate('docker.credentialId')
      .populate('aws.credentialId')
      .populate('sonarqube.credentialId')
      .populate('kubernetes.credentialId')
      .populate('createdBy', 'email name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pipelines
    });
  } catch (error) {
    console.error('Error getting pipelines:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pipelines',
      error: error.message
    });
  }
};

// Get a single pipeline
export const getPipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.findOne({
      _id: req.params.id,
      orgId: req.user.orgId
    })
      .populate('github.credentialId')
      .populate('docker.credentialId')
      .populate('aws.credentialId')
      .populate('sonarqube.credentialId')
      .populate('kubernetes.credentialId')
      .populate('createdBy', 'email name');

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    res.json({
      success: true,
      data: pipeline
    });
  } catch (error) {
    console.error('Error getting pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pipeline',
      error: error.message
    });
  }
};

// Create a new pipeline
export const createPipeline = async (req, res) => {
  try {
    const {
      name,
      type,
      github,
      docker,
      aws,
      sonarqube,
      kubernetes
    } = req.body;

    // Get orgId from token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const orgId = decoded.orgId;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID not found in token'
      });
    }

    // Validate required fields
    if (!name || !type || !github) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate GitHub fields
    if (!github.credentialId || !github.repository || !github.branches) {
      return res.status(400).json({
        success: false,
        message: 'GitHub credential, repository, and branches are required'
      });
    }

    // Get user details to set team information
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify that the GitHub credential exists
    const githubCredential = await Credential.findById(github.credentialId);
    if (!githubCredential) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GitHub credential'
      });
    }

    // Verify other credentials if provided
    if (docker?.credentialId) {
      const dockerCredential = await Credential.findById(docker.credentialId);
      if (!dockerCredential) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Docker credential'
        });
      }
    }

    if (aws?.credentialId) {
      const awsCredential = await Credential.findById(aws.credentialId);
      if (!awsCredential) {
        return res.status(400).json({
          success: false,
          message: 'Invalid AWS credential'
        });
      }
    }

    if (sonarqube?.credentialId) {
      const sonarqubeCredential = await Credential.findById(sonarqube.credentialId);
      if (!sonarqubeCredential) {
        return res.status(400).json({
          success: false,
          message: 'Invalid SonarQube credential'
        });
      }
    }

    if (kubernetes?.credentialId) {
      const kubernetesCredential = await Credential.findById(kubernetes.credentialId);
      if (!kubernetesCredential) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Kubernetes credential'
      });
      }
    }

    // Create the pipeline with team information from user
    const pipelineData = {
      name,
      type,
      orgId,
      team: {
        name: user.team,
        email: user.email
      },
      github,
      createdBy: req.user._id,
    };

    // Only add optional credentials if they are provided
    if (docker?.credentialId) {
      pipelineData.docker = docker;
    }
    if (aws?.credentialId) {
      pipelineData.aws = aws;
    }
    if (sonarqube?.credentialId) {
      pipelineData.sonarqube = sonarqube;
    }
    if (kubernetes?.credentialId) {
      pipelineData.kubernetes = kubernetes;
    }

    const pipeline = new Pipeline(pipelineData);
    await pipeline.save();

    res.status(201).json({
      success: true,
      message: 'Pipeline created successfully',
      data: pipeline
    });
  } catch (error) {
    console.error('Error creating pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pipeline',
      error: error.message
    });
  }
};

// Update a pipeline
export const updatePipeline = async (req, res) => {
  try {
    const {
      name,
      type,
      github,
      docker,
      aws,
      sonarqube,
      kubernetes
    } = req.body;

    const pipeline = await Pipeline.findById(req.params.id);

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    // Update fields
    if (name) pipeline.name = name;
    if (type) pipeline.type = type;
    if (github) pipeline.github = github;
    if (docker) pipeline.docker = docker;
    if (aws) pipeline.aws = aws;
    if (sonarqube) pipeline.sonarqube = sonarqube;
    if (kubernetes) pipeline.kubernetes = kubernetes;

    await pipeline.save();

    res.json({
      success: true,
      message: 'Pipeline updated successfully',
      data: pipeline
    });
  } catch (error) {
    console.error('Error updating pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pipeline',
      error: error.message
    });
  }
};

// Delete a pipeline
export const deletePipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.findById(req.params.id);

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    await pipeline.remove();

    res.json({
      success: true,
      message: 'Pipeline deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pipeline',
      error: error.message
    });
  }
};

// Get pipeline statistics
export const getPipelineStats = async (req, res) => {
  try {
    const totalPipelines = await Pipeline.countDocuments({ orgId: req.user.orgId });
    const activePipelines = await Pipeline.countDocuments({ 
      orgId: req.user.orgId,
      status: 'active' 
    });
    const createdPipelines = await Pipeline.countDocuments({ 
      orgId: req.user.orgId,
      status: 'created' 
    });
    const completedPipelines = await Pipeline.countDocuments({ 
      orgId: req.user.orgId,
      status: 'completed' 
    });
    const failedPipelines = await Pipeline.countDocuments({ 
      orgId: req.user.orgId,
      status: 'failed' 
    });

    res.json({
      success: true,
      stats: {
        created: createdPipelines,
        total: totalPipelines,
        active: activePipelines,
        completed: completedPipelines,
        failed: failedPipelines
      }
    });
  } catch (error) {
    console.error('Error getting pipeline stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pipeline statistics'
    });
  }
};

// Start a pipeline
export const startPipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.findOne({
      _id: req.params.id,
      orgId: req.user.orgId
    });

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    // If pipeline is already active, mark it as failed
    if (pipeline.status === 'active') {
      pipeline.status = 'failed';
      pipeline.failedAt = new Date();
      pipeline.failureReason = 'Pipeline was restarted while active';
      await pipeline.save();

      // Create activity record for failed pipeline
      await PipelineActivity.create({
        pipelineName: pipeline.name,
        pipelineId: pipeline._id,
        team: pipeline.team,
        triggeredBy: {
          userId: req.user._id,
          name: req.user.fullName,
          email: req.user.email
        },
        triggerDate: new Date(),
        startTime: new Date(),
        completionTime: new Date(),
        state: 'failed',
        failureReason: 'Pipeline was restarted while active',
        orgId: pipeline.orgId
      });

      return res.status(400).json({
        success: false,
        message: 'Pipeline was restarted while active and has been marked as failed'
      });
    }

    // Update pipeline status to active
    pipeline.status = 'active';
    pipeline.startedAt = new Date();
    await pipeline.save();

    // Create activity record for started pipeline
    const activity = await PipelineActivity.create({
      pipelineName: pipeline.name,
      pipelineId: pipeline._id,
      team: pipeline.team,
      triggeredBy: {
        userId: req.user._id,
        name: req.user.fullName,
        email: req.user.email
      },
      triggerDate: new Date(),
      startTime: new Date(),
      state: 'success',
      orgId: pipeline.orgId
    });

    // Simulate pipeline completion after 30 seconds
    setTimeout(async () => {
      try {
        const updatedPipeline = await Pipeline.findById(pipeline._id);
        if (updatedPipeline && updatedPipeline.status === 'active') {
          updatedPipeline.status = 'completed';
          updatedPipeline.completedAt = new Date();
          await updatedPipeline.save();

          // Update activity record with completion time
          activity.completionTime = new Date();
          await activity.save();
        }
      } catch (error) {
        console.error('Error completing pipeline:', error);
      }
    }, 30000);

    res.json({
      success: true,
      message: 'Pipeline started successfully',
      data: pipeline
    });
  } catch (error) {
    console.error('Error starting pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start pipeline',
      error: error.message
    });
  }
};

// Complete a pipeline
export const completePipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.findOne({
      _id: req.params.id,
      orgId: req.user.orgId
    });

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    if (pipeline.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Pipeline is not active'
      });
    }

    pipeline.status = 'completed';
    pipeline.completedAt = new Date();
    await pipeline.save();

    res.json({
      success: true,
      message: 'Pipeline completed successfully',
      data: pipeline
    });
  } catch (error) {
    console.error('Error completing pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete pipeline'
    });
  }
};