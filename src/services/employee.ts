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
  surat_keputusan: string; 
}

export interface ContractData {
  nomor_kontrak?: string;
  jenis_kontrak: string;
  deskripsi: string;
  jumlah_orang: number;
  durasi_kontrak: number;
  nilai_kontral_awal: number;
  nilai_kontrak_akhir: number;
}

export interface DocumentData {
  nomor_kontrak: string;
  tanggal_kontrak: string;
  paket_pekerjaan: string;
  tahun_anggaran: string;
  nomor_pp: string;
  tanggal_pp: string;
  nomor_hps: string;
  tanggal_hps: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  nomor_pph1: string;
  tanggal_pph1: string;
  nomor_pph2: string;
  tanggal_pph2: string;
  nomor_ukn: string;
  tanggal_ukn: string;
  tanggal_undangan_ukn: string;
  nomor_ba_ekn: string;
  nomor_pppb: string;
  tanggal_pppb: string;
  nomor_lppb: string;
  tanggal_lppb: string;
  nomor_ba_stp: string;
  nomor_ba_pem: string;
  nomor_dipa: string;
  tanggal_dipa: string;
  kode_kegiatan: string;
}

export interface DocumentWithOfficialsData {
  officials: Array<{ nip: string }>;
  document: DocumentData;
}

export interface ImageData {
  id: number;
  name: string;
  image: string;
}

export const getEmployee = async (token: string): Promise<Employee> => {
  try {
    const response = await axios.get(
      "http://localhost:8000/api/employee/authenticated",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json", // Tambahkan header Accept
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
      throw new Error(
        error.response?.data?.message || "Data vendor sudah ada dalam database"
      );
    }
    throw error;
  }
};

export const updateVendor = async (
  token: string,
  vendorId: number,
  vendorData: VendorData
) => {
  try {
    const response = await axios.put(
      `http://localhost:8000/api/updateVendor/${vendorId}`,
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
      throw new Error(
        error.response?.data?.message || "Gagal memperbarui data vendor"
      );
    }
    throw error;
  }
};

export const addOfficial = async (
  token: string,
  officialData: OfficialData
) => {
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
      throw new Error(
        error.response?.data?.message || "Data pejabat sudah ada dalam database"
      );
    }
    throw error;
  }
};

export const updateOfficial = async (
  token: string,
  nip: string,
  data: OfficialData
) => {
  try {
    const response = await axios.put(
      `http://localhost:8000/api/updateOfficial/${nip}`,
      data,
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
        error.response?.data?.message || "Gagal memperbarui data pejabat"
      );
    }
    throw error;
  }
};

export const saveDocumentWithOfficials = async (
  token: string,
  data: DocumentWithOfficialsData
) => {
  try {
    const response = await axios.post(
      `http://localhost:8000/api/saveDocumentWithOfficials`,
      data,
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
        error.response?.data?.message ||
          "Gagal menyimpan data dokumen dan pejabat"
      );
    }
    throw error;
  }
};

export const updateDocumentWithOfficials = async (
  token: string,
  nomor_kontrak: string,
  data: DocumentWithOfficialsData
) => {
  try {
    const response = await axios.put(
      `http://localhost:8000/api/updateDocumentWithOfficials/${nomor_kontrak}`,
      data,
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
        error.response?.data?.message ||
          "Gagal memperbarui data dokumen dan pejabat"
      );
    }
    throw error;
  }
};

export const addContract = async (
  token: string,
  contractData: ContractData
) => {
  try {
    const response = await axios.post(
      `http://localhost:8000/api/addContract`,
      contractData,
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
        error.response?.data?.error || "Gagal menambahkan data kontrak"
      );
    }
    throw error;
  }
};

export const updateContract = async (
  token: string,
  id: string,
  data: ContractData
) => {
  try {
    const response = await axios.put(
      `http://localhost:8000/api/updateContract/${id}`,
      data,
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
        error.response?.data?.message || "Gagal memperbarui data kontrak"
      );
    }
    throw error;
  }
};

export const deleteContract = async (token: string, id: string) => {
  try {
    const response = await axios.delete(
      `http://localhost:8000/api/deleteContract/${id}`,
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
        error.response?.data?.error || "Gagal menghapus data kontrak"
      );
    }
    throw error;
  }
};

export const getImage = async (token: string, id: number): Promise<ImageData> => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/showImage/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (response.data.status === 'success') {
      return response.data.data;
    }

    throw new Error(response.data.message || "Gagal mengambil gambar");
  } catch (error) {
    console.error("Error fetching image:", error);
    throw new Error("Terjadi kesalahan dalam mendapatkan gambar");
  }
};
