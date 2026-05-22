import api from "@/api";
import { useToast } from "@/hooks/use-toast";
import {
  abstractType,
  supplierItemType,
  supplierType,
} from "@/types/request/abstract_of_quotation";
import {
  abstractType_,
  supplierItemType_,
  supplierType_,
} from "@/types/response/abstract-of-quotation";
import { ApiResponse } from "@/types/response/api-response";
import { handleError, handleSucess } from "@/utils/apiHelper";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const getAllAbstractOfQuotation = async (): Promise<
  ApiResponse<abstractType_[]>
> => {
  try {
    const response = await api.get<abstractType_[]>(
      "api/abstract-of-quotation/"
    );
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useAbstractOfQuotation = () => {
  return useQuery<ApiResponse<abstractType_[]>, Error>({
    queryKey: ["abstract-of-quotations"],
    queryFn: getAllAbstractOfQuotation,
    refetchInterval: 5000,
    refetchOnMount: true, 
    refetchOnWindowFocus: true 
  });
};

export const useAbstractOfQuotationCount = () => {
  const { data, isLoading } = useAbstractOfQuotation()
  const abstractCount = data?.data?.length ?? 0
  return { abstractCount, isLoading}
}

export const getAbstractOfQuotation = async (afq_no:string):Promise<ApiResponse<abstractType_>> => {
  try {
    const response = await api.get<abstractType_>(`api/abstract-of-quotation/${afq_no}`)
    return handleSucess(response)
  } catch (error) {
    return handleError(error)
  }
}

export const useGetAbstractOfQuotation = (aoq_no: string) => {
  return useQuery<ApiResponse<abstractType_>, Error>({
    queryKey: ["abstract-of-quotations", aoq_no],
    queryFn: () => getAbstractOfQuotation(aoq_no)
  })
}



export const addAbstractOfQuotation = async (
  data: abstractType
): Promise<ApiResponse<abstractType>> => {
  try {
    const response = await api.post("/api/abstract-of-quotation/", data);
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useAddAbstractOfQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<abstractType>, Error, abstractType>({
    mutationFn: (data) => addAbstractOfQuotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["abstract-of-quotations"] });
    },
  });
};

export const addSupplier = async (
  data: supplierType
): Promise<ApiResponse<supplierType>> => {
  try {
    const response = await api.post<supplierType>("api/supplier/", data);
    console.log(response)
    return handleSucess(response);
  } catch (error) {
    console.log(error)
    return handleError(error);
  }
};

export const useAddSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<supplierType>,
    Error,
    supplierType
  >({
    mutationFn: (data) => addSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};

export const addSupplierItem = async (
  data: supplierItemType
): Promise<ApiResponse<supplierItemType>> => {
  try {
    const response = await api.post<supplierItemType>("api/supplier-item/", data);
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useAddSupplierItem = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<supplierItemType>,
    Error,
    supplierItemType
  >({
    mutationFn: (data) => addSupplierItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-items"] });
    },
  });
};

export const getAllSupplierItem = async (): Promise<
  ApiResponse<supplierItemType_[]>
> => {
  try {
    const response = await api.get<supplierItemType_[]>(
      "api/supplier-item/"
    );
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useGetAllSupplierItem = () => {
  return useQuery<ApiResponse<supplierItemType_[]>>({
    queryKey: ["supplier-items"],
    queryFn: getAllSupplierItem,
  });
};

export const getAllSupplier = async (): Promise<
  ApiResponse<supplierType_[]>
> => {
  try {
    const response = await api.get<supplierType_[]>(
      "api/supplier/"
    );
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useGetAllSupplier = () => {
  return useQuery<ApiResponse<supplierType_[]>>({
    queryKey: ["suppliers"],
    queryFn: getAllSupplier,
  });
};

export const updateSupplierIsAddedToTrue = async ({supplier_no}:{supplier_no:string}) => {
  try {
    const response = await api.patch(`api/supplier/${supplier_no}/update/`, {is_added: true})
    console.log(response)
    return handleSucess(response)
  } catch (error) {
    console.log(error)
    return handleError(error)
  }
}

export const useUpdateSupplierIsAddedToTrue = () => {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<unknown>, Error, {supplier_no: string}>({
    mutationFn: ({supplier_no}) => updateSupplierIsAddedToTrue({supplier_no}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["suppliers"]})
    }
  })
}


export const deleteAbstractOfQuoutation = async (
  aoq_no: string
): Promise<ApiResponse<abstractType>> => {
  try {
    const response = await api.delete(`api/abstract-of-quotation/${aoq_no}`);
    return handleSucess(response);
  } catch (error) {
    return handleError(error);
  }
};

export const useDeleteAbstractOfQuotation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast()
  return useMutation({
    mutationFn: deleteAbstractOfQuoutation,
    mutationKey: ["abstract-of-quotations"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["abstract-of-quotations"] });
      toast({title: "Success", description: "Abstract of Quotation Successfully Deleted"})
    },
  });
};

export const filterAOQInItemSelectedQuote = (
  data: abstractType,
  afq_no: string
) => {
  const items = Array.isArray(data) ? data : [];
  return items.filter((item) => item.afq === afq_no);
};

