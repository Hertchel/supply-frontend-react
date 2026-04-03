/* eslint-disable react-hooks/rules-of-hooks */
import { ColumnDef } from "@tanstack/react-table";
import { purchaseRequestType } from "@/types/response/puchase-request";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Badge } from "@/components/ui/badge";
import { useRequestForQuotation } from "@/services/requestForQuotationServices"; // CHANGED: import the main hook
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/services/formatDate";

// ADD THIS HELPER FUNCTION
const useRFQCountByPR = (pr_no: string) => {
  const { data } = useRequestForQuotation();
  const count = data?.data?.filter(rfq => rfq.purchase_request === pr_no).length || 0;
  return count;
};

export const columns: ColumnDef<purchaseRequestType>[] = [
  {
    accessorKey: "pr_no",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PR No." />
    ),
    cell: ({ row }) => {
      // FIXED: Use the helper function instead
      const rfqCount = useRFQCountByPR(row.getValue("pr_no"));
      const navigate = useNavigate();
      const pr_no = row.getValue("pr_no");
      return (
        <div className="flex space-x-2 items-center">
          <span
            className="max-w-[500px] truncate font-medium hover:underline cursor-pointer"
            onClick={() => navigate(`/bac/purchase-request/${pr_no}`)}
          >
            {row.getValue("pr_no")}
          </span>
          <Badge className="m-2 p-2 w-6 h-6 flex items-center justify-center bg-orange-200 border-2 text-slate-950">
            {rfqCount === 0 ? "0" : rfqCount}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("status")}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "purpose",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Purpose" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] font-medium">
            {row.getValue("purpose")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Requested By" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Received" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {formatDate(row.getValue("updated_at"))}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => (
      <DataTableRowActions
        pr_no={row.getValue("pr_no")}
        _data={row.original}
        link={"purchase-request"}
        form="Quotation"
      />
    ),
  },
];