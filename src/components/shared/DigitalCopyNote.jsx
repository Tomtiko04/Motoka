import { Icon } from "@iconify/react";

/**
 * "Keeping Digital Copy" used to sit in the document list as a ₦0 tickbox, which
 * read as an optional extra someone had to remember to choose. It is not
 * optional and never cost anything — every renewal is stored either way — so the
 * item was deactivated and this states it at the point people are deciding to
 * pay, where the reassurance is actually worth something.
 */
export default function DigitalCopyNote({ className = "" }) {
  return (
    <p className={`flex items-center justify-center gap-2 text-center text-xs text-[#05243F]/60 ${className}`}>
      <Icon icon="solar:shield-check-bold" width="16" className="shrink-0 text-[#21B993]" />
      A digital copy of every document is saved to your Motoka wallet.
    </p>
  );
}
