/* eslint-disable @typescript-eslint/no-unused-vars */
// eve

import { itemType } from "@/types/response/item";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { formatPrDate } from "./formatDate";

const drawHeader = (
  page: PDFPage,
  headerImage: any,
  timesBoldFont: PDFFont,
  timesRomanFont: PDFFont
) => {
  //Header Logo
  page.drawImage(headerImage, {
    x: 145,
    y: 675,
    width: 325,
    height: 62,
  });

  // Header TEXT
  page.drawText("Republic of the Philippines", {
  x: 255,
  y: 735,
  size: 10,
  font: timesRomanFont,
});

page.drawText("CEBU TECHNOLOGICAL UNIVERSITY", {
  x: 225,
  y: 723,
  size: 9,
  font: timesBoldFont,
});

page.drawText("ARGAO CAMPUS", {
  x: 275,
  y: 711,
  size: 10,
  font: timesRomanFont,
});

// LOWER THESE ↓↓↓ (IMPORTANT)
page.drawText("Ed Kintanar Street, Lamacan, Argao Cebu Philippines", {
  x: 220,
  y: 699,
  size: 8,
  font: timesRomanFont,
});

page.drawText("Website:", {
  x: 212,
  y: 689,
  size: 7,
  font: timesRomanFont,
});

page.drawText("http://www.argao.ctu.edu.ph", {
  x: 237,
  y: 689,
  size: 7,
  font: timesRomanFont,
  color: rgb(0, 0, 1),
});

page.drawText("E-mail: cdargao@ctu.edu.ph", {
  x: 323,
  y: 689,
  size: 7,
  font: timesRomanFont,
});

page.drawText("Phone No.: (032) 401-0737 local 1700", {
  x: 255,
  y: 679,
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
  const dims = footerImage.scale(0.25);

  page.drawImage(footerImage, {
    x: 110,
    y: 55,
    width: dims.width,
    height: dims.height,
  });

  const formattedTotal = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(total);

  page.drawText("Grand Total:", {
    x: 375,
    y: 270,
    size: 10,
    font,
  });

  page.drawText(formattedTotal, {
    x: 560 - font.widthOfTextAtSize(formattedTotal, 12),
    y: 270,
    size: 10,
    font,
    color: rgb(1, 0, 0),
  });
};


const drawSignatures = (
  page: PDFPage,
  item: itemType[],
  Helveticafont: PDFFont,
) => {


  const requestby1 = (item[0]?.pr_details?.requisitioner_details?.name ?? "").toUpperCase();
    page.drawText(requestby1, {
      x: 165,
      y: 172,
      size: 10,
    });
    page.drawText("Requested by:", {
      x: 137,
      y: 210,
      size: 10,
    });

    page.drawLine({
      start: { x: 165, y: 170 },
      end: { x: 330, y: 170 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    const coordinatorText = (item[0]?.pr_details?.requisitioner_details?.designation ?? "").toUpperCase();

    page.drawText(coordinatorText, {
      x: 180,
      y: 155,
      size: 10,
      font: Helveticafont,
    });

    const reviewedby1 = (item[0]?.pr_details?.reviewed_by_details?.name || "").toUpperCase();

    page.drawText("Reviewed by:", {
      x: 375,
      y: 210,
      size: 10,
    });

    // NAME
    page.drawText(reviewedby1, {
      x: 390,
      y: 172,
      size: 10,
    });

    // LINE (use FIXED WIDTH)
    page.drawLine({
      start: { x: 390, y: 170 },
      end: { x: 555, y: 170 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

   const maintenanceText = (item[0]?.pr_details?.reviewed_by_details?.designation ?? "").toUpperCase();
    page.drawText(maintenanceText, {
      x: 390,
      y: 155,
      size: 10,
      font: Helveticafont,
    });

    const approvedby1 = (item[0]?.pr_details?.campus_director_details?.name || "").toUpperCase();
    page.drawText("Approved by:", {
      x: 137,
      y: 135,
      size: 10,
    });
    page.drawText(approvedby1, {
      x: 240,
      y: 107,
      size: 10,
    });
    //const approvedbyStartX = approvedbyplace - approvedbywidth / 2; // Start position of the underline
    //const approvedbyEndX = approvedbyplace + approvedbywidth / 2.4; // End position of the underline

    page.drawLine({
      start: { x: 240, y: 105 },
      end: { x: 390, y: 105 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    const directorText = "Campus Director";

    page.drawText(directorText, {
      x: 270,
      y: 92,
      size: 10,
      font: Helveticafont,
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
  const timesItalicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const Helveticafont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const maxWidth = 240;
  const lineHeight = 12;
  const footerHeight = 280;
  const pageHeight = 792;
/*
  //debug grid function
  const drawDebugGrid = (
  page: PDFPage,
  pageWidth: number,
  pageHeight: number
) => {
  // Vertical lines
  for (let x = 0; x <= pageWidth; x += 15) {
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: pageHeight },
      thickness: x % 100 === 0 ? 0.8 : 0.2,
      color: rgb(0.85, 0.85, 0.85),
    });

    // X labels
    page.drawText(`${x}`, {
      x: x + 1,
      y: 2,
      size: 5,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // Horizontal lines
  for (let y = 0; y <= pageHeight; y += 15) {
    page.drawLine({
      start: { x: 0, y },
      end: { x: pageWidth, y },
      thickness: y % 100 === 0 ? 0.8 : 0.2,
      color: rgb(0.85, 0.85, 0.85),
    });

    // Y labels
    page.drawText(`${y}`, {
      x: 2,
      y: y + 1,
      size: 5,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
};
*/
  let runningTotal = 0;
  const wrapText = (text: string = "", maxWidth: number, fontSize: number) => {
  const safeText = String(text || "");
  const words = safeText.split(" ");
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
  //debug grid
  //drawDebugGrid(page, 612, pageHeight);

  drawHeader(page, headerImage, timesBoldFont, timesRomanFont);

await textandlines(
  page,
  timesBoldFont,
  timesItalicFont,
  item[0]
);
const purposeLines = wrapText(
  item[0].pr_details.purpose || "",
  400,
  9
);

purposeLines.forEach((line, i) => {
  page.drawText(line, {
    x: 90,
    y: 245 - i * 12,
    size: 9,
    font: timesRomanFont,
  });
});

drawSignatures(page, item, Helveticafont);
  const tableTopY = 555;
  let yPosition = tableTopY;
  pages.push(page);


  // COLUMN BOUNDARIES (MATCH GRID)
const colBounds = {
  stock: [22.68, 70],
  quantity: [70, 119],
  description: [119, 365],
  unit: [365, 416],
  unitCost: [416, 480],
  totalCost: [480, 564],
};

// CENTER FUNCTION
const drawCenteredText = (
  page: PDFPage,
  text: any,
  xStart: number,
  xEnd: number,
  y: number,
  font: PDFFont,
  size: number
) => {
  const safeText = String(text ?? "");
  const textWidth = font.widthOfTextAtSize(safeText, size);
  const centerX = (xStart + xEnd) / 2;

  page.drawText(safeText, {
    x: centerX - textWidth / 2,
    y,
    size,
    font,
  });
};

// loop for the items
const rowHeight = 20;
  for (const entry of item) {

    const { stock_property_no, unit, item_description, quantity, unit_cost } =
      entry;
      
      const safeUnitCost = Number(unit_cost) || 0;
      const safeQuantity = Number(quantity) || 0;

    const wrappedDescription = wrapText(item_description, maxWidth, 9);
    // const descriptionHeight = wrappedDescription.length * lineHeight


    // Calculate total height required for the current item
    if (yPosition - rowHeight < footerHeight) {
      // Add footer to current page
      drawFooter(page, footerImage, runningTotal, timesRomanFont);

      page.drawLine({
        start: { x: 30, y: yPosition - 2 },
        end: { x: 564, y: yPosition - 2 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });

      page.drawText(`Subtotal`, {
        x: 260,
        y: yPosition,
        size: 10,
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
        size: 10,
        font: timesRomanFont,
        color: rgb(1, 0, 0),
      });

      page = pdfDoc.addPage([612, pageHeight]);
     // drawDebugGrid(page, 612, pageHeight);
      pages.push(page);


      drawHeader(page, headerImage, timesBoldFont, timesRomanFont);

await textandlines(
  page,
  timesBoldFont,
  timesItalicFont,
  item[0]
);

const purposeLines = wrapText(
  item[0].pr_details.purpose || "",
  400,
  9
);

purposeLines.forEach((line, i) => {
  page.drawText(line, {
    x: 120,
    y: 132 - i * 12,
    size: 9,
    font: timesRomanFont,
  });
});

drawSignatures(page, item, Helveticafont);
      yPosition = tableTopY;

      pageIndex++;

    }
    const totalamount = quantity * unit_cost;
    runningTotal += totalamount || 0;
    // STOCK
drawCenteredText(
  page,
  stock_property_no,
  colBounds.stock[0],
  colBounds.stock[1],
  yPosition,
  timesRomanFont,
  10
);

// Unit
drawCenteredText(
  page,
  unit,
  colBounds.unit[0],
  colBounds.unit[1],
  yPosition,
  timesRomanFont,
  10
);

// DESCRIPTION (LEFT-ALIGNED)
wrappedDescription.forEach((line, i) => {
  page.drawText(line, {
    x: colBounds.description[0] + 20,
    y: yPosition - i * lineHeight,
    size: 9,
    font: timesRomanFont,
  });
});


// Quantity
drawCenteredText(
  page,
  quantity,
  colBounds.quantity[0],
  colBounds.quantity[1],
  yPosition,
  timesRomanFont,
  10
);

// UNIT COST
drawCenteredText(
  page,
  safeUnitCost.toFixed(2),
  colBounds.unitCost[0],
  colBounds.unitCost[1],
  yPosition,
  timesRomanFont,
  10
);

// TOTAL
drawCenteredText(
  page,
  (safeQuantity * safeUnitCost).toFixed(2),
  colBounds.totalCost[0],
  colBounds.totalCost[1],
  yPosition,
  timesRomanFont,
  10
);
page.drawLine({
  start: { x: 30, y: yPosition - 3 },
  end: { x: 585, y: yPosition - 3 },
  thickness: 0.5,
  color: rgb(0, 0, 0),
});
       yPosition -= rowHeight;
      }

      // Fill remaining empty table rows
      while (yPosition - rowHeight > 285) {
        page.drawLine({
          start: { x: 30, y: yPosition - 3 },
          end: { x: 585, y: yPosition - 3 },
          thickness: 0.5,
          color: rgb(0, 0, 0),
        });

        yPosition -= rowHeight;
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
  //timesRomanFont: PDFFont,
  timesRomanItalicFont: PDFFont,
  item: itemType
) => {
  page.drawLine({
    start: { x: 30, y: 645 },
    end: { x: 585, y: 645 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  page.drawText("PURCHASE REQUEST", {
    x: 210,
    y: 650,
    size: 14,
    font: timesBoldFont,
  }); 
//Horizontal Line
  //Top border
  page.drawLine({
    start: { x: 30, y: 750 },
    end: { x: 585, y: 750 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  //between dept and fund source data
  page.drawLine({
    start: { x: 135, y: 615 },
    end: { x: 345, y: 615 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Below pr no. data
  page.drawLine({
    start: { x: 345, y: 625 },
    end: { x: 585, y: 625 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Below PR details
  page.drawLine({
    start: { x: 30, y: 600 },
    end: { x: 585, y: 600 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Top  of table headers
  page.drawLine({
    start: { x: 30, y: 590 },
    end: { x: 585, y: 590 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  //below table headers
  page.drawLine({
    start: { x: 30, y: 570 },
    end: { x: 585, y: 570 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Bottom border
  page.drawLine({
    start: { x: 30, y: 43 },
    end: { x: 585 , y: 43 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  // above footer
  page.drawLine({
    start: { x: 30, y: 90 },
    end: { x: 585, y: 90 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Above approved by
  page.drawLine({
    start: { x: 30, y: 150 },
    end: { x: 585, y: 150 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
//Grand total to data
  page.drawLine({
    start: { x: 450, y: 275 },
    end: { x: 495, y: 275 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Above purchase request
  page.drawLine({
    start: { x: 30, y: 670 },
    end: { x: 585, y: 670 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  //Bottom line of the table
  page.drawLine({
    start: { x: 30, y: 285 },
    end: { x: 585, y: 285},
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Line above purpose
  page.drawLine({
    start: { x: 30, y: 260 },
    end: { x: 585, y: 260},
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Line below purpose
  page.drawLine({
    start: { x: 30, y: 240 },
    end: { x: 585, y: 240 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Line above signatures
  page.drawLine({
    start: { x: 30, y: 225 },
    end: { x: 585, y: 225 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // Add Fund Cluster label and editable field
  page.drawText("Fund Source:", {
    x: 30,
    y: 605,
    size: 10,
    font: timesBoldFont,
  });
  page.drawText(
  String(item.pr_details.fund_cluster || ""),
  {
    x: 150,
    y: 605,
    size: 10,
  });
  page.drawText("Department/Section:", {
    x: 30,
    y: 630,
    size: 10,
  });
  console.log("OFFICE VALUE:", item.pr_details.office);
  page.drawText(
  String(item.pr_details.office_details?.name || ""),
  {
    x: 150,
    y: 630,
    size: 10,
  }
);
  page.drawText("PR No.:", { x: 347, y: 630, size: 10, });
  page.drawText(String(item.pr_details.pr_no || ""), {
    x: 420,
    y: 630,
    size: 10,
    color: rgb(0, 0.8, 0),
  });
  //Green line?,,, not included for now
  /* 
  page.drawText("___________________", {
    x: 170,
    y: 663,
    size: 11,
    font: timesBoldFont,
    color: rgb(0, 0.8, 0),
  });
  */
  page.drawText("Responsibility", {
    x: 347,
    y: 615,
    size: 9,
  });
  page.drawText("Center Code :", {
    x: 347,
    y: 605,
    size: 9,
  });
  page.drawText("Date :", { x: 495, y: 630, size: 10, });
  page.drawText(String(formatPrDate(item.pr_details.created_at) || ""), {
    x: 525,
    y: 630,
    size: 10,
    font: timesBoldFont,
    color: rgb(0.8, 0, 0),
  });
  //Table Headers
  page.drawText("Stock #", { x: 35, y: 575, size: 10, });
  page.drawText("Quantity", { x: 85, y: 575, size: 10, });
  page.drawText("Item Description", { x: 200, y: 575, size: 10 });
  page.drawText("UOM", { x: 372, y: 575, size: 10, });
  page.drawText("Unit Cost", { x: 430, y: 575, size: 10, });
  page.drawText("Total Cost", { x: 500, y: 575, size: 10, });

  page.drawText("Purpose:", { x: 35, y: 245, size: 10, font: timesRomanItalicFont, });
  
  page.drawText("Signature:", { x: 35, y: 192, size: 10, });
  page.drawText("Printed Name:", { x: 35, y: 172, size: 10, });
  page.drawText("Designation:", {
    x: 35,
    y: 155, 
    size: 10,
  });
 
//Vertical Lines
  //Left border
  page.drawLine({
    start: { x: 30, y: 750 },
    end: { x: 30, y: 43 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });

  //right border
  page.drawLine({
    start: { x: 585, y: 750 },
    end: { x: 585, y: 43 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  //Between uom and unit cost
  page.drawLine({
    start: { x: 416, y: 590 },
    end: { x: 416, y: 285 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Between quantity and item des
  page.drawLine({
    start: { x: 135, y: 590 },
    end: { x: 135, y: 285 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Between stock and quantity
  page.drawLine({
    start: { x: 75, y: 590 },
    end: { x: 75, y: 285 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Between unit cost and Total cost
  page.drawLine({
    start: { x: 480, y: 590 },
    end: { x: 480, y: 285 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Between Item des and oum
  page.drawLine({
    start: { x: 345, y: 590 },
    end: { x: 345, y: 285 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  // Between S, PN, D and requested
  page.drawLine({
    start: { x: 135, y: 225 },
    end: { x: 135, y: 150 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Between requested by and reviewed by
  page.drawLine({
    start: { x: 360, y: 225 },
    end: { x: 360, y: 150 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Dep/Sect and fund source to thier data
  page.drawLine({
    start: { x: 135, y: 645 },
    end: { x: 135, y: 600 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //Before pr no. and res code
  page.drawLine({
    start: { x: 345, y: 645 },
    end: { x: 345, y: 600 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //PR No. and res code to thier data
  page.drawLine({
    start: { x: 416, y: 645 },
    end: { x: 416, y: 600 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  //between pr no. data and date
  page.drawLine({
    start: { x: 485, y: 645 },
    end: { x: 485, y: 625 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
};
