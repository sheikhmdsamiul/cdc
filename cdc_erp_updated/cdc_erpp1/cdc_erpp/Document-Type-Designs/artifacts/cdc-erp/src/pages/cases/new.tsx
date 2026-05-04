import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useCreateCase, useListChildren } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DIVISION_DATA } from "@/lib/administrative-data";
import { useDivisionData } from "@/hooks/use-division-data";

const STEPS = ["শিশুর পরিচয়", "যোগাযোগ ও ঠিকানা", "বর্তমান অবস্থা", "ক্ষেত্র ও জরুরি সেবা", "দায়িত্বপ্রাপ্ত কর্মকর্তা"];

const LIVING_WITH_OPTIONS = [
  { value: "both_parents", label: "মাতাপিতা উভয়ের সাথে থাকে" },
  { value: "mother_only", label: "শুধু মাতার সাথে থাকে" },
  { value: "father_only", label: "শুধু পিতার সাথে থাকে" },
  { value: "elder_sibling", label: "বড় ভাই/বোনের সাথে থাকে" },
  { value: "other_family", label: "অন্য আত্মীয় পরিবারের সাথে থাকে" },
  { value: "non_family", label: "আত্মীয় নয় এমন কোনো ব্যক্তির সাথে থাকে" },
  { value: "alone_street", label: "একাকী পথে থাকে" },
  { value: "parents_street", label: "মাতাপিতার সাথে পথে থাকে" },
  { value: "institution", label: "কোনো একটি প্রতিষ্ঠানে থাকে" },
];

const CHILD_PROBLEMS = [
  { value: "orphan", label: "১৪.১ মাতাপিতার যেকোনো একজন বা উভয়ে মৃত্যুবরণ করিয়াছে" },
  { value: "no_guardian", label: "১৪.২ আইনানুগ বা বৈধ অভিভাবকহীন শিশু" },
  { value: "homeless", label: "১৪.৩ নির্দিষ্ট কোনো গৃহ বা আবাসস্থলহীন এবং জীবনধারণের জন্য কঠোর পরিশ্রমকারী শিশু" },
  { value: "begging", label: "১৪.৪ ভিক্ষাবৃত্তি বা শিশুর মঙ্গলের পরিপন্থী কোনো কাজে লিপ্ত শিশু" },
  { value: "prison_dependent", label: "১৪.৫ কারাভোগরত মাতাপিতার উপর নির্ভরশীল বা মাতার সাথে কারাগারে অবস্থানরত শিশু" },
  { value: "sexual_abuse", label: "১৪.৬ যৌন নির্যাতন বা হয়রানির শিকার শিশু" },
  { value: "criminal_network", label: "১৪.৭ সমাজবিরোধী কার্যে নিয়োজিত ব্যক্তি বা অপরাধীর সাথে থাকা শিশু" },
  { value: "anti_social_inst", label: "১৪.৮ বাসস্থান বা কর্মস্থলে অবস্থানকারী বা গণনাগমনকারী প্রতিষ্ঠান শিশু" },
  { value: "substance_abuse", label: "১৪.৯ মাদক বা অন্য কোনো কারণে অস্বাভাবিক আচরণগত সমস্যাযুক্ত শিশু" },
  { value: "crime_prone", label: "১৪.১০ অসৎ সঙ্গে পতিত বা নৈতিক অধঃপতনের ঝুঁকিতে বা অপরাধ জগতে প্রবেশের ঝুঁকিসম্পন্ন শিশু" },
  { value: "slum", label: "১৪.১১ বস্তিতে বসবাসকারী শিশু" },
  { value: "street_child", label: "১৪.১২ রাস্তাঘাটে বসবাসকারী গৃহহীন শিশু" },
  { value: "hijra", label: "১৪.১৩ হিজড়া শিশু" },
  { value: "nomadic", label: "১৪.১৪ বেদে ও হরিজন শিশু" },
  { value: "hiv_aids", label: "১৪.১৫ এইচআইভি/এইডস-এ আক্রান্ত বা ক্ষতিগ্রস্ত শিশু" },
  { value: "law_contact", label: "১৪.১৬ আইনের সম্পর্শে আসা শিশু" },
  { value: "law_conflict", label: "১৪.১৭ আইনের সাথে সংঘাতে জড়িত শিশু" },
];

