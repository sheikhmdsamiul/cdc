import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
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
  "জানুয়ারি",
  "ফেব্রুয়ারি",
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
    bn: "শিশু উন্নয়ন কেন্দ্র (বালক), টঙ্গী",
    en: "Child Development Center (Boys), Tongi",
    titleBn: "শিশু উন্নয়ন কেন্দ্র (বালক), টঙ্গী, গাজীপুর",
    titleEn: "Child Development Center (Boys), Tongi, Gazipur",
  },
  "Child Development Center (Girls) Konabari": {
    bn: "শিশু উন্নয়ন কেন্দ্র (বালিকা), কোনাবাড়ী",
    en: "Child Development Center (Girls), Konabari",
    titleBn: "শিশু উন্নয়ন কেন্দ্র (বালিকা), কোনাবাড়ী, গাজীপুর",
    titleEn: "Child Development Center (Girls), Konabari, Gazipur",
  },
  "Child Development Center (Boys) Fulerhat": {
    bn: "শিশু উন্নয়ন কেন্দ্র (বালক), ফুলেরহাট",
    en: "Child Development Center (Boys), Fulerhat",
    titleBn: "শিশু উন্নয়ন কেন্দ্র (বালক), ফুলেরহাট, যশোর",
    titleEn: "Child Development Center (Boys), Fulerhat, Jashore",
  },
};

const MONTHLY_HEADER_NUMBERS = Array.from({ length: 68 }, (_, index) => String(index + 1));

type CenterOption = {
  id: number;
  name: string;
  centerType?: string | null;
  isHq?: string | null;
};

type MonthlyReportResponse = {
  month: number;
  year: number;
  centerId: number | null;
  centerName: string | null;
  centerTitle: string;
  total: number;
  rows: string[][];
};

function getCenterLabels(name?: string | null) {
  const mapped = name ? CENTER_NAME_MAP[name] : null;
  return {
    bn: mapped?.bn ?? name ?? "শিশু উন্নয়ন কেন্দ্র",
    en: mapped?.en ?? name ?? "Child Development Center",
    titleBn: mapped?.titleBn ?? name ?? "শিশু উন্নয়ন কেন্দ্র",
    titleEn: mapped?.titleEn ?? name ?? "Child Development Center",
  };
}

function getDefaultMonthlyCenterId(centers: CenterOption[], fallbackId: number | null) {
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

function getColumnLetter(index: number) {
  let value = index + 1;
  let output = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    output = String.fromCharCode(65 + remainder) + output;
    value = Math.floor((value - 1) / 26);
  }
  return output;
}

function buildTemplateTitle(centerTitle: string, month: number, year: number, isBn: boolean) {
  if (isBn) {
    return `${centerTitle}ে অবস্থানরত নিবাসীদের তথ্যঃ\nমাসের নামঃ ${MONTH_NAMES_BN[month - 1]} ${toBnDigits(year)}                                                          তারিখঃ ${toBnDigits(format(new Date(), "dd/MM/yyyy"))}`;
  }
  return `Residents Information of ${centerTitle}\nMonth: ${MONTH_NAMES_EN[month - 1]} ${year}                                                          Date: ${format(new Date(), "dd/MM/yyyy")}`;
}

function cloneTemplateCellStyle(sheet: XLSX.WorkSheet, rowIndex: number, columnIndex: number) {
  const templateAddress = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
  return (sheet[templateAddress] as XLSX.CellObject | undefined)?.s;
}

