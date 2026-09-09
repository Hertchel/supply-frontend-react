import { useNavigate, useParams } from "react-router-dom";
import { usePurchaseRequestList } from "@/services/purchaseRequestServices";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useEffect } from "react";
import Loading from "../../shared/components/Loading";
import { MessageDialog } from "../../shared/components/MessageDialog";
import {
  useGetItemQuotation,
  useRequestForQuotation
} from "@/services/requestForQuotationServices";

import {
  CalendarIcon,
  DownloadIcon,
  FileText,
  SquareArrowOutUpRightIcon,
  TargetIcon,
  UserIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QuotationCard } from "./QuotationCard";
import {
  generateEmptyAOQPDF,
  useAbstractOfQuotation,
  useGetAllSupplierItem,
} from "@/services/AbstractOfQuotationServices";
import { generateAOQPDF } from "@/services/generateAOQPDF";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/services/formatDate";
import { useGetAllBACmember } from "@/services/BACmemberServices";

export default function Abstract() {
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);
  const [messageDialog, setMessageDialog] = useState({
    open: false,
    message: "",
    title: "",
    type: "error" as "success" | "error" | "info",
  });
  const { pr_no } = useParams();

    useAbstractOfQuotation();
  const { data: items } = useGetAllSupplierItem();
  const { data: bac_members } = useGetAllBACmember()

  const { data: rfqs } = useRequestForQuotation();
  const { data: itemQuotations } = useGetItemQuotation();

  const bacMembersData = useMemo(() => {
    return Array.isArray(bac_members?.data) ? bac_members.data : [] 
  }, [bac_members?.data])

  const supplierItemData = useMemo(() => {
    return Array.isArray(items?.data) ? items.data : []
  }, [items?.data])

  const itemQuotationData = useMemo(() => {
    return Array.isArray(itemQuotations?.data)
      ? itemQuotations.data
      : [];
  }, [itemQuotations?.data]);

  const quotationsForPR = useMemo(() => {

    const rfqData = Array.isArray(rfqs?.data)
      ? rfqs.data
      : [];

    return itemQuotationData.filter((quotation) => {

      const matchingRFQ = rfqData.find(
        rfq => rfq.rfq_no === quotation.rfq
      );

      return (
        matchingRFQ?.purchase_request?.toString() ===
        pr_no?.toString()
      );

    });

  }, [
    itemQuotationData,
    rfqs?.data,
    pr_no
  ]);

  const filteredSupplierItem = useMemo(() => {
  return supplierItemData.filter((data) => {
    return (
      data.rfq_details.purchase_request?.toString() ===
      pr_no?.toString()
    );
  });
}, [supplierItemData, pr_no]);

/*
  const filteredSupplierItem = useMemo(() => {
    return supplierItemData.filter(data => data.rfq_details.purchase_request === pr_no)
  }, [supplierItemData, pr_no])
  */

  const {
    isLoading,
    data: purchase_request,
    error,
  } = usePurchaseRequestList(pr_no!);

  const purchaseRequestData = purchase_request?.data;

  const navigate = useNavigate();


  useEffect(() => {
    const fetchPdfUrl = async () => {
      const url = await generateEmptyAOQPDF();
      setPdfUrl(url);
    };
    fetchPdfUrl();
  }, []);


  if (isLoading) return <Loading />;
  if (error) return <div>{error.message}</div>;

  const handlePrintClick = async () => {
    if (filteredSupplierItem.length === 0) {
      setMessageDialog({
        open: true,
        message: "Cannot generate the Abstract of Quotation because this Purchase Request has not selected a supplier yet.",
        title: "No Supplier Selected",
        type: "error",
      });

      return;
    }

    if (quotationsForPR.length === 0) {
      setMessageDialog({
        open: true,
        message: "Cannot generate the Abstract of Quotation because there are no item quotations available.",
        title: "No Quotations Available",
        type: "error",
      });

      return;
    }

    if (bacMembersData.length === 0) {
      setMessageDialog({
        open: true,
        message: "Cannot generate the Abstract of Quotation because no BAC members are available.",
        title: "BAC Members Unavailable",
        type: "error",
      });

      return;
    }

    const url = await generateAOQPDF(
      filteredSupplierItem,
      quotationsForPR,
      bacMembersData
    );

    if (!url) {
      setMessageDialog({
        open: true,
        message: "The Abstract of Quotation PDF could not be generated. Please try again.",
        title: "PDF Generation Failed",
        type: "error",
      });

      return;
    }

    window.open(url, "_blank");
  };

  return (
  
    <div className="w-full">
      <Card className="w-full bg-slate-100">
        <CardHeader className="flex flex-col">
          <CardTitle className="">
            <div>
              <div className="flex items-center justify-between">
                <div className="">
                  <p className="font-thin">{purchaseRequestData?.pr_no}</p>
                  <div className="flex items-center pt-2">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    <p className="text-sm font-thin">
                      {purchaseRequestData?.created_at &&
                        formatDate(purchaseRequestData?.created_at)}
                    </p>
                  </div>
                </div>

                <Badge>{purchaseRequestData?.status}</Badge>
              </div>
              <Separator className="mt-3" />
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  <p className="text-lg font-thin">
                    {purchaseRequestData?.requisitioner_details.name}
                  </p>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center">
                  <TargetIcon className="w-4 h-4 mr-1" />
                  <p className="text-lg font-thin">
                    {purchaseRequestData?.purpose}
                  </p>
                </div>
              </div>
            </div>
          </CardTitle>
          <div className="py-4">
            <div className="flex justify-between gap-1">
               <Button
                className="bg-green-400 hover:bg-green-500"
                onClick={() =>
                  navigate(`/bac/item-selected-quotation/${pr_no}`)
                }
              >
                <p className="mr-2">View Abstract of Quotation</p>
                <SquareArrowOutUpRightIcon className="w-4 h-4 mr-2" />
              </Button>
              <div className="flex gap-4">
                <TooltipProvider delayDuration={100} skipDelayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="px-7 bg-orange-300 hover:bg-orange-200 text-slate-950"
                        onClick={handlePrintClick}
                      >
                        Generate AOQ <FileText className="h-5 w-5 ml-2"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Print AOQ Details
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button className="px-7 bg-orange-300 hover:bg-orange-200 text-slate-950">
                        <a
                          href={pdfUrl}
                          download={"Request_For_Quotation_Form.pdf"}
                        >
                          <DownloadIcon strokeWidth={1.3} />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Download Empty AOQ Form
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <Separator className="pt-0 text-orange-300 bg-orange-200" />
        </CardHeader>
        <CardContent>
          <QuotationCard isDeleteAllowed={false} title={"All Supplier"} />
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
      <MessageDialog
        message={messageDialog.message}
        title={messageDialog.title}
        type={messageDialog.type}
        open={messageDialog.open}
        onOpenChange={(open) =>
          setMessageDialog((prev) => ({ ...prev, open }))
        }
      />
    </div>
  );
}
