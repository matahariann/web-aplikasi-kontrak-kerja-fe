import axios from "axios";

export type Employee = {
  nip: string;
  nama_vendor: string;
  email: string;
  noTelp: string;
  alamat: string;
};

export interface VendorData {
  nama_vendor: string;
  alamat_vendor: string;
  nama_pj: string;
  jabatan_pj: string;
  npwp: string;
  bank_vendor: string;
  norek_vendor: string;
  nama_rek_vendor: string;
}

export interface OfficialData {
  nip: string;
  nama: string;
  jabatan: string;
  periode_jabatan: string;
}

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

  export const addVendor = async (token: string, vendorData: VendorData) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/addVendor`,
        vendorData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Data vendor sudah ada dalam database");
      }
      throw error;
    }
  };

  export const deleteVendor = async (token: string, vendorId: number) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/deleteVendor/${vendorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Gagal menghapus data vendor");
      }
      throw error;
    }
  };

  export const addOfficial = async (token: string, officialData: OfficialData) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/addOfficial`,
        officialData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Data pejabat sudah ada dalam database");
      }
      throw error;
    }
  };

  export const deleteOfficial = async (token: string, officialId: number) => {
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/deleteOfficial/${officialId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Gagal menghapus data pejabat");
      }
      throw error;
    }
  };