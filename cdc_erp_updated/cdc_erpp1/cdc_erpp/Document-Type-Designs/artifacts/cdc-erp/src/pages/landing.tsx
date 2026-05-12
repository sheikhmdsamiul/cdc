import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import {
  TbUsers, TbFileText, TbScale, TbHeartbeat, TbShieldCheck, TbBook, TbClipboardList, TbRefresh,
  TbUser, TbChevronLeft, TbChevronRight, TbTargetArrow, TbHeartHandshake, TbGavel, TbWorld,
} from "react-icons/tb";

const navItems = [
  { key: "home", section: "home" },
  { key: "about", section: "about" },
  { key: "centers", section: "centers" },
  { key: "services", section: "services" },
  { key: "laws", section: "laws" },
  { key: "contact", section: "contact" },
] as const;

const sliderImages = ["/image1.jpeg", "/image2.jpg"] as const;
const OFFICERS = [
  {
    image: "mp.jpeg",
    nameBn: "আবু জাফর মো. আরিফ হোসেন, এমপি",
    nameEn: "Abu Jafar Md. Arif Hossain, MP",
    designationBn: "মন্ত্রী, সমাজকল্যাণ মন্ত্রণালয়",
    designationEn: "Minister, Ministry of Social Welfare",
  },
  {
    image: "mpg.jpeg",
    nameBn: "রাজিয়া ফাতিমা শারমিন, এমপি",
    nameEn: "Razia Fatema Sharmin, MP",
    designationBn: "প্রতিমন্ত্রী, সমাজকল্যাণ মন্ত্রণালয়",
    designationEn: "State Minister, Ministry of Social Welfare",
  },
  {
    image: "s.jpg",
    nameBn: "ড. মোহাম্মদ আবু ইউসুফ",
    nameEn: "Dr. Mohammad Abu Yusuf",
    designationBn: "সচিব, সমাজকল্যাণ মন্ত্রণালয়",
    designationEn: "Secretary, Ministry of Social Welfare",
  },
  {
    image: "es.jpeg",
    nameBn: "শাহ মোহাম্মদ মাহবুব",
    nameEn: "Shah Mohammad Mahbub",
    designationBn: "মহাপরিচালক (অতিরিক্ত সচিব), সমাজসেবা অধিদপ্তর",
    designationEn: "Director General, Department of Social Services",
  },
] as const;

const modules = [
  { icon: TbUsers, title: "landing.modules.children.title", desc: "landing.modules.children.desc", color: "#0f766e" },
  { icon: TbFileText, title: "landing.modules.case.title", desc: "landing.modules.case.desc", color: "#1d4ed8" },
  { icon: TbScale, title: "landing.modules.court.title", desc: "landing.modules.court.desc", color: "#4338ca" },
  { icon: TbHeartbeat, title: "landing.modules.health.title", desc: "landing.modules.health.desc", color: "#be123c" },
  { icon: TbShieldCheck, title: "landing.modules.risk.title", desc: "landing.modules.risk.desc", color: "#a16207" },
  { icon: TbBook, title: "landing.modules.education.title", desc: "landing.modules.education.desc", color: "#15803d" },
  { icon: TbClipboardList, title: "landing.modules.release.title", desc: "landing.modules.release.desc", color: "#6d28d9" },
  { icon: TbRefresh, title: "landing.modules.followup.title", desc: "landing.modules.followup.desc", color: "#c2410c" },
] as const;

const centers = [
  { name: "landing.centersData.tongi.name", meta: "landing.centersData.tongi.meta", tag: "landing.centersData.tongi.tag", girls: false },
  { name: "landing.centersData.pulerhat.name", meta: "landing.centersData.pulerhat.meta", tag: "landing.centersData.pulerhat.tag", girls: false },
  { name: "landing.centersData.konabari.name", meta: "landing.centersData.konabari.meta", tag: "landing.centersData.konabari.tag", girls: true },
] as const;

