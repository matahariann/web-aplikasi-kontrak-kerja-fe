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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <Toaster position="top-center" expand={true} richColors />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-red-800/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl animate-pulse delay-150" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl animate-pulse delay-300" />
        <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-4xl relative border border-white/20 shadow-2xl">
        {/* Logo Container with Glow Effect */}
        <div className="mb-6 flex justify-center relative">
          <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full" />
          <div className="w-32 h-32 relative">
            <Image
              src="/logo_komdigi.png"
              alt="Logo Komdigi"
              width={160}
              height={160}
              className="w-full h-full object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-8 text-center tracking-wide">
          Registrasi Akun
        </h2>

        <form onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
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

            {/* Right Column */}
            <div className="space-y-6">
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
            className="w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 
                     text-white py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                     font-semibold text-lg shadow-lg shadow-blue-900/30"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Mendaftar...
              </span>
            ) : (
              "Daftar"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-white/80 text-sm">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-white font-medium hover:underline transition-all duration-300"
          >
            Login di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
