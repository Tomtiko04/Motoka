import { useRef, useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import ProductsData from "../../../Data/Products";
import { IoIosArrowBack } from "react-icons/io";
function ProductModal() {
const imageWrapperRef = useRef(null);
  const [imageHeight, setImageHeight] = useState(null);
const navigate=useNavigate();
//     const product = ProductsData.find(
//     (p) => encodeURIComponent(p.title) === title
//   );

//   if (!product) {
//     return <p className="p-6 text-red-500">Product not found</p>;
//   }
 const { slug } = useParams();

  const idFromSlug = slug?.split("-").pop();
  const numericId = parseInt(idFromSlug, 10);
// console.log(numericId)
//   const allProducts = ProductsData.flatMap(group => group.ProductInfo || group.productInfo || []);
  const product = ProductsData.find((p) => p.id === numericId);

  if (!product) {
    return <p className="p-6 text-red-500">Product not found</p>;
  }
  useEffect(() => {
    if (imageWrapperRef.current) {
      setImageHeight(imageWrapperRef.current.offsetHeight);
    }
  }, [product]); // Re-run on new product

 const handleGoBack=()=>{
    navigate(-1)
 };
  return (

    <div className="flex flex-col sm:flex-row mx-4 max-w-4xl rounded-[20px] bg-white py-8 shadow-sm sm:mx-auto"> 
        <div 
            className="flex-1 p-3 pt-0 px-8 border-[#697B8C26] border-e-2 h-fit "
            ref={imageWrapperRef}
        >
            <button
                      
                        onClick={handleGoBack}
                        
                        className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#E1E6F4] text-[#697C8C] transition-colors hover:bg-[#E5F3FF]"
                      >
                        <IoIosArrowBack className="h-5 w-5" />
                      </button>
            <p className="font-[600] text-[#05243F] text-[24px]">{product.description}</p>
            <p className="text-[14px] font-[600] py-2 pb-8">Price: <span className="text-[#2284DB]"> {product.price}</span></p>
            <div className="border-1 border-[#E8E9EB] rounded-[16px]">
            <img src={product.imageUrl} alt="" />
            </div>
            <div className="mt-5 flex justify-between">
                <div className="border-1 border-[#B1B3BA4D] rounded-[16px] w-[80.14286041259766px] bg-[#1E588B1C] p-2">
                    <img src={product.imageUrl} alt="" />
                </div>
                <div className="border-1 border-[#B1B3BA4D] rounded-[16px] w-[80.14286041259766px] p-2">
                    <img src={product.imageUrl} alt="" />
                </div>
                <div className="border-1 border-[#B1B3BA4D] rounded-[16px] w-[80.14286041259766px] p-2">
                    <img src={product.imageUrl} alt="" />
                </div>
                <div className="border-1 border-[#B1B3BA4D] rounded-[16px] w-[80.14286041259766px] p-2">
                    <img src={product.imageUrl} alt="" />
                </div>
            </div>
        </div>
        <div className="flex-1 p-3 ps-12 flex flex-col"
            style={{ maxHeight: imageHeight ? `${imageHeight-30}px` : "auto"}}
        >
            <div className="mb-8 h-fit">
                <p className="text-[15px] font-[600] text-[#05243F] pb-1">Product Specification:</p>
                <p className="text-[14px] text-black ">{product?.productDetails?.productSpecification}</p>
            </div>
            <div className="flex flex-col customScroll overflow-y-scroll mb-3 h-full">
            <div className="pb-8">
                <p className="text-[15px] font-[600] text-[#05243F] pb-1">Product Description:</p>
                <p className="text-[#697C8C] text-[14px]">{product?.productDetails?.productDescription}</p>
            </div>
            <div className="text-[13px] border-t-3 border-[#05243F0D] py-5 ">
                <p className="text-[15px] font-[600] text-[#05243F] pb-1">Key Features:</p>

                <ul className="leading-[26px] px-3">
                    {product?.productDetails?.keyFeatures.map((features,index)=>(
                        <li className="text-[#697C8C] list-disc text-[14px] " key={index}><b>{features.title}</b>{features.text}</li>
                    ))}
                </ul>
            </div>
        </div>
            <div className="flex items-center justify-between gap-5 h-fit">
                <button className="border-2 border-[#2389E3] rounded-full text-[#2389E3] font-[500] text-[14px] py-2 w-full">Add to Cart</button>
                <button className="bg-[#2389E3] text-white text-[14px] rounded-full w-full py-2 border-1 border-[#2389E3]">Buy Now</button>
            </div>
        </div>
        </div>

  );
}

export default ProductModal;






// this is the code and also know this is a component from the main code function ProductModal({selectedProduct}) {
//     return (
//         <div className="flex px-3"> 
//         <div className="flex-1 p-3 px-8 border-[#697B8C26] border-e-2 h-full">
//             <p className="font-[600] text-[#05243F] text-[24px]">{selectedProduct.description}</p>
//             <p className="text-[14px] font-[600] py-2 pb-8">Price: <span className="text-[#2284DB]"> {selectedProduct.price}</span></p>
//             <div className="border-1 border-[#E8E9EB] rounded-[16px]">
//             <img src={selectedProduct.imageUrl} alt="" />
//             </div>
//             <div className="mt-5 flex justify-between">
//                 <div className="border-1 border-[#B1B3BA4D] rounded-[16px] w-[80.14286041259766px] bg-[#1E588B1C] p-2">
//                     <img src={selectedProduct.imageUrl} alt="" />
//                 </div>
//                 <div className="border-1 border-[#B1B3BA4D] rounded-[16px] w-[80.14286041259766px] p-2">
//                     <img src={selectedProduct.imageUrl} alt="" />
//                 </div>
//                 <div className="border-1 border-[#B1B3BA4D] rounded-[16px] w-[80.14286041259766px] p-2">
//                     <img src={selectedProduct.imageUrl} alt="" />
//                 </div>
//                 <div className="border-1 border-[#B1B3BA4D] rounded-[16px] w-[80.14286041259766px] p-2">
//                     <img src={selectedProduct.imageUrl} alt="" />
//                 </div>
//             </div>
//         </div>
//         <div className="flex-1 p-3 ps-12 ">
//             <div className="mb-8">
//                 <p className="text-[15px] font-[600] text-[#05243F] pb-1">Product Specification:</p>
//                 <p className="text-[14px] text-black ">{selectedProduct?.productDetails?.productSpecification}</p>
//             </div>
//             <div className="flex flex-col customScroll overflow-y-scroll mb-3 h-min">
//             <div className="pb-8">
//                 <p className="text-[15px] font-[600] text-[#05243F] pb-1">Product Description:</p>
//                 <p className="text-[#697C8C] text-[14px]">{selectedProduct?.productDetails?.productDescription}</p>
//             </div>
//             <div className="text-[13px] border-t-3 border-[#05243F0D] py-5 ">
//                 <p className="text-[15px] font-[600] text-[#05243F] pb-1">Key Features:</p>

//                 <ul className="leading-[26px] px-3">
//                     {selectedProduct?.productDetails?.keyFeatures.map((features,index)=>(
//                         <li className="text-[#697C8C] list-disc text-[14px] " key={index}><b>{features.title}</b>{features.text}</li>
//                     ))}
//                 </ul>
//             </div>
//         </div>
//             <div className="flex items-center justify-between gap-5">
//                 <button className="border-2 border-[#2389E3] rounded-full text-[#2389E3] font-[500] text-[14px] py-2 w-full">Add to Cart</button>
//                 <button className="bg-[#2389E3] text-white text-[14px] rounded-full w-full py-2 border-1 border-[#2389E3]">Buy Now</button>
//             </div>
//         </div>
//         </div>
//      );
// }

// export default ProductModal;




//     <div className="flex px-3">
//       {/* Left - Image and thumbnails */}
//       <div
//         className="flex-1 p-3 px-8 border-[#697B8C26] border-e-2 border h-fit"
//         ref={imageWrapperRef}
//       >
//         <p className="font-[600] text-[#05243F] text-[24px]">
//           {selectedProduct.description}
//         </p>
//         <p className="text-[14px] font-[600] py-2 pb-8">
//           Price:
//           <span className="text-[#2284DB]"> {selectedProduct.price}</span>
//         </p>
//         <div className="border border-[#E8E9EB] rounded-[16px] overflow-hidden">
//           <img
//             src={selectedProduct.imageUrl}
//             alt=""
//             className="w-full object-cover"
//           />
//         </div>

//         {/* Thumbnails */}
//         <div className="mt-5 flex justify-between">
//           {[1, 2, 3, 4].map((_, i) => (
//             <div
//               key={i}
//               className="border border-[#B1B3BA4D] rounded-[16px] w-[80px] bg-[#1E588B1C] p-2"
//             >
//               <img src={selectedProduct.imageUrl} alt="" />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Right - Text Side */}
//       <div
//         className="flex-1 p-3 ps-12  border"
//         style={{ maxHeight: imageHeight ? `${imageHeight-100}px` : "auto" }}
//       >
//         <div className="mb-8">
//           <p className="text-[15px] font-[600] text-[#05243F] pb-1">
//             Product Specification:
//           </p>
//           <p className="text-[14px] text-black ">
//             {selectedProduct?.productDetails?.productSpecification}
//           </p>
//         </div>
// <div className="overflow-y-scroll customScroll flex-1">
//         <div className="pb-8 ">
//           <p className="text-[15px] font-[600] text-[#05243F] pb-1">
//             Product Description:
//           </p>
//           <p className="text-[#697C8C] text-[14px]">
//             {selectedProduct?.productDetails?.productDescription}
//           </p>
//         </div>

//         <div className="text-[13px] border-t-3 border-[#05243F0D] py-5">
//           <p className="text-[15px] font-[600] text-[#05243F] pb-1">
//             Key Features:
//           </p>
//           <ul className="leading-[26px] px-3">
//             {selectedProduct?.productDetails?.keyFeatures.map((features, index) => (
//               <li
//                 className="text-[#697C8C] list-disc text-[14px]"
//                 key={index}
//               >
//                 <b>{features.title}</b> {features.text}
//               </li>
//             ))}
//           </ul>
//         </div>
// </div>
//         <div className="flex items-center justify-between gap-5">
//           <button className="border-2 border-[#2389E3] rounded-full text-[#2389E3] font-[500] text-[14px] py-2 w-full">
//             Add to Cart
//           </button>
//           <button className="bg-[#2389E3] text-white text-[14px] rounded-full w-full py-2 border-1 border-[#2389E3]">
//             Buy Now
//           </button>
//         </div>
//       </div>
//     </div>