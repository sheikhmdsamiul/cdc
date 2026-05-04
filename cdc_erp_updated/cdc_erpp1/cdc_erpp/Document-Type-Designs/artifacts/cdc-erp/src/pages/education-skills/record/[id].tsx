import { useLocation, useParams, Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BookOpen, Hammer, Loader2, Sparkles } from "lucide-react";
import { useGetEducationPlan, getGetEducationPlanQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { DetailField, SectionCard } from "@/components/DetailField";

function programLabel(type: string | undefined, isBn: boolean) {
  if (!type) return "-";
  if (!isBn) return type;
  if (type === "Education") return "শিক্ষা";
  if (type === "Vocational") return "বৃত্তিমূলক";
  if (type === "Skills Assessment") return "দক্ষতা মূল্যায়ন";
  return type;
}

export default function EducationSkillsRecordDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const planId = parseInt(id || "0", 10);

  const { data: plan, isLoading } = useGetEducationPlan(planId, {
    query: { queryKey: getGetEducationPlanQueryKey(planId), enabled: !!planId },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{isBn ? "রেকর্ড পাওয়া যায়নি।" : "Record not found."}</p>
        <Button variant="outline" onClick={() => navigate("/education-skills")}>{isBn ? "তালিকায় ফিরুন" : "Back to List"}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/education-skills/${planId}`)} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground font-mono">{plan.planId}</h1>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{programLabel(plan.programType as string, isBn)}</span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? "শিশু: " : "Child: "}
            <Link href={`/children/${plan.childId}`} className="text-primary hover:underline font-medium">{plan.childName || `#${plan.childId}`}</Link>
          </p>
        </div>
      </div>

      <SectionCard title={isBn ? "সাধারণ তথ্য" : "General Information"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField label={isBn ? "শিরোনাম" : "Title"} value={plan.recordTitle} />
          <DetailField label={isBn ? "অবস্থা" : "Status"} value={plan.status} />
          <DetailField label={isBn ? "প্রতিষ্ঠান" : "Institution"} value={plan.institutionName} />
          <DetailField label={isBn ? "শুরুর তারিখ" : "Start Date"} value={plan.startDate} />
          <DetailField label={isBn ? "শেষ তারিখ" : "End Date"} value={plan.endDate} />
          <DetailField label={isBn ? "প্রগতি নোট" : "Progress Notes"} value={plan.progressNotes} />
          <DetailField label={isBn ? "সুপারিশ" : "Recommendations"} value={plan.recommendations} className="md:col-span-2" />
        </div>
      </SectionCard>

      <SectionCard title={isBn ? "শিক্ষা" : "Education"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField label={isBn ? "শিক্ষার স্তর" : "Education Level"} value={(plan as any).educationLevel} />
          <DetailField label={isBn ? "বোর্ড / কারিকুলাম" : "Board / Curriculum"} value={(plan as any).boardOrCurriculum} />
          <DetailField label={isBn ? "শেখার লক্ষ্য" : "Learning Goals"} value={(plan as any).learningGoals} className="md:col-span-2" />
        </div>
      </SectionCard>

      <SectionCard title={isBn ? "বৃত্তিমূলক" : "Vocational"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField label={isBn ? "ট্রেড" : "Trade"} value={(plan as any).tradeName} />
          <DetailField label={isBn ? "সার্টিফিকেশন" : "Certification"} value={(plan as any).certificationName} />
          <DetailField label={isBn ? "ঘণ্টা/সপ্তাহ" : "Hours/Week"} value={(plan as any).weeklyHours} />
        </div>
      </SectionCard>

      <SectionCard title={isBn ? "দক্ষতা মূল্যায়ন" : "Skills Assessment"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailField label={isBn ? "মূল্যায়নের তারিখ" : "Assessment Date"} value={(plan as any).assessmentDate} />
          <DetailField label={isBn ? "মূল্যায়নকারী" : "Assessor"} value={(plan as any).assessorName} />
          <DetailField label={isBn ? "সাক্ষরতা" : "Literacy"} value={(plan as any).literacyLevel} />
          <DetailField label={isBn ? "গণিত" : "Numeracy"} value={(plan as any).numeracyLevel} />
          <DetailField label={isBn ? "ডিজিটাল সাক্ষরতা" : "Digital Literacy"} value={(plan as any).digitalLiteracyLevel} />
          <DetailField label={isBn ? "আগ্রহের ক্ষেত্র" : "Interest Areas"} value={(plan as any).interestAreas} />
          <DetailField label={isBn ? "শক্তির দিক" : "Strengths"} value={(plan as any).strengths} />
          <DetailField label={isBn ? "সহায়তার প্রয়োজন" : "Support Needs"} value={(plan as any).supportNeeds} className="md:col-span-2" />
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
        <div className="rounded-lg border p-3 flex items-center gap-2"><BookOpen className="h-4 w-4" /> {isBn ? "শিক্ষা তথ্য" : "Education Data"}</div>
        <div className="rounded-lg border p-3 flex items-center gap-2"><Hammer className="h-4 w-4" /> {isBn ? "বৃত্তিমূলক তথ্য" : "Vocational Data"}</div>
        <div className="rounded-lg border p-3 flex items-center gap-2"><Sparkles className="h-4 w-4" /> {isBn ? "দক্ষতা মূল্যায়ন" : "Skills Assessment"}</div>
      </div>
    </div>
  );
}
