import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSpreadsheet } from "lucide-react";

const MONTH_NAMES_BN = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CENTER_NAME_MAP: Record<string, { bn: string; en: string; titleBn: string; titleEn: string }> = {
  "Child Development Center (Boys) Tongi": {
    bn: "শিশু উন্নয়ন কেন্দ্র (বালক), টঙ্গী",
    en: "Child Development Center (Boys), Tongi",
    titleBn: "শিশু উন্নয়ন কেন্দ্র (বালক), টঙ্গী, গাজীপুর",
    titleEn: "Child Development Center (Boys), Tongi, Gazipur",
  },
  "Child Development Center (Girls) Konabari": {
    bn: "শিশু উন্নয়ন কেন্দ্র (বালিকা), কোনাবাড়ী",
    en: "Child Development Center (Girls), Konabari",
    titleBn: "শিশু উন্নয়ন কেন্দ্র (বালিকা), কোনাবাড়ী, গাজীপুর",
    titleEn: "Child Development Center (Girls), Konabari, Gazipur",
  },
  "Child Development Center (Boys) Fulerhat": {
    bn: "শিশু উন্নয়ন কেন্দ্র (বালক), ফুলেরহাট",
    en: "Child Development Center (Boys), Fulerhat",
    titleBn: "শিশু উন্নয়ন কেন্দ্র (বালক), ফুলেরহাট, যশোর",
    titleEn: "Child Development Center (Boys), Fulerhat, Jashore",
  },
};

const AGE_GROUP_LABELS = [
  "৯ বছরের নিচে",
  "৯–১০ বছর",
  "১০–১২ বছর",
  "১২–১৬ বছর",
  "১৬–১৮ বছর",
  "১৮ বছরের ঊর্ধ্বে",
  "বয়স উল্লেখ নেই",
];

const CASE_TYPE_LABELS = [
  "হত্যা",
  "নারী ও শিশু নির্যাতন",
  "মাদক",
  "দ্রুত বিচার",
  "ছিনতাই",
  "চুরি মামলা",
  "অস্ত্র মামলা",
  "মারামারি",
  "সাধারন ডায়েরী",
  "ডাকাতী",
  "তথ্য ও প্রযুক্তি/পর্নোগ্রাফি",
  "বিস্ফোরক দ্রব্য বিশেষ ক্ষমতা আইন",
  "বিবিধ",
  "সন্ত্রাস বিরোধী আইন",
  "বৈদেশিক নাগরিক আইন",
];

const TRIAL_STATUS_LABELS = [
  "বিচারাধীন",
  "বিচারে দোষী সাব্যস্ত",
  "উল্লেখ নাই",
  "আটকাদেশ",
  "অভিভাবক মামলায় বিচারাধীন",
  "অভিভাবক মামলায় আটকাদেশ",
];

const STAY_DURATION_LABELS = ["<৬ মাস", "৬–১২ মাস", "১–২ বছর", "২+ বছর"];

const COURT_APPEARANCE_LABELS = [
  "০১ বারও কোর্টে যায়নি (চলতি মাস)",
  "০১ বার (চলতি মাস)",
  "০২ বার (চলতি মাস)",
  "তলবমতে",
];

type CenterOption = {
  id: number;
  name: string;
  centerType?: string | null;
  isHq?: string | null;
};

type Chok01ReportResponse = {
  month: number;
  year: number;
  centerId: number | null;
  centerName: string | null;
  reportDate: string;
  totalResidents: number;
  ageGroups: { label: string; count: number }[];
  caseTypes: { label: string; count: number }[];
  trialStatuses: { label: string; count: number }[];
  stayDurations: { label: string; count: number }[];
  courtAppearances: { label: string; count: number }[];
  courtNoShowReasons: { reason: string; count: number }[];
  noteSummary: {
    previousMonthEndResidents: number;
    arrivalsInMonth: number;
    releasesInMonth: number;
    monthEndResidents: number;
    attachedChildren: number;
  };
};

