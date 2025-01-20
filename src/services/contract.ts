import axios from "axios";
import axiosInstance from "@/lib/axios";

export interface ContractData {
  id?: string;
  jenis_kontrak: string;
  deskripsi: string;
  jumlah_orang: number;
  durasi_kontrak: number;
  nilai_perkiraan_sendiri: number;
  nilai_kontral_awal: number;
  nilai_kontrak_akhir: number;
}

interface ContractResponse {
  message: string;
  data: {
    contract: ContractData;
    session: {
      id: string;
      current_step: string;
    };
  };
}

export const getContractData = async () => {
  try {
    const response = await axiosInstance.get("/get-contract");
    return response.data;
  } catch (error) {
    console.error("Contract fetch error:", error);
    return {
      data: {
        contract: null,
        session: {
          id: "",
          current_step: "contract",
          temp_data: {},
        },
      },
    };
  }
};

export const addContract = async (
  token: string,
  data: ContractData
): Promise<ContractResponse> => {
  try {
    const response = await axios.post<ContractResponse>(
      `http://localhost:8000/api/add-contract`,
      { contract: data },
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
        error.response?.data?.error || "Gagal menyimpan data kontrak"
      );
    }
    throw error;
  }
};

export const updateContract = async (
  token: string,
  id: string,
  contracts: ContractData[]
): Promise<ContractResponse> => {
  try {
    const response = await axios.put<ContractResponse>(
      `http://localhost:8000/api/update-contract/${id}`,
      { contracts },
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
        error.response?.data?.error || "Gagal memperbarui data kontrak"
      );
    }
    throw error;
  }
};

export const deleteContract = async (
  token: string,
  id: string
): Promise<{ message: string; data: { deleted_id: string } }> => {
  try {
    const response = await axios.delete(
      `http://localhost:8000/api/delete-contract/${id}`,
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
        error.response?.data?.error || "Gagal menghapus data kontrak"
      );
    }
    throw error;
  }
};

export const completeForm = async (
  token: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      "http://localhost:8000/api/complete-form",
      {},
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
        error.response?.data?.error || "Gagal menyelesaikan form"
      );
    }
    throw error;
  }
};

export const clearFormSession = async (
  token: string
): Promise<{ message: string }> => {
  try {
    const response = await axios.post(
      "http://localhost:8000/api/clear-form",
      {},
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
        error.response?.data?.error || "Gagal menghapus session form"
      );
    }
    throw error;
  }
};
