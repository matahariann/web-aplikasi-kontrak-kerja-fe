"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyEmail, resendVerificationCode } from "@/services/user";
import { Toaster, toast } from "sonner";
import Image from "next/image";

export default function Verification() {
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
      router.push("/register");
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
        description: "Anda akan dialihkan ke halaman login",
        duration: 2000,
      });
      setTimeout(() => router.push("/login"), 2000);
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
      await resendVerificationCode(email);
      toast.success("Kode verifikasi baru telah dikirim ke email Anda");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-600 flex items-center justify-center p-4">
      <Toaster position="top-center" expand={true} richColors />

      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md relative">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo_kominfo.png"
            alt="Kominfo Logo"
            width={160}
            height={160}
            className="w-24 h-24 object-contain"
            priority
          />
        </div>

        <h2 className="text-2xl font-semibold text-white mb-4 text-center">
          Verifikasi Email
        </h2>

        <p className="text-white/80 text-center mb-6">
          Masukkan kode verifikasi 6 digit yang telah dikirim ke email{" "}
          <span className="font-semibold">{email}</span>
        </p>

        <form onSubmit={handleVerification} className="space-y-4">
          <div>
            <label className="block text-white text-sm mb-2">
              Kode Verifikasi
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => {
                // Only allow numeric input
                const numericValue = e.target.value.replace(/\D/g, "");
                // Limit to 6 characters
                setVerificationCode(numericValue.slice(0, 6));
              }}
              placeholder="Masukkan 6 digit kode"
              maxLength={6}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Memverifikasi..." : "Verifikasi"}
          </button>
        </form>

        <div className="mt-4 text-center text-white/80 text-sm">
          Tidak menerima kode?{" "}
          <button
            onClick={handleResendCode}
            disabled={isResending}
            className="text-white hover:underline disabled:opacity-50"
          >
            {isResending ? "Mengirim..." : "Kirim ulang kode"}
          </button>
        </div>
      </div>
    </div>
  );
}
