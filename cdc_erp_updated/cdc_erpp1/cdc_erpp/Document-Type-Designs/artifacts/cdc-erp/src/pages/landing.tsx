import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  Shield, Users, FileText, Scale, HeartPulse,
  Building2, Phone, Mail, MapPin, Lock, Globe, ChevronRight,
  BookOpen, ClipboardList, AlertTriangle, ShieldCheck
} from "lucide-react";

const NOTICES = [
  { date: "০৩ এপ্রিল ২০২৬", text: "কোনাবাড়ি কেন্দ্রে নতুন ৫ জন শিশু ভর্তি হয়েছে।" },
  { date: "০১ এপ্রিল ২০২৬", text: "টঙ্গী কেন্দ্রে মাসিক স্বাস্থ্য পরীক্ষা সম্পন্ন হয়েছে।" },
  { date: "২৮ মার্চ ২০২৬", text: "ফুলারহাট কেন্দ্রে বার্ষিক নিরীক্ষা কার্যক্রম অনুষ্ঠিত হবে।" },
  { date: "২৫ মার্চ ২০২৬", text: "শিশু উন্নয়ন কেন্দ্র কর্মকর্তাদের প্রশিক্ষণ কর্মশালা আয়োজন করা হয়েছে।" },
];

const SERVICES = [
  { icon: Users,         title: "শিশু ব্যবস্থাপনা",   en: "Children Management",  desc: "কেন্দ্রে আবাসিত শিশুদের তথ্য",       color: "bg-teal-600" },
  { icon: FileText,      title: "মামলা ব্যবস্থাপনা",  en: "Case Management",      desc: "সামাজিক মামলার তথ্য ও অবস্থা",      color: "bg-blue-700" },
  { icon: Scale,         title: "আদালতের মামলা",      en: "Court Cases",          desc: "বিচারাধীন মামলা পর্যবেক্ষণ",       color: "bg-indigo-700" },
  { icon: HeartPulse,    title: "স্বাস্থ্য রেকর্ড",   en: "Health Records",       desc: "শিশুদের স্বাস্থ্য তথ্য ও পরীক্ষা", color: "bg-rose-600" },
  { icon: ShieldCheck,   title: "ঝুঁকি মূল্যায়ন",    en: "Risk Assessment",      desc: "শিশুর ঝুঁকি স্তর নির্ধারণ",        color: "bg-amber-600" },
  { icon: BookOpen,      title: "শিক্ষা পরিকল্পনা",  en: "Education Plans",      desc: "প্রতিটি শিশুর পাঠ্যক্রম ও অগ্রগতি",color: "bg-green-700" },
  { icon: ClipboardList, title: "অবমুক্তি রেকর্ড",   en: "Release Records",      desc: "কেন্দ্র থেকে অবমুক্তির তথ্য",      color: "bg-purple-700" },
  { icon: AlertTriangle, title: "ফলো-আপ",             en: "Follow-ups",           desc: "অবমুক্তি পরবর্তী পর্যবেক্ষণ",      color: "bg-orange-600" },
];

const CENTERS = [
  { name: "শিশু উন্নয়ন কেন্দ্র (বালক) টঙ্গী",       en: "CDC (Boys) Tongi",       addr: "টঙ্গী, গাজীপুর" },
  { name: "শিশু উন্নয়ন কেন্দ্র (বালিকা) কোনাবাড়ি", en: "CDC (Girls) Konabari",   addr: "কোনাবাড়ি, গাজীপুর" },
  { name: "শিশু উন্নয়ন কেন্দ্র (বালক) ফুলারহাট",    en: "CDC (Boys) Fulerhat",    addr: "ফুলারহাট, খুলনা" },
];

