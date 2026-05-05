import { useState } from "react";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Tags, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type FamilyType = {
  id: number;
  nameBn: string;
  nameEn: string;
  isActive: boolean;
};

const QUERY_KEY = ["family-types"];

function FamilyTypeForm({ initial, onSave, onClose, isBn }: {
  initial?: Partial<FamilyType>;
  onSave: (data: any) => void;
  onClose: () => void;
  isBn: boolean;
}) {
  const [form, setForm] = useState({
    nameBn: initial?.nameBn ?? "",
    nameEn: initial?.nameEn ?? "",
    isActive: initial?.isActive ?? true,
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="space-y-2">
        <Label>{isBn ? "নাম (বাংলা)" : "Name (Bangla)"}</Label>
        <Input value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} required placeholder="যেমন: যৌথ" />
      </div>
      <div className="space-y-2">
        <Label>{isBn ? "নাম (ইংরেজি)" : "Name (English)"}</Label>
        <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required placeholder="e.g. Joint" />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="isActive"
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="h-4 w-4 rounded border-border"
        />
        <Label htmlFor="isActive">{isBn ? "সক্রিয়" : "Active"}</Label>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit">{initial?.id ? (isBn ? "আপডেট করুন" : "Update") : (isBn ? "যোগ করুন" : "Add")}</Button>
        <Button type="button" variant="outline" onClick={onClose}>{isBn ? "বাতিল" : "Cancel"}</Button>
      </div>
    </form>
  );
}

export default function FamilyTypesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FamilyType | null>(null);
  const [deleting, setDeleting] = useState<FamilyType | null>(null);

  const canView   = usePermission("family_types", "view");
  const canCreate = usePermission("family_types", "create");
  const canEdit   = usePermission("family_types", "edit");
  const canDelete = usePermission("family_types", "delete");

  const canManage = canCreate || canEdit || canDelete;

  const { data } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetch("/api/family-types", { credentials: "include" }).then((r) => r.json()),
  });

  const familyTypes: FamilyType[] = data?.familyTypes ?? [];

  const createMutation = useMutation({
    mutationFn: async (d: any) => {
      const r = await fetch("/api/family-types", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEY }); setOpen(false); toast({ title: isBn ? "পরিবারের ধরণ যোগ করা হয়েছে" : "Family type added" }); },
    onError: (err) => toast({ title: isBn ? "ত্রুটি" : "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const r = await fetch(`/api/family-types/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEY }); setEditing(null); toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" }); },
    onError: (err) => toast({ title: isBn ? "ত্রুটি" : "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/family-types/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUERY_KEY }); setDeleting(null); toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" }); },
    onError: (err) => toast({ title: isBn ? "ত্রুটি" : "Error", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isBn ? "পরিবারের ধরণ" : "Family Types"}</h1>
          <p className="text-muted-foreground text-sm mt-1">{isBn ? "পরিবারের ধরণ পরিচালনা করুন" : "Manage family types for the ERP"}</p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />{isBn ? "পরিবারের ধরণ যোগ করুন" : "Add Family Type"}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{isBn ? "নতুন পরিবারের ধরণ" : "New Family Type"}</DialogTitle></DialogHeader>
              <FamilyTypeForm isBn={isBn} onSave={(d) => createMutation.mutate(d)} onClose={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {familyTypes.map((ct) => (
          <Card key={ct.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Tags className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{isBn ? ct.nameBn : ct.nameEn}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{isBn ? ct.nameEn : ct.nameBn}</p>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${ct.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {ct.isActive ? (isBn ? "সক্রিয়" : "Active") : (isBn ? "নিষ্ক্রিয়" : "Inactive")}
                    </span>
                  </div>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditing(ct)} title={isBn ? "সম্পাদনা" : "Edit"}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleting(ct)} title={isBn ? "মুছুন" : "Delete"}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {familyTypes.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground text-sm">
            {isBn ? "কোনো পরিবারের ধরণ পাওয়া যায়নি।" : "No family types found."}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{isBn ? "পরিবারের ধরণ সম্পাদনা" : "Edit Family Type"}</DialogTitle></DialogHeader>
            <FamilyTypeForm isBn={isBn} initial={editing} onSave={(d) => updateMutation.mutate({ id: editing.id, data: d })} onClose={() => setEditing(null)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirm Dialog */}
      {deleting && (
        <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{isBn ? "নিশ্চিত করুন" : "Confirm Delete"}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              {isBn
                ? `"${deleting.nameBn}" মুছে ফেলতে চান?`
                : `Are you sure you want to delete "${deleting.nameEn}"?`}
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>
                {isBn ? "হ্যাঁ, মুছুন" : "Yes, Delete"}
              </Button>
              <Button variant="outline" onClick={() => setDeleting(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
