import ProductCard from "./productCard";

function ProductsList({ parts = [] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 sm:gap-3 lg:grid-cols-3">
      {parts.map((part) => (
        <ProductCard key={part.id} part={part} />
      ))}
    </div>
  );
}

export default ProductsList;