export default function Landing() {
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const [, navigate] = useLocation();

  const goLogin = () => navigate("/login");

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Bangladesh Government top ribbon */}
      <div className="h-1.5 bg-gradient-to-r from-green-700 via-red-600 to-green-700" />

      {/* Government Header */}
      <header className="bg-[#006747] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-5">
          <div className="flex-shrink-0 h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
            <Shield className="h-9 w-9 text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-green-200 font-medium tracking-wide">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
            <h1 className="text-xl md:text-2xl font-bold leading-tight">সমাজকল্যাণ মন্ত্রণালয়</h1>
            <p className="text-sm text-green-200">শিশু উন্নয়ন কেন্দ্র ব্যবস্থাপনা তথ্য সিস্টেম</p>
            <p className="text-[11px] text-green-300">Child Development Centre Management Information System (CDC-MIS)</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <LanguageSwitcher />
            <Button
              onClick={goLogin}
              className="bg-white text-green-800 hover:bg-green-50 font-semibold h-9 px-4 gap-1.5 text-sm shadow"
            >
              <Lock className="h-3.5 w-3.5" />
              {isBn ? "প্রবেশ করুন" : "Sign In"}
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation bar */}
      <nav className="bg-[#004d34] text-white/90 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-0 overflow-x-auto">
          {[
            isBn ? "হোম" : "Home",
            isBn ? "আমাদের সম্পর্কে" : "About Us",
            isBn ? "কেন্দ্রসমূহ" : "Centers",
            isBn ? "সেবাসমূহ" : "Services",
            isBn ? "আইন ও বিধি" : "Laws & Rules",
            isBn ? "যোগাযোগ" : "Contact",
          ].map((item, i) => (
            <button
              key={i}
              className={`px-4 py-2.5 whitespace-nowrap hover:bg-white/10 transition-colors ${i === 0 ? "bg-white/15 font-semibold" : ""}`}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-green-800 via-green-700 to-teal-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-white/30">
              {isBn ? "ডিজিটাল বাংলাদেশ উদ্যোগ" : "Digital Bangladesh Initiative"}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
              {isBn
                ? <><span>শিশু উন্নয়নে</span><br /><span>একটি সমন্বিত ডিজিটাল প্ল্যাটফর্ম</span></>
                : <><span>A Unified Digital Platform</span><br /><span>for Child Development</span></>}
            </h2>
            <p className="text-green-100 text-base mb-6 leading-relaxed max-w-xl">
              {isBn
                ? "বাংলাদেশের তিনটি শিশু উন্নয়ন কেন্দ্রের শিশুদের সামাজিক, আইনি, স্বাস্থ্য ও শিক্ষামূলক তথ্য পরিচালনার জন্য একটি আধুনিক তথ্য ব্যবস্থাপনা সিস্টেম।"
                : "A modern management information system for social, legal, health, and educational records of children across Bangladesh's three Child Development Centres."}
            </p>
            <Button
              onClick={goLogin}
              className="bg-white text-green-800 hover:bg-green-50 font-bold h-11 px-6 gap-2 text-sm shadow-lg"
            >
              <Lock className="h-4 w-4" />
              {isBn ? "সিস্টেমে প্রবেশ করুন" : "Enter the System"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#004d34] text-white py-5 border-t border-green-900">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: "৩",    l: isBn ? "কেন্দ্র"        : "Centers" },
            { v: "১৩+",  l: isBn ? "ডকটাইপ"         : "DocTypes" },
            { v: "২৪/৭", l: isBn ? "অনলাইন সেবা"    : "Online Service" },
            { v: "১০০%", l: isBn ? "ডিজিটাল রেকর্ড" : "Digital Records" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-extrabold text-white">{s.v}</p>
              <p className="text-xs text-green-300 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services grid */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900">
              {isBn ? "সিস্টেমের মডিউলসমূহ" : "System Modules"}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {isBn ? "সকল কার্যক্রম একটি প্ল্যাটফর্মে" : "All operations in one platform"}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SERVICES.map((s, i) => (
              <button
                key={i}
                onClick={goLogin}
                className="bg-white rounded-xl p-5 text-left shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all group"
              >
                <div className={`h-10 w-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-green-700">{s.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{isBn ? s.desc : s.en}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Centers + Notices */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          {/* Centers */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-700" />
              {isBn ? "পরিচালিত কেন্দ্রসমূহ" : "Managed Centers"}
            </h3>
            <div className="space-y-3">
              {CENTERS.map((c, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-green-200 transition-colors">
                  <p className="font-semibold text-gray-900 text-sm">{isBn ? c.name : c.en}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{c.addr}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* Notices */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-700" />
              {isBn ? "সাম্প্রতিক বিজ্ঞপ্তি" : "Recent Notices"}
            </h3>
            <div className="space-y-2">
              {NOTICES.map((n, i) => (
                <div key={i} className="bg-white border-l-4 border-green-500 pl-3 py-2.5 pr-3 rounded-r-xl shadow-sm">
                  <p className="text-xs text-green-700 font-semibold mb-0.5">{n.date}</p>
                  <p className="text-sm text-gray-700">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#006747] text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-bold mb-3 text-green-200 text-sm">{isBn ? "যোগাযোগ" : "Contact"}</h4>
            <div className="space-y-2 text-sm text-green-100">
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> +880-2-8100650</p>
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> dss@mswc.gov.bd</p>
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> আগারগাঁও, ঢাকা-১২০৭</p>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-green-200 text-sm">{isBn ? "দ্রুত লিঙ্ক" : "Quick Links"}</h4>
            <div className="space-y-1.5 text-sm text-green-100">
              {[
                isBn ? "সমাজসেবা অধিদপ্তর"   : "Dept. of Social Services",
                isBn ? "সমাজকল্যাণ মন্ত্রণালয়" : "Ministry of Social Welfare",
                isBn ? "শিশু আইন ২০১৩"       : "Children Act 2013",
                isBn ? "জাতীয় তথ্য বাতায়ন"  : "National Web Portal",
              ].map((l, i) => (
                <p key={i} className="hover:text-white cursor-pointer flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" />{l}
                </p>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-green-200 text-sm">{isBn ? "সিস্টেম তথ্য" : "System Info"}</h4>
            <div className="space-y-1 text-sm text-green-100">
              <p>{isBn ? "সংস্করণ: ১.০.০" : "Version: 1.0.0"}</p>
              <p>{isBn ? "সর্বশেষ আপডেট: এপ্রিল ২০২৬" : "Last Updated: April 2026"}</p>
              <div className="mt-4">
                <Button
                  onClick={goLogin}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 h-8 px-4 text-xs gap-1.5"
                >
                  <Lock className="h-3 w-3" />
                  {isBn ? "সিস্টেমে প্রবেশ করুন" : "Sign In to System"}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-green-800 py-3 text-center text-xs text-green-400">
          {isBn
            ? "এই সাইটটি সমাজকল্যাণ মন্ত্রণালয়, গণপ্রজাতন্ত্রী বাংলাদেশ সরকার কর্তৃক পরিচালিত"
            : "This site is managed by the Ministry of Social Welfare, Government of Bangladesh"}
        </div>
      </footer>

      {/* Bottom ribbon */}
      <div className="h-1.5 bg-gradient-to-r from-green-700 via-red-600 to-green-700" />
    </div>
  );
}
