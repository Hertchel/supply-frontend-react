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
import { Loader2 } from "lucide-react";

export interface PPMPItem {
  rowNumber: number;
  item_description: string;
  quantity: number;
  unit: string;
  estimated_budget: number;
  mode_of_procurement: string;
  unit_price: number;
  selected: boolean;
  isValid: boolean;
  validationErrors: string[];
}

interface PPMPImportDialogProps {
  onImport?: (items: PPMPItem[]) => void | Promise<void>;
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
  const [isImporting, setIsImporting] = useState(false);
  
  const validItems = items.filter(
    (item) => item.isValid
  );

  const allSelected =
    validItems.length > 0 &&
    validItems.every((item) => item.selected);

    const toggleSelectAll = () => {
      setItems((currentItems) =>
        currentItems.map((item) => ({
          ...item,
          selected: item.isValid
            ? !allSelected
            : false,
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
        const itemDescription =
          typeof row[1] === "string"
            ? row[1].trim()
            : "";

        const quantity =
          typeof row[2] === "number"
            ? row[2]
            : Number(row[2]);

        const unit =
          typeof row[3] === "string"
            ? row[3].trim()
            : "";

        const estimatedBudget =
          typeof row[4] === "number"
            ? row[4]
            : Number(row[4]);

        const modeOfProcurement =
          typeof row[5] === "string"
            ? row[5].trim()
            : "";

        const unitPrice =
          typeof row[18] === "number"
            ? row[18]
            : Number(row[18]);


        if (
          !itemDescription ||
          !unit ||
          !Number.isFinite(quantity) ||
          quantity <= 0
        ) {
          return;
        }

        const validationErrors: string[] = [];

        if (
          !Number.isFinite(unitPrice) ||
          unitPrice < 0
        ) {
          validationErrors.push(
            "Unit price is invalid"
          );
        }

        parsedItems.push({
          rowNumber: index + 1,
          item_description: itemDescription,
          quantity: Number.isFinite(quantity) ? quantity : 0,
          unit,
          estimated_budget:
            Number.isFinite(estimatedBudget)
              ? estimatedBudget
              : 0,
          mode_of_procurement: modeOfProcurement,
          unit_price:
            Number.isFinite(unitPrice)
              ? unitPrice
              : 0,
          selected: false,

          isValid: validationErrors.length === 0,
          validationErrors,
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
    (item) => item.selected && item.isValid
  );

  const selectedTotal = selectedItems.reduce(
    (total, item) => total + item.estimated_budget,
    0
  );

  const handleImport = async () => {
    if (selectedItems.length === 0) {
      setError("Please select at least one item.");
      return;
    }

    try {
      setIsImporting(true);

      await onImport?.(selectedItems);
    } finally {
      setIsImporting(false);
    }
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
            <div>
              <p className="text-sm text-gray-600">
                {items.length} PPMP items found
              </p>

              {items.some((item) => !item.isValid) && (
                <p className="text-sm text-red-600">
                  {
                    items.filter((item) => !item.isValid).length
                  } invalid items cannot be selected
                </p>
              )}
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
                        className={`border-t ${
                          item.isValid
                            ? "hover:bg-gray-50"
                            : "bg-red-50"
                        }`}
                      > 
                        <td className="px-3 py-3 text-center">
                        <Checkbox
                          checked={item.selected}
                          disabled={!item.isValid}
                          onCheckedChange={() =>
                            toggleItem(item.rowNumber)
                          }
                        />
                        </td>

                        <td className="px-3 py-3">
                          {item.item_description || "(No description)"}

                          {!item.isValid && (
                            <div className="mt-1 text-xs text-red-600">
                              {item.validationErrors.join(", ")}
                            </div>
                          )}
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
              disabled={selectedItems.length === 0 || isReading || isImporting}
              className="bg-orange-400 text-white hover:bg-orange-500"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Items...
                </>
              ) : (
                "Add Selected Items"
              )}
            </Button>
        </div>
        </DialogContent>
    </Dialog>
    );
};

export default PPMPImportDialog;