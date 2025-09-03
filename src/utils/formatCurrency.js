export const formatCurrency = (value) => {
  const formatted = new Intl.NumberFormat("en", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

  return formatted.replace("₦", "#");
};
