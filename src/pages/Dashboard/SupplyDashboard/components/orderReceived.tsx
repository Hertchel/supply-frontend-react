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
  useUpdatePurchaseOrderStatus,
} from "@/services/puchaseOrderServices";

import { useMemo, useState } from "react";
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
  const [receivedQuantities, setReceivedQuantities] = useState<
    Record<string, string>
  >({});
  const [messageDialog, setMessageDialog] = useState<messageDialogProps>({
    open: false,
    message: "",
    title: "",
    type: "success",
  });

  const { mutate: updatePOStatusMutation } = useUpdatePurchaseOrderStatus();
  const { mutate: updatePRStatusMutation } = useUpdatePurchaseRequestStatus();

  const { mutate: addItemsDeliveredMutation } = useAddItemsDelivered();

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

      for (const data of filteredItems ?? []) {
        // Convert the input string to a number
        const receivedQuantity = Number(
          receivedQuantities[data.supplier_item_no]
        );

        const neededQuantity = Number(
          data.item_quotation_details.item_details.quantity
        );

        const deliverData = {
          delivery_data: uuidv4(),
          purchase_request: pr_no ?? "",
          supplier_item: data.supplier_item_no,
          quantity_delivered: receivedQuantity,
          is_complete: receivedQuantity >= neededQuantity,
          inspection: inspectionNo,
        };
        console.log("SENDING ITEM DELIVERED DATA:", {
          item: data.item_quotation_details.item_details.item_description,
          enteredQuantity: receivedQuantities[data.supplier_item_no],
          receivedQuantity,
          neededQuantity,
          deliverData,
        });

        await addItemsDeliveredMutation(deliverData);
      }

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

                        const neededQuantity = Number(
                          item.item_quotation_details.item_details.quantity
                        );

                        const receivedQuantity =
                          receivedQuantities[supplierItemNo] ?? "";

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
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max={neededQuantity}
                                  value={receivedQuantity}
                                  onChange={(e) =>
                                    handleReceivedQuantityChange(
                                      supplierItemNo,
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                  placeholder="Enter quantity"
                                />

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleReceivedQuantityChange(
                                      supplierItemNo,
                                      String(neededQuantity)
                                    )
                                  }
                                >
                                  Full
                                </Button>
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
