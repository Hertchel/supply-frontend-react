import {
  itemQuotationResponseType,
  quotationResponseType,
} from "@/types/response/request-for-quotation";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";

const TABLE_CONFIG = {
  startY: 502,
  bottomY: 306,
  fontSize: 11,
  lineHeight: 13,
  padding: 4,
  minRowHeight: 14,
};

const wrapText = (
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] => {
  const words = String(text || "-").split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (font.widthOfTextAtSize(testLine, fontSize) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Handle a single word wider than the column.
        let part = "";

        for (const character of word) {
          const testPart = part + character;

          if (
            font.widthOfTextAtSize(testPart, fontSize) <= maxWidth
          ) {
            part = testPart;
          } else {
            if (part) lines.push(part);
            part = character;
          }
        }

        currentLine = part;
      }
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines.length ? lines : [""];
};

const drawWrappedCell = (
  page: PDFPage,
  lines: string[],
  x: number,
  rowTop: number,
  rowHeight: number,
  width: number,
  font: PDFFont,
  fontSize: number,
  align: "left" | "center" | "right" = "left",
) => {
  const textHeight = lines.length * TABLE_CONFIG.lineHeight;

  const startY =
    rowTop -
    (rowHeight - textHeight) / 2 -
    fontSize;

  lines.forEach((line, index) => {
    const lineWidth = font.widthOfTextAtSize(line, fontSize);

    let textX = x + TABLE_CONFIG.padding;

    if (align === "center") {
      textX = x + (width - lineWidth) / 2;
    } else if (align === "right") {
      textX = x + width - lineWidth - TABLE_CONFIG.padding;
    }

    page.drawText(line, {
      x: textX,
      y: startY - index * TABLE_CONFIG.lineHeight,
      size: fontSize,
      font,
    });
  });
};

const drawSingleLineCell = (
  page: PDFPage,
  text: string,
  x: number,
  rowTop: number,
  rowHeight: number,
  width: number,
  font: PDFFont,
  fontSize: number,
  align: "left" | "center" | "right" = "left",
) => {
  let adjustedSize = fontSize;

  const availableWidth = width - TABLE_CONFIG.padding * 2;

  // Reduce font size until the text fits.
  while (
    font.widthOfTextAtSize(text, adjustedSize) > availableWidth &&
    adjustedSize > 6
  ) {
    adjustedSize -= 0.5;
  }

  const textWidth = font.widthOfTextAtSize(text, adjustedSize);

  let textX = x + TABLE_CONFIG.padding;

  if (align === "center") {
    textX = x + (width - textWidth) / 2;
  } else if (align === "right") {
    textX = x + width - textWidth - TABLE_CONFIG.padding;
  }

  page.drawText(text, {
    x: textX,
    y: rowTop - rowHeight / 2 - adjustedSize / 2,
    size: adjustedSize,
    font,
  });
};

