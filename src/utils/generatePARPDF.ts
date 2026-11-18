
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { User } from "@/components/Auth/AuthStore";
import { _itemsDeliveredType } from "@/types/request/purchase-order";

type PARItem = {
  quantity: number;
  unit: string;
  description: string;
  propertyNumber: string;
  amount: number;
};

type PARGroup = {
  poNo: string;
  fundCluster: string;
  purpose: string;
  requisitionerName: string;
  requisitionerPosition: string;
  items: PARItem[];
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

const LEFT = 37;
const RIGHT = 570;
const TABLE_TOP = 590;
const TABLE_HEADER_BOTTOM = 544;
const TABLE_BOTTOM = 255;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
    date.getDate(),
  ).padStart(2, "0")}/${date.getFullYear()}`;

const wrapText = (
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (
      currentLine &&
      font.widthOfTextAtSize(testLine, fontSize) > maxWidth
    ) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines.length ? lines : [""];
};

export const generatePARPDF = async (
  itemData: _itemsDeliveredType[],
  user: User | null,
): Promise<string> => {
  const pdfDoc = await PDFDocument.create();

  const regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Only include delivered items with an individual total value
  // greater than ₱50,000.
  const qualifiedItems = itemData.filter((item) => {
    const quantity = Number(item.quantity_delivered);
    const unitCost = Number(item.item_details.item_cost);

    return (
      Number.isFinite(quantity) &&
      Number.isFinite(unitCost) &&
      quantity > 0 &&
      quantity * unitCost > 50000
    );
  });

  if (qualifiedItems.length === 0) {
    throw new Error(
      "No delivered items have a total value greater than ₱50,000.",
    );
  }

  // Group qualifying items by purchase order.
  const groupedData = new Map<string, PARGroup>();

  qualifiedItems.forEach((data) => {
    const po = data.inspection_details.po_details;
    const poNo = po.po_no;

    const itemDetails =
      data.item_details.item_quotation_details.item_details;

    const item: PARItem = {
      quantity: Number(data.quantity_delivered),
      unit: itemDetails.unit || "",
      description: itemDetails.item_description || "",
      propertyNumber: itemDetails.stock_property_no || "",
      amount:
        Number(data.quantity_delivered) *
        Number(data.item_details.item_cost),
    };

    if (!groupedData.has(poNo)) {
      groupedData.set(poNo, {
        poNo,
        fundCluster: po.pr_details.fund_cluster || "",
        purpose: po.pr_details.purpose || "",
        requisitionerName: po.pr_details.requisitioner_details.name || "",
        requisitionerPosition: po.pr_details.requisitioner_details.designation || "",
        items: [],
      });
    }

    groupedData.get(poNo)!.items.push(item);
  });

  const headerBytes = await fetch("/header.jpeg").then((res) => {
    if (!res.ok) throw new Error("Unable to load CTU header image.");
    return res.arrayBuffer();
  });

  const footerBytes = await fetch("/footer.jpeg").then((res) => {
    if (!res.ok) throw new Error("Unable to load CTU footer image.");
    return res.arrayBuffer();
  });

  const headerImage = await pdfDoc.embedJpg(headerBytes);
  const footerImage = await pdfDoc.embedJpg(footerBytes);

  const currentDate = new Date();
  const formattedDate = formatDate(currentDate);

  const issuerName = user
    ? `${user.first_name} ${user.last_name}`.trim()
    : "";

  const issuerPosition = user?.role || "Supply Officer";

  const drawPageHeader = (
    page: PDFPage,
    group: PARGroup,
    isContinuation: boolean,
  ) => {
    // Institutional header
    page.drawImage(headerImage, {
      x: 145,
      y: 700,
      width: 325,
      height: 62,
    });

    page.drawText("Republic of the Philippines", {
      x: 255,
      y: 750,
      size: 10,
      font: regularFont,
    });

    page.drawText("CEBU TECHNOLOGICAL UNIVERSITY", {
      x: 225,
      y: 740,
      size: 9,
      font: boldFont,
    });

    page.drawText("ARGAO CAMPUS", {
      x: 275,
      y: 730,
      size: 10,
      font: regularFont,
    });
    // Campus contact information
    page.drawText("Ed Kintanar Street, Lamacan, Argao Cebu Philippines", {
    x: 220,
    y: 720,
    size: 8,
    font: regularFont,
    });

    page.drawText("Website:", {
    x: 212,
    y: 710,
    size: 7,
    font: regularFont,
    });

    page.drawText("http://www.argao.ctu.edu.ph", {
    x: 237,
    y: 710,
    size: 7,
    font: regularFont,
    color: rgb(0, 0, 1),
    });

    page.drawText("E-mail: cdargao@ctu.edu.ph", {
    x: 323,
    y: 710,
    size: 7,
    font: regularFont,
    });

    page.drawText("Phone No.: (032) 401-0737 local 1700", {
    x: 255,
    y: 700,
    size: 7,
    font: regularFont,
    });

    page.drawText("SUPPLY AND PROPERTY MANAGEMENT OFFICE", {
      x: 176,
      y: 685,
      size: 11,
      font: helveticaFont,
    });

    page.drawText("PROPERTY ACKNOWLEDGMENT RECEIPT", {
      x: 155,
      y: 653,
      size: 15,
      font: boldFont,
    });

    page.drawText("Entity Name:", {
      x: 40,
      y: 620,
      size: 11,
      font: boldFont,
    });

    page.drawText("CTU - ARGAO CAMPUS", {
      x: 108,
      y: 620,
      size: 11,
      font: regularFont,
    });

    page.drawText("Fund Cluster:", {
      x: 40,
      y: 600,
      size: 11,
      font: boldFont,
    });

    page.drawText(group.fundCluster, {
      x: 110,
      y: 600,
      size: 10,
      font: regularFont,
    });

    page.drawText("PAR No.:", {
      x: 422,
      y: 600,
      size: 11,
      font: boldFont,
    });

    page.drawText(group.poNo, {
      x: 470,
      y: 600,
      size: 10,
      font: regularFont,
    });

    if (isContinuation) {
      page.drawText("(Continued)", {
        x: 255,
        y: 575,
        size: 10,
        font: italicFont,
      });
    }

    // Table borders and header
    // Top border
    page.drawLine({
    start: { x: LEFT, y: TABLE_TOP },
    end: { x: RIGHT, y: TABLE_TOP },
    thickness: 1.5,
    color: rgb(0, 0, 0),
    });

    // Header bottom border
    page.drawLine({
    start: { x: LEFT, y: TABLE_HEADER_BOTTOM },
    end: { x: RIGHT, y: TABLE_HEADER_BOTTOM },
    thickness: 1,
    color: rgb(0, 0, 0),
    });

    // Bottom border
    page.drawLine({
    start: { x: LEFT, y: TABLE_BOTTOM },
    end: { x: RIGHT, y: TABLE_BOTTOM },
    thickness: 1.5,
    color: rgb(0, 0, 0),
    });

    // Column headers
    const drawHeaderCentered = (text: string, center: number, y: number) => {
    const width = boldFont.widthOfTextAtSize(text, 9);

    page.drawText(text, {
        x: center - width / 2,
        y,
        size: 9,
        font: boldFont,
    });
    };

    drawHeaderCentered("Quantity", 63, 562);
    drawHeaderCentered("Unit", 110, 562);

    // Description uses left alignment, matching item descriptions.
    page.drawText("Description", {
    x: 134,
    y: 562,
    size: 9,
    font: boldFont,
    });

    // Property Number
    drawHeaderCentered("Property", 407.5, 568);
    drawHeaderCentered("Number", 407.5, 556);

    // Date Acquired
    drawHeaderCentered("Date", 477.5, 568);
    drawHeaderCentered("Acquired", 477.5, 556);

    // Amount
    drawHeaderCentered("Amount", 540, 562);

    // Vertical table borders
    [37, 90, 130, 370, 445, 510, 570].forEach((x) => {
    page.drawLine({
        start: { x, y: TABLE_TOP },
        end: { x, y: TABLE_BOTTOM },
        thickness: 0.8,
        color: rgb(0, 0, 0),
    });
    });

    // Supplier information centered within Description column
    const descriptionCenter = (130 + 370) / 2;

    const supplierText =
    "FASTCACHE INFORMATION TECHNOLOGY SOLUTIONS";

    const supplierTextWidth = italicFont.widthOfTextAtSize(
    supplierText,
    9,
    );

    page.drawText(supplierText, {
    x: descriptionCenter - supplierTextWidth / 2,
    y: 270,
    size: 8,
    font: italicFont,
    color: rgb(0.65, 0.25, 0.25),
    });

    const checkText = "Check #";
    const checkTextWidth = regularFont.widthOfTextAtSize(checkText, 9);

    page.drawText(checkText, {
    x: descriptionCenter - checkTextWidth / 2,
    y: 258,
    size: 8,
    font: regularFont,
    color: rgb(0.65, 0.25, 0.25),
    });
    // Check number writing line
    page.drawLine({
    start: { x: descriptionCenter + 20, y: 260 },
    end: { x: 340, y: 260 },
    thickness: 0.7,
    color: rgb(0.65, 0.25, 0.25),
    });
  };

  
const drawSignatures = (
  page: PDFPage,
  group: PARGroup,
) => {
  const leftCenter = (LEFT + 337) / 2;
  const rightCenter = (337 + RIGHT) / 2;

  const drawCentered = (
    text: string,
    center: number,
    y: number,
    font: PDFFont,
    size: number,
  ) => {
    const width = font.widthOfTextAtSize(text, size);

    page.drawText(text, {
      x: center - width / 2,
      y,
      size,
      font,
    });

    return {
      start: center - width / 2,
      end: center + width / 2,
    };
  };

  // Section labels
  page.drawText("Received by:", {
    x: 40,
    y: 243,
    size: 10,
    font: helveticaFont,
  });

  page.drawText("Issued by:", {
    x: 340,
    y: 243,
    size: 10,
    font: helveticaFont,
  });

  // Printed names
  const received = drawCentered(
    group.requisitionerName.toUpperCase(),
    leftCenter,
    215,
    boldFont,
    10,
  );

  const issued = drawCentered(
    issuerName.toUpperCase(),
    rightCenter,
    215,
    boldFont,
    10,
  );

  // Signature lines
  page.drawLine({
    start: { x: received.start, y: 213 },
    end: { x: received.end, y: 213 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  page.drawLine({
    start: { x: issued.start, y: 213 },
    end: { x: issued.end, y: 213 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // Signature descriptions
  drawCentered(
    "Signature over Printed Name of End User",
    leftCenter,
    198,
    regularFont,
    9,
  );

  drawCentered(
    "Signature over Printed Name of Supply and/or Property",
    rightCenter,
    198,
    regularFont,
    9,
  );

  drawCentered(
    "Custodian",
    rightCenter,
    187,
    regularFont,
    9,
  );

  // Positions
const receivedPosition = drawCentered(
  group.requisitionerPosition,
  leftCenter,
  174,
  boldFont,
  10,
);

const issuedPosition = drawCentered(
  issuerPosition,
  rightCenter,
  174,
  boldFont,
  10,
);

// Lines directly below position/designation
[receivedPosition, issuedPosition].forEach((position) => {
  page.drawLine({
    start: { x: position.start, y: 172 },
    end: { x: position.end, y: 172 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
});

drawCentered("Position/Office", leftCenter, 159, regularFont, 9);
drawCentered("Position/Office", rightCenter, 159, regularFont, 9);

// Dates
const receivedDate = drawCentered(
  formattedDate,
  leftCenter,
  140,
  regularFont,
  10,
);

const issuedDate = drawCentered(
  formattedDate,
  rightCenter,
  140,
  regularFont,
  10,
);

// Lines directly below dates
[receivedDate, issuedDate].forEach((date) => {
  page.drawLine({
    start: { x: date.start, y: 138 },
    end: { x: date.end, y: 138 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
});

drawCentered("Date", leftCenter, 128, regularFont, 9);
drawCentered("Date", rightCenter, 128, regularFont, 9);

  // Signature section borders
  page.drawLine({
    start: { x: LEFT, y: 255 },
    end: { x: RIGHT, y: 255 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  [LEFT, 337, RIGHT].forEach((x) => {
    page.drawLine({
      start: { x, y: 255 },
      end: { x, y: 115 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
  });

  page.drawLine({
    start: { x: LEFT, y: 115 },
    end: { x: RIGHT, y: 115 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });

  // Purpose and Purchase Order Number
  page.drawText("Purpose:", {
    x: 85,
    y: 96,
    size: 9,
    font: regularFont,
  });

  const purposeLines = wrapText(
    group.purpose,
    regularFont,
    9,
    450,
  );

  purposeLines.forEach((line, index) => {
    page.drawText(line, {
      x: 128,
      y: 96 - index * 11,
      size: 9,
      font: italicFont,
    });
  });

  page.drawText("PO No.:", {
    x: 85,
    y: 74,
    size: 9,
    font: regularFont,
  });

  page.drawText(group.poNo, {
    x: 128,
    y: 74,
    size: 9,
    font: regularFont,
  });

  // Footer
  const footerDimensions = footerImage.scale(0.2);

  page.drawImage(footerImage, {
    x: (PAGE_WIDTH - footerDimensions.width) / 2,
    y: 20,
    width: footerDimensions.width,
    height: footerDimensions.height,
  });
};


  const drawItemRow = (
    page: PDFPage,
    item: PARItem,
    y: number,
  ): number => {
    const descriptionLines = wrapText(
      item.description,
      regularFont,
      9,
      232,
    );

    const propertyLines = wrapText(
      item.propertyNumber,
      regularFont,
      8,
      69,
    );

    const rowHeight = Math.max(
      25,
      descriptionLines.length * 11 + 8,
      propertyLines.length * 10 + 8,
    );

    const textY = y - 16;

    const drawCenteredText = (
      text: string,
      center: number,
      baseline: number,
      font: PDFFont,
      size: number,
    ) => {
      const width = font.widthOfTextAtSize(text, size);

      page.drawText(text, {
        x: center - width / 2,
        y: baseline,
        size,
        font,
      });
    };

    drawCenteredText(
      String(item.quantity),
      63,
      textY,
      regularFont,
      9,
    );

    drawCenteredText(
      item.unit,
      110,
      textY,
      regularFont,
      9,
    );

    descriptionLines.forEach((line, index) => {
      page.drawText(line, {
        x: 134,
        y: textY - index * 11,
        size: 9,
        font: regularFont,
      });
    });

    propertyLines.forEach((line, index) => {
      page.drawText(line, {
        x: 373,
        y: textY - index * 10,
        size: 8,
        font: regularFont,
      });
    });

    drawCenteredText(
      formattedDate,
      477,
      textY,
      regularFont,
      8,
    );

    const amountText = formatCurrency(item.amount);
    const amountWidth = regularFont.widthOfTextAtSize(amountText, 9);

    page.drawText(amountText, {
      x: 566 - amountWidth,
      y: textY,
      size: 9,
      font: regularFont,
    });

    return y - rowHeight;
  };

  // Generate a separate PAR section for each purchase order.
  for (const group of groupedData.values()) {
    // Pre-calculate item row heights and split them across pages.
    const chunks: PARItem[][] = [];
    let currentChunk: PARItem[] = [];
    let currentHeight = 0;

    group.items.forEach((item) => {
      const descriptionLines = wrapText(
        item.description,
        regularFont,
        9,
        232,
      );

      const propertyLines = wrapText(
        item.propertyNumber,
        regularFont,
        8,
        69,
      );

      const rowHeight = Math.max(
        25,
        descriptionLines.length * 11 + 8,
        propertyLines.length * 10 + 8,
      );

      if (
        currentHeight + rowHeight >
        TABLE_HEADER_BOTTOM - 285 - 10
      ) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentHeight = 0;
      }

      currentChunk.push(item);
      currentHeight += rowHeight;
    });

    if (currentChunk.length) {
      chunks.push(currentChunk);
    }

    chunks.forEach((chunk, index) => {
      const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      const isLastPage = index === chunks.length - 1;

      drawPageHeader(page, group, index > 0);

      let yPosition = TABLE_HEADER_BOTTOM;

      chunk.forEach((item) => {
        yPosition = drawItemRow(page, item, yPosition);
      });

      if (isLastPage) {
        drawSignatures(page, group);
      } else {
        page.drawText("Continued on next page", {
          x: 410,
          y: 250,
          size: 9,
          font: italicFont,
        });

        const footerDimensions = footerImage.scale(0.2);

        page.drawImage(footerImage, {
          x: (PAGE_WIDTH - footerDimensions.width) / 2,
          y: 40,
          width: footerDimensions.width,
          height: footerDimensions.height,
        });
      }
    });
  }

  const pdfBytes = await pdfDoc.save();
  const fixedBuffer = new Uint8Array(pdfBytes).buffer;
  const blob = new Blob([fixedBuffer], { type: "application/pdf" });
  return URL.createObjectURL(blob);
};
