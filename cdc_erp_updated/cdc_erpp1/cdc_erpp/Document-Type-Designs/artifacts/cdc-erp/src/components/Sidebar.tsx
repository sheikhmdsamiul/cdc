import { Link, useLocation } from "wouter";
import { 
  Users, FileText, Activity, ShieldAlert, Heart, 
  Scale, ClipboardList, BookOpen, Clock, UsersRound, GraduationCap,
  LayoutDashboard, LogOut, Menu, Building2, Network,
  BarChart3, ChevronRight, FileBarChart2, Home, PanelLeftClose, PanelLeftOpen, Tags
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth, hasRole } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getRoleLabel } from "@/i18n/labels";

const ROLE_BADGE_COLOR: Record<string, string> = {
  "Super Admin":       "bg-red-500/20 text-red-300",
  "Head Office":       "bg-purple-500/20 text-purple-300",
  "Center Admin":      "bg-blue-500/20 text-blue-300",
  "Superintendent":    "bg-teal-500/20 text-teal-300",
  "Probation Officer": "bg-amber-500/20 text-amber-300",
  "Case Worker":       "bg-green-500/20 text-green-300",
  "Data Entry Operator": "bg-cyan-500/20 text-cyan-300",
  "House Parent":      "bg-orange-500/20 text-orange-300",
  "Worker":            "bg-gray-500/20 text-gray-300",
  "DD Division":       "bg-indigo-500/20 text-indigo-300",
  "DD District":       "bg-cyan-500/20 text-cyan-300",
};

function NavItem({
  href, label, icon: Icon, collapsed = false,
}: {
  href: string; label: string; icon: React.ElementType; collapsed?: boolean;
}) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/" && location.startsWith(href));
  return (
    <Link href={href}>
      <span
        title={collapsed ? label : undefined}
        className={`group flex items-center ${collapsed ? "justify-center px-2.5" : "gap-2.5 px-3"} py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
        ${isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground/75 hover:bg-white/10 hover:text-sidebar-foreground"
        }`}>
        <Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"}`} />
        {!collapsed && <span className="flex-1 truncate">{label}</span>}
        {!collapsed && isActive && <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-60" />}
      </span>
    </Link>
  );
}

function NavSection({ label }: { label: string }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/35 select-none">
      {label}
    </p>
  );
}

