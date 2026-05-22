import { useEffect, useState } from "react";
import { addOffice, updateOffice } from "@/services/officeServices";
import type {  Office as OfficeType, } from "@/services/officeServices";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  office?: OfficeType | null;
};

const AddOfficeModal = ({
  open,
  onClose,
  onSuccess,
  office,
}: Props) => {
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        department: "",
    });

    useEffect(() => {
        if (office) {
            setFormData({
            code: office.code,
            name: office.name,
            department: office.department,
            });
        }
        }, [office]);
    const [isSaving, setIsSaving] =
        useState(false);
    const handleSubmit = async () => {
        if (
            !formData.code.trim() ||
            !formData.name.trim() ||
            !formData.department.trim()
            ) {
            alert("Please fill in all fields.");
            return;
            }
        setIsSaving(true);
       const response = office
        ? await updateOffice(office.id, formData)
        : await addOffice(formData);
       if (response.status === "success") {

            onSuccess();

            setFormData({
                code: "",
                name: "",
                department: "",
            });

            onClose();
            }
        setIsSaving(false);

        console.log("ADD OFFICE RESULT", response);

        };
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Add Office
          </h2>

          <button onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="space-y-3">

          <input
            type="text"
            placeholder="Office Code"
            value={formData.code}
            onChange={(e) =>
                setFormData({
                ...formData,
                code: e.target.value,
                })
            }
            className="w-full border p-2 rounded-md"
            />

          <input
            type="text"
            placeholder="Office Name"
            value={formData.name}
            onChange={(e) =>
                setFormData({
                ...formData,
                name: e.target.value,
                })
            }
            className="w-full border p-2 rounded-md"
            />

          <input
            type="text"
            placeholder="Department"
            value={formData.department}
            onChange={(e) =>
                setFormData({
                ...formData,
                department: e.target.value,
                })
            }
            className="w-full border p-2 rounded-md"
            />

        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="border border-orange-300 text-orange-500 px-3 py-1 rounded-md hover:bg-orange-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-orange-300 text-black px-4 py-2 rounded-md disabled:opacity-50 hover:bg-orange-500"
            >
            {isSaving ? "Saving..." : "Save"}
            </button>
        </div>

      </div>
    </div>
  );
};

export default AddOfficeModal;