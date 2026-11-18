
import { useMemo, useState } from "react";
import { Loader2, Package } from "lucide-react";

import Layout from "./components/Layout/SupplyDashboardLayout";
import {
  useGetInventoryDeliveredItems,
  InventoryDeliveredItem,
} from "@/services/puchaseOrderServices";

import { DataTable } from "./components/data-table";
import { inventoryColumns } from "./components/inventory-column";

type DateFilterType = "all" | "month" | "year";

export default function ModernInventory() {
  const {
    data: items_delivered,
    isLoading: itemsLoading,
    isError,
    error,
  } = useGetInventoryDeliveredItems();

  const [dateFilter, setDateFilter] =
    useState<DateFilterType>("all");

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const itemDeliveredData = useMemo(() => {
    return Array.isArray(items_delivered?.data)
      ? items_delivered.data
      : [];
  }, [items_delivered?.data]);
  console.log("INVENTORY DATA:", itemDeliveredData);

  console.log(
    "RECEIVED DATES:",
    itemDeliveredData.map((item) => ({
      po_no: item.po_no,
      date_received: item.date_received,
      parsed_date: new Date(item.date_received).toString(),
    }))
  );

  // Get available years from the received dates.
  const availableYears = useMemo(() => {
    const years = itemDeliveredData
      .map((item) => {
        if (!item.date_received) return null;

        const date = new Date(item.date_received);

        return Number.isNaN(date.getTime())
          ? null
          : date.getFullYear();
      })
      .filter((year): year is number => year !== null);

    return [...new Set(years)].sort((a, b) => b - a);
  }, [itemDeliveredData]);

  // Apply month/year filtering.
  const filteredItems = useMemo(() => {
    if (dateFilter === "all") {
      return itemDeliveredData;
    }

    return itemDeliveredData.filter((item) => {
      if (!item.date_received) return false;

      const date = new Date(item.date_received);

      if (Number.isNaN(date.getTime())) return false;

      if (dateFilter === "year") {
        return (
          selectedYear !== "" &&
          date.getFullYear() === Number(selectedYear)
        );
      }

      if (dateFilter === "month") {
        if (!selectedMonth) return false;

        const [year, month] = selectedMonth.split("-").map(Number);

        return (
          date.getFullYear() === year &&
          date.getMonth() + 1 === month
        );
      }

      return true;
    });
  }, [
    itemDeliveredData,
    dateFilter,
    selectedMonth,
    selectedYear,
  ]);

  // Date filter controls.
  const dateFilterControls = (
    <div className="flex items-center gap-2">
      <select
        value={dateFilter}
        onChange={(event) =>
          setDateFilter(event.target.value as DateFilterType)
        }
        className="h-8 rounded-md border bg-background px-2 text-sm"
      >
        <option value="all">All Dates</option>
        <option value="month">By Month</option>
        <option value="year">By Year</option>
      </select>

      {dateFilter === "month" && (
        <input
          type="month"
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
          className="h-8 rounded-md border bg-background px-2 text-sm"
        />
      )}

      {dateFilter === "year" && (
        <select
          value={selectedYear}
          onChange={(event) => setSelectedYear(event.target.value)}
          className="h-8 rounded-md border bg-background px-2 text-sm"
        >
          <option value="">Select Year</option>

          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Package className="mr-2" />
          Inventory Management
        </h1>

        <div className="rounded-md">
          {itemsLoading ? (
            <Loader2 className="animate-spin" />
          ) : isError ? (
            <p className="text-red-500">
              Failed to load inventory: {error.message}
            </p>
          ) : (
            <DataTable
              data={filteredItems}
              columns={inventoryColumns}
              toolbarContent={dateFilterControls}
              getRowTotal={(item: InventoryDeliveredItem) =>
                Number(item.quantity_delivered) *
                Number(item.unit_cost)
              }
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
