
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../../SupplyDashboard/components/data-table-column-header";
import type { RequisitionerInventoryItem } from "@/services/puchaseOrderServices";

export const reqInventoryColumns: ColumnDef<RequisitionerInventoryItem>[] = [
  {
    accessorKey: "po_no",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PO NO." />
    ),
    cell: ({ row }) => (
      <div className="font-thin text-sm">
        {row.getValue("po_no")}
      </div>
    ),
  },
  {
    accessorKey: "item_description",
    header: "ITEM",
    cell: ({ row }) => (
      <div className="w-[200px] whitespace-normal">
        {row.getValue("item_description")}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "unit",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="UNIT" />
    ),
    cell: ({ row }) => (
      <div className="font-thin text-sm">
        {row.getValue("unit")}
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="QUANTITY" />
    ),
    cell: ({ row }) => (
      <div className="font-thin text-sm">
        {row.getValue("quantity")}
      </div>
    ),
  },
  {
    id: "supplier_unit_cost",
    header: "UNIT COST",
    cell: ({ row }) => (
      <div className="font-thin text-sm">
        {Number(row.original.unit_cost).toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "quantity_delivered",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="QUANTITY DELIVERED"
      />
    ),
    cell: ({ row }) => (
      <div className="font-thin text-sm">
        {row.getValue("quantity_delivered")}
      </div>
    ),
  },
];
