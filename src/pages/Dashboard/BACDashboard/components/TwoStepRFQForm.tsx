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
import {arraySort, FilteredItemInPurchaseRequest,} from "@/services/itemServices";
import {useAddItemQuotation, 
  useAddRequestForQuotation,  
  useRequestForQuotation,
  useGetItemQuotation,} from "@/services/requestForQuotationServices";
import { useSupplierProfiles, createSupplierProfile, updateSupplierProfile, SupplierProfileType } from "@/services/supplierProfileServices";
import {requestForQuotationSchema, requestForQuotationType,} from "@/types/request/request_for_quotation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useFieldArray, useForm } from "react-hook-form";
import Loading from "../../shared/components/Loading";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";
import { formatTIN } from "@/services/formatTIN";
import { MessageDialog } from "../../shared/components/MessageDialog";
import { AxiosError } from "axios";
//import { useRequestForQuotation } from "@/services/requestForQuotationServices";
import {Command, CommandGroup, CommandItem, CommandList,} from "@/components/ui/command";

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
  const [supplierSaved, setSupplierSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("supplier");
  const [selectedOption, setSelectedOption] = useState<string>("");
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
  //const { data: rfqData } = useRequestForQuotation();
  const { data: supplierProfileData, refetch: refetchSupplierProfiles, } = useSupplierProfiles();
  const supplierProfiles = supplierProfileData?.data || [];
  const { mutateAsync: addItemMutation } = useAddItemQuotation();
  const { data: rfqData } = useRequestForQuotation();
  const { data: itemQuotationData } = useGetItemQuotation();

  const uniqueSuppliers = supplierProfiles.map((profile) => ({
    supplier_profile_id: profile.supplier_profile_id,
    supplier_name: profile.name,
    supplier_address: profile.address,
    tin: profile.tin ?? "",
    is_VAT: profile.is_VAT,
  }));

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<requestForQuotationType>({
    mode: "onChange",
    resolver: zodResolver(requestForQuotationSchema),
    defaultValues: {
      rfq_no: rfq_no,
      purchase_request: pr_no,
      supplier_name: "",
      supplier_address: "",
      supplier_profile_id: null,
      tin: "",
      is_VAT: undefined,
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
  register("is_VAT");

  const watchedSupplierName = watch("supplier_name");

  const alreadyQuotedItemNos = useMemo(() => {
    const quotedItems = new Set<string>();

    rfqData?.data?.forEach((rfq) => {
      if (
        rfq.purchase_request === pr_no &&
        rfq.supplier_name === watchedSupplierName
      ) {
        itemQuotationData?.data?.forEach((itemQuotation) => {
          if (itemQuotation.rfq === rfq.rfq_no) {
            quotedItems.add(itemQuotation.item_details.item_no);
          }
        });
      }
    });

    return quotedItems;
  }, [rfqData, itemQuotationData, pr_no, watchedSupplierName]);

  const { fields } = useFieldArray({
    control,
    name: "items",
  });
  const watchedSupplierAddress = watch("supplier_address");
  const watchedTIN = watch("tin");

  const [openSupplier, setOpenSupplier] = useState(false);
  const [openEditSupplier, setOpenEditSupplier] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierProfileType | null>(null);
  const filteredSuppliers = uniqueSuppliers.filter((supplier) =>
    supplier.supplier_name
      .toLowerCase()
      .includes(
        (watch("supplier_name") ?? "").toLowerCase()
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
  
  const saveSupplier = async () => {
    const supplierName = watch("supplier_name")?.trim();
    const supplierAddress = watch("supplier_address")?.trim();
    const tin = watch("tin")?.trim() || "";
    const existingProfileId = watch("supplier_profile_id");
    const isVAT = watch("is_VAT");

    if (!supplierName || !supplierAddress) {
      setMessageDialog({
        open: true,
        message: "Please provide the supplier name and address.",
        title: "Supplier Information Required",
        type: "error",
      });
      return;
    }

    // Use an existing supplier selected from the dropdown.
    if (existingProfileId) {
      setSupplierSaved(true);

      setMessageDialog({
        open: true,
        message: "Existing supplier selected successfully.",
        title: "Supplier Selected",
        type: "success",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await createSupplierProfile({
        name: supplierName,
        address: supplierAddress,
        tin,
        is_VAT: isVAT,
      });

      if (response.status === "error") {
        const axiosError = response.error as AxiosError<{
          duplicate?: boolean;
          supplier_profile_id?: string;
          message?: string;
        }>;

        const errorData = axiosError.response?.data;

        setSupplierSaved(false);

        setMessageDialog({
          open: true,
          message:
            errorData?.message ||
            "Unable to save supplier. Please try again.",
          title: errorData?.duplicate
            ? "Duplicate Supplier"
            : "Save Failed",
          type: "error",
        });

        return;
      }

      const profile = response.data;

      if (!profile?.supplier_profile_id) {
        throw new Error("Supplier profile was not created.");
      }

      setValue("supplier_profile_id", profile.supplier_profile_id);
      setSupplierSaved(true);

      setMessageDialog({
        open: true,
        message: "Supplier profile saved successfully.",
        title: "Supplier Saved",
        type: "success",
      });
    } catch (error) {
      setSupplierSaved(false);

      setMessageDialog({
        open: true,
        message:
          error instanceof Error
            ? error.message
            : "Unable to save supplier. Please try again.",
        title: "Save Failed",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: requestForQuotationType) => {
    
    setIsLoading(true);
    try {
      const result = requestForQuotationSchema.safeParse(data);
      if (!result.success) {
        console.error("Validation failed:", result.error);
        return;
      }
      console.log("RFQ VAT DEBUG:", {
        selectedOption,
        formIsVAT: data.is_VAT,
      });

      const quotationData = {
        rfq_no: `${pr_no}-${uuidv4().substring(0,8)}`,
        purchase_request: data.purchase_request!,
        supplier_name: data.supplier_name ?? "",
        supplier_address: data.supplier_address ?? "",
        supplier_profile_id: data.supplier_profile_id ?? null,
        tin: data.tin?.trim() || "",
        is_VAT: data.is_VAT,
      };

      addRFQMutation(quotationData, {
        onSuccess: async (rfqResponse) => {

          const rfqNo = rfqResponse.data?.rfq_no;

          // Map over the items and perform addItemMutation with rfqNo from the response
          const itemDataArray = data.items
          .filter((item) => !alreadyQuotedItemNos.has(item.item ?? ""))
          .map((item) => {
            const sortedItem = sortedItems.find(
              (sorted) => sorted.item_no === item.item
            );

            return {
              item_quotation_no: uuidv4(),
              purchase_request: pr_no!,
              rfq: rfqNo ?? "",
              item: item.item ?? "",
              unit_price: item.unit_price ?? 0,
              brand_model: item.brand_model || "N/A",
              is_low_price: sortedItem
                ? Number(item.unit_price) <= Number(sortedItem.unit_cost)
                : false,
            };
          });

          const overpricedItems = itemDataArray.filter((itemData) => {
            const prItem = sortedItems.find(
              (item) => item.item_no === itemData.item
            );

            return (
              prItem &&
              Number(itemData.unit_price) > Number(prItem.unit_cost)
            );
          });

          if (overpricedItems.length > 0) {
            setIsLoading(false);

            const messages = overpricedItems.map((itemData) => {
              const prItem = sortedItems.find(
                (item) => item.item_no === itemData.item
              );

              return `${prItem?.item_description ?? itemData.item}: `
                + `quoted price cannot exceed PR price of ₱${Number(
                    prItem?.unit_cost ?? 0
                  ).toFixed(2)}.`;
            });

            setMessageDialog({
              open: true,
              message: messages.join("\n"),
              title: "Invalid Quotation Price",
              type: "error",
            });

            return;
          }

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

                return result;
              } catch (error) {

                console.error(error);

                throw error;
              }
            })
          );

          setIsLoading(false);
          setIsInitialized(false);
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
  const saveEditedSupplier = async () => {
  if (!selectedSupplier) return;

  if (!selectedSupplier.name.trim() || !selectedSupplier.address.trim()) {
    setMessageDialog({
      open: true,
      message: "Please provide the supplier name and address.",
      title: "Supplier Information Required",
      type: "error",
    });
    return;
  }

  setIsLoading(true);

  try {
    console.log("EDIT SUPPLIER DATA:", {
      name: selectedSupplier.name,
      is_VAT: selectedSupplier.is_VAT,
    });
    const response = await updateSupplierProfile(
      selectedSupplier.supplier_profile_id,
      {
        name: selectedSupplier.name.trim(),
        address: selectedSupplier.address.trim(),
        tin: selectedSupplier.tin?.trim() || "",
        is_VAT: selectedSupplier.is_VAT,
      }
    );

    if (response.status === "error") {
      const axiosError = response.error as AxiosError<{
        message?: string;
        duplicate?: boolean;
      }>;

      const errorData = axiosError.response?.data;

      setMessageDialog({
        open: true,
        message:
          errorData?.message ||
          "Unable to update supplier. Please try again.",
        title: errorData?.duplicate
          ? "Duplicate Supplier"
          : "Update Failed",
        type: "error",
      });

      return;
    }

    const refreshed = await refetchSupplierProfiles();

      console.log(
        "SUPPLIER AFTER DATABASE REFRESH:",
        refreshed.data?.data?.find(
          (supplier) =>
            supplier.supplier_profile_id ===
            selectedSupplier.supplier_profile_id
        )
      );
    const currentSupplierId = watch("supplier_profile_id");

    if (currentSupplierId === selectedSupplier.supplier_profile_id) {
      setValue("is_VAT", selectedSupplier.is_VAT, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      setSelectedOption(
        selectedSupplier.is_VAT ? "vat" : "non-VAT"
      );
    }
    setSelectedSupplier(null);
    setOpenEditSupplier(false);

    setMessageDialog({
      open: true,
      message: "Supplier profile updated successfully.",
      title: "Supplier Updated",
      type: "success",
    });
  } catch (error) {
    setMessageDialog({
      open: true,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update supplier. Please try again.",
      title: "Update Failed",
      type: "error",
    });
  } finally {
    setIsLoading(false);
  }
};

const filteredEditSuppliers = supplierProfiles.filter((supplier) => {
  const search = supplierSearch.toLowerCase().trim();

  if (!search) return true;

  return (
    supplier.name.toLowerCase().includes(search) ||
    supplier.address.toLowerCase().includes(search) ||
    (supplier.tin ?? "").toLowerCase().includes(search)
  );
});

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setIsInitialized(false);
          setSupplierSaved(false);
          setSelectedOption("");
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
            <form
              onSubmit={handleSubmit(
                onSubmit,
                (errors) => {
                  console.log("FORM VALIDATION ERRORS:", errors);
                }
              )}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Supplier</CardTitle>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSupplierSearch("");
                            setOpenEditSupplier(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Supplier
                        </Button>
                      </div>

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
                                  setValue("supplier_profile_id", null);
                                  setValue("is_VAT", undefined);

                                  setSupplierSaved(false);
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
                                                  const supplierIsVAT = Boolean(supplier.is_VAT);

                                                  setValue("supplier_name", supplier.supplier_name);
                                                  setValue("supplier_address", supplier.supplier_address);
                                                  setValue("tin", supplier.tin);
                                                  setValue(
                                                    "supplier_profile_id",
                                                    supplier.supplier_profile_id
                                                  );

                                                  setValue("is_VAT", supplierIsVAT, {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                    shouldTouch: true,
                                                  });

                                                  setSelectedOption(
                                                    supplierIsVAT ? "vat" : "non-VAT"
                                                  );

                                                  setSupplierSaved(true);
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
                          onValueChange={(value) => {
                            const isVAT = value === "vat";

                            setSelectedOption(value);

                            setValue("is_VAT", isVAT, {
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true,
                            });
                          }}
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
                        <div className="flex gap-2">
                          {!watch("supplier_profile_id") && (
                            <Button
                              type="button"
                              className="bg-orange-200 px-6 py-1 text-gray-950 hover:bg-orange-300"
                              onClick={saveSupplier}
                            >
                              Save Supplier
                            </Button>
                          )}

                          <Button
                            type="button"
                            className="bg-orange-200 px-6 py-1 text-gray-950 hover:bg-orange-300"
                            disabled={!supplierSaved}
                            onClick={() => {
                              setActiveTab("items");
                            }}
                          >
                            Next
                          </Button>
                        </div>
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
                              <div key={field.id}
                                className={`grid grid-cols-7 gap-2 mb-8 items-center p-2 border-b-2 ${
                                  alreadyQuotedItemNos.has(sortedItems[index]?.item_no)
                                    ? "bg-gray-100"
                                    : ""
                                }`}
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
                                  {alreadyQuotedItemNos.has(sortedItems[index]?.item_no) && (
                                    <span className="text-xs text-red-500 mb-1">
                                      Already quoted by this supplier
                                    </span>
                                  )}

                                  <Textarea
                                    {...register(`items.${index}.brand_model`)}
                                    className=""
                                    disabled={alreadyQuotedItemNos.has(sortedItems[index]?.item_no)}
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
                                      validate: (value) => {
                                        const prPrice = Number(sortedItems[index]?.unit_cost ?? 0);

                                        if (Number(value) > prPrice) {
                                          return `Price cannot exceed ₱${prPrice.toFixed(2)}`;
                                        }

                                        return true;
                                      },
                                    })}
                                    type="number"
                                    max={sortedItems[index]?.unit_cost}
                                    disabled={alreadyQuotedItemNos.has(sortedItems[index]?.item_no)}
                                    onFocus={(e) => {
                                      if (e.target.value === "0") {
                                        e.target.value = "";
                                      }
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value.trim() === "") {
                                        e.target.value = "0";

                                        setValue(`items.${index}.unit_price`, 0, {
                                          shouldValidate: true,
                                          shouldDirty: true,
                                          shouldTouch: true,
                                        });
                                      }
                                    }}
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
      <Dialog
        open={openEditSupplier}
        onOpenChange={setOpenEditSupplier}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Edit Supplier
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Search supplier..."
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
            />

            <ScrollArea className="h-[28rem] pr-4">
              {filteredEditSuppliers.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No supplier profiles found.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEditSuppliers.map((supplier) => (
                    <div
                      key={supplier.supplier_profile_id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {supplier.name}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {supplier.address}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          TIN: {supplier.tin || "—"}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedSupplier(supplier);
                          setOpenEditSupplier(false);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedSupplier !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSupplier(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Edit Supplier
            </DialogTitle>
          </DialogHeader>

          {selectedSupplier && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Supplier Name</Label>
                <Input
                  value={selectedSupplier.name}
                  onChange={(e) =>
                    setSelectedSupplier({
                      ...selectedSupplier,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Supplier Address</Label>
                <Textarea
                  value={selectedSupplier.address}
                  onChange={(e) =>
                    setSelectedSupplier({
                      ...selectedSupplier,
                      address: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>TIN</Label>
                <Input
                  value={selectedSupplier.tin ?? ""}
                  onChange={(e) =>
                    setSelectedSupplier({
                      ...selectedSupplier,
                      tin: formatTIN(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Supplier Type</Label>

                <RadioGroup
                  value={selectedSupplier.is_VAT ? "vat" : "non-vat"}
                  onValueChange={(value) => {
                    setSelectedSupplier((prev) => {
                      if (!prev) return null;

                      return {
                        ...prev,
                        is_VAT: value === "vat",
                      };
                    });
                  }}
                  className="flex items-center gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-vat" id="edit-non-vat" />
                    <Label htmlFor="edit-non-vat">Non VAT</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vat" id="edit-vat" />
                    <Label htmlFor="edit-vat">VAT</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedSupplier(null)}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={isLoading}
                  onClick={saveEditedSupplier}
                  className="bg-orange-200 text-slate-950 hover:bg-orange-300"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          )}
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