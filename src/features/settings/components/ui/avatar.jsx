export default function Avatar({ src, alt, size = "medium" }) {
    // Define size classes
    const sizeClasses = {
      small: "h-10 w-10",
      medium: "h-20 w-20",
      large: "h-32 w-32",
    }
  
    // Default placeholder image
    const defaultImage = "src/assets/images/setting/profile3.png"
  
    return (
      <div className={`rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <img
          src={src || defaultImage}
          alt={alt || "Avatar"}
          className="object-cover h-full w-full"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = defaultImage
          }}
        />
      </div>
    )
  }
  