function cssColorToArgb(input: string): string | undefined {
  if (!input) return undefined;
  const normalized = input.trim().toLowerCase();
  if (normalized === "transparent" || normalized === "rgba(0, 0, 0, 0)") return undefined;

  const hexMatch = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const raw = hexMatch[1];
    const full = raw.length === 3
      ? raw.split("").map((ch) => ch + ch).join("")
      : raw;
    return `FF${full.toUpperCase()}`;
  }

  const rgbMatch = normalized.match(/^rgba?\(([^)]+)\)$/);
  if (!rgbMatch) return undefined;
  const parts = rgbMatch[1].split(",").map((p) => p.trim());
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
  const Workbook = exceljs.Workbook;
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Monthly Report");
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
      const fontFamily = (computed.fontFamily || "Arial")
        .split(",")[0]
        .replace(/["']/g, "")
        .trim() || "Arial";
      const fontSize = Number.parseFloat(computed.fontSize) || 12;
      const fontWeight = Number.parseInt(computed.fontWeight, 10);

      targetCell.font = {
        name: fontFamily,
        size: fontSize,
        bold: Number.isFinite(fontWeight) ? fontWeight >= 600 : computed.fontWeight === "bold",
        italic: computed.fontStyle === "italic",
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
        worksheet.mergeCells(excelRowNumber, colIdx, excelRowNumber + rowSpan - 1, colIdx + colSpan - 1);
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

function buildFallbackWorkbook(report: MonthlyReportResponse, isBn: boolean) {
  const workbook = XLSX.utils.book_new();
  const rows = [
    [buildTemplateTitle(report.centerTitle, report.month, report.year, isBn)],
    [],
    MONTHLY_HEADER_NUMBERS,
    ...report.rows,
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, isBn ? "মাসিক রিপোর্ট" : "Monthly Report");
  return workbook;
}

function writeMonthlyWorkbook(templateBuffer: ArrayBuffer | null, report: MonthlyReportResponse, isBn: boolean) {
  const workbook = templateBuffer
    ? XLSX.read(templateBuffer, { type: "array", cellStyles: true })
    : buildFallbackWorkbook(report, isBn);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!templateBuffer) {
    XLSX.writeFile(
      workbook,
      `monthly_report_${report.centerName ?? "center"}_${report.year}_${String(report.month).padStart(2, "0")}.xlsx`,
    );
    return;
  }
  const titleCell = XLSX.utils.encode_cell({ r: 0, c: 3 });
  const titleStyle = (sheet[titleCell] as XLSX.CellObject | undefined)?.s;

  sheet[titleCell] = {
    t: "s",
    v: buildTemplateTitle(report.centerTitle, report.month, report.year, isBn),
    s: titleStyle,
  };

  const rowsToWrite = Math.max(report.rows.length, 3);
  for (let rowOffset = 0; rowOffset < rowsToWrite; rowOffset += 1) {
    const rowValues = report.rows[rowOffset] ?? Array.from({ length: 68 }, () => "");
    const excelRow = 5 + rowOffset;

    for (let columnIndex = 0; columnIndex < 68; columnIndex += 1) {
      const address = XLSX.utils.encode_cell({ r: excelRow, c: columnIndex });
      const value = rowValues[columnIndex] ?? "";
      sheet[address] = {
        t: "s",
        v: value,
        s: cloneTemplateCellStyle(sheet, 5 + (rowOffset % 3), columnIndex),
      };
    }
  }

  const endRow = 5 + rowsToWrite;
  sheet["!ref"] = `A1:BP${endRow}`;
  XLSX.writeFile(
    workbook,
    `monthly_report_${report.centerName ?? "center"}_${report.year}_${String(report.month).padStart(2, "0")}.xlsx`,
  );
}

function MonthlyReportTable({
  report,
  sheetRef,
  isBn,
}: {
  report: MonthlyReportResponse;
  sheetRef: React.RefObject<HTMLDivElement | null>;
  isBn: boolean;
}) {
  return (
    <div
      ref={sheetRef}
      className="rounded-2xl border border-teal-100 bg-white shadow-[0_18px_40px_-24px_rgba(15,118,110,0.35)] overflow-hidden"
    >
      <div className="max-h-[72vh] overflow-auto overscroll-contain bg-[linear-gradient(180deg,#fdfefe_0%,#f9fffd_100%)]">
        <table className="min-w-[3400px] border-collapse text-[14px] leading-relaxed text-slate-700">
          <thead>
            <tr className="bg-[#f5faf9] text-[14px] font-semibold text-slate-700">
              <th colSpan={3} className="border border-slate-300 px-2 py-2 text-center">{isBn ? "পাতা-১" : "Page-1"}</th>
              <th colSpan={14} className="border border-slate-300 px-5 py-3 text-center whitespace-pre-line text-[16px] font-bold text-teal-900">
                {buildTemplateTitle(report.centerTitle, report.month, report.year, isBn)}
              </th>
              <th colSpan={3} className="border border-slate-300 px-2 py-2 text-center">{isBn ? "পাতা-২" : "Page-2"}</th>
              <th colSpan={14} className="border border-slate-300 px-2 py-2" />
              <th colSpan={2} className="border border-slate-300 px-2 py-2 text-center">{isBn ? "পাতা-৩" : "Page-3"}</th>
              <th colSpan={19} className="border border-slate-300 px-2 py-2" />
              <th colSpan={2} className="border border-slate-300 px-2 py-2 text-center">{isBn ? "পাতা-৪" : "Page-4"}</th>
              <th colSpan={11} className="border border-slate-300 px-2 py-2" />
            </tr>

            <tr className="text-center text-[14px] font-bold text-slate-800">
              <th colSpan={17} className="border border-slate-300 bg-[#E6B9B8] px-2.5 py-2.5">মৌলিক তথ্যাদি</th>
              <th colSpan={7} className="border border-slate-300 bg-[#4F81BD] px-2.5 py-2.5 text-white">মামলা সংক্রান্ত তথ্যাদি</th>
              <th colSpan={10} className="border border-slate-300 bg-[#F2DCDB] px-2.5 py-2.5">স্বাস্থ্য সংক্রান্ত তথ্যাদি</th>
              <th colSpan={21} className="border border-slate-300 bg-[#FAC090] px-2.5 py-2.5">শিশুর পারিবারিক ও আর্থ-সামাজিক অবস্থা সংক্রান্ত তথ্যাদি</th>
              <th colSpan={13} className="border border-slate-300 bg-[#EEECE1] px-2.5 py-2.5">পূনর্বাসন সংক্রান্ত তথ্যাদি</th>
            </tr>

            <tr className="bg-[#f8fbfc] text-center text-[13px] font-semibold text-slate-800">
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">ক্রমিক নং</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">রেজিস্ট্রেশন নম্বর</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">নিবাসীর নাম, মাতা ও পিতার নাম</th>
              <th colSpan={2} className="border border-slate-300 px-3 py-3">ঠিকানা</th>
              <th colSpan={2} className="border border-slate-300 px-3 py-3">বয়স</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">আগমনের তারিখ</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">জেলা</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">কেন্দ্রে অবস্থানের সময়</th>
              <th colSpan={2} className="border border-slate-300 px-3 py-3">শিশু আগমনের ধরণ</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">শিশুর বিচারীক অবস্থা (বিচারাধীন/সাজাপ্রাপ্ত/নিরাপদ হেফাজতী)</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">শিশুর শিক্ষাগত যোগ্যতা</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">শিশুর সক্ষমতা/দক্ষতা</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">শিশুর ভবিষ্যৎ লক্ষ্য</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">শিশুর ঝুঁকি</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">মামলা নম্বর ও ধারা</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">আইনগত সহায়তা কিভাবে পাচ্ছে</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">আদালতের নাম</th>
              <th colSpan={2} className="border border-slate-300 px-3 py-3">আদালতে হাজিরার বিবরণ</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">শিশুর মামলার ধরন (কোন মামলার অভিযোগে আগমন)</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">পূর্বে অন্য কোন মামলায় জড়িত ছিল কিনা</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">শিশুর উচ্চতা ও ওজন</th>
              <th colSpan={2} className="border border-slate-300 px-3 py-3">বিশেষ/জন্মগত রোগ সংক্রান্ত তথ্য</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">বংশগত রোগের ইতিহাস</th>
              <th colSpan={2} className="border border-slate-300 px-3 py-3">প্রতিবন্ধীতা আছে কি না</th>
              <th colSpan={2} className="border border-slate-300 px-3 py-3">মাদকাসক্ত কি না</th>
              <th colSpan={2} className="border border-slate-300 px-3 py-3">লিংগভিত্তিক সহিংসতার (GBV) শিকার কিনা</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">পিতা মাতার শিক্ষাগত যোগ্যতা</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">পিতা ও মাতার পেশা</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">পিতা/মাতার মাসিক আয়</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">আর্থ-সামাজিক অবস্থান</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">পিতা/মাতার সাথে যোগাযোগের নম্বর</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">পিতা/মাতার সাথে শিশুর সম্পর্ক</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">ভাই বোনের সংখ্যা ও শিশুর ক্রম</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">শিশু বিবাহিত কি না</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">সন্তান সংখ্যা</th>
              <th colSpan={2} className="border border-slate-300 px-3 py-3">পরিবারের ধরণ</th>
              <th colSpan={2} className="border border-slate-300 px-3 py-3">পিতা মাতার বৈবাহিক সম্পর্কের অবস্থা</th>
              <th colSpan={2} className="border border-slate-300 px-3 py-3">শিশুর অভিভাবকের ধরণ</th>
              <th colSpan={2} className="border border-slate-300 px-3 py-3">শিশু এতিম কিনা</th>
              <th colSpan={2} className="border border-slate-300 px-3 py-3">পরিবারের কোন সদস্য মাদকাসক্ত কিনা</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">পরিবারের কেউ অপরাধমূলক কাজে যুক্ত কি না</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">শিশুর বন্ধু/পেয়ার সার্কল সংক্রান্ত তথ্য</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">শিশুর পূর্বের পেশা</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">শিশুর প্রকৃতি</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">শিশুর যোগাযোগ দক্ষতা</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">অভিবাবকের সাথে যোগাযোগ</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">শিক্ষা ও প্রশিক্ষণ (শ্রেণি ও ট্রেডের নাম)</th>
              <th colSpan={4} className="border border-slate-300 px-3 py-3">গৃহিত ব্যবস্থাদি</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">জামিনে মুক্তি/সাজা শেষে মুক্তি</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">অভিভাবকের কাছে হস্তান্তরের তারিখ</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">ফলোআপ</th>
              <th rowSpan={2} className="border border-slate-300 px-3 py-3">মন্তব্য</th>
            </tr>

            <tr className="bg-[#fcfefe] text-center text-[12px] font-medium text-slate-700">
              <th className="border border-slate-300 px-2 py-2">স্থায়ী ঠিকানা</th>
              <th className="border border-slate-300 px-2 py-2">বর্তমান ঠিকানা</th>
              <th className="border border-slate-300 px-2 py-2">সিডব্লিউ/জন্ম সনদ অনুযায়ী বয়স</th>
              <th className="border border-slate-300 px-2 py-2">শিশুর বর্তমান বয়স</th>
              <th className="border border-slate-300 px-2 py-2">আইনের সংঘাতে জড়িত শিশু</th>
              <th className="border border-slate-300 px-2 py-2">আইনের সংস্পর্শে আসা শিশু</th>
              <th className="border border-slate-300 px-2 py-2">সর্বশেষ হাজিরা</th>
              <th className="border border-slate-300 px-2 py-2">পরবর্তী হাজিরার তারিখ</th>
              <th className="border border-slate-300 px-2 py-2">হ্যা</th>
              <th className="border border-slate-300 px-2 py-2">না</th>
              <th className="border border-slate-300 px-2 py-2">হ্যাঁ</th>
              <th className="border border-slate-300 px-2 py-2">না</th>
              <th className="border border-slate-300 px-2 py-2">হ্যাঁ</th>
              <th className="border border-slate-300 px-2 py-2">না</th>
              <th className="border border-slate-300 px-2 py-2">হ্যাঁ</th>
              <th className="border border-slate-300 px-2 py-2">না</th>
              <th className="border border-slate-300 px-2 py-2">একক</th>
              <th className="border border-slate-300 px-2 py-2">যৌথ</th>
              <th className="border border-slate-300 px-2 py-2">সহাবস্থান</th>
              <th className="border border-slate-300 px-2 py-2">বিবাহ বিচ্ছেদ</th>
              <th className="border border-slate-300 px-2 py-2">পিতা/মাতা</th>
              <th className="border border-slate-300 px-2 py-2">অন্যান্য</th>
              <th className="border border-slate-300 px-2 py-2">হ্যাঁ</th>
              <th className="border border-slate-300 px-2 py-2">না</th>
              <th className="border border-slate-300 px-2 py-2">হ্যাঁ</th>
              <th className="border border-slate-300 px-2 py-2">না</th>
              <th className="border border-slate-300 px-2 py-2">শিশুর কাউন্সেলিং</th>
              <th className="border border-slate-300 px-2 py-2">পরিবারের সদস্যদের কাউন্সেলিং</th>
              <th className="border border-slate-300 px-2 py-2">চিত্তবিনোদনের ব্যবস্থা</th>
              <th className="border border-slate-300 px-2 py-2">অন্যান্য</th>
            </tr>

            <tr className="bg-[#eef6f5] text-center text-[13px] font-bold text-slate-600">
              {MONTHLY_HEADER_NUMBERS.map((column) => (
                <th key={column} className="border border-slate-300 px-2 py-2">
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {report.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={68}
                  className="border border-slate-300 px-4 py-8 text-center text-lg text-slate-500"
                >
                  {isBn ? "এই মাসে নির্বাচিত কেন্দ্রের জন্য কোনো তথ্য পাওয়া যায়নি।" : "No data was found for the selected center in this month."}
                </td>
              </tr>
            ) : (
              report.rows.map((row, rowIndex) => (
                <tr key={`${row[1]}-${rowIndex}`} className={rowIndex % 2 === 0 ? "bg-white" : "bg-[#fbfefd]"}>
                  {row.map((cell, columnIndex) => (
                    <td
                      key={`${rowIndex}-${columnIndex}`}
                      className="border border-slate-300 px-3 py-3 align-top whitespace-pre-line text-[14px]"
                    >
                      {cell || " "}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MonthlyReport({
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
    () => getDefaultMonthlyCenterId(nonHqCenters, defaultCenterId),
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
  const fallbackReport = useMemo<MonthlyReportResponse>(() => ({
    month: selectedMonth,
    year: selectedYear,
    centerId: selectedCenterId ?? null,
    centerName: isBn ? localizedCenter.bn : localizedCenter.en,
    centerTitle: isBn ? localizedCenter.titleBn : localizedCenter.titleEn,
    total: 0,
    rows: [],
  }), [isBn, localizedCenter.bn, localizedCenter.en, localizedCenter.titleBn, localizedCenter.titleEn, selectedCenterId, selectedMonth, selectedYear]);

  const { data, isLoading, isFetching, isError } = useQuery<MonthlyReportResponse>({
    queryKey: ["reports", "monthly-report", selectedCenterId ?? "none", selectedMonth, selectedYear],
    enabled: Boolean(selectedCenterId),
    queryFn: async () => {
      const query = new URLSearchParams({
        month: String(selectedMonth),
        year: String(selectedYear),
      });
      if (selectedCenterId) query.set("centerId", String(selectedCenterId));

      const response = await fetch(`/api/reports/monthly-report?${query.toString()}`, {
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
    exportUiSheetAsExcel(
      sheetRef.current,
      `monthly_report_${report.centerName ?? "center"}_${report.year}_${String(report.month).padStart(2, "0")}.xlsx`,
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-teal-100 bg-[linear-gradient(135deg,#f5fffc_0%,#fff8f2_45%,#f8fbff_100%)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-teal-900">মাসিক রিপোর্ট</h2>
              <Badge variant="outline" className="border-teal-200 bg-white/80 text-teal-700">
                {isBn ? "Monthly Report" : "Monthly Report"}
              </Badge>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                {isBn ? `মোট ${toBnDigits(report.total)} জন` : `Total ${report.total}`}
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
              {isBn ? "Excel" : "Excel"}
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
              value={selectedCenterId ? String(selectedCenterId) : undefined}
              onValueChange={(value) => setSelectedCenterId(Number(value))}
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
          {isBn ? "রিপোর্ট ডাটা এখন লোড হয়নি। দয়া করে API সার্ভার চালু আছে কি না দেখুন।" : "The report data could not be loaded. Please check that the API server is running."}
        </Card>
      )}
      <MonthlyReportTable report={report} sheetRef={sheetRef} isBn={isBn} />
    </div>
  );
}
