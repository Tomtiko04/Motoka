// Motoka's support channels. The WhatsApp number was duplicated in the contact
// page and is now shared, so a change of number is a one-line change.
export const WHATSAPP_NUMBER = "2348128685978";
export const SUPPORT_PHONE_DISPLAY = "0812 868 5978";

/**
 * Build a wa.me link with a pre-filled message.
 *
 * This opens WhatsApp on the sender's own device with the text ready — they
 * still tap Send. Nothing leaves the app on its own, which is why the calling
 * UI must say "tap Send" rather than claiming the message was delivered.
 */
export function buildWhatsAppUrl(lines) {
  // Only null and undefined are dropped. An empty string is a deliberate
  // blank line — filtering those out collapses the message into one block.
  const text = (Array.isArray(lines) ? lines : [lines])
    .filter((line) => line !== null && line !== undefined)
    .join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
