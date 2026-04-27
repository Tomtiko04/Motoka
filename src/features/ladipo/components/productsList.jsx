import ProductCard from "./productCard";

function ProductsList({ parts = [], selectedCar = null, garageCars = [] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-3">
      {parts.map((part) => (
        <ProductCard key={part.id} part={part} isCarFilterActive={!!selectedCar} selectedCar={selectedCar} garageCars={garageCars} />
      ))}
    </div>
  );
}

export default ProductsList;

