import axios from "axios";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const login = async (email, password) => {
  // Create a result object to handle errors without throwing
  const result = {
    success: false,
    data: null,
    message: ""
  };

  // Check for empty fields
  if (!email && !password) {
    result.message = "Email dan password harus diisi";
    return result;
  }
  if (!email) {
    result.message = "Email harus diisi";
    return result;
  }
  if (!password) {
    result.message = "Password harus diisi";
    return result;
  }

  // Validate email format
  if (!validateEmail(email)) {
    result.message = "Format email tidak valid";
    return result;
  }

  try {
    const response = await axios.post("http://localhost:8000/api/login", {
      email: email,
      password: password,
    });

    if (response.data.message === "Login Berhasil") {
      result.success = true;
      result.data = response.data.data.user;
      result.message = "Login Berhasil";
      return result;
    } else {
      result.message = "Email atau password salah";
      return result;
    }
  } catch (error) {
    // Handle server response errors
    if (error.response) {
      result.message = "Email atau password salah";
      return result;
    }
    
    // Handle network or other errors
    result.message = "Terjadi kesalahan dalam proses login";
    return result;
  }
};

export const logout = async (token) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/api/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`, // Fixed missing template literal syntax
        },
      }
    );

    if (response.data && response.data.message === "Logout berhasil") {
      return true; // Berhasil logout
    } else {
      throw new Error("Gagal melakukan logout");
    }
  } catch (error) {
    // Include the original error message in the thrown error
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Terjadi kesalahan dalam proses logout";
    throw new Error(errorMessage);
  }
};