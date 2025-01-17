import axiosInstance from "@/lib/axios";

export interface ContractData {
  id?: string;
  jenis_kontrak: string;
  deskripsi: string;
  jumlah_orang: number;
  durasi_kontrak: number;
  nilai_kontral_awal: number;
  nilai_kontrak_akhir: number;
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

export const addContract = async (contractData: ContractData) => {
  try {
    const response = await axiosInstance.post("/add-contract", {
      contract: contractData,
    });
    return response.data;
  } catch {
    throw new Error("Gagal menyimpan data kontrak");
  }
};

export const updateContract = async (
  id: string,
  contractData: ContractData
) => {
  try {
    const response = await axiosInstance.put(`/update-contract/${id}`, {
      contract: contractData,
    });
    return response.data;
  } catch {
    throw new Error("Gagal memperbarui data kontrak");
  }
};

export const completeForm = async () => {
  try {
    const response = await axiosInstance.post("/complete-form");
    return response.data;
  } catch {
    throw new Error("Gagal menyelesaikan form");
  }
};

export const clearFormSession = async () => {
  try {
    const response = await axiosInstance.post("/clear-form");
    return response.data;
  } catch {
    throw new Error("Gagal membersihkan sesi form");
  }
};
