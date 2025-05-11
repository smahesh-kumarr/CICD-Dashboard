import Pipeline from '../models/Pipeline.js';

// Define team permissions
const teamPermissions = {
  dev: {
    dev: ['run', 'delete'],
    devops: ['run', 'delete'],
    operations: ['run'],
    qa: ['view']
  },
  operations: {
    operations: ['run', 'delete'],
    devops: ['run'],
    qa: ['view']
  },
  devops: {
    devops: ['run', 'delete'],
    operations: ['run'],
    qa: ['view']
  },
  qa: {
    qa: ['view'],
    dev: ['view'],
    devops: ['view'],
    operations: ['view']
  }
};

export const checkPipelineAccess = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const pipelineId = req.params.id;
      const userTeam = req.user.team;
      const pipeline = await Pipeline.findById(pipelineId);

      if (!pipeline) {
        return res.status(404).json({
          success: false,
          message: 'Pipeline not found'
        });
      }

      // Check if user's org matches pipeline's org
      if (pipeline.orgId !== req.user.orgId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Organization mismatch'
        });
      }

      const pipelineTeam = pipeline.team.name;
      const permissions = teamPermissions[pipelineTeam]?.[userTeam] || [];

      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied: ${userTeam} team does not have ${requiredPermission} permission for ${pipelineTeam} pipelines`
        });
      }

      // Add pipeline to request for use in route handlers
      req.pipeline = pipeline;
      next();
    } catch (error) {
      console.error('Error checking pipeline access:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking pipeline access',
        error: error.message
      });
    }
  };
};

// Middleware to check if user can view pipelines
export const canViewPipelines = async (req, res, next) => {
  try {
    const userTeam = req.user.team;
    const pipelineTeam = req.body.team?.name || req.query.team;

    // If no specific team is requested, allow access to all pipelines in the org
    if (!pipelineTeam) {
      return next();
    }

    const permissions = teamPermissions[pipelineTeam]?.[userTeam] || [];
    
    if (!permissions.includes('view')) {
      return res.status(403).json({
        success: false,
        message: `Access denied: ${userTeam} team does not have view permission for ${pipelineTeam} pipelines`
      });
    }

    next();
  } catch (error) {
    console.error('Error checking pipeline view access:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking pipeline view access',
      error: error.message
    });
  }
}; 