import { useParams } from "react-router-dom";
import {
  deleteItem,
  FilteredItemInPurchaseRequest,
  arraySort,
  useGetItemInPurchaseRequest,
  //useAddItem,
  bulkImportItems,
} from "@/services/itemServices";
import {
  usePurchaseRequestActions,
  usePurchaseRequestList,
} from "@/services/purchaseRequestServices";
import { v4 as uuidv4 } from "uuid";
import { ItemType } from "@/types/request/item";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PurchaseRequestData,
  purchaseRequestFormSchema,
} from "@/types/request/purchase-request";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import PurchaseRequestForm from "./PurchaseRequestForm";
import { itemType } from "@/types/response/item";
import { useEffect } from "react";
import ItemForm from "./ItemForm";
import { toast } from "sonner";
import { DeleteDialog } from "./DeleteDialog";
import Loading from "../../shared/components/Loading";
import EditItemForm from "./EditItemForm";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  CircleMinusIcon,
  CircleXIcon,
  FileTextIcon,
  Loader2,
  MoveRightIcon,
  PencilLineIcon,
  TargetIcon,
  UserIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/services/formatDate";
import EditPRForm from "./EditPRForm";
import { generatePRPDF } from "@/services/generatePRPDF";
import useStatusStore from "@/store";
import { MessageDialog } from "../../shared/components/MessageDialog";
import { RESTRICTED_ACTION_STATUS } from "@/constants";
import { generateStockPropertyNo } from "@/services/generateStockPropertyNo";
import PPMPImportDialog, {
  PPMPItem,
} from "./PPMPImportDialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface messageDialogProps {
  open: boolean;
  message: string;
  type: "success" | "error" | "info";
  title: string;
}

