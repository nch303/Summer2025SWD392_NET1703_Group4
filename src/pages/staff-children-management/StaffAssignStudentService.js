// API service for StaffAssignStudentPage
import api from '../../config/axiosConfig';

export async function getAllClasses() {
  try {
    const response = await api.get('/api/Class/get-all-classes');
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw new Error('Failed to fetch class list');
  }
}

export async function getPaidChildren() {
  try {
    const response = await api.get('/api/Children/paidChildren');
    return response.data;
  } catch (error) {
    console.error('Error fetching children:', error);
    throw new Error('Failed to fetch children list');
  }
}

export async function assignChildrenToClass(classId, childrenIds) {
  try {
    const response = await api.post(`/api/Staff/AssignChildrenToClass/${classId}`, childrenIds);
    return response.data;
  } catch (error) {
    console.error('Error assigning children to class:', error);
    throw new Error('Failed to assign students to class');
  }
} 