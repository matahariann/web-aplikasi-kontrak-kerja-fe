import axios from "axios";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const register = async (userData: {
  nip: string;
  nama: string;
  email: string;
  no_telp: string;
  alamat: string;
  password: string;
  password_confirmation: string;
}) => {
  // Validation
  if (!userData.nip) throw new Error("NIP harus diisi");
  if (!userData.nama) throw new Error("Nama harus diisi");
  if (!userData.email) throw new Error("Email harus diisi");
  if (!userData.password) throw new Error("Password harus diisi");
  if (!userData.password_confirmation)
    throw new Error("Konfirmasi password harus diisi");
  if (userData.password !== userData.password_confirmation) {
    throw new Error("Password dan konfirmasi password tidak cocok");
  }

  // Validate email format
  if (!validateEmail(userData.email)) {
    throw new Error("Format email tidak valid");
  }

  // Validate password length
  if (userData.password.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  try {
    const response = await axios.post(
      "http://localhost:8000/api/register",
      userData
    );

    if (
      response.data.message === "Registrasi berhasil, silakan verifikasi email"
    ) {
      return {
        success: true,
        userId: response.data.data.user_id,
        email: response.data.data.email, // Add this line
        message: response.data.message,
      };
    }
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data.message ||
        Object.values(error.response.data.errors || {})[0][0] ||
        "Terjadi kesalahan dalam proses registrasi";
      throw new Error(errorMessage);
    }
    throw new Error("Terjadi kesalahan dalam proses registrasi");
  }
};

export const verifyEmail = async (userId: string, verificationCode: string) => {
  // Validate inputs more strictly
  if (!userId) {
    throw new Error("ID pengguna tidak valid");
  }

  if (!verificationCode || verificationCode.length !== 6) {
    throw new Error("Kode verifikasi harus 6 digit");
  }

  try {
    // Use full URL for local development
    const response = await axios.post(
      "http://localhost:8000/api/verify-email",
      {
        user_id: userId,
        verification_code: verificationCode,
      },
      {
        // Add error handling configuration
        validateStatus: function (status) {
          return status >= 200 && status < 300; // Default
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Verification Error:", error.response || error);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Verifikasi gagal. Silakan coba lagi.";

    throw new Error(errorMessage);
  }
};

export const resendVerificationCode = async (email: string) => {
  if (!email) {
    throw new Error("Email harus diisi");
  }

  try {
    const response = await axios.post(
      "http://localhost:8000/api/resend-verification",
      { email }
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Gagal mengirim ulang kode verifikasi";
    throw new Error(errorMessage);
  }
};

export const forgotPassword = async (email: string) => {
  if (!email) {
    throw new Error("Email harus diisi");
  }

  if (!validateEmail(email)) {
    throw new Error("Format email tidak valid");
  }

  try {
    const response = await axios.post(
      "http://localhost:8000/api/forgot-password",
      { email }
    );
    return {
      success: true,
      userId: response.data.data.user_id,
      email: response.data.data.email,
      message: response.data.message,
    };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Email tidak ditemukan";
    throw new Error(errorMessage);
  }
};

export const resetPassword = async (
  userId: string,
  password: string,
  password_confirmation: string
) => {
  if (!password) throw new Error("Password harus diisi");
  if (!password_confirmation)
    throw new Error("Konfirmasi password harus diisi");
  if (password !== password_confirmation) {
    throw new Error("Password dan konfirmasi password tidak cocok");
  }
  if (password.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  try {
    const response = await axios.post(
      "http://localhost:8000/api/reset-password",
      {
        user_id: userId,
        password,
        password_confirmation,
      }
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Gagal mengubah password";
    throw new Error(errorMessage);
  }
};

export const resendResetPasswordCode = async (email: string) => {
  if (!email) {
    throw new Error("Email harus diisi");
  }

  try {
    const response = await axios.post(
      "http://localhost:8000/api/resend-reset-password-code",
      { email }
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Gagal mengirim ulang kode verifikasi";
    throw new Error(errorMessage);
  }
};
