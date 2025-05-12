import React, { useState, useEffect } from 'react';
import { VscEye, VscEyeClosed, VscEdit, VscTrash } from 'react-icons/vsc';
import axios from 'axios';

// Credential types configuration
const credentialTypes = {
  github: { name: 'GitHub Token', fields: ['token'] },
  docker: { name: 'Docker Registry', fields: ['username', 'password', 'registryUrl'] },
  aws: { name: 'AWS Keys', fields: ['accessKeyId', 'secretAccessKey', 'region'] },
  azure: {
    name: 'Azure Container Registry',
    fields: ['clientId', 'clientSecret', 'tenantId', 'registryUrl']
  },
  gcp: {
    name: 'Google Container Registry',
    fields: ['projectId', 'serviceAccountKey']
  },
  sonarqube: {
    name: 'SonarQube',
    fields: ['url', 'token']
  },
  coverity: {
    name: 'Coverity',
    fields: ['url', 'username', 'password']
  },
  snyk: {
    name: 'Snyk',
    fields: ['token']
  },
  owasp: {
    name: 'OWASP Dependency Check',
    fields: ['url', 'apiKey']
  },
  anchore: {
    name: 'Anchore',
    fields: ['url', 'username', 'password']
  },
  aqua: {
    name: 'Aqua Security',
    fields: ['url', 'username', 'password']
  },
  clair: {
    name: 'Clair',
    fields: ['url', 'username', 'password']
  },
  'aws-eks': {
    name: 'AWS EKS',
    fields: ['clusterName', 'region', 'accessKeyId', 'secretAccessKey']
  },
  'azure-aks': {
    name: 'Azure AKS',
    fields: ['clusterName', 'resourceGroup', 'subscriptionId', 'clientId', 'clientSecret', 'tenantId']
  },
  'gcp-gke': {
    name: 'Google GKE',
    fields: ['clusterName', 'projectId', 'zone', 'serviceAccountKey']
  },
  jenkins: { name: 'Jenkins Token', fields: ['username', 'token'] },
  kubernetes: { name: 'Kubernetes Cluster', fields: ['endpoint', 'caCert', 'token'] },
};

// API base URL
const API_URL = import.meta.env.VITE_API_URL;

// Function to fetch credentials from API
const fetchCredentialsFromAPI = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/credentials`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.credentials;
  } catch (error) {
    console.error('Error fetching credentials:', error);
    throw error;
  }
};

// Function to add a credential via API
const addCredentialToAPI = async (credentialData, token) => {
  try {
    const response = await axios.post(`${API_URL}/credentials`, credentialData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.credential;
  } catch (error) {
    console.error('Error adding credential:', error);
    throw error;
  }
};

// Function to delete a credential via API
const deleteCredentialFromAPI = async (credentialId, token) => {
  try {
    await axios.delete(`${API_URL}/credentials/${credentialId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return true;
  } catch (error) {
    console.error('Error deleting credential:', error);
    throw error;
  }
};

