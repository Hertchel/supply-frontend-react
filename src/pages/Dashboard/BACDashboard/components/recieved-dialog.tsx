
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdatePurchaseRequestStatus } from "@/services/purchaseRequestServices";
import { Loader2 } from "lucide-react";
import { MessageDialog } from "../../shared/components/MessageDialog";
import { useState } from "react";

interface ReceivedDialogProps {
  prNo: string;
  isReceivedDialogOpen: boolean;
  setIsReceivedDialogOpen: (open: boolean) => void;
}

interface messageDialogProps {
  open: boolean;
  message: string;
  type: "success" | "error" | "info";
  title: string;
}

const DELIVERY_PERIOD_OPTIONS = ["15", "30", "60", "90", "120"];

export default function ReceivedDialog({
  prNo,
  isReceivedDialogOpen,
  setIsReceivedDialogOpen,
}: ReceivedDialogProps) {
  const [messageDialog, setMessageDialog] =
    useState<messageDialogProps>({
      open: false,
      type: "success",
      title: "",
      message: "",
    });

  const [deliveryPeriod, setDeliveryPeriod] = useState("15");
  const [customDays, setCustomDays] = useState("");

  const { mutate, isPending } = useUpdatePurchaseRequestStatus();

  const isCustom = deliveryPeriod === "custom";
  const selectedDays = isCustom ? Number(customDays) : Number(deliveryPeriod);

  const isValidDeliveryPeriod =
    Number.isInteger(selectedDays) && selectedDays > 0;

  const handleReceive = () => {
    if (!isValidDeliveryPeriod) return;

    mutate(
      {
        pr_no: prNo,
        status: "Received by the Procurement",
        delivery_period_days: selectedDays,
      },
      {
        onSuccess: (response) => {
          if (response.status === "success") {
            setIsReceivedDialogOpen(false);
            setMessageDialog({
              open: true,
              message: "Received Purchase Successfully",
              title: "Success",
              type: "success",
            });
          } else {
            setIsReceivedDialogOpen(false);
            setMessageDialog({
              open: true,
              message: "Something went wrong, Please try again later",
              title: "Error",
              type: "error",
            });
          }
        },
        onError: () => {
          setIsReceivedDialogOpen(false);
          setMessageDialog({
            open: true,
            message: "Something went wrong, Please try again later",
            title: "Error",
            type: "error",
          });
        },
      }
    );
  };

  return (
    <>
      <Dialog
        open={isReceivedDialogOpen}
        onOpenChange={setIsReceivedDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Receive Purchase Request</DialogTitle>
            <DialogDescription>
              Select the expected delivery period before receiving this
              Purchase Request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label
              htmlFor="delivery-period"
              className="text-sm font-medium"
            >
              Delivery Period
            </label>

            <select
              id="delivery-period"
              value={deliveryPeriod}
              onChange={(e) => setDeliveryPeriod(e.target.value)}
              disabled={isPending}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {DELIVERY_PERIOD_OPTIONS.map((days) => (
                <option key={days} value={days}>
                  {days} Days
                </option>
              ))}
              <option value="custom">Custom</option>
            </select>

            {isCustom && (
              <div className="space-y-2">
                <label
                  htmlFor="custom-days"
                  className="text-sm font-medium"
                >
                  Enter custom delivery period (days)
                </label>

                <input
                  id="custom-days"
                  type="number"
                  min="1"
                  step="1"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  disabled={isPending}
                  placeholder="Enter number of days"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />

                {customDays !== "" && !isValidDeliveryPeriod && (
                  <p className="text-sm text-destructive">
                    Enter a valid whole number greater than zero.
                  </p>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              The selected period will be used in the Request for
              Quotation.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => setIsReceivedDialogOpen(false)}
            >
              No, go back
            </Button>

            <Button
              className="px-8"
              onClick={handleReceive}
              disabled={isPending || !isValidDeliveryPeriod}
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Yes, Receive"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MessageDialog
        message={messageDialog.message}
        title={messageDialog.title}
        type={messageDialog.type}
        open={messageDialog.open}
        onOpenChange={(open) =>
          setMessageDialog((prev) => ({ ...prev, open }))
        }
      />
    </>
  );
}
