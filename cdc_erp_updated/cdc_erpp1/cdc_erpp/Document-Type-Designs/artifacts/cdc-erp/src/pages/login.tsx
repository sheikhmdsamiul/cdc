import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Shield, Lock, User, ArrowLeft, LogIn } from "lucide-react";


export default function Login() {
  const { login } = useAuth();
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const [, navigate] = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message ?? (isBn ? "ব্যবহারকারীর নাম বা পাসওয়ার্ড ভুল।" : "Invalid username or password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-800 via-green-700 to-teal-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>
      <div className="h-1 bg-gradient-to-r from-green-700 via-red-500 to-green-700 flex-shrink-0" />

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        {/* Login form */}
        <div className="flex flex-col w-full max-w-[420px] bg-white shadow-2xl rounded-2xl overflow-hidden z-10 border border-white/10">


          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 flex-shrink-0">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-green-700 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {isBn ? "পোর্টালে ফিরুন" : "Back to Portal"}
            </button>
            <LanguageSwitcher />
          </div>

          {/* Branding */}
          <div className="bg-gradient-to-br from-green-800 to-teal-700 text-white px-8 py-8 flex-shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative flex items-center gap-4">
              <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center ring-2 ring-white/30 flex-shrink-0">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-green-200 font-medium tracking-wider uppercase">{isBn ? "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার" : "Government of the People's Republic of Bangladesh"}</p>
                <p className="text-lg font-extrabold leading-tight">{isBn ? "সিডিসি-এমআইএস" : "CDC MIS"}</p>
                <p className="text-[11px] text-green-200 mt-0.5">{isBn ? "শিশু উন্নয়ন কেন্দ্র ব্যবস্থাপনা সিস্টেম" : "Child Development Center Management System"}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 flex flex-col px-8 py-7 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-[15px] font-bold text-slate-900">
                {isBn ? "আপনার অ্যাকাউন্টে সাইন ইন করুন" : "Sign in to your account"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn ? "শুধুমাত্র অনুমোদিত কর্মকর্তাদের জন্য" : "Authorised personnel only"}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="py-2 mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  {isBn ? "ব্যবহারকারীর নাম" : "Username"}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    autoFocus
                    className="pl-9 h-10 text-sm border-slate-200 focus-visible:ring-green-500 bg-slate-50"
                    placeholder={isBn ? "ব্যবহারকারীর নাম লিখুন" : "Enter username"}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  {isBn ? "পাসওয়ার্ড" : "Password"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pl-9 h-10 text-sm border-slate-200 focus-visible:ring-green-500 bg-slate-50"
                    placeholder={isBn ? "পাসওয়ার্ড লিখুন" : "Enter password"}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#166534] hover:bg-[#0d4427] font-semibold text-sm gap-2 rounded-lg shadow-md mt-1"
              >
                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    {isBn ? "প্রবেশ হচ্ছে..." : "Signing in..."}
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    {isBn ? "প্রবেশ করুন" : "Sign In"}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-auto pt-6 text-center">
              <p className="text-[10px] text-slate-300">
                {isBn ? "© ২০২৬ সমাজকল্যাণ মন্ত্রণালয় · গণপ্রজাতন্ত্রী বাংলাদেশ সরকার" : "© 2026 Ministry of Social Welfare · Government of Bangladesh"}
              </p>
            </div>
          </div>
        </div>

      </div>


      <div className="h-1 bg-gradient-to-r from-green-700 via-red-500 to-green-700 flex-shrink-0" />
    </div>
  );
}
