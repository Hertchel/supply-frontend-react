import ExcelJS from "exceljs";

import { supplierItemType_ } from "@/types/response/abstract-of-quotation";
import { BACmemberType } from "@/types/request/BACmember";

export const generateAOQPDF = async (
  data: supplierItemType_[],
  quotationsForPR: any[],
  bac_members: BACmemberType[],
) => {
  const items = Array.isArray(data) ? data : [];
  const quotations = Array.isArray(quotationsForPR) ? quotationsForPR : [];

  if (items.length === 0) {
    console.error("No data available");
    return null;
  }

  // ============================================================
  // DATA PROCESSING
  // ============================================================

  const firstItem = items[0];

  const prDetails = firstItem?.supplier_details?.aoq_details?.pr_details;

  const endUser = prDetails?.requisitioner_details?.name ?? "";

  const now = new Date();

  const dateTime = now.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Unique suppliers
  const uniqueBidders = quotations.filter(
    (bidder, index, self) =>
      index === self.findIndex((b) => b.supplier_name === bidder.supplier_name),
  );

  const bidder1 = uniqueBidders[0]?.supplier_name ?? "";
  const bidder2 = uniqueBidders[1]?.supplier_name ?? "";
  const bidder3 = uniqueBidders[2]?.supplier_name ?? "";
  const bidder4 = uniqueBidders[3]?.supplier_name ?? "";

  // ============================================================
  // FIND LOWEST SUPPLIER
  // ============================================================

  const lowestSupplier = items.reduce((lowest, current) => {
    const currentPrice = Number(
      current.item_quotation_details?.unit_price ?? 0,
    );

    const lowestPrice = Number(lowest.item_quotation_details?.unit_price ?? 0);

    return currentPrice < lowestPrice ? current : lowest;
  }, items[0]);

  const lowestSupplierName = lowestSupplier?.supplier_details?.name ?? "";

  /*const lowestSupplierPrice = Number(
    lowestSupplier?.item_quotation_details?.unit_price ?? 0,
  );*/

  // ============================================================
  // APPROVED BUDGET
  // ============================================================

  const approvedBudget = items.reduce(
    (total, item) => total + Number(item.total_amount || 0),
    0,
  );

  // ============================================================
  // CREATE WORKBOOK
  // ============================================================

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "CTU Procurement System";
  workbook.lastModifiedBy = "CTU Procurement System";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Abstract of Quotations");

  // ============================================================
  // PAGE SETUP
  // ============================================================

  worksheet.pageSetup = {
    paperSize: 9,
    orientation: "landscape",

    fitToPage: false,
    fitToWidth: 0,
    fitToHeight: 0,

    horizontalDpi: 300,
    verticalDpi: 300,

    margins: {
      left: 0.393700787401575,
      right: 0.393700787401575,
      top: 1.49606299212598,
      bottom: 0.708661417322835,
      header: 0.31496062992126,
      footer: 0.196850393700787,
    },
  };
  worksheet.properties.defaultRowHeight = 11.25;
  worksheet.pageSetup.horizontalCentered = false;

  // ============================================================
  // COLUMN WIDTHS - A TO M
  // ============================================================

  worksheet.columns = [
    { key: "no", width: 5 },
    { key: "item", width: 38 },
    { key: "quantity", width: 9 },
    { key: "unit", width: 8 },
    { key: "agencyPrice", width: 13 },

    { key: "bidder1", width: 18 },
    { key: "bidder2", width: 18 },
    { key: "bidder3", width: 18 },

    { key: "winningBidder", width: 28 },

    { key: "supplier1", width: 16 },
    { key: "supplier2", width: 16 },
    { key: "supplier3", width: 16 },
    { key: "supplier4", width: 16 },
  ];
  // ============================================================
  // VERTICAL PAGE BREAK BETWEEN I AND J
  // ============================================================

  const worksheetModel = worksheet.model as any;

  worksheetModel.pageSetup = worksheetModel.pageSetup || {};

  worksheetModel.pageSetup.fitToPage = false;

  // Add vertical page break before column J
  worksheetModel.pageBreaks = {
    rowBreaks: [],
    colBreaks: [
      {
        id: 10,
        max: 16383,
      },
    ],
  };

  // ============================================================
  // COLORS AND STYLES
  // ============================================================

  const GREEN = "C6EFCE";
  const BLACK = "000000";
  //const RED = "FF0000";
  const BLUE = "0000FF";

  const border = {
    top: {
      style: "thin" as const,
      color: { argb: BLACK },
    },
    bottom: {
      style: "thin" as const,
      color: { argb: BLACK },
    },
    left: {
      style: "thin" as const,
      color: { argb: BLACK },
    },
    right: {
      style: "thin" as const,
      color: { argb: BLACK },
    },
  };

  const normalFont = {
    name: "Tahoma",
    size: 9,
  };

  const boldFont = {
    name: "Tahoma",
    size: 9,
    bold: true,
  };
  const centered = {
    horizontal: "center",
    vertical: "middle",
  } as const;

  const moneyFormat = "₱#,##0.00";

  // ============================================================
  // TITLE
  // ============================================================

  worksheet.mergeCells("A1:I1");

  worksheet.getCell("A1").value = "ABSTRACT OF QUOTATIONS";

  worksheet.getCell("A1").font = {
    name: "Tahoma",
    size: 12,
    bold: true,
  };

  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.getRow(1).height = 18;

  // ============================================================
  // PROJECT INFORMATION
  // ============================================================

  // Information formatting
  for (let row = 2; row <= 6; row++) {
    const leftLabel = worksheet.getCell(`B${row}`);
    const rightLabel = worksheet.getCell(`H${row}`);

    const leftValue = worksheet.getCell(`C${row}`);
    const rightValue = worksheet.getCell(`I${row}`);

    leftLabel.font = normalFont;
    rightLabel.font = normalFont;

    leftValue.font = normalFont;
    rightValue.font = normalFont;

    leftLabel.alignment = {
      horizontal: "right",
      vertical: "middle",
    };

    rightLabel.alignment = {
      horizontal: "right",
      vertical: "middle",
    };

    leftValue.alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };

    rightValue.alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };
    worksheet.getRow(row).height = 13.25;
  }
  worksheet.getCell("C2").font = {
    name: "Tahoma",
    size: 9,
    bold: true,
  };

  worksheet.getCell("C6").font = {
    name: "Tahoma",
    size: 9,
    bold: true,
  };

  worksheet.getCell("H6").font = {
    name: "Tahoma",
    size: 9,
    bold: true,
    color: { argb: BLUE },
  };
  worksheet.getCell("I6").font = {
    name: "Tahoma",
    size: 9,
    bold: true,
    color: { argb: BLUE },
  };

  // Left side
  worksheet.getCell("B2").value = "Project Name:";
  worksheet.getCell("B3").value = "Date of Posting:";
  worksheet.getCell("B4").value = "Project Location:";
  worksheet.getCell("B5").value = "Implementing Office:";
  worksheet.getCell("B6").value = "Approved Budget:";

  //project name text wrap
  const projectName = String(prDetails?.purpose ?? "");

  worksheet.getCell("C2").value = projectName;

  const projectNameWidth =
    worksheet.getColumn("C").width! +
    worksheet.getColumn("D").width! +
    worksheet.getColumn("E").width! +
    worksheet.getColumn("F").width! +
    worksheet.getColumn("G").width!;

  const estimatedLines = Math.ceil(
    projectName.length / (projectNameWidth * 1.5), //the 1.5 is the estimation for the width of the font, per character.
  );

  switch (estimatedLines) {
    case 1:
      worksheet.getRow(2).height = 21;
      break;
    case 2:
      worksheet.getRow(2).height = 23.5;
      break;
    case 3:
      worksheet.getRow(2).height = 36;
      break;
  }

  //worksheet.getRow(2).height = Math.max(21, estimatedLines * 15);
  worksheet.getCell("C2").alignment = {
    horizontal: "left",
    vertical: "middle",
    wrapText: true,
  };

  worksheet.getCell("C3").value = prDetails?.created_at ?? "";
  worksheet.getRow(3).height = 14.25;

  worksheet.getCell("C4").value = "Lamacan, Argao, Cebu";

  worksheet.getCell("C5").value = prDetails?.office ?? "";

  worksheet.getCell("C6").value = approvedBudget;
  worksheet.getCell("C6").numFmt = moneyFormat;

  // Merge left values
  worksheet.mergeCells("C2:G2");
  worksheet.mergeCells("C3:G3");
  worksheet.mergeCells("C4:G4");
  worksheet.mergeCells("C5:G5");
  worksheet.mergeCells("C6:G6");

  // Right side
  worksheet.getCell("H2").value = "# of Sheets:";
  worksheet.getCell("H2").alignment = {
    horizontal: "right",
    vertical: "bottom",
  };
  worksheet.getCell("H3").value = "Award Resolution No.:";
  worksheet.getCell("H4").value = "Date & Time:";
  worksheet.getCell("H5").value = "Mode of Procurement:";
  worksheet.getCell("H6").value = "PR/Control No.:";

  worksheet.getCell("I2").value = 1;
  worksheet.getCell("I2").alignment = {
    horizontal: "left",
    vertical: "bottom",
  };
  worksheet.getCell("I3").value = "N/A";
  worksheet.getCell("I4").value = dateTime;
  worksheet.getCell("I5").value = "34-Small Value Procurement";

  worksheet.getCell("I6").value = prDetails?.pr_no ?? "";
  worksheet.getRow(7).height = 7.5;

  // ============================================================
  // TABLE HEADER
  // ============================================================

  const headerRow = 8;
  const secondHeaderRow = 9;
  worksheet.getRow(headerRow).height = 15.5;
  worksheet.getRow(secondHeaderRow).height = 15.5;

  // Vertical merged headers
  ["A", "B", "C", "D", "E", "I", "J", "K", "L", "M"].forEach((column) => {
    worksheet.mergeCells(`${column}${headerRow}:${column}${secondHeaderRow}`);
  });

  // Main headers
  worksheet.getCell(`A${headerRow}`).value = "No.";
  worksheet.getCell(`B${headerRow}`).value = "Items";
  worksheet.getCell(`C${headerRow}`).value = "Quantity";
  worksheet.getCell(`D${headerRow}`).value = "Unit";
  worksheet.getCell(`E${headerRow}`).value = "Agency Price";

  worksheet.getCell(`F${headerRow}`).value = "BIDDER 1";
  worksheet.getCell(`G${headerRow}`).value = "BIDDER 2";
  worksheet.getCell(`H${headerRow}`).value = "BIDDER 3";

  worksheet.getCell(`I${headerRow}`).value = "WINNING BIDDER";

  // Bidder names
  worksheet.getCell(`F${secondHeaderRow}`).value = bidder1;
  worksheet.getCell(`G${secondHeaderRow}`).value = bidder2;
  worksheet.getCell(`H${secondHeaderRow}`).value = bidder3;

  // Supplier summary headers
  worksheet.getCell(`J${headerRow}`).value = bidder1;
  worksheet.getCell(`K${headerRow}`).value = bidder2;
  worksheet.getCell(`L${headerRow}`).value = bidder3;
  worksheet.getCell(`M${headerRow}`).value = bidder4;

  // Format headers
  for (let row = headerRow; row <= secondHeaderRow; row++) {
    for (let col = 1; col <= 9; col++) {
      const cell = worksheet.getCell(row, col);

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: GREEN,
        },
      };

      cell.font = {
        name: "Tahoma",
        size: 9,
        bold: true,
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      cell.border = border;
    }
  }
  for (let row = headerRow; row <= secondHeaderRow; row++) {
    for (let col = 10; col <= 13; col++) {
      const cell = worksheet.getCell(row, col);

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: GREEN,
        },
      };

      cell.font = {
        name: "Tahoma",
        size: 9,
        bold: true,
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
    }
  }

  worksheet.getRow(headerRow).height = 35;
  worksheet.getRow(secondHeaderRow).height = 40;

  // ============================================================
  // HELPER: FIND QUOTATIONS FOR AN ITEM
  // ============================================================

  const getItemQuotations = (item: supplierItemType_) => {
    const itemDescription =
      item.item_quotation_details?.item_details?.item_description;

    const itemNo = item.item_quotation_details?.item_details?.item_no;

    return quotations.filter((quotation) => {
      return (
        quotation.item_description === itemDescription ||
        quotation.item_id === itemNo
      );
    });
  };

  // ============================================================
  // HELPER: SUPPLIER ITEM TOTAL
  // ============================================================

  /*const getQuotationAmount = (quotation: any) => {
    if (quotation?.total_amount != null) {
      return Number(quotation.total_amount);
    }

    const unitPrice = Number(quotation?.unit_price ?? 0);
    const quantity = Number(
      quotation?.quantity ?? quotation?.item_quantity ?? 1,
    );

    return unitPrice * quantity;
  };*/

  // ============================================================
  // ITEMS
  // ============================================================

  const firstItemRow = 10;

  items.forEach((item, index) => {
    const rowNumber = firstItemRow + index;

    const itemQuotations = getItemQuotations(item);

    // Basic information
    worksheet.getCell(`A${rowNumber}`).value = index + 1;

    worksheet.getCell(`B${rowNumber}`).value =
      item.item_quotation_details?.item_details?.item_description ?? "";

    worksheet.getCell(`C${rowNumber}`).value = item.item_quantity ?? "";

    worksheet.getCell(`D${rowNumber}`).value = "unit";

    worksheet.getCell(`E${rowNumber}`).value = Number(item.item_cost ?? 0);

    worksheet.getCell(`E${rowNumber}`).numFmt = moneyFormat;

    // Find bidder quotations
    const bidder1Quotation = itemQuotations.find(
      (quotation) => quotation.supplier_name === bidder1,
    );

    const bidder2Quotation = itemQuotations.find(
      (quotation) => quotation.supplier_name === bidder2,
    );

    const bidder3Quotation = itemQuotations.find(
      (quotation) => quotation.supplier_name === bidder3,
    );

    // Bidder prices
    worksheet.getCell(`F${rowNumber}`).value =
      bidder1Quotation?.unit_price != null
        ? Number(bidder1Quotation.unit_price)
        : "";

    worksheet.getCell(`G${rowNumber}`).value =
      bidder2Quotation?.unit_price != null
        ? Number(bidder2Quotation.unit_price)
        : "";

    worksheet.getCell(`H${rowNumber}`).value =
      bidder3Quotation?.unit_price != null
        ? Number(bidder3Quotation.unit_price)
        : "";

    ["F", "G", "H"].forEach((column) => {
      worksheet.getCell(`${column}${rowNumber}`).numFmt = moneyFormat;
    });

    // Winning bidder
    worksheet.getCell(`I${rowNumber}`).value =
      item.rfq_details?.supplier_name ?? "";

    // Format all item cells
    for (let col = 1; col <= 9; col++) {
      const cell = worksheet.getCell(rowNumber, col);

      cell.font = normalFont;
      cell.border = border;

      cell.alignment = {
        vertical: "middle",
        wrapText: true,
      };
    }
    for (let col = 10; col <= 13; col++) {
      const cell = worksheet.getCell(rowNumber, col);

      cell.font = normalFont;

      cell.alignment = {
        vertical: "middle",
        wrapText: true,
      };
    }

    worksheet.getCell(`A${rowNumber}`).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.getCell(`C${rowNumber}`).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.getCell(`D${rowNumber}`).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    ["E", "F", "G", "H"].forEach((column) => {
      worksheet.getCell(`${column}${rowNumber}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
    });

    worksheet.getCell(`I${rowNumber}`).alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

    worksheet.getRow(rowNumber).height = 45;
  });

  // ============================================================
  // TOTAL QUOTATION ROW
  // ============================================================

  const totalRow = firstItemRow + items.length; //12
  //worksheet.mergeCells(`I${firstItemRow}:I${totalRow}`); // Merge winning bidder column for all items

  /*worksheet.mergeCells(`A${totalRow}:I${totalRow}`);

  worksheet.getCell(`A${totalRow}`).value = "";

  worksheet.getCell(`A${totalRow}`).font = boldFont;

  worksheet.getCell(`A${totalRow}`).alignment = {
    horizontal: "right",
    vertical: "middle",
  };

  // Bidder totals
  ["F", "G", "H"].forEach((column) => {
    const cell = worksheet.getCell(`${column}${totalRow}`);

    cell.value = {
      formula: `SUM(${column}${firstItemRow}:${column}${totalRow - 1})`,
    };

    cell.numFmt = moneyFormat;
    cell.font = boldFont;

    cell.alignment = {
      horizontal: "right",
      vertical: "middle",
    };
  });

  // Winning bidder total row
  worksheet.getCell(`I${totalRow}`).value = lowestSupplierName;

  worksheet.getCell(`I${totalRow}`).font = boldFont;

  worksheet.getCell(`I${totalRow}`).alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };

  for (let col = 1; col <= 9; col++) {
    worksheet.getCell(totalRow, col).border = border;
  }

  worksheet.getRow(totalRow).height = 25;

  // ============================================================
  // SUPPLIER TOTALS - J TO M
  // ============================================================

  const supplierNames = [bidder1, bidder2, bidder3, bidder4];

  const supplierColumns = ["J", "K", "L", "M"];

  supplierColumns.forEach((column, index) => {
    const supplierName = supplierNames[index];

    const supplierTotal = quotations
      .filter((quotation) => quotation.supplier_name === supplierName)
      .reduce((total, quotation) => total + getQuotationAmount(quotation), 0);

    const cell = worksheet.getCell(`${column}${totalRow}`);

    cell.value = supplierName ? supplierTotal : "";

    cell.numFmt = moneyFormat;

    cell.font = {
      name: "Tahoma",
      size: 9,
      bold: true,
      color: { argb: RED },
    };

    cell.alignment = {
      horizontal: "right",
      vertical: "middle",
    };
  });
*/
  // ============================================================
  // LOWEST COMPLYING SUPPLIER
  // ============================================================

  worksheet.mergeCells(`A${totalRow}:E${totalRow}`);

  worksheet.getCell(`A${totalRow}`).value = "Lowest Complying Supplier";

  worksheet.getCell(`A${totalRow}`).font = boldFont;

  worksheet.getCell(`A${totalRow}`).alignment = {
    horizontal: "right",
    vertical: "middle",
  };

  worksheet.getCell(`F${totalRow}`).value = bidder1;
  worksheet.getCell(`G${totalRow}`).value = bidder2;
  worksheet.getCell(`H${totalRow}`).value = bidder3;

  worksheet.getCell(`I${totalRow}`).value = lowestSupplierName;

  worksheet.getCell(`I${totalRow}`).font = boldFont;

  worksheet.getCell(`I${totalRow}`).alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };

  worksheet.getCell(`J${totalRow}`).value = "";
  worksheet.getCell(`K${totalRow}`).value = "";
  worksheet.getCell(`L${totalRow}`).value = "";
  worksheet.getCell(`M${totalRow}`).value = "";

  for (let col = 1; col <= 9; col++) {
    worksheet.getCell(totalRow, col).border = border;
  }

  worksheet.getRow(totalRow).height = 25;

  // ============================================================
  // CERTIFICATION
  // ============================================================

  const certificationRow = totalRow + 2; //14

  worksheet.getCell(`B${certificationRow}`).value =
    "WE CERTIFY that we opened the bids of the above-listed materials, the abstract of which appears above, as the time and date indicated.";

  worksheet.getCell(`B${certificationRow}`).font = normalFont;

  worksheet.getCell(`B${certificationRow}`).alignment = {
    horizontal: "left",
    vertical: "bottom",
  };

  // ============================================================
  // BAC MEMBERS
  // ============================================================

  //NAME FORMAT TO FIRST MIDDLE INITIAL LAST
  const formatName = (name?: string) => {
    if (!name) return "";

    const [lastName, firstMiddle] = name.split(",").map((part) => part.trim());

    const parts = firstMiddle.split(" ").filter(Boolean);

    const firstName = parts[0] ?? "";
    const middleInitial = parts.slice(1).join(" ");

    return `${firstName} ${middleInitial ? middleInitial.replace(/\b([A-Za-z])\b/, "$1.") + " " : ""}${lastName}`;
  };
  const bacStartRow = certificationRow + 2; //16

  worksheet.getCell(`A${bacStartRow}`).value = "Bids and Awards Committee:";
  worksheet.getCell(`A${bacStartRow}`).font = normalFont;

  const bac_member0 = formatName(bac_members[0]?.name);
  worksheet.getCell(`B${bacStartRow + 2}`).value = bac_member0;
  worksheet.getCell(`B${bacStartRow + 2}`).font = boldFont;
  worksheet.getCell(`B${bacStartRow + 2}`).alignment = centered;

  worksheet.getCell(`B${bacStartRow + 3}`).value =
    bac_members[0].position ?? bac_members[0].designation ?? "";
  worksheet.getCell(`B${bacStartRow + 3}`).alignment = centered;

  const bac_member1 = formatName(bac_members[1]?.name);
  worksheet.getCell(`E${bacStartRow + 2}`).value = bac_member1;
  worksheet.getCell(`E${bacStartRow + 2}`).font = boldFont;
  worksheet.getCell(`E${bacStartRow + 2}`).alignment = centered;

  worksheet.getCell(`E${bacStartRow + 3}`).value =
    bac_members[1].position ?? bac_members[1].designation ?? "";
  worksheet.getCell(`E${bacStartRow + 3}`).alignment = centered;
  const bac_member2 = formatName(bac_members[2]?.name);
  worksheet.getCell(`B${bacStartRow + 6}`).value = bac_member2;
  worksheet.getCell(`B${bacStartRow + 6}`).font = boldFont;
  worksheet.getCell(`B${bacStartRow + 6}`).alignment = centered;

  worksheet.getCell(`B${bacStartRow + 7}`).value =
    bac_members[2].position ?? bac_members[2].designation ?? "";
  worksheet.getCell(`B${bacStartRow + 7}`).alignment = centered;

  const bac_member3 = formatName(bac_members[3]?.name);
  worksheet.getCell(`E${bacStartRow + 6}`).value = bac_member3;
  worksheet.getCell(`E${bacStartRow + 6}`).font = boldFont;
  worksheet.getCell(`E${bacStartRow + 6}`).alignment = centered;

  worksheet.getCell(`E${bacStartRow + 7}`).value =
    bac_members[3].position ?? bac_members[3].designation ?? "";
  worksheet.getCell(`E${bacStartRow + 7}`).alignment = centered;

  const bac_member4 = formatName(bac_members[4]?.name);
  worksheet.getCell(`C${bacStartRow + 10}`).value = bac_member4;
  worksheet.getCell(`C${bacStartRow + 10}`).font = boldFont;
  worksheet.getCell(`C${bacStartRow + 10}`).alignment = centered;

  worksheet.getCell(`C${bacStartRow + 11}`).value =
    bac_members[4].position ?? bac_members[4].designation ?? "";
  worksheet.getCell(`C${bacStartRow + 11}`).alignment = centered;

  worksheet.getCell(`G${bacStartRow + 2}`).value = "conforme:";
  worksheet.getCell(`G${bacStartRow + 2}`).alignment = centered;

  //merge cells for end-user and campus director
  worksheet.mergeCells(`H${bacStartRow + 3}:I${bacStartRow + 3}`);
  worksheet.mergeCells(`H${bacStartRow + 4}:I${bacStartRow + 4}`);
  worksheet.mergeCells(`H${bacStartRow + 10}:I${bacStartRow + 10}`);
  worksheet.mergeCells(`H${bacStartRow + 11}:I${bacStartRow + 11}`);

  worksheet.getCell(`H${bacStartRow + 3}`).value = endUser;
  worksheet.getCell(`H${bacStartRow + 3}`).font = boldFont;
  worksheet.getCell(`H${bacStartRow + 3}`).alignment = centered;

  worksheet.getCell(`H${bacStartRow + 4}`).value = "end-user";
  worksheet.getCell(`H${bacStartRow + 4}`).alignment = centered;

  worksheet.getCell(`H${bacStartRow + 10}`).value =
    data[0]?.supplier_details?.aoq_details?.pr_details?.campus_director_details
      .name ?? "";
  worksheet.getCell(`H${bacStartRow + 10}`).font = boldFont;
  worksheet.getCell(`H${bacStartRow + 10}`).alignment = centered;

  worksheet.getCell(`H${bacStartRow + 11}`).value =
    data[0]?.supplier_details?.aoq_details?.pr_details?.campus_director_details
      ?.designation ?? "";
  worksheet.getCell(`H${bacStartRow + 11}`).alignment = centered;

  // ============================================================
  // FOOTER
  // ============================================================

  worksheet.headerFooter.oddFooter = "&RPage &P of &N";

  // ============================================================
  // PRINT AREA
  // ============================================================
  const lastPrintRow = bacStartRow + 11;

  worksheet.pageSetup.printArea = `A1:I${lastPrintRow}`;

  // ============================================================
  // GENERATE XLSX
  // ============================================================

  const buffer = await workbook.xlsx.writeBuffer();

  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = "Abstract_of_Quotations.xlsx";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  return true;
};