function getCenterLabels(name?: string | null) {
  const mapped = name ? CENTER_NAME_MAP[name] : null;
  return {
    bn: mapped?.bn ?? name ?? "শিশু উন্নয়ন কেন্দ্র",
    en: mapped?.en ?? name ?? "Child Development Center",
    titleBn: mapped?.titleBn ?? name ?? "শিশু উন্নয়ন কেন্দ্র",
    titleEn: mapped?.titleEn ?? name ?? "Child Development Center",
  };
}

function getDefaultCenterId(centers: CenterOption[], fallbackId: number | null) {
  if (fallbackId) return fallbackId;
  const jashoreCenter = centers.find((center) =>
    center.name.includes("Fulerhat") || center.name.includes("Jashore"),
  );
  return jashoreCenter?.id ?? centers[0]?.id ?? null;
}

function toBnDigits(value: string | number) {
  const digits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(value).replace(/\d/g, (digit) => digits[Number(digit)]);
}

function getCountByLabel(items: { label: string; count: number }[]) {
  return new Map(items.map((item) => [item.label.trim(), item.count]));
}

function getCount(map: Map<string, number>, label: string) {
  return map.get(label.trim()) ?? 0;
}

function sumCounts(map: Map<string, number>) {
  return Array.from(map.values()).reduce((acc, value) => acc + value, 0);
}

function getMonthlyNoteText(report: Chok01ReportResponse) {
  const prevMonthIndex = report.month === 1 ? 11 : report.month - 2;
  const prevMonthYear = report.month === 1 ? report.year - 1 : report.year;
  const currentMonthName = MONTH_NAMES_BN[report.month - 1];
  const previousMonthName = MONTH_NAMES_BN[prevMonthIndex];
  const previousYearShort = String(prevMonthYear).slice(-2);
  const summary = report.noteSummary;

  return `বি: দ্র: ${previousMonthName}/${toBnDigits(previousYearShort)} মাসের শেষ কার্যদিবসে উপস্থিত শিশুর সংখ্যা ছিল=${toBnDigits(summary.previousMonthEndResidents)} জন,   ${currentMonthName}/${toBnDigits(report.year)} মাসে আগত শিশুর সংখ্যা=${toBnDigits(summary.arrivalsInMonth)} এবং মুক্তির ( কারাগারে স্থানান্তর ও জামিনে মুক্তিসহ) সংখ্যা=${toBnDigits(summary.releasesInMonth)} জন,  ${currentMonthName} মাসের শেষে শিশুর সংখ্যা-${toBnDigits(summary.monthEndResidents)} জন\n\n(জামিনে মুক্তিপ্রাপ্ত ${toBnDigits(summary.releasesInMonth)} জন সহ ${toBnDigits(summary.attachedChildren)} জন শিশুর তথ্যাবলি সংযুক্ত করা হয়েছে)।`;
}

