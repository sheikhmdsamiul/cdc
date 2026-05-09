import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth, usePermission } from "@/contexts/AuthContext";
import { useDivisionData } from "@/hooks/use-division-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
// @ts-ignore
import { useCreateAdministrativeUnit, getGetAdministrativeTreeQueryKey, customFetch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

type Action = { type: "division" | "district" | "upazila"; parentId?: string | number };

export default function AddressManagementPage() {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const { toast } = useToast();
  const { user } = useAuth();

  const canView   = usePermission("address", "view");
  const canCreate = usePermission("address", "create");
  const canEdit   = usePermission("address", "edit");
  const canDelete = usePermission("address", "delete");

  const canManage = canCreate || canEdit || canDelete;
  
  const { divisionData: addressData, isLoading } = useDivisionData();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [action, setAction] = useState<Action | null>(null);
  
  const [bnName, setBnName] = useState("");
  const [enName, setEnName] = useState("");

  const { mutateAsync: createUnit, isPending } = useCreateAdministrativeUnit();
  const queryClient = useQueryClient();

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: number | string, name: string) => {
    const confirmed = window.confirm(
      isBn 
        ? `আপনি কি নিশ্চিত যে আপনি "${name}" মুছতে চান?` 
        : `Are you sure you want to delete "${name}"?`
    );
    
    if (!confirmed) return;

    try {
      await customFetch(`/api/admin-units/${id}`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: getGetAdministrativeTreeQueryKey() });
      toast({
        title: isBn ? "সফল" : "Success",
        description: isBn ? "ঠিকানাটি সফলভাবে মুছে ফেলা হয়েছে" : "Address deleted successfully",
      });
    } catch (e) {
      toast({
        title: isBn ? "ত্রুটি" : "Error",
        description: isBn ? "ঠিকানা মুছতে সমস্যা হয়েছে" : "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!bnName && !enName) {
      toast({
        title: isBn ? "ত্রুটি" : "Error",
        description: isBn ? "অনুগ্রহ করে নাম লিখুন" : "Please enter a name",
        variant: "destructive",
      });
      return;
    }

    try {
      await createUnit({
        data: {
          unitName: enName || bnName,
          unitNameBn: bnName,
          unitNameEn: enName,
          unitType: action?.type || "division",
          parentUnitId: action?.parentId ? Number(action.parentId) : undefined,
        }
      });

      if (action?.type === "district" && action.parentId) {
        setExpanded(prev => ({ ...prev, [`div-${action.parentId}`]: true }));
      } else if (action?.type === "upazila" && action.parentId) {
        setExpanded(prev => ({ ...prev, [`dist-${action.parentId}`]: true }));
      }

      await queryClient.invalidateQueries({ queryKey: getGetAdministrativeTreeQueryKey() });

      toast({
        title: isBn ? "সফল" : "Success",
        description: isBn ? "নতুন ঠিকানা সফলভাবে যোগ করা হয়েছে" : "New address added successfully",
      });

      setAction(null);
      setBnName("");
      setEnName("");
    } catch (e) {
      toast({
        title: isBn ? "ত্রুটি" : "Error",
        description: isBn ? "ঠিকানা যোগ করতে সমস্যা হয়েছে" : "Failed to add new address",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{isBn ? "ঠিকানা ব্যবস্থাপনা" : "Address Management"}</h1>
        {canCreate && (
          <Button onClick={() => { setAction({ type: "division" }); setBnName(""); setEnName(""); }}>
            <Plus className="h-4 w-4 mr-2" /> {isBn ? "নতুন বিভাগ" : "Add Division"}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {addressData.map((division) => (
          <Card key={division.id}>
            <CardHeader className="py-3 flex flex-row items-center justify-between cursor-pointer" onClick={() => toggleExpand(`div-${division.id}`)}>
              <CardTitle className="text-lg flex items-center">
                {expanded[`div-${division.id}`] ? <ChevronDown className="h-5 w-5 mr-2" /> : <ChevronRight className="h-5 w-5 mr-2" />}
                {isBn ? division.bn : division.en}
              </CardTitle>
              <div className="flex items-center gap-2">
                {canCreate && (
                  <Button variant="ghost" size="sm" onClick={(e) => { 
                    e.stopPropagation(); 
                    setAction({ type: "district", parentId: division.id }); 
                    setBnName(""); setEnName(""); 
                  }}>
                    <Plus className="h-4 w-4 mr-1" /> {isBn ? "জেলা" : "District"}
                  </Button>
                )}
                {canDelete && (
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(division.id, isBn ? division.bn : division.en);
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            {expanded[`div-${division.id}`] && (
              <CardContent className="pl-12 space-y-2 border-t pt-2">
                {division.districts.map((district) => (
                  <div key={district.id} className="border-l pl-4">
                    <div className="flex items-center justify-between py-1 cursor-pointer hover:bg-muted/50 rounded px-2" onClick={() => toggleExpand(`dist-${district.id}`)}>
                      <span className="font-medium flex items-center">
                        {expanded[`dist-${district.id}`] ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                        {isBn ? district.bn : district.en}
                      </span>
                      <div className="flex items-center gap-2">
                        {canCreate && (
                          <Button variant="ghost" size="sm" onClick={(e) => { 
                            e.stopPropagation(); 
                            setAction({ type: "upazila", parentId: district.id }); 
                            setBnName(""); setEnName(""); 
                          }}>
                            <Plus className="h-4 w-4 mr-1" /> {isBn ? "উপজেলা" : "Upazila"}
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(district.id, isBn ? district.bn : district.en);
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {expanded[`dist-${district.id}`] && (
                      <div className="pl-8 space-y-1 py-1">
                        {district.upazilas.map((upazila: any, index: number) => (
                          <div key={upazila.id || index} className="flex items-center justify-between group hover:bg-muted/50 rounded px-2 py-1">
                            <span className="text-sm text-muted-foreground">
                              {typeof upazila === 'string' ? upazila : (isBn ? upazila.bn : upazila.en)}
                            </span>
                            {canDelete && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10" 
                                onClick={() => handleDelete(upazila.id, isBn ? upazila.bn : upazila.en)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={!!action} onOpenChange={(open) => !open && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action?.type === "division" ? (isBn ? "নতুন বিভাগ যোগ করুন" : "Add New Division") :
               action?.type === "district" ? (isBn ? "নতুন জেলা যোগ করুন" : "Add New District") :
               (isBn ? "নতুন উপজেলা যোগ করুন" : "Add New Upazila")}
            </DialogTitle>
            <DialogDescription>
              {isBn ? "সিস্টেমে নতুন প্রশাসনিক এলাকা যুক্ত করুন।" : "Add a new administrative unit to the system."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{isBn ? "নাম (বাংলা)" : "Name (Bengali)"}</Label>
              <Input value={bnName} onChange={(e) => setBnName(e.target.value)} placeholder={isBn ? "বাংলা নাম লিখুন" : "Enter Bengali name"} />
            </div>
            <div className="space-y-2">
              <Label>{isBn ? "নাম (ইংরেজি)" : "Name (English)"}</Label>
              <Input value={enName} onChange={(e) => setEnName(e.target.value)} placeholder={isBn ? "ইংরেজি নাম লিখুন" : "Enter English name"} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>{isBn ? "বাতিল" : "Cancel"}</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? (isBn ? "সংরক্ষণ করা হচ্ছে..." : "Saving...") : (isBn ? "সংরক্ষণ করুন" : "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
