import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const TRADES = ["Automobile", "Electric", "Tailoring", "Computer", "Cooking"];

/* ---------- Reusable question components ---------- */

function QuestionBlock({ num, label, children }: { num: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
        {num}
      </div>
      <div className="flex-1 space-y-3 pt-1.5">
        <p className="text-sm font-semibold text-foreground leading-snug">{label}</p>
        {children}
      </div>
    </div>
  );
}

function OptionPills({ options, value, onChange, multi = false }: {
  options: string[];
  value: string | string[];
  onChange: (v: string) => void;
  multi?: boolean;
}) {
  const isSelected = (opt: string) =>
    multi ? (value as string[]).includes(opt) : value === opt;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
            isSelected(opt)
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          {isSelected(opt) && !multi && <Check className="inline-block h-3.5 w-3.5 mr-1.5 -mt-0.5" />}
          {opt}
        </button>
      ))}
    </div>
  );
}

function YesNoToggle({ value, onChange, isBn }: { value: boolean | null; onChange: (v: boolean) => void; isBn: boolean }) {
  return (
    <div className="flex gap-3">
      {[
        { val: true, label: isBn ? "হ্যাঁ" : "Yes", color: "hover:border-green-500 hover:bg-green-50", active: "bg-green-600 text-white border-green-600" },
        { val: false, label: isBn ? "না" : "No", color: "hover:border-red-400 hover:bg-red-50", active: "bg-red-500 text-white border-red-500" },
      ].map(opt => (
        <button
          key={String(opt.val)}
          type="button"
          onClick={() => onChange(opt.val)}
          className={`px-6 py-2 rounded-lg border text-sm font-medium transition-all ${
            value === opt.val ? opt.active : `bg-background border-border text-foreground ${opt.color}`
          }`}
        >
          {value === opt.val && <Check className="inline-block h-3.5 w-3.5 mr-1.5 -mt-0.5" />}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Step header ---------- */

const STEP_META = [
  { en: "Survey Info",            bn: "জরিপ পরিচিতি",             letter: "★" },
  { en: "A: Demographics",        bn: "ক: জনতাত্ত্বিক তথ্য",      letter: "A" },
  { en: "B: Daily Routine",       bn: "খ: দৈনন্দিন রুটিন",         letter: "B" },
  { en: "C: Governance",          bn: "গ: প্রাতিষ্ঠানিক পরিবেশ",   letter: "C" },
  { en: "D: Education",           bn: "ঘ: শিক্ষা ও বৃত্তি",        letter: "D" },
  { en: "E: Psychosocial",        bn: "ঙ: মনোসামাজিক",             letter: "E" },
  { en: "F & G: Legal + Feedback",bn: "চ+ছ: আইন ও মতামত",          letter: "F" },
];

function StepBar({ step, total, isBn }: { step: number; total: number; isBn: boolean }) {
  return (
    <div className="space-y-3">
      {/* numbered dots */}
      <div className="flex items-center">
        {STEP_META.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i === step
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : i < step
                  ? "bg-primary/80 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : s.letter}
            </div>
            {i < STEP_META.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${i < step ? "bg-primary/60" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>
      {/* current step label */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold text-primary">
          {isBn ? STEP_META[step].bn : STEP_META[step].en}
        </span>
        <span>{step + 1} / {total}</span>
      </div>
    </div>
  );
}

const FREQ4 = ["Always", "Sometimes", "Rarely", "Never"];
const HOURS4 = ["0–1", "1–2", "2–3", ">3"];
const SATISFACTION4 = ["Very satisfied", "Satisfied", "Unsatisfied", "Very unsatisfied"];

/* ---------- Main component ---------- */

export default function NewSurvey() {
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    childId: "",
    centerId: user?.centerId ? String(user.centerId) : "",
    enumeratorName: "",
    surveyDate: new Date().toISOString().split("T")[0],
    ageGroup: "",
    gender: "",
    educationLevel: "",
    detentionLength: "",
    homeDistrict: "",
    structuredRoutine: "",
    educationHours: "",
    vocationalHours: "",
    physicalActivity: "",
    readingAccess: null as boolean | null,
    lifeskillsParticipation: "",
    productiveActivities: null as boolean | null,
    complaintOpportunities: null as boolean | null,
    familyContact: "",
    safetyPerception: "",
    physicalPunishment: "",
    rulesFairness: "",
    captainSystem: null as boolean | null,
    formalEducation: null as boolean | null,
    vocationalAvailable: null as boolean | null,
    tradesAvailable: [] as string[],
    tradesOther: "",
    vocationalSatisfaction: "",
    selfHarm: null as boolean | null,
    inmateConflicts: "",
    emotionalWellbeing: "",
    hopefulness: "",
    legalRightsInformed: null as boolean | null,
    legalGuidance: "",
    mainChallenges: "",
    wishedChanges: "",
  });

  const { data: childrenData } = useQuery({
    queryKey: ["children-list-survey"],
    queryFn: () => fetch("/api/children?limit=500", { credentials: "include" }).then(r => r.json()),
  });

  const children: any[] = Array.isArray(childrenData)
    ? childrenData
    : Array.isArray((childrenData as any)?.data)
    ? (childrenData as any).data
    : [];

  const set = (field: string) => (v: any) => setForm(f => ({ ...f, [field]: v }));
  const setE = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const toggleTrade = (trade: string) => {
    setForm(f => ({
      ...f,
      tradesAvailable: f.tradesAvailable.includes(trade)
        ? f.tradesAvailable.filter(t => t !== trade)
        : [...f.tradesAvailable, trade],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const trades = form.tradesAvailable.slice();
      if (form.tradesOther.trim()) trades.push(form.tradesOther.trim());
      const res = await fetch("/api/measurement-surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          childId: form.childId ? parseInt(form.childId) : null,
          centerId: form.centerId ? parseInt(form.centerId) : null,
          tradesAvailable: trades,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error");
      const created = await res.json();
      navigate(`/surveys/${created.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  const renderStep = () => {
    switch (step) {
      /* ---- Step 0: Intro ---- */
      case 0:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm font-semibold text-primary mb-1">
                {isBn ? "পরিমাপ জরিপ — জুলাই ২০২৫" : "Measurement Survey — July 2025"}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isBn
                  ? "শিশু উন্নয়ন কেন্দ্রে কাঠামোগত রুটিন ও প্রাতিষ্ঠানিক সংস্কারের মাধ্যমে পুনর্বাসন উন্নয়ন সংক্রান্ত বাস্তববাদী মূল্যায়ন।"
                  : "Enhancing Rehabilitation in CDCs through Structured Routine Activities and Institutional Reforms: A Realist Evaluation."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{isBn ? "গণনাকারীর নাম" : "Name of Enumerator"}</label>
                <input type="text" className={inputClass} value={form.enumeratorName} onChange={setE("enumeratorName")} placeholder={isBn ? "নাম লিখুন" : "Enter enumerator's name"} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{isBn ? "তারিখ" : "Date"}</label>
                <input type="date" className={inputClass} value={form.surveyDate} onChange={setE("surveyDate")} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">
                  {isBn ? "শিশু (ঐচ্ছিক)" : "Child (Optional)"}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">{isBn ? "— নাম না থাকলে বেনামী থাকবে" : "— leave blank for anonymous"}</span>
                </label>
                <select className={inputClass} value={form.childId} onChange={setE("childId")}>
                  <option value="">{isBn ? "শিশু নির্বাচন করুন" : "Select a child (optional)"}</option>
                  {children.map((c: any) => <option key={c.id} value={c.id}>{c.fullName} — {c.childId}</option>)}
                </select>
              </div>
            </div>
          </div>
        );

      /* ---- Step 1: Section A ---- */
      case 1:
        return (
          <div className="space-y-7">
            <QuestionBlock num="1" label={isBn ? "বয়স কত?" : "Age"}>
              <OptionPills options={["9–10", "11–12", "13–14", "15–16", "17–18"]} value={form.ageGroup} onChange={set("ageGroup")} />
            </QuestionBlock>

            <QuestionBlock num="2" label={isBn ? "লিঙ্গ কী?" : "Gender"}>
              <OptionPills options={["Male", "Female", "Other"]} value={form.gender} onChange={set("gender")} />
            </QuestionBlock>

            <QuestionBlock num="3" label={isBn ? "শিক্ষার শ্রেণি (কোন ক্লাসে পড়েছেন?)" : "Education — which class/grade?"}>
              <OptionPills options={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]} value={form.educationLevel} onChange={set("educationLevel")} />
            </QuestionBlock>

            <QuestionBlock num="4" label={isBn ? "আটকের মেয়াদ কত?" : "Length of Detention"}>
              <OptionPills options={["1–12 Months", "13–24 Months", "25–36 Months", ">36 Months"]} value={form.detentionLength} onChange={set("detentionLength")} />
            </QuestionBlock>

            <QuestionBlock num="5" label={isBn ? "বাড়ির অবস্থান (জেলা)" : "Home Location (District)"}>
              <OptionPills options={["Chattogram", "Sylhet", "Dhaka", "Mymensingh", "Other"]} value={form.homeDistrict} onChange={set("homeDistrict")} />
            </QuestionBlock>
          </div>
        );

      /* ---- Step 2: Section B ---- */
      case 2:
        return (
          <div className="space-y-7">
            <QuestionBlock num="6" label={isBn ? "সংস্কারের আগে কি কাঠামোগত দৈনন্দিন রুটিন ছিল?" : "Did you have a structured daily routine before reforms?"}>
              <OptionPills options={FREQ4} value={form.structuredRoutine} onChange={set("structuredRoutine")} />
            </QuestionBlock>

            <QuestionBlock num="7" label={isBn ? "সংস্কারের আগে শিক্ষামূলক কার্যক্রমে প্রতিদিন কত ঘণ্টা ব্যয় হতো?" : "Hours per day spent in educational activities (before reforms)?"}>
              <OptionPills options={HOURS4} value={form.educationHours} onChange={set("educationHours")} />
            </QuestionBlock>

            <QuestionBlock num="8" label={isBn ? "সংস্কারের আগে বৃত্তিমূলক কার্যক্রমে প্রতিদিন কত ঘণ্টা ব্যয় হতো?" : "Hours per day spent in vocational activities (before reforms)?"}>
              <OptionPills options={HOURS4} value={form.vocationalHours} onChange={set("vocationalHours")} />
            </QuestionBlock>

            <QuestionBlock num="9" label={isBn ? "সংস্কারের আগে কি নিয়মিত খেলাধুলা বা শারীরিক কার্যক্রম ছিল?" : "Did you have regular sports or physical activity before reforms?"}>
              <OptionPills options={["Yes, daily", "Sometimes", "Rarely", "Never"]} value={form.physicalActivity} onChange={set("physicalActivity")} />
            </QuestionBlock>

            <QuestionBlock num="10" label={isBn ? "পড়ার বই বা শিক্ষা উপকরণ পাওয়া যেত?" : "Did you have access to reading books or learning materials?"}>
              <YesNoToggle value={form.readingAccess} onChange={set("readingAccess")} isBn={isBn} />
            </QuestionBlock>

            <QuestionBlock num="11" label={isBn ? "জীবন দক্ষতা, কাউন্সেলিং বা মনোসামাজিক সহায়তায় অংশগ্রহণ" : "Participation in life skills, counselling, or psychosocial support sessions"}>
              <OptionPills options={["Regularly", "Occasionally", "Rarely", "Never"]} value={form.lifeskillsParticipation} onChange={set("lifeskillsParticipation")} />
            </QuestionBlock>

            <QuestionBlock num="12" label={isBn ? "কৃষি বা হস্তশিল্পের মতো উৎপাদনশীল কার্যক্রমে অংশগ্রহণ করেছেন?" : "Did you participate in productive activities like farming or crafts?"}>
              <YesNoToggle value={form.productiveActivities} onChange={set("productiveActivities")} isBn={isBn} />
            </QuestionBlock>
          </div>
        );

      /* ---- Step 3: Section C ---- */
      case 3:
        return (
          <div className="space-y-7">
            <QuestionBlock num="13" label={isBn ? "সংস্কারের আগে অভিযোগ বা উদ্বেগ জানানোর সুযোগ ছিল?" : "Were there opportunities to raise complaints or concerns before reforms?"}>
              <YesNoToggle value={form.complaintOpportunities} onChange={set("complaintOpportunities")} isBn={isBn} />
            </QuestionBlock>

            <QuestionBlock num="14" label={isBn ? "আপনি কি নিয়মিত অভিভাবক বা পরিবারের সাথে যোগাযোগ করতে পারতেন?" : "Were you able to contact your guardians or family regularly?"}>
              <OptionPills options={["Often", "Sometimes", "Rarely", "Never"]} value={form.familyContact} onChange={set("familyContact")} />
            </QuestionBlock>

            <QuestionBlock num="15" label={isBn ? "সহিংসতা, নির্যাতন বা শাস্তি থেকে কতটুকু নিরাপদ অনুভব করেছেন?" : "How safe did you feel from violence, abuse, or punishment?"}>
              <OptionPills options={["Very safe", "Somewhat safe", "Somewhat unsafe", "Very unsafe"]} value={form.safetyPerception} onChange={set("safetyPerception")} />
            </QuestionBlock>

            <QuestionBlock num="16" label={isBn ? "কত ঘন ঘন শারীরিক শাস্তি দেওয়া হতো (বেত, থাপ্পড় ইত্যাদি)?" : "How often were you physically punished (caning, slapping, etc.)?"}>
              <OptionPills options={["Often", "Sometimes", "Rarely", "Never"]} value={form.physicalPunishment} onChange={set("physicalPunishment")} />
            </QuestionBlock>

            <QuestionBlock num="17" label={isBn ? "নিয়মগুলো কি ন্যায্য মনে হয়েছে?" : "Did you feel the rules were fair?"}>
              <OptionPills options={["Always", "Sometimes", "Rarely", "Never"]} value={form.rulesFairness} onChange={set("rulesFairness")} />
            </QuestionBlock>

            <QuestionBlock num="18" label={isBn ? "সংস্কারের আগে কি অভিজ্ঞ বন্দীদের কর্তৃত্ব দেওয়া হতো (ক্যাপ্টেন হিসেবে)?" : "Were older/experienced inmates given authority (like captains) before reforms?"}>
              <YesNoToggle value={form.captainSystem} onChange={set("captainSystem")} isBn={isBn} />
            </QuestionBlock>
          </div>
        );

      /* ---- Step 4: Section D ---- */
      case 4:
        return (
          <div className="space-y-7">
            <QuestionBlock num="19" label={isBn ? "সংস্কারের আগে কি আনুষ্ঠানিক শিক্ষায় ভর্তি ছিলেন?" : "Were you enrolled in formal education before reforms?"}>
              <YesNoToggle value={form.formalEducation} onChange={set("formalEducation")} isBn={isBn} />
            </QuestionBlock>

            <QuestionBlock num="20" label={isBn ? "সংস্কারের আগে কি বৃত্তিমূলক প্রশিক্ষণ পাওয়া যেত?" : "Were vocational trainings available to you before reforms?"}>
              <YesNoToggle value={form.vocationalAvailable} onChange={set("vocationalAvailable")} isBn={isBn} />
            </QuestionBlock>

            <QuestionBlock num="21" label={isBn ? "যদি হ্যাঁ হয়, কোন ট্রেড(গুলো) পাওয়া যেত? (প্রযোজ্য সব বেছে নিন)" : "If yes, which trade(s) were available? (Select all that apply)"}>
              <OptionPills options={TRADES} value={form.tradesAvailable} onChange={toggleTrade} multi />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground whitespace-nowrap">{isBn ? "অন্যান্য:" : "Other:"}</span>
                <input
                  type="text"
                  className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.tradesOther}
                  onChange={setE("tradesOther")}
                  placeholder={isBn ? "নির্দিষ্ট করুন" : "Specify if other"}
                />
              </div>
            </QuestionBlock>

            <QuestionBlock num="22" label={isBn ? "বৃত্তিমূলক সুযোগে কতটা সন্তুষ্ট ছিলেন?" : "How satisfied were you with the vocational opportunities?"}>
              <OptionPills options={SATISFACTION4} value={form.vocationalSatisfaction} onChange={set("vocationalSatisfaction")} />
            </QuestionBlock>
          </div>
        );

      /* ---- Step 5: Section E ---- */
      case 5:
        return (
          <div className="space-y-7">
            <QuestionBlock num="23" label={isBn ? "সংস্কারের আগে কি কখনো স্ব-ক্ষতি বা আত্মহত্যার প্রচেষ্টা করেছেন?" : "Did you ever experience self-harm or attempt suicide before reforms?"}>
              <YesNoToggle value={form.selfHarm} onChange={set("selfHarm")} isBn={isBn} />
            </QuestionBlock>

            <QuestionBlock num="24" label={isBn ? "অন্য বন্দীদের সাথে কি সংঘাত বা ঝগড়া হয়েছে?" : "Did you have conflicts or fights with other inmates?"}>
              <OptionPills options={["Often", "Sometimes", "Rarely", "Never"]} value={form.inmateConflicts} onChange={set("inmateConflicts")} />
            </QuestionBlock>

            <QuestionBlock num="25" label={isBn ? "সংস্কারের আগে সার্বিক মানসিক সুস্থতা কেমন ছিল?" : "How would you describe your overall emotional wellbeing before reforms?"}>
              <OptionPills options={["Good", "Fair", "Poor", "Very poor"]} value={form.emotionalWellbeing} onChange={set("emotionalWellbeing")} />
            </QuestionBlock>

            <QuestionBlock num="26" label={isBn ? "ভবিষ্যৎ নিয়ে কি আশাবাদী ছিলেন?" : "Did you feel hopeful about your future?"}>
              <OptionPills options={["Always", "Sometimes", "Rarely", "Never"]} value={form.hopefulness} onChange={set("hopefulness")} />
            </QuestionBlock>
          </div>
        );

      /* ---- Step 6: Sections F + G ---- */
      case 6:
        return (
          <div className="space-y-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
              {isBn ? "বিভাগ চ: আইনি ও মামলা ব্যবস্থাপনা" : "Section F: Legal and Case Management"}
            </p>

            <QuestionBlock num="28" label={isBn ? "সংস্কারের আগে কি আইনি অধিকার বা মামলার অগ্রগতি সম্পর্কে জানানো হয়েছিল?" : "Were you informed about your legal rights or case progress before reforms?"}>
              <YesNoToggle value={form.legalRightsInformed} onChange={set("legalRightsInformed")} isBn={isBn} />
            </QuestionBlock>

            <QuestionBlock num="29" label={isBn ? "কর্মকর্তারা কি আপনার মামলা ব্যাখ্যা করেছেন বা আইনি বিষয়ে নির্দেশনা দিয়েছেন?" : "Did staff explain your case or provide guidance on legal issues?"}>
              <OptionPills options={["Always", "Sometimes", "Rarely", "Never"]} value={form.legalGuidance} onChange={set("legalGuidance")} />
            </QuestionBlock>

            <div className="border-t border-dashed border-border pt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-5">
                {isBn ? "বিভাগ ছ: মুক্ত মতামত (ঐচ্ছিক)" : "Section G: Open Feedback (Optional)"}
              </p>

              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">30</div>
                  <div className="flex-1 space-y-2 pt-1.5">
                    <p className="text-sm font-semibold">{isBn ? "সংস্কারের আগে আপনি কী কী প্রধান চ্যালেঞ্জের মুখোমুখি হয়েছিলেন?" : "What were the main challenges you faced before the reforms?"}</p>
                    <textarea rows={4} className={inputClass + " resize-none"} value={form.mainChallenges} onChange={setE("mainChallenges")} placeholder={isBn ? "আপনার উত্তর লিখুন..." : "Write your answer here..."} />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">31</div>
                  <div className="flex-1 space-y-2 pt-1.5">
                    <p className="text-sm font-semibold">{isBn ? "প্রতিষ্ঠানে কী কী পরিবর্তন দেখতে চান?" : "What changes do you wish to see in the institution?"}</p>
                    <textarea rows={4} className={inputClass + " resize-none"} value={form.wishedChanges} onChange={setE("wishedChanges")} placeholder={isBn ? "আপনার উত্তর লিখুন..." : "Write your answer here..."} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/surveys")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{t("surveys.newSurvey")}</h1>
          <p className="text-sm text-muted-foreground">{t("surveys.subtitle")}</p>
        </div>
      </div>

      {/* Step bar */}
      <StepBar step={step} total={STEP_META.length} isBn={isBn} />

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Step content */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep(s => s - 1)}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          {isBn ? "পূর্ববর্তী" : "Previous"}
        </Button>

        {step < STEP_META.length - 1 ? (
          <Button onClick={() => setStep(s => s + 1)} className="gap-2 px-6">
            {isBn ? "পরবর্তী" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} className="gap-2 px-6">
            <Save className="h-4 w-4" />
            {loading ? t("common.loading") : (isBn ? "জরিপ সংরক্ষণ করুন" : "Save Survey")}
          </Button>
        )}
      </div>
    </div>
  );
}
