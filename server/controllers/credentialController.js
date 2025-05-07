import Credential from '../models/Credential.js';

// Create a new credential
export const createCredential = async (req, res) => {
  try {
    console.log('Creating credential for user:', req.user._id);
    const { name, type, credentials } = req.body;

    // Validate required fields
    if (!name || !type || !credentials) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and credentials are required'
      });
    }

    // Validate credential type
    const validTypes = [
      'github', 'docker', 'aws', 'azure', 'gcp',
      'sonarqube', 'coverity', 'snyk', 'owasp',
      'anchore', 'aqua', 'clair',
      'aws-eks', 'azure-aks', 'gcp-gke',
      'jenkins', 'kubernetes'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credential type'
      });
    }

    // Validate required fields based on type
    const typeValidations = {
      github: ['token'],
      docker: ['username', 'password', 'registryUrl'],
      aws: ['accessKeyId', 'secretAccessKey', 'region'],
      azure: ['clientId', 'clientSecret', 'tenantId', 'registryUrl'],
      gcp: ['projectId', 'serviceAccountKey'],
      sonarqube: ['url', 'token'],
      coverity: ['url', 'username', 'password'],
      snyk: ['token'],
      owasp: ['url', 'apiKey'],
      anchore: ['url', 'username', 'password'],
      aqua: ['url', 'username', 'password'],
      clair: ['url', 'username', 'password'],
      'aws-eks': ['clusterName', 'region', 'accessKeyId', 'secretAccessKey'],
      'azure-aks': ['clusterName', 'resourceGroup', 'subscriptionId', 'clientId', 'clientSecret', 'tenantId'],
      'gcp-gke': ['clusterName', 'projectId', 'zone', 'serviceAccountKey'],
      jenkins: ['username', 'token'],
      kubernetes: ['endpoint', 'caCert', 'token']
    };

    const requiredFields = typeValidations[type];
    const missingFields = requiredFields.filter(field => !credentials[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields for ${type}: ${missingFields.join(', ')}`
      });
    }

    // Create credential object with only the required fields
    const credentialData = {
      name,
      type,
      credentials: {},
      createdBy: req.user._id
    };

    // Only include the fields that are defined in the credentials object
    requiredFields.forEach(field => {
      if (credentials[field]) {
        credentialData.credentials[field] = credentials[field];
      }
    });

    const credential = await Credential.create(credentialData);
    console.log('Credential created successfully:', credential);

    res.status(201).json({
      success: true,
      message: 'Credential created successfully',
      credential
    });
  } catch (error) {
    console.error('Error creating credential:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating credential',
      error: error.message
    });
  }
};

// Get all credentials for a user
export const getCredentials = async (req, res) => {
  try {
    console.log('Getting credentials for user:', req.user._id);
    const credentials = await Credential.find({ createdBy: req.user._id });
    console.log('Found credentials:', credentials);

    res.status(200).json({
      success: true,
      count: credentials.length,
      credentials
    });
  } catch (error) {
    console.error('Error getting credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting credentials',
      error: error.message
    });
  }
};

// Get credentials by type
export const getCredentialsByType = async (req, res) => {
  try {
    const { type } = req.params;
    console.log('Getting credentials for user:', req.user._id, 'type:', type);

    // Validate credential type
    const validTypes = ['github', 'docker', 'aws', 'jenkins', 'kubernetes'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credential type'
      });
    }

    const credentials = await Credential.find({ 
      createdBy: req.user._id,
      type: type 
    });
    console.log('Found credentials:', credentials);

    res.status(200).json({
      success: true,
      count: credentials.length,
      credentials
    });
  } catch (error) {
    console.error('Error getting credentials by type:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting credentials by type',
      error: error.message
    });
  }
};

// Update a credential
export const updateCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, credentials } = req.body;
    console.log('Updating credential:', id, 'for user:', req.user._id);

    // Validate required fields
    if (!name || !credentials) {
      return res.status(400).json({
        success: false,
        message: 'Name and credentials are required'
      });
    }

    // Find the existing credential to get its type
    const existingCredential = await Credential.findOne({ 
      _id: id, 
      createdBy: req.user._id 
    });

    if (!existingCredential) {
      console.log('Credential not found');
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    // Validate required fields based on type
    const typeValidations = {
      github: ['token'],
      docker: ['username', 'password', 'registryUrl'],
      aws: ['accessKeyId', 'secretAccessKey', 'region'],
      azure: ['clientId', 'clientSecret', 'tenantId', 'registryUrl'],
      gcp: ['projectId', 'serviceAccountKey'],
      sonarqube: ['url', 'token'],
      coverity: ['url', 'username', 'password'],
      snyk: ['token'],
      owasp: ['url', 'apiKey'],
      anchore: ['url', 'username', 'password'],
      aqua: ['url', 'username', 'password'],
      clair: ['url', 'username', 'password'],
      'aws-eks': ['clusterName', 'region', 'accessKeyId', 'secretAccessKey'],
      'azure-aks': ['clusterName', 'resourceGroup', 'subscriptionId', 'clientId', 'clientSecret', 'tenantId'],
      'gcp-gke': ['clusterName', 'projectId', 'zone', 'serviceAccountKey'],
      jenkins: ['username', 'token'],
      kubernetes: ['endpoint', 'caCert', 'token']
    };

    const requiredFields = typeValidations[existingCredential.type];
    const missingFields = requiredFields.filter(field => !credentials[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields for ${existingCredential.type}: ${missingFields.join(', ')}`
      });
    }

    // Create update object with only the required fields
    const updateData = {
      name,
      credentials: {}
    };

    // Only include the fields that are defined in the credentials object
    requiredFields.forEach(field => {
      if (credentials[field]) {
        updateData.credentials[field] = credentials[field];
      }
    });

    const credential = await Credential.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log('Credential updated successfully:', credential);
    res.status(200).json({
      success: true,
      message: 'Credential updated successfully',
      credential
    });
  } catch (error) {
    console.error('Error updating credential:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating credential',
      error: error.message
    });
  }
};

// Delete a credential
export const deleteCredential = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting credential:', id, 'for user:', req.user._id);

    const credential = await Credential.findOneAndDelete({ 
      _id: id, 
      createdBy: req.user._id 
    });
    
    if (!credential) {
      console.log('Credential not found');
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }
    
    console.log('Credential deleted successfully');
    res.status(200).json({
      success: true,
      message: 'Credential deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting credential:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting credential',
      error: error.message
    });
  }
}; 