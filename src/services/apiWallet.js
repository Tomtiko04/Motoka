import { api } from "./apiClient";

// Wallet balance + status.
export async function getWallet() {
  const { data } = await api.get("/wallet");
  return data?.data ?? data;
}

// Paginated ledger (transaction history).
export async function getWalletLedger({ page = 1, limit = 20 } = {}) {
  const { data } = await api.get("/wallet/ledger", { params: { page, limit } });
  return data?.data ?? data;
}

// Transparent fee breakdown for a desired top-up (kobo in, breakdown out).
export async function getFundingQuote(amountKobo) {
  const { data } = await api.get("/wallet/fund/quote", { params: { amount_kobo: amountKobo } });
  return data?.data ?? data;
}

// Start a top-up. Returns { authorization_url, reference, credit_kobo, fee_kobo, total_charge_kobo }.
export async function initFunding(amountKobo) {
  const { data } = await api.post("/wallet/fund", { amount_kobo: amountKobo });
  return data?.data ?? data;
}
