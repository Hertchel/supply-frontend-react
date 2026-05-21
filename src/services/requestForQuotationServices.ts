import api from "@/api";
import {
  itemQuotationRequestType,
  quotationType,
} from "@/types/request/request_for_quotation";
import {
  itemQuotationResponseType,
  quotationResponseType,
} from "@/types/response/request-for-quotation";
import { ApiResponse } from "@/types/response/api-response";
import { handleError, handleSucess } from "@/utils/apiHelper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const getAllRequestForQuotation = async (): Promise<
  ApiResponse<quotationResponseType[]>
> => {
  try {
    const response = await api.get<quotationResponseType[]>(
      "/api/request-for-quotation/"
    );
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useRequestForQuotation = () => {
  return useQuery<ApiResponse<quotationResponseType[]>, Error>({
    queryFn: getAllRequestForQuotation,
    queryKey: ["request-for-quotations"],
  });
};

export const useRequestForQuotationCount = () => {
  const { data, isLoading } = useRequestForQuotation()
  const requestForQuotationCount = data?.data?.length ?? 0
  return { requestForQuotationCount, isLoading}
}

export const getRequestForQuotation = async (
  rfq_no: string
): Promise<ApiResponse<quotationResponseType>> => {
  try {
    const response = await api.get<quotationResponseType>(
      `/api/request-for-quotation/${rfq_no}`
    );
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useGetRFQDetail = (rfq_no: string) => {
  return useQuery({
    queryKey: ["rfq-detail", rfq_no],
    queryFn: async () => {
      const encodedRFQ = encodeURIComponent(rfq_no);
      const res = await api.get(`/api/rfq/${encodedRFQ}/full/`);
      return res.data; // ✅ THIS IS THE FIX
    },
    enabled: !!rfq_no,
  });
};


export const useGetPurchaseRequestRequestBySupplier = (
  supplier_name: string
) => {
  const { data } = useRequestForQuotation();
  const requestForQuotationWithPr = data?.data
    ?.map((data) => data)
    .filter((data) => data.supplier_name === supplier_name);

  return requestForQuotationWithPr;
};

export const addRequestForQuotation = async (
  data: quotationType
): Promise<ApiResponse<quotationType>> => {
  try {
    const response = await api.post<quotationType>(
      "/api/request-for-quotation/",
      data
    );
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useAddRequestForQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<quotationType>, Error, quotationType>({
    mutationFn: (data) => addRequestForQuotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-for-quotations"] });
    },
  });
};

export const editRequestForQuotation = async (
  data: quotationType
): Promise<ApiResponse<quotationType>> => {
  try {
    const response = await api.put<quotationType>(
      `/api/request-for-quotation/${data.rfq_no}`,
      data
    );
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useEditRequestForQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<quotationType>, Error, quotationType>({
    mutationFn: editRequestForQuotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-for-quotations"] });
      toast.success("Successfully Edit", {
        description: "Edit Request for Quotation Successfully",
      });
    },
  });
};

export const deleteRequestForQuotation = async (
  rfq_no: string
): Promise<ApiResponse<quotationType>> => {
  try {
    const response = await api.delete(`/api/request-for-quotation/${rfq_no}`);
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useDeleteRequestForQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRequestForQuotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-for-quotations"] });
      toast.success("Success", {
        description: "Request For Quotation successfully deleted",
      });
    },
  });
};

export const editItemQuotation = async (
  data: itemQuotationRequestType
): Promise<ApiResponse<itemQuotationRequestType>> => {
  try {
    const response = await api.put<itemQuotationRequestType>(
      `/api/item-quotation/${data.item_quotation_no}`,
      data
    );
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useEditItemQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<itemQuotationRequestType>,
    Error,
    itemQuotationRequestType
  >({
    mutationFn: editItemQuotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items-quotation"] });
    },
  });
};

export const getItemQuotation = async (): Promise<
  ApiResponse<itemQuotationResponseType[]>
> => {
  try {
    const response = await api.get<itemQuotationResponseType[]>(
      "/api/item-quotation/"
    );
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useGetItemQuotation = () => {
  return useQuery<ApiResponse<itemQuotationResponseType[]>, Error>({
    queryFn: getItemQuotation,
    queryKey: ["items-quotation"],
  });
};

export const addItemQuotation = async (
  data: itemQuotationRequestType
): Promise<ApiResponse<itemQuotationRequestType>> => {
  try {
    const response = await api.post<itemQuotationRequestType>(
      "/api/item-quotation/",
      data
    );
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useAddItemQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<itemQuotationRequestType>,
    Error,
    itemQuotationRequestType
  >({
    mutationFn: (data) => addItemQuotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items-quotation"] });
    },
  });
};
/*
export const useRequestForQoutationCount = (pr_no: string) => {
  const { data } = useRequestForQuotation();

  const rfqCount = data?.data
    ?.map((data) => data)
    .filter((data) => data.purchase_request === pr_no).length;

  return rfqCount;
};

export const useRequestForQuotationCountByPR = (pr_no: string) => {
  const { data } = useRequestForQuotation();
  const rfqCount = data?.data
    ?.filter((data) => data.purchase_request === pr_no).length;
  return rfqCount;
};
*/
export const generateRFQPDF = async () => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([615.12, 936]);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanItalicFont = await pdfDoc.embedFont(
    StandardFonts.TimesRomanItalic
  );
  // text upper

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
/*
  page.drawText(rfq.purchase_request, {
    x: 430,
    y: 736.33,
    size: 11,
    font: timesRomanFont,
  });

  page.drawText(rfq.supplier_name, {
    x: 32.5,
    y: 725.02,
    size: 11,
    font: timesRomanFont,
  });

  page.drawText(rfq.supplier_address, {
    x: 32.5,
    y: 695,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText(rfq.tin, { x: 65, y: 665, size: 11, font: timesRomanFont });
  page.drawText(
    rfq.is_VAT ? "[ / ] VAT" : "[ ] VAT",
    {
      x: 230,
      y: 664,
      size: 11,
      font: timesRomanFont,
    },
  );
  page.drawText(
    !rfq.is_VAT ? "[ / ] NON-VAT" : "[ ] NON-VAT",
    {
      x: 290,
      y: 664,
      size: 11,
      font: timesRomanFont,
    },
  );
  */
 page.drawText("[ ] NON-VAT   [ ] NON-VAT",
    {
      x: 275,
      y: 664,
      size: 11,
      font: timesRomanFont,
    });
  page.drawLine({
    start: { x: 30.52, y: 720.87 },
    end: { x: 287, y: 720.87 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
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

  page.drawText("Address", { x: 32.5, y: 678, size: 11, font: timesRomanFont });
  page.drawText("TIN:", { x: 32.5, y: 664, size: 11, font: timesRomanFont });
  page.drawLine({
    start: { x: 67, y: 663.29 },
    end: { x: 211.81, y: 663.29 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
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
  page.drawText("Delivery Period: 15 Days Upon Confirming PO", {
    x: 55,
    y: 291,
    size: 11,
    font: timesRomanFont,
    color: rgb(0, 0, 0.9),
  });
  
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

  //Horizontal Line

  page.drawLine({
    start: { x: 30.52, y: 555 },
    end: { x: 585, y: 555 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  page.drawLine({
    start: { x: 30.52, y: 527 },
    end: { x: 585, y: 527 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 516 },
    end: { x: 585, y: 516 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  page.drawLine({
    start: { x: 30.52, y: 502 },
    end: { x: 585, y: 502 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 488 },
    end: { x: 585, y: 488 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 474 },
    end: { x: 585, y: 474 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 460 },
    end: { x: 585, y: 460 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 446 },
    end: { x: 585, y: 446 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 432 },
    end: { x: 585, y: 432 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 418 },
    end: { x: 585, y: 418 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 404 },
    end: { x: 585, y: 404 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 390 },
    end: { x: 585, y: 390 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 376 },
    end: { x: 585, y: 376 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 362 },
    end: { x: 585, y: 362 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 348 },
    end: { x: 585, y: 348 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 334 },
    end: { x: 585, y: 334 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 320 },
    end: { x: 585, y: 320 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 30.52, y: 306 },
    end: { x: 585, y: 306 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  //Vertical Line
  page.drawLine({
    start: { x: 30.52, y: 555.5 },
    end: { x: 30.52, y: 306 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 60, y: 555.5 },
    end: { x: 60, y: 527.5 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 60, y: 516 },
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

  const pdfBytes = await pdfDoc.save();
  const uint8Array = new Uint8Array(pdfBytes);

  const blob = new Blob([uint8Array.buffer], {
    type: "application/pdf",
  });
  //const blob = new Blob([pdfBytes], { type: "application/pdf" });
  //const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const pdfBlobUrl = URL.createObjectURL(blob);
  return pdfBlobUrl;
};

