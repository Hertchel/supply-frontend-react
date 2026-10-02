import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  addInspectionReport,
  useAddItemsDelivered,
  useGetItemsDeliveredInPurchaseRequest,
  useUpdateItemsDelivered,
  useUpdatePurchaseOrderStatus,
} from "@/services/puchaseOrderServices";

import { useMemo, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { SupplierItemType } from "@/types/request/purchase-order";
import { AxiosError } from "axios";
import { MessageDialog } from "../../shared/components/MessageDialog";
import { useUpdatePurchaseRequestStatus } from "@/services/purchaseRequestServices";

interface OrderReceivedDialogProps {
  po_no: string;
  supplier_no: string;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  items_: SupplierItemType[];
}

interface messageDialogProps {
  open: boolean;
  message: string;
  title: string;
  type: "success" | "error" | "info";
}

export function OrderReceivedDialog({
  po_no,
  supplier_no,
  items_,
  isDialogOpen,
  setIsDialogOpen,
}: OrderReceivedDialogProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, string>>({});
  const [savedQuantities, setSavedQuantities] = useState<Record<string, number>>({});
  const [messageDialog, setMessageDialog] = useState<messageDialogProps>({
    open: false,
    message: "",
    title: "",
    type: "success",
  });

  const { mutate: updatePOStatusMutation } = useUpdatePurchaseOrderStatus();
  const { mutate: updatePRStatusMutation } = useUpdatePurchaseRequestStatus();
  const { mutateAsync: addItemsDeliveredMutation } = useAddItemsDelivered();
  const { mutateAsync: updateItemsDeliveredMutation } = useUpdateItemsDelivered();

  const filteredItems = useMemo(() => {
    if (isDialogOpen)
      return items_.filter(
        (item) => item.supplier_details.supplier_no === supplier_no
      );
  }, [items_, supplier_no, isDialogOpen]);
  console.log(filteredItems);

  const pr_no = useMemo(() => {
    if (isDialogOpen)
      return filteredItems && filteredItems[0].rfq_details.purchase_request;
  }, [filteredItems, isDialogOpen]);

  const { data: deliveredItemsData } =
    useGetItemsDeliveredInPurchaseRequest({
      pr_no: pr_no?.toString(),
    });

  useEffect(() => {
    const deliveredItems = deliveredItemsData?.data;
    if (!isDialogOpen || !deliveredItems) return;

    const updatedSavedQuantities: Record<string, number> = {};
    filteredItems?.forEach((item) => {
      const savedQuantity = deliveredItems
        .filter(
          (delivered) =>
            delivered.item_details?.supplier_item_no ===
            item.supplier_item_no
        )
        .reduce(
          (total, delivered) =>
            total + Number(delivered.quantity_delivered || 0),
          0
        );

      updatedSavedQuantities[item.supplier_item_no] = savedQuantity;
    });
    setSavedQuantities(updatedSavedQuantities);

    // Start each new receiving transaction empty.
    setReceivedQuantities({});
  }, [isDialogOpen, deliveredItemsData?.data, filteredItems]);

  console.log(
    "SAVED DELIVERED ITEMS FOR PR:",
    deliveredItemsData?.data
  );

  const handleReceivedQuantityChange = (
    supplierItemNo: string,
    value: string
  ) => {
    setReceivedQuantities((prev) => ({
      ...prev,
      [supplierItemNo]: value,
    }));
  };

  const hasEmptyReceivedQuantity = filteredItems?.some((item) => {
    const quantity = receivedQuantities[item.supplier_item_no];

    return quantity === undefined || quantity.trim() === "";
  });

  const handleOrderReceived = async () => {
    const hasEmptyQuantity = filteredItems?.some((item) => {
      const quantity = receivedQuantities[item.supplier_item_no];

      return quantity === undefined || quantity.trim() === "";
    });

    if (hasEmptyQuantity) {
      setMessageDialog({
        open: true,
        message:
          "Please enter the received quantity for every item before confirming the order.",
        title: "Missing Received Quantity",
        type: "error",
      });

      return;
    }

    const hasInvalidQuantity = filteredItems?.some((item) => {
      const receivedQuantity = Number(
        receivedQuantities[item.supplier_item_no]
      );

      const neededQuantity = Number(
        item.item_quotation_details.item_details.quantity
      );

      return (
        Number.isNaN(receivedQuantity) ||
        receivedQuantity < 0 ||
        receivedQuantity > neededQuantity
      );
    });

    if (hasInvalidQuantity) {
      setMessageDialog({
        open: true,
        message:
          "The received quantity cannot be greater than the needed quantity.",
        title: "Invalid Quantity",
        type: "error",
      });

      return;
    }

    setIsLoading(true);

    const inspectionData = {
      inspection_no: uuidv4(),
      purchase_request: pr_no ?? "",
      purchase_order: po_no,
      inspector_name: "System Inspector",
      remarks: "Items received successfully",
    };

    try {
      const inspectionResponse = await addInspectionReport(
        inspectionData
      );

      const inspectionNo = inspectionResponse.data?.inspection_no;

      if (!inspectionNo) {
        throw new Error("Failed to create inspection report.");
      }

      let allItemsComplete = true;
      for (const data of filteredItems ?? []) {
        const supplierItemNo = data.supplier_item_no;
        const receivedNow = Number(receivedQuantities[supplierItemNo]);
        const alreadyReceived = savedQuantities[supplierItemNo] ?? 0;
        const neededQuantity = Number(data.item_quotation_details.item_details.quantity);
        const totalReceived = alreadyReceived + receivedNow;
        const isComplete = totalReceived >= neededQuantity;
        const isPartial = totalReceived > 0 && !isComplete;

        if (!isComplete) {
          allItemsComplete = false;
        }

        const existingDelivery = deliveredItemsData?.data?.find(
          (delivered) =>
            delivered.item_details?.supplier_item_no === supplierItemNo
        );

        console.log("RECEIVING ITEM:", {
          item:
            data.item_quotation_details.item_details
              .item_description,
          alreadyReceived,
          receivedNow,
          totalReceived,
          neededQuantity,
          isComplete,
          isPartial,
          existingDelivery,
        });

        if (existingDelivery) {
          await updateItemsDeliveredMutation({
            id: existingDelivery.delivery_id,
            data: {
              quantity_delivered: totalReceived,
              is_complete: isComplete,
              is_partial: isPartial,
            },
          });
        } else {
          const deliverData = {
            delivery_id: uuidv4(),
            purchase_request: pr_no ?? "",
            supplier_item: supplierItemNo,
            quantity_delivered: totalReceived,
            is_complete: isComplete,
            is_partial: isPartial,
            inspection: inspectionNo,
          };

          await addItemsDeliveredMutation(deliverData);
        }
      }

      if (allItemsComplete) {
        await updatePOStatusMutation({
          po_no: po_no,
          status: "Completed",
        });

        await updatePRStatusMutation({
          pr_no: pr_no ?? "",
          status: "Ready for Distribution",
        });

        setIsLoading(false);
        setIsDialogOpen(false);

        setMessageDialog({
          open: true,
          message: "Order has been successfully received",
          title: "Order Received",
          type: "success",
        });
      } else {
        setIsLoading(false);
        setReceivedQuantities({});
        setIsDialogOpen(false);

        setMessageDialog({
          open: true,
          message:
            "The received quantity has been saved. " +
            "The order cannot proceed to distribution until all items are fully received.",
          title: "Partial Delivery Saved",
          type: "info",
        });
      }
    } catch (error) {
      setIsLoading(false);

      setMessageDialog({
        open: true,
        message:
          (error as AxiosError).message ??
          "Something went wrong, please try again later",
        title: "Error",
        type: "error",
      });
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              To Recieve Items
            </DialogTitle>
            <p>{po_no}</p>
          </DialogHeader>
          {items_.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No To Recieve Items</AlertTitle>
              <AlertDescription>
                All items in this order have been fully delivered.
              </AlertDescription>
            </Alert>
          ) : (
            <div>
              <ScrollArea className="h-[45vh] mt-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="w-[150px]">
                          Needed Quantity
                        </TableHead>
                        <TableHead className="w-[180px]">
                          Received Quantity
                        </TableHead>
                        <TableHead className="w-[150px]">
                          Unit Cost
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems?.map((item, index) => {
                        const supplierItemNo = item.supplier_item_no;

                        const neededQuantity = Number(item.item_quotation_details.item_details.quantity);
                        const savedQuantity = savedQuantities[supplierItemNo] ?? 0;
                        const remainingQuantity = Math.max(neededQuantity - savedQuantity, 0);

                        const receivedQuantity = receivedQuantities[supplierItemNo] ?? "";
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              {
                                item.item_quotation_details.item_details
                                  .item_description
                              }
                            </TableCell>

                            <TableCell>
                              {neededQuantity}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-2">
                                <div className="text-sm text-muted-foreground">
                                  {savedQuantity}/{neededQuantity}
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max={remainingQuantity}
                                    value={receivedQuantity}
                                    onChange={(e) =>
                                      handleReceivedQuantityChange(
                                        supplierItemNo,
                                        e.target.value
                                      )
                                    }
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    placeholder="Enter quantity"
                                    disabled={remainingQuantity === 0}
                                  />

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={remainingQuantity === 0}
                                    onClick={() =>
                                      handleReceivedQuantityChange(
                                        supplierItemNo,
                                        String(remainingQuantity)
                                      )
                                    }
                                  >
                                    Full
                                  </Button>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              ₱
                              {parseFloat(
                                item.item_quotation_details.unit_price
                              ).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleOrderReceived}
                  disabled={isLoading || hasEmptyReceivedQuantity}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <p className="flex">
                      <Package className="w-4 h-4 mr-2" />
                      Confirm Order
                    </p>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <MessageDialog
        open={messageDialog.open}
        message={messageDialog.message}
        title={messageDialog.title}
        type={messageDialog.type}
        onOpenChange={(open) => setMessageDialog((prev) => ({ ...prev, open }))}
      />
    </>
  );
}
