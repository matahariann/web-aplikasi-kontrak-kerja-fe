"use client";
import React, { useState } from "react";
import { register } from "@/services/user";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function Register() {
  const [formData, setFormData] = useState({
    nip: "",
    nama: "",
    email: "",
    no_telp: "",
    alamat: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({
    nip: "",
    nama: "",
    email: "",
    no_telp: "",
    alamat: "",
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    Object.keys(newErrors).forEach((key) => {
      newErrors[key as keyof typeof errors] = "";
    });

    Object.keys(formData).forEach((key) => {
      if (!formData[key as keyof typeof formData].trim()) {
        newErrors[key as keyof typeof errors] = `${
          key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")
        } harus diisi`;
        isValid = false;
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Format email tidak valid");
      isValid = false;
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
      isValid = false;
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Password tidak cocok";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Mohon lengkapi semua input dengan benar");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(formData);
      if (res.success) {
        toast.success("Registrasi berhasil!", {
          description: "Kode verifikasi telah dikirim ke email Anda",
          duration: 3000,
        });
        

        // Small delay to ensure toast is visible
        setTimeout(() => {
          router.push(`/verification?user_id=${res.userId}&email=${res.email}`);
        }, 3500);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: "password" | "confirm") => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // Helper function to render input with error message
  const renderInput = (
    label: string,
    name: keyof typeof formData,
    type: string = "text",
    placeholder: string,
    isTextarea: boolean = false
  ) => {
    const InputComponent = isTextarea ? "textarea" : "input";
    const isPasswordField = type === "password";

    return (
      <div>
        <label className="block text-white text-sm mb-2">{label}</label>
        <div className="relative">
          <InputComponent
            type={
              isPasswordField
                ? name === "password"
                  ? showPassword
                    ? "text"
                    : "password"
                  : showConfirmPassword
                  ? "text"
                  : "password"
                : type
            }
            name={name}
            className={`w-full px-4 py-2 rounded-lg bg-white/10 border ${
              errors[name] ? "border-red-500" : "border-white/20"
            } text-white placeholder-white/50 focus:outline-none focus:border-white/40`}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            {...(isTextarea ? { rows: 3 } : {})}
          />
          {isPasswordField && (
            <button
              type="button"
              onClick={() =>
                togglePasswordVisibility(
                  name === "password" ? "password" : "confirm"
                )
              }
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white"
            >
              {(name === "password" ? showPassword : showConfirmPassword) ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          )}
        </div>
        {errors[name] && name !== "email" && (
          <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-600 flex items-center justify-center p-4">
      <Toaster position="top-center" expand={true} richColors />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-20 h-20 bg-blue-400/20 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-blue-400/20 rounded-full blur-xl" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-blue-400/20 rounded-full blur-xl" />
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-4xl relative">
        <div className="mb-4 flex justify-center">
          <div className="w-24 h-24 flex items-center justify-center">
            <Image
              src="/logo_kominfo.png"
              alt="Kominfo Logo"
              width={160}
              height={160}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Registrasi Akun
        </h2>

        <form onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kolom Kiri */}
            <div className="space-y-4">
              {renderInput("NIP", "nip", "text", "Masukkan NIP")}
              {renderInput(
                "Nama Lengkap",
                "nama",
                "text",
                "Masukkan nama lengkap"
              )}
              {renderInput("Email", "email", "email", "email@gmail.com")}
              {renderInput(
                "Nomor Telepon",
                "no_telp",
                "tel",
                "Masukkan nomor telepon"
              )}
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-4">
              {renderInput("Alamat", "alamat", "text", "Masukkan alamat", true)}
              {renderInput(
                "Password",
                "password",
                "password",
                "Minimal 8 karakter"
              )}
              {renderInput(
                "Konfirmasi Password",
                "password_confirmation",
                "password",
                "Masukkan ulang password"
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <div className="mt-6 text-center text-white/80 text-sm">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-white hover:underline">
            Login di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
