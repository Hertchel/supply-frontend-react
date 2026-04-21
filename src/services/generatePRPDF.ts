/* eslint-disable @typescript-eslint/no-unused-vars */

import { itemType } from "@/types/response/item";
import { PDFDocument, StandardFonts} from "pdf-lib";
import { formatPrDate } from "./formatDate";

export const generatePRPDF = async (items: itemType[]) => {
  const pdfDoc = await PDFDocument.create();

  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const page = pdfDoc.addPage([612, 936]);
  const pr = items[0].pr_details;

  // ================= HEADER =================
  const header = await fetch("/header.jpeg").then(res => res.arrayBuffer());
  const headerImg = await pdfDoc.embedJpg(header);

  page.drawImage(headerImg, { x: 140, y: 860, width: 330, height: 60 });

  page.drawText("PURCHASE REQUEST", {
    x: 220,
    y: 820,
    size: 14,
    font: bold,
  });

  // ================= BOXED DETAILS =================
  const boxY = 780;

  // outer box
  page.drawRectangle({
    x: 20,
    y: boxY - 70,
    width: 572,
    height: 70,
    borderWidth: 1,
  });

  // vertical split
  page.drawLine({ start: { x: 350, y: boxY }, end: { x: 350, y: boxY - 70 } });

  // horizontal splits
  page.drawLine({ start: { x: 20, y: boxY - 35 }, end: { x: 592, y: boxY - 35 } });

  // left
  page.drawText("Department/Section:", { x: 25, y: boxY - 15, size: 9, font: bold });
  page.drawText(pr.office, { x: 25, y: boxY - 30, size: 9, font });

  page.drawText("Fund Cluster:", { x: 25, y: boxY - 50, size: 9, font: bold });

  // right
  page.drawText("PR No:", { x: 360, y: boxY - 15, size: 9, font: bold });
  page.drawText(pr.pr_no, { x: 420, y: boxY - 15, size: 9, font });

  page.drawText("Date:", { x: 360, y: boxY - 35, size: 9, font: bold });
  page.drawText(formatPrDate(pr.created_at), { x: 420, y: boxY - 35, size: 9, font });

  page.drawText("Responsibility Center Code:", {
    x: 360,
    y: boxY - 55,
    size: 9,
    font: bold,
  });

  // ================= TABLE GRID =================
  let startY = 680;
  const rowHeight = 20;

  const cols = [20, 70, 110, 360, 420, 490, 592]; 
  // stock | unit | desc | qty | unit cost | total

  // header row
  page.drawRectangle({
    x: 20,
    y: startY,
    width: 572,
    height: rowHeight,
    borderWidth: 1,
  });

  const headers = [
    "Stock #",
    "Unit",
    "Item Description",
    "Qty",
    "Unit Cost",
    "Total Cost",
  ];

  headers.forEach((h, i) => {
    page.drawText(h, {
      x: cols[i] + 3,
      y: startY + 5,
      size: 9,
      font: bold,
    });
  });

  // vertical lines
  cols.forEach((x) => {
    page.drawLine({
      start: { x, y: startY },
      end: { x, y: startY - 400 },
      thickness: 1,
    });
  });

  // rows
  let y = startY - rowHeight;
  let total = 0;

  items.forEach((it) => {
    const t = it.quantity * it.unit_cost;
    total += t;

    // row line
    page.drawLine({
      start: { x: 20, y },
      end: { x: 592, y },
      thickness: 1,
    });

    page.drawText(it.stock_property_no || "", { x: cols[0] + 3, y: y + 5, size: 9, font });
    page.drawText(it.unit || "", { x: cols[1] + 3, y: y + 5, size: 9, font });
    page.drawText(it.item_description, { x: cols[2] + 3, y: y + 5, size: 9, font });
    page.drawText(String(it.quantity), { x: cols[3] + 3, y: y + 5, size: 9, font });

    page.drawText(it.unit_cost.toFixed(2), {
      x: cols[4] + 3,
      y: y + 5,
      size: 9,
      font,
    });

    page.drawText(t.toFixed(2), {
      x: cols[5] + 3,
      y: y + 5,
      size: 9,
      font,
    });

    y -= rowHeight;
  });

  // ================= GRAND TOTAL =================
  page.drawText("Grand Total:", { x: 420, y: y - 10, size: 10, font: bold });
  page.drawText(total.toFixed(2), { x: 500, y: y - 10, size: 10, font });

  // ================= PURPOSE =================
  page.drawRectangle({
    x: 20,
    y: y - 70,
    width: 572,
    height: 60,
    borderWidth: 1,
  });

  page.drawText("Purpose:", { x: 25, y: y - 20, size: 10, font: bold });
  page.drawText(pr.purpose, { x: 100, y: y - 20, size: 9, font });

  // ================= SIGNATURES =================

  const leftX = 140;
  const rightX = 420;
  const centerX = 300;

  const baseY = y - 120;

  const drawSig = (label: string, name: string, desig: string, x: number, y: number) => {
    page.drawText(label, { x: x - 40, y, size: 10, font: bold });

    page.drawLine({
      start: { x: x - 60, y: y - 20 },
      end: { x: x + 60, y: y - 20 },
      thickness: 1,
    });

    page.drawText(name, { x: x - 50, y: y - 15, size: 9, font: bold });
    page.drawText(desig, { x: x - 50, y: y - 30, size: 8, font });
  };

  drawSig(
    "Requested by:",
    pr.requisitioner_details.name,
    pr.requisitioner_details.designation,
    leftX,
    baseY
  );

  drawSig(
    "Reviewed by:",
    pr.reviewed_by_details
      ? `${pr.reviewed_by_details.first_name} ${pr.reviewed_by_details.last_name}`
      : "N/A",
    pr.reviewed_by_details?.designation || "",
    rightX,
    baseY
  );

  drawSig(
    "Approved by:",
    pr.campus_director_details.name,
    pr.campus_director_details.designation,
    centerX,
    baseY - 80
  );

  // ================= FOOTER =================
  const footer = await fetch("/footer.jpeg").then(res => res.arrayBuffer());
  const footerImg = await pdfDoc.embedJpg(footer);

  page.drawImage(footerImg, { x: 140, y: 5, width: 330, height: 40 });

  const pdfBytes = await pdfDoc.save();
  return URL.createObjectURL(new Blob([pdfBytes], { type: "application/pdf" }));
};