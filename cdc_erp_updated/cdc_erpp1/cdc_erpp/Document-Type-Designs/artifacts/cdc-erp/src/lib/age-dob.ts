export function todayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function calculateAgeFromDob(
  dob: string | null | undefined,
  referenceDate: string = todayIsoDate(),
): number | null {
  if (!dob || !referenceDate) return null;

  const dobDate = new Date(dob);
  const refDate = new Date(referenceDate);
  if (Number.isNaN(dobDate.getTime()) || Number.isNaN(refDate.getTime())) return null;

  let years = refDate.getFullYear() - dobDate.getFullYear();
  const monthDiff = refDate.getMonth() - dobDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < dobDate.getDate())) {
    years -= 1;
  }

  return years >= 0 ? years : null;
}

export function calculateDobFromAge(
  age: number | null | undefined,
  referenceDate: string = todayIsoDate(),
): string | null {
  if (age == null || Number.isNaN(age) || age < 0 || !referenceDate) return null;

  const refDate = new Date(referenceDate);
  if (Number.isNaN(refDate.getTime())) return null;

  const dobDate = new Date(refDate);
  dobDate.setFullYear(dobDate.getFullYear() - age);
  return dobDate.toISOString().split("T")[0];
}

export function derivePredictedDob(child: any): string | null {
  if (child?.dateOfBirth) return child.dateOfBirth;
  if (child?.ageAtAdmission != null && child?.admissionDate) {
    return calculateDobFromAge(child.ageAtAdmission, child.admissionDate);
  }
  return child?.tentativeDoB ?? null;
}

export function derivePredictedAge(child: any): number | null {
  return calculateAgeFromDob(derivePredictedDob(child));
}

export function deriveVerifiedDob(child: any): string | null {
  if (child?.verifiedDob) return child.verifiedDob;
  if (child?.verifiedAge != null && child?.verifiedAgeDate) {
    return calculateDobFromAge(child.verifiedAge, child.verifiedAgeDate);
  }
  return null;
}

export function deriveVerifiedAge(child: any): number | null {
  return calculateAgeFromDob(deriveVerifiedDob(child));
}
