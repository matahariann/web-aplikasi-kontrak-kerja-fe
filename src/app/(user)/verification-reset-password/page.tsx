"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail, resendResetPasswordCode } from "@/services/user";
import { Toaster, toast } from "sonner";
import Image from "next/image";

export default function VerifyResetPassword() {
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [userId, setUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const userIdParam = searchParams.get("user_id");
    const emailParam = searchParams.get("email");
    if (userIdParam) {
      setUserId(userIdParam);
      setEmail(emailParam);
    } else {
      // Redirect if no user ID
      router.push("/forgot-password");
    }
  }, [searchParams, router]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!verificationCode.trim()) {
      toast.error("Kode verifikasi tidak boleh kosong");
      return;
    }

    if (verificationCode.length !== 6) {
      toast.error("Kode verifikasi harus 6 digit");
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmail(userId, verificationCode);
      toast.success("Verifikasi berhasil!", {
        description: "Silakan buat password baru",
        duration: 2000,
      });
      // Redirect to reset password page after successful verification
      setTimeout(() => router.push(`/reset-password?user_id=${userId}`), 2000);
    } catch (error: any) {
      toast.error(error.message || "Verifikasi gagal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email tidak tersedia");
      return;
    }

    setIsResending(true);
    try {
      await resendResetPasswordCode(email);
      toast.success("Kode verifikasi baru telah dikirim ke email Anda");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <Toaster position="top-center" expand={true} richColors />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-red-800/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl animate-pulse delay-150" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl animate-pulse delay-300" />
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-md relative border border-white/20 shadow-2xl">
        {/* Logo Container with Glow Effect */}
        <div className="mb-8 flex justify-center relative">
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

        <h2 className="text-2xl font-bold text-white mb-4 text-center tracking-wide">
          Verifikasi Email
        </h2>

        <p className="text-white/80 text-center mb-8">
          Masukkan kode verifikasi 6 digit yang telah dikirim ke email{" "}
          <span className="font-semibold text-white">{email}</span>
        </p>

        <form onSubmit={handleVerification} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-white/90 text-sm font-medium pl-1">
              Kode Verifikasi
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, "");
                setVerificationCode(numericValue.slice(0, 6));
              }}
              placeholder="Masukkan 6 digit kode"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-center text-2xl tracking-wide
                       placeholder-white/40 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 
                       transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 
                     text-white py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                     font-semibold text-lg shadow-lg shadow-blue-900/30"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memverifikasi...
              </span>
            ) : (
              "Verifikasi"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-white/80 text-sm">
          Tidak menerima kode?{" "}
          <button
            onClick={handleResendCode}
            disabled={isResending}
            className="text-white font-medium hover:underline transition-all duration-300 disabled:opacity-50"
          >
            {isResending ? "Mengirim..." : "Kirim ulang kode"}
          </button>
        </div>
      </div>
    </div>
  );
}