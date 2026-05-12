import { ReactNode, useState } from "react";
import { Sidebar, MobileNav } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { getRoleLabel } from "@/i18n/labels";

const ROLE_BADGE: Record<string, string> = {
  "Super Admin":       "bg-red-100 text-red-700 border border-red-200",
  "Head Office":       "bg-purple-100 text-purple-700 border border-purple-200",
  "Center Admin":      "bg-blue-100 text-blue-700 border border-blue-200",
  "Superintendent":    "bg-teal-100 text-teal-700 border border-teal-200",
  "Probation Officer": "bg-amber-100 text-amber-700 border border-amber-200",
  "Case Worker":       "bg-green-100 text-green-700 border border-green-200",
  "Data Entry Operator": "bg-cyan-100 text-cyan-700 border border-cyan-200",
  "House Parent":      "bg-orange-100 text-orange-700 border border-orange-200",
  "Worker":            "bg-gray-100 text-gray-700 border border-gray-200",
  "DD Division":       "bg-indigo-100 text-indigo-700 border border-indigo-200",
  "DD District":       "bg-cyan-100 text-cyan-700 border border-cyan-200",
};

export function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isBn = i18n.language === "bn";
  const today = format(new Date(), "dd MMM yyyy");
  const roleLabel = getRoleLabel(user?.roleName, isBn);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex w-full overflow-x-hidden">
      <Sidebar
        className={`hidden md:block fixed inset-y-0 left-0 z-30 overflow-hidden transition-[width] duration-200 ${sidebarCollapsed ? "w-16" : "w-64"}`}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
      />
      <div className={`flex flex-col min-h-screen flex-1 min-w-0 transition-[margin] duration-200 ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}`}>
        {/* Top header */}
        <header className="h-14 border-b bg-card/80 backdrop-blur-sm flex items-center justify-between px-3 sm:px-4 lg:px-6 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <MobileNav />
            <span className="text-base font-bold text-primary md:hidden truncate max-w-[140px]">{isBn ? "সিডিসি ইআরপি" : "CDC ERP"}</span>
            {user?.roleName && (
              <span className={`hidden md:inline-flex items-center text-[11px] px-2 py-0.5 rounded-full font-semibold ${ROLE_BADGE[user.roleName] ?? "bg-gray-100 text-gray-700 border border-gray-200"}`}>
                {roleLabel}
              </span>
            )}
            {user?.centerName && (
              <span className="hidden lg:block text-xs text-muted-foreground border-l border-border pl-3 truncate max-w-[180px]">
                {user.centerName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="hidden sm:block text-xs text-muted-foreground/70 tabular-nums">{today}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground relative">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 w-full min-w-0 overflow-x-hidden">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-card/50 px-3 sm:px-4 lg:px-6 py-2 text-center">
          <p className="text-[10px] text-muted-foreground/60">
            {isBn ? "সমাজসেবা অধিদফতর, বাংলাদেশ" : "Department of Social Services, Bangladesh"}
          </p>
        </footer>
      </div>
    </div>
  );
}