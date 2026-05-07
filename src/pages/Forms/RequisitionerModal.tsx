import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  requisitioners: any[];
}

const RequisitionerModal = ({ open, setOpen, requisitioners }: Props) => {
  const navigate = useNavigate();

  const [searchName, setSearchName] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(""); // "" = All

  // Get unique departments for dropdown
  const departments = useMemo(() => {
    const uniqueDepts = Array.from(
      new Set(requisitioners.map((req) => req.department).filter(Boolean)),
    ).sort();
    return uniqueDepts;
  }, [requisitioners]);

  // Filtered list
  const filteredRequisitioners = useMemo(() => {
    return requisitioners.filter((req) => {
      const matchesName = req.name
        ?.toLowerCase()
        .includes(searchName.toLowerCase());

      const matchesDepartment =
        !selectedDepartment || req.department === selectedDepartment;

      return matchesName && matchesDepartment;
    });
  }, [requisitioners, searchName, selectedDepartment]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Requisitioner</DialogTitle>
        </DialogHeader>

        {/* Search & Filter Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Name Search */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Name</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department Dropdown */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Requisitioners List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto mt-2">
          {filteredRequisitioners.length > 0 ? (
            filteredRequisitioners.map((req: any) => (
              <div
                key={req.requisition_id}
                className="border rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => {
                  navigate(`/requisitioner/${req.access_token}`);
                  // setOpen(false); // Uncomment if you want to close modal after selection
                }}
              >
                <h1 className="font-semibold">{req.name}</h1>
                <p className="text-sm text-gray-500">{req.department}</p>
                <p className="text-xs text-gray-400">{req.designation}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No matching requisitioners found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequisitionerModal;
