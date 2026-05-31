export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function parseNaira(input: string): number {
  return Number(input.replace(/[^0-9.-]/g, ""));
}
