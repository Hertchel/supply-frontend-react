import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  requisitioners: any[];
}

const RequisitionerModal = ({
  open,
  setOpen,
  requisitioners,
}: Props) => {

    const navigate = useNavigate();

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >

      <DialogContent>

        <DialogHeader>
          <DialogTitle>
            Select Requisitioner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">

          {requisitioners.map((req: any) => (

            <div
  key={req.requisition_id}
  className="
    border
    rounded-lg
    p-3
    cursor-pointer
    hover:bg-gray-100
    transition
  "
  onClick={() => {

    navigate(
      `/requisitioner/${req.access_token}`
    );

  }}
>

              <h1 className="font-semibold">
                {req.name}
              </h1>

              <p className="text-sm text-gray-500">
                {req.department}
              </p>

              <p className="text-xs text-gray-400">
                {req.designation}
              </p>

            </div>

          ))}

        </div>

      </DialogContent>

    </Dialog>
  );
};

export default RequisitionerModal;