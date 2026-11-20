
import { PDFDocument, PDFPage, StandardFonts, rgb, PDFFont } from "pdf-lib";
import JsBarcode from "jsbarcode";
import { _itemsDeliveredType } from "@/types/request/purchase-order";

type GeneratedPropertyTag = {
  asset_id: number;
  delivery_id: string;
  unit_number: number;
  property_number: string;
  location: string;
};

type PropertyTagData = {
  propertyNumber: string;
  article: string;
  description: string;
  supplier: string;
  dateAcquired: string;
  amount: number;
  location: string;
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

const PAGE_MARGIN = 24;
const TAG_GAP = 12;
const TAG_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const TAG_HEIGHT =
  (PAGE_HEIGHT - PAGE_MARGIN * 2 - TAG_GAP * 2) / 3;

const TAG_BACKGROUND = rgb(0.68, 0.85, 0.30);
const TAG_BORDER = rgb(0.35, 0.43, 0.19);
const TAG_TEXT = rgb(0.16, 0.22, 0.10);

const formatDate = (value: string | Date) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

const formatAmount = (amount: number) => {
  if (!Number.isFinite(amount)) return "0.00";

  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const drawText = (
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  maxWidth: number,
  color = TAG_TEXT,
) => {
  let output = String(text || "");
  let fontSize = size;

  while (
    output.length > 0 &&
    font.widthOfTextAtSize(output, fontSize) > maxWidth &&
    fontSize > 5
  ) {
    fontSize -= 0.5;
  }

  if (font.widthOfTextAtSize(output, fontSize) > maxWidth) {
    while (
      output.length > 3 &&
      font.widthOfTextAtSize(`${output}...`, fontSize) > maxWidth
    ) {
      output = output.slice(0, -1);
    }

    output += "...";
  }

  page.drawText(output, {
    x,
    y,
    size: fontSize,
    font,
    color,
  });
};

const drawField = (
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  //regularFont: PDFFont,
  boldFont: PDFFont,
) => {
  const labelWidth = 88;

  page.drawText(label.toUpperCase(), {
    x,
    y,
    size: 7.5,
    font: boldFont,
    color: TAG_TEXT,
  });

  const valueX = x + labelWidth;
  const valueWidth = width - labelWidth;

  drawText(
    page,
    value,
    valueX,
    y,
    boldFont,
    9,
    valueWidth - 4,
  );

  page.drawLine({
    start: { x: valueX, y: y - 3 },
    end: { x: x + width, y: y - 3 },
    thickness: 0.6,
    color: TAG_BORDER,
  });
};

const svgToPng = async (path: string): Promise<Uint8Array> => {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error("Unable to load the CTU seal.");
  }

  const svgText = await response.text();

  const svgBlob = new Blob([svgText], {
    type: "image/svg+xml",
  });

  const objectUrl = URL.createObjectURL(svgBlob);

  try {
    const image = new Image();

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("Unable to convert the CTU seal."));
      image.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create the CTU seal image.");
    }

    context.drawImage(image, 0, 0, 512, 512);

    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];

    const binary = atob(base64);

    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const generateBarcode = (propertyNumber: string): Uint8Array => {
  const canvas = document.createElement("canvas");

  JsBarcode(canvas, propertyNumber, {
    format: "CODE128",
    displayValue: false,
    margin: 0,
    width: 2,
    height: 75,
    background: "#dee68c",
    lineColor: "#26351a",
  });

  const base64 = canvas.toDataURL("image/png").split(",")[1];
  const binary = atob(base64);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const drawPropertyTag = async (
  page: PDFPage,
  tag: PropertyTagData,
  sealImage: Awaited<ReturnType<PDFDocument["embedPng"]>>,
  regularFont: PDFFont,
  boldFont: PDFFont,
  pdfDoc: PDFDocument,
  pageIndex: number,
) => {
  const x = PAGE_MARGIN;
  const y =
    PAGE_HEIGHT -
    PAGE_MARGIN -
    TAG_HEIGHT -
    pageIndex * (TAG_HEIGHT + TAG_GAP);

  // Background and outer border
  page.drawRectangle({
    x,
    y,
    width: TAG_WIDTH,
    height: TAG_HEIGHT,
    color: TAG_BACKGROUND,
    borderColor: TAG_BORDER,
    borderWidth: 1.2,
  });

  // Property Tag heading
  const heading = "PROPERTY TAG";
  const headingSize = 23;
  const headingWidth = boldFont.widthOfTextAtSize(
    heading,
    headingSize,
  );

  page.drawText(heading, {
    x: x + (TAG_WIDTH - headingWidth) / 2,
    y: y + TAG_HEIGHT - 62,
    size: headingSize,
    font: boldFont,
    color: TAG_TEXT,
  });

  // Official CTU seal
  page.drawImage(sealImage, {
    x: x + TAG_WIDTH - 57,
    y: y + TAG_HEIGHT - 67,
    width: 45,
    height: 45,
  });

  const leftX = x + 12;
  const leftWidth = 310;

  const rightX = x + 330;
  const rightWidth = TAG_WIDTH - 342;

  const row1 = y + TAG_HEIGHT - 82;
  const row2 = row1 - 21;
  const row3 = row2 - 21;
  const row4 = row3 - 21;

  // Left column
  drawField(
    page,
    "Article",
    tag.article,
    leftX,
    row1,
    leftWidth,
    //regularFont,
    boldFont,
  );

  drawField(
    page,
    "Description",
    tag.description,
    leftX,
    row2,
    leftWidth,
    //regularFont,
    boldFont,
  );

  drawField(
    page,
    "Supplier",
    tag.supplier,
    leftX,
    row3,
    leftWidth,
    //regularFont,
    boldFont,
  );

  drawField(
    page,
    "Date Acquired",
    tag.dateAcquired,
    leftX,
    row4,
    leftWidth,
    //regularFont,
    boldFont,
  );

  // Accountable officer intentionally blank for manual entry.
  page.drawText("ACCOUNTABLE", {
    x: leftX,
    y: row4 - 21,
    size: 7.5,
    font: boldFont,
    color: TAG_TEXT,
  });

  page.drawText("OFFICER", {
    x: leftX,
    y: row4 - 31,
    size: 7.5,
    font: boldFont,
    color: TAG_TEXT,
  });

  page.drawLine({
    start: { x: leftX + 88, y: row4 - 34 },
    end: { x: leftX + leftWidth, y: row4 - 34 },
    thickness: 0.6,
    color: TAG_BORDER,
  });

  // Right column
  // Serial number intentionally blank for manual entry.
  page.drawText("SERIAL NO.:", {
    x: rightX,
    y: row3,
    size: 8,
    font: boldFont,
    color: TAG_TEXT,
  });

  page.drawLine({
    start: { x: rightX + 65, y: row3 - 3 },
    end: { x: x + TAG_WIDTH - 12, y: row3 - 3 },
    thickness: 0.6,
    color: TAG_BORDER,
  });

  page.drawText("AMOUNT:", {
    x: rightX,
    y: row4,
    size: 8,
    font: boldFont,
    color: TAG_TEXT,
  });

  const amountText = formatAmount(tag.amount);
  const amountWidth = boldFont.widthOfTextAtSize(amountText, 9);

  page.drawText(amountText, {
    x: x + TAG_WIDTH - 14 - amountWidth,
    y: row4,
    size: 9,
    font: boldFont,
    color: TAG_TEXT,
  });

  page.drawLine({
    start: { x: rightX + 65, y: row4 - 3 },
    end: { x: x + TAG_WIDTH - 12, y: row4 - 3 },
    thickness: 0.6,
    color: TAG_BORDER,
  });

  page.drawText("LOCATION:", {
    x: rightX,
    y: row4 - 21,
    size: 8,
    font: boldFont,
    color: TAG_TEXT,
  });

  drawText(
    page,
    tag.location,
    rightX + 65,
    row4 - 20,
    boldFont,
    9,
    rightWidth - 65,
  );

  page.drawLine({
    start: { x: rightX + 65, y: row4 - 24 },
    end: { x: x + TAG_WIDTH - 12, y: row4 - 24 },
    thickness: 0.6,
    color: TAG_BORDER,
  });

  // Barcode
  const barcodeBytes = generateBarcode(tag.propertyNumber);
  const barcodeImage = await pdfDoc.embedPng(barcodeBytes);

  const barcodeWidth = 360;
  const barcodeHeight = 40;

  page.drawImage(barcodeImage, {
    x: x + (TAG_WIDTH - barcodeWidth) / 2,
    y: y + 17,
    width: barcodeWidth,
    height: barcodeHeight,
  });

  // Human-readable property number
  const propertyNumberSize = 10;
  const propertyNumberWidth = regularFont.widthOfTextAtSize(
    tag.propertyNumber,
    propertyNumberSize,
  );

  page.drawText(tag.propertyNumber, {
    x: x + (TAG_WIDTH - propertyNumberWidth) / 2,
    y: y + 5,
    size: propertyNumberSize,
    font: regularFont,
    color: TAG_TEXT,
  });
};

export const generatePropertyTagPDF = async (
  generatedTags: GeneratedPropertyTag[],
  selectedItems: _itemsDeliveredType[],
): Promise<string> => {
  if (!generatedTags.length) {
    throw new Error("No property tags are available for printing.");
  }

  const pdfDoc = await PDFDocument.create();

  const regularFont = await pdfDoc.embedFont(
    StandardFonts.Helvetica,
  );

  const boldFont = await pdfDoc.embedFont(
    StandardFonts.HelveticaBold,
  );

  const sealBytes = await svgToPng(
    "/CTU_new_logotransparent.svg",
  );

  const sealImage = await pdfDoc.embedPng(sealBytes);

  // Match each generated tag with its delivered equipment.
  const itemMap = new Map(
    selectedItems.map((item) => [item.delivery_id, item]),
  );

  const tags: PropertyTagData[] = generatedTags.map((generated) => {
    const item = itemMap.get(generated.delivery_id);

    if (!item) {
      throw new Error(
        `Delivered item ${generated.delivery_id} was not found.`,
      );
    }

    const itemDetails =
      item.item_details.item_quotation_details.item_details;

    const brandModel =
      item.item_details.item_quotation_details.brand_model || "";

    return {
      propertyNumber: generated.property_number,

      // Current item_description is used as Article.
      article: itemDetails.item_description || "",

      // Brand/model is used as Description.
      description: brandModel,

      supplier:
        item.inspection_details.po_details.rfq_details.supplier_name || "",

      dateAcquired: formatDate(item.date_received),

      // Each physical unit receives its own unit cost.
      amount: Number(item.item_details.item_cost),

      location: generated.location,
    };
  });

  // Three labels per short-bond-paper page.
  for (let index = 0; index < tags.length; index++) {
    if (index % 3 === 0) {
      pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    }

    const page = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];

    await drawPropertyTag(
      page,
      tags[index],
      sealImage,
      regularFont,
      boldFont,
      pdfDoc,
      index % 3,
    );
  }

  const pdfBytes = await pdfDoc.save();
  const fixedBuffer = new Uint8Array(pdfBytes).buffer;
  const blob = new Blob([fixedBuffer], { type: "application/pdf" });

  return URL.createObjectURL(blob);
};
