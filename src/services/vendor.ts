import axios from "axios";
import axiosInstance from "@/lib/axios";

export interface VendorData {
  id?: string;
  nama_vendor: string;
  alamat_vendor: string;
  nama_pj: string;
  jabatan_pj: string;
  npwp: string;
  bank_vendor: string;
  norek_vendor: string;
  nama_rek_vendor: string;
}

interface VendorResponse {
  message: string;
  data: {
    vendors: VendorData[];  // Ubah ke array
    session: {
      id: string;
      current_step: string;
    };
  };
}

export const getVendorData = async () => {
  try {
    const response = await axiosInstance.get("/get-vendor");
    return response.data;
  } catch (error) {
    console.error("Vendor fetch error:", error);
    return {
      data: {
        vendor: null,
        session: {
          id: "",
          current_step: "vendor",
          temp_data: {},
        },
      },
    };
  }
};

export const addVendor = async (
  token: string,
  data: VendorData   // Terima single VendorData
): Promise<VendorResponse> => {
  try {
    const response = await axios.post<VendorResponse>(
      `http://localhost:8000/api/add-vendor`,
      { vendors: data },  // Format data yang dikirim
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error response:", error.response?.data);  // Tambah log error
      throw new Error(
        error.response?.data?.message || "Gagal menyimpan data vendor"
      );
    }
    throw error;
  }
};

export const updateVendor = async (
  token: string,
  vendors: VendorData[]
): Promise<VendorResponse> => {
  try {
    console.log("Data yang akan diupdate:", vendors); // untuk debugging

    const response = await axios.put<VendorResponse>(
      `http://localhost:8000/api/update-vendor`,
      { vendors: vendors }, // Pastikan data dikirim dalam bentuk array
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Response Error:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Gagal memperbarui data vendor"
      );
    }
    throw error;
  }
};

export const deleteVendor = async (
  token: string,
  id: string
): Promise<{ message: string; data: { deleted_id: string } }> => {
  try {
    const response = await axios.delete(
      `http://localhost:8000/api/delete-vendor/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Gagal menghapus data vendor"
      );
    }
    throw error;
  }
};
