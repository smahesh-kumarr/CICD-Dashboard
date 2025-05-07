import Pipeline from '../models/Pipeline.js';

// Get all pipelines with optional status filter
export const getPipelines = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { createdBy: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const pipelines = await Pipeline.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pipelines
    });
  } catch (error) {
    console.error('Error getting pipelines:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pipelines'
    });
  }
};

// Get a single pipeline
export const getPipeline = async (req, res) => {
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

    res.json({
      success: true,
      data: pipeline
    });
  } catch (error) {
    console.error('Error getting pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pipeline'
    });
  }
};

// Create a new pipeline
export const createPipeline = async (req, res) => {
  try {
    const {
      name,
      environment = 'dev',
      type = 'simple',
      github,
      testingTools,
      security,
      docker,
      continuousDeployment
    } = req.body;

    // Validate required fields
    if (!name || !github || !github.credentialId || !github.repository) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, github credentials, and repository are required'
      });
    }

    // Create pipeline data with proper structure
    const pipelineData = {
      name,
      environment,
      type,
      github: {
        credentialId: github.credentialId,
        repository: github.repository,
        jenkinsfilePath: github.jenkinsfilePath || 'Jenkinsfile',
        branches: github.branches || ['main']
      },
      testingTools: {
        unitTesting: testingTools?.unitTesting || false,
        integrationTesting: testingTools?.integrationTesting || false,
        e2eTesting: testingTools?.e2eTesting || false
      },
      security: {
        staticAnalysis: {
          enabled: security?.staticAnalysis?.enabled || false,
          tools: security?.staticAnalysis?.tools || [],
          credentialId: security?.staticAnalysis?.credentialId || null
        },
        dependencyCheck: {
          enabled: security?.dependencyCheck?.enabled || false,
          tool: security?.dependencyCheck?.tool || null,
          credentialId: security?.dependencyCheck?.credentialId || null
        },
        containerScanning: {
          enabled: security?.containerScanning?.enabled || false,
          tools: security?.containerScanning?.tools || [],
          credentialId: security?.containerScanning?.credentialId || null
        }
      },
      docker: {
        buildType: docker?.buildType || 'both',
        registry: docker?.registry || 'dockerhub',
        credentialId: docker?.credentialId || null
      },
      continuousDeployment: {
        enabled: continuousDeployment?.enabled || false,
        platform: continuousDeployment?.platform || null,
        credentialId: continuousDeployment?.credentialId || null
      },
      createdBy: req.user.id
    };

    const pipeline = await Pipeline.create(pipelineData);

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
    const pipeline = await Pipeline.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

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
    console.error('Error updating pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pipeline'
    });
  }
};

// Delete a pipeline
export const deletePipeline = async (req, res) => {
  try {
    const pipeline = await Pipeline.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }

    res.json({
      success: true,
      message: 'Pipeline deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pipeline'
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

    // Check if pipeline is already running
    if (pipeline.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Pipeline is already running'
      });
    }

    // Check for any other active pipelines
    const activePipelines = await Pipeline.find({
      status: 'active',
      _id: { $ne: pipeline._id },
      createdBy: req.user.id
    });

    if (activePipelines.length > 0) {
      // Mark the pipeline as failed due to conflict
      pipeline.status = 'failed';
      pipeline.failedAt = new Date();
      pipeline.failureReason = 'Another pipeline is currently running';
      await pipeline.save();

      return res.status(400).json({
        success: false,
        message: 'Another pipeline is currently running. This pipeline has been marked as failed.'
      });
    }

    // Start the pipeline
    pipeline.status = 'active';
    pipeline.startedAt = new Date();
    await pipeline.save();

    // Simulate pipeline completion after 35 seconds
    setTimeout(async () => {
      try {
        const updatedPipeline = await Pipeline.findById(pipeline._id);
        if (updatedPipeline && updatedPipeline.status === 'active') {
          // Check if any other pipeline has started in the meantime
          const otherActivePipelines = await Pipeline.find({
            status: 'active',
            _id: { $ne: pipeline._id },
            createdBy: req.user.id
          });

          if (otherActivePipelines.length > 0) {
            // Mark this pipeline as failed due to conflict
            updatedPipeline.status = 'failed';
            updatedPipeline.failedAt = new Date();
            updatedPipeline.failureReason = 'Another pipeline was started before completion';
          } else {
            // Complete the pipeline
            updatedPipeline.status = 'completed';
            updatedPipeline.completedAt = new Date();
          }
          await updatedPipeline.save();
        }
      } catch (error) {
        console.error('Error completing pipeline:', error);
      }
    }, 35000);

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