export const generateEmptyAOQPDF = async () => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([936, 612]);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

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
      page.drawText('CEBU TECHNOLOGICAL UNIVERSITY', { x: 348, y: 565, size: 12, font: timesBoldFont });
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

  // text

  page.drawText("ABSTRACT OF QUOTATIONS", {
    x: 383,
    y: 496.06,
    size: 14,
    font: timesBoldFont,
  });

  page.drawText("Project Name:", {
    x: 194.49,
    y: 473.19,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("Date of Posting:", {
    x: 186.61,
    y: 456.38,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("Project Location:", {
    x: 182,
    y: 442.91,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("Implementing Office:", {
    x: 162.5,
    y: 428,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("Approved Budget:", {
    x: 176.7,
    y: 413,
    size: 11,
    font: timesRomanFont,
  });

  page.drawText("# of Sheets:", {
    x: 644.29,
    y: 473.19,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("Award Resolution No.:", {
    x: 594,
    y: 456.38,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("Date and Time:", {
    x: 627.7,
    y: 442.91,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("Mode of Procurement:", {
    x: 597,
    y: 428,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("PR/Control No.:", {
    x: 624,
    y: 413,
    size: 11,
    font: timesRomanFont,
  });

  page.drawText(
    "WE CERTIFY that we opened the bids of the above-listed materials, the abstract of which appears, as the time and date indicated.",
    { x: 56.69, y: 225, size: 11, font: timesRomanFont }
  );
  page.drawText("Bids and Awards Committee:", {
    x: 31.18,
    y: 215,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("Conforme:", {
    x: 547.08,
    y: 153.07,
    size: 11,
    font: timesRomanFont,
  });

  page.drawText("No.", { x: 40, y: 375, size: 11, font: timesBoldFont });
  page.drawText("Items", { x: 200, y: 375, size: 11, font: timesBoldFont });
  page.drawText("Quantity", { x: 375, y: 375, size: 11, font: timesBoldFont });

  page.drawText("Agency", { x: 435.07, y: 383, size: 11, font: timesBoldFont });
  page.drawText("Price", { x: 440, y: 370, size: 11, font: timesBoldFont });

  page.drawText("WINNING BIDDER", {
    x: 578,
    y: 375,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("WINNING PRICE  ", {
    x: 795,
    y: 375,
    size: 11,
    font: timesBoldFont,
  });

  //text signature
  page.drawText("ROSALYN P. ALBURO", {
    x: 80.39,
    y: 180,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("BAC Member", {
    x: 96.92,
    y: 165,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("VEVENCIO A. ALONSO JR.", {
    x: 334.72,
    y: 180,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("BAC Member", {
    x: 381.93,
    y: 165,
    size: 11,
    font: timesRomanFont,
  });

  page.drawText("End-user", {
    x: 726.77,
    y: 115.75,
    size: 11,
    font: timesRomanFont,
  });

  page.drawText("JEAN F. PUERTO, Dev.Ed.D", {
    x: 68.57,
    y: 128,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("BAC Member", {
    x: 96.92,
    y: 113,
    size: 11,
    font: timesRomanFont,
  });
  page.drawText("LEVI U. PANGAN, LPT", {
    x: 331.46,
    y: 128,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("BAC Vice-Chairman", {
    x: 371.14,
    y: 113,
    size: 11,
    font: timesRomanFont,
  });

  page.drawText("CHARISSA JANE S. SAMBOLA, CPA", {
    x: 200,
    y: 60,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("BAC Chairperson", {
    x: 225.14,
    y: 50,
    size: 11,
    font: timesRomanFont,
  });

  page.drawText("EINGILBERT C. BENOLIRAO, Dev.Ed.D.", {
    x: 658.44,
    y: 78,
    size: 11,
    font: timesBoldFont,
  });
  page.drawText("Campus Director / Head of Procuring Entity", {
    x: 665,
    y: 62.87,
    size: 11,
    font: timesRomanFont,
  });

  //Horizontal Line
  page.drawLine({
    start: { x: 29.53, y: 401.57 },
    end: { x: 898.98, y: 401.57 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 29.53, y: 354.33 },
    end: { x: 898.98, y: 354.33 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });

  //Horizontal Line on Table
  page.drawLine({
    start: { x: 29.53, y: 338.63 },
    end: { x: 898.98, y: 338.63 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 29.53, y: 324.15 },
    end: { x: 898.98, y: 324.15 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 29.53, y: 306.14 },
    end: { x: 898.98, y: 306.14 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 29.53, y: 289.14 },
    end: { x: 898.98, y: 289.14 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 29.53, y: 272.13 },
    end: { x: 898.98, y: 272.13 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 29.53, y: 255.12 },
    end: { x: 898.98, y: 255.12 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 29.53, y: 238.11 },
    end: { x: 898.98, y: 238.11 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });

  //Vertical Line
  page.drawLine({
    start: { x: 29.53, y: 402.3 },
    end: { x: 29.53, y: 238.11 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 64.96, y: 402.3 },
    end: { x: 64.96, y: 238.11 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 366.14, y: 402.3 },
    end: { x: 366.14, y: 238.11 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 425.2, y: 402.3 },
    end: { x: 425.2, y: 238.11 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 480.31, y: 402.3 },
    end: { x: 480.31, y: 238.11 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 780.38, y: 402.3 },
    end: { x: 780.38, y: 238.11 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: 898.5, y: 402.3 },
    end: { x: 898.5, y: 238.11 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  const fixedBuffer = new Uint8Array(pdfBytes).buffer;
  const blob = new Blob([fixedBuffer], { type: "application/pdf" });
  //const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const pdfBlobUrl = URL.createObjectURL(blob);
  return pdfBlobUrl;
};