function FL({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

function CheckGroup({ options, values, onChange }: { options: { value: string; label: string }[]; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="space-y-2">
      {options.map(opt => {
        const checked = values.includes(opt.value);
        return (
          <label key={opt.value} className="flex items-start gap-2.5 cursor-pointer group">
            <div className={`mt-0.5 h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center ${checked ? "bg-primary border-primary" : "border-border"}`}>
              {checked && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
            </div>
            <span className="text-sm leading-snug">{opt.label}</span>
            <input type="checkbox" className="sr-only" checked={checked} onChange={() => {
              if (checked) onChange(values.filter(x => x !== opt.value));
              else onChange([...values, opt.value]);
            }} />
          </label>
        );
      })}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

export default function NewCase() {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createCase = useCreateCase();
  const { divisionData } = useDivisionData();
  const { data: childrenResp, isLoading: childrenLoading } = useListChildren({ status: "all", limit: 100 } as any, {});
  const children = (childrenResp as any)?.data ?? [];
  const { data: caseTypesData, isLoading: caseTypesLoading } = useQuery({
    queryKey: ["case-types"],
    queryFn: () => fetch("/api/case-types").then(r => r.json()),
  });
  const caseTypes = caseTypesData?.caseTypes?.filter((ct: any) => ct.isActive) ?? [];
  const [step, setStep] = useState(0);

  const [form, setForm] = useState<Record<string, any>>({
    childId: "", caseStatus: "Open", caseType: "",
    caseOpeningDate: new Date().toISOString().split("T")[0],
    intakeDate: new Date().toISOString().split("T")[0],
    registrationNumber: "", nameEnglish: "",
    motherName: "", fatherName: "", guardianName: "", guardianRelationship: "",
    birthRegNo: "", disabilityId: "",
    nationality: "বাংলাদেশী", ethnicity: "", birthplace: "", religion: "", occupation: "", income: "",
    currentAddressDivision: "", currentAddressDistrict: "", currentAddressUpazila: "", currentAddressUnion: "", currentAddressVillage: "",
    permanentAddressDivision: "", permanentAddressDistrict: "", permanentAddressUpazila: "", permanentAddressUnion: "", permanentAddressVillage: "",
    guardianPhone: "", email: "",
    livingWith: [], childProblems: [], otherProblems: "",
    referralReason: "", referralContactName: "", referralContactAddress: "", referralContactPhone: "", referralRelationship: "",
    urgentServiceNeeded: false, urgentServiceTypes: "",
    referralDestination: "", receiverName: "", receiverIdNo: "",
    intakeOfficerName: "", intakeOfficerDesignation: "", assessorName: "", supervisorName: "",
    caseSummary: "", assignedCaseWorker: "",
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const inp = (k: string) => ({ value: form[k] ?? "", onChange: (e: any) => set(k, e.target.value) });

  function handleSubmit() {
    if (!form.childId) { toast({ title: "ত্রুটি", description: "শিশু নির্বাচন করুন।", variant: "destructive" }); return; }
    const payload = {
      ...form,
      childId: parseInt(form.childId),
      caseStatus: "Open",
      livingWith: JSON.stringify(form.livingWith),
      childProblems: JSON.stringify(form.childProblems),
    };
    createCase.mutate({ data: payload as any }, {
      onSuccess: (c: any) => { toast({ title: "সফল", description: "কেস ফাইল তৈরি হয়েছে।" }); setLocation(`/cases/${c.id}`); },
      onError: () => toast({ title: "ত্রুটি", description: "কেস ফাইল তৈরি করতে ব্যর্থ হয়েছে।", variant: "destructive" }),
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">প্রাপ্তি সংক্রান্ত তথ্য ফরম (Intake Form)</h1>
        <p className="text-muted-foreground text-sm">কেস ম্যানেজমেন্ট ফরম-১ — নতুন কেস ফাইল নিবন্ধন করুন</p>
      </div>

      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <button onClick={() => i < step && setStep(i)}
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 ${i < step ? "bg-primary text-primary-foreground cursor-pointer" : i === step ? "bg-primary text-primary-foreground ring-2 ring-primary/30" : "bg-muted text-muted-foreground"}`}>
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </button>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center font-semibold">{STEPS[step]}</p>

      {step === 0 && <Card title="শিশুর পরিচয় ও পারিবারিক তথ্য">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FL label="নিবন্ধন নম্বর"><Input placeholder="নিবন্ধন নম্বর" {...inp("registrationNumber")} /></FL>
            <FL label="কেস শুরুর তারিখ" required><Input type="date" {...inp("caseOpeningDate")} /></FL>
          </div>
          <FL label="মামলার ধরন">
            {caseTypesLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted/20">
                <Loader2 className="h-4 w-4 animate-spin" /> {isBn ? "লোড হচ্ছে..." : "Loading case types..."}
              </div>
            ) : (
              <Select value={form.caseType} onValueChange={v => set("caseType", v)}>
                <SelectTrigger><SelectValue placeholder={isBn ? "মামলার ধরন বেছে নিন" : "Select case type"} /></SelectTrigger>
                <SelectContent>
                  {caseTypes.map((ct: any) => (
                    <SelectItem key={ct.id} value={ct.nameEn}>
                      {isBn ? ct.nameBn : ct.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FL>
          <FL label="শিশু নির্বাচন করুন" required>
            {childrenLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted/20">
                <Loader2 className="h-4 w-4 animate-spin" /> {isBn ? "লোড হচ্ছে..." : "Loading children..."}
              </div>
            ) : (
              <Select value={String(form.childId)} onValueChange={v => set("childId", v)}>
                <SelectTrigger><SelectValue placeholder={isBn ? "শিশু বেছে নিন" : "Select child"} /></SelectTrigger>
                <SelectContent>
                  {children.length > 0 ? (
                    children.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.fullName} ({c.childId}) {c.currentStatus === 'Draft' ? (isBn ? '[খসড়া]' : '[Draft]') : ''}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      {isBn ? "কোনো শিশু পাওয়া যায়নি" : "No children found"}
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">
              {isBn 
                ? "বি.দ্র.: এখানে সকল শিশু (অনুমোদিত ও খসড়া) প্রদর্শিত হচ্ছে।" 
                : "Note: Showing all children (including Drafts and Admitted)."}
            </p>
          </FL>
          <FL label="শিশুর নাম (ইংরেজিতে)"><Input placeholder="Name in English" {...inp("nameEnglish")} /></FL>
          <div className="grid grid-cols-2 gap-4">
            <FL label="মাতার নাম"><Input {...inp("motherName")} /></FL>
            <FL label="পিতার নাম"><Input {...inp("fatherName")} /></FL>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FL label="তত্ত্বাবধানকারী অভিভাবকের নাম"><Input {...inp("guardianName")} /></FL>
            <FL label="শিশুর সাথে সম্পর্ক"><Input placeholder="যেমন: চাচা, মামা" {...inp("guardianRelationship")} /></FL>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FL label="জন্ম নিবন্ধন সনদ নম্বর"><Input placeholder="১৭ সংখ্যার নম্বর" {...inp("birthRegNo")} /></FL>
            <FL label="প্রতিবন্ধিতা পরিচিতি নম্বর"><Input {...inp("disabilityId")} /></FL>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FL label="জাতীয়তা"><Input {...inp("nationality")} /></FL>
            <FL label="জাতিসত্তা"><Input {...inp("ethnicity")} /></FL>
            <FL label="জন্মস্থান"><Input {...inp("birthplace")} /></FL>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FL label="ধর্ম">
              <Select value={form.religion} onValueChange={v => set("religion", v)}>
                <SelectTrigger><SelectValue placeholder="বেছে নিন" /></SelectTrigger>
                <SelectContent>{["ইসলাম","হিন্দু","খ্রিস্টান","বৌদ্ধ","অন্যান্য"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </FL>
            <FL label="পেশা"><Input placeholder="পেশা" {...inp("occupation")} /></FL>
            <FL label="আয়/সম্পদ (যদি থাকে)"><Input placeholder="টাকা/মাস" {...inp("income")} /></FL>
          </div>
        </div>
      </Card>}

      {step === 1 && <div className="space-y-4">
        <Card title="১২.১ বর্তমান ঠিকানা">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FL label="বিভাগ">
                <Select value={form.currentAddressDivision} onValueChange={v => {
                  set("currentAddressDivision", v);
                  set("currentAddressDistrict", "");
                  set("currentAddressUpazila", "");
                }}>
                  <SelectTrigger><SelectValue placeholder="বিভাগ বাছুন" /></SelectTrigger>
                  <SelectContent>
                    {divisionData.map(d => <SelectItem key={d.id} value={d.bn}>{d.bn}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FL>
              <FL label="জেলা">
                <Select 
                  value={form.currentAddressDistrict} 
                  disabled={!form.currentAddressDivision}
                  onValueChange={v => {
                    set("currentAddressDistrict", v);
                    set("currentAddressUpazila", "");
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="জেলা বাছুন" /></SelectTrigger>
                  <SelectContent>
                    {divisionData.find(d => d.bn === form.currentAddressDivision)?.districts.map(d => (
                      <SelectItem key={d.id} value={d.bn}>{d.bn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FL>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FL label="উপজেলা/থানা">
                <Select 
                  value={form.currentAddressUpazila} 
                  disabled={!form.currentAddressDistrict}
                  onValueChange={v => set("currentAddressUpazila", v)}
                >
                  <SelectTrigger><SelectValue placeholder="উপজেলা বাছুন" /></SelectTrigger>
                  <SelectContent>
                    {divisionData
                      .find(d => d.bn === form.currentAddressDivision)
                      ?.districts.find(d => d.bn === form.currentAddressDistrict)
                      ?.upazilas.map(u => {
                        const val = typeof u === 'string' ? u : u.bn;
                        return <SelectItem key={val} value={val}>{val}</SelectItem>;
                      })}
                  </SelectContent>
                </Select>
              </FL>
              <FL label="ইউনিয়ন/ওয়ার্ড"><Input {...inp("currentAddressUnion")} /></FL>
            </div>
            <FL label="বাড়ি/সড়ক নম্বর / গ্রাম"><Input {...inp("currentAddressVillage")} /></FL>
          </div>
        </Card>
        <Card title="১২.২ স্থায়ী ঠিকানা">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FL label="বিভাগ">
                <Select value={form.permanentAddressDivision} onValueChange={v => {
                  set("permanentAddressDivision", v);
                  set("permanentAddressDistrict", "");
                  set("permanentAddressUpazila", "");
                }}>
                  <SelectTrigger><SelectValue placeholder="বিভাগ বাছুন" /></SelectTrigger>
                  <SelectContent>
                    {divisionData.map(d => <SelectItem key={d.id} value={d.bn}>{d.bn}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FL>
              <FL label="জেলা">
                <Select 
                  value={form.permanentAddressDistrict} 
                  disabled={!form.permanentAddressDivision}
                  onValueChange={v => {
                    set("permanentAddressDistrict", v);
                    set("permanentAddressUpazila", "");
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="জেলা বাছুন" /></SelectTrigger>
                  <SelectContent>
                    {divisionData.find(d => d.bn === form.permanentAddressDivision)?.districts.map(d => (
                      <SelectItem key={d.id} value={d.bn}>{d.bn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FL>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FL label="উপজেলা/থানা">
                <Select 
                  value={form.permanentAddressUpazila} 
                  disabled={!form.permanentAddressDistrict}
                  onValueChange={v => set("permanentAddressUpazila", v)}
                >
                  <SelectTrigger><SelectValue placeholder="উপজেলা বাছুন" /></SelectTrigger>
                  <SelectContent>
                    {divisionData
                      .find(d => d.bn === form.permanentAddressDivision)
                      ?.districts.find(d => d.bn === form.permanentAddressDistrict)
                      ?.upazilas.map(u => {
                        const val = typeof u === 'string' ? u : u.bn;
                        return <SelectItem key={val} value={val}>{val}</SelectItem>;
                      })}
                  </SelectContent>
                </Select>
              </FL>
              <FL label="ইউনিয়ন/ওয়ার্ড"><Input {...inp("permanentAddressUnion")} /></FL>
            </div>
            <FL label="বাড়ি/সড়ক নম্বর / গ্রাম"><Input {...inp("permanentAddressVillage")} /></FL>
          </div>
        </Card>
        <Card title="যোগাযোগ">
          <div className="grid grid-cols-2 gap-4">
            <FL label="শিশু/অভিভাবকের মোবাইল নম্বর"><Input placeholder="০১XXXXXXXXX" {...inp("guardianPhone")} /></FL>
            <FL label="ই-মেইল (যদি থাকে)"><Input type="email" {...inp("email")} /></FL>
          </div>
        </Card>
      </div>}

      {step === 2 && <div className="space-y-4">
        <Card title="১৩. শিশুর বর্তমান অবস্থা (একটিতে টিক দিন)">
          <CheckGroup options={LIVING_WITH_OPTIONS} values={form.livingWith} onChange={v => set("livingWith", v)} />
        </Card>
        <Card title="১৪. শিশুর বর্তমান সমস্যা/ধরন (সবগুলো চিহ্নিত করুন)">
          <CheckGroup options={CHILD_PROBLEMS} values={form.childProblems} onChange={v => set("childProblems", v)} />
        </Card>
        <Card title="১৫. অন্য কোনো সমস্যা">
          <Textarea placeholder="অন্য সমস্যার বিবরণ লিখুন..." className="min-h-[80px]" {...inp("otherProblems")} />
        </Card>
      </div>}

      {step === 3 && <div className="space-y-4">
        <Card title="১৬. ক্ষেত্র (রেফার) সংক্রান্ত তথ্য">
          <FL label="১৬.১ রেফার/প্রেরণের কারণ"><Textarea className="min-h-[70px]" {...inp("referralReason")} /></FL>
          <FL label="১৬.২ রেফারকারীর নাম, ঠিকানা এবং ফোন নম্বর"><Textarea className="min-h-[60px]" {...inp("referralContactName")} /></FL>
          <FL label="১৬.৩ রেফারকারীর সাথে শিশুর সম্পর্ক"><Input placeholder="যেমন: সমাজকর্মী, আদালত" {...inp("referralRelationship")} /></FL>
        </Card>
        <Card title="১৭. সুরক্ষা ও পদক্ষেপ">
          <FL label="১৭.১ তাৎক্ষণিকভাবে কোনো সেবার প্রয়োজন আছে কি?">
            <div className="flex gap-3 mt-1">
              {([{v: true, l: "হ্যাঁ"}, {v: false, l: "না"}] as const).map(opt => (
                <button key={String(opt.v)} type="button" onClick={() => set("urgentServiceNeeded", opt.v)}
                  className={`px-5 py-1.5 rounded-lg border text-sm font-medium transition-colors ${form.urgentServiceNeeded === opt.v ? (opt.v ? "bg-green-600 text-white border-green-600" : "bg-red-500 text-white border-red-500") : "border-border hover:bg-muted"}`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </FL>
          {form.urgentServiceNeeded && <FL label="১৭.২ কী ধরনের সেবা প্রয়োজন"><Textarea className="min-h-[70px]" {...inp("urgentServiceTypes")} /></FL>}
          <FL label="১৭.৩ গন্তব্য / কোথায় পাঠানো হবে"><Input {...inp("referralDestination")} /></FL>
          <div className="grid grid-cols-2 gap-3">
            <FL label="১৭.৪ গ্রহণকারীর নাম"><Input {...inp("receiverName")} /></FL>
            <FL label="১৭.৫ গ্রহণকারীর জাতীয় পরিচয়পত্র নম্বর"><Input {...inp("receiverIdNo")} /></FL>
          </div>
          <FL label="কেস সারসংক্ষেপ"><Textarea className="min-h-[80px]" {...inp("caseSummary")} /></FL>
        </Card>
      </div>}

      {step === 4 && <Card title="১৮. দায়িত্বপ্রাপ্ত কর্মকর্তা ও কর্মচারীর বিবরণ">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FL label="১৮.১ ফরম পূরণকারীর নাম"><Input {...inp("intakeOfficerName")} /></FL>
            <FL label="পদবি ও কর্মস্থল"><Input {...inp("intakeOfficerDesignation")} /></FL>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FL label="১৮.২ যাচাইয়ের সমাজকর্মীর নাম"><Input {...inp("assessorName")} /></FL>
            <FL label="নিয়োজিত কেস ওয়ার্কার"><Input {...inp("assignedCaseWorker")} /></FL>
          </div>
          <FL label="তত্ত্বাবধানকারী কর্মকর্তার নাম"><Input {...inp("supervisorName")} /></FL>
          <div className="grid grid-cols-2 gap-4">
            <FL label="ইনটেক তারিখ"><Input type="date" {...inp("intakeDate")} /></FL>
            <FL label="কেস অবস্থা">
              <Select value={form.caseStatus} onValueChange={v => set("caseStatus", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">খোলা (Open)</SelectItem>
                  <SelectItem value="Active">সক্রিয় (Active)</SelectItem>
                </SelectContent>
              </Select>
            </FL>
          </div>
        </div>
      </Card>}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : setLocation("/cases")} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" />{step === 0 ? "বাতিল" : "পূর্ববর্তী"}
        </Button>
        {step < STEPS.length - 1
          ? <Button onClick={() => setStep(step + 1)} className="gap-1.5">পরবর্তী <ChevronRight className="h-4 w-4" /></Button>
          : <Button onClick={handleSubmit} disabled={createCase.isPending} className="gap-1.5">
              {createCase.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <Check className="h-4 w-4" /> কেস ফাইল সংরক্ষণ করুন
            </Button>
        }
      </div>
    </div>
  );
}