function cssColorToArgb(input: string): string | undefined {
  if (!input) return undefined;
  const color = input.trim();
  if (color === "transparent") return undefined;

  const hex = color.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (hex) {
    const raw = hex[1].toUpperCase();
    if (raw.length === 3) {
      const expanded = raw.split("").map((ch) => ch + ch).join("");
      return `FF${expanded}`;
    }
    return `FF${raw}`;
  }

  const rgb = color.match(/^rgba?\(([^)]+)\)$/i);
  if (!rgb) return undefined;
  const parts = rgb[1].split(",").map((part) => part.trim());
  if (parts.length < 3) return undefined;
  const [r, g, b, a] = parts;
  if (a != null && Number(a) === 0) return undefined;

  const toHex = (v: string) => {
    const n = Math.max(0, Math.min(255, Number.parseInt(v, 10) || 0));
    return n.toString(16).padStart(2, "0").toUpperCase();
  };
  return `FF${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function pxToExcelWidth(px: number): number {
  if (!Number.isFinite(px) || px <= 0) return 10;
  return Math.max(5, Math.round(((px - 5) / 7) * 100) / 100);
}

function pxToPoints(px: number): number {
  if (!Number.isFinite(px) || px <= 0) return 18;
  return Math.round((px * 72 / 96) * 10) / 10;
}

async function exportUiSheetAsExcel(sheetRoot: HTMLElement, fileName: string) {
  const table = sheetRoot.querySelector("table");
  if (!table) return;

  const exceljs = await import("exceljs");
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet("Chok-01 Top Sheet");
  worksheet.views = [{ showGridLines: true }];

  const occupied = new Map<number, Set<number>>();
  const colWidths: number[] = [];
  const rowHeights: number[] = [];

  const rows = Array.from(table.rows);
  rows.forEach((row, rowIdx) => {
    const excelRowNumber = rowIdx + 1;
    let colIdx = 1;
    const occupiedCols = occupied.get(excelRowNumber) ?? new Set<number>();
    occupied.set(excelRowNumber, occupiedCols);

    Array.from(row.cells).forEach((cell) => {
      while (occupiedCols.has(colIdx)) colIdx += 1;

      const colSpan = cell.colSpan || 1;
      const rowSpan = cell.rowSpan || 1;
      const text = cell.innerText?.replace(/\r/g, "").trim() || " ";
      const computed = window.getComputedStyle(cell);

      const targetCell = worksheet.getCell(excelRowNumber, colIdx);
      targetCell.value = text;

      const fontColor = cssColorToArgb(computed.color);
      const backgroundColor = cssColorToArgb(computed.backgroundColor);
      const borderColor = cssColorToArgb(computed.borderTopColor) ?? "FF94A3B8";
      const fontWeight = Number.parseInt(computed.fontWeight, 10);
      const fontSize = Number.parseFloat(computed.fontSize) || 11;

      targetCell.font = {
        name: "NikoshBAN",
        size: fontSize,
        bold: Number.isFinite(fontWeight) ? fontWeight >= 600 : computed.fontWeight === "bold",
        ...(fontColor ? { color: { argb: fontColor } } : {}),
      };

      if (backgroundColor) {
        targetCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: backgroundColor },
        };
      }

      const borderStyleFor = (cssStyle: string) =>
        cssStyle && cssStyle !== "none" && cssStyle !== "hidden" ? "thin" : undefined;
      const top = borderStyleFor(computed.borderTopStyle);
      const right = borderStyleFor(computed.borderRightStyle);
      const bottom = borderStyleFor(computed.borderBottomStyle);
      const left = borderStyleFor(computed.borderLeftStyle);
      if (top || right || bottom || left) {
        targetCell.border = {
          ...(top ? { top: { style: top, color: { argb: borderColor } } } : {}),
          ...(right ? { right: { style: right, color: { argb: borderColor } } } : {}),
          ...(bottom ? { bottom: { style: bottom, color: { argb: borderColor } } } : {}),
          ...(left ? { left: { style: left, color: { argb: borderColor } } } : {}),
        };
      }

      const alignMap: Record<string, "left" | "center" | "right" | "justify"> = {
        left: "left",
        center: "center",
        right: "right",
        justify: "justify",
      };
      const verticalMap: Record<string, "top" | "middle" | "bottom"> = {
        top: "top",
        middle: "middle",
        bottom: "bottom",
      };
      targetCell.alignment = {
        horizontal: alignMap[computed.textAlign] ?? "left",
        vertical: verticalMap[computed.verticalAlign] ?? "middle",
        wrapText: true,
      };

      const cellRect = cell.getBoundingClientRect();
      const perColWidth = pxToExcelWidth(cellRect.width / colSpan);
      for (let c = 0; c < colSpan; c += 1) {
        const i = colIdx + c - 1;
        colWidths[i] = Math.max(colWidths[i] ?? 0, perColWidth);
      }

      const rowHeight = pxToPoints(cellRect.height);
      for (let r = 0; r < rowSpan; r += 1) {
        const i = excelRowNumber + r - 1;
        rowHeights[i] = Math.max(rowHeights[i] ?? 0, rowHeight);
      }

      for (let r = 0; r < rowSpan; r += 1) {
        const rowNo = excelRowNumber + r;
        const set = occupied.get(rowNo) ?? new Set<number>();
        for (let c = 0; c < colSpan; c += 1) {
          set.add(colIdx + c);
        }
        occupied.set(rowNo, set);
      }

      if (rowSpan > 1 || colSpan > 1) {
        worksheet.mergeCells(
          excelRowNumber,
          colIdx,
          excelRowNumber + rowSpan - 1,
          colIdx + colSpan - 1,
        );
      }

      colIdx += colSpan;
    });
  });

  colWidths.forEach((w, idx) => {
    worksheet.getColumn(idx + 1).width = w;
  });
  rowHeights.forEach((h, idx) => {
    worksheet.getRow(idx + 1).height = h;
  });

  const data = await workbook.xlsx.writeBuffer();
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function Chok01ReportTable({
  report,
  isBn,
  sheetRef,
}: {
  report: Chok01ReportResponse;
  isBn: boolean;
  sheetRef: React.RefObject<HTMLDivElement | null>;
}) {
  const centerLabels = getCenterLabels(report.centerName);
  const centerTitle = isBn ? centerLabels.titleBn : centerLabels.titleEn;
  const monthName = isBn ? MONTH_NAMES_BN[report.month - 1] : MONTH_NAMES_EN[report.month - 1];
  const reportDateText = toBnDigits(format(new Date(report.reportDate), "dd/MM/yyyy"));
  const monthlyNote = getMonthlyNoteText(report);

  const ageMap = getCountByLabel(report.ageGroups);
  const caseMap = getCountByLabel(report.caseTypes);
  const trialMap = getCountByLabel(report.trialStatuses);
  const stayMap = getCountByLabel(report.stayDurations);
  const courtAppearanceMap = getCountByLabel(report.courtAppearances);
  const noShowReasons = report.courtNoShowReasons ?? [];
  const ageTotal = sumCounts(ageMap);
  const caseTotal = sumCounts(caseMap);
  const trialTotal = sumCounts(trialMap);
  const stayTotal = sumCounts(stayMap);
  const courtAppearanceTotal = sumCounts(courtAppearanceMap);

  const maxRows = Math.max(
    AGE_GROUP_LABELS.length,
    CASE_TYPE_LABELS.length,
    TRIAL_STATUS_LABELS.length,
    STAY_DURATION_LABELS.length,
    COURT_APPEARANCE_LABELS.length,
    noShowReasons.length,
  );

  return (
    <div className="rounded-2xl border border-teal-100 bg-white shadow-[0_18px_40px_-24px_rgba(15,118,110,0.35)] overflow-hidden">
      <div ref={sheetRef} className="max-h-[72vh] overflow-auto overscroll-contain bg-[linear-gradient(180deg,#fdfefe_0%,#f9fffd_100%)] p-4">
        <div className="text-center mb-4 text-sm leading-6 text-slate-900 whitespace-pre-line" style={{ fontFamily: "NikoshBAN, 'Noto Sans Bengali', sans-serif" }}>
          {`গণপ্রজাতন্ত্রী বাংলাদেশ সরকার\nসমাজসেবা অধিদপ্তর\n${centerTitle}\nবিষয়ঃ আইনের সংঘাতে জড়িত/ আইনের সংস্পর্শে আসা শিশুদের “ছক” মোতাবেক তথ্যাবলী প্রেরণ।\nছক-০১ | ${monthName} ${toBnDigits(report.year)} | তারিখ: ${reportDateText}`}
        </div>

        <table className="w-full text-xs border-collapse" style={{ fontFamily: "NikoshBAN, 'Noto Sans Bengali', sans-serif" }}>
          <thead>
            <tr className="bg-[#e8f4f4] text-[11px] font-bold text-teal-900">
              <th className="border border-slate-400 px-2 py-2">প্রতিষ্ঠানের নাম</th>
              <th className="border border-slate-400 px-2 py-2">বর্তমান নিবাসীসংখ্যা</th>
              <th colSpan={2} className="border border-slate-400 px-2 py-2">বয়স ভিত্তিক নিবাসী সংখ্যা</th>
              <th colSpan={2} className="border border-slate-400 px-2 py-2">মামলার ধরন অনুযায়ী নিবাসী সংখ্যা</th>
              <th colSpan={2} className="border border-slate-400 px-2 py-2">বিচারাধীন/ আটকাদেশ ভিত্তিক নিবাসী সংখ্যা</th>
              <th colSpan={2} className="border border-slate-400 px-2 py-2">অবস্থানের সময় অনুসারে নিবাসী সংখ্যা</th>
              <th colSpan={4} className="border border-slate-400 px-2 py-2">আদালতের হাজিরা ভিত্তিক নিবাসী সংখ্যা</th>
            </tr>
            <tr className="bg-[#f4faf9] text-[11px] font-semibold text-slate-800">
              <th className="border border-slate-400 px-2 py-2"></th>
              <th className="border border-slate-400 px-2 py-2"></th>
              <th className="border border-slate-400 px-2 py-2">বয়স (বছর)</th>
              <th className="border border-slate-400 px-2 py-2">সংখ্যা</th>
              <th className="border border-slate-400 px-2 py-2">মামলার ধরন</th>
              <th className="border border-slate-400 px-2 py-2">সংখ্যা</th>
              <th className="border border-slate-400 px-2 py-2">বিচারাধীন/ আটকাদেশ</th>
              <th className="border border-slate-400 px-2 py-2">সংখ্যা</th>
              <th className="border border-slate-400 px-2 py-2">অবস্থানের সময়</th>
              <th className="border border-slate-400 px-2 py-2">সংখ্যা</th>
              <th className="border border-slate-400 px-2 py-2">আদালতের হাজিরা</th>
              <th className="border border-slate-400 px-2 py-2">সংখ্যা</th>
              <th className="border border-slate-400 px-2 py-2">হাজিরা না করার কারণ</th>
              <th className="border border-slate-400 px-2 py-2">মন্তব্য</th>
            </tr>
            <tr className="bg-[#f8fcfb] text-[11px] font-semibold text-slate-600">
              {Array.from({ length: 14 }, (_, idx) => (
                <th key={idx} className="border border-slate-400 px-2 py-1 text-center">{toBnDigits(idx + 1)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }, (_, idx) => {
              const ageLabel = AGE_GROUP_LABELS[idx] ?? "";
              const caseLabel = CASE_TYPE_LABELS[idx] ?? "";
              const trialLabel = TRIAL_STATUS_LABELS[idx] ?? "";
              const stayLabel = STAY_DURATION_LABELS[idx] ?? "";
              const courtLabel = COURT_APPEARANCE_LABELS[idx] ?? "";
              const noShowReason = noShowReasons[idx];

              return (
                <tr key={idx}>
                  <td className="border border-slate-400 px-2 py-2 align-top">
                    {idx === 0 ? centerTitle : ""}
                  </td>
                  <td className="border border-slate-400 px-2 py-2 text-center align-top">
                    {idx === 0 ? toBnDigits(report.totalResidents) : ""}
                  </td>
                  <td className="border border-slate-400 px-2 py-2">{ageLabel}</td>
                  <td className="border border-slate-400 px-2 py-2 text-center">{ageLabel ? toBnDigits(getCount(ageMap, ageLabel)) : ""}</td>
                  <td className="border border-slate-400 px-2 py-2">{caseLabel}</td>
                  <td className="border border-slate-400 px-2 py-2 text-center">{caseLabel ? toBnDigits(getCount(caseMap, caseLabel)) : ""}</td>
                  <td className="border border-slate-400 px-2 py-2">{trialLabel}</td>
                  <td className="border border-slate-400 px-2 py-2 text-center">{trialLabel ? toBnDigits(getCount(trialMap, trialLabel)) : ""}</td>
                  <td className="border border-slate-400 px-2 py-2">{stayLabel}</td>
                  <td className="border border-slate-400 px-2 py-2 text-center">{stayLabel ? toBnDigits(getCount(stayMap, stayLabel)) : ""}</td>
                  <td className="border border-slate-400 px-2 py-2">{courtLabel}</td>
                  <td className="border border-slate-400 px-2 py-2 text-center">{courtLabel ? toBnDigits(getCount(courtAppearanceMap, courtLabel)) : ""}</td>
                  <td className="border border-slate-400 px-2 py-2">{noShowReason ? `${noShowReason.reason} (${toBnDigits(noShowReason.count)})` : ""}</td>
                  <td className="border border-slate-400 px-2 py-2"></td>
                </tr>
              );
            })}

            <tr className="bg-[#f7fbfb] font-semibold">
              <td className="border border-slate-400 px-2 py-2"></td>
              <td className="border border-slate-400 px-2 py-2 text-center">{toBnDigits(report.totalResidents)}</td>
              <td className="border border-slate-400 px-2 py-2"></td>
              <td className="border border-slate-400 px-2 py-2 text-center">{toBnDigits(ageTotal)}</td>
              <td className="border border-slate-400 px-2 py-2"></td>
              <td className="border border-slate-400 px-2 py-2 text-center">{toBnDigits(caseTotal)}</td>
              <td className="border border-slate-400 px-2 py-2"></td>
              <td className="border border-slate-400 px-2 py-2 text-center">{toBnDigits(trialTotal)}</td>
              <td className="border border-slate-400 px-2 py-2"></td>
              <td className="border border-slate-400 px-2 py-2 text-center">{toBnDigits(stayTotal)}</td>
              <td className="border border-slate-400 px-2 py-2"></td>
              <td className="border border-slate-400 px-2 py-2 text-center">{toBnDigits(courtAppearanceTotal)}</td>
              <td className="border border-slate-400 px-2 py-2"></td>
              <td className="border border-slate-400 px-2 py-2"></td>
            </tr>

            <tr>
              <td colSpan={14} className="border border-slate-400 px-2 py-3 whitespace-pre-line text-left">{monthlyNote}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Chok01Report({
  centers,
  defaultCenterId,
  isHQ,
  isBn,
}: {
  centers: CenterOption[];
  defaultCenterId: number | null;
  isHQ: boolean;
  isBn: boolean;
}) {
  const nonHqCenters = useMemo(
    () => centers.filter((center) => center.isHq !== "yes"),
    [centers],
  );
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const initialCenterId = useMemo(
    () => getDefaultCenterId(nonHqCenters, defaultCenterId),
    [defaultCenterId, nonHqCenters],
  );
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(initialCenterId);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCenterId == null && initialCenterId != null) {
      setSelectedCenterId(initialCenterId);
    }
  }, [initialCenterId, selectedCenterId]);

  useEffect(() => {
    if (selectedCenterId) return;
    if (initialCenterId) {
      setSelectedCenterId(initialCenterId);
      return;
    }
    if (nonHqCenters[0]) {
      setSelectedCenterId(nonHqCenters[0].id);
    }
  }, [initialCenterId, nonHqCenters, selectedCenterId]);

  const yearOptions = useMemo(
    () => Array.from({ length: 8 }, (_, index) => currentDate.getFullYear() - 4 + index),
    [currentDate],
  );

  const selectedCenter = nonHqCenters.find((center) => center.id === selectedCenterId) ?? null;
  const localizedCenter = getCenterLabels(selectedCenter?.name);

  const fallbackReport = useMemo<Chok01ReportResponse>(() => ({
    month: selectedMonth,
    year: selectedYear,
    centerId: selectedCenterId ?? null,
    centerName: isBn ? localizedCenter.bn : localizedCenter.en,
    reportDate: new Date().toISOString(),
    totalResidents: 0,
    ageGroups: [],
    caseTypes: [],
    trialStatuses: [],
    stayDurations: [],
    courtAppearances: [],
    courtNoShowReasons: [],
    noteSummary: {
      previousMonthEndResidents: 0,
      arrivalsInMonth: 0,
      releasesInMonth: 0,
      monthEndResidents: 0,
      attachedChildren: 0,
    },
  }), [isBn, localizedCenter.bn, localizedCenter.en, selectedCenterId, selectedMonth, selectedYear]);

  const { data, isLoading, isFetching, isError } = useQuery<Chok01ReportResponse>({
    queryKey: ["reports", "chok01", selectedCenterId ?? "none", selectedMonth, selectedYear],
    enabled: Boolean(selectedCenterId),
    queryFn: async () => {
      const query = new URLSearchParams({
        month: String(selectedMonth),
        year: String(selectedYear),
      });
      if (selectedCenterId) query.set("centerId", String(selectedCenterId));

      const response = await fetch(`/api/reports/chok01?${query.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    staleTime: 60_000,
  });

  const report = data ?? fallbackReport;

  async function handleExcelExport() {
    if (!sheetRef.current) return;
    await exportUiSheetAsExcel(
      sheetRef.current,
      `chok01_top_sheet_${report.centerName ?? "center"}_${report.year}_${String(report.month).padStart(2, "0")}.xlsx`,
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-teal-100 bg-[linear-gradient(135deg,#f5fffc_0%,#fff8f2_45%,#f8fbff_100%)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-teal-900">ছক-০১ টপ শীট</h2>
              <Badge variant="outline" className="border-teal-200 bg-white/80 text-teal-700">
                {isBn ? "Child Legal Status Summary" : "Child Legal Status Summary"}
              </Badge>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                {isBn ? `মোট ${toBnDigits(report.totalResidents)} জন` : `Total ${report.totalResidents}`}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="border-teal-200 bg-white/80 text-teal-700 hover:bg-teal-50"
              onClick={handleExcelExport}
              disabled={!selectedCenterId}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {isBn ? "এক্সেল ডাউনলোড" : "Download Excel"}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Card className="border-teal-100 bg-white/80 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{isBn ? "মাস" : "Month"}</div>
            <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
              <SelectTrigger className="border-teal-200 bg-white">
                <SelectValue placeholder={isBn ? "মাস নির্বাচন করুন" : "Select month"} />
              </SelectTrigger>
              <SelectContent>
                {(isBn ? MONTH_NAMES_BN : MONTH_NAMES_EN).map((month, index) => (
                  <SelectItem key={month} value={String(index + 1)}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="border-amber-100 bg-white/80 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">{isBn ? "বছর" : "Year"}</div>
            <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger className="border-amber-200 bg-white">
                <SelectValue placeholder={isBn ? "বছর নির্বাচন করুন" : "Select year"} />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {isBn ? toBnDigits(year) : year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="border-sky-100 bg-white/80 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{isBn ? "কেন্দ্র" : "Center"}</div>
            <Select
              value={selectedCenterId ? String(selectedCenterId) : ""}
              onValueChange={(value) => setSelectedCenterId(value ? Number(value) : null)}
              disabled={!isHQ && Boolean(defaultCenterId)}
            >
              <SelectTrigger className="border-sky-200 bg-white">
                <SelectValue placeholder={isBn ? "কেন্দ্র নির্বাচন করুন" : "Select center"} />
              </SelectTrigger>
              <SelectContent>
                {nonHqCenters.map((center) => (
                  <SelectItem key={center.id} value={String(center.id)}>
                    {isBn ? getCenterLabels(center.name).bn : getCenterLabels(center.name).en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </div>
      </div>

      {(isLoading || isFetching) && (
        <Card className="border-teal-100 bg-white/80 p-3 text-sm text-teal-700">
          {isBn ? "রিপোর্ট লোড হচ্ছে..." : "Loading report..."}
        </Card>
      )}
      {isError && (
        <Card className="border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {isBn ? "রিপোর্ট ডাটা এখন লোড হয়নি। দয়া করে API সার্ভার চালু আছে কি না দেখুন।" : "The report data could not be loaded. Please check that the API server is running."}
        </Card>
      )}

      <Chok01ReportTable report={report} isBn={isBn} sheetRef={sheetRef} />
    </div>
  );
}
