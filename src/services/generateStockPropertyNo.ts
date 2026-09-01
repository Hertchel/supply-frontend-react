import { ItemType } from "@/types/request/item";

export const generateStockPropertyNo = (items: ItemType[]) => {
  if (!items || items.length === 0) {
    return 1;
  }

  const stockNumbers = items
    .map((item) => Number(item.stock_property_no))
    .filter((number) => Number.isFinite(number));

  if (stockNumbers.length === 0) {
    return 1;
  }

  const lastStockNo = Math.max(...stockNumbers);

  return lastStockNo + 1;
};