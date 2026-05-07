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
  requisitioners: any[]; // Data from api_requisitioner table
}

const RequisitionerModal = ({ open, setOpen, requisitioners }: Props) => {
  const navigate = useNavigate();
  console.log("REQUISITIONERS:", requisitioners);

  const [searchName, setSearchName] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Get unique departments from your actual database data
  const departments = useMemo(() => {
    const uniqueDepts = Array.from(
      new Set(
        requisitioners
          .map((req) => req.department)
          .filter(
            (dept): dept is string =>
              typeof dept === "string" && dept.trim() !== "",
          ),
      ),
    ).sort();

    return uniqueDepts;
  }, [requisitioners]);

  // Filter data based on name search and department dropdown
  const filteredRequisitioners = useMemo(() => {
    return requisitioners.filter((req) => {
      const matchesName =
        !searchName ||
        req.name?.toLowerCase().includes(searchName.toLowerCase());

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

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
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

        {/* Results */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto mt-3">
          {filteredRequisitioners.length > 0 ? (
            filteredRequisitioners.map((req: any) => (
              <div
                key={req.requisition_id}
                className="border rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => {
                  navigate(`/requisitioner/${req.access_token}`);
                  // setOpen(false);   // ← Uncomment if you want modal to close after selection
                }}
              >
                <h1 className="font-semibold">{req.name}</h1>
                <p className="text-sm text-gray-500">{req.department}</p>
                <p className="text-xs text-gray-400">{req.designation}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              No matching requisitioners found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequisitionerModal;
