import { useState } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export interface PPMPItem {
  rowNumber: number;
  item_description: string;
  quantity: number;
  unit: string;
  estimated_budget: number;
  mode_of_procurement: string;
  unit_price: number;
  selected: boolean;
}

interface PPMPImportDialogProps {
  onImport?: (items: PPMPItem[]) => void;
  onClose?: () => void;
}

const PPMPImportDialog = ({
  onImport,
  onClose,
}: PPMPImportDialogProps) => {
  const [fileName, setFileName] = useState("");
  const [items, setItems] = useState<PPMPItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  
  const allSelected =
    items.length > 0 &&
    items.every((item) => item.selected);

    const toggleSelectAll = () => {
    setItems((currentItems) =>
        currentItems.map((item) => ({
        ...item,
        selected: !allSelected,
        }))
    );
    };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError(null);
    setItems([]);
    setFileName(file.name);
    setIsReading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
      });

      console.log("PPMP SHEETS:", workbook.SheetNames);

      const sheetName = "PPMP 2027";

      if (!workbook.SheetNames.includes(sheetName)) {
        throw new Error(
          `The Excel file does not contain a "${sheetName}" sheet.`
        );
      }

      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(
        worksheet,
        {
          header: 1,
          defval: null,
          raw: true,
        }
      );

      console.log("RAW PPMP ROWS:", rows);

      const parsedItems: PPMPItem[] = [];

      rows.forEach((row, index) => {
        /*
         * Your PPMP structure:
         *
         * B = Item & Specifications
         * C = Quantity
         * D = Unit
         * E = Estimated Budget
         * F = Mode of Procurement
         * S = Unit Price
         *
         * Since arrays are zero-indexed:
         * B = index 1
         * C = index 2
         * D = index 3
         * E = index 4
         * F = index 5
         * S = index 18
         */

        const itemDescription = row[1];
        const quantity = row[2];
        const unit = row[3];
        const estimatedBudget = row[4];
        const modeOfProcurement = row[5];
        const unitPrice = row[18];

        // Ignore rows that aren't actual item rows.
        if (
          typeof itemDescription !== "string" ||
          !itemDescription.trim()
        ) {
          return;
        }

        // Ignore rows without a valid quantity.
        if (
          typeof quantity !== "number" ||
          quantity <= 0
        ) {
          return;
        }

        // Ignore category/header rows.
        if (
          typeof unit !== "string" ||
          !unit.trim()
        ) {
          return;
        }

        parsedItems.push({
          rowNumber: index + 1,
          item_description: itemDescription.trim(),
          quantity,
          unit: unit.trim(),
          estimated_budget:
            typeof estimatedBudget === "number"
              ? estimatedBudget
              : 0,
          mode_of_procurement:
            typeof modeOfProcurement === "string"
              ? modeOfProcurement.trim()
              : "",
          unit_price:
            typeof unitPrice === "number"
              ? unitPrice
              : 0,
          selected: false,
        });
      });

      if (parsedItems.length === 0) {
        throw new Error(
          "No valid PPMP items were found in the worksheet."
        );
      }

      console.log("PARSED PPMP ITEMS:", parsedItems);

      setItems(parsedItems);
    } catch (error) {
      console.error("PPMP IMPORT ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to read the Excel file."
      );
    } finally {
      setIsReading(false);
    }
  };

  const toggleItem = (rowNumber: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.rowNumber === rowNumber
          ? {
              ...item,
              selected: !item.selected,
            }
          : item
      )
    );
  };

  const selectedItems = items.filter(
    (item) => item.selected
  );

  const selectedTotal = selectedItems.reduce(
    (total, item) => total + item.estimated_budget,
    0
  );

  const handleImport = () => {
    if (selectedItems.length === 0) {
      setError("Please select at least one item.");
      return;
    }

    onImport?.(selectedItems);
  };

  return (
    <Dialog
        open={true}
        onOpenChange={(open) => {
        if (!open) {
            onClose?.();
        }
        }}
    >
        <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
            <DialogTitle>
            Import Purchase Request from PPMP
            </DialogTitle>

            <DialogDescription>
            Upload a PPMP Excel file and select the items
            you want to add to this Purchase Request.
            </DialogDescription>
        </DialogHeader>

        {/* File Upload */}
        <div className="mb-4">
            <label
            htmlFor="ppmp-file"
            className="mb-2 block text-sm font-medium text-gray-700"
            >
            PPMP Excel File
            </label>

            <input
            id="ppmp-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600
                file:mr-4 file:rounded-md file:border-0
                file:bg-orange-100 file:px-4 file:py-2
                file:text-sm file:font-medium
                file:text-orange-700
                hover:file:bg-orange-200"
            />

            {fileName && (
            <p className="mt-2 text-sm text-gray-500">
                Selected file:{" "}
                <span className="font-medium">
                {fileName}
                </span>
            </p>
            )}
        </div>

        {/* Loading */}
        {isReading && (
            <div className="py-8 text-center text-gray-500">
            Reading PPMP...
            </div>
        )}

        {/* Error */}
        {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">
                {error}
            </p>
            </div>
        )}

        {/* Preview */}
        {!isReading && items.length > 0 && (
            <>
            {/* Item Count */}
            <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                {items.length} PPMP items found
                </p>

                <p className="text-sm font-medium">
                Selected: {selectedItems.length}
                </p>
            </div>

            {/* Select All */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                />

                <span className="text-sm font-medium">
                    Select All
                </span>
                </div>

                <span className="text-sm text-gray-500">
                {selectedItems.length} of {items.length} selected
                </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                <thead className="bg-gray-100">
                    <tr>
                    <th className="w-12 px-3 py-3 text-center">
                        Select
                    </th>

                    <th className="px-3 py-3 text-left">
                        Item Description
                    </th>

                    <th className="px-3 py-3 text-center">
                        Quantity
                    </th>

                    <th className="px-3 py-3 text-center">
                        Unit
                    </th>

                    <th className="px-3 py-3 text-right">
                        Unit Price
                    </th>

                    <th className="px-3 py-3 text-right">
                        Estimated Budget
                    </th>
                    </tr>
                </thead>

                <tbody>
                    {items.map((item) => (
                    <tr
                        key={item.rowNumber}
                        className="border-t hover:bg-gray-50"
                    >
                        <td className="px-3 py-3 text-center">
                        <Checkbox
                            checked={item.selected}
                            onCheckedChange={() =>
                            toggleItem(item.rowNumber)
                            }
                        />
                        </td>

                        <td className="px-3 py-3">
                        {item.item_description}
                        </td>

                        <td className="px-3 py-3 text-center">
                        {item.quantity}
                        </td>

                        <td className="px-3 py-3 text-center">
                        {item.unit}
                        </td>

                        <td className="px-3 py-3 text-right">
                        ₱
                        {item.unit_price.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                        </td>

                        <td className="px-3 py-3 text-right">
                        ₱
                        {item.estimated_budget.toLocaleString(
                            "en-PH",
                            {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                            }
                        )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-4 flex justify-between border-t pt-4">
                <div>
                <p className="text-sm text-gray-500">
                    Selected Items
                </p>

                <p className="font-medium">
                    {selectedItems.length}
                </p>
                </div>

                <div className="text-right">
                <p className="text-sm text-gray-500">
                    Selected Estimated Budget
                </p>

                <p className="text-lg font-semibold">
                    ₱
                    {selectedTotal.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    })}
                </p>
                </div>
            </div>
            </>
        )}

        {/* Buttons */}
        <div className="mt-4 flex justify-end gap-3">
            <Button
            type="button"
            variant="outline"
            onClick={onClose}
            >
            Cancel
            </Button>

            <Button
            type="button"
            onClick={handleImport}
            disabled={selectedItems.length === 0 || isReading}
            className="bg-orange-400 text-white hover:bg-orange-500"
            >
            Add Selected Items
            </Button>
        </div>
        </DialogContent>
    </Dialog>
    );
};

export default PPMPImportDialog;