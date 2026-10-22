import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/services/formatDate";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import {
  ArrowLeftIcon,
  ArrowRight,
  BuildingIcon,
  CalendarIcon,
  ClipboardIcon,
  CreditCardIcon,
  Loader2,
  MapPinIcon,
  PrinterIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../shared/components/Loading";
import {
  useGetAbstractOfQuotation,
  useGetAllSupplierItem,
} from "@/services/AbstractOfQuotationServices";
import { generateAOQPDF } from "@/services/generateAOQPDF";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetRFQDetail,
  useRequestForQuotation,
  useGetItemQuotation,
} from "@/services/requestForQuotationServices";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePurchaseRequestActions } from "@/services/purchaseRequestServices";
import { MessageDialog } from "../../shared/components/MessageDialog";
import LoadingDialog from "../../shared/components/LoadingDialog";
import useStatusStore from "@/store";
import { useGetAllBACmember } from "@/services/BACmemberServices";

interface messageDialogProps {
  open: boolean;
  message: string;
  title: string;
  type: "error" | "success" | "info";
}

export const AbstractItemContentList = () => {
  const [isInformationDialogOpen, setIsInformationDialogOpen] =
    useState<boolean>(false);
  const [rfqNo, setRfqNo] = useState<string | undefined>(undefined);
  const [messageDialog, setMessageDialog] = useState<messageDialogProps>({
    open: false,
    message: "",
    title: "",
    type: "success" as const,
  });

  const { aoq_no } = useParams();
  if (!aoq_no) {
    return <Loading />;
  }
  const { status, setStatus } = useStatusStore();
  const navigate = useNavigate();
  console.log(status);
  const { handleReadyToOrder, isPendingReadyToOrder, isSuccess } =
    usePurchaseRequestActions();
  const { data: abstract, isLoading: abstract_loading } =
    useGetAbstractOfQuotation(aoq_no!);

  const { data: items, isLoading } = useGetAllSupplierItem();
  const { data: bac_members } = useGetAllBACmember();
  const { data: rfqs } = useRequestForQuotation();
  const {data: itemQuotationResponse,isLoading: itemQuotationsLoading,} = useGetItemQuotation();
  const rfqData = useMemo(() => {
    return Array.isArray(rfqs?.data) ? rfqs.data : [];
  }, [rfqs?.data]);

  const bacMembersData = useMemo(() => {
    return Array.isArray(bac_members?.data) ? bac_members.data : [];
  }, [bac_members?.data]);

  const supplierItemData = useMemo(() => {
    return Array.isArray(items?.data) ? items.data : [];
  }, [items?.data]);

  const filteredSupplierItemData = useMemo(() => {
    return supplierItemData.filter(
      (data) => data.supplier_details?.aoq_details?.aoq_no === aoq_no,
    );
  }, [supplierItemData, aoq_no]);

  filteredSupplierItemData.forEach((item, index) => {
    console.log(
      index,
      item.rfq_details.rfq_no,
      item.rfq_details.supplier_name,
      item.item_quotation_details.unit_price,
    );
  });
  console.log(filteredSupplierItemData);

  const abstractData = abstract && abstract.data;

  const quotationsForPR = useMemo(() => {
    const prNo = abstractData?.pr_details?.pr_no;

    if (!prNo) return [];

    // All RFQs belonging to this Purchase Request.
    const relevantRfqs = rfqData.filter(
      (rfq) => rfq.purchase_request === prNo
    );

    // Match each quotation to its supplier through the RFQ.
    const rfqByNo = new Map(
      relevantRfqs.map((rfq) => [rfq.rfq_no, rfq])
    );

    const allItemQuotations = Array.isArray(itemQuotationResponse?.data)
      ? itemQuotationResponse.data
      : [];

    return allItemQuotations
      .filter((quotation) => rfqByNo.has(quotation.rfq))
      .map((quotation) => {
        const rfq = rfqByNo.get(quotation.rfq)!;
        const itemDetails = quotation.item_details;

        const unitPrice = Number(quotation.unit_price ?? 0);
        const quantity = Number(
          quotation.unit_quantity ?? itemDetails?.quantity ?? 0
        );

        return {
          rfq_details: {
            rfq_no: rfq.rfq_no,
            supplier_name: rfq.supplier_name,
            purchase_request: rfq.purchase_request,
          },
          supplier_details: {
            name: rfq.supplier_name,
          },
          item_quotation_details: {
            item_details: itemDetails,
            unit_price: String(unitPrice),
          },
          total_amount: String(unitPrice * quantity),
          item_description: itemDetails?.item_description,
          item_id: itemDetails?.item_no,
        };
      });
  }, [
    abstractData?.pr_details?.pr_no,
    rfqData,
    itemQuotationResponse?.data,
  ]);

  quotationsForPR.forEach((supplier, index) => {
    console.log(
      index,
      supplier.rfq_details.supplier_name,
      supplier.item_quotation_details.unit_price,
    );
  });

  const pr_no = abstractData?.pr_details.pr_no;

  const NOAData = useMemo(() => {
    return supplierItemData.find(
      (data) => data.supplier_details?.aoq_details?.aoq_no === aoq_no,
    );
  }, [supplierItemData, aoq_no]);
  console.log(NOAData);

  useEffect(() => {
    if (isSuccess) {
      setStatus("Ready to Order");

      return () => {
        setStatus("idle");
      };
    }
  }, [setStatus, isSuccess]);

  if (isLoading || abstract_loading || itemQuotationsLoading) {
  return <Loading />;
}

  const isAlreadyForwardedToSupply =
    abstractData?.pr_details.status === "Ready to Order";

  const handleGenerateAOQPDF = async () => {
    if (!bacMembersData || bacMembersData.length === 0) {
      console.error("BAC MEMBERS NOT LOADED");
      return;
    }

    if (!filteredSupplierItemData || filteredSupplierItemData.length === 0) {
      console.log("Filtered AOQ items:", filteredSupplierItemData);
      console.log("aoq_no param:", aoq_no);
      console.error("No AOQ data found");
      return;
    }

    console.log(
    "All quotations for this PR:",
    quotationsForPR.map((item) => ({
      supplier:
        item.supplier_details?.name ??
        item.rfq_details?.supplier_name,
      item:
        item.item_quotation_details?.item_details?.item_description,
      totalAmount: item.total_amount,
    }))
  );

  console.table(
    quotationsForPR.map((quotation) => ({
      supplier: quotation.rfq_details.supplier_name,
      item: quotation.item_description,
      unitPrice: quotation.item_quotation_details.unit_price,
      totalAmount: quotation.total_amount,
    }))
  );

    const url = await generateAOQPDF(
      filteredSupplierItemData,
      quotationsForPR,
      bacMembersData
    );

    if (!url) {
      console.error("PDF generation failed");
      return;
    }

    /*window.open(url, "_blank");*/
  };

  // const handleGenerateNOAPDF = async () => {
  //   try {
  //     const blob = await pdf(generateNOAPDF(NOAData!)).toBlob();

  //     // Create a Blob URL
  //     const blobUrl = URL.createObjectURL(blob);

  //     // Open the Blob URL in a new tab
  //     window.open(blobUrl, "_blank");
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //   }
  // };

  // const handleGenerateNTPPDF = async () => {
  //   try {
  //     const blob = await pdf(generateNTPPDF(NOAData!)).toBlob();

  //     // Create a Blob URL
  //     const blobUrl = URL.createObjectURL(blob);

  //     // Open the Blob URL in a new tab
  //     window.open(blobUrl, "_blank");
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //   }
  // };

  const handleOpenSupplierInformation = (rfq_no: string) => {
    setIsInformationDialogOpen(true);
    setRfqNo(rfq_no);
  };

  const handleForwardToProcurement = async () => {
    try {
      await handleReadyToOrder(pr_no!);

      setMessageDialog({
        open: true,
        message: "Forwarded Successfully",
        title: "Success",
        type: "success",
      });

      setStatus("Ready to Order");
    } catch (error) {
      setMessageDialog({
        open: true,
        message: "Something went wrong, Please try again later",
        title: "Error",
        type: "error",
      });
    }
  };

  return (
    <div className="w-full">
      <Button className="my-2" onClick={() => navigate(-1)}>
        <ArrowLeftIcon className="h-4 w-4" /> Back
      </Button>
      <Card className="w-full bg-slate-100">
        <CardHeader className="flex flex-col">
          <CardTitle className="">
            <div>
              <div className="flex items-center justify-between">
                <div className="">
                  <p className="">{abstractData?.aoq_no}</p>
                  <div className="flex items-center pt-2">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    <p className="text-sm font-thin">
                      {abstractData?.created_at &&
                        formatDate(abstractData?.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  {!isAlreadyForwardedToSupply && (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            onClick={handleForwardToProcurement}
                            disabled={isAlreadyForwardedToSupply}
                          >
                            Forward to Supply
                            <ArrowRight
                              width={20}
                              height={20}
                              className="mx-2"
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-thin">
                            Ready to Order? Forward to Supply
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              <Separator className="mt-3" />
              <div className="my-2 flex gap-1">
                <Button variant={"outline"} onClick={handleGenerateAOQPDF}>
                  <PrinterIcon width={20} height={20} className="mx-2" />
                  Generate AOQ PDF
                </Button>
                {/* <Button variant={"outline"} onClick={handleGenerateNOAPDF}>
                  <PrinterIcon width={20} height={20} className="mx-2" />
                  Generate NOA PDF
                </Button>
                <Button variant={"outline"} onClick={handleGenerateNTPPDF}>
                  <PrinterIcon width={20} height={20} className="mx-2" />
                  Generate NTP PDF
                </Button> */}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="border-2 mx-6 p-4 rounded-md">
          <div className="flex gap-2 item-center">
            <ClipboardIcon className="h-6 w-6" />
            <p className="text-xl">Abstract of Quotations</p>
          </div>
          <div className="grid grid-cols-8 gap-2 items-center py-2  border-b-2 sticky top-0">
            <p className="text-base">No.</p>
            <p className="text-base col-span-2">ITEM DESCRIPTION</p>
            <p className="text-base">QUANTITY</p>
            <p className="text-base">PRICE</p>
            <p className="text-base col-span-2">WINNING BIDDER</p>
            <p className="text-base">WINNING PRICE</p>
          </div>
          {filteredSupplierItemData && filteredSupplierItemData?.length > 0 ? (
            filteredSupplierItemData?.map((item, index) => {
              return (
                <div
                  className="grid grid-cols-8 gap-2 items-center py-6 border-b-2"
                  key={item.item_quotation_details.item_details.item_no}
                >
                  <p className="text-gray-500">{index + 1}</p>
                  <p className="text-gray-500 col-span-2">
                    {item.item_quotation_details.item_details.item_description}
                  </p>
                  <p className="text-gray-500">{item.item_quantity}</p>
                  <p className="text-gray-500">{item.item_cost}</p>

                  <p
                    className="text-gray-500 col-span-2 underline hover:cursor-pointer"
                    onClick={() =>
                      handleOpenSupplierInformation(item.rfq_details.rfq_no)
                    }
                  >
                    {item.rfq_details.supplier_name}
                  </p>

                  <p
                    className={`${
                      item.item_quotation_details.is_low_price
                        ? "text-green-400"
                        : "text-red-400"
                    } flex gap-2 items-center`}
                  >
                    {item.item_quotation_details.is_low_price ? (
                      <CheckIcon />
                    ) : (
                      <Cross2Icon />
                    )}
                    {item.item_quotation_details.unit_price}
                  </p>
                </div>
              );
            })
          ) : (
            <p>No items Found</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>

      <SupplierInformation
        rfqNo={rfqNo!}
        isInformationDialogOpen={isInformationDialogOpen}
        setIsInformationDialogOpen={setIsInformationDialogOpen}
      />
      <MessageDialog
        open={messageDialog.open}
        message={messageDialog.message}
        title={messageDialog.title}
        type={messageDialog.type}
        onOpenChange={(open) => setMessageDialog((prev) => ({ ...prev, open }))}
      />

      <LoadingDialog open={isPendingReadyToOrder} message="Forwarding..." />
    </div>
  );
};
interface SupplierInformationProps {
  isInformationDialogOpen: boolean;
  setIsInformationDialogOpen: (open: boolean) => void;
  rfqNo: string;
}

export const SupplierInformation: React.FC<SupplierInformationProps> = ({
  rfqNo,
  isInformationDialogOpen,
  setIsInformationDialogOpen,
}) => {
  if (!rfqNo) return null;

  const { data, isLoading } = useGetRFQDetail(rfqNo);
  const rfqData = data?.data?.rfq;

  return (
    <Dialog
      open={isInformationDialogOpen}
      onOpenChange={setIsInformationDialogOpen}
    >
      <DialogHeader>
        <DialogTitle></DialogTitle>
      </DialogHeader>
      <DialogContent>
        {isLoading ? (
          <p className="flex">
            <Loader2 className="animate-spin mx-2" /> Loading...
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center">
              <BuildingIcon className="w-5 h-5 mr-1" />
              <p className="text-lg font-thin">{rfqData?.supplier_name}</p>
            </div>
            <Separator />
            <div className="flex items-center">
              <MapPinIcon className="w-5 h-5 mr-1" />
              <p className="text-lg font-thin">{rfqData?.supplier_address}</p>
            </div>
            <Separator />
            <div className="flex items-center">
              <CreditCardIcon className="w-4 h-4 mr-1" />
              <p className="text-lg font-thin">{rfqData?.tin}</p>
            </div>
            <Separator />
            <Badge variant={"outline"} className="flex items-center">
              <p className="text-lg font-thin">
                {rfqData?.is_VAT ? "VAT" : "non-VAT"}
              </p>
            </Badge>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
