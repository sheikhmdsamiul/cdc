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

type Account = { u: string; r: string; rEn: string; badge: string; avatar: string };
type Group = { group: string; groupEn: string; accent: string; bg: string; items: Account[] };

const DEMO_GROUPS: Group[] = [
  {
    group: "বৈশ্বিক",
    groupEn: "Global",
    accent: "border-red-400",
    bg: "bg-red-50",
    items: [
      { u: "superadmin", r: "সুপার অ্যাডমিন",  rEn: "Super Admin",  badge: "bg-red-100 text-red-700",    avatar: "bg-red-500" },
      { u: "headoffice", r: "প্রধান কার্যালয়", rEn: "Head Office",  badge: "bg-purple-100 text-purple-700", avatar: "bg-purple-500" },
    ],
  },
  {
    group: "টঙ্গী (বালক)",
    groupEn: "Tongi — Boys",
    accent: "border-teal-400",
    bg: "bg-teal-50",
    items: [
      { u: "centeradmin_tongi",  r: "কেন্দ্র প্রশাসক",    rEn: "Center Admin",      badge: "bg-blue-100 text-blue-700",   avatar: "bg-blue-500" },
      { u: "supt_tongi",         r: "তত্ত্বাবধায়ক",        rEn: "Superintendent",    badge: "bg-teal-100 text-teal-700",   avatar: "bg-teal-600" },
      { u: "po_tongi",           r: "প্রবেশন কর্মকর্তা",  rEn: "Probation Officer", badge: "bg-amber-100 text-amber-700", avatar: "bg-amber-500" },
      { u: "cw_tongi",           r: "কেস ওয়ার্কার",       rEn: "Case Worker",       badge: "bg-green-100 text-green-700", avatar: "bg-green-600" },
      { u: "deo_tongi",          r: "ডাটা এন্ট্রি অপারেটর", rEn: "Data Entry Operator", badge: "bg-cyan-100 text-cyan-700", avatar: "bg-cyan-600" },
      { u: "houseparent_tongi",  r: "হাউস প্যারেন্ট",     rEn: "House Parent",      badge: "bg-orange-100 text-orange-700", avatar: "bg-orange-500" },
      { u: "df_tongi",           r: "জেলা ফ্যাসিলিটেটর",  rEn: "District Facilitator", badge: "bg-purple-100 text-purple-700", avatar: "bg-purple-500" },
    ],
  },
  {
    group: "কোনাবাড়ি (বালিকা)",
    groupEn: "Konabari — Girls",
    accent: "border-pink-400",
    bg: "bg-pink-50",
    items: [
      { u: "centeradmin_konabari", r: "কেন্দ্র প্রশাসক",   rEn: "Center Admin",      badge: "bg-blue-100 text-blue-700",   avatar: "bg-blue-500" },
      { u: "supt_konabari",        r: "তত্ত্বাবধায়ক",       rEn: "Superintendent",    badge: "bg-teal-100 text-teal-700",   avatar: "bg-teal-600" },
      { u: "po_konabari",          r: "প্রবেশন কর্মকর্তা", rEn: "Probation Officer", badge: "bg-amber-100 text-amber-700", avatar: "bg-amber-500" },
      { u: "cw_konabari",          r: "কেস ওয়ার্কার",      rEn: "Case Worker",       badge: "bg-green-100 text-green-700", avatar: "bg-green-600" },
      { u: "deo_konabari",         r: "ডাটা এন্ট্রি অপারেটর", rEn: "Data Entry Operator", badge: "bg-cyan-100 text-cyan-700", avatar: "bg-cyan-600" },
      { u: "df_konabari",          r: "জেলা ফ্যাসিলিটেটর",  rEn: "District Facilitator", badge: "bg-purple-100 text-purple-700", avatar: "bg-purple-500" },
    ],
  },
  {
    group: "ফুলারহাট (বালক)",
    groupEn: "Fulerhat — Boys",
    accent: "border-indigo-400",
    bg: "bg-indigo-50",
    items: [
      { u: "centeradmin_fulerhat", r: "কেন্দ্র প্রশাসক",   rEn: "Center Admin",      badge: "bg-blue-100 text-blue-700",   avatar: "bg-blue-500" },
      { u: "supt_fulerhat",        r: "তত্ত্বাবধায়ক",       rEn: "Superintendent",    badge: "bg-teal-100 text-teal-700",   avatar: "bg-teal-600" },
      { u: "po_fulerhat",          r: "প্রবেশন কর্মকর্তা", rEn: "Probation Officer", badge: "bg-amber-100 text-amber-700", avatar: "bg-amber-500" },
      { u: "cw_fulerhat",          r: "কেস ওয়ার্কার",      rEn: "Case Worker",       badge: "bg-green-100 text-green-700", avatar: "bg-green-600" },
      { u: "deo_fulerhat",         r: "ডাটা এন্ট্রি অপারেটর", rEn: "Data Entry Operator", badge: "bg-cyan-100 text-cyan-700", avatar: "bg-cyan-600" },
      { u: "df_fulerhat",          r: "জেলা ফ্যাসিলিটেটর",  rEn: "District Facilitator", badge: "bg-purple-100 text-purple-700", avatar: "bg-purple-500" },
    ],
  },
];

