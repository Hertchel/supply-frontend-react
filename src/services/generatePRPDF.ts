/* eslint-disable @typescript-eslint/no-unused-vars */

import { itemType } from "@/types/response/item";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { formatPrDate } from "./formatDate";

const drawHeader = (
  page: PDFPage,
  headerImage: any,
  timesBoldFont: PDFFont,
  timesRomanFont: PDFFont
) => {

  page.drawImage(headerImage, {
    x: 145,
    y: 720,
    width: 325,
    height: 62,
  });

  // TEXT
  page.drawText("Republic of the Philippines", {
  x: 255,
  y: 780,
  size: 10,
  font: timesRomanFont,
});

page.drawText("CEBU TECHNOLOGICAL UNIVERSITY", {
  x: 225,
  y: 768,
  size: 9,
  font: timesBoldFont,
});

page.drawText("ARGAO CAMPUS", {
  x: 275,
  y: 756,
  size: 10,
  font: timesRomanFont,
});

// LOWER THESE ↓↓↓ (IMPORTANT)
page.drawText("Ed Kintanar Street, Lamacan, Argao Cebu Philippines", {
  x: 220,
  y: 742,
  size: 8,
  font: timesRomanFont,
});

page.drawText("Website:", {
  x: 212,
  y: 732,
  size: 7,
  font: timesRomanFont,
});

page.drawText("http://www.argao.ctu.edu.ph", {
  x: 237,
  y: 732,
  size: 7,
  font: timesRomanFont,
  color: rgb(0, 0, 1),
});

page.drawText("E-mail: cdargao@ctu.edu.ph", {
  x: 323,
  y: 732,
  size: 7,
  font: timesRomanFont,
});

page.drawText("Phone No.: (032) 401-0737 local 1700", {
  x: 255,
  y: 722,
  size: 7,
  font: timesRomanFont,
});
};



const drawFooter = (
  page: PDFPage,
  footerImage: any,
  total: number,
  font: PDFFont
) => {
  const dims = footerImage.scale(0.2);

  page.drawImage(footerImage, {
    x: 145,
    y: 10,
    width: dims.width,
    height: dims.height,
  });

  const formattedTotal = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(total);

  page.drawText("Total Amount:", {
    x: 260,
    y: 220,
    size: 12,
    font,
  });

  page.drawText(formattedTotal, {
    x: 500,
    y: 220,
    size: 12,
    font,
  });
};


