/* eslint-disable @typescript-eslint/no-unused-vars */
import { itemType } from "@/types/response/item";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { formatPrDate } from "./formatDate";

const drawHeader = (
  page: PDFPage,
  headerImage: any,
  timesBold: PDFFont,
  timesRoman: PDFFont,
) => {
  // Header Image (adjust size/position to match image)
  page.drawImage(headerImage, {
    x: 145,
    y: 725,
    width: 325,
    height: 65,
  });

  page.drawText("Republic of the Philippines", {
    x: 255,
    y: 785,
    size: 10,
    font: timesRoman,
  });
  page.drawText("CEBU TECHNOLOGICAL UNIVERSITY", {
    x: 225,
    y: 772,
    size: 10,
    font: timesBold,
  });
  page.drawText("ARGAO CAMPUS", { x: 275, y: 760, size: 10, font: timesRoman });

  page.drawText("Ed Kintanar Street, Lamacan, Argao Cebu", {
    x: 220,
    y: 745,
    size: 8,
    font: timesRoman,
  });
  page.drawText("Website: http://www.argao.ctu.edu.ph", {
    x: 220,
    y: 735,
    size: 7.5,
    font: timesRoman,
  });
  page.drawText("E-mail: cdargao@ctu.edu.ph", {
    x: 220,
    y: 726,
    size: 7.5,
    font: timesRoman,
  });
  page.drawText("Phone No.: (032) 401-0737 local 1700", {
    x: 220,
    y: 717,
    size: 7.5,
    font: timesRoman,
  });
};

const drawTableHeaders = (page: PDFPage, timesBold: PDFFont) => {
  page.drawText("Stock /", { x: 28, y: 620, size: 11, font: timesBold });
  page.drawText("Property No.", { x: 25, y: 608, size: 11, font: timesBold });

  page.drawText("Unit", { x: 82, y: 610, size: 11, font: timesBold });

  page.drawText("Item Description", {
    x: 195,
    y: 610,
    size: 11,
    font: timesBold,
  });

  page.drawText("Quantity", { x: 372, y: 610, size: 11, font: timesBold });
  page.drawText("Unit Cost", { x: 425, y: 610, size: 11, font: timesBold });
  page.drawText("Total Cost", { x: 495, y: 610, size: 11, font: timesBold });
};

const drawSignatures = (
  page: PDFPage,
  item: itemType[],
  timesBold: PDFFont,
  helvetica: PDFFont,
  helveticaBold: PDFFont,
) => {
  const yName = 72;
  const yLabel = 92;
  const yDesignation = 52;
  const lineY = 75;

  const left = 115;
  const mid = 340;
  const right = 555;
  const lineLen = 160;

  // Requested by
  const reqName = (
    item[0].pr_details.requisitioner_details?.name ?? ""
  ).toUpperCase();
  page.drawText(reqName, {
    x: left + (lineLen - helveticaBold.widthOfTextAtSize(reqName, 10)) / 2,
    y: yName,
    size: 10,
    font: helveticaBold,
  });
  page.drawText("Requested by:", {
    x: left + 20,
    y: yLabel,
    size: 11,
    font: timesBold,
  });
  page.drawLine({
    start: { x: left, y: lineY },
    end: { x: left + lineLen, y: lineY },
    thickness: 1,
  });

  const des1 = item[0].pr_details.requisitioner_details?.designation ?? "";
  page.drawText(des1, {
    x: left + (lineLen - helvetica.widthOfTextAtSize(des1, 9)) / 2,
    y: yDesignation,
    size: 9,
    font: helvetica,
  });

  // Reviewed by
  const revName = item[0].pr_details.reviewed_by_details
    ? `${item[0].pr_details.reviewed_by_details.first_name} ${item[0].pr_details.reviewed_by_details.last_name}`.toUpperCase()
    : "";
  page.drawText(revName, {
    x: mid + (lineLen - helveticaBold.widthOfTextAtSize(revName, 10)) / 2,
    y: yName,
    size: 10,
    font: helveticaBold,
  });
  page.drawText("Reviewed by:", {
    x: mid + 20,
    y: yLabel,
    size: 11,
    font: timesBold,
  });
  page.drawLine({
    start: { x: mid, y: lineY },
    end: { x: mid + lineLen, y: lineY },
    thickness: 1,
  });

  const des2 = item[0].pr_details.reviewed_by_details?.designation ?? "";
  page.drawText(des2, {
    x: mid + (lineLen - helvetica.widthOfTextAtSize(des2, 9)) / 2,
    y: yDesignation,
    size: 9,
    font: helvetica,
  });

  // Approved by
  const appName = (
    item[0].pr_details.campus_director_details?.name ?? ""
  ).toUpperCase();
  page.drawText(appName, {
    x: right - lineLen / 2 - helveticaBold.widthOfTextAtSize(appName, 10) / 2,
    y: yName,
    size: 10,
    font: helveticaBold,
  });
  page.drawText("Approved by:", {
    x: right - lineLen - 10,
    y: yLabel,
    size: 11,
    font: timesBold,
  });
  page.drawLine({
    start: { x: right - lineLen, y: lineY },
    end: { x: right, y: lineY },
    thickness: 1,
  });

  const des3 = item[0].pr_details.campus_director_details?.designation ?? "";
  page.drawText(des3, {
    x: right - lineLen / 2 - helvetica.widthOfTextAtSize(des3, 9) / 2,
    y: yDesignation,
    size: 9,
    font: helvetica,
  });
};

