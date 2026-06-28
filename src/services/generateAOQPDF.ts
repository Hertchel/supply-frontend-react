import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { HeaderAndFooter } from "./HeaderAndFooter";
import { supplierItemType_ } from "@/types/response/abstract-of-quotation";
import { BACmemberType } from "@/types/request/BACmember";

/*
//debug grid function
const drawDebugGrid = (page: any) => {
  const { width, height } = page.getSize();

  // Grid spacing
  const step = 15;

  // Vertical lines
  for (let x = 0; x <= width; x += step) {
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: height },
      thickness: x % 100 === 0 ? 0.8 : 0.3,
      color:
        x % 100 === 0
          ? rgb(1, 0, 0) // red major lines
          : rgb(0.85, 0.85, 0.85), // light gray minor lines
      opacity: 0.5,
    });

    // X-axis labels
    page.drawText(`${x}`, {
      x: x + 2,
      y: 2,
      size: 5,
      color: rgb(1, 0, 0),
    });
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += step) {
    page.drawLine({
      start: { x: 0, y },
      end: { x: width, y },
      thickness: y % 100 === 0 ? 0.8 : 0.3,
      color:
        y % 100 === 0
          ? rgb(0, 0, 1) // blue major lines
          : rgb(0.85, 0.85, 0.85),
      opacity: 0.5,
    });

    // Y-axis labels
    page.drawText(`${y}`, {
      x: 2,
      y: y + 2,
      size: 5,
      color: rgb(0, 0, 1),
    });
  }
};
*/

export const generateAOQPDF = async (data: supplierItemType_[], quotationsForPR: any[], bac_members: BACmemberType[]) => {
  const items = Array.isArray(data) ? data : [];

  console.log(
  "ALL SUPPLIERS FOR PR AOQPDF:",
  quotationsForPR
);
const bidder1 = quotationsForPR[0]?.supplier_name ?? "";
const bidder2 = quotationsForPR[1]?.supplier_name ?? "";
const bidder3 = quotationsForPR[2]?.supplier_name ?? "";

console.log("BIDDER 1:", bidder1);
console.log("BIDDER 2:", bidder2);
console.log("BIDDER 3:", bidder3);

  if (items.length === 0) {
    console.error("No data available");
    return null;
  }

  const pdfDoc = await PDFDocument.create();
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesBoldItalicFont = await pdfDoc.embedFont( StandardFonts.TimesRomanBoldItalic );
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const itemsPerPage = 5;
  const pages = Math.ceil(items.length / itemsPerPage);


  for (let pageIndex = 0; pageIndex < pages; pageIndex++) {
    const page = pdfDoc.addPage([936, 612]);
    // drawDebugGrid(page);
    const ROW_HEIGHT = 15;
    const FIRST_ROW_Y = 357;
    const pageItems = items.slice(
      pageIndex * itemsPerPage,
      (pageIndex + 1) * itemsPerPage
    );
    console.log("TOTAL SUPPLIER ITEMS:", data.length);

data.forEach((d, index) => {
  console.log(
    index,
    d.rfq_details?.supplier_name,
    d.item_quotation_details?.unit_price
  );
});


    console.log("FULL AOQ DATA");
    console.log(JSON.stringify(data, null, 2));
    
    pageItems.forEach((item, index) => {
      const rowY = FIRST_ROW_Y - (index * ROW_HEIGHT);
      const numtext = (index + 1).toString() || "";
      const numwidth = timesRomanFont.widthOfTextAtSize(numtext, 11);
      const numplace = (4 + 91.5) / 2;
      page.drawText(numtext, {
        x: numplace - numwidth / 2,
        y: rowY,
        size: 12,
        font: timesRomanFont,
      });
      const itemtext =
        item.item_quotation_details.item_details.item_description || "";
      page.drawText(itemtext, {
        x: 75,
        y: rowY,
        size: 12,
        font: timesRomanFont,
      });
      const quantityText =
        item.item_quantity?.toString() || "";
      page.drawText(quantityText, {
        x: 295,
        y: rowY,
        size: 11,
        font: timesRomanFont,
      });
      const agencypricePriceText =
        item.item_cost.toString() || "";
      page.drawText(agencypricePriceText, {
        x: 355,
        y: rowY,
        size: 12,
        font: timesRomanFont,
      });
      page.drawText(bidder1, {
        x: 425,
        y: rowY,
        size: 10,
        font: timesRomanFont,
      });
      page.drawText(bidder2, {
        x: 545,
        y: rowY,
        size: 10,
        font: timesRomanFont,
      });
      page.drawText(bidder3, {
        x: 665,
        y: rowY,
        size: 10,
        font: timesRomanFont,
      });
      const winningbiddertext = item.rfq_details.supplier_name || "";
      page.drawText(winningbiddertext, {
        x: 715,
        y: rowY,
        size: 12,
        font: timesRomanFont,
      });
      const winningPriceText =
        item.item_quotation_details.unit_price?.toString() || "";
      page.drawText(winningPriceText, {
        x: 425,
        y: rowY,
        size: 12,
        font: timesRomanFont,
      });
    });

    /*
    const verticalLinePositions = [
      29.53, 64.96, 356.14, 415.2, 480.31, 780.38, 898.5,
    ];
    verticalLinePositions.forEach((x) => {
      page.drawLine({
        start: { x, y: 368 },
        end: { x, y: 293 }, // Align to the last row's y-position
        thickness: 1.5,
        color: rgb(0, 0, 0),
      });
    });
    */

    console.log("BAC MEMBERS:", bac_members);
    console.log("BAC MEMBERS LENGTH:", bac_members?.length);
    console.log("DATA:", data);
    console.log(
      "CAMPUS DIRECTOR:",
      data[0]?.supplier_details?.aoq_details?.pr_details?.campus_director_details
    );

  const TABLE_TOP = 368;
  const TOTAL_ROWS = 5;

  for (let i = 0; i <= TOTAL_ROWS; i++) {

    const lineY = TABLE_TOP - (i * ROW_HEIGHT);

    page.drawLine({
      start: { x: 29.53, y: lineY },
      end: { x: 898.98, y: lineY },
      thickness: 1.5,
      color: rgb(0, 0, 0),
    });
  }

      await HeaderAndFooter(
        pdfDoc,
        page,
        timesBoldFont,
        timesRomanFont,
       
        timesBoldFont,
        timesBoldItalicFont,
        bac_members,
        data[0],
        pages
      );
    }

  

  const pdfBytes = await pdfDoc.save();
  const fixedBuffer = new Uint8Array(pdfBytes).buffer;
  const blob = new Blob([fixedBuffer], { type: "application/pdf" });
  //const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const pdfBlobUrl = URL.createObjectURL(blob);
  return pdfBlobUrl;
};
