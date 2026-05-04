import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDivisionData } from "@/hooks/use-division-data";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AddressForm({ onUpdate }: { onUpdate: (data: any) => void }) {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");

  const { divisionData: divisions } = useDivisionData();
  const selectedDivision = divisions.find((d) => d.id.toString() === division);
  const districts = selectedDivision?.districts ?? [];
  const selectedDistrict = districts.find((d) => d.id.toString() === district);
  const upazilas = selectedDistrict?.upazilas ?? [];

  const handleUpdate = (div: string, dist: string, upa: string) => {
    onUpdate({ division: div, district: dist, upazila: upa });
  };

  return (
    <div className="space-y-4 px-3 py-2">
      <div className="space-y-1">
        <Label className="text-xs text-sidebar-foreground/70">{isBn ? "বিভাগ" : "Division"}</Label>
        <Select value={division} onValueChange={(v) => { setDivision(v); setDistrict(""); setUpazila(""); handleUpdate(v, "", ""); }}>
          <SelectTrigger><SelectValue placeholder={isBn ? "বিভাগ নির্বাচন করুন" : "Select Division"} /></SelectTrigger>
          <SelectContent>
            {divisions.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>{isBn ? d.bn : d.en}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-sidebar-foreground/70">{isBn ? "জেলা" : "District"}</Label>
        <Select disabled={!division} value={district} onValueChange={(v) => { setDistrict(v); setUpazila(""); handleUpdate(division, v, ""); }}>
          <SelectTrigger><SelectValue placeholder={isBn ? "জেলা নির্বাচন করুন" : "Select District"} /></SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>{isBn ? d.bn : d.en}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-sidebar-foreground/70">{isBn ? "উপজেলা" : "Upazila"}</Label>
        <Select disabled={!district} value={upazila} onValueChange={(v) => { setUpazila(v); handleUpdate(division, district, v); }}>
          <SelectTrigger><SelectValue placeholder={isBn ? "উপজেলা নির্বাচন করুন" : "Select Upazila"} /></SelectTrigger>
          <SelectContent>
            {upazilas.map((u) => {
              const val = typeof u === 'string' ? u : u.id.toString();
              const label = typeof u === 'string' ? u : (isBn ? u.bn : u.en);
              return <SelectItem key={val} value={val}>{label}</SelectItem>;
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
