import api from "../../config/axiosConfig";

export const getTodayAttendance = async (classId) => {
  try {
    const response = await api.get(`/api/Attendance/${classId}/teacher-today`);
    return response.data;
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    throw error;
  }
};

export const updateAttendanceRecords = async (attendanceRecords) => {
  try {
    const response = await api.put("/api/Attendance/update", attendanceRecords);
    return response.data;
  } catch (error) {
    console.error("Error updating attendance records:", error);
    throw error;
  }
};

export const getAllClassAttendance = async (classId) => {
  try {
    const response = await api.get(`/api/Attendance/${classId}/get-all-class-attendance`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all class attendance:", error);
    throw error;
  }
};
