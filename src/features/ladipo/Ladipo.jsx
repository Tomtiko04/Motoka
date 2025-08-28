import { Icon } from "@iconify/react";
import LadipoLayout from "./components/LadipoLayout";
import { ChevronLeft, Cog, Sparkles, Menu, Search } from "lucide-react"
import Categories from "./components/Categories";
import ProductsList from "./components/productsList";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import ProductModal from "./components/modal";
import SearchBar from "./components/Searchbar";
import ProductsData from "../../Data/Products";
function Ladipo() {
  const [selectedProduct, setSelectedProduct]=useState(null)
  const [showModal,setShowModal]=useState(false)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory,setSelectedCategory]=useState(null);
  const [filteredRules, setFilteredRules] = useState(
    ""
  );
  const [selectedClass, setSelectedClass] = useState(null);

  const handleSearch = () => {
    const lowerQuery = searchTerm.toLowerCase();
    return ProductsData.filter((product) => {
      const inCategory = selectedCategory
        ? product.category === selectedCategory
        : true;
      const inTitle = product.title.toLowerCase().includes(lowerQuery);
      const inDescription = product.description?.toLowerCase().includes(lowerQuery);
      const inKeywords = product.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(lowerQuery)
      );

      return inCategory && (inTitle || inDescription || inKeywords);
    });
  };

  // const filteredProducts = handleSearch();

    return ( 
        <LadipoLayout
          title="Ladipo"
          showModal={showModal}
          setShowModal={setShowModal}
        >
        {showModal?(
          <ProductModal selectedProduct={selectedProduct}/>
        ):(
          <>
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-[#05243F0D] pb-5 px-4 sm:px-5 ">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              handleSearch={handleSearch}
            />
            <div className="flex items-center gap-2 w-full justify-center sm:justify-end mt-5 sm:mt-0">
            <p className="text-[#00000040] text-[13px]">Don’t know what to buy?</p>
            <div className="text-[13px]">
            <button className="flex items-center gap-2 bg-[#eeb441]  hover:bg-amber-600 text-white px-2 py-2 rounded-full shadow-sm transition-colors">
              <Sparkles className="h-4 w-4" fill="#fff" />
              <span>Ask Mo</span>
            </button>
          </div>
            </div>
        </div>
        <Categories 
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <ProductsList 
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setShowModal={setShowModal}
          filteredRules={filteredRules}
          setSelectedClass={setSelectedCategory}
          selectedClass={selectedClass}
        />
      </div>
        </>
        )
        }
    </LadipoLayout>

     );
}

export default Ladipo;