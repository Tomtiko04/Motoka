import { useState } from "react";
import fallbackImage from "../../../../assets/images/setting/profile3.png";

const sizeClasses = {
  small: "h-10 w-10 text-xs",
  medium: "h-20 w-20 text-xl",
  large: "h-32 w-32 text-3xl",
};

function initialsOf(name) {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

// The previous default was the string "src/assets/images/setting/profile3.png",
// a source path that resolves in dev and 404s in a build — so the fallback was
// itself broken. It is imported now, and initials are preferred over a generic
// silhouette because they tell you whose account you are looking at.
export default function Avatar({ src, alt, name, size = "medium" }) {
  const [failed, setFailed] = useState(false);
  const initials = initialsOf(name ?? alt);
  const showImage = src && !failed;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full bg-[#E4F1FF] font-semibold text-[#2389E3] ${sizeClasses[size]}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || "Profile picture"}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : initials ? (
        <span aria-hidden="true">{initials}</span>
      ) : (
        <img
          src={fallbackImage}
          alt={alt || "Profile picture"}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}