function SidebarContent({
  collapsed = false,
  onToggleCollapse,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const canAdmin = hasRole(user, "Super Admin", "Center Admin", "Head Office");
  const isDeo = hasRole(user, "Data Entry Operator");
  const roleLabel = getRoleLabel(user?.roleName, isBn);
  const initials = user?.fullName
    ?.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase() ?? "?";

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-sidebar-border/60">
        <div className="flex items-start justify-between gap-2">
          <div className={`flex items-center ${collapsed ? "justify-center w-full" : "gap-3"} min-w-0`}>
          <div className="h-12 w-12 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0 shadow overflow-hidden">
            <img src="/logo.webp" alt="DSS Logo" className="h-10 w-10 object-cover rounded-full" />
          </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-extrabold text-sidebar-foreground tracking-tight leading-none">
                  {isBn ? "শিশু উন্নয়ন কেন্দ্র" : "Child Development Center"}
                </h1>
                <p className="text-[10px] text-sidebar-foreground/50 mt-0.5 leading-none">
                  {t("auth.systemSubtitle")}
                </p>
              </div>
            )}
          </div>
          {onToggleCollapse && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className={`hidden md:inline-flex h-8 w-8 flex-shrink-0 text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground ${collapsed ? "self-center" : ""}`}
              title={collapsed ? (isBn ? "সাইডবার খুলুন" : "Expand sidebar") : (isBn ? "সাইডবার ছোট করুন" : "Collapse sidebar")}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          )}
        </div>
        {!collapsed && user?.centerName && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-sidebar-foreground/60 bg-white/5 rounded-lg px-2.5 py-1.5">
            <Building2 className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{user.centerName}</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-2 sidebar-scroll">
        <nav className="px-2 space-y-0.5">
          {isDeo ? (
            <>
              <NavItem href="/admissions" label={t("nav.admissions")} icon={ClipboardList} collapsed={collapsed} />
              <NavItem href="/children" label={t("nav.children")} icon={Users} collapsed={collapsed} />
            </>
          ) : (
            <>
          <NavItem href="/" label={t("nav.dashboard")} icon={LayoutDashboard} collapsed={collapsed} />

          {!collapsed && <NavSection label={t("nav.caseManagement")} />}
          <NavItem href="/admissions" label={t("nav.admissions")} icon={ClipboardList} collapsed={collapsed} />
          <NavItem href="/children" label={t("nav.children")} icon={Users} collapsed={collapsed} />
          <NavItem href="/cases" label={t("nav.caseFiles")} icon={FileText} collapsed={collapsed} />
          <NavItem href="/family-socioeconomic" label={t("nav.familySocioeconomic")} icon={Home} collapsed={collapsed} />
          <NavItem href="/guardians" label={t("nav.guardians")} icon={UsersRound} collapsed={collapsed} />
          <NavItem href="/health" label={t("nav.healthRecords")} icon={Heart} collapsed={collapsed} />
          <NavItem href="/counseling" label={t("nav.counseling")} icon={Activity} collapsed={collapsed} />
          <NavItem href="/education-skills" label={t("nav.educationSkills")} icon={GraduationCap} collapsed={collapsed} />
          <NavItem href="/risk-assessments" label={t("nav.riskAssessments")} icon={ShieldAlert} collapsed={collapsed} />

          {!collapsed && <NavSection label={t("nav.legalProcedures")} />}
          <NavItem href="/court-cases" label={t("nav.courtCases")} icon={Scale} collapsed={collapsed} />
          <NavItem href="/police-requisitions" label={t("nav.policeRequisitions")} icon={ShieldAlert} collapsed={collapsed} />

          {!collapsed && <NavSection label={t("nav.followUp")} />}
          <NavItem href="/follow-ups" label={t("nav.followUps")} icon={Clock} collapsed={collapsed} />
          <NavItem href="/release-records" label={t("nav.releaseRecords")} icon={BookOpen} collapsed={collapsed} />
          <NavItem href="/surveys" label={t("nav.surveys")} icon={BarChart3} collapsed={collapsed} />

          {!collapsed && <NavSection label={t("nav.analytics")} />}
          <NavItem href="/reports" label={t("nav.reportsAnalytics")} icon={FileBarChart2} collapsed={collapsed} />

          {canAdmin && (
            <>
              {!collapsed && <NavSection label={t("nav.administration")} />}
              <NavItem href="/admin/users" label={t("nav.userManagement")} icon={Users} collapsed={collapsed} />
              <NavItem href="/admin/centers" label={t("nav.centers")} icon={Building2} collapsed={collapsed} />
              <NavItem href="/admin/org-structure" label={t("nav.orgStructure")} icon={Network} collapsed={collapsed} />
              <NavItem href="/admin/address" label={isBn ? "ঠিকানা ব্যবস্থাপনা" : "Address Management"} icon={Home} collapsed={collapsed} />
              <NavItem href="/admin/case-types" label={isBn ? "মামলার ধরন" : "Case Types"} icon={Tags} collapsed={collapsed} />
              </>
              )}
              </>
              )}
              </nav>
              </div>


      {/* User footer */}
      <div className="border-t border-sidebar-border/60 p-3">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
          <div className="h-8 w-8 rounded-full bg-sidebar-primary/40 flex items-center justify-center text-sidebar-primary-foreground font-bold text-xs flex-shrink-0 ring-2 ring-sidebar-primary/20">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate leading-tight">{user?.fullName ?? "Guest"}</p>
              {user?.roleName && (
                <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium mt-0.5 ${ROLE_BADGE_COLOR[user.roleName] ?? "bg-gray-500/20 text-gray-300"}`}>
                  {roleLabel}
                </span>
              )}
            </div>
          )}
          <div className={`flex items-center gap-1 flex-shrink-0 ${collapsed ? "mt-3 flex-col" : ""}`}>
            <LanguageSwitcher compact />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/10"
              onClick={logout}
              title={t("auth.signOut")}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({
  className = "",
  collapsed = false,
  onToggleCollapse,
}: {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className={className}>
      <SidebarContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
    </div>
  );
}

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 bg-sidebar border-r-0">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}
