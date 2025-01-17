import axios from "axios";

export type Employee = {
  nip: string;
  nama: string;
  email: string;
  noTelp: string;
  alamat: string;
};

export interface EmployeeResponse {
  success: boolean;
  data: {
    employee: Employee;
  };
}

export interface VendorData {
  nama_vendor: string;
  alamat_vendor: string;
  nama_pj: string;
  jabatan_pj: string;
  npwp: string;
  bank_vendor: string;
  norek_vendor: string;
  nama_rek_vendor: string;
  form_session_id?: string;
}

export interface VendorResponse {
  message: string;
  data: VendorData & { id: number };
  form_session_id: string;
}

export interface OfficialData {
  id?: string;
  nip: string;
  nama: string;
  jabatan: string;
  periode_jabatan: string;
  surat_keputusan?: string;
  form_session_id?: string;
}

export interface OfficialResponse {
  message: string;
  data: OfficialData & { id: string };
  form_session_id: string;
}

export interface ContractData {
  nomor_kontrak?: string;
  jenis_kontrak: string;
  deskripsi: string;
  jumlah_orang: number;
  durasi_kontrak: number;
  nilai_kontral_awal: number;
  nilai_kontrak_akhir: number;
  form_session_id?: string;
}

export interface ContractResponse {
  message: string;
  data: ContractData & { id: string };
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
  form_session_id?: string;
}

export interface DocumentResponse {
  message: string;
  data: {
    document: DocumentData;
  };
}

export interface DocumentWithOfficialsData {
  officials: OfficialData[];
  document: DocumentData;
}

export interface ImageData {
  id: number;
  name: string;
  image: string;
}

export const getEmployee = async (token: string): Promise<Employee> => {
  try {
    const response = await axios.get<EmployeeResponse>(
      `http://localhost:8000/api/employee/authenticated`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // Return hanya bagian employee dari response
    return response.data.data.employee;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Gagal mengambil data pegawai"
      );
    }
    throw error;
  }
};

export const getSessionData = async (token: string, sessionId: string) => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/session-data/${sessionId}`,
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
        error.response?.data?.message || "Gagal mengambil data session"
      );
    }
    throw error;
  }
};

export const getImage = async (
  token: string,
  id: number
): Promise<ImageData> => {
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

    if (response.data.status === "success") {
      return response.data.data;
    }

    throw new Error(response.data.message || "Gagal mengambil gambar");
  } catch (error) {
    console.error("Error fetching image:", error);
    throw new Error("Terjadi kesalahan dalam mendapatkan gambar");
  }
};
