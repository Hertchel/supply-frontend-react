import { SupplierType } from "@/types/request/purchase-order";

export function generatePONo(
  prNo: string,
  supplierIndex: number,
  hasMultipleSuppliers: boolean,
): string {
  console.log(
    "------------------------------------------------------------------------",
  );
  console.log({
    prNo,
    supplierIndex,
    hasMultipleSuppliers,
  });
  if (!hasMultipleSuppliers) {
    return prNo;
  }

  const letterCode = String.fromCharCode(65 + supplierIndex); // 65 is ASCII for 'A'
  return `${prNo}${letterCode}`;
}

export function hasMultipleSuppliers(suppliers: SupplierType[]): boolean {
  return suppliers.length > 1;
}
