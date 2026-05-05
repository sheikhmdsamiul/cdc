import { useState } from "react";
import { useAuth, hasRole, usePermission } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Unit = {
  id: number;
  unitName: string;
  unitType: string;
  parentUnitId: number | null;
  linkedCenterId: number | null;
  centerName: string | null;
};

type Center = { id: number; centerName: string };

const TYPE_ORDER = ["HQ", "Division", "District", "Center"];
const TYPE_COLOR: Record<string, string> = {
  HQ: "bg-amber-100 text-amber-900 border-amber-300",
  Division: "bg-blue-100 text-blue-900 border-blue-300",
  District: "bg-teal-100 text-teal-900 border-teal-300",
  Center: "bg-green-100 text-green-900 border-green-300",
};

function getTypeLabel(type: string, isBn: boolean): string {
  if (!isBn) return type;
  const map: Record<string, string> = { HQ: "প্রধান দপ্তর", Division: "বিভাগ", District: "জেলা", Center: "কেন্দ্র" };
  return map[type] ?? type;
}

function UnitNode({ unit, allUnits, depth, canManage, onEdit, onDelete }: {
  unit: Unit;
  allUnits: Unit[];
  depth: number;
  canManage: boolean;
  onEdit: (u: Unit) => void;
  onDelete: (u: Unit) => void;
}) {
  const children = allUnits.filter((u) => u.parentUnitId === unit.id);
  return (
    <div className={depth > 0 ? "ml-6 border-l border-border pl-4 mt-2" : "mt-2"}>
      <div className="flex items-center gap-2 group">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${TYPE_COLOR[unit.unitType] ?? "bg-gray-100 text-gray-800 border-gray-300"}`}>
          {unit.unitName}
          {unit.centerName && (
            <span className="text-xs opacity-70">({unit.centerName})</span>
          )}
        </div>
        {canManage && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onEdit(unit)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive" onClick={() => onDelete(unit)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      {children.map((child) => (
        <UnitNode key={child.id} unit={child} allUnits={allUnits} depth={depth + 1} canManage={canManage} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

function UnitForm({ initial, units, centers, onSave, onClose, isBn }: {
  initial?: Partial<Unit>;
  units: Unit[];
  centers: Center[];
  onSave: (data: any) => void;
  onClose: () => void;
  isBn: boolean;
}) {
  const [form, setForm] = useState({
    unitName: initial?.unitName ?? "",
    unitType: initial?.unitType ?? "Division",
    parentUnitId: initial?.parentUnitId?.toString() ?? "none",
    linkedCenterId: initial?.linkedCenterId?.toString() ?? "none",
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, parentUnitId: form.parentUnitId === "none" ? null : form.parentUnitId, linkedCenterId: form.linkedCenterId === "none" ? null : form.linkedCenterId }); }} className="space-y-4">
      <div className="space-y-2">
        <Label>{isBn ? "ইউনিটের নাম" : "Unit Name"}</Label>
        <Input value={form.unitName} onChange={(e) => setForm({ ...form, unitName: e.target.value })} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isBn ? "ধরন" : "Type"}</Label>
          <Select value={form.unitType} onValueChange={(v) => setForm({ ...form, unitType: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPE_ORDER.map((t) => <SelectItem key={t} value={t}>{getTypeLabel(t, isBn)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{isBn ? "মূল ইউনিট" : "Parent Unit"}</Label>
          <Select value={form.parentUnitId} onValueChange={(v) => setForm({ ...form, parentUnitId: v })}>
            <SelectTrigger><SelectValue placeholder={isBn ? "কোনটি নয়" : "None"} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{isBn ? "কোনটি নয়" : "None"}</SelectItem>
              {units.filter(u => u.id !== initial?.id).map((u) => (
                <SelectItem key={u.id} value={u.id.toString()}>{u.unitName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>{isBn ? "সংযুক্ত কেন্দ্র (ঐচ্ছিক)" : "Linked Center (optional)"}</Label>
        <Select value={form.linkedCenterId} onValueChange={(v) => setForm({ ...form, linkedCenterId: v })}>
          <SelectTrigger><SelectValue placeholder={isBn ? "কোনটি নয়" : "None"} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{isBn ? "কোনটি নয়" : "None"}</SelectItem>
            {centers.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.centerName}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit">{initial?.id ? (isBn ? "আপডেট করুন" : "Update Unit") : (isBn ? "ইউনিট যোগ করুন" : "Add Unit")}</Button>
        <Button type="button" variant="outline" onClick={onClose}>{isBn ? "বাতিল" : "Cancel"}</Button>
      </div>
    </form>
  );
}

export default function OrgStructurePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [deleting, setDeleting] = useState<Unit | null>(null);

  const canView   = usePermission("org_structure", "view");
  const canCreate = usePermission("org_structure", "create");
  const canEdit   = usePermission("org_structure", "edit");
  const canDelete = usePermission("org_structure", "delete");

  const canManage = canCreate || canEdit || canDelete;

  const { data: unitsData } = useQuery({
    queryKey: ["admin-units"],
    queryFn: () => fetch("/api/admin-units", { credentials: "include" }).then((r) => r.json()),
  });

  const { data: centersData } = useQuery({
    queryKey: ["centers"],
    queryFn: () => fetch("/api/centers", { credentials: "include" }).then((r) => r.json()),
  });

  const units: Unit[] = unitsData?.units ?? [];
  const centers: Center[] = centersData?.centers ?? [];

  const createMutation = useMutation({
    mutationFn: (d: any) => fetch("/api/admin-units", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-units"] }); setAddOpen(false); toast({ title: isBn ? "ইউনিট যোগ করা হয়েছে" : "Unit added" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => fetch(`/api/admin-units/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-units"] }); setEditing(null); toast({ title: isBn ? "ইউনিট আপডেট হয়েছে" : "Unit updated" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/admin-units/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-units"] }); setDeleting(null); toast({ title: isBn ? "ইউনিট মুছে ফেলা হয়েছে" : "Unit deleted" }); },
  });

  const roots = units.filter((u) => !u.parentUnitId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isBn ? "প্রশাসনিক কাঠামো" : "Organizational Structure"}</h1>
          <p className="text-muted-foreground text-sm mt-1">{isBn ? "DSS নেটওয়ার্কের প্রশাসনিক স্তরবিন্যাস" : "Administrative hierarchy for the DSS network"}</p>
        </div>
        {canManage && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />{isBn ? "ইউনিট যোগ করুন" : "Add Unit"}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{isBn ? "প্রশাসনিক ইউনিট যোগ করুন" : "Add Administrative Unit"}</DialogTitle></DialogHeader>
              <UnitForm isBn={isBn} units={units} centers={centers} onSave={(d) => createMutation.mutate(d)} onClose={() => setAddOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {TYPE_ORDER.map((t) => (
          <div key={t} className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-medium ${TYPE_COLOR[t]}`}>
            {getTypeLabel(t, isBn)}
          </div>
        ))}
        {canManage && (
          <p className="text-xs text-muted-foreground self-center ml-2">
            {isBn ? "✏️ ইউনিটের উপর হোভার করুন সম্পাদনা/মুছে ফেলার জন্য" : "Hover over a unit to edit or delete it"}
          </p>
        )}
      </div>

      {/* Tree */}
      <div className="bg-card border rounded-xl p-6 space-y-2">
        {roots.length === 0 ? (
          <p className="text-muted-foreground text-sm">{isBn ? "এখনো কোনো ইউনিট নির্ধারণ করা হয়নি।" : "No units defined yet."}</p>
        ) : (
          roots.map((root) => (
            <UnitNode
              key={root.id}
              unit={root}
              allUnits={units}
              depth={0}
              canManage={canManage}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))
        )}
      </div>

      {/* Edit Dialog */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isBn ? "ইউনিট সম্পাদনা করুন" : "Edit Unit"}</DialogTitle>
            </DialogHeader>
            <UnitForm
              isBn={isBn}
              initial={editing}
              units={units}
              centers={centers}
              onSave={(d) => updateMutation.mutate({ id: editing.id, data: d })}
              onClose={() => setEditing(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirm Dialog */}
      {deleting && (
        <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{isBn ? "ইউনিট মুছে ফেলুন" : "Delete Unit"}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {isBn
                ? `"${deleting.unitName}" মুছে ফেলতে চান? এর সাব-ইউনিটগুলো মূল ইউনিট হারাবে।`
                : `Delete "${deleting.unitName}"? Its sub-units will lose their parent.`}
            </p>
            <div className="flex gap-2 mt-4">
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(deleting.id)}
                disabled={deleteMutation.isPending}
              >
                {isBn ? "মুছে ফেলুন" : "Delete"}
              </Button>
              <Button variant="outline" onClick={() => setDeleting(null)}>
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
