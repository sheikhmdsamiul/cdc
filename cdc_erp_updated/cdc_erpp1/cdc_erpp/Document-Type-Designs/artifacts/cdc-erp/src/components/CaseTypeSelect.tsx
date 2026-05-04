import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CaseTypeSelect({ value, onChange, isBn }: { value: string; onChange: (v: string) => void; isBn: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ["case-types"],
    queryFn: () => fetch("/api/case-types").then(r => r.json()),
  });

  const caseTypes = data?.caseTypes?.filter((ct: any) => ct.isActive) ?? [];

  if (isLoading) return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-2 px-3 border rounded-md bg-muted/20">
      <Loader2 className="h-4 w-4 animate-spin" /> {isBn ? "লোড হচ্ছে..." : "Loading..."}
    </div>
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder={isBn ? "বেছে নিন" : "Select"} /></SelectTrigger>
      <SelectContent>
        {caseTypes.map((ct: any) => (
          <SelectItem key={ct.id} value={ct.nameEn}>{isBn ? ct.nameBn : ct.nameEn}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
