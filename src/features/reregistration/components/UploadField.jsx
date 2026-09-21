import { useRef } from "react";
import { Icon } from "@iconify/react";

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

export default function UploadField({
  label,
  hint,
  file,
  onChange,
  error,
  busy,
  required = true,
}) {
  const inputRef = useRef(null);

  function handleFile(e) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (picked.size > MAX_BYTES) {
      onChange(null, "That file is over 8MB. Please upload a smaller photo.");
      return;
    }
    onChange(picked, null);
  }

  return (
    <div className="rounded-2xl border border-[#E4E9F2] bg-white p-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[#05243F]">
          {label}
          {!required && (
            <span className="ml-1 text-xs font-normal text-[#05243F]/40">
              optional
            </span>
          )}
        </p>
        {file && !error && (
          <Icon icon="solar:check-circle-bold" fontSize={20} color="#21B993" />
        )}
      </div>

      {hint && <p className="mb-3 text-xs text-[#05243F]/50">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFile}
        className="sr-only"
        id={`upload-${label}`}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#2389E3]/40 bg-[#F4FAFF] px-4 py-3 text-sm font-medium text-[#2389E3] transition-colors hover:bg-[#E4F1FF] disabled:opacity-60"
      >
        <Icon icon="solar:upload-minimalistic-bold" fontSize={18} />
        {file ? "Replace file" : "Choose file or take a photo"}
      </button>

      {file && (
        <p className="mt-2 truncate text-xs text-[#05243F]/60" title={file.name}>
          {file.name} · {(file.size / 1024).toFixed(0)} KB
        </p>
      )}
      {error && <p className="mt-2 text-xs text-[#B3372C]">{error}</p>}
    </div>
  );
}