export default function Login() {
  const { login } = useAuth();
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const [, navigate] = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState<string | null>(null);

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

  const quickLogin = (u: string) => {
    setUsername(u);
    setPassword("Admin@1234");
    setHighlighted(u);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <div className="h-1 bg-gradient-to-r from-green-700 via-red-500 to-green-700 flex-shrink-0" />

      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ══════════ LEFT — Login form ══════════ */}
        <div className="flex flex-col w-full lg:w-[420px] flex-shrink-0 bg-white shadow-2xl z-10">

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

        {/* ══════════ RIGHT — Demo accounts ══════════ */}
        <div className="hidden lg:flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Header strip */}
          <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex-shrink-0 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">
                {isBn ? "ডেমো অ্যাকাউন্ট" : "Demo Accounts"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn ? "যেকোনো একটিতে ক্লিক করুন — পাসওয়ার্ড স্বয়ংক্রিয়ভাবে পূরণ হবে" : "Click any account — password fills automatically"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-3 py-1.5">
              <Lock className="h-3 w-3 text-slate-400" />
              <code className="text-[11px] font-mono font-bold text-slate-600">Admin@1234</code>
            </div>
          </div>

          {/* Groups */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {DEMO_GROUPS.map(grp => (
              <div key={grp.group} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Group label */}
                <div className={`flex items-center gap-2 px-4 py-2 border-b border-slate-100 ${grp.bg}`}>
                  <div className={`w-1 h-4 rounded-full ${grp.accent.replace("border-", "bg-")}`} />
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                    {isBn ? grp.group : grp.groupEn}
                  </span>
                  <span className="ml-auto text-[10px] text-slate-400">{grp.items.length} {isBn ? "জন" : "users"}</span>
                </div>

                {/* 2-column grid of account cards */}
                <div className="grid grid-cols-2 gap-px bg-slate-100">
                  {grp.items.map(a => (
                    <button
                      key={a.u}
                      type="button"
                      onClick={() => quickLogin(a.u)}
                      className={`flex items-center gap-2.5 px-3.5 py-3 bg-white hover:bg-green-50 transition-all text-left group ${highlighted === a.u ? "ring-2 ring-inset ring-green-400 bg-green-50" : ""}`}
                    >
                      {/* Avatar */}
                      <div className={`h-7 w-7 rounded-lg ${a.avatar} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-[10px] font-extrabold text-white uppercase">{a.u.charAt(0)}</span>
                      </div>
                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-mono font-bold text-slate-700 group-hover:text-green-700 truncate leading-tight">
                          {a.u}
                        </p>
                        <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 leading-none ${a.badge}`}>
                          {isBn ? a.r : a.rEn}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <p className="text-center text-[10px] text-slate-400 pb-2">
              {isBn ? "এই অ্যাকাউন্টগুলি শুধুমাত্র ডেমো উদ্দেশ্যে।" : "For demonstration purposes only."}
            </p>
          </div>
        </div>

      </div>

      <div className="h-1 bg-gradient-to-r from-green-700 via-red-500 to-green-700 flex-shrink-0" />
    </div>
  );
}
