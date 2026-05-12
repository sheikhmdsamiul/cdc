import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet, FileText, Printer, Filter, X, ChevronDown, ChevronUp,
  Loader2, Search,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────────────────────── */

export type FilterOption = { value: string; label: string; labelBn?: string };

export type ColumnDef<T> = {
  key: string;
  label: string;
  labelBn?: string;
  render?: (row: T, isBn: boolean) => React.ReactNode;
  exportValue?: (row: T) => string | number | null | undefined;
  /** Custom function returning the value used for filtering. Defaults to getCellText / raw field. */
  filterValue?: (row: T) => string;
  filterType?: "text" | "select" | "none";
  filterOptions?: FilterOption[];
  width?: string;
  className?: string;
};

export type DataTableProps<T extends { id: number | string }> = {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  isBn: boolean;
  onRowClick?: (row: T) => void;
  emptyText?: string;
  emptyTextBn?: string;
  exportTitle?: string;
  exportTitleBn?: string;
  /* pagination — pass these when API handles pagination */
  page?: number;
  total?: number;
  limit?: number;
  onPageChange?: (n: number) => void;
  /* external search — when parent handles search via API */
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  searchPlaceholderBn?: string;
  /* actions column rendered per row */
  actions?: (row: T) => React.ReactNode;
  /** number of columns already in the table for colSpan (auto-calculated if omitted) */
  colSpan?: number;
};

/* ─────────────────────────────────────────────────────────────────────────────
   Export helpers
──────────────────────────────────────────────────────────────────────────── */

function getCellText<T>(col: ColumnDef<T>, row: T): string {
  if (col.exportValue) {
    const v = col.exportValue(row);
    return v != null ? String(v) : "";
  }
  const v = (row as any)[col.key];
  return v != null ? String(v) : "";
}

