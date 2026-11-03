
import { Loader2, Package } from "lucide-react";
import Layout from "./components/Layout/SupplyDashboardLayout";
import { useGetInventoryDeliveredItems } from "@/services/puchaseOrderServices";
import { DataTable } from "./components/data-table";
import { inventoryColumns } from "./components/inventory-column";

export default function ModernInventory() {
  const {
    data: items_delivered,
    isLoading: itemsLoading,
    isError,
    error,
  } = useGetInventoryDeliveredItems();

  const itemDeliveredData = Array.isArray(items_delivered?.data)
    ? items_delivered.data
    : [];

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
              data={itemDeliveredData}
              columns={inventoryColumns}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
