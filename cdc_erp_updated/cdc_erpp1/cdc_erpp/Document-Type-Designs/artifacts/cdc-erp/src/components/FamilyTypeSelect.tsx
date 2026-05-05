import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type FamilyType = {
  id: number;
  nameBn: string;
  nameEn: string;
  isActive: boolean;
};

interface FamilyTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function FamilyTypeSelect({ value, onChange, disabled }: FamilyTypeSelectProps) {
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";

  const { data, isLoading, error } = useQuery({
    queryKey: ["family-types"],
    queryFn: async () => {
      const res = await fetch("/api/family-types");
      if (!res.ok) throw new Error("Failed to fetch family types");
      return res.json();
    },
  });

  const familyTypes: FamilyType[] = data?.familyTypes ?? [];
  const activeFamilyTypes = familyTypes.filter(ft => ft.isActive);

  if (error) {
    return (
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full border-red-500">
          <SelectValue placeholder={isBn ? "ত্রুটি হয়েছে" : "Error loading"} />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger className="w-full">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{isBn ? "লোড হচ্ছে..." : "Loading..."}</span>
          </div>
        ) : (
          <SelectValue placeholder={isBn ? "পরিবারের ধরন নির্বাচন করুন" : "Select family type"} />
        )}
      </SelectTrigger>
      <SelectContent>
        {activeFamilyTypes.map((ft) => (
          <SelectItem key={ft.id} value={isBn ? ft.nameBn : ft.nameEn}>
            {isBn ? ft.nameBn : ft.nameEn}
          </SelectItem>
        ))}
        {activeFamilyTypes.length === 0 && !isLoading && (
          <SelectItem value="_empty" disabled>
            {isBn ? "কোনো ধরন পাওয়া যায়নি" : "No types found"}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
