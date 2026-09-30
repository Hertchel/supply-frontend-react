import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/services/formatDate";
import Loading from "../../shared/components/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClipboardIcon,
  CreditCardIcon,
  FileText,
  Loader2,
  MapPinIcon,
  MoveHorizontal,
  AlertCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetItemsDeliveredInPurchaseRequest } from "@/services/puchaseOrderServices";
import GenerateICSPDFDialog from "./ItemDistributeDialog";
import Layout from "./Layout/SupplyDashboardLayout";
// import { generateRISPDF } from "@/utils/generateRISPDF";
import { usePurchaseRequestActions } from "@/services/purchaseRequestServices";
import { MessageDialog } from "../../shared/components/MessageDialog";
import { generateIARPDF } from "@/utils/generateIARPDF";
import useStatusStore from "@/store";

interface messageDialogProps {
  open: boolean;
  message: string;
  type: "success" | "error" | "info";
  title: string;
}

export const ItemDistributionList = () => {
  const [messageDialog, setMessageDialog] = useState<messageDialogProps>({
    open: false,
    type: "success" as const,
    title: "",
    message: "",
  });
  const navigate = useNavigate();
  const { pr_no } = useParams();
  const { status, setStatus } = useStatusStore();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDistributionConfirmOpen, setIsDistributionConfirmOpen] =
    useState<boolean>(false);

  const [verifiedItems, setVerifiedItems] = useState<Set<string>>(
    new Set()
  );

  const { handleDistribute, isError, isSuccess, isPendingDistribute } =
    usePurchaseRequestActions();
  const { data: item_delivered, isLoading: isItemsDeliveredLoading } =
    useGetItemsDeliveredInPurchaseRequest({ pr_no: pr_no });

  const handleOpenDistributionConfirmation = () => {
    setVerifiedItems(new Set());
    setIsDistributionConfirmOpen(true);
  };

  const handleVerifyItem = (itemKey: string) => {
    setVerifiedItems((prev) => {
      const updated = new Set(prev);

      if (updated.has(itemKey)) {
        updated.delete(itemKey);
      } else {
        updated.add(itemKey);
      }

      return updated;
    });
  };

  const handleVerifyAllItems = () => {
    if (verifiedItems.size === filteredItemsDeliveredData.length) {
      // Deselect all
      setVerifiedItems(new Set());
      return;
    }

    // Select all
    const allItemKeys = filteredItemsDeliveredData.map(
      (item) =>
        item.item_details.item_quotation_details.item_details
          .stock_property_no
    );

    setVerifiedItems(new Set(allItemKeys));
  };

  const itemsDeliveredData = useMemo(() => {
    return Array.isArray(item_delivered?.data) ? item_delivered.data : [];
  }, [item_delivered?.data]);

  const filteredItemsDeliveredData = useMemo(() => {
    return itemsDeliveredData.filter((data) => {
      const status =
        data.pr_details.status?.toLowerCase()?.trim();

      return [
        "ready for distribution",
        "completed",
        "distributed",
      ].includes(status);
    });
  }, [itemsDeliveredData]);

  useEffect(() => {
    if (isSuccess) {
      setStatus("Completed");

      return () => {
        setStatus("idle");
      };
    }
  }, [setStatus, isSuccess]);

  const isAlreadyDistributed = status === "Completed";

  console.log(filteredItemsDeliveredData);
  console.log("DELIVERED QUANTITY CHECK:");

  filteredItemsDeliveredData.forEach((item) => {
    console.log({
      item: item.item_details.item_quotation_details.item_details.item_description,
      received: item.quantity_delivered,
      requested:
        item.item_details.item_quotation_details.item_details.quantity,
    });
  });

  if (isItemsDeliveredLoading) return <Loading />;

  const handleGenerateIARPDF = async () => {
    const url = await generateIARPDF(filteredItemsDeliveredData);
    window.open(url, "_blank");
  };

  const handleDistributeClick = async () => {
    await handleDistribute(pr_no!);
    if (isSuccess) {
      setIsDistributionConfirmOpen(false);
      setMessageDialog({
        open: true,
        message: "Distributed Successfully ",
        title: "Success",
        type: "success",
      });
    }

    if (isError) {
      setMessageDialog({
        open: true,
        message: "Something went wrong, Please try again later",
        title: "Error",
        type: "error",
      });
    }
  };
  const allItemsVerified =
    filteredItemsDeliveredData.length > 0 &&
    filteredItemsDeliveredData.every((item) =>
      verifiedItems.has(
        item.item_details.item_quotation_details.item_details
          .stock_property_no
      )
    );

  return (
    <Layout>
      <div className=" w-full">
        <Button className="mb-2" onClick={() => navigate(-1)}>
          <span className="flex gap-2 items-center">
            <ArrowLeftIcon className="h-5 w-5" />
            <p>Back</p>
          </span>
        </Button>
        <Card className="w-full bg-slate-100">
          <CardHeader className="flex flex-col">
            <CardTitle className="">
              <div>
                <div className="flex items-center justify-between">
                  <div className="">
                    <p className="font-thin">
                      {filteredItemsDeliveredData &&
                        filteredItemsDeliveredData.length > 0 &&
                        filteredItemsDeliveredData[0].pr_details.pr_no}
                    </p>
                    <div className="flex items-center pt-2">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      <p className="text-base font-thin">
                        {filteredItemsDeliveredData[0]?.created_at &&
                          formatDate(filteredItemsDeliveredData[0]?.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {!isAlreadyDistributed && (
                      <TooltipProvider
                        delayDuration={100}
                        skipDelayDuration={200}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button onClick={handleOpenDistributionConfirmation}>
                              {isPendingDistribute ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                "Distribute"
                              )}
                              <MoveHorizontal
                                width={20}
                                height={20}
                                className="mx-2"
                              />{" "}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            Click to distribute
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
                <Separator className="mt-3" />
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <p className="text-lg font-thin">
                      {
                        filteredItemsDeliveredData[0]?.pr_details
                          .requisitioner_details.name
                      }
                    </p>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center">
                    <CreditCardIcon className="w-4 h-4 mr-1" />
                    <p className="text-lg font-thin">
                      {filteredItemsDeliveredData[0]?.pr_details.purpose}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 mt-2">
                  <TooltipProvider delayDuration={100} skipDelayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="bg-green-200 hover:bg-green-300"
                          onClick={handleGenerateIARPDF}
                        >
                          <FileText width={20} height={20} className="mx-2" />{" "}
                          Generate IAR PDF
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        Click to Generate IAR PDF
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="border-2 mx-6 rounded-md p-4 ">
            <div className=" my-2 flex gap-3 items-center">
              <ClipboardIcon className="h-6 w-6" />
              <p className="text-xl">Items Delivered</p>
            </div>
            <div className="grid grid-cols-8 gap-2 items-center py-2  border-b-2 sticky top-0">
              <p className="text-base">UNIT</p>
              <p className="text-base col-span-2">ITEM DESCRIPTION</p>
              <p className="text-base">QUANTITY</p>
              <p className="text-base">UNIT COST</p>
              <p className="text-base col-span-2">BRAND / MODEL</p>
              <p className="text-base">UNIT PRICE</p>
            </div>
            {filteredItemsDeliveredData &&
            filteredItemsDeliveredData?.length > 0 ? (
              filteredItemsDeliveredData?.map((item) => {
                return (
                  <div
                    className="grid grid-cols-8 gap-2 items-center py-6 border-b-2"
                    key={
                      item.item_details.item_quotation_details.item_details
                        .stock_property_no
                    }
                  >
                    <p className="text-gray-500">
                      {
                        item.item_details.item_quotation_details.item_details
                          .unit
                      }
                    </p>
                    <p className="text-gray-500 col-span-2">
                      {
                        item.item_details.item_quotation_details.item_details
                          .item_description
                      }
                    </p>
                    <div className="flex items-center gap-2 text-gray-500">
                      <span>
                        {item.quantity_delivered}
                      </span>

                      {Number(item.quantity_delivered) <
                        Number(
                          item.item_details.item_quotation_details.item_details
                            .quantity
                        ) && (
                        <AlertCircle
                          className="h-5 w-5 text-red-500"
                          aria-label={`Insufficient quantity. Received ${item.quantity_delivered} of ${item.item_details.item_quotation_details.item_details.quantity}.`}
                        />
                      )}
                    </div>
                    <p className="text-gray-500">
                      {item.item_details.item_quotation_details.unit_price}
                    </p>

                    <p className="text-gray-500 col-span-2">
                      {item.item_details.item_quotation_details.brand_model}
                    </p>
                    <p className="text-gray-500">
                      {item.item_details.item_quotation_details.unit_price}
                    </p>
                  </div>
                );
              })
            ) : (
              <Loading />
            )}
          </CardContent>
          <CardFooter className="flex justify-between"></CardFooter>
        </Card>
      </div>
      <GenerateICSPDFDialog
        itemsDeliveredData={filteredItemsDeliveredData}
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
      />
      <Dialog
        open={isDistributionConfirmOpen}
        onOpenChange={setIsDistributionConfirmOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Confirm Item Quantities
            </DialogTitle>

            <DialogDescription>
              Please verify that the quantity delivered for each item
              matches the requested quantity before distributing this
              purchase request.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">

            {/* Select All */}
            <div className="flex items-center justify-between border rounded-lg p-3 bg-gray-50 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    filteredItemsDeliveredData.length > 0 &&
                    verifiedItems.size === filteredItemsDeliveredData.length
                  }
                  onCheckedChange={handleVerifyAllItems}
                />

                <span className="font-medium">
                  {verifiedItems.size === filteredItemsDeliveredData.length
                    ? "Deselect All"
                    : "Select All"}
                </span>
              </div>

              <span className="text-sm text-gray-500">
                {verifiedItems.size} / {filteredItemsDeliveredData.length}
              </span>
            </div>

            {filteredItemsDeliveredData.map((item) => {
              const itemKey =
                item.item_details.item_quotation_details.item_details
                  .stock_property_no;

              const itemDetails =
                item.item_details.item_quotation_details.item_details;

              const isVerified = verifiedItems.has(itemKey);

              return (
                <div
                  key={itemKey}
                  className={`border rounded-lg p-4 transition-colors ${
                    isVerified
                      ? "bg-green-50 border-green-300"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isVerified}
                      onCheckedChange={() =>
                        handleVerifyItem(itemKey)
                      }
                      className="mt-1"
                    />

                    <div className="flex-1">
                      <p className="font-medium">
                        {itemDetails.item_description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-gray-500">
                            Unit:
                          </span>{" "}
                          {itemDetails.unit}
                        </div>

                        <div>
                          <span className="text-gray-500">
                            Requested Quantity:
                          </span>{" "}
                          {itemDetails.quantity}
                        </div>

                        <div>
                          <span className="text-gray-500">
                            Brand / Model:
                          </span>{" "}
                          {item.item_details.item_quotation_details.brand_model ||
                            "N/A"}
                        </div>

                        <div>
                          <span className="text-gray-500">
                            Property No.:
                          </span>{" "}
                          {itemKey}
                        </div>
                      </div>

                      <p
                        className={`text-xs mt-2 font-medium ${
                          isVerified
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {isVerified
                          ? "✓ Quantity verified"
                          : "Please verify the quantity"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              Verified:{" "}
              <span className="font-semibold">
                {verifiedItems.size}
              </span>{" "}
              of{" "}
              <span className="font-semibold">
                {filteredItemsDeliveredData.length}
              </span>{" "}
              items
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDistributionConfirmOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={!allItemsVerified || isPendingDistribute}
              onClick={handleDistributeClick}
            >
              {isPendingDistribute ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Distributing...
                </>
              ) : (
                "Confirm Distribution"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <MessageDialog
        message={messageDialog?.message}
        title={messageDialog?.title}
        type={messageDialog?.type}
        open={messageDialog.open}
        onOpenChange={(open) => setMessageDialog((prev) => ({ ...prev, open }))}
      />
    </Layout>
  );
};
