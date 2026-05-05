import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AddressProvider } from "@/contexts/AddressContext";
import { ShieldAlert } from "lucide-react";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import ChildrenList from "@/pages/children/index";
import ChildDetail from "@/pages/children/[id]";
import CasesList from "@/pages/cases/index";
import NewCase from "@/pages/cases/new";
import CaseDetail from "@/pages/cases/[id]";
import AdmissionsList from "@/pages/admissions/index";
import AdmissionDetail from "@/pages/admissions/[id]";
import NewAdmission from "@/pages/admissions/new";
import EditAdmission from "@/pages/admissions/edit";
import FamilySocioeconomicList from "@/pages/family-socioeconomic/index";
import FamilySocioeconomicDetail from "@/pages/family-socioeconomic/[id]";
import HealthList from "@/pages/health/index";
import HealthDetail from "@/pages/health/[id]";
import CounselingList from "@/pages/counseling/index";
import CounselingDetail from "@/pages/counseling/[id]";
import EducationSkillsPage from "@/pages/education-skills/index";
import EducationSkillsDetailPage from "@/pages/education-skills/[id]";
import GuardiansList from "@/pages/guardians/index";
import GuardianDetail from "@/pages/guardians/[id]";
import CourtCasesList from "@/pages/court-cases/index";
import CourtCaseDetail from "@/pages/court-cases/[id]";
import RiskAssessmentsList from "@/pages/risk-assessments/index";
import RiskAssessmentDetail from "@/pages/risk-assessments/[id]";
import ReleaseRecordsList from "@/pages/release-records/index";
import ReleaseRecordDetail from "@/pages/release-records/[id]";
import FollowUpsList from "@/pages/follow-ups/index";
import FollowUpDetail from "@/pages/follow-ups/[id]";
import PoliceRequisitionsList from "@/pages/police-requisitions/index";
import NewPoliceRequisition from "@/pages/police-requisitions/new";
import PoliceRequisitionDetail from "@/pages/police-requisitions/[id]";
import SurveysList from "@/pages/surveys/index";
import NewSurvey from "@/pages/surveys/new";
import SurveyDetail from "@/pages/surveys/[id]";
import ReportsPage from "@/pages/reports/index";
import UsersPage from "@/pages/admin/users";
import CentersPage from "@/pages/admin/centers";
import OrgStructurePage from "@/pages/admin/org-structure";
import AddressManagementPage from "@/pages/admin/address";
import CaseTypesPage from "@/pages/admin/case-types";
import FamilyTypesPage from "@/pages/admin/family-types";
import EducationConfigPage from "@/pages/admin/education";
import PermissionsPage from "@/pages/admin/permissions";

const queryClient = new QueryClient();

function ModuleRoute({ module, path, component: Component, ...rest }: any) {
  const { user, permissions } = useAuth();
  const canView = () => {
    if (!user) return false;
    if (user.roleName === "Super Admin" || user.roleName === "Head Office") return true;
    return permissions[module]?.canView ?? false;
  };

  return (
    <Route path={path} {...rest}>
      {(params) => canView() ? <Component params={params} /> : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
          <ShieldAlert className="h-16 w-16 opacity-30" />
          <p className="text-lg font-semibold">Access Denied to this Module</p>
        </div>
      )}
    </Route>
  );
}

function AdminRoute({ path, component: Component, ...rest }: any) {
  const { user } = useAuth();
  const canAdmin = user?.roleName === "Super Admin" || user?.roleName === "Center Admin" || user?.roleName === "Head Office";

  return (
    <Route path={path} {...rest}>
      {(params) => canAdmin ? <Component params={params} /> : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
          <ShieldAlert className="h-16 w-16 opacity-30" />
          <p className="text-lg font-semibold">Admin Access Required</p>
        </div>
      )}
    </Route>
  );
}