export const generateRFQPDF = async (
  item: itemQuotationResponseType[],
  rfq: quotationResponseType,
) => {
  const pdfDoc = await PDFDocument.create();

  const timesBoldFont = await pdfDoc.embedFont(
    StandardFonts.TimesRomanBold,
  );

  const timesRomanFont = await pdfDoc.embedFont(
    StandardFonts.TimesRoman,
  );

  const timesRomanItalicFont = await pdfDoc.embedFont(
    StandardFonts.TimesRomanItalic,
  );

  const columnPositions = [
    30.52,  // Table left
    60,     // Item number / description
    301,    // Description / quantity
    327,    // Quantity / unit
    360,    // Unit / brand
    450,    // Brand / ABC
    490,    // ABC / supplier price
    584.5,  // Table right
  ];

  const preparedItems = item.map((entry, index) => {
    const description = wrapText(
      entry.item_details.item_description || "",
      timesRomanFont,
      11,
      241 - TABLE_CONFIG.padding * 2,
    );

    const quantity = wrapText(
      String(entry.item_details.quantity ?? "-"),
      timesRomanFont,
      11,
      26 - TABLE_CONFIG.padding * 2,
    );

    const unit = wrapText(
      entry.item_details.unit || "-",
      timesRomanFont,
      11,
      33 - TABLE_CONFIG.padding * 2,
    );

    const brand = wrapText(
      entry.brand_model || "-",
      timesRomanFont,
      10,
      90 - TABLE_CONFIG.padding * 2,
    );

    const abcValue = Number(entry.item_details.unit_cost ?? 0);

    const abc = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(abcValue);

    const supplierPriceValue = Number(entry.unit_price ?? 0);

    const supplierPrice = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(supplierPriceValue);

    const maxLines = Math.max(
      description.length,
      quantity.length,
      unit.length,
      brand.length,
      1,
    );

    const rowHeight = Math.max(
      TABLE_CONFIG.minRowHeight,
      maxLines * TABLE_CONFIG.lineHeight +
        TABLE_CONFIG.padding * 2,
    );

    return {
      itemNumber: String(index + 1),
      description,
      quantity,
      unit,
      brand,
      abc,
      supplierPrice,
      rowHeight,
    };
  });

  // Divide items into pages based on actual row heights.
  const pageGroups: typeof preparedItems[] = [];
  let currentPage: typeof preparedItems = [];
  let usedHeight = 0;

  const availableHeight =
    TABLE_CONFIG.startY - TABLE_CONFIG.bottomY;

  for (const preparedItem of preparedItems) {
    if (
      currentPage.length > 0 &&
      usedHeight + preparedItem.rowHeight > availableHeight
    ) {
      pageGroups.push(currentPage);
      currentPage = [];
      usedHeight = 0;
    }

    currentPage.push(preparedItem);
    usedHeight += preparedItem.rowHeight;
  }

  if (currentPage.length > 0) {
    pageGroups.push(currentPage);
  }

  // Create and draw each PDF page.
  for (const pageItems of pageGroups) {
    const page = pdfDoc.addPage([615.12, 936]);

    // Draw the existing RFQ header and footer.
    await textandlines(
      pdfDoc,
      page,
      timesBoldFont,
      timesRomanFont,
      timesRomanItalicFont,
      rfq,
    );

    let currentY = TABLE_CONFIG.startY;

    // Draw each dynamically sized row.
    for (const row of pageItems) {
      const rowTop = currentY;
      const rowBottom = rowTop - row.rowHeight;

      // Item number
      drawWrappedCell(
        page,
        [row.itemNumber],
        columnPositions[0],
        rowTop,
        row.rowHeight,
        columnPositions[1] - columnPositions[0],
        timesRomanFont,
        11,
        "center",
      );

      // Item description
      drawWrappedCell(
        page,
        row.description,
        columnPositions[1],
        rowTop,
        row.rowHeight,
        columnPositions[2] - columnPositions[1],
        timesRomanFont,
        11,
      );

      // Quantity
      // Quantity - single line, automatically adjusts font size.
      drawSingleLineCell(
        page,
        row.quantity.join(" "),
        columnPositions[2],
        rowTop,
        row.rowHeight,
        columnPositions[3] - columnPositions[2],
        timesRomanFont,
        11,
        "center",
      );

      // Unit
      drawWrappedCell(
        page,
        row.unit,
        columnPositions[3],
        rowTop,
        row.rowHeight,
        columnPositions[4] - columnPositions[3],
        timesRomanFont,
        11,
        "center",
      );

      // Brand / Model
      drawWrappedCell(
        page,
        row.brand,
        columnPositions[4],
        rowTop,
        row.rowHeight,
        columnPositions[5] - columnPositions[4],
        timesRomanFont,
        10,
        "center",
      );

      // ABC / Unit Cost
      // Unit Cost - single line, automatically adjusts font size.
      drawSingleLineCell(
        page,
        row.abc,
        columnPositions[5],
        rowTop,
        row.rowHeight,
        columnPositions[6] - columnPositions[5],
        timesRomanFont,
        10,
        "right",
      );

      // Supplier quotation price
      // Supplier Price - single line, automatically adjusts font size.
      drawSingleLineCell(
        page,
        row.supplierPrice,
        columnPositions[6],
        rowTop,
        row.rowHeight,
        columnPositions[7] - columnPositions[6],
        timesRomanFont,
        10,
        "right",
      );

      // Draw the bottom border of this row.
      page.drawLine({
        start: { x: columnPositions[0], y: rowBottom },
        end: { x: columnPositions[7], y: rowBottom },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      currentY = rowBottom;
    }

    // Continue normal horizontal row lines through unused table space.
    const NORMAL_ROW_HEIGHT = 14;

    while (currentY - NORMAL_ROW_HEIGHT > TABLE_CONFIG.bottomY) {
      currentY -= NORMAL_ROW_HEIGHT;

      page.drawLine({
        start: { x: columnPositions[0], y: currentY },
        end: { x: columnPositions[7], y: currentY },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
    }

    // The final bottom border is always fixed.
    page.drawLine({
      start: {
        x: columnPositions[0],
        y: TABLE_CONFIG.bottomY,
      },
      end: {
        x: columnPositions[7],
        y: TABLE_CONFIG.bottomY,
      },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    const tableBottom = TABLE_CONFIG.bottomY;

    // Draw table's vertical borders.
    for (const x of columnPositions) {
      page.drawLine({
        start: {
          x,
          y: x === 327 ? 527.5 : 555.5,
        },
        end: {
          x,
          y: tableBottom,
        },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const fixedBuffer = new Uint8Array(pdfBytes).buffer;

  const blob = new Blob([fixedBuffer], {
    type: "application/pdf",
  });

  return URL.createObjectURL(blob);
};

const textandlines = async (
  pdfDoc: PDFDocument,
  page: PDFPage,
  timesBoldFont: PDFFont,
  timesRomanFont: PDFFont,
  timesRomanItalicFont: PDFFont,
  rfq: quotationResponseType,
) => {
  page.drawText("REQUEST FOR QUOTATION", {
    x: 215,
    y: 786,
    size: 14,
    font: timesBoldFont,
  });
  page.drawText("Date:", {
    x: 357.49,
    y: 764.33,
    size: 11,
    font: timesRomanFont,
  });

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  page.drawText(currentDate, {
    x: 395,
    y: 764.33,
    size: 11,
    font: timesRomanFont,
  });

  page.drawText("BAC Resolution No.:", {
    x: 357.49,
    y: 750.33,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("Quotation No.:", {
    x: 357.49,
    y: 736.33,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("Mode of Procurement:", {
    x: 357.49,
    y: 722.33,
    size: 11,
    font: timesRomanFont,
  });

  page.drawText(rfq.purchase_request, {
    x: 430,
    y: 736.33,
    size: 11,
    font: timesRomanFont,
  });

  page.drawLine({
    start: { x: 30.52, y: 720.87 },
    end: { x: 287, y: 720.87 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawText(rfq.supplier_name, {
    x: 32.5,
    y: 725.02,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("Company Name", {
    x: 32.5,
    y: 709.02,
    size: 11,
    font: timesRomanFont,
  });

  page.drawLine({
    start: { x: 30.52, y: 691.27 },
    end: { x: 287, y: 691.27 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawText(rfq.supplier_address, {
    x: 32.5,
    y: 695,
    size: 11,
    font: timesRomanFont,
  });

  page.drawText("Address", { x: 32.5, y: 678, size: 11, font: timesRomanFont });
  page.drawText("TIN:", { x: 32.5, y: 664, size: 11, font: timesRomanFont });
  page.drawText(rfq.tin, { x: 65, y: 665, size: 11, font: timesRomanFont });
  page.drawLine({
    start: { x: 67, y: 663.29 },
    end: { x: 211.81, y: 663.29 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  page.drawText(
    rfq.is_vat ? "[ / ] VAT" : "[  ] VAT",
    {
      x: 230,
      y: 664,
      size: 11,
      font: timesRomanFont,
    },
  );

  page.drawText(
    !rfq.is_vat ? "[ / ] NON-VAT" : "[  ] NON-VAT",
    {
      x: 290,
      y: 664,
      size: 11,
      font: timesRomanFont,
    },
  );
  page.drawText("Sir/Madam:", {
    x: 32.5,
    y: 635,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("Please quote your ", {
    x: 50,
    y: 620,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("lowest price, taxes included, on the item/s listed below ", {
    x: 132,
    y: 620,
    size: 11,
    font: timesRomanItalicFont,
    color: rgb(0, 0, 0.9),
  });
  page.drawText(", starting the shortest time of delivery and submit ", {
    x: 372,
    y: 620,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText(
    "your quotation duly signed by you or your authorized representative. Insert your duly accomplished quotation on the attached ",
    { x: 35, y: 608, size: 11, font: timesRomanFont },
  );
  page.drawText("return envelope and seal the same.", {
    x: 35,
    y: 596,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText(
    "We reserve the right to reject any and/or all bids/quotations submitted.",
    { x: 50, y: 584, size: 11, font: timesRomanFont },
  );

  page.drawText("LEVI U. PANGAN, LPT", {
    x: 420,
    y: 574,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("BAC Chairperson", {
    x: 437,
    y: 560,
    size: 11,
    font: timesRomanFont,
  });

  //Text inside table
  page.drawText("Item", { x: 34, y: 544, size: 11, font: timesBoldFont });
  page.drawText("No.", { x: 37, y: 531, size: 11, font: timesBoldFont });
  page.drawText("Item and Description", {
    x: 127,
    y: 538,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("Qty / Unit", {
    x: 308,
    y: 538,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("Brand/Model", {
    x: 376,
    y: 545,
    size: 10,
    font: timesBoldFont,
    color: rgb(0, 0, 0.9),
  });
  page.drawText("(Offered by Supplier)", {
    x: 362,
    y: 535,
    size: 10,
    font: timesRomanFont,
    color: rgb(0, 0, 0.9),
  });
  // Fixed horizontal lines for the table header and item section.
const fixedHeaderLines = [555, 527, 502];

fixedHeaderLines.forEach((y) => {
  page.drawLine({
    start: { x: 30.52, y },
    end: { x: 584.5, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
});

// Fixed bottom border of the table.
page.drawLine({
  start: { x: 30.52, y: 306 },
  end: { x: 584.5, y: 306 },
  thickness: 1,
  color: rgb(0, 0, 0),
});
  page.drawText("Unit", {
    x: 460,
    y: 545,
    size: 10,
    font: timesBoldFont,
  });
  page.drawText("Price", {
    x: 458,
    y: 535,
    size: 10,
    font: timesBoldFont,
  });
  page.drawText("Total Price Quotation", {
    x: 490.5,
    y: 545,
    size: 10,
    font: timesBoldFont,
  });
  page.drawText("(Offered by Supplier)", {
    x: 493.5,
    y: 535,
    size: 10,
    font: timesRomanFont,
    color: rgb(0, 0, 0.9),
  });
  //text lower
  const deliveryPeriod = rfq.pr_details?.delivery_period_days;
  page.drawText(
    `Delivery Period: ${deliveryPeriod ?? "Not specified"} Days Upon Confirming PO`,
    {
      x: 55,
      y: 291,
      size: 11,
      font: timesRomanFont,
      color: rgb(0, 0, 0.9),
    }
  );
  
  page.drawText("Warranty:", {
    x: 55,
    y: 278,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0.9),
  });
  page.drawLine({
    start: { x: 103, y: 277 },
    end: { x: 250, y: 277 },
    thickness: 1,
    color: rgb(0, 0, 0.9),
  });

  page.drawText("Price validity is 120 days from date of quotation.", {
    x: 55,
    y: 264,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0.9),
  });

  page.drawText(
    "Please be advised that in the event that you will be declared as the Lowest Complying and Responsive Supplier, said items",
    { x: 50, y: 238, size: 11, font: timesRomanFont },
  );
  page.drawText(
    "will be awarded to you subject to submission of the documentary requirements: ",
    { x: 35, y: 225, size: 11, font: timesRomanFont },
  );
  page.drawText("(1)  PHILGEPS   Registration  Certificate;  2.", {
    x: 390,
    y: 225,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0.9),
  });
  page.drawText(
    "Mayor's  Permit;  3.  Income  Tax   Return,  &  4.  Omnibus Sworn Statement. A Notice of Award and Purchase Order will be",
    { x: 35, y: 212, size: 11, font: timesRomanFont, color: rgb(0, 0, 0.9) },
  );
  page.drawText("issued.", {
    x: 35,
    y: 199,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0.9),
  });
  page.drawText("Note: ", {
    x: 50,
    y: 186,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("[ ] Award to the Lowest Complying Supplier shall be on a ", {
    x: 50,
    y: 173,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("LOT ", {
    x: 310,
    y: 173,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0.9),
  });
  page.drawText("basis.", {
    x: 335,
    y: 173,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("[ ] Award Line Item Basis ", {
    x: 50,
    y: 160,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText(
    "After having carefully read and accepted your General Conditions, I/We quote on the item at prices noted above:",
    {
      x: 50,
      y: 147,
      size: 11,
      font: timesRomanFont,
    },
  );

  page.drawText("Canvassed by:", {
    x: 35,
    y: 108,
    size: 11,
    font: timesRomanFont,
  });
  page.drawLine({
    start: { x: 60, y: 82 },
    end: { x: 260, y: 82 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawText("Signature over Printed Name of Canvasser", {
    x: 66,
    y: 69,
    size: 11,
    font: timesRomanFont,
  });

  page.drawLine({
    start: { x: 330, y: 116 },
    end: { x: 584.5, y: 116 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawText("Signature over Printed Name of Supplier", {
    x: 350,
    y: 106,
    size: 11,
    font: timesRomanFont,
  });

  page.drawLine({
    start: { x: 330, y: 81 },
    end: { x: 584.5, y: 81 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawText("Tel. No. / Cellphone No. & Email Address", {
    x: 350,
    y: 71,
    size: 11,
    font: timesRomanFont,
  });

  page.drawLine({
    start: { x: 330, y: 46 },
    end: { x: 584.5, y: 46 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawText("Date", { x: 440, y: 36, size: 11, font: timesRomanFont });

  //Vertical Line
  page.drawLine({
    start: { x: 30.52, y: 555.5 },
    end: { x: 30.52, y: 306 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 60, y: 555.5 },
    end: { x: 60, y: 306 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 301, y: 555.5 },
    end: { x: 301, y: 306 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 327, y: 527.5 },
    end: { x: 327, y: 306 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 360, y: 555.5 },
    end: { x: 360, y: 306 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 450, y: 555.5 },
    end: { x: 450, y: 306 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 490, y: 555.5 },
    end: { x: 490, y: 306 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 584.5, y: 555.5 },
    end: { x: 584.5, y: 306 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  const headerjpg = "/header.jpeg";
  const headerjpgBytes = await fetch(headerjpg).then((res) =>
    res.arrayBuffer(),
  );
  const headerimage = await pdfDoc.embedJpg(headerjpgBytes);
  page.drawImage(headerimage, {
    x: 145,
    y: 808,
    width: 325,
    height: 62,
  });
  page.drawText("Republic of the Philippines", {
    x: 255,
    y: 858,
    size: 10,
    font: timesRomanFont,
  });
  page.drawText("CEBU TECHNOLOGICAL UNIVERSITY", {
    x: 225,
    y: 848,
    size: 9,
    font: timesBoldFont,
  });
  page.drawText("ARGAO CAMPUS", {
    x: 275,
    y: 838,
    size: 10,
    font: timesRomanFont,
  });
  page.drawText("Ed Kintanar Street, Lamacan, Argao Cebu Philippines", {
    x: 220,
    y: 830,
    size: 8,
    font: timesRomanFont,
  });
  page.drawText("Website:", { x: 212, y: 823, size: 7, font: timesRomanFont });
  page.drawText("http://www.argao.ctu.edu.ph ", {
    x: 237,
    y: 823,
    size: 7,
    font: timesRomanFont,
    color: rgb(0, 0, 1),
  });
  page.drawText("E-mail: cdargao@ctu.edu.ph", {
    x: 323,
    y: 823,
    size: 7,
    font: timesRomanFont,
  });
  page.drawText("Phone No.: (032) 401-0737 local 1700", {
    x: 255,
    y: 815,
    size: 7,
    font: timesRomanFont,
  });

  const jpgUrl = "/footer.jpeg";
  const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer());
  const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
  const jpgDims = jpgImage.scale(0.2);

  page.drawImage(jpgImage, {
    x: 145,
    y: 10,
    width: jpgDims.width,
    height: jpgDims.height,
  });
};
