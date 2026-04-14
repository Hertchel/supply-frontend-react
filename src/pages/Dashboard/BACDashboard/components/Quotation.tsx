import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useGetRFQDetail } from "@/services/requestForQuotationServices";
import { formatDate } from "@/services/formatDate";
import Loading from "../../shared/components/Loading";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  ClipboardIcon,
  CreditCardIcon,
  MapPinIcon,
  PenBoxIcon,
  PrinterIcon,
} from "lucide-react";
import { RFQFormEdit } from "./RFQFormEdit";
import { generateRFQPDF } from "@/services/generateRFQPDF";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

export const Quotation = () => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { rfq_no } = useParams();

  const { data, isLoading, isError } = useGetRFQDetail(rfq_no!);
  console.log(data);
  
  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading data</div>;

  const quotation = data?.data?.rfq;
  const itemQuotation = data?.data?.items || [];

  const handlePrint = async () => {
    const url = await generateRFQPDF(itemQuotation, quotation);
    return window.open(url, "_blank");
  };
  console.log("RFQ:", quotation);
console.log("Items:", itemQuotation);

  return (
    <div className="w-full">
      <Card className="w-full bg-slate-100">
        <CardHeader>
          <CardTitle>
            <div className="flex flex-col gap-3">
              
              {/* HEADER */}
              <div className="flex flex-col md:flex-row md:justify-between gap-3">
                <div>
                  <p className="font-thin">{quotation?.supplier_name}</p>
                  <div className="flex items-center pt-1">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    <p className="text-sm md:text-base font-thin">
                      {quotation?.created_at &&
                        formatDate(quotation.created_at)}
                    </p>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={() => setIsDialogOpen(true)}>
                          <PenBoxIcon className="mr-2" />
                          Edit
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit RFQ</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" onClick={handlePrint}>
                          <PrinterIcon className="mr-2" />
                          Print
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Print RFQ</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <Separator />

              {/* DETAILS */}
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-1" />
                  <p className="text-sm md:text-lg font-thin">
                    {quotation?.supplier_address}
                  </p>
                </div>

                <div className="flex items-center">
                  <CreditCardIcon className="w-4 h-4 mr-1" />
                  <p className="text-sm md:text-lg font-thin">
                    {quotation?.tin}
                  </p>
                </div>

                <Badge variant="outline">
                  {quotation?.is_VAT ? "VAT" : "Non-VAT"}
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="mx-2 md:mx-6 p-3 md:p-4 border rounded-md">

          {/* TITLE */}
          <div className="flex items-center gap-2 mb-3">
            <ClipboardIcon className="h-5 w-5" />
            <p className="text-lg md:text-xl">Quotations</p>
          </div>

          {/* MOBILE VIEW */}
          <div className="space-y-3 md:hidden">
            {itemQuotation.map((item: any) => (
              <Card key={item.item_details.item_no}>
                <CardContent className="p-3 text-sm">
                  <p><strong>{item.item_details.item_description}</strong></p>
                  <p>Unit: {item.item_details.unit}</p>
                  <p>Qty: {item.item_details.quantity}</p>
                  <p>Cost: {item.item_details.unit_cost}</p>
                  <p>Brand: {item.brand_model}</p>
                  <p>
                    Price:{" "}
                    <span
                      className={
                        item.is_low_price
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {item.unit_price}
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block">
            <div className="grid grid-cols-8 gap-2 border-b py-2 font-medium">
              <p>UNIT</p>
              <p className="col-span-2">DESCRIPTION</p>
              <p>QTY</p>
              <p>COST</p>
              <p className="col-span-2">BRAND</p>
              <p>PRICE</p>
            </div>

            {itemQuotation.map((item: any) => (
              <div
                key={item.item_details.item_no}
                className="grid grid-cols-8 gap-2 py-3 border-b text-sm"
              >
                <p>{item.item_details.unit}</p>
                <p className="col-span-2">
                  {item.item_details.item_description}
                </p>
                <p>{item.item_details.quantity}</p>
                <p>{item.item_details.unit_cost}</p>
                <p className="col-span-2">{item.brand_model}</p>
                <p
                  className={
                    item.is_low_price
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {item.unit_price}
                </p>
              </div>
            ))}
          </div>

        </CardContent>

        <CardFooter />
      </Card>

      {quotation && (
        <RFQFormEdit
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          itemQuotation={itemQuotation}
          quotation={quotation}
        />
      )}
    </div>
  );
};