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

  // Convert a 1-based Excel column number to its letter (1 = A, 27 = AA).
  const getExcelColumnLetter = (columnNumber: number): string => {
    let column = columnNumber;
    let result = "";

    while (column > 0) {
      const remainder = (column - 1) % 26;
      result = String.fromCharCode(65 + remainder) + result;
      column = Math.floor((column - 1) / 26);
    }

    return result;
  };

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

  // ============================================================
  // DYNAMIC BIDDER PROCESSING
  // ============================================================

  const getSupplierName = (quotation: any): string =>
    quotation?.supplier_details?.name ??
    quotation?.rfq_details?.supplier_name ??
    quotation?.supplier_name ??
    "";

  // Preserve the order in which each supplier first appears in the RFQ data.
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

  // Bidder columns start at F (column 6). The winning bidder follows them.
  const bidderColumns = uniqueBidders.map((quotation, index) => ({
    name: getSupplierName(quotation),
    columnIndex: 6 + index,
    columnLetter: getExcelColumnLetter(6 + index),
    total: 0,
  }));

  const winningColumnIndex = 6 + bidderColumns.length;
  const winningColumn = getExcelColumnLetter(winningColumnIndex);

  // Keep at least columns A:I because the project information and BAC
  // certification sections still use columns H and I.
  const lastColumnIndex = Math.max(9, winningColumnIndex);
  const lastColumnLetter = getExcelColumnLetter(lastColumnIndex);

  let rightSideLabelLetter = "";
  let rightSideValuesLetter = "";
  if (bidderColumns.length === 3) {
    rightSideLabelLetter = getExcelColumnLetter(lastColumnIndex - 1);
    rightSideValuesLetter = getExcelColumnLetter(lastColumnIndex);
  } else {
    rightSideLabelLetter = getExcelColumnLetter(lastColumnIndex - 2);
    rightSideValuesLetter = getExcelColumnLetter(lastColumnIndex - 1);
  }

  const getSupplierTotal = (supplierName: string): number => {
    if (!supplierName) return 0;

    return quotations
      .filter((quotation) => getSupplierName(quotation) === supplierName)
      .reduce(
        (total, quotation) => total + Number(quotation.total_amount ?? 0),
        0,
      );
  };

  bidderColumns.forEach((bidder) => {
    bidder.total = getSupplierTotal(bidder.name);
  });

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
    paperSize: 5,
    orientation: "landscape",

    fitToPage: true,
    fitToWidth: 1,
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
  // DYNAMIC COLUMN WIDTHS
  // ============================================================

  const fixedWidths: Record<number, number> = {
    1: 4.28,
    2: 35.14,
    3: 5.28,
    4: 5.85,
    5: 10.85,
  };

  worksheet.columns = Array.from({ length: lastColumnIndex }, (_, index) => {
    const columnNumber = index + 1;
    const bidder = bidderColumns.find(
      (candidate) => candidate.columnIndex === columnNumber,
    );

    if (fixedWidths[columnNumber] !== undefined) {
      return { width: fixedWidths[columnNumber] };
    }

    if (bidder) {
      return { width: 19.28 };
    }

    if (columnNumber === winningColumnIndex) {
      return { width: 36.42 };
    }

    return { width: 19.28 };
  });

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

  worksheet.mergeCells(`A1:${lastColumnLetter}1`);

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
    const rightLabel = worksheet.getCell(`${rightSideLabelLetter}${row}`);

    const leftValue = worksheet.getCell(`C${row}`);
    const rightValue = worksheet.getCell(`${rightSideValuesLetter}${row}`);

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
    };

    rightValue.alignment = {
      horizontal: "left",
      vertical: "middle",
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

  worksheet.getCell(`${rightSideLabelLetter}6`).font = {
    name: "Tahoma",
    size: 9,
    bold: true,
    color: { argb: BLUE },
  };
  worksheet.getCell(`${rightSideValuesLetter}6`).font = {
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
  worksheet.mergeCells(`C2:G2`);
  worksheet.mergeCells(`C3:G3`);
  worksheet.mergeCells(`C4:G4`);
  worksheet.mergeCells(`C5:G5`);
  worksheet.mergeCells(`C6:G6`);

  // Right side
  worksheet.getCell(`${rightSideLabelLetter}2`).value = "# of Sheets:";
  worksheet.getCell(`${rightSideLabelLetter}2`).alignment = {
    horizontal: "right",
    vertical: "bottom",
  };
  worksheet.getCell(`${rightSideLabelLetter}3`).value = "Award Resolution No.:";
  worksheet.getCell(`${rightSideLabelLetter}4`).value = "Date & Time:";
  worksheet.getCell(`${rightSideLabelLetter}5`).value = "Mode of Procurement:";
  worksheet.getCell(`${rightSideLabelLetter}6`).value = "PR/Control No.:";

  //worksheet.getCell(`${rightSideValuesLetter}2`).value = 1;
  worksheet.getCell(`${rightSideValuesLetter}2`).alignment = {
    horizontal: "left",
    vertical: "bottom",
  };
  worksheet.getCell(`${rightSideValuesLetter}3`).value = "N/A";
  worksheet.getCell(`${rightSideValuesLetter}4`).value = dateTime;
  worksheet.getCell(`${rightSideValuesLetter}5`).value =
    "34-Small Value Procurement";

  worksheet.getCell(`${rightSideValuesLetter}6`).value = prDetails?.pr_no ?? "";

  worksheet.getRow(7).height = 7.5;

  // ============================================================
  // TABLE HEADER
  // ============================================================

  const headerRow = 8;
  const secondHeaderRow = 9;
  worksheet.getRow(headerRow).height = 15.5;
  worksheet.getRow(secondHeaderRow).height = 15.5;

  // Fixed vertically merged headers.
  ["A", "B", "E", winningColumn].forEach((column) => {
    worksheet.mergeCells(`${column}${headerRow}:${column}${secondHeaderRow}`);
  });

  // Quantity spans columns C and D.
  worksheet.mergeCells(`C${headerRow}:D${secondHeaderRow}`);

  worksheet.getCell(`A${headerRow}`).value = "No.";
  worksheet.getCell(`B${headerRow}`).value = "Items";
  worksheet.getCell(`C${headerRow}`).value = "Quantity";
  worksheet.getCell(`E${headerRow}`).value = "Agency Price";

  // Create one bidder header for every unique supplier in the RFQ.
  bidderColumns.forEach((bidder, index) => {
    worksheet.getCell(`${bidder.columnLetter}${headerRow}`).value =
      `BIDDER ${index + 1}`;
    worksheet.getCell(`${bidder.columnLetter}${secondHeaderRow}`).value =
      bidder.name;
  });

  worksheet.getCell(`${winningColumn}${headerRow}`).value = "WINNING BIDDER";

  // Format all table header cells, including every generated bidder column.
  for (let row = headerRow; row <= secondHeaderRow; row++) {
    for (let col = 1; col <= winningColumnIndex; col++) {
      const cell = worksheet.getCell(row, col);

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: GREEN },
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

  // Estimate the row height needed for the longest supplier name.
  let highestEstimatedWidth = 1;

  bidderColumns.forEach((bidder) => {
    const supplierNameWidth =
      worksheet.getColumn(bidder.columnIndex).width ?? 19.28;

    const estimatedWidth = Math.ceil(
      bidder.name.length / (supplierNameWidth * 1.25),
    );

    highestEstimatedWidth = Math.max(highestEstimatedWidth, estimatedWidth);

    worksheet.getCell(`${bidder.columnLetter}${secondHeaderRow}`).font = {
      name: "Tahoma",
      size: 8,
      bold: true,
    };
  });

  worksheet.getRow(secondHeaderRow).height = Math.max(
    21,
    highestEstimatedWidth * 11.25,
  );

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

    // ============================================================
    // DYNAMIC BIDDER QUOTATIONS
    // ============================================================

    bidderColumns.forEach((bidder) => {
      const bidderQuotation = itemQuotations.find(
        (quotation) => getSupplierName(quotation) === bidder.name,
      );

      worksheet.getCell(`${bidder.columnLetter}${rowNumber}`).value =
        bidderQuotation?.total_amount != null
          ? Number(bidderQuotation.total_amount)
          : "";
    });

    // Winning bidder
    worksheet.getCell(`${winningColumn}${rowNumber}`).value =
      item.rfq_details?.supplier_name ?? "";

    // Format all item cells
    for (let col = 1; col <= winningColumnIndex; col++) {
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

    worksheet.getCell(`${winningColumn}${rowNumber}`).alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    ["E", ...bidderColumns.map((bidder) => bidder.columnLetter)].forEach(
      (column) => {
        worksheet.getCell(`${column}${rowNumber}`).alignment = {
          horizontal: "right",
          vertical: "middle",
        };
      },
    );

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

  const totalRow = firstItemRow + items.length;

  // Display each supplier's RFQ total in its own bidder column.
  bidderColumns.forEach((bidder) => {
    const column = bidder.columnLetter;

    if (totalRow > firstItemRow + 1) {
      worksheet.mergeCells(`${column}${firstItemRow}:${column}${totalRow - 1}`);
    }

    const itemCell = worksheet.getCell(`${column}${firstItemRow}`);
    itemCell.value = bidder.total;
    itemCell.numFmt = numberFormat;
    itemCell.font = normalFont;
    itemCell.alignment = {
      horizontal: "right",
      vertical: "middle",
    };

    const totalCell = worksheet.getCell(`${column}${totalRow}`);
    totalCell.value = bidder.total;
    totalCell.numFmt = numberFormat;
    totalCell.font = boldFont;
    totalCell.alignment = {
      horizontal: "right",
      vertical: "middle",
    };
  });

  // Reduce font size for item rows across the complete dynamic table.
  for (let row = firstItemRow; row <= totalRow - 1; row++) {
    for (let col = 1; col <= winningColumnIndex; col++) {
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

  // Winning bidder column moves after the final bidder column.
  worksheet.mergeCells(
    `${winningColumn}${firstItemRow}:${winningColumn}${totalRow}`,
  );

  const lowestSupplierCell = worksheet.getCell(
    `${winningColumn}${firstItemRow}`,
  );
  lowestSupplierCell.value = lowestSupplierName;
  lowestSupplierCell.font = boldFont;
  lowestSupplierCell.alignment = {
    horizontal: "center",
    vertical: "middle",
    wrapText: true,
  };

  for (let col = 1; col <= winningColumnIndex; col++) {
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

    const nameParts = name.split(",").map((part) => part.trim());

    if (nameParts.length < 2) return name;

    const [lastName, firstMiddle = ""] = nameParts;
    const parts = firstMiddle.split(" ").filter(Boolean);

    const firstName = parts[0] ?? "";
    const middleInitial = parts.slice(1).join(" ");

    return `${firstName} ${middleInitial ? middleInitial.replace(/\b([A-Za-z])\b/, "$1.") + " " : ""}${lastName}`;
  };

  const bacStartRow = certificationRow + 2;

  // Dynamic BAC committee positions
  const bacColumn1 = "B";
  const bacColumn2 = "F";
  const bacColumn3 = "D";

  // Dynamic right-side signatory positions
  const signatoryColumn = rightSideValuesLetter;

  // BAC heading
  worksheet.getCell(`A${bacStartRow}`).value = "Bids and Awards Committee:";
  worksheet.getCell(`A${bacStartRow}`).font = normalFont;

  // Helper function for BAC member formatting
  const setBACMember = (
    memberIndex: number,
    column: string,
    rowOffset: number,
  ) => {
    const member = bac_members[memberIndex];

    const nameCell = worksheet.getCell(`${column}${bacStartRow + rowOffset}`);
    const positionCell = worksheet.getCell(
      `${column}${bacStartRow + rowOffset + 1}`,
    );

    nameCell.value = formatName(member?.name);
    nameCell.font = boldFont;
    nameCell.alignment = centered;

    positionCell.value = member?.position ?? member?.designation ?? "";
    positionCell.alignment = centered;
  };

  // First row of BAC members
  setBACMember(0, bacColumn1, 2);
  setBACMember(1, bacColumn2, 2);

  // Second row of BAC members
  setBACMember(2, bacColumn1, 6);
  setBACMember(4, bacColumn2, 6);

  // Fifth member (centered)
  setBACMember(3, bacColumn3, 10);

  // Conforme
  worksheet.getCell(`${rightSideLabelLetter}${bacStartRow + 2}`).value =
    "conforme:";
  worksheet.getCell(`${rightSideLabelLetter}${bacStartRow + 2}`).alignment = {
    horizontal: "right",
  };

  // End-user and Campus Director
  const signatoryRows = [
    {
      row: bacStartRow + 3,
      value: endUser,
      bold: true,
    },
    {
      row: bacStartRow + 4,
      value: "end-user",
      bold: false,
    },
    {
      row: bacStartRow + 10,
      value: prDetails?.campus_director_details?.name ?? "",
      bold: true,
    },
    {
      row: bacStartRow + 11,
      value: prDetails?.campus_director_details?.designation ?? "",
      bold: false,
    },
  ];

  // Merge signatory cells dynamically
  signatoryRows.forEach(({ row, value, bold }) => {
    if (signatoryColumn !== lastColumnLetter) {
      worksheet.mergeCells(
        `${signatoryColumn}${row}:${lastColumnLetter}${row}`,
      );
    }

    const cell = worksheet.getCell(`${signatoryColumn}${row}`);

    cell.value = value;
    cell.alignment = centered;

    if (bold) {
      cell.font = boldFont;
    }
  });

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

  worksheet.headerFooter.oddFooter = "&RPage &G &P of &N";

  // ============================================================
  // PRINT AREA
  // ============================================================
  const lastPrintRow = bacStartRow + 11;

  worksheet.pageSetup.printArea = `A1:${lastColumnLetter}${lastPrintRow}`;

  // ============================================================
  // ESTIMATE NUMBER OF PRINTED PAGES
  // ============================================================

  // Legal paper in landscape orientation (inches)
  const PAPER_WIDTH = 14;
  const PAPER_HEIGHT = 8.5;

  // Convert inches to points (1 inch = 72 points)
  const POINTS_PER_INCH = 72;

  // Get page margins
  const margins = worksheet.pageSetup.margins!;

  // Calculate printable dimensions
  const printableWidth =
    (PAPER_WIDTH - margins.left - margins.right) * POINTS_PER_INCH;

  const printableHeight =
    (PAPER_HEIGHT - margins.top - margins.bottom) * POINTS_PER_INCH;

  // Calculate total worksheet width in points.
  // Excel column width is approximately 7 pixels + 5 pixels.
  const totalColumnWidth = worksheet.columns.reduce((total, column) => {
    const width = column.width ?? 8.43;

    const columnWidthInPoints = Math.floor(width * 7 + 5) * 0.75;

    return total + columnWidthInPoints;
  }, 0);

  // Calculate horizontal scaling based on fitToWidth: 1
  const horizontalScale = Math.min(1, printableWidth / totalColumnWidth);

  // Calculate total row height within the print area
  let totalRowHeight = 0;

  for (let row = 1; row <= lastPrintRow; row++) {
    totalRowHeight +=
      worksheet.getRow(row).height ??
      worksheet.properties.defaultRowHeight ??
      15;
  }

  // Apply horizontal scaling to the total vertical height
  const scaledTotalHeight = totalRowHeight * horizontalScale;

  // Estimate the number of vertical pages
  const estimatedPages = Math.max(
    1,
    Math.ceil(scaledTotalHeight / printableHeight),
  );

  // Update # of Sheets
  worksheet.getCell(`${rightSideValuesLetter}2`).value = estimatedPages;

  console.log("Estimated printed pages:", estimatedPages);

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
