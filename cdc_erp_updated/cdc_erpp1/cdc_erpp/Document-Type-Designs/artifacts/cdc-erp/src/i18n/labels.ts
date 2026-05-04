export function getRoleLabel(roleName: string | null | undefined, isBn: boolean): string {
  if (!roleName) return "";

  const roleLabels: Record<string, string> = {
    "Super Admin": "সুপার অ্যাডমিন",
    "Head Office": "প্রধান কার্যালয়",
    "Center Admin": "কেন্দ্র প্রশাসক",
    Superintendent: "তত্ত্বাবধায়ক",
    "Probation Officer": "প্রবেশন কর্মকর্তা",
    "Case Worker": "কেস ওয়ার্কার",
    "Data Entry Operator": "ডাটা এন্ট্রি অপারেটর",
    "House Parent": "হাউস প্যারেন্ট",
    Worker: "কর্মী",
    "DD Division": "উপপরিচালক (বিভাগ)",
    "DD District": "উপপরিচালক (জেলা)",
    "District Facilitator": "জেলা সহায়ক",
  };

  return isBn ? (roleLabels[roleName] ?? roleName) : roleName;
}

export function getCenterLabel(
  center: { centerName?: string | null; location?: string | null; centerType?: string | null } | string | null | undefined,
  isBn: boolean,
): string {
  if (!center) return "";

  const centerName = typeof center === "string" ? center : center.centerName ?? "";
  const location = typeof center === "string" ? "" : center.location ?? "";
  const centerType = typeof center === "string" ? "" : center.centerType ?? "";

  const haystack = `${centerName} ${location} ${centerType}`.toLowerCase();

  if (haystack.includes("tongi")) {
    return isBn ? "শিশু উন্নয়ন কেন্দ্র (বালক), টঙ্গী" : "Child Development Center (Boys), Tongi";
  }
  if (haystack.includes("konabari")) {
    return isBn ? "শিশু উন্নয়ন কেন্দ্র (বালিকা), কোনাবাড়ী" : "Child Development Center (Girls), Konabari";
  }
  if (haystack.includes("fulerhat") || haystack.includes("jashore")) {
    return isBn ? "শিশু উন্নয়ন কেন্দ্র (বালক), ফুলেরহাট" : "Child Development Center (Boys), Fulerhat";
  }
  if (haystack.includes("agargaon") || haystack.includes("head office")) {
    return isBn ? "সমাজসেবা অধিদপ্তর প্রধান কার্যালয়, আগারগাঁও" : "DSS Head Office, Agargaon";
  }

  return centerName;
}

export function getCourtOutcomeLabel(outcome: string | null | undefined, isBn: boolean): string {
  if (!outcome) return "";

  const labels: Record<string, string> = {
    Pending: "অপেক্ষমান",
    "Bail Granted": "জামিন মঞ্জুর",
    Sentenced: "সাজা",
    Acquitted: "খালাস",
    "Case Withdrawn": "মামলা প্রত্যাহার",
    "Referred to JCC": "জেসিসি প্রেরিত",
  };

  return isBn ? (labels[outcome] ?? outcome) : outcome;
}

export function getFollowUpVisitTypeLabel(visitType: string | null | undefined, isBn: boolean): string {
  if (!visitType) return "";

  const labels: Record<string, string> = {
    Home: "বাড়ি পরিদর্শন",
    Phone: "ফোনে যোগাযোগ",
    Office: "অফিস ভিজিট",
    Community: "কমিউনিটি",
    Routine: "নিয়মিত",
  };

  return isBn ? (labels[visitType] ?? visitType) : visitType;
}
