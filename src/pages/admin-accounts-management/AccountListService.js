import api from '../../config/axiosConfig';

export const fetchPaginatedAccounts = async (pageNumber = 1, pageSize = 10) => {
  try {
    const response = await api.get('/api/Account/AllAccounts', {
      params: { pageNumber, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
};

export const fetchAccounts = async () => {
  try {
    const response = await api.get('/api/Account/AllAccount');
    return response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
};

export const changeAccountStatus = async (accountId, newStatus) => {
  try {
    const response = await api.put(`/api/Account/ChangeStatus/${accountId}`, { status: newStatus });
    return response.data;
  } catch (error) {
    console.error('Error changing account status:', error);
    throw error;
  }
};

export const createAccount = async (accountData) => {
  try {
    const response = await api.post('/api/Account/byAdmin', accountData);
    return response.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

export const fetchRoles = async () => {
  try {
    const response = await api.get('/api/Role');
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const updateAccount = async (accountId, accountData) => {
  try {
    const response = await api.put(`/api/Account/${accountId}`, accountData);
    return response.data;
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
};

export const fetchRoleById = async (roleId) => {
  try {
    const response = await api.get(`/api/Role/${roleId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching role with ID ${roleId}:`, error);
    throw error;
  }
};

export const banAccount = async (accountId) => {
  try {
    const response = await api.delete(`/api/Account/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error banning account:', error);
    throw error;
  }
};

export const restoreAccount = async (accountId) => {
  try {
    const response = await api.put(`/api/Account/restore-account/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error restoring account:', error);
    throw error;
  }
};

export const searchAccounts = async (keyword, pageNumber = 1, pageSize = 10) => {
  try {
    const response = await api.get('/api/Account/Search', {
      params: { keyword, pageNumber, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching accounts:', error);
    throw error;
  }
};
