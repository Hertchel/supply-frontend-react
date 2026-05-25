import { BACmemberType } from "@/types/request/BACmember";
import { supplierItemType_ } from "@/types/response/abstract-of-quotation";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";

export const HeaderAndFooter = async (  
  pdfDoc: PDFDocument,
  page: PDFPage,
  boldFont: PDFFont,
  timesRomanFont: PDFFont,
  timesBoldFont: PDFFont,
  timesBoldItalicFont: PDFFont,
  bac_members: BACmemberType[],
  data: supplierItemType_,
  totalPages: number
) => {
    // Draw header
 
    page.drawText('ABSTRACT OF QUOTATIONS', { x: 379, y: 496.06, size: 12, font: boldFont });
    page.drawText('Project Name:', {x: 194.49, y: 473.19, size: 11, font: timesRomanFont });
    page.drawText('Date of Posting:', {x: 186.61, y: 456.38, size: 11, font: timesRomanFont });
    page.drawText('Project Location:', {x: 182, y: 442.91, size: 11, font: timesRomanFont });
    page.drawText('Lamacan, Argao, Cebu', {x: 265, y: 442.91, size: 11, font: timesRomanFont });
    page.drawText('Implementing Office:', {x: 162.50, y: 428, size: 11, font: timesRomanFont });
    page.drawText('Cebu Technological University - Argao Campus', {x: 265, y: 428, size: 11, font: timesRomanFont });
    page.drawText('Approved Budget:', {x: 176.70, y: 413, size: 11, font: timesRomanFont });
    page.drawText('# of Sheets:', {x: 644.29, y: 473.19, size: 11, font: timesRomanFont });
    page.drawText(totalPages.toString(), { x: 700, y: 473.19, size: 11, font: timesRomanFont, });
    page.drawText('Award Resolution No.:', {x: 594, y: 456.38, size: 11, font: timesRomanFont });
    page.drawText('Date and Time:', {x: 627.70, y: 442.91, size: 11, font: timesRomanFont });
    const currentDateTime = new Date().toLocaleString();
    page.drawText(currentDateTime, { x: 700, y: 442.91, size: 11, font: timesRomanFont,});
    page.drawText('Mode of Procurement:', {x: 597, y: 428, size: 11, font: timesRomanFont });
    page.drawText('PR/Control No.:', {x: 624, y: 413, size: 11, font: timesRomanFont });

    const prControlNo =data?.supplier_details?.aoq_details?.pr_details?.pr_no || "N/A";
        page.drawText(prControlNo, { x: 700, y: 413, size: 11, font: timesRomanFont, });
    // Draw footer text near footerYPosition
   

    // Example signature fields at calculated positions
    page.drawText('No.', {x: 40, y: 380, size: 11, font: timesBoldFont });
    page.drawText('Items', {x: 140, y: 380, size: 11, font: timesBoldFont });
    page.drawText('Quantity', {x: 300, y: 380, size: 11, font: timesBoldFont });
  
    page.drawText('Agency', {x: 360, y: 387, size: 11, font: timesBoldFont });
    page.drawText('Price', {x: 365, y: 375, size: 11, font: timesBoldFont });
  
    page.drawText('BIDDER 1', {x: 435, y: 390, size: 11, font: timesBoldFont });
    page.drawText('BIDDER 2', {x: 525, y: 390, size: 11, font: timesBoldFont });
    page.drawText('BIDDER 3', {x: 630, y: 390, size: 11, font: timesBoldFont });
    page.drawText('WINNING BIDDER  ', {x: 750, y: 380, size: 11, font: timesBoldFont });
    page.drawText('Lowest Complying Supplier ', {x: 285, y: 275, size: 11, font: timesBoldItalicFont });
  
  
    //text signature - FIXED with optional chaining and fallback values
    page.drawText('WE CERTIFY that we opened the bids of the above-listed materials, the abstract of which appears, as the time and date indicated.', {x: 56.69, y: 230, size: 12, font: timesRomanFont });
    page.drawText('Bids and Awards Committee:', {x: 31.18, y: 200, size: 12, font: timesRomanFont });
    //bac member 1
    page.drawText(bac_members[0]?.name || "N/A", {x: 80.39, y: 165, size: 11, font: timesBoldFont });
    page.drawText(bac_members[0]?.designation || "N/A", {x: 96.92, y: 150, size: 11, font: timesRomanFont });
    //bac member 2(to the left of bac member 1)
    page.drawText(bac_members[1]?.name || "N/A", {x: 370, y: 165, size: 11, font: timesBoldFont });
    page.drawText(bac_members[1]?.designation || "N/A", {x: 381.93, y: 150, size: 11, font: timesRomanFont });
    //end-user text
    page.drawText('End-user', {x: 726.77, y: 120 , size: 11, font: timesRomanFont });
    //conforme text
    page.drawText('Conforme:', {x: 547.08, y: 165, size: 11, font: timesRomanFont });
    //bac member 3(below bac member 1)
    page.drawText(bac_members[2]?.name || "N/A", {x: 68.57, y: 115, size: 11, font: timesBoldFont });
    page.drawText(bac_members[2]?.designation || "N/A", {x: 96.92, y: 100, size: 11, font: timesRomanFont });
    //bac vice chairman
    page.drawText(bac_members[3]?.name || "N/A", {x: 375, y: 115, size: 11, font: timesBoldFont });
    page.drawText(bac_members[3]?.designation || "N/A", {x: 371.14, y: 100  , size: 11, font: timesRomanFont });
    //bac chairman
    page.drawText(bac_members[4]?.name || "N/A", {x: 200, y: 65, size: 11, font: timesBoldFont });
    page.drawText(bac_members[4]?.designation || "N/A", {x: 225.14, y: 50, size: 11, font: timesRomanFont });
  
    // FIXED: Add optional chaining for nested data 
    // campus director details
    page.drawText(data?.supplier_details?.aoq_details?.pr_details?.campus_director_details?.name || "N/A", {x: 690, y:  65, size: 11, font: timesBoldFont });
    page.drawText(data?.supplier_details?.aoq_details?.pr_details?.campus_director_details?.designation || "N/A", {x: 730, y:  50, size: 11, font: timesRomanFont });
    
    //Horizontal Line
    page.drawLine({start: { x: 29.53  , y: 401.57 }, end: { x: 898.98, y: 401.57 }, thickness: 1.5 , color: rgb(0, 0, 0)});
    page.drawLine({start: { x: 29.53  , y: 368.57 }, end: { x: 898.98, y: 368.57 }, thickness: 1.5 , color: rgb(0, 0, 0)});  
    
    //logos - FIXED with proper ArrayBuffer handling
    const headerjpg = '/header.jpeg';
    const headerjpgResponse = await fetch(headerjpg);
    const headerjpgBuffer = await headerjpgResponse.arrayBuffer();
    const headerimage = await pdfDoc.embedJpg(new Uint8Array(headerjpgBuffer));
    page.drawImage(headerimage, {
        x: 235,
        y: 510,
        width: 462,
        height: 85,
    });
    page.drawText('Republic of the Philippines', { x: 391, y: 580, size: 12, font: timesRomanFont });
    page.drawText('CEBU TECHNOLOGICAL UNIVERSITY', { x: 348, y: 565, size: 12, font: boldFont });
    page.drawText('ARGAO CAMPUS', { x: 411, y: 553, size: 12, font: timesRomanFont });
    page.drawText('Ed Kintanar Street, Lamacan, Argao Cebu Philippines', { x: 348, y: 543, size: 10, font: timesRomanFont });
    page.drawText('Website:', { x: 348, y: 533, size: 8, font: timesRomanFont});
    page.drawText('http://www.argao.ctu.edu.ph ', { x: 380, y: 533, size: 8, font: timesRomanFont, color: rgb(0, 0, 1)});
    page.drawText('E-mail: cdargao@ctu.edu.ph', { x: 483, y: 533, size: 8, font: timesRomanFont});
    page.drawText('Phone No.: (032) 485-8290/485-5109 loc 1700Fax. N0.: (032)4858-290', { x: 343, y: 523, size: 8, font: timesRomanFont });
    
    // FIXED: Footer image with proper ArrayBuffer handling
    const jpgUrl = '/footer.jpeg';
    const jpgResponse = await fetch(jpgUrl);
    const jpgBuffer = await jpgResponse.arrayBuffer();
    const jpgImage = await pdfDoc.embedJpg(new Uint8Array(jpgBuffer));
    const jpgDims = jpgImage.scale(0.3);
 
    page.drawImage(jpgImage, {
        x: 240,
        y: 10,
        width: jpgDims.width,
        height: jpgDims.height,
    });

    /*
    //  DEBUG GRID 
    const GRID_SIZE = 15;
    const PAGE_WIDTH = 936;
    const PAGE_HEIGHT = 612;

    // Vertical grid lines
    for (let x = 0; x <= PAGE_WIDTH; x += GRID_SIZE) {

    // Grid line
    page.drawLine({
        start: { x, y: 0 },
        end: { x, y: PAGE_HEIGHT },
        thickness: 0.3,
        color: rgb(0.85, 0.85, 0.85),
    });

    // X-axis label at BOTTOM
    page.drawText(`${x}`, {
        x: x + 1,
        y: 2,
        size: 5,
        font: timesRomanFont,
        color: rgb(1, 0, 0),
    });
    }

    // Horizontal grid lines
    for (let y = 0; y <= PAGE_HEIGHT; y += GRID_SIZE) {

    // Grid line
    page.drawLine({
        start: { x: 0, y },
        end: { x: PAGE_WIDTH, y },
        thickness: 0.3,
        color: rgb(0.85, 0.85, 0.85),
    });

    // Y-axis label
    page.drawText(`${y}`, {
        x: 2,
        y: y + 1,
        size: 5,
        font: timesRomanFont,
        color: rgb(0, 0, 1),
    });
    }
    */
    
    //Vertical Line
    // 1
    page.drawLine({start: { x: 29.53 , y:401.57  }, end: { x: 29.53 , y:  270 }, thickness: 1.5 , color: rgb(0, 0, 0)});
    // 2
    page.drawLine({start: { x: 64.96 , y:401.57  }, end: { x: 64.96 , y:  293 }, thickness: 1.5 , color: rgb(0, 0, 0)});
    // 3
    page.drawLine({start: { x: 290 , y:401.57  }, end: { x: 290 , y:  293 }, thickness: 1.5 , color: rgb(0, 0, 0)});
    // 4
    page.drawLine({start: { x: 320 , y:370 }, end: { x: 320 , y:  293 }, thickness: 1.5 , color: rgb(0, 0, 0)});
    // 5
    page.drawLine({start: { x: 350 , y:401.57 }, end: { x: 350 , y:  293 }, thickness: 1.5 , color: rgb(0, 0, 0)});
    // 6
    page.drawLine({start: { x: 415.20 , y:401.57  }, end: { x: 415.20 , y:  270 }, thickness: 1.5 , color: rgb(0, 0, 0)});
    // 7
    page.drawLine({start: { x: 515 , y:401.57  }, end: { x: 515 , y:  270 }, thickness: 1.5 , color: rgb(0, 0, 0)});
    // 8
    page.drawLine({start: { x: 605 , y:401.57  }, end: { x: 605 , y:  270 }, thickness: 1.5 , color: rgb(0, 0, 0)});
    // 9
    page.drawLine({start: { x: 705 , y:401.57  }, end: { x: 705 , y:  270}, thickness: 1.5 , color: rgb(0, 0, 0)});
    // 10
    page.drawLine({start: { x: 898.50, y:401.57  }, end: { x: 898.50 , y:  270  }, thickness: 1.5 , color: rgb(0, 0, 0)});

    //horizontal line below the last row of items
    //Below the "Lowest Complying Supplier" text
    page.drawLine({ start: { x: 29.53, y: 270 }, end: { x: 898.98, y: 270 }, thickness: 1.5, color: rgb(0, 0, 0), });
    page.drawLine({ start: { x: 415, y: 386 }, end: { x: 705, y: 386 }, thickness: 1.5, color: rgb(0, 0, 0), });   
};