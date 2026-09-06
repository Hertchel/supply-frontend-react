import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { generateICSPDF } from "@/utils/generateICSPDF";
import { _itemsDeliveredType } from "@/types/request/purchase-order";
import useAuthStore from "@/components/Auth/AuthStore";
import { createInventoryCustodianSlip } from "@/services/puchaseOrderServices";

interface ItemDistributeDialogProps {
  itemsDeliveredData: _itemsDeliveredType[]
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function GenerateICSPDFDialog({
  itemsDeliveredData,
  isOpen,
  setIsOpen,
}: ItemDistributeDialogProps) {
  const [selectedItems, setSelectedItems] = useState<_itemsDeliveredType[]>([]);
  const user = useAuthStore((state) => state.user);

  const handleItemToggle = (data: _itemsDeliveredType) => {
    setSelectedItems((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item.delivery_id !== data.delivery_id)
        : [...prev, data]
    );
  };

  const generateICS = async () => {
    const purchaseOrder = selectedItems[0]?.inspection_details.po_details.po_no;

    if (!purchaseOrder) {
      console.error("Purchase order not found.");
      return;
    }

    const deliveredItems = selectedItems.map((item) => ({
      delivered_item: item.delivery_id,
      quantity: Number(item.quantity_delivered),
    }));

    const response = await createInventoryCustodianSlip({
      purchase_order: purchaseOrder,
      delivered_items: deliveredItems,
    });

    if (!response.data) {
      console.error("Failed to create ICS.");
      return;
    }
    const icsNo = response.data.ics_no;
    const url = await generateICSPDF(selectedItems, user, icsNo);
    window.open(url, "_blank");
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Items</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
        <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="w-[50px]">Select</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemsDeliveredData && itemsDeliveredData.length > 0 && itemsDeliveredData.map((item) => (
                  <TableRow key={item.delivery_id}>
                    <TableCell>
                      {
                        item.item_details.item_quotation_details.item_details
                          .item_description
                      }
                    </TableCell>
                    <TableCell>
                      {Number(
                        item.item_details.item_quotation_details.item_details
                          .quantity)
                      }
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item)}
                        onCheckedChange={() => handleItemToggle(item)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={generateICS} disabled={selectedItems.length === 0}>
            Generate ICS PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
