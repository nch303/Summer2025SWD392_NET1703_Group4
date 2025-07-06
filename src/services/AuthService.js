import api from '../config/axiosConfig';

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/api/Auth/login', {
      email,
      password
    });
    
    // Store token in localStorage - token now comes with "Bearer " prefix included
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    // Check for the specific account activation error message
    if (error.response?.status === 400 && 
        error.response?.data?.message === "Account is not activated. Please check your email.") {
      throw new Error("Account is not activated. Please check your email.");
    }
    
    throw new Error(
      error.response?.data?.message || 
      'Failed to login. Please check your credentials and try again.'
    );
  }
};

export const confirmEmail = async (token) => {
  try{
    const response = await api.get(`api/Auth/confirm?token=${token}`);
    return response.data;
  } catch (error) {
      throw new Error(
        error.response?.data?.message ||
         'Email confirmation failed. Please try again or contact support.'
      );
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post('/api/Auth/forgot-password', { email });
    
    if (response.data === 'Reset email sent successfully') {
      return response.data;
    } else {
      throw new Error('Could not process your request at this time.');
    }
  } catch (error) {
    console.error('Error requesting password reset:', error);
    
    if (error.response) {
      // Xử lý các mã lỗi cụ thể
      if (error.response.status === 404) {
        throw new Error('Email không tồn tại trong hệ thống.');
      } else if (error.response.data) {
        throw new Error(error.response.data);
      }
    }
    
    throw new Error('Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.');
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.put('/api/Auth/reset-password', {
      token,
      newPassword
    });
    
    if (response.data === 'Password reset successfully') {
      return response.data;
    } else {
      throw new Error('Could not reset password. Please try again.');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    
    // Handle specific error messages
    if (error.response?.data) {
      throw new Error(error.response.data);
    }
    
    // Handle common error cases
    if (error.response?.status === 400) {
      throw new Error('Token and new password are required');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid or expired token');
    } else if (error.response?.status === 410) {
      throw new Error('The reset password link has expired. Please request a new one.');
    }
    
    throw new Error('Could not reset password. Please try again later.');
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/api/Auth/register', {
      fullName: userData.name,
      email: userData.email,
      password: userData.password,
      phoneNumber: userData.phone
    });
    
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      'Đăng ký thất bại. Vui lòng thử lại sau.'
    );
  }
};