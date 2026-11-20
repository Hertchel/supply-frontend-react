import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
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
import { generatePropertyTagPDF } from "@/utils/generatePropertyTagPDF";
import { _itemsDeliveredType } from "@/types/request/purchase-order";
import useAuthStore from "@/components/Auth/AuthStore";
import { createInventoryCustodianSlip , generatePropertyTags} from "@/services/puchaseOrderServices";

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
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [itemLocations, setItemLocations] = useState<Record<string, string>>({});
  const user = useAuthStore((state) => state.user);

  const handleItemToggle = (data: _itemsDeliveredType) => {
    setSelectedItems((prev) =>
      prev.includes(data)
        ? prev.filter((item) => item.delivery_id !== data.delivery_id)
        : [...prev, data]
    );
  };

  const generateICS = async () => {
    const purchaseOrder =
      selectedItems[0]?.inspection_details.po_details.po_no;

    if (!purchaseOrder) {
      console.error("Purchase order not found.");
      return;
    }

    const deliveredItems = selectedItems.map((item) => ({
      delivered_item: item.delivery_id,
      quantity: Number(item.quantity_delivered),
    }));

    try {
      const response = await createInventoryCustodianSlip({
        purchase_order: purchaseOrder,
        delivered_items: deliveredItems,
      });

      if (!response.data) {
        console.error("Failed to create ICS.");
        return;
      }

      const url = await generateICSPDF(
        selectedItems,
        user,
        response.data.ics_no
      );

      window.open(url, "_blank");

    } catch (error) {
      console.error("Error creating ICS:", error);
    }
  };

  const openPropertyTagDialog = () => {
    const initialLocations: Record<string, string> = {};

    selectedItems.forEach((item) => {
      initialLocations[item.delivery_id] = "";
    });

    setItemLocations(initialLocations);
    setIsLocationDialogOpen(true);
  };


const handleGeneratePropertyTags = async () => {
  try {
    const items = selectedItems.map((item) => ({
      delivery_id: item.delivery_id,
      location: itemLocations[item.delivery_id]?.trim() ?? "",
    }));

    const response = await generatePropertyTags({ items });

    const generatedTags = response.data?.property_tags;

    if (!Array.isArray(generatedTags) || generatedTags.length === 0) {
      throw new Error("No property tags were returned for printing.");
    }

    const pdfUrl = await generatePropertyTagPDF(
      generatedTags,
      selectedItems
    );

    setIsLocationDialogOpen(false);

    window.open(pdfUrl, "_blank");

  } catch (error) {
    console.error("Error generating property tags:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to generate property tags."
    );
  }
};

  
  return (
    <>
      {/* First Dialog: Select Items */}
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
                {itemsDeliveredData?.map((item) => (
                  <TableRow key={item.delivery_id}>
                    <TableCell>
                      {item.item_details.item_quotation_details.item_details.item_description}
                    </TableCell>

                    <TableCell>
                      {Number(
                        item.item_details.item_quotation_details.item_details.quantity
                      )}
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

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={generateICS}
              disabled={selectedItems.length === 0}
            >
              Generate ICS PDF
            </Button>

            <Button
              variant="outline"
              onClick={openPropertyTagDialog}
              disabled={selectedItems.length === 0}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Generate Property Tags
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Second Dialog: Equipment Locations */}
      <Dialog
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
      >
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Generate Property Tags</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Enter the location of each selected equipment item.
            </p>
          </DialogHeader>

          <div className="space-y-4 max-h-[55vh] overflow-y-auto">
            {selectedItems.map((item) => (
              <div
                key={item.delivery_id}
                className="border rounded-md p-4 space-y-3"
              >
                <div>
                  <p className="font-medium">
                    {item.item_details.item_quotation_details.item_details.item_description}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity_delivered}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Equipment Location
                  </Label>

                  <Input
                    placeholder="Example: Office"
                    value={itemLocations[item.delivery_id] || ""}
                    onChange={(e) =>
                      setItemLocations((prev) => ({
                        ...prev,
                        [item.delivery_id]: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsLocationDialogOpen(false)}
            >
              Skip for Now
            </Button>

            <Button
              disabled={selectedItems.some(
                (item) => !itemLocations[item.delivery_id]?.trim()
              )}
              onClick={handleGeneratePropertyTags}
            >
              Generate Property Tags
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