const notices = [1, 2, 3, 4, 5] as const;
const cdcCenterRows = [
  { nameBn: "শিশু উন্নয়ন কেন্দ্র", nameEn: "Child Development Centre", addressBn: "টংগী, গাজীপুর", addressEn: "Tongi, Gazipur", typeBn: "বালক", typeEn: "Boys", seats: "300", current: "693" },
  { nameBn: "শিশু উন্নয়ন কেন্দ্র", nameEn: "Child Development Centre", addressBn: "কোনাবাড়ী, গাজীপুর", addressEn: "Konabari, Gazipur", typeBn: "বালিকা", typeEn: "Girls", seats: "150", current: "68" },
  { nameBn: "শিশু উন্নয়ন কেন্দ্র", nameEn: "Child Development Centre", addressBn: "পুলেরহাট, যশোর", addressEn: "Pulerhat, Jessore", typeBn: "বালক", typeEn: "Boys", seats: "150", current: "303" },
] as const;

const cdcContacts = [
  { centerBn: "টংগী, গাজীপুর", centerEn: "Tongi, Gazipur", phoneBn: "+৮৮ ০২ ৯৮০১৩০৪", phoneEn: "+88 02 9801304", email: "super.kuk.b.gazipur@dss.gov.bd" },
  { centerBn: "কোনাবাড়ী, গাজীপুর", centerEn: "Konabari, Gazipur", phoneBn: "+৮৮ ০২ ৯২৯৮৮২৫", phoneEn: "+88 02 9298825", email: "super.kuk.g.gazipur@dss.gov.bd" },
  { centerBn: "পুলেরহাট, যশোর", centerEn: "Pulerhat, Jessore", phoneBn: "+৮৮ ০৪২১ ৬৮৫২৪", phoneEn: "+88 0421 68524", email: "super.kuk.b.jessore@dss.gov.bd" },
] as const;

function banglaNumber(n: string, isBn: boolean) {
  if (!isBn) return n;
  const map: Record<string, string> = { "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯" };
  return n.replace(/[0-9]/g, (x) => map[x] ?? x);
}

