import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  arraySort,
  FilteredItemInPurchaseRequest,
} from "@/services/itemServices";
import {
  useAddItemQuotation,
  useAddRequestForQuotation,
} from "@/services/requestForQuotationServices";
import {
  requestForQuotationSchema,
  requestForQuotationType,
} from "@/types/request/request_for_quotation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useFieldArray, useForm } from "react-hook-form";
import Loading from "../../shared/components/Loading";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";
import { formatTIN } from "@/services/formatTIN";
import { MessageDialog } from "../../shared/components/MessageDialog";
import { AxiosError } from "axios";
import { useRequestForQuotation } from "@/services/requestForQuotationServices";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { ChevronsUpDown, Check } from "lucide-react";

interface TwoStepRFQFormProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  pr_no: string;
}

interface messageDialogProps {
  open: boolean;
  message: string;
  type: "success" | "error" | "info";
  title: string;
}

export const TwoStepRFQForm: React.FC<TwoStepRFQFormProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  pr_no,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("non-VAT");
  const [messageDialog, setMessageDialog] = useState<messageDialogProps>({
    open: false,
    message: "",
    type: "success" as const,
    title: "",
  });

  const items = FilteredItemInPurchaseRequest(pr_no!);
  const sortedItems = useMemo(() => {
    return arraySort(items!, "stock_property_no");
  }, [items]);
  const rfq_no = pr_no; //set the initial value rfq_no to pr_no and later in submit handler it have a random Letter

  const { mutate: addRFQMutation } = useAddRequestForQuotation();
  const { data: rfqData } = useRequestForQuotation();
  const { mutateAsync: addItemMutation } = useAddItemQuotation();

  const uniqueSuppliers = Array.from(
    new Map(
      (rfqData?.data || []).map((rfq) => [
        rfq.supplier_name,
        {
          supplier_name: rfq.supplier_name,
          supplier_address: rfq.supplier_address,
          tin: rfq.tin,
          is_VAT: rfq.is_VAT,
        },
      ])
    ).values()
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(requestForQuotationSchema),
    defaultValues: {
      rfq_no: rfq_no,
      purchase_request: pr_no,
      supplier_name: "",
      supplier_address: "",
      tin: "",
      is_VAT: selectedOption === "vat" ? true : false,
      items: sortedItems?.map((item) => ({
        item_quotation_no: "",
        purchase_request: pr_no,
        rfq: rfq_no,
        item: item.item_no,
        unit_price: 0,
        brand_model: "",
        is_low_price: false,
      })),
    },
  });
  const { fields } = useFieldArray({
    control,
    name: "items",
  });
  const watchedSupplierName = watch("supplier_name");
  const watchedSupplierAddress = watch("supplier_address");
  const watchedTIN = watch("tin");

  const [openSupplier, setOpenSupplier] = useState(false);
  const filteredSuppliers = uniqueSuppliers.filter((supplier) =>
    supplier.supplier_name
      .toLowerCase()
      .includes(
        watch("supplier_name").toLowerCase()
      )
  );

  useEffect(() => {

    if (
      sortedItems.length > 0 &&
      !isInitialized
    ) {

      setValue(
        "items",
        sortedItems.map((item) => ({
          item_quotation_no: "",
          purchase_request: pr_no,
          unit_quantity: item.quantity,
          rfq: rfq_no,
          item: item.item_no,
          unit_price: 0,
          brand_model: "",
          is_low_price: false,
        }))
      );

      setIsInitialized(true);
    }

  }, [
    isInitialized,
    sortedItems,
    setValue,
    pr_no,
    rfq_no,
  ]);

  type RequestForQuotationField =
    | "purchase_request"
    | "items"
    | "rfq_no"
    | "supplier_name"
    | "supplier_address"
    | "tin"
    | `items.${number}.unit_price`
    | `items.${number}.brand_model`;

  interface RenderFieldProps {
    label: string;
    field_name: RequestForQuotationField;
    errors: FieldErrors<requestForQuotationType>;
  }

  const renderField = ({ label, field_name, errors }: RenderFieldProps) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (field_name === "tin") {
        const formattedTIN = formatTIN(e.target.value);
        e.target.value = formattedTIN;
      }
    };

    return (
      <div className="w-full">
        <Label>{label}</Label>
        <Input
          {...register(field_name)}
          value={
            field_name === "supplier_name"
              ? watchedSupplierName
              : field_name === "supplier_address"
              ? watchedSupplierAddress
              : field_name === "tin"
              ? watchedTIN
              : undefined
          }
          onChange={(e) => {
            handleInputChange(e);
            register(field_name).onChange(e);
          }}
        />
        {errors && errors[field_name as keyof typeof errors] && (
          <span className="text-xs text-red-500">
            {errors[field_name as keyof typeof errors]?.message}
          </span>
        )}
      </div>
    );
  };


  const onSubmit = async (data: requestForQuotationType) => {
    console.log("Submitting RFQ:", data);
    console.log(data);
    
    setIsLoading(true);
    try {
      const result = requestForQuotationSchema.safeParse(data);
      if (!result.success) {
        console.error("Validation failed:", result.error);
        return;
      }

      const quotationData = {
        rfq_no: `${pr_no}-${uuidv4().substring(0,8)}`,
        purchase_request: data.purchase_request!,
        supplier_name: data.supplier_name ?? "",
        supplier_address: data.supplier_address ?? "",
        tin: data.tin ?? "",
        is_VAT: selectedOption === "vat" ? true : false,
      };

      console.log(
        "RFQ NUMBER BEING SENT:",
        pr_no
      );

      addRFQMutation(quotationData, {
        onSuccess: async (rfqResponse) => {
          console.log(
            "RFQ RESPONSE:",
            rfqResponse
          );

          console.log(
            "RFQ RESPONSE DATA:",
            rfqResponse?.data
          );
          const rfqNo = rfqResponse.data?.rfq_no;

          // Map over the items and perform addItemMutation with rfqNo from the response
          const itemDataArray = data.items.map((item) => {
            const sortedItem = sortedItems.find(
              (sorted) => sorted.item_no === item.item
            );

            return {
              item_quotation_no: uuidv4(),
              purchase_request: pr_no!,
              rfq: rfqNo ?? "",
              item: item.item ?? "",
              // unit_quantity: item.unit_quantity ?? 0,
              unit_price: item.unit_price ?? 0,
              brand_model: item.brand_model ?? "",
              is_low_price: sortedItem
                ? Number(item.unit_price) <= Number(sortedItem.unit_cost)
                : false,
            };
          });

          const validItems = itemDataArray.filter(
            (itemData) =>
              itemData.brand_model.trim() !== "" &&
              Number(itemData.unit_price) > 0
          );

          if (validItems.length === 0) {

            setIsLoading(false);

            setMessageDialog({
              open: true,
              message: "Please complete all item quotation fields.",
              title: "Validation Error",
              type: "error",
            });

            return;
          }

          await Promise.all(
            validItems.map(async (itemData) => {
              try {
                const result =
                  await addItemMutation(itemData);

                console.log(
                  "ITEM CREATED:",
                  result
                );

                return result;
              } catch (error) {

                console.error(
                  "ITEM CREATION FAILED:",
                  itemData
                );

                console.error(error);

                throw error;
              }
            })
          );

          setIsLoading(false);
          setIsDialogOpen(false);
          reset();
          setMessageDialog({
            open: true,
            message: "Added Quotation successfully",
            title: "Success",
            type: "success"
          })
        },
        onError: (error: any) => {
          console.error(
            "RFQ CREATE ERROR FULL:",
            error
          );

          console.error(
            "RFQ CREATE ERROR RESPONSE:",
            error?.response?.data
          );

          setMessageDialog({
            open: true,
            message:
              JSON.stringify(error?.response?.data) ||
              error.message ||
              "Something went wrong",
            title: "Error",
            type: "error"
          });
        },
      });
    } catch (error) {
      setMessageDialog({
        open: true,
        message: (error as AxiosError).message ?? "Something went wrong, please try again later",
        title: "Error",
        type: "error"
      })
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={(open) => {

        setIsDialogOpen(open);

        if (!open) {
          setIsInitialized(false);
          reset();
        }

      }}>
        <DialogContent className="max-w-full w-[70rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Create Request for Quotation [{pr_no}]
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[30rem] mb-9">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Tabs defaultValue="supplier">
                <div className="w-full flex flex-col items-center">
                  <TabsList className="grid grid-cols-2 w-1/2 items-center">
                    <TabsTrigger className="" value="supplier">
                      <span className="bg-orange-300  w-8 h-8 p-2 rounded-full mx-2">
                        1
                      </span>
                      Create Supplier
                    </TabsTrigger>
                    <TabsTrigger value="items">
                      <span className="bg-orange-300  w-8 h-8 p-2 rounded-full mx-2">
                        2
                      </span>
                      Select Items
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="supplier" className="">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Supplier</CardTitle>
                      <CardDescription>
                        Please fill up the supplier information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Supplier Name</Label>

                            <div className="relative">
                              <Input
                                value={watch("supplier_name")}
                                placeholder="Select or type supplier"
                                onFocus={() => {
                                  setOpenSupplier(true);
                                }}
                                onChange={(e) => {
                                  setValue("supplier_name", e.target.value);
                                  setOpenSupplier(true);
                                }}
                                onBlur={() => {
                                  setTimeout(() => {
                                    setOpenSupplier(false);
                                  }, 150);
                                }}
                              />

                              {openSupplier && filteredSuppliers.length > 0 && (
                                <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md max-h-60 overflow-auto">
                                  <Command>
                                    <CommandList>
                                      <CommandGroup>
                                        {filteredSuppliers.map((supplier) => (
                                          <CommandItem
                                            key={supplier.supplier_name}
                                            value={supplier.supplier_name}
                                            onMouseDown={(e) => {
                                              e.preventDefault();
                                            }}
                                            onSelect={() => {
                                              setValue(
                                                "supplier_name",
                                                supplier.supplier_name
                                              );

                                              setValue(
                                                "supplier_address",
                                                supplier.supplier_address
                                              );

                                              setValue(
                                                "tin",
                                                supplier.tin
                                              );

                                              setSelectedOption(
                                                supplier.is_VAT
                                                  ? "vat"
                                                  : "non-vat"
                                              );

                                              setOpenSupplier(false);
                                            }}
                                          >
                                            <Check
                                              className={`mr-2 h-4 w-4 ${
                                                watch("supplier_name") ===
                                                supplier.supplier_name
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              }`}
                                            />

                                            {supplier.supplier_name}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </div>
                              )}

                              <ChevronsUpDown className="absolute right-3 top-3 h-4 w-4 opacity-50" />
                            </div>

                            
                              <Command>

                                <CommandList>
                                  <CommandEmpty>
                                    No supplier found.
                                  </CommandEmpty>

                                  <CommandGroup>
                                    {filteredSuppliers.map((supplier) => (
                                      <CommandItem
                                        key={supplier.supplier_name}
                                        value={supplier.supplier_name}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                        }}
                                        onSelect={() => {
                                          setValue(
                                            "supplier_name",
                                            supplier.supplier_name
                                          );

                                          setValue(
                                            "supplier_address",
                                            supplier.supplier_address
                                          );

                                          setValue(
                                            "tin",
                                            supplier.tin
                                          );

                                          setSelectedOption(
                                            supplier.is_VAT
                                              ? "vat"
                                              : "non-vat"
                                          );

                                          setOpenSupplier(false);
                                        }}
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            watch("supplier_name") ===
                                            supplier.supplier_name
                                              ? "opacity-100"
                                              : "opacity-0"
                                          }`}
                                        />

                                        {supplier.supplier_name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                        </div>
                        {renderField({
                          label: "Supplier Address",
                          field_name: "supplier_address",
                          errors,
                        })}
                      </div>
                      <div className="grid grid-cols-2 gap-4 items-end w-full">
                        {renderField({
                          label: "TIN",
                          field_name: "tin",
                          errors,
                        })}
                        <RadioGroup
                          className="flex items-center mb-3"
                          value={selectedOption}
                          onValueChange={(value) => setSelectedOption(value)}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="non-VAT" id="non-VAT" />
                            <Label htmlFor="non-VAT">Non VAT</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="vat" id="vat" />
                            <Label htmlFor="vat">VAT</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="fixed bottom-6 right-10">
                        <TabsList className="bg-orange-200">
                          <TabsTrigger
                            className="bg-orange-200 px-6 py-1 text-gray-950"
                            value="items"
                          >
                            Next
                          </TabsTrigger>
                        </TabsList>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="items">
                  <Card>
                    <CardHeader>
                      <CardTitle>Items</CardTitle>
                      <CardDescription>
                        Please Fill up the Items Quotation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-7 gap-2 items-center p-2  border-b-2 sticky bg-background top-0">
                        <Label>Unit</Label>
                        <Label>Item Description</Label>
                        <Label>Unit Quantity</Label>
                        <Label>Unit Cost</Label>
                        <Label className="col-span-2">Brand / Model</Label>
                        <Label>Unit Price </Label>
                      </div>
                      {sortedItems.length > 0 ? (
                        fields.map(
                          (field, index) =>
                            sortedItems && (
                              <div
                                key={field.id}
                                className="grid grid-cols-7 gap-2 mb-8 items-center p-2 border-b-2"
                              >
                                <Label className="text-gray-500">
                                  {sortedItems[index]?.unit}
                                </Label>
                                <Label className="text-gray-500">
                                  {sortedItems[index]?.item_description}
                                </Label>
                                <Label className="text-gray-500">
                                  {sortedItems[index]?.quantity}
                                </Label>
                                <Label className="text-gray-500">
                                  {sortedItems[index]?.unit_cost}
                                </Label>
                                {/* <div className="flex flex-col">
                                  <Input
                                    {...register(`items.${index}.unit_quantity`, {
                                      valueAsNumber: true,
                                    })}
                                    type="number"
                                  />
                                  {errors.items?.[index]?.unit_price && (
                                    <span className="text-xs text-red-500">
                                      {errors.items[index].unit_price?.message}
                                    </span>
                                  )}
                                </div> */}
                                <div className="flex flex-col col-span-2">
                                  <Textarea
                                    {...register(`items.${index}.brand_model`)}
                                    className=""
                                  />
                                  {errors.items?.[index]?.brand_model && (
                                    <span className="text-xs text-red-500">
                                      {errors.items[index].brand_model?.message}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <Input
                                    {...register(`items.${index}.unit_price`, {
                                      valueAsNumber: true,
                                    })}
                                    type="number"
                                  />
                                  {errors.items?.[index]?.unit_price && (
                                    <span className="text-xs text-red-500">
                                      {errors.items[index].unit_price?.message}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                        )
                      ) : (
                        <Loading />
                      )}
                      <div className="fixed bottom-6 left-10">
                        <TabsList className="bg-orange-200">
                          <TabsTrigger
                            className="bg-orange-200 px-6 py-1 text-gray-950"
                            value="supplier"
                          >
                            Back
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <div className="fixed bottom-6 right-10">
                        <Button
                          className={`text-slate-950 bg-orange-200 px-8 hover:bg-orange-300 ${
                            isLoading && "px-16"
                          }`}
                          type="submit"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            "Submit Quotation"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <MessageDialog
        open={messageDialog.open}
        message={messageDialog.message}
        type={messageDialog.type}
        title={messageDialog.title}
        onOpenChange={(open) => setMessageDialog((prev) => ({ ...prev, open }))}
      />
    </>
  );
};