// Re-registration fee.
//
// TEMPORARY. Every other priced flow in this app reads its price from the
// server — driver's licence uses useDriverLicensePrices, renewals read
// /public/renewal-items — because a price hardcoded in the client is a price
// that can disagree with what the customer is actually charged.
//
// Re-registration has no catalogue entry yet, so the figure lives here to keep
// it in exactly one place. It is display-only: nothing charges against it,
// because submission is not wired.
//
// Before this flow goes live, delete this file: add re_registration to the
// renewal-items catalogue and read the price from there. If the price is ever
// shown from here while payment is taken from the server, the two can drift
// and the customer sees one number and pays another.
export const RE_REGISTRATION_FEE_NAIRA = 150000;

export const RE_REGISTRATION_FEE_IS_PLACEHOLDER = true;
