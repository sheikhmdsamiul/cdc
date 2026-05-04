import { useState } from "react";
import { useAuth, hasRole } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Building2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Center = {
  id: number;
  centerName: string;
  centerType: string;
  location: string | null;
  address: string | null;
  isHq: string | null;
};

function CenterForm({ initial, onSave, onClose, isBn }: {
  initial?: Partial<Center>;
  onSave: (data: any) => void;
  onClose: () => void;
  isBn: boolean;
}) {
  const [form, setForm] = useState({
    centerName: initial?.centerName ?? "",
    centerType: initial?.centerType ?? "Boys",
    location: initial?.location ?? "",
    address: initial?.address ?? "",
    isHq: initial?.isHq ?? "no",
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="space-y-2">
        <Label>{isBn ? "কেন্দ্রের নাম" : "Center Name"}</Label>
        <Input value={form.centerName} onChange={(e) => setForm({ ...form, centerName: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isBn ? "ধরন" : "Type"}</Label>
          <Select value={form.centerType} onValueChange={(v) => setForm({ ...form, centerType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Boys">{isBn ? "বালক" : "Boys"}</SelectItem>
              <SelectItem value="Girls">{isBn ? "বালিকা" : "Girls"}</SelectItem>
              <SelectItem value="Mixed">{isBn ? "মিশ্র" : "Mixed"}</SelectItem>
              <SelectItem value="HQ">{isBn ? "প্রধান দপ্তর (HQ)" : "HQ"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{isBn ? "অবস্থান" : "Location"}</Label>
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{isBn ? "ঠিকানা" : "Address"}</Label>
        <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit">{initial?.id ? (isBn ? "আপডেট করুন" : "Update Center") : (isBn ? "কেন্দ্র যোগ করুন" : "Add Center")}</Button>
        <Button type="button" variant="outline" onClick={onClose}>{isBn ? "বাতিল" : "Cancel"}</Button>
      </div>
    </form>
  );
}

export default function CentersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Center | null>(null);

  const canManage = hasRole(user, "Super Admin", "Center Admin", "Head Office");

  const { data } = useQuery({
    queryKey: ["centers"],
    queryFn: () => fetch("/api/centers", { credentials: "include" }).then((r) => r.json()),
  });

  const centers: Center[] = data?.centers ?? [];

  const createMutation = useMutation({
    mutationFn: (d: any) => fetch("/api/centers", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["centers"] }); setOpen(false); toast({ title: isBn ? "কেন্দ্র যোগ করা হয়েছে" : "Center added" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => fetch(`/api/centers/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["centers"] }); setEditing(null); toast({ title: isBn ? "কেন্দ্র আপডেট হয়েছে" : "Center updated" }); },
  });

  const typeColor: Record<string, string> = {
    Boys: "bg-blue-100 text-blue-800",
    Girls: "bg-pink-100 text-pink-800",
    Mixed: "bg-purple-100 text-purple-800",
    HQ: "bg-amber-100 text-amber-800",
  };

  const typeLabel: Record<string, string> = isBn
    ? { Boys: "বালক", Girls: "বালিকা", Mixed: "মিশ্র", HQ: "প্রধান দপ্তর" }
    : { Boys: "Boys", Girls: "Girls", Mixed: "Mixed", HQ: "HQ" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isBn ? "কেন্দ্রসমূহ" : "Centers"}</h1>
          <p className="text-muted-foreground text-sm mt-1">{isBn ? "সিডিসি কেন্দ্র ও প্রধান দপ্তর" : "CDC facilities and head office"}</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />{isBn ? "কেন্দ্র যোগ করুন" : "Add Center"}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{isBn ? "কেন্দ্র যোগ করুন" : "Add Center"}</DialogTitle></DialogHeader>
              <CenterForm isBn={isBn} onSave={(d) => createMutation.mutate(d)} onClose={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {centers.map((c) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{c.centerName}</h3>
                    {c.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {c.location}
                      </div>
                    )}
                    {c.address && <p className="text-xs text-muted-foreground mt-0.5">{c.address}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[c.centerType] ?? "bg-gray-100 text-gray-800"}`}>
                    {c.isHq === "yes" ? (isBn ? "প্রধান দপ্তর" : "HQ") : (typeLabel[c.centerType] ?? c.centerType)}
                  </span>
                  {canManage && (
                    <Button size="sm" variant="ghost" onClick={() => setEditing(c)}>{isBn ? "সম্পাদনা" : "Edit"}</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{isBn ? "কেন্দ্র সম্পাদনা" : "Edit Center"}</DialogTitle></DialogHeader>
            <CenterForm isBn={isBn} initial={editing} onSave={(d) => updateMutation.mutate({ id: editing.id, data: d })} onClose={() => setEditing(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
