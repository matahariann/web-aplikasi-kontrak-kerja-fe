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
    if (!userData.no_telp) throw new Error("Nomor telepon harus diisi");
    if (!userData.alamat) throw new Error("Alamat harus diisi");
    if (!userData.password) throw new Error("Password harus diisi");
    if (!userData.password_confirmation) throw new Error("Konfirmasi password harus diisi");
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
      const response = await axios.post("http://localhost:8000/api/register", userData);
  
      if (response.data.message === "Registrasi berhasil") {
        return response.data.data.user;
      }
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data.message || 
                            Object.values(error.response.data.errors || {})[0][0] ||
                            "Terjadi kesalahan dalam proses registrasi";
        throw new Error(errorMessage);
      }
      throw new Error("Terjadi kesalahan dalam proses registrasi");
    }
  };