export default function Landing() {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const [, navigate] = useLocation();
  const [active, setActive] = useState("home");
  const [slide, setSlide] = useState(0);

  const stats = useMemo(() => [
    { value: banglaNumber("3", isBn), label: t("landing.stats.centers") },
    { value: banglaNumber("387", isBn), label: t("landing.stats.children") },
    { value: banglaNumber("13+", isBn), label: t("landing.stats.docs") },
    { value: banglaNumber("24/7", isBn), label: t("landing.stats.service") },
  ], [isBn, t]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { threshold: [0.3, 0.6], rootMargin: "-25% 0px -45% 0px" },
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.section);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, []);

  const scrollTo = (id: string) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const prevSlide = () => setSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  const nextSlide = () => setSlide((prev) => (prev + 1) % sliderImages.length);

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="h-1" style={{ background: "linear-gradient(90deg,#006747 0 50%,#C8102E 50% 100%)" }} />

      <header className="bg-white border-b-2 border-[#006747]">
        <div className="max-w-[1060px] mx-auto px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="h-[68px] w-[68px] rounded-full border-2 border-[#006747] grid place-items-center bg-white">
            <img src="/logo.webp" alt="logo" className="h-[62px] w-[62px] object-contain mix-blend-multiply" />
          </div>
          <div className="text-center flex-1">
            <p className="text-[11px] text-[#555]">{t("landing.header.gov")}</p>
            <h1 className="text-[22px] font-bold text-[#006747] leading-tight">{t("landing.header.dept")}</h1>
            <p className="text-[12.5px] text-slate-800">{t("landing.header.short")}</p>
            <p className="text-[11px] text-slate-400">{t("landing.header.full")}</p>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={() => i18n.changeLanguage(isBn ? "en" : "bn")}
              className="h-10 px-5 rounded-lg bg-[#006747] text-white text-sm font-semibold"
            >
              {isBn ? "English" : "বাংলা"}
            </button>
            <button onClick={() => navigate("/login")} className="h-10 px-5 rounded-lg bg-[#C8102E] text-white text-sm font-semibold">
              {t("landing.signIn")}
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-[#006747] sticky top-0 z-20">
        <div className="max-w-[1060px] mx-auto px-2 flex overflow-x-auto">
          {navItems.map((item) => {
            const isActive = active === item.section;
            return (
              <button
                key={item.key}
                onClick={() => scrollTo(item.section)}
                className={`px-4 py-3 text-sm whitespace-nowrap transition ${isActive ? "bg-white/15 text-white border-b-2 border-white" : "text-white/75 hover:text-white"}`}
              >
                {t(`landing.nav.${item.key}`)}
              </button>
            );
          })}
        </div>
      </nav>

      <section id="home" className="bg-white py-10">
        <div className="max-w-[1060px] mx-auto px-4 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <p className="inline-block text-xs rounded border border-[#006747]/30 px-3 py-1 text-[#006747]">{t("landing.hero.badge")}</p>
            <h2 className="mt-3 text-[28px] leading-tight font-bold">
              {t("landing.hero.title1")} <span className="text-[#006747]">{t("landing.hero.title2")}</span>
            </h2>
            <p className="mt-4 text-[13.5px] leading-[1.75] text-slate-600">{t("landing.hero.desc")}</p>
            <button onClick={() => scrollTo("about")} className="mt-5 h-10 px-5 rounded bg-[#006747] text-white text-sm font-semibold">
              {t("landing.hero.learnMore")}
            </button>
          </div>

          <div className="relative h-[320px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
            {sliderImages.map((img, idx) => (
              <img
                key={img}
                src={img}
                alt={`slide-${idx + 1}`}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${idx === slide ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <button
              onClick={prevSlide}
              className="absolute z-30 left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/55 text-white grid place-items-center hover:bg-black/70 shadow-lg"
              aria-label="Previous slide"
            >
              <TbChevronLeft className="text-xl" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute z-30 right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/55 text-white grid place-items-center hover:bg-black/70 shadow-lg"
              aria-label="Next slide"
            >
              <TbChevronRight className="text-xl" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {sliderImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSlide(idx)}
                  className={`h-2.5 w-2.5 rounded-full ${idx === slide ? "bg-white" : "bg-white/50"}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#006747] text-white">
        <div className="max-w-[1060px] mx-auto grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, idx) => (
            <div key={s.label} className={`py-5 text-center ${idx !== 3 ? "md:border-r border-white/20" : ""}`}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-xs text-white/90">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="py-12 bg-white">
        <div className="max-w-[1060px] mx-auto px-4">
          <div className="grid lg:grid-cols-[65%_35%] gap-4 items-start">
            <div className="lg:mt-10">
              <h3 className="text-xl font-bold border-l-4 border-[#C8102E] pl-3">{t("landing.modules.heading")}</h3>
              <p className="text-sm text-slate-500 mt-1 mb-5">{t("landing.modules.subheading")}</p>
              <div className="grid sm:grid-cols-2 gap-4">
              {modules.map((m) => (
                <button key={m.title} onClick={() => navigate("/login?from=module")} className="text-left border rounded-lg p-4 hover:shadow-md transition">
                  <div className="h-10 w-10 rounded-full grid place-items-center text-white" style={{ background: m.color }}>
                    <m.icon className="text-lg" />
                  </div>
                  <p className="font-semibold mt-3">{t(m.title)}</p>
                  <p className="text-xs text-slate-500 mt-1">{t(m.desc)}</p>
                </button>
              ))}
              </div>
            </div>
            <aside className="bg-slate-50 border border-slate-200 rounded-lg p-3 lg:-mt-6">
              <div className="space-y-3">
                {OFFICERS.map((officer) => (
                  <div key={officer.image} className="border border-slate-200 bg-white rounded-lg p-3 text-center">
                    <img
                      src={`/${officer.image}`}
                      alt={isBn ? officer.nameBn : officer.nameEn}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                        const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (next) next.style.display = "grid";
                      }}
                      className="w-[120px] h-[150px] object-cover object-top mx-auto rounded"
                    />
                    <div className="w-[120px] h-[150px] hidden place-items-center bg-slate-200 mx-auto rounded">
                      <TbUser className="text-slate-500 text-2xl" />
                    </div>
                    <p className="mt-2 text-[12px] font-bold leading-snug">{isBn ? officer.nameBn : officer.nameEn}</p>
                    <p className="mt-1 text-[10.5px] text-[#006747] leading-snug">{isBn ? officer.designationBn : officer.designationEn}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="centers" className="py-10 bg-white">
        <div className="max-w-[1060px] mx-auto px-4 grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-bold mb-3">{t("landing.centers.heading")}</h3>
            <div className="space-y-3">
              {centers.map((c) => (
                <div key={c.name} className={`border rounded-lg p-4 ${c.girls ? "border-[#C8102E]/30 bg-[#fff5f6]" : "border-[#006747]/30 bg-[#f4fbf7]"}`}>
                  <p className="font-semibold">{t(c.name)}</p>
                  <p className="text-xs text-slate-600 mt-1">{t(c.meta)}</p>
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${c.girls ? "bg-[#C8102E]/15 text-[#C8102E]" : "bg-[#006747]/15 text-[#006747]"}`}>{t(c.tag)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-3">{t("landing.notices.heading")}</h3>
            <div className="space-y-2">
              {notices.map((n) => (
                <div key={n} className="border border-slate-200 border-l-4 border-l-[#C8102E] rounded-r-lg p-3">
                  <p className="text-sm font-semibold text-[#C8102E]">{t(`landing.notices.items.n${n}.date`)}</p>
                  <p className="text-sm mt-1">{t(`landing.notices.items.n${n}.text`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-12 bg-slate-100">
        <div className="max-w-[1060px] mx-auto px-4 grid md:grid-cols-3 gap-4 text-center">
          {[
            [TbTargetArrow, "landing.about.goal.title", "landing.about.goal.desc"],
            [TbScale, "landing.about.legal.title", "landing.about.legal.desc"],
            [TbHeartHandshake, "landing.about.rehab.title", "landing.about.rehab.desc"],
          ].map(([Icon, title, desc]) => (
            <div key={title} className="bg-white border rounded-lg p-5">
              <div className="h-14 w-14 rounded-full mx-auto grid place-items-center bg-[#006747]/10 text-[#006747]"><Icon className="text-2xl" /></div>
              <p className="font-bold mt-3">{t(title)}</p>
              <p className="text-sm text-slate-600 mt-2">{t(desc)}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="laws" className="py-12 bg-white">
        <div className="max-w-[1060px] mx-auto px-4 grid md:grid-cols-3 gap-4">
          {[
            [TbGavel, "landing.laws.childrenAct", "http://bdlaws.minlaw.gov.bd/act-1119.html"],
            [TbWorld, "landing.laws.uncrc", "https://www.unicef.org"],
            [TbScale, "landing.laws.juvenile", "http://bdlaws.minlaw.gov.bd/act-1119.html"],
          ].map(([Icon, title, url]) => (
            <a key={title} href={url} target="_blank" rel="noopener noreferrer" className="border rounded-lg p-4 block hover:shadow-md transition cursor-pointer">
              <div className="h-10 w-10 rounded-full bg-[#006747]/10 text-[#006747] grid place-items-center"><Icon className="text-lg" /></div>
              <p className="font-semibold mt-3">{t(title)}</p>
              <p className="text-xs text-slate-500 mt-1">{url}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="contact" className="py-12 bg-slate-100">
        <div className="max-w-[1060px] mx-auto px-4 space-y-4">
          <div className="bg-white border rounded-lg p-5">
            <h3 className="text-xl font-bold text-[#006747]">{isBn ? "শিশু উন্নয়ন কেন্দ্র" : "Child Development Centre"}</h3>
            <p className="text-sm text-slate-700 mt-2 leading-7">
              {isBn
                ? "শিশু আইন ২০১৩ অনুযায়ী আইনের সাথে সংঘর্ষে জড়িত বা সংস্পর্শে আসা শিশুদের উন্নয়ন ও স্বাভাবিক জীবনে একীভূত করার লক্ষ্যে শিশু উন্নয়ন কেন্দ্র পরিচালিত হচ্ছে।"
                : "Under the Children Act 2013, Child Development Centres are run to rehabilitate and reintegrate children in conflict/contact with the law."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-5">
              <h4 className="font-bold mb-2">{isBn ? "সংশ্লিষ্ট আইন বিধি" : "Related Laws"}</h4>
              <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
                <li>{isBn ? "শিশু আইন ২০১৩" : "Children Act 2013"}</li>
                <li>{isBn ? "প্রবেশন অব অফেন্ডার্স অর্ডিনেন্স ১৯৬০" : "Probation of Offenders Ordinance 1960"}</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-5">
              <h4 className="font-bold mb-2">{isBn ? "প্রধান সেবা" : "Key Services"}</h4>
              <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
                <li>{isBn ? "শিশু আদালত কর্তৃক প্রেরীত শিশুকে গ্রহণ" : "Receive children referred by juvenile courts"}</li>
                <li>{isBn ? "রক্ষণাবেক্ষণ ও নিরাপত্তা প্রদান" : "Care, maintenance and safety support"}</li>
                <li>{isBn ? "শিক্ষা, বৃত্তিমূলক ও দক্ষতা উন্নয়ন প্রশিক্ষণ" : "Education and vocational skills training"}</li>
                <li>{isBn ? "কাউন্সেলিং, পুনর্বাসন ও ফলো-আপ" : "Counseling, rehabilitation and follow-up"}</li>
              </ul>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-5 overflow-x-auto">
            <h4 className="font-bold mb-3">{isBn ? "সেবাদান কেন্দ্র" : "Service Centres"}</h4>
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">{isBn ? "প্রতিষ্ঠানের নাম" : "Institution Name"}</th>
                  <th className="py-2">{isBn ? "ঠিকানা" : "Address"}</th>
                  <th className="py-2">{isBn ? "নিবাসীর ধরন" : "Resident Type"}</th>
                  <th className="py-2">{isBn ? "অনুমোদিত আসন" : "Approved Seats"}</th>
                  <th className="py-2">{isBn ? "বর্তমান নিবাসি" : "Current Residents"}</th>
                </tr>
              </thead>
              <tbody>
                {cdcCenterRows.map((r) => (
                  <tr key={r.addressEn} className="border-b last:border-b-0">
                    <td className="py-2">{isBn ? r.nameBn : r.nameEn}</td>
                    <td className="py-2">{isBn ? r.addressBn : r.addressEn}</td>
                    <td className="py-2">{isBn ? r.typeBn : r.typeEn}</td>
                    <td className="py-2">{banglaNumber(r.seats, isBn)}</td>
                    <td className="py-2">{banglaNumber(r.current, isBn)}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-2">{isBn ? "মোট" : "Total"}</td>
                  <td />
                  <td />
                  <td className="py-2">{banglaNumber("600", isBn)}</td>
                  <td className="py-2">{banglaNumber("1064", isBn)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-white border rounded-lg p-5 overflow-x-auto">
            <h4 className="font-bold mb-3">{isBn ? "যার সাথে যোগাযোগ করতে হবে" : "Who to Contact"}</h4>
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">{isBn ? "কেন্দ্র" : "Centre"}</th>
                  <th className="py-2">{isBn ? "ফোন" : "Phone"}</th>
                  <th className="py-2">{isBn ? "ইমেইল" : "Email"}</th>
                </tr>
              </thead>
              <tbody>
                {cdcContacts.map((r) => (
                  <tr key={r.email} className="border-b last:border-b-0">
                    <td className="py-2">{isBn ? r.centerBn : r.centerEn}</td>
                    <td className="py-2">{isBn ? r.phoneBn : r.phoneEn}</td>
                    <td className="py-2">{r.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden text-white bg-[radial-gradient(circle_at_center,_#0d5c3a_0%,_#006747_35%,_#0a3d2e_100%)]">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#9ad9b8] opacity-[0.08]" />
        <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-[#9ad9b8] opacity-[0.07]" />

        <div className="relative max-w-[1060px] mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full border border-[#006747] bg-white grid place-items-center">
                <img src="/logo.webp" alt="logo" className="h-8 w-8 object-contain mix-blend-multiply" />
              </div>
              <div>
                <p className="font-bold">{t("landing.footer.dept")}</p>
                <p className="text-sm text-slate-300">{t("landing.footer.subtitle")}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mt-3">{t("landing.footer.desc")}</p>
          </div>
          <div>
            <p className="font-semibold mb-2">{t("landing.footer.quickLinks")}</p>
            <div className="space-y-1 text-sm text-slate-300">
              <a target="_blank" rel="noreferrer" href="https://dss.gov.bd" className="block hover:text-white">{t("landing.footer.linkDss")}</a>
              <a target="_blank" rel="noreferrer" href="https://msw.gov.bd" className="block hover:text-white">{t("landing.footer.linkMsw")}</a>
              <a target="_blank" rel="noreferrer" href="https://bdlaws.minlaw.gov.bd" className="block hover:text-white">{t("landing.footer.linkAct")}</a>
              <a target="_blank" rel="noreferrer" href="https://bangladesh.gov.bd" className="block hover:text-white">{t("landing.footer.linkPortal")}</a>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-2">{t("landing.footer.contact")}</p>
            <div className="space-y-1 text-sm text-slate-300">
              {isBn ? (
                <>
                  <p>ঠিকানা: সমাজসেবা ভবন, ই-৮/বি-১, আগারগাঁও, শেরেবাংলা নগর, ঢাকা-১২০৭, বাংলাদেশ।</p>
                  <p>ইমেইল: info@dss.gov.bd</p>
                  <p>ওয়েবসাইট: www.dss.gov.bd</p>
                  <p>বিকল্প নম্বর: +৮৮০ ২-৫৫০০৭০২৪</p>
                  <p>ফ্যাক্স: ৮৮০-২-৪৮১১৮৫৭১</p>
                </>
              ) : (
                <>
                  <p>Address: Social Service Bhaban, E-8/B-1, Agargaon, Sher-e-Bangla Nagar, Dhaka-1207, Bangladesh.</p>
                  <p>Email: info@dss.gov.bd</p>
                  <p>Website: www.dss.gov.bd</p>
                  <p>Alternate Number: +880 2-55007024</p>
                  <p>Fax: 880-2-48118571</p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="relative border-t border-white/10 bg-[#0b1f3a]/70 backdrop-blur-[1px]">
          <div className="max-w-[1060px] mx-auto px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-200">
            <p>{t("landing.footer.copyright")}</p>
            <p className="flex items-center gap-2">{t("landing.footer.techBy")} <img src="/dream.png" alt="dream71" className="h-11 w-auto" /></p>
          </div>
        </div>
      </footer>

      <div className="h-1" style={{ background: "linear-gradient(90deg,#006747 0 50%,#C8102E 50% 100%)" }} />
    </div>
  );
}