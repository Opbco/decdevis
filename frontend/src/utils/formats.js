export function ccyFormatTotalNombre(nums, item) {
  let total = Boolean(nums.length) && nums.reduce((s, a) => s + a[item], 0);
  return Boolean(nums.length) ? `${total.toLocaleString("fr-Fr")}` : "0";
}

export function ccyFormatTotalMontant(nums, item) {
  let montant = Boolean(nums.length) && nums.reduce((s, a) => s + a[item], 0);
  return Boolean(nums.length)
    ? `${montant.toLocaleString("fr-Fr", {
        style: "currency",
        currency: "XAF",
      })}`
    : "0";
}