function ManageCredentials() {
  // --- State --- 
  const [credentialsList, setCredentialsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState({});
  const [editingCredential, setEditingCredential] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Form State
  const [credName, setCredName] = useState('');
  const [credType, setCredType] = useState(Object.keys(credentialTypes)[0]);
  const [dynamicFields, setDynamicFields] = useState({});

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // --- Effects --- 
  useEffect(() => {
    if (!token) {
      setError('Please login to manage credentials');
      return;
    }

    const loadCredentials = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCredentialsFromAPI(token);
        setCredentialsList(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load credentials');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCredentials();
  }, [token]);

  useEffect(() => {
    // Reset dynamic fields when type changes
    const initialFields = credentialTypes[credType].fields.reduce((acc, field) => {
      acc[field] = '';
      return acc;
    }, {});
    setDynamicFields(initialFields);
  }, [credType]);

  // --- Handlers --- 
  const handleDynamicFieldChange = (fieldName, value) => {
    setDynamicFields(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please login to add credentials');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Create a clean credentials object with only the required fields
    const cleanCredentials = {};
    credentialTypes[credType].fields.forEach(field => {
      if (dynamicFields[field]) {
        cleanCredentials[field] = dynamicFields[field];
      }
    });

    const newCredential = {
      name: credName,
      type: credType,
      credentials: cleanCredentials
    };

    try {
      const response = await axios.post(
        `${API_URL}/credentials`,
        newCredential,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setCredentialsList(prev => [...prev, response.data.credential]);
        // Reset form
        setCredName('');
        setCredType(Object.keys(credentialTypes)[0]);
        setDynamicFields({});
        setShowAddForm(false);
      } else {
        setError(response.data.message || 'Failed to add credential');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add credential');
      console.error('Error adding credential:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (credentialId) => {
    if (!token) {
      setError('Please login to delete credentials');
      return;
    }

    if (window.confirm('Are you sure you want to delete this credential?')) {
      setIsLoading(true);
      setError(null);
      try {
        await deleteCredentialFromAPI(credentialId, token);
        setCredentialsList(prev => prev.filter(cred => cred._id !== credentialId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete credential');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleRevealSecret = (credId, fieldName) => {
    const key = `${credId}_${fieldName}`;
    setRevealedSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEdit = (credential) => {
    setEditingCredential(credential);
    setEditFormData({
      name: credential.name,
      type: credential.type,
      credentials: { ...credential.credentials }
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Please login to update credentials');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `${API_URL}/credentials/${editingCredential._id}`,
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setCredentialsList(prev => 
          prev.map(cred => 
            cred._id === editingCredential._id ? response.data.credential : cred
          )
        );
        setEditingCredential(null);
        setEditFormData({});
      } else {
        setError(response.data.message || 'Failed to update credential');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update credential');
      console.error('Error updating credential:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFieldChange = (fieldName, value) => {
    setEditFormData(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [fieldName]: value
      }
    }));
  };

  // --- Helper Functions --- 
  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  };

  const isSensitiveField = (fieldName) => {
    return /token|password|secret|key/i.test(fieldName);
  };

  const renderFieldValue = (credential, fieldName) => {
    const value = credential.credentials[fieldName] || '';
    const key = `${credential._id}_${fieldName}`;
    const isRevealed = revealedSecrets[key];

    if (!value) return <span className="text-gray-500 italic">Not set</span>;

    if (isSensitiveField(fieldName)) {
      return (
        <div className="flex items-center space-x-2">
          <span>{isRevealed ? value : '••••••••'}</span>
          <button 
            onClick={() => toggleRevealSecret(credential._id, fieldName)} 
            className="text-gray-400 hover:text-white"
          >
            {isRevealed ? <VscEyeClosed /> : <VscEye />}
          </button>
        </div>
      );
    }
    return <span className="truncate" title={value}>{value}</span>;
  };

  // --- Styles --- 
  const inputStyles = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white";
  const labelStyles = "block text-sm font-medium mb-1 text-gray-300 capitalize";
  const buttonStyles = "px-4 py-2 rounded-md font-semibold transition duration-200";

  if (!token) {
    return (
      <div className="p-6 bg-gray-800 min-h-screen text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Manage Credentials</h1>
          <p className="text-red-400">Please login to manage credentials</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Credentials</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`${buttonStyles} ${showAddForm ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {showAddForm ? 'Cancel' : 'Add New Credential'}
        </button>
      </div>

      {/* --- Add Credential Form (Conditional) --- */}
      {showAddForm && (
        <div className="bg-gray-750 p-6 rounded-lg mb-8 border border-gray-600">
          <h2 className="text-xl font-semibold mb-4">Add New Credential</h2>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            {/* Credential Name */}
            <div>
              <label htmlFor="credName" className={labelStyles}>Credential Name</label>
              <input
                type="text"
                id="credName"
                value={credName}
                onChange={(e) => setCredName(e.target.value)}
                required
                placeholder="e.g., AWS-Prod-Keys"
                className={inputStyles}
              />
            </div>

            {/* Credential Type */}
            <div>
              <label htmlFor="credType" className={labelStyles}>Type</label>
              <select
                id="credType"
                value={credType}
                onChange={(e) => setCredType(e.target.value)}
                className={inputStyles}
              >
                {Object.entries(credentialTypes).map(([key, { name }]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>

            {/* Dynamic Fields based on Type */}
            {credentialTypes[credType].fields.map(fieldName => (
              <div key={fieldName}>
                <label htmlFor={fieldName} className={labelStyles}>{formatFieldName(fieldName)}</label>
                <input
                  type={isSensitiveField(fieldName) ? 'password' : 'text'}
                  id={fieldName}
                  value={dynamicFields[fieldName] || ''}
                  onChange={(e) => handleDynamicFieldChange(fieldName, e.target.value)}
                  required
                  className={inputStyles}
                />
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`${buttonStyles} bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Saving...' : 'Save Credential'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {editingCredential && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-750 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Credential</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="editCredName" className={labelStyles}>Credential Name</label>
                <input
                  type="text"
                  id="editCredName"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className={inputStyles}
                />
              </div>

              <div>
                <label htmlFor="editCredType" className={labelStyles}>Type</label>
                <select
                  id="editCredType"
                  value={editFormData.type}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, type: e.target.value }))}
                  className={inputStyles}
                  disabled
                >
                  {Object.entries(credentialTypes).map(([key, { name }]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>

              {credentialTypes[editFormData.type]?.fields.map(fieldName => (
                <div key={fieldName}>
                  <label htmlFor={`edit_${fieldName}`} className={labelStyles}>
                    {formatFieldName(fieldName)}
                  </label>
                  <div className="relative">
                    <input
                      type={isSensitiveField(fieldName) ? 'password' : 'text'}
                      id={`edit_${fieldName}`}
                      value={editFormData.credentials[fieldName] || ''}
                      onChange={(e) => handleEditFieldChange(fieldName, e.target.value)}
                      required
                      className={inputStyles}
                    />
                    {isSensitiveField(fieldName) && (
                      <button
                        type="button"
                        onClick={() => toggleRevealSecret(`edit_${fieldName}`)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {revealedSecrets[`edit_${fieldName}`] ? <VscEyeClosed /> : <VscEye />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCredential(null);
                    setEditFormData({});
                  }}
                  className={`${buttonStyles} bg-gray-600 hover:bg-gray-700`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`${buttonStyles} bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Updating...' : 'Update Credential'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials List */}
      <h2 className="text-2xl font-semibold mb-4">Saved Credentials</h2>
      {isLoading && !credentialsList.length && <p>Loading credentials...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}
      {!isLoading && !credentialsList.length && !error && <p>No credentials saved yet.</p>}

      {credentialsList.length > 0 && (
        <div className="overflow-x-auto bg-gray-750 rounded-lg border border-gray-600">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-2/6">Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">Last Updated</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-600">
              {credentialsList.map((credential) => (
                <tr key={credential._id} className="hover:bg-gray-700/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{credential.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{credentialTypes[credential.type]?.name || credential.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="max-h-32 overflow-y-auto">
                      <ul className="list-disc list-inside space-y-1">
                        {Object.keys(credential.credentials || {}).map(fieldName => (
                          <li key={fieldName} className="flex items-center space-x-2">
                            <span className="font-semibold capitalize">{formatFieldName(fieldName)}:</span>
                            {renderFieldValue(credential, fieldName)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(credential.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-3">
                      <button 
                        onClick={() => handleEdit(credential)}
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        title="Edit credential"
                      >
                        <VscEdit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(credential._id)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200"
                        title="Delete credential"
                      >
                        <VscTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageCredentials;