import AddOfficeModal from "./AddOfficeModal";
import { useEffect, useState } from "react";
import {  getAllOffices,  deleteOffice, } from "@/services/officeServices";
import type {
  Office as OfficeType,
} from "@/services/officeServices";
import Layout from "./../components/Layout/SupplyDashboardLayout";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Office = () => {
    const [offices, setOffices] = useState<OfficeType[]>([]);
    const fetchOffices = async () => {
        const response = await getAllOffices();

        console.log("OFFICES", response);

        if (response.status === "success") {
            setOffices(response.data || []);
        }
        };

    const handleDeleteOffice = async (
        id: number
        ) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this office?"
        );

        if (!confirmed) return;

        const response = await deleteOffice(id);

        console.log("DELETE OFFICE", response);

        if (response.status === "success") {
            fetchOffices();
        }
        };
        const [openAddModal, setOpenAddModal] = useState(false);
        const [selectedOffice, setSelectedOffice] =
            useState<OfficeType | null>(null);
            useEffect(() => {
        fetchOffices();
        }, []);
  return (
    <Layout>
    <Card className="bg-slate-100 w-full">

  <CardHeader>
    <CardTitle className="flex justify-between items-center">

      <h1 className="text-2xl ">
        Office Management
      </h1>

      <Button
        className="mb-4 hover:bg-orange-300 text-black"
        onClick={() => {
          setSelectedOffice(null);
          setOpenAddModal(true);
        }}
      >
        <PlusIcon className="mr-2 h-4 w-4" />

        <p className="font-normal">
          Add Office
        </p>
      </Button>

    </CardTitle>
  </CardHeader>

  <CardContent>

    <div className="overflow-x-auto rounded-md border bg-white">

      <table className="w-full text-sm">

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 text-gray-500 ">Code</th>
              <th className="text-left p-4 text-gray-500">Office Name</th>
              <th className="text-left p-4 text-gray-500">Department</th>
              <th className="text-left p-4 text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {offices.length > 0 ? (
                offices.map((office) => (
                <tr
                    key={office.id}
                    className="border-t"
                >
                    <td className="p-4">
                    {office.code}
                    </td>

                    <td className="p-4">
                    {office.name}
                    </td>

                    <td className="p-4">
                    {office.department}
                    </td>

                    <td className="p-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setSelectedOffice(office);
                                setOpenAddModal(true);
                            }}
                            className="border border-orange-300 text-orange-500 px-3 py-1 rounded-md hover:bg-orange-100"
                            >
                            Edit
                            </button>

                        <button
                            onClick={() =>
                                handleDeleteOffice(office.id)
                            }
                            className="px-3 py-1 rounded-md bg-[#f87171] text-[#ffffff] hover:bg-[#ef4444]"
                            >
                            Delete
                            </button>
                    </div>
                    </td>
                </tr>
                ))
            ) : (
                <tr>
                <td
                    colSpan={4}
                    className="text-center p-6 text-muted-foreground"
                >
                    No offices found.
                </td>
                </tr>
            )}
            </tbody>
        </table>
      </div>

      <AddOfficeModal
            open={openAddModal}
            onClose={() => {
                setOpenAddModal(false);
                setSelectedOffice(null);
            }}
            onSuccess={fetchOffices}
            office={selectedOffice}
            />

          </table>

    </div>

  </CardContent>

</Card>
    </Layout>
  );
};

export default Office;