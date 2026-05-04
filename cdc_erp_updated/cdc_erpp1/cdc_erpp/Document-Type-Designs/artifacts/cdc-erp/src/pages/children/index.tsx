import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useListChildren, getListChildrenQueryKey } from "@workspace/api-client-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Pencil, Trash2, Upload } from "lucide-react";
import { format } from "date-fns";
import { DataTable, type ColumnDef } from "@/components/DataTable";
import { useAuth, hasRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getCenterLabel } from "@/i18n/labels";

const STATUS_COLOR: Record<string, string> = {
  Draft: "bg-gray-200 text-gray-700",
  Admitted: "bg-blue-100 text-blue-800",
  "Under Care": "bg-amber-100 text-amber-800",
  Released: "bg-green-100 text-green-800",
  Transferred: "bg-purple-100 text-purple-800",
};

const EMPTY_EDIT = { fullName: "", gender: "Boy", dateOfBirth: "", religion: "", currentStatus: "Admitted" };

export default function ChildrenList() {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const isBn = i18n.language === "bn";
  const { user } = useAuth();
  const { toast } = useToast();
  const canManage = hasRole(user, "Super Admin", "Center Admin");
  const canImport = !!user;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const limit = 20;

  const queryParams = { search: search || undefined, page, limit };
  const { data, isLoading } = useListChildren(queryParams, { query: { queryKey: getListChildrenQueryKey(queryParams) } });
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      fetch(`/api/children/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then(async r => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err?.message ?? "Update failed");
        }
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey(queryParams) });
      setEditing(null);
      toast({ title: isBn ? "আপডেট হয়েছে" : "Updated" });
    },
    onError: (err: any) => {
      toast({ title: isBn ? "ত্রুটি" : "Error", description: err?.message ?? (isBn ? "আপডেট করা যায়নি" : "Update failed"), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/children/${id}`, { method: "DELETE", credentials: "include" }).then(async r => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err?.message ?? "Delete failed");
        }
        // 204 No Content — no body to parse
        if (r.status === 204) return {};
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey(queryParams) });
      setDeleting(null);
      toast({ title: isBn ? "শিশুর রেকর্ড মুছে ফেলা হয়েছে" : "Child record deleted" });
    },
    onError: (err: any) => {
      toast({ title: isBn ? "ত্রুটি" : "Error", description: err?.message ?? (isBn ? "মুছে ফেলা যায়নি" : "Delete failed"), variant: "destructive" });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/children/bulk-import", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: getListChildrenQueryKey(queryParams) });
      setImportResult(result);
      toast({
        title: isBn ? "আমদানি সম্পন্ন" : "Import complete",
        description: isBn
          ? `সফল: ${result?.success ?? 0}, ত্রুটি: ${result?.errors?.length ?? 0}`
          : `Success: ${result?.success ?? 0}, Errors: ${result?.errors?.length ?? 0}`,
      });
    },
    onError: () => {
      toast({ title: isBn ? "আমদানি ব্যর্থ" : "Import failed", variant: "destructive" });
    },
  });

  function downloadTemplate() {
    const csvContent = `কেন্দ্র,পূর্ণ নাম,মায়ের নাম,পিতার নাম,লিঙ্গ,ভর্তি তারিখ,ভর্তি উৎস,বর্তমান অবস্থা,জন্ম তারিখ,যাচাইকৃত জন্ম তারিখ,যাচাইকৃত বয়স,ধর্ম,জাতীয়তা,বর্তমান জেলা,বর্তমান উপজেলা,বর্তমান গ্রাম,স্থায়ী জেলা,স্থায়ী থানা,স্থায়ী গ্রাম,মামলার ধরন,আদালতের রেফারেন্স নং,কেস ফাইল খোলার তারিখ,কেস কর্মী,কেস ঝুঁকির মাত্রা,কেস অবস্থা,কেস সারসংক্ষেপ,তদন্ত নোট,সুপারিশ,আদালত/প্রতিষ্ঠানের নাম,আদালত মামলা নম্বর,থানা,জিআর নম্বর,আইনের ধারা,আইনগত সহায়তার ধরন,শুনানির তারিখ,সর্বশেষ হাজিরার তারিখ,পরবর্তী হাজিরার তারিখ,আইনজীবীর নাম,শিশুর মামলার ধরন,পূর্বে অন্য কোন মামলায় জড়িত,মামলার ফলাফল,এফআইআর নম্বর,এফআইআর তারিখ,মামলার বর্তমান অবস্থা,আদালতে হাজিরির বিবরণ,আদালতে হাজিরির তারিখ,অভিভাবকের সাথে যোগাযোগ,শিক্ষা ও প্রশিক্ষণ,কেন্দ্র থেকে প্রদত্ত সুযোগ সুবিধা,মন্তব্য
টঙ্গী,আলিফ রহমান,ফারহানা বেগম,রফিকুল ইসলাম,ছেলে,2026-03-10,আদালত,ভর্তি,2010-05-12,2010-05-12,15,ইসলাম,বাংলাদেশী,গাজীপুর,টঙ্গী,পূর্ব আরিচপুর,গাজীপুর,টঙ্গী,বেরাইদ,চুরি,CR-102/2026,2026-03-11,মোঃ সালাউদ্দিন,মাঝারি,খোলা,পারিবারিক সহিংসতা ও বিচ্ছিন্নতা সংক্রান্ত কেস,সামাজিক তদন্ত চলমান,পরামর্শ ও পরিবার পুনর্মিলন,শিশু আদালত গাজীপুর,GZ-145/2026,টঙ্গী,GR-12/26,৩৭৯/৪১১,government_legal_aid,2026-03-14,2026-04-10,2026-05-15,এডভোকেট করিম,চুরি,না,Pending,FIR-778,2026-03-09,চলমান,২ বার হাজিরা,14/03/2026;10/04/2026,ফোনে যোগাযোগ,কারিগরি প্রশিক্ষণ,হোস্টেল সুবিধা,নিয়মিত ফলোআপ
টঙ্গী,মোঃ নাঈম হোসেন,রুবিনা আক্তার,শামসুল হক,ছেলে,2026-02-01,পুলিশ,যত্নাধীন,2011-01-21,,,ইসলাম,বাংলাদেশী,ময়মনসিংহ,ত্রিশাল,ধনিখলা,ময়মনসিংহ,ত্রিশাল,কাকচর,মাদক,REF-77/26,2026-02-02,শারমিন সুলতানা,উচ্চ,সক্রিয়,মাদক সংস্পর্শের ঝুঁকি,কাউন্সেলিং শুরু,স্কিল ট্রেনিং রেফার,নারী ও শিশু আদালত,MYM-332/2026,ত্রিশাল,,নারী ও শিশু আইন,ngo_support,2026-02-12,2026-03-19,2026-04-21,এডভোকেট রুমি,মাদক,হ্যাঁ,Pending,,,"পর্যালোচনাধীন",প্রথম শুনানি সম্পন্ন,12/02/2026;19/03/2026,অভিভাবক উপস্থিত,কম্পিউটার কোর্স,স্বাস্থ্য সহায়তা,`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = isBn ? "শিশু_আমদানি_টেমপ্লেট.csv" : "children_import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function runImport() {
    if (!importFile) return;
    setImportResult(null);
    importMutation.mutate(importFile);
  }

  function openEdit(r: any) {
    setEditForm({
      fullName: r.fullName ?? "",
      gender: r.gender ?? "Boy",
      dateOfBirth: r.dateOfBirth ?? r.verifiedDob ?? "",
      religion: r.religion ?? "",
      currentStatus: r.currentStatus ?? "Admitted",
    });
    setEditing(r);
  }

  const STATUS_LABEL: Record<string, string> = isBn
    ? { Draft: "খসড়া", Admitted: "ভর্তি", "Under Care": "যত্নাধীন", Released: "মুক্তিপ্রাপ্ত", Transferred: "স্থানান্তরিত" }
    : { Draft: "Draft", Admitted: "Admitted", "Under Care": "Under Care", Released: "Released", Transferred: "Transferred" };

  const GENDER_LABEL: Record<string, string> = isBn
    ? { Boy: "ছেলে", Girl: "মেয়ে", Others: "অন্যান্য" }
    : { Boy: "Boy", Girl: "Girl", Others: "Others" };

  type Row = NonNullable<NonNullable<typeof data>["data"]>[number];

  const AGE_RANGE_OPTIONS = [
    { value: "0-5",   label: "0–5",   labelBn: "০–৫ বছর" },
    { value: "6-10",  label: "6–10",  labelBn: "৬–১০ বছর" },
    { value: "11-14", label: "11–14", labelBn: "১১–১৪ বছর" },
    { value: "15-17", label: "15–17", labelBn: "১৫–১৭ বছর" },
    { value: "18+",   label: "18+",   labelBn: "১৮+ বছর" },
  ];

  const columns: ColumnDef<Row>[] = [
    {
      key: "childId", label: "Child ID", labelBn: "শিশু আইডি",
      filterType: "text",
      exportValue: r => r.childId ?? "",
      render: r => <span className="font-medium text-primary">{r.childId}</span>,
    },
    {
      key: "fullName", label: "Full Name", labelBn: "পূর্ণ নাম",
      filterType: "text",
      exportValue: r => r.fullName ?? "",
      render: r => <span className="font-semibold">{r.fullName}</span>,
    },
    {
      key: "gender", label: "Gender", labelBn: "লিঙ্গ",
      filterType: "select",
      filterOptions: [
        { value: "Boy", label: "Boy", labelBn: "ছেলে" },
        { value: "Girl", label: "Girl", labelBn: "মেয়ে" },
        { value: "Others", label: "Others", labelBn: "অন্যান্য" },
      ],
      exportValue: r => r.gender ?? "",
      render: (r) => GENDER_LABEL[r.gender ?? ""] ?? r.gender ?? "—",
    },
    {
      key: "verifiedDob", label: "Verified DOB", labelBn: "যাচাইকৃত জন্ম তারিখ",
      filterType: "text",
      exportValue: r => (r as any).verifiedDob ?? (r as any).dateOfBirth ?? (r as any).tentativeDoB ?? "",
      render: r => {
        const dob = (r as any).verifiedDob ?? (r as any).dateOfBirth;
        const tentative = (r as any).tentativeDoB;
        if (dob) return <span className="font-mono text-xs">{format(new Date(dob), "dd/MM/yyyy")}</span>;
        if (tentative) return <span className="font-mono text-xs text-muted-foreground italic" title={isBn ? "আনুমানিক" : "Tentative"}>~{format(new Date(tentative), "dd/MM/yyyy")}</span>;
        return <span className="text-muted-foreground">—</span>;
      },
    },
    {
      key: "currentAge", label: "Current Age", labelBn: "বর্তমান বয়স",
      filterType: "select",
      filterOptions: AGE_RANGE_OPTIONS,
      exportValue: r => String((r as any).currentAge ?? ""),
      render: r => {
        const age = (r as any).currentAge;
        return age != null ? `${age} ${isBn ? "বছর" : "yrs"}` : <span className="text-muted-foreground">—</span>;
      },
      className: "text-right",
    },
    {
      key: "centerId", label: "Center", labelBn: "কেন্দ্র",
      filterType: "text",
      exportValue: r => getCenterLabel((r as any).centerName, isBn) || String((r as any).centerId ?? ""),
      render: r => getCenterLabel((r as any).centerName, isBn) || "—",
    },
    {
      key: "currentStatus", label: "Status", labelBn: "অবস্থা",
      filterType: "select",
      filterOptions: [
        { value: "all", label: "All Statuses", labelBn: "সকল অবস্থা" },
        { value: "Draft", label: "Draft", labelBn: "খসড়া" },
        { value: "Admitted", label: "Admitted", labelBn: "ভর্তি" },
        { value: "Under Care", label: "Under Care", labelBn: "যত্নাধীন" },
        { value: "Released", label: "Released", labelBn: "মুক্তিপ্রাপ্ত" },
        { value: "Transferred", label: "Transferred", labelBn: "স্থানান্তরিত" },
      ],
      exportValue: r => r.currentStatus ?? "",
      render: r => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[r.currentStatus] ?? "bg-gray-100 text-gray-800"}`}>
          {STATUS_LABEL[r.currentStatus] ?? r.currentStatus}
        </span>
      ),
    },
  ];

  const rows = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("children.title")}</h1>
          <p className="text-muted-foreground">
            {isBn ? "কেন্দ্রের সকল শিশুর তথ্য পরিচালনা করুন।" : "Manage and track all children in the center."}
          </p>
        </div>
        {canImport ? (
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={downloadTemplate}>
              <Download className="h-4 w-4" />
              {isBn ? "টেমপ্লেট ডাউনলোড" : "Download Template"}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" />
              {isBn ? "আমদানি" : "Import"}
            </Button>
          </div>
        ) : <div />}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        isBn={isBn}
        exportTitle="Children List"
        exportTitleBn="শিশুর তালিকা"
        searchValue={search}
        onSearchChange={v => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name, ID..."
        searchPlaceholderBn="নাম বা আইডি দিয়ে অনুসন্ধান..."
        emptyText="No children found."
        emptyTextBn="কোনো শিশু পাওয়া যায়নি।"
        onRowClick={r => navigate(`/children/${r.id}`)}
        actions={canManage ? r => (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(r)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleting(r)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : r => (
          <Link href={`/children/${r.id}`}>
            <Button variant="ghost" size="sm">{t("common.view")}</Button>
          </Link>
        )}
        page={page}
        total={data?.total}
        limit={limit}
        onPageChange={setPage}
      />

      <Dialog open={!!editing} onOpenChange={v => { if (!v) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isBn ? "শিশুর তথ্য সম্পাদনা" : "Edit Child Record"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              updateMutation.mutate({ id: editing.id, data: editForm });
            }}
            className="space-y-4"
          >
            <div>
              <Label>{isBn ? "পূর্ণ নাম *" : "Full Name *"}</Label>
              <Input value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isBn ? "লিঙ্গ" : "Gender"}</Label>
                <Select value={editForm.gender} onValueChange={v => setEditForm(f => ({ ...f, gender: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Boy">{isBn ? "ছেলে" : "Boy"}</SelectItem>
                    <SelectItem value="Girl">{isBn ? "মেয়ে" : "Girl"}</SelectItem>
                    <SelectItem value="Others">{isBn ? "অন্যান্য" : "Others"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isBn ? "জন্ম তারিখ" : "Date of Birth"}</Label>
                <Input type="date" value={editForm.dateOfBirth} onChange={e => setEditForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isBn ? "ধর্ম" : "Religion"}</Label>
                <Input value={editForm.religion} onChange={e => setEditForm(f => ({ ...f, religion: e.target.value }))} />
              </div>
              <div>
                <Label>{isBn ? "বর্তমান অবস্থা" : "Current Status"}</Label>
                <Select value={editForm.currentStatus} onValueChange={v => setEditForm(f => ({ ...f, currentStatus: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admitted">{isBn ? "ভর্তি" : "Admitted"}</SelectItem>
                    <SelectItem value="Under Care">{isBn ? "যত্নাধীন" : "Under Care"}</SelectItem>
                    <SelectItem value="Released">{isBn ? "মুক্তিপ্রাপ্ত" : "Released"}</SelectItem>
                    <SelectItem value="Transferred">{isBn ? "স্থানান্তরিত" : "Transferred"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                {isBn ? "আপডেট করুন" : "Update"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={v => { if (!v) setDeleting(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{isBn ? "শিশুর রেকর্ড মুছুন" : "Delete Child Record"}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            {isBn ? `"${(deleting as any)?.fullName}" এর সকল তথ্য স্থায়ীভাবে মুছে যাবে।` : `Permanently delete all records for "${(deleting as any)?.fullName}"?`}
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="destructive" onClick={() => deleteMutation.mutate((deleting as any).id)} disabled={deleteMutation.isPending}>{isBn ? "মুছুন" : "Delete"}</Button>
            <Button variant="outline" onClick={() => setDeleting(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isBn ? "শিশু ও কেস ফাইল আমদানি" : "Import Children and Case Files"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{isBn ? "CSV ফাইল নির্বাচন" : "Choose CSV file"}</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {isBn
                  ? "এই আমদানিতে শিশু তথ্যের সাথে কেস ফাইল (Case tab) এবং আদালতের মামলা (Court Cases) ডেটাও যুক্ত করা যাবে।"
                  : "This import can include child data, case file data, and court case data together."}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={runImport} disabled={!importFile || importMutation.isPending} className="flex-1">
                {importMutation.isPending ? (isBn ? "আমদানি হচ্ছে..." : "Importing...") : (isBn ? "আমদানি শুরু করুন" : "Start Import")}
              </Button>
              <Button variant="outline" onClick={() => setImportOpen(false)}>
                {isBn ? "বন্ধ করুন" : "Close"}
              </Button>
            </div>

            {importResult && (
              <div className="rounded-md border p-3 space-y-2">
                <div className="text-sm font-medium">
                  {isBn ? "আমদানির ফলাফল" : "Import Result"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isBn
                    ? `মোট ${importResult.total ?? 0} সারির মধ্যে সফল ${importResult.success ?? 0}, শিশু তৈরি ${importResult.childCreated ?? 0}, ভর্তি তৈরি ${importResult.admissionCreated ?? 0}, কেস ফাইল তৈরি ${importResult.caseCreated ?? 0}, আদালতের মামলা তৈরি ${importResult.courtCaseCreated ?? 0}, ত্রুটি ${(importResult.errors ?? []).length}.`
                    : `Out of ${importResult.total ?? 0} rows: success ${importResult.success ?? 0}, children created ${importResult.childCreated ?? 0}, admissions created ${importResult.admissionCreated ?? 0}, case files created ${importResult.caseCreated ?? 0}, court cases created ${importResult.courtCaseCreated ?? 0}, errors ${(importResult.errors ?? []).length}.`}
                </div>
                {(importResult.errors ?? []).length > 0 && (
                  <div className="max-h-56 overflow-auto rounded border bg-muted/20 p-2 text-xs space-y-1">
                    {(importResult.errors as Array<any>).map((err, idx) => (
                      <div key={`${idx}-${err.row}`} className="font-mono">
                        {isBn ? `সারি ${err.row}: ${err.field} - ${err.message}` : `Row ${err.row}: ${err.field} - ${err.message}`}
                        {err.value ? ` (${err.value})` : ""}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
