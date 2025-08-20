import { Link } from "react-router-dom";
import ProductsData from "../../../Data/Products";
import ProductCard from "./productCard";
function ProductsList({ selectedProduct, setSelectedProduct, setShowModal, filteredRules, selectedCategory, setSelectedCategory, selectedClass, setSelectedClass}) {
  const filteredProducts = ProductsData.filter(
    (item) => item.category === selectedCategory,
  );
  const groupedProducts = ProductsData.reduce((acc, product) => {
    if (!acc[product.class]) acc[product.class] = [];
    acc[product.class].push(product);
    return acc;
  }, {});

  const shownClasses = selectedClass
    ? { [selectedClass]: groupedProducts[selectedClass] }
    : groupedProducts;

  return (
    <>
      {filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4 sm:gap-5">
            {filteredProducts.map((product) => {
              const slug = `${product.title.toLowerCase().replace(/\s+/g, "-")}-${product.id}`;
              return (
                <Link key={product.id} to={`/ladipo/${slug}`}>
                  <ProductCard
                    product={product}
                    imageUrl={product.imageUrl}
                    description={product.description}
                    title={product.title}
                    price={product.price}
                    setSelectedProduct={setSelectedProduct}
                    setShowModal={setShowModal}
                  />
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {Object.entries(shownClasses).map(
            ([className, classProducts], index) => (
              <div className="p-5" key={index}>
                <div className="mb-4 flex justify-between text-[15px] font-[600] text-[#697C8C]">
                  <p className="text-[#EBB850]">{className}</p>
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => setSelectedClass(className)}
                  >
                    See All
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 items-stretch">
                  {(selectedClass
                    ? classProducts
                    : classProducts.slice(0, 4)
                  ).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      imageUrl={product.imageUrl}
                      description={product.description}
                      title={product.title}
                      price={product.price}
                      setSelectedProduct={setSelectedProduct}
                      setShowModal={setShowModal}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </>
      )}
    </>
  );
}

export default ProductsList;
