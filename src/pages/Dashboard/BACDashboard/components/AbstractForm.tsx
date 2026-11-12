import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetItemQuotation,
  useRequestForQuotation,
} from "@/services/requestForQuotationServices";
import { quotationResponseType } from "@/types/response/request-for-quotation";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { SupplierCard } from "./SupplierCard";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  abstractType,
  abstractSchema,
  supplierType,
  supplierItemType,
} from "@/types/request/abstract_of_quotation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  addSupplier,
  useAddAbstractOfQuotation,
  useAddSupplierItem,
} from "@/services/AbstractOfQuotationServices";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Empty } from "../../shared/components/Empty";
import Loading from "../../shared/components/Loading";
import { itemQuotationResponseType } from "@/types/response/request-for-quotation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MessageDialog } from "../../shared/components/MessageDialog";
import { AxiosError } from "axios";
import { FilteredItemInPurchaseRequest } from "@/services/itemServices";
import { indexToLetter } from "@/utils/indexToLetter";
import { Input } from "@/components/ui/input";

interface AbstractFormProps {
  prNoFromProps: string;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

interface SelectedItems {
  rfq_no: string;
  item_quote_no: string;
  item_no: string;
  item_quantity: number;
  item_cost: number;
  total_amount: number;
}

interface Quotation {
  rfq_no: string;
  items: SelectedItems[];
}

interface TiedLowestItem {
  item_no: string;
  item_description: string;
  unit: string;
  lowest_price: number;
  bidders: itemQuotationResponseType[];
}
interface messageDialogProps {
  open: boolean;
  message: string;
  title: string;
  type: "success" | "error" | "info";
}

export const AbstractForm: React.FC<AbstractFormProps> = ({
  prNoFromProps,
  isDialogOpen,
  setIsDialogOpen,
}) => {
  const [messageDialog, setMessageDialog] = useState<messageDialogProps>({
    open: false,
    message: "",
    title: "",
    type: "success" as const,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rfqNo, setRfqNo] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [editableQuotation, setEditableQuotation] = useState<itemQuotationResponseType[]>([]);
  const [isLowestPriceDialogOpen, setIsLowestPriceDialogOpen] = useState(false);
  const [tiedLowestItems, setTiedLowestItems] = useState<TiedLowestItem[]>([]);
  const [tieSelections, setTieSelections] = useState<Record<string, string>>({});
  const { pr_no } = useParams();

  //use the purchase request no from params if the purchase request number from props is undefined
  const purchaseNumber = prNoFromProps ? prNoFromProps : pr_no;

  const { data: rfqs } = useRequestForQuotation();
  const { data: items_, isLoading: item_loading } = useGetItemQuotation();
  const purchaseItems = FilteredItemInPurchaseRequest(purchaseNumber!);
  const _items = useMemo(() => {
    return Array.isArray(items_?.data) ? items_.data : [];
  }, [items_?.data]);

  const itemQuotation = useMemo(() => {
    return _items.filter((data) => data.rfq === rfqNo);
  }, [_items, rfqNo]);

  const quotations_ = useMemo(() => {
    const data_ = Array.isArray(rfqs?.data) ? rfqs.data : [];
    return data_.filter((data) => data.purchase_request === purchaseNumber);
  }, [rfqs?.data, purchaseNumber]);

  const { mutate: addAOQMutation } = useAddAbstractOfQuotation();
  const { mutate: addSupplierItemMutation } = useAddSupplierItem();

  const { handleSubmit, setValue } = useForm({
    resolver: zodResolver(abstractSchema),
    defaultValues: {
      aoq_no: purchaseNumber ?? "",
      purchase_request: purchaseNumber ?? "",
    },
  });

  useEffect(() => {
    if (isDialogOpen && itemQuotation.length > 0) {
      setValue("aoq_no", purchaseNumber ?? "");
      setValue("purchase_request", purchaseNumber ?? "");
      setEditableQuotation(itemQuotation);
    }
  }, [isDialogOpen, setValue, itemQuotation, purchaseNumber]);

  useEffect(() => {
    if (isDialogOpen && itemQuotation && itemQuotation.length > 0) {
      setEditableQuotation(itemQuotation);
    }
  }, [itemQuotation, isDialogOpen, selectedSupplier]);

  const handleItemSelection = (item: itemQuotationResponseType) => {
    if (!selectedSupplier) return;
    setQuotations((prevQuotations) => {
      const supplierQuotation = prevQuotations.find(
        (q) => q.rfq_no === selectedSupplier,
      );
      const selectedItem: SelectedItems = {
        rfq_no: item.rfq,
        item_quote_no: item.item_quotation_no,
        item_no: item.item_details.item_no,
        item_quantity: Number(item.item_details.quantity),
        item_cost: Number(item.item_details.unit_cost),
        total_amount:
          Number(item.item_details.quantity) * Number(item.unit_price),
      };

      if (supplierQuotation) {
        const itemIndex = supplierQuotation.items.findIndex(
          (i) => i.item_quote_no === item.item_quotation_no,
        );
        if (itemIndex > -1) {
          const updatedItems = [...supplierQuotation.items];
          updatedItems.splice(itemIndex, 1);
          return prevQuotations.map((q) =>
            q.rfq_no === selectedSupplier ? { ...q, items: updatedItems } : q,
          );
        } else {
          return prevQuotations.map((q) =>
            q.rfq_no === selectedSupplier
              ? { ...q, items: [...q.items, selectedItem] }
              : q,
          );
        }
      } else {
        return [
          ...prevQuotations,
          { rfq_no: selectedSupplier, items: [selectedItem] },
        ];
      }
    });
  };

  const handleSelectAllItems = () => {
    if (!selectedSupplier) return;

    setQuotations((prevQuotations) => {
      const supplierQuotation = prevQuotations.find(
        (q) => q.rfq_no === selectedSupplier
      );

      const currentItems = supplierQuotation?.items ?? [];

      const selectableItems = editableQuotation.filter(
        (item) => !isItemSelected(item.item_details.item_no)
      );

      // Check whether all available items are already selected
      const allSelectableSelected =
        selectableItems.length > 0 &&
        selectableItems.every((item) =>
          currentItems.some(
            (selectedItem) =>
              selectedItem.item_quote_no === item.item_quotation_no
          )
        );

      if (allSelectableSelected) {
        return prevQuotations.map((q) =>
          q.rfq_no === selectedSupplier
            ? {
                ...q,
                items: q.items.filter(
                  (selectedItem) =>
                    !selectableItems.some(
                      (item) =>
                        item.item_quotation_no ===
                        selectedItem.item_quote_no
                    )
                ),
              }
            : q
        );
      }

      const newItems: SelectedItems[] = selectableItems
        .filter(
          (item) =>
            !currentItems.some(
              (selectedItem) =>
                selectedItem.item_quote_no === item.item_quotation_no
            )
        )
        .map((item) => ({
          rfq_no: item.rfq,
          item_quote_no: item.item_quotation_no,
          item_no: item.item_details.item_no,
          item_quantity: Number(item.item_details.quantity),
          item_cost: Number(item.item_details.unit_cost),
          total_amount:
            Number(item.item_details.quantity) *
            Number(item.unit_price),
        }));

      if (!supplierQuotation) {
        return [
          ...prevQuotations,
          {
            rfq_no: selectedSupplier,
            items: newItems,
          },
        ];
      }

      // Supplier already exists, so add the new items
      return prevQuotations.map((q) =>
        q.rfq_no === selectedSupplier
          ? {
              ...q,
              items: [...q.items, ...newItems],
            }
          : q
      );
    });
  };

  const createSelectedItem = (
    item: itemQuotationResponseType,
  ): SelectedItems => ({
    rfq_no: item.rfq,
    item_quote_no: item.item_quotation_no,
    item_no: item.item_details.item_no,
    item_quantity: Number(item.item_details.quantity),
    item_cost: Number(item.item_details.unit_cost),
    total_amount:
      Number(item.item_details.quantity) * Number(item.unit_price),
  });

  const handleSelectLowestPrice = () => {
    // Only compare quotations belonging to this purchase request.
    const validRfqNumbers = new Set(
      quotations_.map((quotation) => quotation.rfq_no),
    );

    const relevantItems = _items.filter((item) =>
      validRfqNumbers.has(item.rfq),
    );

    // Group quotations by purchase request item.
    const groupedItems = new Map<string, itemQuotationResponseType[]>();

    relevantItems.forEach((item) => {
      const itemNo = item.item_details.item_no;

      if (!groupedItems.has(itemNo)) {
        groupedItems.set(itemNo, []);
      }

      groupedItems.get(itemNo)!.push(item);
    });

    const uniqueLowestItems: itemQuotationResponseType[] = [];
    const tiedItems: TiedLowestItem[] = [];

    groupedItems.forEach((bidders, itemNo) => {
      // Do not change items already assigned to another supplier.
      const alreadySelected = quotations.some((quotation) =>
        quotation.items.some((selected) => selected.item_no === itemNo),
      );

      if (alreadySelected) return;

      const lowestPrice = Math.min(
        ...bidders.map((bidder) => Number(bidder.unit_price)),
      );

      const lowestBidders = bidders.filter(
        (bidder) => Number(bidder.unit_price) === lowestPrice,
      );

      if (lowestBidders.length === 1) {
        uniqueLowestItems.push(lowestBidders[0]);
      } else {
        tiedItems.push({
          item_no: itemNo,
          item_description: lowestBidders[0].item_details.item_description,
          unit: lowestBidders[0].item_details.unit,
          lowest_price: lowestPrice,
          bidders: lowestBidders,
        });
      }
    });

    // Automatically select items with a unique lowest price.
    setQuotations((previous) => {
      const updated = [...previous];

      uniqueLowestItems.forEach((item) => {
        const existingSupplier = updated.find(
          (quotation) => quotation.rfq_no === item.rfq,
        );

        const selectedItem = createSelectedItem(item);

        if (existingSupplier) {
          updated[updated.indexOf(existingSupplier)] = {
            ...existingSupplier,
            items: [...existingSupplier.items, selectedItem],
          };
        } else {
          updated.push({
            rfq_no: item.rfq,
            items: [selectedItem],
          });
        }
      });

      return updated;
    });

    // Open one dialog containing all tied items.
    if (tiedItems.length > 0) {
      setTiedLowestItems(tiedItems);
      setTieSelections({});
      setIsLowestPriceDialogOpen(true);
    }
  };

  const handleConfirmLowestPrice = () => {
    // Require a bidder selection for every tied item.
    if (
      tiedLowestItems.some(
        (item) => !tieSelections[item.item_no],
      )
    ) {
      return;
    }

    setQuotations((previous) => {
      const updated = [...previous];

      tiedLowestItems.forEach((tiedItem) => {
        // Do not overwrite an item selected while the dialog was open.
        const alreadySelected = updated.some((quotation) =>
          quotation.items.some(
            (selected) => selected.item_no === tiedItem.item_no,
          ),
        );

        if (alreadySelected) return;

        const selectedBidder = tiedItem.bidders.find(
          (bidder) =>
            bidder.item_quotation_no ===
            tieSelections[tiedItem.item_no],
        );

        if (!selectedBidder) return;

        const selectedItem = createSelectedItem(selectedBidder);

        const existingSupplier = updated.find(
          (quotation) => quotation.rfq_no === selectedBidder.rfq,
        );

        if (existingSupplier) {
          updated[updated.indexOf(existingSupplier)] = {
            ...existingSupplier,
            items: [...existingSupplier.items, selectedItem],
          };
        } else {
          updated.push({
            rfq_no: selectedBidder.rfq,
            items: [selectedItem],
          });
        }
      });

      return updated;
    });

    setIsLowestPriceDialogOpen(false);
    setTiedLowestItems([]);
    setTieSelections({});
  };

  const isItemSelected = (item_no: string) => {
    return quotations.some(
      (quotation) =>
        quotation.rfq_no !== selectedSupplier &&
        quotation.items.some((item) => item.item_no === item_no),
    );
  };

  const getSelectedSupplierForItem = (item_no: string) => {
    const selectedQuotation = quotations.find(
      (quotation) =>
        quotation.rfq_no !== selectedSupplier &&
        quotation.items.some((item) => item.item_no === item_no),
    );

    if (!selectedQuotation) return null;

    return (
      quotations_.find(
        (quotation) => quotation.rfq_no === selectedQuotation.rfq_no,
      )?.supplier_name ?? null
    );
  };

  const isItemSelectedForCurrentSupplier = (item_quote_no: string) => {
    return (
      quotations
        .find((quotation) => quotation.rfq_no === selectedSupplier)
        ?.items.some((item) => item.item_quote_no === item_quote_no) || false
    );
  };

  const handleToggle = (supplier: quotationResponseType) => {
    setSelectedSupplier(
      supplier.rfq_no === selectedSupplier ? null : supplier.rfq_no,
    );
    setRfqNo((prevRfqNo) =>
      supplier.rfq_no === prevRfqNo ? null : supplier.rfq_no,
    );
  };

  const allItemQuotationCount = purchaseItems && purchaseItems?.length;

  const selectedItems = useMemo(() => {
    return new Set(
      quotations.flatMap((data) =>
        data.items.map((item) => item.item_quote_no),
      ),
    );
  }, [quotations]);

  const allItemsSelected = useMemo(() => {
    if (!selectedSupplier) return false;

    const availableItems = editableQuotation.filter(
      (item) => !isItemSelected(item.item_details.item_no)
    );

    if (availableItems.length === 0) return false;

    return availableItems.every((item) =>
      isItemSelectedForCurrentSupplier(
        item.item_quotation_no.toString()
      )
    );
  }, [editableQuotation, quotations, selectedSupplier]);

  const restrictedSubmitAction = allItemQuotationCount! > selectedItems.size;

  const handleInputChange = (
    index: number,
    field: "quantity" | "unit_cost",
    value: string,
  ) => {
    const updatedQuotation = [...editableQuotation];
    updatedQuotation[index].item_details[field] = value ?? 0;
    setEditableQuotation(updatedQuotation);
  };

  const onSubmit = async (
    data: abstractType | supplierType | supplierItemType,
  ) => {
    setIsLoading(true);
    try {
      const result = abstractSchema.safeParse(data);

      if (!result.success) {
        return;
      }

      console.log("AOQ PAYLOAD:", data);
      if (quotations.length === 0) {
        setMessageDialog({
          open: true,
          title: "No Suppliers",
          message: "Please select at least one supplier.",
          type: "error",
        });
        return;
      }

      await addAOQMutation(data as abstractType, {
        onSuccess: async (AOQResponse) => {
          console.log("AOQ RESPONSE:", AOQResponse);

          const aoqNo = AOQResponse?.data?.aoq_no;
          console.log("AOQ NO:", aoqNo);

          const suppliersWithItems = quotations.map((quotation, index) => ({
            supplier_no: uuidv4(),
            extra_character: indexToLetter(index + 1),
            aoq: aoqNo!,
            rfq: quotation.rfq_no,
            items: quotation.items,
          }));

          let allItems: Array<supplierItemType> = [];

          for (const supplier of suppliersWithItems) {
            try {
              console.log("SUPPLIER PAYLOAD");
              console.log({
                supplier_no: supplier.supplier_no,
                extra_character: supplier.extra_character,
                name: quotations_.find((q) => q.rfq_no === supplier.rfq)
                  ?.supplier_name,
                aoq: supplier.aoq,
                rfq: supplier.rfq,
              });
              const supplierResponse = await addSupplier({
                supplier_no: supplier.supplier_no,
                name:
                  quotations_.find((q) => q.rfq_no === supplier.rfq)
                    ?.supplier_name || "Unknown Supplier",
                address:
                  quotations_.find((q) => q.rfq_no === supplier.rfq)
                    ?.supplier_address || "N/A",
                contact_person: "N/A",
                contact_number: "0000000000",
                tin:
                  quotations_.find((q) => q.rfq_no === supplier.rfq)?.tin ||
                  "N/A",

                extra_character: supplier.extra_character,

                aoq: supplier.aoq,
                rfq: supplier.rfq,
              });
              console.log("SUPPLIER RESPONSE:", supplierResponse);

              const supplier_no = supplierResponse?.data?.supplier_no;
              if (!supplier_no) {
                console.error(
                  "Failed to retrieve supplier number from the response.",
                );

                continue;
              }

              const supplierItems = supplier.items.map((item) => ({
                supplier_item_no: uuidv4(),
                supplier: supplier_no,
                rfq: item.rfq_no,
                item_quotation: item.item_quote_no,
                item_quantity: item.item_quantity,
                item_cost: item.item_cost,
                total_amount: item.total_amount.toString(),
              }));

              allItems = [...allItems, ...supplierItems];
            } catch (error) {
              console.error("Error processing supplier:", error);
            }
          }

          await Promise.all(
            allItems.map(async (item) => {
              await addSupplierItemMutation(item);
            }),
          );

          setIsDialogOpen(false);
          setIsLoading(false);
          setMessageDialog({
            open: true,
            message: "Abstract added successfully",
            title: "Success",
            type: "success",
          });
        },
        onError: (error: any) => {
          console.error("AOQ ERROR FULL:", error);
          console.error("AOQ ERROR DATA:", error?.error?.response?.data);
          setIsDialogOpen(false);
          setIsLoading(false);
          setMessageDialog({
            open: true,
            message: "Something went wrong, please try again later",
            title: "Error",
            type: "error",
          });
        },
      });
    } catch (error) {
      setIsDialogOpen(false);
      setIsLoading(false);
      setMessageDialog({
        open: true,
        message:
          (error as AxiosError).message ??
          "Something went wrong, please try again later",
        title: "Error",
        type: "error",
      });
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-full w-[70rem] ">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Create Abstract of Quotation [{purchaseNumber}]
            </DialogTitle>
          </DialogHeader>
          <div className="h-[30rem] overflow-auto mb-9">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-xl w-full">
                    <p className="">Select Supplier</p>
                    <Carousel
                      opts={{
                        align: "start",
                        loop: true,
                      }}
                      className=" mx-10"
                    >
                      <CarouselContent className="">
                        {quotations_.length > 0 ? (
                          quotations_?.map((supplier, index) => (
                            <CarouselItem
                              key={index}
                              className="md:basis-1/2 lg:basis-1/3"
                            >
                              <div className="p-1">
                                <SupplierCard
                                  supplier={supplier}
                                  isSelected={
                                    supplier.rfq_no === selectedSupplier
                                  }
                                  onToggle={() => handleToggle(supplier)}
                                />
                              </div>
                            </CarouselItem>
                          ))
                        ) : (
                          <Empty message="No Supplier Found" />
                        )}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </CardTitle>
                </CardHeader>
                <CardContent className="">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <p className="text-xl">Items</p>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleSelectLowestPrice}
                        disabled={item_loading || _items.length === 0}
                      >
                        Select Lowest Price
                      </Button>
                    </div>

                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <QuestionMarkCircledIcon
                            width={25}
                            height={25}
                            className="text-gray-600"
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>
                            Tick the checkbox to include this item in your
                            abstract of quotation.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div>
                    <div className="grid grid-cols-9 gap-2 items-center py-4  border-b-2 sticky bg-background top-0">
                      <p>UNIT</p>
                      <p className="col-span-2">ITEM DESCRIPTION</p>
                      <p>QUANTITY</p>
                      <p>UNIT COST</p>
                      <p className="col-span-2">BRAND / MODEL</p>
                      <p>UNIT PRICE </p>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={allItemsSelected}
                          disabled={!selectedSupplier || editableQuotation.length === 0}
                          onCheckedChange={handleSelectAllItems}
                        />

                        <p className="text-sm font-medium">
                          {allItemsSelected ? "Deselect" : "Select All"}
                        </p>
                      </div>
                    </div>
                    {item_loading ? (
                      <Loading />
                    ) : editableQuotation && editableQuotation?.length > 0 ? (
                      editableQuotation.map((item, index) => {
                        const selectedSupplierForItem = getSelectedSupplierForItem(
                          item.item_details.item_no
                        );

                        const isSelectedByAnotherSupplier = Boolean(
                          selectedSupplierForItem
                        );

                        return (
                          <div
                            key={item.item_quotation_no}
                            className={`grid grid-cols-9 gap-2 items-center py-6 border-b-2 transition-opacity ${
                              isSelectedByAnotherSupplier
                                ? "bg-gray-50/60 opacity-50"
                                : ""
                            }`}
                          >
                          <p className="text-gray-500">
                            {editableQuotation[index].item_details.unit}
                          </p>
                          <div className="col-span-2">
                            <p className="text-gray-500">
                              {editableQuotation[index].item_details.item_description}
                            </p>
                          </div>
                          <Input
                            defaultValue={
                              editableQuotation[index].item_details.quantity
                            }
                            value={
                              editableQuotation[index].item_details.quantity
                            }
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "quantity",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            defaultValue={
                              editableQuotation[index].item_details.unit_cost
                            }
                            value={
                              editableQuotation[index].item_details.unit_cost
                            }
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "unit_cost",
                                e.target.value,
                              )
                            }
                          />
                          <div className="flex flex-col col-span-2">
                            <p className="text-gray-500">
                              {editableQuotation[index].brand_model}
                            </p>
                          </div>
                          <div className="flex flex-col">
                            <div
                              className={`${
                                item.is_low_price
                                  ? "text-green-400 bg-green-100"
                                  : "text-red-400 bg-red-100"
                              } rounded-md flex gap-2 items-center`}
                            >
                              <div className="pl-2">
                                {item.is_low_price ? (
                                  <CheckCircledIcon />
                                ) : (
                                  <CrossCircledIcon />
                                )}
                              </div>
                              <p>{item.unit_price}</p>
                            </div>
                          </div>

                          {isSelectedByAnotherSupplier ? (
                            <div className="place-self-center text-center">
                              <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600">
                                Selected:
                              </span>

                              <p className="text-xs font-semibold text-red-600 mt-1">
                                {selectedSupplierForItem}
                              </p>
                            </div>
                          ) : (
                            <Checkbox
                              className="place-self-center"
                              checked={isItemSelectedForCurrentSupplier(
                                item.item_quotation_no.toString(),
                              )}
                              onCheckedChange={() => handleItemSelection(item)}
                              disabled={
                                !selectedSupplier ||
                                isItemSelected(item.item_details.item_no)
                              }
                            />
                          )}
                        </div>
                      );
                    })
                    ) : (
                      <div className="grid place-items-center w-full h-96">
                        <p className="flex">
                          No suppliers found. Please select a supplier to
                          proceed.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="fixed bottom-6 right-10 flex gap-2 items-center">
                    <p>
                      ({selectedItems.size} of {purchaseItems?.length} item
                      selected)
                    </p>
                    <Button
                      className={`text-slate-950 bg-orange-200 px-8 py-1 hover:bg-orange-300 ${
                        isLoading && "px-16"
                      }`}
                      type="submit"
                      disabled={restrictedSubmitAction}
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <p className="text-base">Create AOQ</p>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isLowestPriceDialogOpen}
        onOpenChange={setIsLowestPriceDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Lowest Price Tie
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-500">
            Multiple bidders submitted the same lowest price for the
            following items. Select one bidder for each item.
          </p>

          <div className="space-y-5">
            {tiedLowestItems.map((item) => (
              <div
                key={item.item_no}
                className="border rounded-lg p-4 space-y-3"
              >
                <div>
                  <p className="font-semibold">
                    {item.item_description}
                  </p>

                  <p className="text-sm text-gray-500">
                    {item.unit} · Item No: {item.item_no}
                  </p>

                  <p className="text-sm font-medium text-green-600 mt-1">
                    Lowest Price: ₱{item.lowest_price.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  {item.bidders.map((bidder) => {
                    const supplierName =
                      quotations_.find(
                        (quotation) => quotation.rfq_no === bidder.rfq,
                      )?.supplier_name ?? "Unknown Supplier";

                    const isSelected =
                      tieSelections[item.item_no] ===
                      bidder.item_quotation_no;

                    return (
                      <button
                        key={bidder.item_quotation_no}
                        type="button"
                        onClick={() =>
                          setTieSelections((previous) => ({
                            ...previous,
                            [item.item_no]: bidder.item_quotation_no,
                          }))
                        }
                        className={`w-full text-left border rounded-md p-3 transition-colors ${
                          isSelected
                            ? "border-green-500 bg-green-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {supplierName}
                            </p>

                            <p className="text-sm text-gray-500">
                              RFQ: {bidder.rfq}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              ₱{Number(bidder.unit_price).toLocaleString()}
                            </span>

                            {isSelected && (
                              <CheckCircledIcon className="text-green-600" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLowestPriceDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleConfirmLowestPrice}
              disabled={tiedLowestItems.some(
                (item) => !tieSelections[item.item_no],
              )}
            >
              Confirm Selection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MessageDialog
        open={messageDialog.open}
        message={messageDialog.message}
        title={messageDialog.title}
        type={messageDialog.type}
        onOpenChange={(open) => setMessageDialog((prev) => ({ ...prev, open }))}
      />
    </>
  );
};