function ProtectedRoutes() {
  const { user, loading, permissions } = useAuth();
  const [location, navigate] = useLocation();

  const getDefaultRoute = () => {
    if (user?.roleName === "Super Admin" || user?.roleName === "Head Office") return "/";
    const p = permissions || {};
    if (p["dashboard"]?.canView) return "/";
    if (p["admissions"]?.canView) return "/admissions";
    if (p["children"]?.canView) return "/children";
    if (p["cases"]?.canView) return "/cases";
    if (p["family-socioeconomic"]?.canView) return "/family-socioeconomic";
    if (p["guardians"]?.canView) return "/guardians";
    if (p["health"]?.canView) return "/health";
    if (p["counseling"]?.canView) return "/counseling";
    if (p["education-skills"]?.canView) return "/education-skills";
    if (p["risk-assessments"]?.canView) return "/risk-assessments";
    if (p["court-cases"]?.canView) return "/court-cases";
    if (p["police-requisitions"]?.canView) return "/police-requisitions";
    if (p["follow-ups"]?.canView) return "/follow-ups";
    if (p["release-records"]?.canView) return "/release-records";
    if (p["measurement-surveys"]?.canView) return "/surveys";
    if (p["reports"]?.canView) return "/reports";
    return "/"; // fallback
  };

  useEffect(() => {
    if (!loading && user && location === "/login") {
      navigate(getDefaultRoute(), { replace: true } as any);
    }
  }, [loading, user, location, navigate, permissions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <ModuleRoute path="/" module="dashboard" component={Dashboard} />

        <ModuleRoute path="/children" module="children" component={ChildrenList} />
        <ModuleRoute path="/children/:id" module="children" component={ChildDetail} />

        <ModuleRoute path="/cases" module="cases" component={CasesList} />
        <ModuleRoute path="/cases/new" module="cases" component={NewCase} />
        <ModuleRoute path="/cases/:id" module="cases" component={CaseDetail} />

        <ModuleRoute path="/admissions" module="admissions" component={AdmissionsList} />
        <ModuleRoute path="/admissions/new" module="admissions" component={NewAdmission} />
        <ModuleRoute path="/admissions/:id/edit" module="admissions" component={EditAdmission} />
        <ModuleRoute path="/admissions/:id" module="admissions" component={AdmissionDetail} />
        <ModuleRoute path="/family-socioeconomic/:id" module="family-socioeconomic" component={FamilySocioeconomicDetail} />
        <ModuleRoute path="/family-socioeconomic" module="family-socioeconomic" component={FamilySocioeconomicList} />

        <ModuleRoute path="/health" module="health" component={HealthList} />
        <ModuleRoute path="/health/:id" module="health" component={HealthDetail} />

        <ModuleRoute path="/counseling" module="counseling" component={CounselingList} />
        <ModuleRoute path="/counseling/:id" module="counseling" component={CounselingDetail} />

        <ModuleRoute path="/education-skills" module="education-skills" component={EducationSkillsPage} />
        <ModuleRoute path="/education-skills/:id" module="education-skills" component={EducationSkillsDetailPage} />

        <ModuleRoute path="/guardians" module="guardians" component={GuardiansList} />
        <ModuleRoute path="/guardians/:id" module="guardians" component={GuardianDetail} />

        <ModuleRoute path="/court-cases" module="court-cases" component={CourtCasesList} />
        <ModuleRoute path="/court-cases/:id" module="court-cases" component={CourtCaseDetail} />

        <ModuleRoute path="/risk-assessments" module="risk-assessments" component={RiskAssessmentsList} />
        <ModuleRoute path="/risk-assessments/:id" module="risk-assessments" component={RiskAssessmentDetail} />

        <ModuleRoute path="/release-records" module="release-records" component={ReleaseRecordsList} />
        <ModuleRoute path="/release-records/:id" module="release-records" component={ReleaseRecordDetail} />

        <ModuleRoute path="/follow-ups" module="follow-ups" component={FollowUpsList} />
        <ModuleRoute path="/follow-ups/:id" module="follow-ups" component={FollowUpDetail} />

        <ModuleRoute path="/police-requisitions" module="police-requisitions" component={PoliceRequisitionsList} />
        <ModuleRoute path="/police-requisitions/new" module="police-requisitions" component={NewPoliceRequisition} />
        <ModuleRoute path="/police-requisitions/:id" module="police-requisitions" component={PoliceRequisitionDetail} />

        <ModuleRoute path="/surveys" module="measurement-surveys" component={SurveysList} />
        <ModuleRoute path="/surveys/new" module="measurement-surveys" component={NewSurvey} />
        <ModuleRoute path="/surveys/:id" module="measurement-surveys" component={SurveyDetail} />

        <ModuleRoute path="/reports" module="reports" component={ReportsPage} />

        <AdminRoute path="/admin/users" component={UsersPage} />
        <AdminRoute path="/admin/centers" component={CentersPage} />
        <AdminRoute path="/admin/org-structure" component={OrgStructurePage} />
        <AdminRoute path="/admin/address" component={AddressManagementPage} />
        <AdminRoute path="/admin/case-types" component={CaseTypesPage} />
        <AdminRoute path="/admin/family-types" component={FamilyTypesPage} />
        <AdminRoute path="/admin/education" component={EducationConfigPage} />
        <AdminRoute path="/admin/permissions" component={PermissionsPage} />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AddressProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <ProtectedRoutes />
            </WouterRouter>
          </AddressProvider>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
