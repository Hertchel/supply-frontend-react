
import { Loader2, Package } from "lucide-react";
import Layout from "./components/Layout/ReqDashboardLayout";
import { useGetRequisitionerInventory } from "@/services/puchaseOrderServices";
import { DataTable } from "../SupplyDashboard/components/data-table";
import { reqInventoryColumns } from "./components/reqInventoryColumns";

export default function ReqInventory() {
  const {
    data: inventoryResponse,
    isLoading,
    isError,
    error,
  } = useGetRequisitionerInventory();

  const inventoryData = Array.isArray(inventoryResponse?.data)
    ? inventoryResponse.data
    : [];

  return (
    <Layout>
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Package className="mr-2" />
          My Inventory
        </h1>

        <div className="rounded-md">
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : isError ? (
            <p className="text-red-500">
              Failed to load inventory: {error.message}
            </p>
          ) : inventoryData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No issued items found.
            </p>
          ) : (
            <DataTable
              data={inventoryData}
              columns={reqInventoryColumns}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
