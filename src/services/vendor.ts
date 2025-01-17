import axios from "axios";
import axiosInstance from "@/lib/axios";

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

interface VendorResponse {
  message: string;
  data: {
    vendor: VendorData & { id?: number };
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
  vendorData: VendorData
): Promise<VendorResponse> => {
  try {
    const response = await axios.post<VendorResponse>(
      `http://localhost:8000/api/add-vendor`,
      vendorData,
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
      throw new Error(
        error.response?.data?.message || "Gagal menyimpan data vendor"
      );
    }
    throw error;
  }
};

export const updateVendor = async (
  token: string,
  vendorData: VendorData
): Promise<VendorResponse> => {
  try {
    const response = await axios.put<VendorResponse>(
      `http://localhost:8000/api/update-vendor`,
      vendorData,
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
      throw new Error(
        error.response?.data?.message || "Gagal memperbarui data vendor"
      );
    }
    throw error;
  }
};