export default function PurchaseRequestItemList() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [messageDialog, setMessageDialog] = useState<messageDialogProps>({
    open: false,
    type: "success" as const,
    title: "",
    message: "",
  });

  const { pr_no } = useParams();
  const { setStatus, status } = useStatusStore();

  const items = FilteredItemInPurchaseRequest(pr_no!);

  const { data } = useGetItemInPurchaseRequest({
    pr_no: pr_no,
  });

  const itemInPurchaseRequest = useMemo(() => {
    return Array.isArray(data?.data) ? data.data : [];
  }, [data?.data]);

  const {
    isLoading,
    data: purchase_request,
    error,
  } = usePurchaseRequestList(pr_no!);
  const isItemEmpty = items && items.length === 0;

  const {
    handleApprove,
    handleReject,
    handleCancel,
    handleForward,
    isPendingApprove,
    isPendingReject,
    isPendingCancel,
    isPendingForward,
    isError,
    isSuccess,
  } = usePurchaseRequestActions();

  const purchaseData = purchase_request?.data;

  const navigate = useNavigate();

  const { setValue } = useForm<PurchaseRequestData>({
    resolver: zodResolver(purchaseRequestFormSchema),
    defaultValues: {
      pr_no: pr_no,
      purpose: purchaseData?.purpose,
      status: purchaseData?.status,
      office: purchaseData?.office ? Number(purchaseData.office): null,
      requisitioner: purchaseData?.requisitioner_details.name,
      campus_director: purchaseData?.campus_director_details.name,
    },
  });

  useEffect(() => {
    if (purchaseData) {
      setValue("purpose", purchaseData?.purpose || "");
      setValue("office", purchaseData?.office ? Number(purchaseData.office) : null);
      setValue("requisitioner", purchaseData?.requisitioner_details.name || "");
      setValue(
        "campus_director",
        purchaseData?.campus_director_details.name || ""
      );
      setValue("status", purchaseData?.status);
    }
  }, [purchaseData, setValue]);

  useEffect(() => {
    setStatus(purchaseData?.status);

    return () => {
      setStatus("idle");
    };
  }, [setStatus, purchaseData]);

  const actionDisabled = RESTRICTED_ACTION_STATUS.includes(status!);

  let sortedItems;
  if (!isLoading) {
    sortedItems = arraySort(items!, "stock_property_no");
  }

  const handleOpenEditForm = () => setIsEditDialogOpen(true);

  const handleApprovePurchaseRequest = async () => {
    await handleApprove(pr_no!);
    if (isSuccess) {
      setMessageDialog({
        open: true,
        message: "Approved Successfully ",
        title: "Success",
        type: "success",
      });
    }

    if (isError) {
      setMessageDialog({
        open: true,
        message: "Something went wrong, Please try again later",
        title: "Error",
        type: "error",
      });
    }
  };

  const handleForwardToProcurement = async () => {
    await handleForward(pr_no!);
    if (isSuccess) {
      setMessageDialog({
        open: true,
        message: "Forwarded to Procurement Successfully ",
        title: "Success",
        type: "success",
      });
    }

    if (isError) {
      setMessageDialog({
        open: true,
        message: "Something went wrong, Please try again later",
        title: "Error",
        type: "error",
      });
    }
  };
  console.log(items);

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    const pdfURL = await generatePRPDF(itemInPurchaseRequest);
    setIsGenerating(false)
    return await window.open(pdfURL!, "_blank");
  };

  if (isLoading) return <Loading />;
  if (error) return <div>{error.message}</div>;

  return (
    <div className="">
      <Button className="mb-2" onClick={() => navigate(-1)}>
        <span className="flex gap-2 items-center">
          <ArrowLeftIcon className="h-5 w-5" />
          <p>Back</p>
        </span>
      </Button>

      <Card className="w-full bg-slate-100">
        <CardHeader className="flex flex-col">
          <CardTitle className="">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-thin">{purchaseData?.pr_no}</p>
                    <div className="flex items-center pt-2">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      <p className="text-sm font-thin">
                        {purchaseData?.created_at &&
                          formatDate(purchaseData?.created_at)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    disabled={actionDisabled}
                    className=" bg-orange-200 hover:bg-orange-300 text-slate-950"
                    onClick={handleOpenEditForm}
                  >
                    <PencilLineIcon className=" w-4 h-4 mr-2" /> Edit
                  </Button>
                </div>

                <Badge
                  className={
                    purchaseData?.status === "Approved"
                      ? "bg-green-200 hover:bg-green-300 text-green-500"
                      : purchaseData?.status === "Cancelled"
                      ? "bg-red-100 hover:bg-red-200 text-red-400"
                      : "bg-orange-100 text-orange-400"
                  }
                >
                  {purchaseData?.status}
                </Badge>
              </div>
              <Separator className="mt-3" />
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  <p className="text-lg font-thin">
                    {purchaseData?.requisitioner_details.name}
                  </p>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center">
                  <TargetIcon className="w-4 h-4 mr-1" />
                  <p className="text-lg font-thin">{purchaseData?.purpose}</p>
                </div>
              </div>
            </div>
          </CardTitle>
          <div className="flex justify-between pt-4 pb-2">
            <TooltipProvider delayDuration={100} skipDelayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      disabled={isItemEmpty}
                      onClick={handleGeneratePDF}
                      className="flex bg-green-300 hover:rounded-full hover:bg-green-300 hover:border-none text-gray-950"
                    >
                      <p className="mx-1 text-sm font-thin">{ isGenerating ? "Generating": "Generate PDF"}</p>
                      <FileTextIcon className="w-4 h-4 mr-2" />
                      <span className="sr-only">Generate PDF</span>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {items?.length === 0
                    ? "Please add Items to generate PDF"
                    : "Click to generate PDF"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex gap-1">
              <>
                {purchaseData?.status !== "Cancelled" &&
                  purchaseData?.status !== "Forwarded to Procurement" &&
                  purchaseData?.status !== "Received by the Procurement" &&
                  purchaseData?.status !== "Ready to Order" &&
                  purchaseData?.status !== "Completed" &&
                  purchaseData?.status !== "Items Delivered" &&
                  purchaseData?.status !== "Ready for Distribution" && (
                    <>
                      {purchaseData?.status !== "Approved" &&
                        purchaseData?.status !== "Rejected" && (
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  className="bg-green-400 hover:bg-green-500 text-white"
                                  onClick={handleApprovePurchaseRequest}
                                  disabled={isPendingApprove || isItemEmpty}
                                >
                                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                                  {isPendingApprove ? (
                                    <Loader2 className="animate-spin" />
                                  ) : (
                                    "Approve"
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {isItemEmpty
                                    ? "Please add some items to proceed"
                                    : "Click to Approved The Purchase Request"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                      {purchaseData?.status !== "Approved" &&
                        purchaseData?.status !== "Rejected" &&
                        purchaseData?.status !== "Cancelled" && (
                          <Button
                            className="bg-red-400 hover:bg-red-500 text-white"
                            onClick={() => handleReject(pr_no!)}
                            disabled={isPendingReject}
                          >
                            <CircleXIcon className="w-4 h-4 mr-2" />
                            {isPendingReject ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              "Reject"
                            )}
                          </Button>
                        )}

                      {purchaseData?.status !== "Rejected" && (
                        <Button
                          className="bg-orange-300 hover:bg-orange-400 text-white"
                          onClick={() => handleCancel(pr_no!)}
                          disabled={isPendingCancel}
                        >
                          <CircleMinusIcon className="w-4 h-4 mr-2" />
                          {isPendingCancel ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            "Cancel"
                          )}
                        </Button>
                      )}

                      {purchaseData?.status === "Approved" && (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={handleForwardToProcurement}
                                variant="outline"
                                disabled={isPendingForward}
                                className="flex data-[state=open]:bg-muted hover:rounded-full bg- hover:bg-green-300 hover:border-none text-gray-950"
                              >
                                <p className="mx-1 text-sm font-thin">
                                  {isPendingForward ? (
                                    <Loader2 className="animate-spin" />
                                  ) : (
                                    "Forward"
                                  )}
                                </p>
                                <MoveRightIcon className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Forward to Procurement
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </>
                  )}
              </>
            </div>
          </div>
          <Separator className="pt-0 text-orange-300 bg-orange-200" />
        </CardHeader>
        <CardContent>
          <ItemList sortedItems={sortedItems!} />
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>

      <EditPRForm
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        pr_no={purchaseData?.pr_no ?? ""}
      />

      <PurchaseRequestForm
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        lastPrNo={pr_no}
      />

      <MessageDialog
        message={messageDialog?.message}
        title={messageDialog?.title}
        type={messageDialog?.type}
        open={messageDialog?.open}
        onOpenChange={(open) => setMessageDialog((prev) => ({ ...prev, open }))}
      />
    </div>
  );
}

const ItemList = ({ sortedItems }: { sortedItems: itemType[] }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedItemNo, setSelectedItemNo] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isPPMPDialogOpen, setIsPPMPDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [importResult, setImportResult] = useState<{
    open: boolean;
    importedCount: number;
    skippedCount: number;
    duplicates: string[];
  }>({
    open: false,
    importedCount: 0,
    skippedCount: 0,
    duplicates: [],
  });

  const { pr_no } = useParams();
  const queryClient = useQueryClient();
  const { status } = useStatusStore();

  const actionDisabled = RESTRICTED_ACTION_STATUS.includes(status!);

  const toggleItemSelection = (itemNo: string) => {
    setSelectedItems((current) =>
      current.includes(itemNo)
        ? current.filter((id) => id !== itemNo)
        : [...current, itemNo]
    );
  };

  const allItemsSelected =
    sortedItems.length > 0 &&
    selectedItems.length === sortedItems.length;

  const toggleSelectAll = () => {
    if (allItemsSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        sortedItems.map((item) => item.item_no)
      );
    }
  };

  const handleItemDelete = async () => {
    if (!selectedItemNo) return;

    try {
      await deleteItem(selectedItemNo);

      await queryClient.invalidateQueries({
        queryKey: ["items"],
      });

      toast.success("Successfully Deleted!", {
        description: "The item was successfully deleted.",
      });

      setSelectedItemNo(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("DELETE ITEM ERROR:", error);

      toast.error("Failed to delete item.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    try {
      await Promise.all(
        selectedItems.map((itemNo) => deleteItem(itemNo))
      );

      await queryClient.invalidateQueries({
        queryKey: ["items"],
      });

      toast.success("Successfully Deleted!", {
        description: `${selectedItems.length} items were successfully deleted.`,
      });

      setSelectedItems([]);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("BULK DELETE ERROR:", error);

      toast.error("Failed to delete selected items.");
    }
  };

  const handlePPMPImport = async (ppmpItems: PPMPItem[]) => {
    if (!pr_no) {
      toast.error("Purchase Request number is missing.");
      return;
    }

    try {
      const existingDescriptions = new Set(
        (sortedItems ?? []).map((item) =>
          item.item_description.trim().toLowerCase()
        )
      );

      const existingItemsForStock = (sortedItems ?? []).map((item) => ({
        ...item,
        purchase_request: pr_no,
      }));

      let currentStockNumber =
        generateStockPropertyNo(existingItemsForStock) - 1;

    
      let frontendSkippedCount = 0;
      const frontendDuplicates: string[] = [];

      const itemsToImport: ItemType[] = [];

      for (const ppmpItem of ppmpItems) {
        const normalizedDescription =
          ppmpItem.item_description.trim().toLowerCase();

        if (existingDescriptions.has(normalizedDescription)) {
          frontendSkippedCount++;
          frontendDuplicates.push(ppmpItem.item_description);
          continue;
        }

        currentStockNumber += 1;

        const quantity = Number(ppmpItem.quantity);
        const unitCost = Number(ppmpItem.unit_price);

        const itemData: ItemType = {
          purchase_request: pr_no,
          item_no: uuidv4(),
          stock_property_no: currentStockNumber.toString(),
          unit: ppmpItem.unit,
          item_description: ppmpItem.item_description,
          quantity,
          unit_cost: unitCost,
          total_cost: quantity * unitCost,
        };

        itemsToImport.push(itemData);

        existingDescriptions.add(normalizedDescription);
      }

      // Nothing new to import
      if (itemsToImport.length === 0) {
        setImportResult({
          open: true,
          importedCount: 0,
          skippedCount: frontendSkippedCount,
          duplicates: frontendDuplicates,
        });

        setIsPPMPDialogOpen(false);
        return;
      }

      const result = await bulkImportItems(
        pr_no,
        itemsToImport
      );

      const importedCount = result.imported_count;
      const totalSkipped =
        frontendSkippedCount + result.skipped_count;
      const allDuplicates = [
        ...frontendDuplicates,
        ...result.duplicates,
      ];

      setImportResult({
        open: true,
        importedCount,
        skippedCount: totalSkipped,
        duplicates: allDuplicates,
      });

      await queryClient.invalidateQueries({
        queryKey: ["items"],
      });

      if (totalSkipped > 0) {
          toast.success(
            `${importedCount} item${
              importedCount !== 1 ? "s" : ""
            } imported. ${totalSkipped} duplicate${
              totalSkipped !== 1 ? "s were" : " was"
            } skipped.`
          );
        } else {
          toast.success(
            `${importedCount} item${
              importedCount !== 1 ? "s" : ""
            } imported successfully.`
          );
        }

      setIsPPMPDialogOpen(false);

    } catch (error) {
      console.error("PPMP BULK IMPORT ERROR:", error);

      toast.error(
        "Failed to import PPMP items. No items were imported."
      );
    }
  };

  return (
    <div className="border-none">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <ItemForm pr_no={pr_no!} />
        </div>

        <Button
          type="button"
          disabled={actionDisabled}
          onClick={() => setIsPPMPDialogOpen(true)}
          className="bg-orange-300 hover:bg-orange-400 text-gray-950"
        >
          Import from PPMP
        </Button>
      </div>

          <div className="flex items-center justify-between mb-3">
      <p className="font-bold">Items</p>

      {selectedItems.length > 0 && (
        <Button
          type="button"
          variant="destructive"
          disabled={actionDisabled}
          onClick={() => setIsDialogOpen(true)}
        >
          <TrashIcon className="mr-2 h-4 w-4" />
          Delete Selected ({selectedItems.length})
        </Button>
      )}
    </div>
      <div className="grid grid-cols-8 gap-2 mb-4 items-center border-b-2 py-4">
        <Label className="text-base">
          <Checkbox
            checked={allItemsSelected}
            onCheckedChange={toggleSelectAll}
            disabled={actionDisabled}
          />
        </Label>

        <Label className="text-base">Stock Property No.</Label>
        <Label className="text-base">Unit</Label>
        <Label className="text-base">Description</Label>
        <Label className="text-base">Quantity</Label>
        <Label className="text-base">Unit Cost</Label>
        <Label className="text-base">Total Cost</Label>
        <Label className="text-base">Actions</Label>
      </div>
      {sortedItems?.length ? (
        sortedItems.map((item) => (
          <div
            key={item.item_no}
            className="grid grid-cols-8 gap-2 mb-4 items-center p-2  border-b-2"
          >
            <Checkbox
              checked={selectedItems.includes(item.item_no)}
              onCheckedChange={() =>
                toggleItemSelection(item.item_no)
              }
              disabled={actionDisabled}
            />
            <Label>{item.stock_property_no}</Label>
            <Label>{item.unit}</Label>
            <Label>{item.item_description}</Label>
            <Label>{item.quantity}</Label>
            <Label>{item.unit_cost}</Label>
            <Label>{item.total_cost}</Label>
            <TooltipProvider delayDuration={100} skipDelayDuration={200}>
              <div className="flex gap-4 ">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        disabled={actionDisabled}
                        onClick={() => {
                          setSelectedItemNo(item.item_no);
                          setIsEditDialogOpen(true);
                        }}
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:rounded-full"
                      >
                        <Pencil1Icon className="h-4 w-4 text-orange-400" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {actionDisabled
                      ? `You cannot edit items because it has already been ${status}`
                      : "Click to edit Items"}
                  </TooltipContent>
                </Tooltip>

                <Separator className="h-8" orientation="vertical" decorative />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        disabled={actionDisabled}
                        onClick={() => {
                          setSelectedItems([]);
                          setSelectedItemNo(item.item_no);
                          setIsDialogOpen(true);
                        }}
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:rounded-full text-orange-400 hover:bg-red-400 hover:text-gray-100"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {actionDisabled
                      ? `You cannot delete items because it has already been ${status}`
                      : "Click to delete Items"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        ))
      ) : (
        <div className="w-full flex items-center flex-col">
          <img src="/empty-box.svg" className="w-80 h-80" alt="Empty box" />
          <p>It looks a bit empty here! Start by adding a new item.</p>
        </div>
      )}
      <DeleteDialog
        onDeleteClick={
          selectedItems.length > 0
            ? handleBulkDelete
            : handleItemDelete
        }
        message={
          selectedItems.length > 0
            ? `${selectedItems.length} Items`
            : "Item"
        }
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
      <EditItemForm
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        item_no={selectedItemNo!}
      />
      {isPPMPDialogOpen && (
        <PPMPImportDialog
          onClose={() => setIsPPMPDialogOpen(false)}
          onImport={handlePPMPImport}
        />
      )}
      <Dialog
        open={importResult.open}
        onOpenChange={(open) =>
          setImportResult((prev) => ({
            ...prev,
            open,
          }))
        }
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              PPMP Import Result
            </DialogTitle>

            <DialogDescription>
              The PPMP import has finished.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-3">
              <p className="text-sm font-medium text-green-700">
                Successfully imported
              </p>

              <p className="text-2xl font-bold text-green-700">
                {importResult.importedCount}
              </p>
            </div>

            {importResult.skippedCount > 0 && (
              <div className="rounded-md bg-orange-50 p-3">
                <p className="text-sm font-medium text-orange-700">
                  Duplicates skipped
                </p>

                <p className="text-2xl font-bold text-orange-700">
                  {importResult.skippedCount}
                </p>
              </div>
            )}

            {importResult.duplicates.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold">
                  Duplicate items:
                </p>

                <div className="max-h-60 overflow-y-auto rounded-md border">
                  <ul className="divide-y">
                    {importResult.duplicates.map(
                      (description, index) => (
                        <li
                          key={`${description}-${index}`}
                          className="px-3 py-2 text-sm"
                        >
                          {description}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() =>
                  setImportResult((prev) => ({
                    ...prev,
                    open: false,
                  }))
                }
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
