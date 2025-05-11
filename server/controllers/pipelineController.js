import Pipeline from '../models/Pipeline.js';
import Credential from '../models/Credential.js';

// Get all pipelines with optional status filter
export const getPipelines = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { createdBy: req.user.id };
    
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
      createdBy: req.user.id
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
      environment,
      type,
      organization,
      team,
      github,
      docker,
      aws,
      sonarqube,
      kubernetes
    } = req.body;

    // Validate required fields
    if (!name || !environment || !type || !organization || !team || !github) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate organization fields
    if (!organization.id || !organization.name) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID and name are required'
      });
    }

    // Validate team fields
    if (!team.name || !team.email) {
      return res.status(400).json({
        success: false,
        message: 'Team name and email are required'
      });
    }

    // Validate GitHub fields
    if (!github.credentialId || !github.repository || !github.branches) {
      return res.status(400).json({
        success: false,
        message: 'GitHub credential, repository, and branches are required'
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

    // Create the pipeline
    const pipeline = new Pipeline({
      name,
      environment,
      type,
      organization,
      team,
      github,
      docker,
      aws,
      sonarqube,
      kubernetes,
      createdBy: req.user._id,
    });

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
      environment,
      type,
      organization,
      team,
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
    if (environment) pipeline.environment = environment;
    if (type) pipeline.type = type;
    if (organization) pipeline.organization = organization;
    if (team) pipeline.team = team;
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
    const totalPipelines = await Pipeline.countDocuments({ createdBy: req.user.id });
    const activePipelines = await Pipeline.countDocuments({ 
      createdBy: req.user.id,
      status: 'active' 
    });
    const createdPipelines = await Pipeline.countDocuments({ 
      createdBy: req.user.id,
      status: 'created' 
    });
    const completedPipelines = await Pipeline.countDocuments({ 
      createdBy: req.user.id,
      status: 'completed' 
    });
    const failedPipelines = await Pipeline.countDocuments({ 
      createdBy: req.user.id,
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
      createdBy: req.user.id
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

      return res.status(400).json({
        success: false,
        message: 'Pipeline was restarted while active and has been marked as failed'
      });
    }

    // Start the pipeline
    pipeline.status = 'active';
    pipeline.startedAt = new Date();
    await pipeline.save();

    // Simulate pipeline completion after 30 seconds
    setTimeout(async () => {
      try {
        const updatedPipeline = await Pipeline.findById(pipeline._id);
        if (updatedPipeline && updatedPipeline.status === 'active') {
          updatedPipeline.status = 'completed';
          updatedPipeline.completedAt = new Date();
          await updatedPipeline.save();
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
      message: 'Failed to start pipeline'
    });
  }
};

// Complete a pipeline
export const completePipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.findOne({
      _id: req.params.id,
      createdBy: req.user.id
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