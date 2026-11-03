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
  // Get supplier name from the quotation data
  const getSupplierName = (quotation: any): string =>
    quotation?.supplier_details?.name ??
    quotation?.rfq_details?.supplier_name ??
    quotation?.supplier_name ??
    "";

  // Get unique suppliers from all quotations for this PR
  const uniqueBidders = quotations.filter((quotation, index, self) => {
    const supplierName = getSupplierName(quotation);

    return (
      supplierName !== "" &&
      index ===
        self.findIndex(
          (candidate) => getSupplierName(candidate) === supplierName,
        )
    );
  });

  const bidder1 = uniqueBidders[0] ? getSupplierName(uniqueBidders[0]) : "";
  const bidder2 = uniqueBidders[1] ? getSupplierName(uniqueBidders[1]) : "";
  const bidder3 = uniqueBidders[2] ? getSupplierName(uniqueBidders[2]) : "";

  // Calculate each supplier's total quotation for the entire PR
  const getSupplierTotal = (supplierName: string): number => {
    if (!supplierName) return 0;

    return quotations
      .filter((quotation) => getSupplierName(quotation) === supplierName)
      .reduce(
        (total, quotation) => total + Number(quotation.total_amount ?? 0),
        0,
      );
  };

  const bidder1Total = getSupplierTotal(bidder1);
  const bidder2Total = getSupplierTotal(bidder2);
  const bidder3Total = getSupplierTotal(bidder3);

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
    { key: "A", width: 4.28 },
    { key: "B", width: 35.14 },
    { key: "C", width: 5.28 },
    { key: "D", width: 5.85 },
    { key: "E", width: 10.85 },
    { key: "F", width: 19.28 },
    { key: "G", width: 19.28 },
    { key: "H", width: 19.28 },
    { key: "I", width: 36.42 },
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
  const numberFormat = "#,##0.00";

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
  ["A", "B", "E", "I", "J", "K", "L", "M"].forEach((column) => {
    worksheet.mergeCells(`${column}${headerRow}:${column}${secondHeaderRow}`);
  });

  // Main headers
  worksheet.getCell(`A${headerRow}`).value = "No.";
  worksheet.getCell(`B${headerRow}`).value = "Items";
  worksheet.getCell(`C${headerRow}`).value = "Quantity";
  worksheet.mergeCells(`C${headerRow}:D${secondHeaderRow}`);
  worksheet.getCell(`E${headerRow}`).value = "Agency Price";

  worksheet.getCell(`F${headerRow}`).value = "BIDDER 1";
  worksheet.getCell(`G${headerRow}`).value = "BIDDER 2";
  worksheet.getCell(`H${headerRow}`).value = "BIDDER 3";

  worksheet.getCell(`I${headerRow}`).value = "WINNING BIDDER";

  // Bidder names
  worksheet.getCell(`F${secondHeaderRow}`).value = bidder1;
  worksheet.getCell(`G${secondHeaderRow}`).value = bidder2;
  worksheet.getCell(`H${secondHeaderRow}`).value = bidder3;

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
  worksheet.getRow(headerRow).font = {
    name: "Tahoma",
    size: 10,
    bold: true,
  };

  let highestEstimatedWidth = 0;
  [bidder1, bidder2, bidder3].forEach((bidder, index) => {
    const col = ["F", "G", "H"][index];
    const supplierNameWidth = worksheet.getColumn(col).width!;

    const estimatedWidth = Math.ceil(
      bidder.length / (supplierNameWidth * 1.25),
    );

    highestEstimatedWidth = Math.max(highestEstimatedWidth, estimatedWidth);

    worksheet.getCell(`${col}${secondHeaderRow}`).font = {
      name: "Tahoma",
      size: 8,
      bold: true,
    };
  });

  switch (highestEstimatedWidth) {
    case 1:
      worksheet.getRow(secondHeaderRow).height = 21;
      break;
    case 2:
      worksheet.getRow(secondHeaderRow).height = 32.25;
      break;
    case 3:
      worksheet.getRow(secondHeaderRow).height = 43.5;
      break;
  }

  // ============================================================
  // HELPER: FIND QUOTATIONS FOR AN ITEM
  // ============================================================

  const getItemQuotations = (item: supplierItemType_) => {
    const itemNo = item.item_quotation_details?.item_details?.item_no;

    const itemDescription =
      item.item_quotation_details?.item_details?.item_description;

    return quotations.filter((quotation) => {
      const quotationItemNo =
        quotation.item_quotation_details?.item_details?.item_no;

      const quotationDescription =
        quotation.item_quotation_details?.item_details?.item_description;

      if (itemNo && quotationItemNo) {
        return quotationItemNo === itemNo;
      }

      return quotationDescription === itemDescription;
    });
  };

  // ============================================================
  // ITEMS
  // ============================================================

  const firstItemRow = 10;

  items.forEach((item, index) => {
    const rowNumber = firstItemRow + index;

    const itemQuotations = getItemQuotations(item);

    // Basic information
    worksheet.getCell(`A${rowNumber}`).value = index + 1;

    const itemDescription = String(
      item.item_quotation_details?.item_details?.item_description ?? "",
    );

    worksheet.getCell(`B${rowNumber}`).value = itemDescription;

    // Estimate the number of lines based on column B width
    const itemDescriptionWidth = worksheet.getColumn("B").width!;

    const estimatedLines = Math.max(
      1,
      Math.ceil(itemDescription.length / (itemDescriptionWidth * 1.08)),
    );

    worksheet.getCell(`C${rowNumber}`).value = item.item_quantity ?? "";

    worksheet.getCell(`D${rowNumber}`).value = "unit";

    worksheet.getCell(`E${rowNumber}`).value = Number(item.item_cost ?? 0);

    worksheet.getCell(`E${rowNumber}`).numFmt = numberFormat;

    // Find bidder quotations
    const bidder1Quotation = itemQuotations.find(
      (quotation) => getSupplierName(quotation) === bidder1,
    );

    const bidder2Quotation = itemQuotations.find(
      (quotation) => getSupplierName(quotation) === bidder2,
    );

    const bidder3Quotation = itemQuotations.find(
      (quotation) => getSupplierName(quotation) === bidder3,
    );
    // Bidder prices
    worksheet.getCell(`F${rowNumber}`).value =
      bidder1Quotation?.total_amount != null
        ? Number(bidder1Quotation.total_amount)
        : "";

    worksheet.getCell(`G${rowNumber}`).value =
      bidder2Quotation?.total_amount != null
        ? Number(bidder2Quotation.total_amount)
        : "";

    worksheet.getCell(`H${rowNumber}`).value =
      bidder3Quotation?.total_amount != null
        ? Number(bidder3Quotation.total_amount)
        : "";

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

    worksheet.getCell(`I${rowNumber}`).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    ["E", "F", "G", "H"].forEach((column) => {
      worksheet.getCell(`${column}${rowNumber}`).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
    });

    worksheet.getCell(`B${rowNumber}`).alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };

    // Dynamic row height
    switch (estimatedLines) {
      case 1:
        worksheet.getRow(rowNumber).height = 21;
        break;
      case 2:
        worksheet.getRow(rowNumber).height = 25;
        break;
      case 3:
        worksheet.getRow(rowNumber).height = 34;
        break;
      case 4:
        worksheet.getRow(rowNumber).height = 42;
        break;
      case 5:
        worksheet.getRow(rowNumber).height = 51.5;
        break;
      case 6:
        worksheet.getRow(rowNumber).height = 62.5;
        break;
    }
  });

  // ============================================================
  // TOTAL QUOTATION ROW
  // ============================================================

  const totalRow = firstItemRow + items.length; //12
  // Merge each bidder column vertically and display the supplier's PR total
  const bidderColumns = [
    { column: "F", total: bidder1Total },
    { column: "G", total: bidder2Total },
    { column: "H", total: bidder3Total },
  ];

  bidderColumns.forEach(({ column, total }) => {
    if (totalRow > firstItemRow + 1) {
      worksheet.mergeCells(`${column}${firstItemRow}:${column}${totalRow - 1}`);
    }

    const cell = worksheet.getCell(`${column}${firstItemRow}`);

    cell.value = total;
    cell.numFmt = numberFormat;
    cell.font = normalFont;
    cell.alignment = {
      horizontal: "right",
      vertical: "middle",
    };
  });
  bidderColumns.forEach(({ column, total }) => {
    const cell = worksheet.getCell(`${column}${totalRow}`);
    cell.value = total;
    cell.numFmt = numberFormat;
    cell.font = boldFont;
    cell.alignment = {
      horizontal: "right",
      vertical: "middle",
    };
  });

  for (let row = firstItemRow; row <= totalRow - 1; row++) {
    for (let col = 1; col <= 8; col++) {
      worksheet.getCell(row, col).font = {
        ...worksheet.getCell(row, col).font,
        size: 8,
      };
    }
  }

  // ============================================================
  // LOWEST COMPLYING SUPPLIER
  // ============================================================

  worksheet.mergeCells(`A${totalRow}:E${totalRow}`);
  worksheet.getRow(totalRow).height = 21;
  worksheet.getRow(totalRow).font = {
    name: "Tahoma",
    size: 8,
    bold: true,
    italic: true,
  };

  worksheet.getCell(`A${totalRow}`).value = "Lowest Complying Supplier";

  worksheet.getCell(`A${totalRow}`).alignment = {
    horizontal: "right",
    vertical: "middle",
  };

  worksheet.getCell(`I${totalRow}`).value = lowestSupplierName;

  worksheet.getCell(`I${totalRow}`).font = boldFont;

  worksheet.getCell(`I${totalRow}`).alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };
  worksheet.mergeCells(`I${firstItemRow}`, `I${totalRow}`);

  for (let col = 1; col <= 9; col++) {
    worksheet.getCell(totalRow, col).border = border;
  }

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
  // Certification Lines Heights
  // ============================================================

  worksheet.getRow(totalRow + 1).height = 17;
  worksheet.getRow(totalRow + 2).height = 11.25;
  worksheet.getRow(totalRow + 3).height = 17;
  worksheet.getRow(totalRow + 4).height = 11.25;
  worksheet.getRow(totalRow + 5).height = 15.5;
  worksheet.getRow(totalRow + 6).height = 11.25;
  worksheet.getRow(totalRow + 7).height = 11.25;
  worksheet.getRow(totalRow + 8).height = 14.5;
  worksheet.getRow(totalRow + 9).height = 15;
  worksheet.getRow(totalRow + 10).height = 13.25;
  worksheet.getRow(totalRow + 11).height = 11.25;
  worksheet.getRow(totalRow + 12).height = 7.5;
  worksheet.getRow(totalRow + 13).height = 11.25;
  worksheet.getRow(totalRow + 14).height = 13.25;
  worksheet.getRow(totalRow + 15).height = 13.25;

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
