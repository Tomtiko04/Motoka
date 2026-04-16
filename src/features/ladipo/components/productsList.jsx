import { Link } from "react-router-dom";
import ProductCard from "./productCard";

function ProductsList({ parts = [] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-3">
      {parts.map((part) => (
        <Link key={part.id} to={`/ladipo/${part.slug}`} className="flex">
          <ProductCard part={part} />
        </Link>
      ))}
    </div>
  );
}

export default ProductsList;