const drawSignatures = (
  page: PDFPage,
  item: itemType[],
  timesBoldFont: PDFFont,
  Helveticafont: PDFFont,
  Helveticabold: PDFFont
) => {

  const left = 119;
    const right = 564;
    const columnWidth = (right - left) / 3;

    const col1 = left + columnWidth / 2;
    const col2 = left + columnWidth * 1.5;
    const col3 = left + columnWidth * 2.5;

    const lineWidth = 120;



  const requestby1 = (item[0].pr_details.requisitioner_details.name ?? "").toUpperCase();
    const requestbywidth = Helveticabold.widthOfTextAtSize(requestby1, 10);
    const requestbyplace = col1 //(119 + 365) / 2;
    page.drawText(requestby1, {
      x: requestbyplace - requestbywidth / 2,
      y: 65,
      size: 9,
      font: Helveticabold,
    });
    page.drawText("Requested by:", {
      x: col1 - 40,
      y: 92,
      size: 12,
      font: timesBoldFont,
    });

    page.drawLine({
      start: { x: requestbyplace - lineWidth / 2, y: 63 },
      end: { x: requestbyplace + lineWidth / 2, y: 63 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    //const underlineStartX = requestbyplace - requestbywidth / 2; // Start position of the underline
    //const underlineEndX = requestbyplace + requestbywidth / 2.4; // End position of the underline
    //const underlineY = 63; // Slightly below the text position
/*
    page.drawLine({
      start: { x: underlineStartX, y: underlineY },
      end: { x: underlineEndX, y: underlineY },
      thickness: 1, // Adjust line thickness as needed
      color: rgb(0, 0, 0), // Black color
    });
*/

    const reviewedby1 = (
      item[0].pr_details.reviewed_by_details
        ? `${item[0].pr_details.reviewed_by_details.first_name} ${item[0].pr_details.reviewed_by_details.last_name}`
        : ""
    ).toUpperCase();

    const reviewedbywidth = Helveticabold.widthOfTextAtSize(reviewedby1, 10);
    const reviewedbyplace = col2;
    page.drawText("Reviewed by:", {
      x: col2 - 40,
      y: 92,
      size: 12,
      font: timesBoldFont,
    });

    // NAME
    page.drawText(reviewedby1, {
      x: reviewedbyplace - reviewedbywidth / 2,
      y: 65,
      size: 9,
      font: Helveticabold,
    });

    // LINE (use FIXED WIDTH)
    page.drawLine({
      start: { x: reviewedbyplace - lineWidth / 2, y: 63 },
      end: { x: reviewedbyplace + lineWidth / 2, y: 63 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    const approvedby1 = (item[0].pr_details.campus_director_details.name || "").toUpperCase();
    //const approvedbywidth = Helveticabold.widthOfTextAtSize(approvedby1, 10);
    const approvedbyplace = col3 //(480 + 564) / 2;
    page.drawText("Approved by:", {
      x: col3 - 40,
      y: 92,
      size: 12,
      font: timesBoldFont,
    });
    page.drawText(approvedby1, {
      x: approvedbyplace - Helveticabold.widthOfTextAtSize(approvedby1, 10) / 2,
      y: 65,
      size: 9,
      font: Helveticabold,
    });
    //const approvedbyStartX = approvedbyplace - approvedbywidth / 2; // Start position of the underline
    //const approvedbyEndX = approvedbyplace + approvedbywidth / 2.4; // End position of the underline

    page.drawLine({
      start: { x: approvedbyplace - lineWidth / 2, y: 63 },
      end: { x: approvedbyplace + lineWidth / 2, y: 63 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
/*
    page.drawLine({
      start: { x: approvedbyStartX, y: underlineY },
      end: { x: approvedbyEndX, y: underlineY },
      thickness: 1, // Adjust line thickness as needed
      color: rgb(0, 0, 0), // Black color
    });
*/

    const designation1 = item[0].pr_details.requisitioner_details.designation ?? "";
    const designationwidth = Helveticafont.widthOfTextAtSize(designation1, 11);
    const designationplace = col1;
    //const designationplace = (119 + 365) / 2;
    page.drawText(designation1, {
      x: designationplace - designationwidth / 2,
      y: 53,
      size: 8,
      font: Helveticafont,
    });

    const designation2 = item[0].pr_details.campus_director_details.designation || "";
    const designationwidth2 = Helveticafont.widthOfTextAtSize(designation2, 11);
    const designationplace2 = col3;
    // const designationplace2 = (385 + 564) / 2;
    page.drawText(designation2, {
      x: designationplace2 - designationwidth2 / 2,
      y: 53,
      size: 8,
      font: Helveticafont,
    });

    const designation3 = item[0].pr_details.reviewed_by_details
  ? item[0].pr_details.reviewed_by_details.designation || ""
  : "";

const designationwidth3 = Helveticafont.widthOfTextAtSize(designation3, 11);

  page.drawText(designation3, {
    x: reviewedbyplace - designationwidth3 / 2,
    y: 53,
    size: 8,
    font: Helveticafont,
  });

    const Budgetname = "BETHANY B. URACA";
    const Bugdetofficer = Budgetname || "";
    const Bugdetofficerwidth = Helveticabold.widthOfTextAtSize(
      Bugdetofficer,
      11
    );
    const Bugdetofficerplace = (119 + 365) / 2;
    page.drawText(Bugdetofficer, {
      x: Bugdetofficerplace - Bugdetofficerwidth / 2,
      y: 185,
      size: 10,
      font: Helveticabold,
    });

    const BugdetofficerStartX = Bugdetofficerplace - Bugdetofficerwidth / 2; // Start position of the underline
    const BugdetofficerEndX = Bugdetofficerplace + Bugdetofficerwidth / 2.4; // End position of the underline
    const budgetlabel = "Bugdet Officer II";
    const budgetlabelwidth = Helveticafont.widthOfTextAtSize(budgetlabel, 11);
    page.drawText(budgetlabel, {
      x: Bugdetofficerplace - budgetlabelwidth / 2,
      y: 172,
      size: 10,
      font: Helveticafont,
    });

    page.drawLine({
      start: { x: BugdetofficerStartX, y: 183 },
      end: { x: BugdetofficerEndX, y: 183 },
      thickness: 1, // Adjust line thickness as needed
      color: rgb(0, 0, 0), // Black color
    });

};




export const generatePRPDF = async (
  item: itemType[]
) => {
  const pdfDoc = await PDFDocument.create();
  const headerBytes = await fetch("/header.jpeg").then(res => res.arrayBuffer());
  const headerImage = await pdfDoc.embedJpg(headerBytes);

  const footerBytes = await fetch("/footer.jpeg").then(res => res.arrayBuffer());
  const footerImage = await pdfDoc.embedJpg(footerBytes);

  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const Helveticafont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const Helveticabold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const maxWidth = 240;
  const lineHeight = 12;
  const footerHeight = 260;
  const pageHeight = 792;

  let runningTotal = 0;
  const wrapText = (text: string, maxWidth: number, fontSize: number) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const testWidth = timesRomanFont.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine); // Push the last line
    return lines;
  };
  const pages = [];
  let pageIndex = 0;
  let page = pdfDoc.addPage([612, pageHeight]);

  drawHeader(page, headerImage, timesBoldFont, timesRomanFont);
  drawSignatures(page, item, timesBoldFont, Helveticafont, Helveticabold);
  const tableTopY = 550;
  let yPosition = tableTopY;

  const colX = {
    stock: 40,
    unit: 90,
    description: 130,
    quantity: 380,
    unitCost: 460,
    totalCost: 530,
  };

  // DRAW HEADER ROW
  page.drawText("Stock No.", { x: colX.stock, y: tableTopY + 15, size: 10, font: timesBoldFont });
  page.drawText("Unit", { x: colX.unit, y: tableTopY + 15, size: 10, font: timesBoldFont });
  page.drawText("Description", { x: colX.description, y: tableTopY + 15, size: 10, font: timesBoldFont });
  page.drawText("Qty", { x: colX.quantity, y: tableTopY + 15, size: 10, font: timesBoldFont });
  page.drawText("Unit Cost", { x: colX.unitCost, y: tableTopY + 15, size: 10, font: timesBoldFont });
  page.drawText("Total", { x: colX.totalCost, y: tableTopY + 15, size: 10, font: timesBoldFont });
  const purposewidth = 580;
  pages.push(page);


  const purposesplit = wrapText(item[0].pr_details.purpose, purposewidth, 12);

      purposesplit.forEach((line, lineIndex) => {
        page.drawText(line, {
          x: 123,
          y: 132 - lineIndex * lineHeight,
          size: 9,
          font: timesRomanFont,
        });
      });

// repeat headers
  for (const entry of item) {
    const { stock_property_no, unit, item_description, quantity, unit_cost } =
      entry;

    const wrappedDescription = wrapText(item_description, maxWidth, 9);
    const descriptionHeight = wrappedDescription.length * lineHeight;
    const rowHeight = Math.max(descriptionHeight, 14);


    // Calculate total height required for the current item
    if (yPosition - rowHeight < footerHeight) {
      // Add footer to current page
      drawFooter(page, footerImage, runningTotal, timesRomanFont);

      page.drawText(`Subtotal`, {
        x: 260,
        y: yPosition,
        size: 11,
        font: timesBoldFont,
        color: rgb(1, 0, 0),
      });
      const subtotalText = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(runningTotal);

      const subtotalWidth = timesRomanFont.widthOfTextAtSize(subtotalText, 11);
      page.drawText(subtotalText, {
        x: 560 - subtotalWidth,
        y: yPosition,
        size: 11,
        font: timesRomanFont,
        color: rgb(1, 0, 0),
      });

      page = pdfDoc.addPage([612, pageHeight]);
      pages.push(page);

      drawHeader(page, headerImage, timesBoldFont, timesRomanFont);
      drawSignatures(page, item, timesBoldFont, Helveticafont, Helveticabold);
      yPosition = tableTopY;

      // redraw table header
      page.drawText("Stock No.", { x: colX.stock, y: tableTopY + 15, size: 10, font: timesBoldFont });
      page.drawText("Unit", { x: colX.unit, y: tableTopY + 15, size: 10, font: timesBoldFont });
      page.drawText("Description", { x: colX.description, y: tableTopY + 15, size: 10, font: timesBoldFont });
      page.drawText("Qty", { x: colX.quantity, y: tableTopY + 15, size: 10, font: timesBoldFont });
      page.drawText("Unit Cost", { x: colX.unitCost, y: tableTopY + 15, size: 10, font: timesBoldFont });
      page.drawText("Total", { x: colX.totalCost, y: tableTopY + 15, size: 10, font: timesBoldFont });

      pageIndex++;
      yPosition -= lineHeight;
    }
    const totalamount = quantity * unit_cost;
    runningTotal += totalamount || 0;
    // STOCK
    page.drawText(stock_property_no.toString(), {
      x: colX.stock,
      y: yPosition,
      size: 10,
      font: timesRomanFont,
    });

    // UNIT
    page.drawText(unit || "", {
      x: colX.unit,
      y: yPosition,
      size: 10,
      font: timesRomanFont,
    });

    // DESCRIPTION
    wrappedDescription.forEach((line, i) => {
      page.drawText(line, {
        x: colX.description,
        y: yPosition - i * lineHeight,
        size: 9,
        font: timesRomanFont,
      });
    });

    // QUANTITY
    page.drawText(quantity.toString(), {
      x: colX.quantity,
      y: yPosition,
      size: 10,
      font: timesRomanFont,
    });

    // UNIT COST
    const safeUnitCost = Number(unit_cost) || 0;
    page.drawText(safeUnitCost.toFixed(2), {
      x: colX.unitCost,
      y: yPosition,
      size: 10,
      font: timesRomanFont,
    });

    // TOTAL
    const safeQuantity = Number(quantity) || 0;
    page.drawText((safeQuantity * safeUnitCost).toFixed(2), {
      x: colX.totalCost,
      y: yPosition,
      size: 10,
      font: timesRomanFont,
    });
    page.drawLine({
      start: { x: 30, y: yPosition + 5 },
      end: { x: 580, y: yPosition + 5 },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
        yPosition -= rowHeight + 5;
      }


  drawFooter(page, footerImage, runningTotal, timesRomanFont);

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  const fixedBuffer = new Uint8Array(pdfBytes).buffer;
  const blob = new Blob([fixedBuffer], { type: "application/pdf" });
  // const blob = new Blob([pdfBytes.buffer], { type: "application/pdf" });
  //const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  return url;
};
const textandlines = async (
  page: PDFPage,
  timesBoldFont: PDFFont,
  timesRomanFont: PDFFont,
  timesRomanItalicFont: PDFFont,
  Helveticafont: PDFFont,
  item: itemType
) => {
  page.drawText("PURCHASE REQUEST", {
    x: 201,
    y: 725,
    size: 14,
    font: timesBoldFont,
  });
  page.drawText("Appendix 60", {
    x: 490,
    y: 760,
    size: 9,
    font: timesRomanItalicFont,
  });
  page.drawText("Entity Name:", {
    x: 23,
    y: 697,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("CTU - ARGAO CAMPUS", {
    x: 96,
    y: 697,
    size: 11,
    font: timesRomanFont,
  });

  // Horizontal and vertical lines.
  //Horizontal Line

  page.drawLine({
    start: { x: 22, y: 680 },
    end: { x: 564, y: 680 },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 22.68, y: 635 },
    end: { x: 564, y: 635 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 22.68, y: 590 },
    end: { x: 564, y: 590 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 22.68, y: 43 },
    end: { x: 564, y: 43 },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 22.68, y: 102 },
    end: { x: 564, y: 102 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 22.68, y: 150 },
    end: { x: 564, y: 150 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  page.drawLine({
    start: { x: 480, y: 250 },
    end: { x: 564, y: 250 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 480, y: 223 },
    end: { x: 564, y: 223 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  const startX = 350;
  const endX = 478;
  const y = 230;
  const dashLength = 2.5;
  const gapLength = 1.5;

  let currentX = startX;

  while (currentX < endX) {
    // Calculate the end of the current dash
    const nextX = Math.min(currentX + dashLength, endX);

    // Draw a dash
    page.drawLine({
      start: { x: currentX, y: y },
      end: { x: nextX, y: y },
      thickness: 1,
      color: rgb(1, 0, 0),
    });

    // Update the position for the next dash
    currentX = nextX + gapLength;
  }

  // Add Fund Cluster label and editable field
  page.drawText("Fund Cluster:", {
    x: 369,
    y: 697,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("", { x: 130, y: 669, size: 11, font: timesRomanFont });
  page.drawLine({
    start: { x: 445, y: 695 },
    end: { x: 520, y: 695 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawText("Office/Section:", {
    x: 30,
    y: 663,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText(item.pr_details.office, {
    x: 30,
    y: 650,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("PR No.:", { x: 125, y: 663, size: 11, font: timesBoldFont });
  page.drawText(item.pr_details.pr_no, {
    x: 170,
    y: 663,
    size: 11,
    font: timesBoldFont,
    color: rgb(0, 0.8, 0),
  });
  page.drawText("___________________", {
    x: 170,
    y: 663,
    size: 11,
    font: timesBoldFont,
    color: rgb(0, 0.8, 0),
  });
  page.drawText("Responsibility Center Code :", {
    x: 125,
    y: 645,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("Date :", { x: 418, y: 663, size: 11, font: timesBoldFont });
  page.drawText(formatPrDate(item.pr_details.created_at), {
    x: 450,
    y: 663,
    size: 11,
    font: timesBoldFont,
    color: rgb(0.8, 0, 0),
  });
  page.drawText("___________________", {
    x: 450,
    y: 663,
    size: 11,
    font: timesBoldFont,
    color: rgb(0.8, 0, 0),
  });
  page.drawText("Stock/", { x: 30, y: 620, size: 11, font: timesBoldFont });
  page.drawText("Property", { x: 25, y: 609, size: 11, font: timesBoldFont });
  page.drawText("No.", { x: 35, y: 595, size: 11, font: timesBoldFont });
  page.drawText("Unit", { x: 80, y: 610, size: 11, font: timesBoldFont });
  page.drawText("Item Description", {
    x: 206,
    y: 610,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("Quantity", { x: 370, y: 610, size: 11, font: timesBoldFont });
  page.drawText("Unit Cost", { x: 425, y: 610, size: 11, font: timesBoldFont });
  page.drawText("Total Cost", {
    x: 495,
    y: 610,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("Purpose:", { x: 53, y: 138, size: 12, font: timesBoldFont });
  page.drawText("Allotment Available:", {
    x: 122,
    y: 210,
    size: 10,
    font: Helveticafont,
  });
/*
  page.drawText("Requested by:", {
    x: 125,
    y: 92,
    size: 12,
    font: timesBoldFont,
  });
  */
  page.drawText("Signature:", { x: 26, y: 80, size: 12, font: timesBoldFont });
  page.drawText("Printed Name:", {
    x: 26,
    y: 65,
    size: 12,
    font: timesBoldFont,
  });
  page.drawText("Designation:", {
    x: 26,
    y: 50,
    size: 12,
    font: timesBoldFont,
  });
  /*
  page.drawText("Approved by:", {
    x: 367,
    y: 92,
    size: 12,
    font: timesBoldFont,
  });
  */
 
  //Vertical Lines
  page.drawLine({
    start: { x: 22.68, y: 680 },
    end: { x: 22.68, y: 43 },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 564, y: 680 },
    end: { x: 564, y: 43 },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 416, y: 680 },
    end: { x: 416, y: 240 },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 416, y: 220 },
    end: { x: 416, y: 150 },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 119, y: 680 },
    end: { x: 119, y: 150 },
    thickness: 2,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 70, y: 635 },
    end: { x: 70, y: 150 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 480, y: 635 },
    end: { x: 480, y: 150 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 365, y: 635 },
    end: { x: 365, y: 240 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 365, y: 220 },
    end: { x: 365, y: 150 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 365, y: 102 },
    end: { x: 365, y: 43 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
};
