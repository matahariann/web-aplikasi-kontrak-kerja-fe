import axios from "axios";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const login = async (email, password) => {
  // Check for empty fields
  if (!email && !password) {
    throw new Error("Email dan password harus diisi");
  }
  if (!email) {
    throw new Error("Email harus diisi");
  }
  if (!password) {
    throw new Error("Password harus diisi");
  }

  // Validate email format
  if (!validateEmail(email)) {
    throw new Error("Format email tidak valid");
  }

  try {
    const response = await axios.post("http://localhost:8000/api/login", {
      email: email,
      password: password,
    });

    if (response.data.message === "Login Berhasil") {
      return response.data.data.user;
    } else {
      throw new Error("Email atau password salah");
    }
  } catch (error) {
    // Jika error berasal dari validasi kita sebelumnya
    if (error.message === "Email harus diisi" ||
        error.message === "Password harus diisi" ||
        error.message === "Email dan password harus diisi" ||
        error.message === "Format email tidak valid" ||
        error.message === "Email atau password salah") {
      throw error;
    }
    
    // Jika error dari response server
    if (error.response) {
      if (error.response.status === 401 || 
          error.response.data.message === "Kombinasi email dan password tidak valid." ||
          error.response.data.message === "Akun tidak aktif.") {
        throw new Error("Email atau password salah");
      }
    }
    
    // Untuk error lainnya (seperti network error)
    throw new Error("Terjadi kesalahan dalam proses login");
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