export const generatePRPDF = async (item: itemType[]) => {
  const pdfDoc = await PDFDocument.create();

  const headerBytes = await fetch("/header.jpeg").then((res) =>
    res.arrayBuffer(),
  );

  const headerImage = await pdfDoc.embedJpg(headerBytes);

  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([612, 792]);
  let yPosition = 580;
  let runningTotal = 0;

  drawHeader(page, headerImage, timesBold, timesRoman);

  // === Form Metadata ===
  const textandlines = (p: PDFPage, data: itemType) => {
    p.drawText("PURCHASE REQUEST", {
      x: 235,
      y: 705,
      size: 16,
      font: timesBold,
    });

    p.drawText("Entity Name:", { x: 25, y: 680, size: 11, font: timesBold });
    p.drawText("CTU - ARGAO CAMPUS", {
      x: 115,
      y: 680,
      size: 11,
      font: timesRoman,
    });

    p.drawText("Fund Cluster:", { x: 370, y: 680, size: 11, font: timesBold });
    // Draw line for Fund Cluster
    p.drawLine({
      start: { x: 445, y: 678 },
      end: { x: 520, y: 678 },
      thickness: 1,
    });

    p.drawText("Office/Section:", { x: 25, y: 655, size: 11, font: timesBold });
    p.drawText(data.pr_details.office || "", {
      x: 115,
      y: 655,
      size: 11,
      font: timesRoman,
    });

    p.drawText("PR No.:", { x: 370, y: 655, size: 11, font: timesBold });
    p.drawText(data.pr_details.pr_no || "", {
      x: 425,
      y: 655,
      size: 11,
      font: timesBold,
      color: rgb(0, 0.6, 0),
    });

    p.drawText("Date:", { x: 370, y: 640, size: 11, font: timesBold });
    p.drawText(formatPrDate(data.pr_details.created_at) || "", {
      x: 425,
      y: 640,
      size: 11,
      font: timesBold,
      color: rgb(0.8, 0, 0),
    });

    // Horizontal lines
    p.drawLine({
      start: { x: 22, y: 690 },
      end: { x: 565, y: 690 },
      thickness: 2,
    });
    p.drawLine({
      start: { x: 22, y: 635 },
      end: { x: 565, y: 635 },
      thickness: 1,
    });
    p.drawLine({
      start: { x: 22, y: 590 },
      end: { x: 565, y: 590 },
      thickness: 1,
    });

    drawTableHeaders(p, timesBold);

    // Purpose
    p.drawText("Purpose:", { x: 25, y: 145, size: 12, font: timesBold });
    const purposeLines = (data.pr_details.purpose || "").split("\n");
    purposeLines.forEach((line, i) => {
      p.drawText(line.trim(), {
        x: 115,
        y: 145 - i * 14,
        size: 10,
        font: timesRoman,
      });
    });
  };

  textandlines(page, item[0]);
  drawSignatures(page, item, timesBold, helvetica, helveticaBold);

  // Table items
  for (const entry of item) {
    if (yPosition < 180) {
      // Add new page logic (keep your existing multi-page handling)
      // ...
    }

    const total = Number(entry.quantity) * Number(entry.unit_cost);
    runningTotal += total;

    // Draw row (use your existing drawCenteredText + description wrapping)
    // ... (I recommend keeping your current table drawing logic here as it's quite good)

    yPosition -= 18;
  }

  // Final footer + total
  // drawFooter(...)

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  return URL.createObjectURL(blob);
};
