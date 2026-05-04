import { useParams, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer, ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailField, SectionCard } from "@/components/DetailField";
import { Link } from "wouter";

function SurveyAnswer({ label, value }: { label: string; value: string | boolean | null | undefined }) {
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  if (value === null || value === undefined || value === "") {
    return (
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-muted-foreground/60 italic">{isBn ? "উত্তর দেওয়া হয়নি" : "Not answered"}</p>
      </div>
    );
  }
  if (typeof value === "boolean") {
    return (
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {value ? (isBn ? "হ্যাঁ" : "Yes") : (isBn ? "না" : "No")}
        </span>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium">{String(value)}</p>
    </div>
  );
}

function TradesDisplay({ trades, label }: { trades: any; label: string }) {
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const list: string[] = Array.isArray(trades) ? trades : [];
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      {list.length === 0
        ? <p className="text-sm text-muted-foreground/60 italic">{isBn ? "উত্তর দেওয়া হয়নি" : "Not answered"}</p>
        : <div className="flex flex-wrap gap-1.5">{list.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{t}</span>)}</div>
      }
    </div>
  );
}

export default function SurveyDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";

  const { data: s, isLoading } = useQuery({
    queryKey: ["measurement-survey", id],
    queryFn: () => fetch(`/api/measurement-surveys/${id}`, { credentials: "include" }).then(r => r.json()),
    enabled: !!id,
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (!s || s.error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <ClipboardList className="h-12 w-12 text-muted-foreground" />
      <p className="text-muted-foreground">{t("common.notFound")}</p>
      <Button variant="outline" onClick={() => navigate("/surveys")}>{t("common.back")}</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="print:hidden flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/surveys")} className="mt-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold font-mono">{s.surveyId}</h1>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
            {s.childName && <span>{t("surveys.child")}: <Link href={`/children/${s.childId}`} className="text-primary hover:underline font-medium">{s.childName}</Link></span>}
            {s.centerName && <span>{t("surveys.center")}: <strong>{s.centerName}</strong></span>}
            {s.surveyDate && <span>{t("surveys.surveyDate")}: <strong>{s.surveyDate}</strong></span>}
            {s.enumeratorName && <span>{t("surveys.enumerator")}: <strong>{s.enumeratorName}</strong></span>}
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          {isBn ? "প্রিন্ট করুন" : "Print"}
        </Button>
      </div>

      {/* Section A */}
      <SectionCard title={isBn ? "বিভাগ ক: জনতাত্ত্বিক তথ্য" : "Section A: Demographics"}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SurveyAnswer label={`Q1. ${isBn ? "বয়স গোষ্ঠী" : "Age Group"}`} value={s.ageGroup} />
          <SurveyAnswer label={`Q2. ${isBn ? "লিঙ্গ" : "Gender"}`} value={s.gender} />
          <SurveyAnswer label={`Q3. ${isBn ? "শিক্ষার শ্রেণি" : "Education Level"}`} value={s.educationLevel} />
          <SurveyAnswer label={`Q4. ${isBn ? "আটকের মেয়াদ" : "Length of Detention"}`} value={s.detentionLength} />
          <SurveyAnswer label={`Q5. ${isBn ? "বাড়ির জেলা" : "Home District"}`} value={s.homeDistrict} />
        </div>
      </SectionCard>

      {/* Section B */}
      <SectionCard title={isBn ? "বিভাগ খ: দৈনন্দিন রুটিন ও কার্যক্রম" : "Section B: Daily Routine and Activities"}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SurveyAnswer label={`Q6. ${isBn ? "কাঠামোগত দৈনন্দিন রুটিন" : "Structured Daily Routine"}`} value={s.structuredRoutine} />
          <SurveyAnswer label={`Q7. ${isBn ? "শিক্ষামূলক কার্যক্রম (ঘণ্টা/দিন)" : "Educational Activities (hrs/day)"}`} value={s.educationHours} />
          <SurveyAnswer label={`Q8. ${isBn ? "বৃত্তিমূলক কার্যক্রম (ঘণ্টা/দিন)" : "Vocational Activities (hrs/day)"}`} value={s.vocationalHours} />
          <SurveyAnswer label={`Q9. ${isBn ? "নিয়মিত শারীরিক কার্যক্রম" : "Regular Physical Activity"}`} value={s.physicalActivity} />
          <SurveyAnswer label={`Q10. ${isBn ? "পড়ার বই/শিক্ষা উপকরণ" : "Access to Reading/Learning Materials"}`} value={s.readingAccess} />
          <SurveyAnswer label={`Q11. ${isBn ? "জীবন দক্ষতা/কাউন্সেলিং অংশগ্রহণ" : "Life Skills/Counselling Participation"}`} value={s.lifeskillsParticipation} />
          <SurveyAnswer label={`Q12. ${isBn ? "উৎপাদনশীল কার্যক্রম" : "Productive Activities"}`} value={s.productiveActivities} />
        </div>
      </SectionCard>

      {/* Section C */}
      <SectionCard title={isBn ? "বিভাগ গ: প্রাতিষ্ঠানিক পরিবেশ ও পরিচালনা" : "Section C: Institutional Climate and Governance"}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SurveyAnswer label={`Q13. ${isBn ? "অভিযোগের সুযোগ" : "Complaint Opportunities"}`} value={s.complaintOpportunities} />
          <SurveyAnswer label={`Q14. ${isBn ? "পরিবারের সাথে যোগাযোগ" : "Family Contact"}`} value={s.familyContact} />
          <SurveyAnswer label={`Q15. ${isBn ? "নিরাপত্তার অনুভূতি" : "Safety Perception"}`} value={s.safetyPerception} />
          <SurveyAnswer label={`Q16. ${isBn ? "শারীরিক শাস্তির হার" : "Physical Punishment Frequency"}`} value={s.physicalPunishment} />
          <SurveyAnswer label={`Q17. ${isBn ? "নিয়ম ন্যায্য মনে হয়েছে" : "Rules Perceived as Fair"}`} value={s.rulesFairness} />
          <SurveyAnswer label={`Q18. ${isBn ? "ক্যাপ্টেন ব্যবস্থা" : "Captain System Existed"}`} value={s.captainSystem} />
        </div>
      </SectionCard>

      {/* Section D */}
      <SectionCard title={isBn ? "বিভাগ ঘ: শিক্ষা ও বৃত্তিমূলক সুযোগ" : "Section D: Education and Vocational Opportunities"}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SurveyAnswer label={`Q19. ${isBn ? "আনুষ্ঠানিক শিক্ষায় ভর্তি" : "Enrolled in Formal Education"}`} value={s.formalEducation} />
          <SurveyAnswer label={`Q20. ${isBn ? "বৃত্তিমূলক প্রশিক্ষণ পাওয়া গেছে" : "Vocational Training Available"}`} value={s.vocationalAvailable} />
          <SurveyAnswer label={`Q22. ${isBn ? "বৃত্তিমূলক সুযোগে সন্তুষ্টি" : "Vocational Satisfaction"}`} value={s.vocationalSatisfaction} />
        </div>
        <div className="mt-4">
          <TradesDisplay trades={s.tradesAvailable} label={`Q21. ${isBn ? "উপলব্ধ ট্রেড" : "Trades Available"}`} />
        </div>
      </SectionCard>

      {/* Section E */}
      <SectionCard title={isBn ? "বিভাগ ঙ: মনোসামাজিক সুস্থতা" : "Section E: Psychosocial Wellbeing"}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SurveyAnswer label={`Q23. ${isBn ? "স্ব-ক্ষতি/আত্মহত্যার প্রচেষ্টা" : "Self-harm/Suicide Attempt"}`} value={s.selfHarm} />
          <SurveyAnswer label={`Q24. ${isBn ? "বন্দীদের সাথে দ্বন্দ্ব" : "Conflicts with Inmates"}`} value={s.inmateConflicts} />
          <SurveyAnswer label={`Q25. ${isBn ? "সার্বিক মানসিক সুস্থতা" : "Overall Emotional Wellbeing"}`} value={s.emotionalWellbeing} />
          <SurveyAnswer label={`Q26. ${isBn ? "ভবিষ্যৎ নিয়ে আশাবাদী" : "Hopeful About Future"}`} value={s.hopefulness} />
        </div>
      </SectionCard>

      {/* Section F */}
      <SectionCard title={isBn ? "বিভাগ চ: আইনি ও মামলা ব্যবস্থাপনা" : "Section F: Legal and Case Management"}>
        <div className="grid grid-cols-2 gap-4">
          <SurveyAnswer label={`Q28. ${isBn ? "আইনি অধিকার সম্পর্কে অবগত" : "Informed About Legal Rights"}`} value={s.legalRightsInformed} />
          <SurveyAnswer label={`Q29. ${isBn ? "কর্মকর্তারা আইনি নির্দেশনা দিয়েছে" : "Staff Provided Legal Guidance"}`} value={s.legalGuidance} />
        </div>
      </SectionCard>

      {/* Section G */}
      {(s.mainChallenges || s.wishedChanges) && (
        <SectionCard title={isBn ? "বিভাগ ছ: মুক্ত মতামত" : "Section G: Open Feedback"}>
          <div className="space-y-4">
            {s.mainChallenges && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Q30. {isBn ? "সংস্কারের আগে প্রধান চ্যালেঞ্জ" : "Main Challenges Before Reforms"}</p>
                <p className="text-sm bg-muted/50 rounded-md p-3">{s.mainChallenges}</p>
              </div>
            )}
            {s.wishedChanges && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Q31. {isBn ? "কাঙ্ক্ষিত পরিবর্তন" : "Wished Changes"}</p>
                <p className="text-sm bg-muted/50 rounded-md p-3">{s.wishedChanges}</p>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      <SectionCard title={t("timestamps.title")}>
        <div className="grid grid-cols-2 gap-4">
          <DetailField label={t("timestamps.createdAt")} value={s.createdAt ? new Date(s.createdAt).toLocaleString() : undefined} />
          <DetailField label={t("timestamps.lastUpdated")} value={s.updatedAt ? new Date(s.updatedAt).toLocaleString() : undefined} />
        </div>
      </SectionCard>
    </div>
  );
}
