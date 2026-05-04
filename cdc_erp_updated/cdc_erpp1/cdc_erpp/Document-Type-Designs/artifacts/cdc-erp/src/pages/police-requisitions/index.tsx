import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Shield, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { useAuth, hasRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Sent: "bg-blue-100 text-blue-700",
  Acknowledged: "bg-indigo-100 text-indigo-700",
  Fulfilled: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const STATUSES = ["Draft", "Sent", "Acknowledged", "Fulfilled", "Cancelled"];

const STATUS_LABEL_BN: Record<string, string> = {
  Draft: "খসড়া", Sent: "প্রেরিত", Acknowledged: "স্বীকৃত", Fulfilled: "পূরণ হয়েছে", Cancelled: "বাতিল",
};

type PoliceReq = {
  id: number;
  acquisitionId: string;
  childId?: number;
  childName?: string;
  courtName?: string;
  caseNumber?: string;
  hearingDate?: string;
  policeStation?: string;
  officersRequired?: number;
  escortDepartureTime?: string;
  requisitionDate?: string;
  status: string;
  remarks?: string;
};

const EMPTY_EDIT = {
  courtName: "", caseNumber: "", hearingDate: "", policeStation: "",
  officersRequired: "2", escortDepartureTime: "", requisitionDate: "", status: "Draft", remarks: "",
};

export default function PoliceRequisitionsList() {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const { toast } = useToast();
  const canManage = hasRole(user, "Super Admin", "Center Admin");

  const [deleting, setDeleting] = useState<PoliceReq | null>(null);
  const [editing, setEditing] = useState<PoliceReq | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const queryClient = useQueryClient();

  const { data: resp, isLoading } = useQuery({
    queryKey: ["police-requisitions"],
    queryFn: () => fetch("/api/police-acquisitions", { credentials: "include" }).then(r => r.json()),
  });

  const data: PoliceReq[] = Array.isArray(resp) ? resp : (resp as any)?.data ?? [];

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetch(`/api/police-acquisitions/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["police-requisitions"] }); setEditing(null); toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/police-acquisitions/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["police-requisitions"] }); setDeleting(null); toast({ title: isBn ? "মুছে ফেলা হয়েছে" : "Deleted" }); },
  });

  function openEdit(r: PoliceReq) {
    setEditForm({
      courtName: r.courtName ?? "",
      caseNumber: r.caseNumber ?? "",
      hearingDate: r.hearingDate ?? "",
      policeStation: r.policeStation ?? "",
      officersRequired: String(r.officersRequired ?? 2),
      escortDepartureTime: r.escortDepartureTime ?? "",
      requisitionDate: r.requisitionDate ?? "",
      status: r.status ?? "Draft",
      remarks: r.remarks ?? "",
    });
    setEditing(r);
  }

  const upcomingHearings = data.filter(r => {
    if (r.status === "Fulfilled" || r.status === "Cancelled") return false;
    if (!r.hearingDate) return false;
    const diff = new Date(r.hearingDate).getTime() - Date.now();
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  });

  const columns: ColumnDef<PoliceReq>[] = [
    { key: "acquisitionId", label: "Requisition ID", labelBn: "চাহিদাপত্র আইডি", filterType: "text", exportValue: r => r.acquisitionId ?? "", render: r => <span className="font-mono text-xs font-medium">{r.acquisitionId}</span> },
    { key: "childName", label: "Child", labelBn: "শিশু", filterType: "text", exportValue: r => r.childName ?? `#${r.childId}`, render: r => <span className="font-medium">{r.childName || `#${r.childId}`}</span> },
    { key: "courtName", label: "Court", labelBn: "আদালত", filterType: "text", exportValue: r => r.courtName ?? "", render: r => <span className="text-muted-foreground">{r.courtName || "—"}</span> },
    {
      key: "hearingDate", label: "Hearing Date", labelBn: "শুনানির তারিখ", exportValue: r => r.hearingDate ?? "",
      render: r => {
        const daysUntil = r.hearingDate ? Math.ceil((new Date(r.hearingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
        const isUrgent = daysUntil !== null && daysUntil >= 0 && daysUntil <= 3 && r.status !== "Fulfilled" && r.status !== "Cancelled";
        return (
          <span className={isUrgent ? "text-red-700 font-semibold" : ""}>
            {r.hearingDate || "—"}
            {isUrgent && <span className="ml-1 text-xs text-red-600">({isBn ? `${daysUntil} দিন` : `${daysUntil}d`})</span>}
          </span>
        );
      },
    },
    { key: "policeStation", label: "Police Station", labelBn: "পুলিশ স্টেশন", filterType: "text", exportValue: r => r.policeStation ?? "", render: r => <span className="text-muted-foreground">{r.policeStation || "—"}</span> },
    {
      key: "status", label: "Status", labelBn: "অবস্থা", filterType: "select",
      filterOptions: STATUSES.map(s => ({ value: s, label: s, labelBn: STATUS_LABEL_BN[s] ?? s })),
      exportValue: r => r.status ?? "",
      render: r => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>{isBn ? (STATUS_LABEL_BN[r.status] ?? r.status) : r.status}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("policeRequisitions.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("policeRequisitions.subtitle")}</p>
        </div>
        <Link href="/police-requisitions/new">
          <Button className="gap-2 bg-[#166534] hover:bg-[#0d4427]"><Plus className="h-4 w-4" />{t("policeRequisitions.newRequisition")}</Button>
        </Link>
      </div>

      {upcomingHearings.length > 0 && (
        <div className="rounded-md bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            {isBn
              ? `${upcomingHearings.length}টি শুনানি আগামী ৭ দিনের মধ্যে। পুলিশ চাহিদাপত্র পাঠানো নিশ্চিত করুন।`
              : `${upcomingHearings.length} hearing(s) within the next 7 days. Ensure requisitions are sent.`}
          </p>
        </div>
      )}

      <DataTable
        columns={columns} data={data} isLoading={isLoading} isBn={isBn}
        exportTitle="Police Requisitions" exportTitleBn="পুলিশ চাহিদাপত্রের তালিকা"
        emptyText="No requisitions found." emptyTextBn="কোনো চাহিদাপত্র পাওয়া যায়নি।"
        onRowClick={r => navigate(`/police-requisitions/${r.id}`)}
        actions={canManage ? r => (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(r)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleting(r)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : r => <Link href={`/police-requisitions/${r.id}`}><Button variant="ghost" size="sm">{t("common.view")}</Button></Link>}
        searchPlaceholder="Search by ID, child, court..."
        searchPlaceholderBn="আইডি, শিশু বা আদালত দিয়ে অনুসন্ধান..."
      />

      <Dialog open={!!editing} onOpenChange={v => { if (!v) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isBn ? "পুলিশ চাহিদাপত্র সম্পাদনা" : "Edit Police Requisition"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!editing) return;
              updateMutation.mutate({ id: editing.id, data: { ...editForm, officersRequired: parseInt(editForm.officersRequired) || 2 } });
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isBn ? "আদালতের নাম" : "Court Name"}</Label>
                <Input value={editForm.courtName} onChange={e => setEditForm(f => ({ ...f, courtName: e.target.value }))} />
              </div>
              <div>
                <Label>{isBn ? "মামলা নম্বর" : "Case Number"}</Label>
                <Input value={editForm.caseNumber} onChange={e => setEditForm(f => ({ ...f, caseNumber: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isBn ? "শুনানির তারিখ *" : "Hearing Date *"}</Label>
                <Input type="date" value={editForm.hearingDate} onChange={e => setEditForm(f => ({ ...f, hearingDate: e.target.value }))} required />
              </div>
              <div>
                <Label>{isBn ? "পুলিশ স্টেশন" : "Police Station"}</Label>
                <Input value={editForm.policeStation} onChange={e => setEditForm(f => ({ ...f, policeStation: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isBn ? "অফিসার সংখ্যা" : "Officers Required"}</Label>
                <Input type="number" min={1} value={editForm.officersRequired} onChange={e => setEditForm(f => ({ ...f, officersRequired: e.target.value }))} />
              </div>
              <div>
                <Label>{isBn ? "অবস্থা" : "Status"}</Label>
                <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{isBn ? STATUS_LABEL_BN[s] : s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{isBn ? "মন্তব্য" : "Remarks"}</Label>
              <Textarea value={editForm.remarks} onChange={e => setEditForm(f => ({ ...f, remarks: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>{isBn ? "আপডেট করুন" : "Update"}</Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{isBn ? "চাহিদাপত্র মুছুন" : "Delete Requisition"}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{isBn ? `"${deleting?.acquisitionId}" মুছে ফেলতে চান?` : `Delete "${deleting?.acquisitionId}"?`}</p>
          <div className="flex gap-2 mt-4">
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting!.id)} disabled={deleteMutation.isPending}>{isBn ? "মুছুন" : "Delete"}</Button>
            <Button variant="outline" onClick={() => setDeleting(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
