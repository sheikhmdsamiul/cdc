import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AddressProvider } from "@/contexts/AddressContext";
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

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!loading && user && location === "/login") {
      navigate("/", { replace: true } as any);
    }
  }, [loading, user, location]);

  useEffect(() => {
    if (loading || !user) return;
    if (user.roleName !== "Data Entry Operator") return;

    const isAllowedPath =
      location.startsWith("/admissions") ||
      location.startsWith("/children");
    if (!isAllowedPath) {
      navigate("/admissions", { replace: true } as any);
    }
  }, [loading, user, location, navigate]);

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
        <Route path="/" component={Dashboard} />

        <Route path="/children" component={ChildrenList} />
        <Route path="/children/:id" component={ChildDetail} />

        <Route path="/cases" component={CasesList} />
        <Route path="/cases/new" component={NewCase} />
        <Route path="/cases/:id" component={CaseDetail} />

        <Route path="/admissions" component={AdmissionsList} />
        <Route path="/admissions/new" component={NewAdmission} />
        <Route path="/admissions/:id/edit" component={EditAdmission} />
        <Route path="/admissions/:id" component={AdmissionDetail} />
        <Route path="/family-socioeconomic/:id" component={FamilySocioeconomicDetail} />
        <Route path="/family-socioeconomic" component={FamilySocioeconomicList} />

        <Route path="/health" component={HealthList} />
        <Route path="/health/:id" component={HealthDetail} />

        <Route path="/counseling" component={CounselingList} />
        <Route path="/counseling/:id" component={CounselingDetail} />

        <Route path="/education-skills" component={EducationSkillsPage} />
        <Route path="/education-skills/:id" component={EducationSkillsDetailPage} />

        <Route path="/guardians" component={GuardiansList} />
        <Route path="/guardians/:id" component={GuardianDetail} />

        <Route path="/court-cases" component={CourtCasesList} />
        <Route path="/court-cases/:id" component={CourtCaseDetail} />

        <Route path="/risk-assessments" component={RiskAssessmentsList} />
        <Route path="/risk-assessments/:id" component={RiskAssessmentDetail} />

        <Route path="/release-records" component={ReleaseRecordsList} />
        <Route path="/release-records/:id" component={ReleaseRecordDetail} />

        <Route path="/follow-ups" component={FollowUpsList} />
        <Route path="/follow-ups/:id" component={FollowUpDetail} />

        <Route path="/police-requisitions" component={PoliceRequisitionsList} />
        <Route path="/police-requisitions/new" component={NewPoliceRequisition} />
        <Route path="/police-requisitions/:id" component={PoliceRequisitionDetail} />

        <Route path="/surveys" component={SurveysList} />
        <Route path="/surveys/new" component={NewSurvey} />
        <Route path="/surveys/:id" component={SurveyDetail} />

        <Route path="/reports" component={ReportsPage} />

        <Route path="/admin/users" component={UsersPage} />
        <Route path="/admin/centers" component={CentersPage} />
        <Route path="/admin/org-structure" component={OrgStructurePage} />
        <Route path="/admin/address" component={AddressManagementPage} />
        <Route path="/admin/case-types" component={CaseTypesPage} />

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