function exportToExcel<T extends { id: number | string }>(
  rows: T[], columns: ColumnDef<T>[], title: string, isBn: boolean
) {
  const headers = columns.map(c => (isBn && c.labelBn ? c.labelBn : c.label));
  const body = rows.map(row => columns.map(col => getCellText(col, row)));
  const ws = XLSX.utils.aoa_to_sheet([headers, ...body]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${title}_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`);
}

function exportToPrint<T extends { id: number | string }>(
  rows: T[], columns: ColumnDef<T>[], title: string, isBn: boolean, asPdf = false
) {
  const headers = columns.map(c => (isBn && c.labelBn ? c.labelBn : c.label));
  const theadRow = headers.map(h => `<th>${h}</th>`).join("");
  const tbodyRows = rows.map(row =>
    `<tr>${columns.map(col => `<td>${getCellText(col, row)}</td>`).join("")}</tr>`
  ).join("\n");

  const w = window.open("", "_blank", "width=1100,height=750");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>${title}</title>
    <style>
      @page { margin: 15mm; }
      body { font-family: Arial, sans-serif; font-size: 11px; color: #111; }
      h2 { color: #1a5f5f; margin-bottom: 4px; }
      .meta { font-size: 10px; color: #6b7280; margin-bottom: 14px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #1a5f5f; color: #fff; padding: 6px 10px; text-align: left; font-size: 10px; }
      td { padding: 5px 10px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
      tr:nth-child(even) td { background: #f9fafb; }
    </style>
  </head><body>
    <h2>${title}</h2>
    <div class="meta">Generated: ${format(new Date(), "dd MMM yyyy, HH:mm")} — Department of Social Services, Bangladesh</div>
    <table>
      <thead><tr>${theadRow}</tr></thead>
      <tbody>${tbodyRows}</tbody>
    </table>
  </body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main component
──────────────────────────────────────────────────────────────────────────── */

export function DataTable<T extends { id: number | string }>({
  columns, data, isLoading, isBn, onRowClick,
  emptyText = "No records found.", emptyTextBn = "কোনো রেকর্ড পাওয়া যায়নি।",
  exportTitle = "Export", exportTitleBn,
  page, total, limit, onPageChange,
  searchValue, onSearchChange, searchPlaceholder, searchPlaceholderBn,
  actions,
}: DataTableProps<T>) {

  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const title = isBn && exportTitleBn ? exportTitleBn : exportTitle;
  const filterableColumns = columns.filter(c => c.filterType && c.filterType !== "none");
  const activeFilterCount = Object.values(columnFilters).filter(Boolean).length;

  /* client-side filter on current page data */
  const filteredData = useMemo(() => {
    if (!activeFilterCount) return data;
    return data.filter(row =>
      Object.entries(columnFilters).every(([key, val]) => {
        if (!val) return true;
        const col = columns.find(c => c.key === key);
        if (!col) return true;
        if (col.filterValue) {
          return col.filterValue(row) === val;
        }
        const cellText = getCellText(col, row).toLowerCase();
        if (col.filterType === "select") return cellText.includes(val.toLowerCase());
        return cellText.includes(val.toLowerCase());
      })
    );
  }, [data, columnFilters, activeFilterCount, columns]);

  const clearFilters = () => setColumnFilters({});

  const totalCols = columns.length + (actions ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* External search (if parent provides) */}
            {onSearchChange !== undefined && (
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-9 text-sm w-full"
                  placeholder={isBn ? (searchPlaceholderBn ?? "অনুসন্ধান...") : (searchPlaceholder ?? "Search...")}
                  value={searchValue ?? ""}
                  onChange={e => onSearchChange(e.target.value)}
                />
              </div>
            )}

            {/* Column filter toggle */}
            {filterableColumns.length > 0 && (
              <Button
                variant="outline" size="sm"
                className={`gap-1.5 h-9 ${showFilters ? "bg-teal-50 border-teal-300 text-teal-700" : ""}`}
                onClick={() => setShowFilters(v => !v)}
              >
                <Filter className="h-3.5 w-3.5" />
                {isBn ? "ফিল্টার" : "Filter"}
                {activeFilterCount > 0 && (
                  <Badge className="h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-teal-600 text-white rounded-full">
                    {activeFilterCount}
                  </Badge>
                )}
                {showFilters ? <ChevronUp className="h-3 w-3 ml-0.5" /> : <ChevronDown className="h-3 w-3 ml-0.5" />}
              </Button>
            )}

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" className="h-9 text-muted-foreground gap-1" onClick={clearFilters}>
                <X className="h-3.5 w-3.5" />
                {isBn ? "ফিল্টার মুছুন" : "Clear filters"}
              </Button>
            )}
          </div>

          {/* Export controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              variant="outline" size="sm" className="h-9 gap-1.5 border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => exportToExcel(filteredData, columns, title, isBn)}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Excel</span>
            </Button>
            <Button
              variant="outline" size="sm" className="h-9 gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => exportToPrint(filteredData, columns, title, isBn, true)}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">PDF</span>
            </Button>
            <Button
              variant="outline" size="sm" className="h-9 gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50"
              onClick={() => exportToPrint(filteredData, columns, title, isBn, false)}
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">{isBn ? "মুদ্রণ" : "Print"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Column filter panel ── */}
      {showFilters && filterableColumns.length > 0 && (
        <div className="bg-muted/30 border border-border/60 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filterableColumns.map(col => {
            const label = isBn && col.labelBn ? col.labelBn : col.label;
            const val = columnFilters[col.key] ?? "";
            return (
              <div key={col.key} className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</label>
                {col.filterType === "select" && col.filterOptions ? (
                  <Select value={val || "__all__"} onValueChange={v => setColumnFilters(f => ({ ...f, [col.key]: v === "__all__" ? "" : v }))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={isBn ? "সব" : "All"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">{isBn ? "সব" : "All"}</SelectItem>
                      {col.filterOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {isBn && opt.labelBn ? opt.labelBn : opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="relative">
                    <Input
                      className="h-8 text-xs pr-6"
                      placeholder={isBn ? "অনুসন্ধান..." : "Search..."}
                      value={val}
                      onChange={e => setColumnFilters(f => ({ ...f, [col.key]: e.target.value }))}
                    />
                    {val && (
                      <button className="absolute right-1.5 top-1.5 text-muted-foreground hover:text-foreground"
                        onClick={() => setColumnFilters(f => ({ ...f, [col.key]: "" }))}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Table ── */}
      <div className="border rounded-md bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              {columns.map(col => (
                <TableHead key={col.key} className={`text-xs font-bold uppercase tracking-wide ${col.className ?? ""}`} style={col.width ? { width: col.width } : undefined}>
                  {isBn && col.labelBn ? col.labelBn : col.label}
                </TableHead>
              ))}
              {actions && <TableHead className="text-right text-xs font-bold uppercase tracking-wide">{isBn ? "কার্যক্রম" : "Actions"}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={totalCols} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalCols} className="h-32 text-center text-muted-foreground text-sm">
                  {isBn ? emptyTextBn : emptyText}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map(row => (
                <TableRow
                  key={row.id}
                  className={`hover:bg-muted/40 ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map(col => (
                    <TableCell key={col.key} className={`text-sm ${col.className ?? ""}`}>
                      {col.render ? col.render(row, isBn) : String((row as any)[col.key] ?? "—")}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      {page !== undefined && total !== undefined && limit !== undefined && onPageChange && total > limit && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-muted-foreground">
            {isBn
              ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} দেখানো হচ্ছে, মোট ${total}`
              : `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
              {isBn ? "আগে" : "Previous"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page * limit >= total}>
              {isBn ? "পরে" : "Next"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}