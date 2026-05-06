import { useState } from "react";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, GraduationCap, Hammer, Pencil, Trash2, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LookupItem = {
  id: number;
  nameBn: string;
  nameEn: string;
  isActive: boolean;
};

function LookupForm({ initial, onSave, onClose, isBn, type }: {
  initial?: Partial<LookupItem>;
  onSave: (data: any) => void;
  onClose: () => void;
  isBn: boolean;
  type: "Class" | "Training";
}) {
  const [form, setForm] = useState({
    nameBn: initial?.nameBn ?? "",
    nameEn: initial?.nameEn ?? "",
    isActive: initial?.isActive ?? true,
  });
  
  const label = type === "Class" 
    ? (isBn ? "শ্রেণি" : "Class") 
    : (isBn ? "প্রশিক্ষণ" : "Training");

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="space-y-2">
        <Label>{isBn ? `${label}র নাম (বাংলা)` : `${label} Name (Bangla)`}</Label>
        <Input value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} required placeholder={isBn ? "যেমন: ১০ম শ্রেণি" : "e.g. Class 10"} />
      </div>
      <div className="space-y-2">
        <Label>{isBn ? `${label}র নাম (ইংরেজি)` : `${label} Name (English)`}</Label>
        <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} required placeholder={isBn ? "যেমন: Class 10" : "e.g. Class 10"} />
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

function LookupSection({ type, isBn, canManage }: { type: "Class" | "Training", isBn: boolean, canManage: boolean }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LookupItem | null>(null);
  const [deleting, setDeleting] = useState<LookupItem | null>(null);

  const endpoint = type === "Class" ? "/api/classes" : "/api/trainings";
  const queryKey = [type === "Class" ? "classes" : "trainings"];

  const { data: items = [] } = useQuery({
    queryKey,
    queryFn: () => fetch(endpoint, { credentials: "include" }).then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: async (d: any) => {
      const r = await fetch(endpoint, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey }); 
      setOpen(false); 
      toast({ title: isBn ? "যোগ করা হয়েছে" : "Added successfully" }); 
    },
    onError: (err) => toast({ title: isBn ? "ত্রুটি" : "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const r = await fetch(`${endpoint}/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey }); 
      setEditing(null); 
      toast({ title: isBn ? "আপডেট হয়েছে" : "Updated successfully" }); 
    },
    onError: (err) => toast({ title: isBn ? "ত্রুটি" : "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`${endpoint}/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey }); 
      setDeleting(null); 
      toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted successfully" }); 
    },
    onError: (err) => toast({ title: isBn ? "ত্রুটি" : "Error", description: err.message, variant: "destructive" }),
  });

  const title = type === "Class" ? (isBn ? "শ্রেণি" : "Classes") : (isBn ? "প্রশিক্ষণ" : "Trainings");
  const Icon = type === "Class" ? GraduationCap : Hammer;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? `${title} পরিচালনা করুন` : `Manage ${title.toLowerCase()} for the system`}
          </p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />{isBn ? "যোগ করুন" : `Add ${type}`}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>{isBn ? `নতুন ${title}` : `New ${type}`}</DialogTitle></DialogHeader>
              <LookupForm type={type} isBn={isBn} onSave={(d) => createMutation.mutate(d)} onClose={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item: LookupItem) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{isBn ? item.nameBn : item.nameEn}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{isBn ? item.nameEn : item.nameBn}</p>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.isActive ? (isBn ? "সক্রিয়" : "Active") : (isBn ? "নিষ্ক্রিয়" : "Inactive")}
                    </span>
                  </div>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditing(item)} title={isBn ? "সম্পাদনা" : "Edit"}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleting(item)} title={isBn ? "মুছুন" : "Delete"}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground text-sm">
            {isBn ? "কোনো তথ্য পাওয়া যায়নি।" : "No data found."}
          </div>
        )}
      </div>

      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{isBn ? "সম্পাদনা করুন" : "Edit Item"}</DialogTitle></DialogHeader>
            <LookupForm type={type} isBn={isBn} initial={editing} onSave={(d) => updateMutation.mutate({ id: editing.id, data: d })} onClose={() => setEditing(null)} />
          </DialogContent>
        </Dialog>
      )}

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

export default function EducationConfigPage() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const canView   = usePermission("education-skills", "view");
  const canCreate = usePermission("education-skills", "create");
  const canEdit   = usePermission("education-skills", "edit");
  const canDelete = usePermission("education-skills", "delete");

  const canManage = canCreate || canEdit || canDelete;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{isBn ? "শিক্ষা ও প্রশিক্ষণ ব্যবস্থাপনা" : "Education & Training Management"}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isBn ? "সিস্টেমের জন্য শ্রেণি এবং প্রশিক্ষণের তালিকা পরিচালনা করুন" : "Manage classes and trainings available in the system"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="classes" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            {isBn ? "শ্রেণি" : "Classes"}
          </TabsTrigger>
          <TabsTrigger value="trainings" className="gap-2">
            <Hammer className="h-4 w-4" />
            {isBn ? "প্রশিক্ষণ" : "Trainings"}
          </TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="classes">
            <LookupSection type="Class" isBn={isBn} canManage={canManage} />
          </TabsContent>
          <TabsContent value="trainings">
            <LookupSection type="Training" isBn={isBn} canManage={canManage} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
