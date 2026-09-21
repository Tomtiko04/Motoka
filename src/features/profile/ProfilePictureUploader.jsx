import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Avatar from "../settings/components/ui/avatar";
import {
  ACCEPTED,
  useProfile,
  useUploadProfilePicture,
  validatePicture,
} from "./useProfilePicture";

export default function ProfilePictureUploader({ name, size = "medium" }) {
  const inputRef = useRef(null);
  const { imageUrl } = useProfile();
  const upload = useUploadProfilePicture();
  const [preview, setPreview] = useState(null);
  const [problem, setProblem] = useState(null);

  // Object URLs are revoked on replacement and unmount; leaving them alive
  // holds the whole image in memory for the life of the page.
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  function choose(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const invalid = validatePicture(file);
    setProblem(invalid);
    if (invalid) return;

    const url = URL.createObjectURL(file);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return url;
    });

    upload.mutate(file, {
      // The preview is dropped either way: on success the server URL is the
      // truth, and on failure showing the new picture would be a lie.
      onSettled: () => {
        setPreview((old) => {
          if (old) URL.revokeObjectURL(old);
          return null;
        });
      },
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar src={preview ?? imageUrl} name={name} alt={name} size={size} />
        {upload.isPending && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#05243F]/45">
            <Icon icon="svg-spinners:180-ring" color="#fff" width="22" />
          </div>
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          onChange={choose}
          className="sr-only"
          id="profile-picture-input"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="flex items-center gap-2 rounded-full border border-[#2389E3] px-4 py-2 text-sm font-semibold text-[#2389E3] transition-colors hover:bg-[#F4FAFF] disabled:opacity-60"
        >
          <Icon icon="solar:camera-bold" width="16" />
          {upload.isPending
            ? "Uploading…"
            : imageUrl
              ? "Change picture"
              : "Add a picture"}
        </button>
        <p className="mt-1.5 text-xs text-[#05243F]/45">
          JPG, PNG or WebP, up to 5MB.
        </p>
        {problem && <p className="mt-1 text-xs text-[#B3372C]">{problem}</p>}
      </div>
    </div>
  );
}
