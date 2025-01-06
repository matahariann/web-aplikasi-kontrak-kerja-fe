import axios from "axios";

export type Employee = {
  nip: string;
  nama: string;
  email: string;
  noTelp: string;
  alamat: string;
};

export const getEmployee = async (token: string): Promise<Employee> => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/employee/authenticated",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'  // Tambahkan header Accept
          },
        }
      );
  
      // Sesuaikan dengan struktur response dari backend
      if (response.data.success) {
        return response.data.data.operator;
      }
      
      throw new Error(response.data.message || "Gagal mengambil data");
    } catch (error) {
      console.error("Error fetching employee:", error);
      throw new Error("Terjadi kesalahan dalam mendapatkan data operator");
    }
  };