
import { useMemo, useState } from "react";
import { Check, FileText, MapPin, Package, Printer, Search, Tag } from "lucide-react";

import {
  useGetRequisitionerPropertyItems,
  generatePropertyTags,
} from "@/services/puchaseOrderServices";
import Layout from "./components/Layout/ReqDashboardLayout";
import { generatePropertyTagPDF } from "@/utils/generatePropertyTagPDF";
import { _itemsDeliveredType } from "@/types/request/purchase-order";

type GeneratedPropertyTag = {
  asset_id: number;
  delivery_id: string;
  unit_number: number;
  property_number: string;
  location: string;
};

const ReqProperty = () => {
  const { data, isLoading, isError, error } =
    useGetRequisitionerPropertyItems();

  const deliveredItems = useMemo(
    () => data?.data ?? [],
    [data?.data]
  );

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemLocations, setItemLocations] = useState<
    Record<string, string>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Group delivered items by Purchase Request.
  const groupedItems = useMemo(() => {
    const groups: Record<string, _itemsDeliveredType[]> = {};

    deliveredItems.forEach((item) => {
      const prNo = item.pr_details.pr_no;

      if (!groups[prNo]) {
        groups[prNo] = [];
      }

      groups[prNo].push(item);
    });

    return groups;
  }, [deliveredItems]);

  // Filter PR groups using the search input.
  const filteredGroups = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return Object.entries(groupedItems).filter(([prNo, items]) => {
      if (!search) return true;

      return (
        prNo.toLowerCase().includes(search) ||
        items.some((item) =>
          item.item_details.item_quotation_details.item_details
            .item_description.toLowerCase()
            .includes(search)
        )
      );
    });
  }, [groupedItems, searchTerm]);

  const toggleItem = (deliveryId: string) => {
    setSelectedItems((previous) => {
      if (previous.includes(deliveryId)) {
        return previous.filter((id) => id !== deliveryId);
      }

      return [...previous, deliveryId];
    });
  };

  const togglePR = (items: _itemsDeliveredType[]) => {
    const deliveryIds = items.map((item) => item.delivery_id);

    const allSelected = deliveryIds.every((id) =>
      selectedItems.includes(id)
    );

    if (allSelected) {
      setSelectedItems((previous) =>
        previous.filter((id) => !deliveryIds.includes(id))
      );
    } else {
      setSelectedItems((previous) =>
        Array.from(new Set([...previous, ...deliveryIds]))
      );
    }
  };

  const handleLocationChange = (
    deliveryId: string,
    location: string
  ) => {
    setItemLocations((previous) => ({
      ...previous,
      [deliveryId]: location,
    }));
  };

  const handleGeneratePropertyTags = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one delivered item.");
      return;
    }

    const selected = deliveredItems.filter((item) =>
      selectedItems.includes(item.delivery_id)
    );

    const missingLocation = selected.find(
      (item) => !itemLocations[item.delivery_id]?.trim()
    );

    if (missingLocation) {
      alert("Please enter the equipment location for every selected item.");
      return;
    }

    try {
      setIsGenerating(true);

      const requestItems = selected.map((item) => ({
        delivery_id: item.delivery_id,
        location: itemLocations[item.delivery_id].trim(),
      }));

      const response = await generatePropertyTags({
        items: requestItems,
      });

      const generatedTags = (
        response.data as {
          property_tags?: GeneratedPropertyTag[];
        } | undefined
      )?.property_tags;

      if (!Array.isArray(generatedTags) || generatedTags.length === 0) {
        throw new Error("No property tags were returned for printing.");
      }

      const pdfUrl = await generatePropertyTagPDF(
        generatedTags,
        selected
      );

      window.open(pdfUrl, "_blank");

      // Release the generated PDF URL after the browser has had time to open it.
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);

    } catch (err) {
      console.error("Property tag generation failed:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to generate property tags."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const totalSelectedQuantity = deliveredItems
    .filter((item) => selectedItems.includes(item.delivery_id))
    .reduce((total, item) => total + item.quantity_delivered, 0);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Loading delivered items...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-500">
          Failed to load property items: {error?.message}
        </p>
      </div>
    );
  }

  return (
    <Layout>
    <div className="space-y-6 p-6">

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              Property Tags
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Select your delivered equipment and generate property tags.
          </p>
        </div>

        <button
          onClick={handleGeneratePropertyTags}
          disabled={selectedItems.length === 0 || isGenerating}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <Printer className="h-4 w-4" />
              Generate Property Tags
            </>
          )}
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span className="text-sm">Delivered Items</span>
          </div>

          <p className="mt-2 text-2xl font-bold">
            {deliveredItems.length}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="h-4 w-4" />
            <span className="text-sm">Selected Items</span>
          </div>

          <p className="mt-2 text-2xl font-bold">
            {selectedItems.length}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span className="text-sm">Physical Units Selected</span>
          </div>

          <p className="mt-2 text-2xl font-bold">
            {totalSelectedQuantity}
          </p>
        </div>

      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by PR number or item description..."
          className="w-full rounded-md border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Delivered Items */}
      {filteredGroups.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

          <h3 className="font-semibold">
            No delivered items found
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Completed purchase requests with delivered items will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredGroups.map(([prNo, items]) => {
            const allSelected = items.every((item) =>
              selectedItems.includes(item.delivery_id)
            );

            return (
              <section
                key={prNo}
                className="overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm"
              >
                {/* PR Header */}
                <div className="flex flex-col gap-3 border-b border-orange-100 bg-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold">
                      Purchase Request: {prNo}
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {items[0].pr_details.requisitioner_details.name}
                      {" · "}
                      {items.length} delivered item
                      {items.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => togglePR(items)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {allSelected ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {/* PR Items */}
                <div className="divide-y">
                  {items.map((item) => {
                    const details =
                      item.item_details.item_quotation_details;

                    const itemDetails = details.item_details;

                    const isSelected = selectedItems.includes(
                      item.delivery_id
                    );

                    return (
                      <div
                        key={item.delivery_id}
                        className={`space-y-4 p-4 transition-colors ${
                          isSelected ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              toggleItem(item.delivery_id)
                            }
                            className="mt-1 h-4 w-4 cursor-pointer accent-primary"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col justify-between gap-2 sm:flex-row">
                              <div>
                                <h3 className="font-medium">
                                  {itemDetails.item_description}
                                </h3>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  Delivery ID: {item.delivery_id}
                                </p>
                              </div>

                              <span className="h-fit w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium">
                                {item.quantity_delivered} unit
                                {item.quantity_delivered !== 1 ? "s" : ""}
                              </span>
                            </div>

                            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Stock / Property No.
                                </p>
                                <p className="font-medium">
                                  {itemDetails.stock_property_no || "N/A"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Brand / Model
                                </p>
                                <p className="font-medium">
                                  {details.brand_model || "N/A"}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Unit
                                </p>
                                <p className="font-medium">
                                  {itemDetails.unit || "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Equipment Location */}
                            {isSelected && (
                              <div className="mt-4">
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                                  <MapPin className="h-4 w-4 text-primary" />
                                  Equipment Location
                                </label>

                                <input
                                  type="text"
                                  maxLength={255}
                                  value={
                                    itemLocations[item.delivery_id] ?? ""
                                  }
                                  onChange={(e) =>
                                    handleLocationChange(
                                      item.delivery_id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Enter building, room, or office location..."
                                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                />

                                <p className="mt-1 text-xs text-muted-foreground">
                                  Maximum 255 characters.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Selected Items Footer */}
      {selectedItems.length > 0 && (
        <div className="sticky bottom-4 flex flex-col justify-between gap-3 rounded-lg border bg-background p-4 shadow-lg sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold">
              {selectedItems.length} item(s) selected
            </p>

            <p className="text-xs text-muted-foreground">
              {totalSelectedQuantity} physical unit(s) will be processed for property tagging.
            </p>
          </div>

          <button
            onClick={handleGeneratePropertyTags}
            disabled={isGenerating}
           className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate PDF"}
          </button>
        </div>
      )}

    </div>
    </Layout>
  );
};

export default ReqProperty;
