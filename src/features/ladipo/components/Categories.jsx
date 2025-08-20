import product1 from '../../../assets/images/3f7adbdd7c0244bc472649798d8b21efd639cdc8.png'
import product2 from '../../../assets/images/36aec8f04cda262fb7ec76417af70265ca7bcaad.png'
import product3 from '../../../assets/images/669d6a7c9f9ac467e124d485ca1c7e9af1670bb7.png'
import product4 from '../../../assets/images/48394e6ed91aab55891e7ddd7c645b5fad480d20.png'
function Categories({selectedCategory,setSelectedCategory}) {
    return (
        <div  className="p-5  border-b-2 border-[#05243F0D] ">
            <div className="flex justify-between text-[15px] text-[#697C8C70] font-[600] mb-4">
                <p><button onClick={()=>setSelectedCategory(null)}>Categories</button> <span className='text-[#697C8C]'>{selectedCategory&& "/"+selectedCategory}</span></p>
                <p>See All</p>
            </div>
            <div className="flex">

                <div className='flex gap-8 overflow-auto no-scrollbar'>
                    {[
                        {
                            src:product1,
                            title:"Maintenance",

                        },
                        {
                            src: product2,
                            title:"Car Parts"
                        },
                        {
                            src: product3,
                            title: "Accessories"
                        },
                        {
                            src: product4,
                            title: "Deals"
                        },
                    ].map((category,index)=>(
                        <div className='flex flex-col align-center text-center group' key={index} onClick={()=>setSelectedCategory(category.title)}>
                        <div className={`w-[84px] border-2 h-[60px] overflow-hidden rounded-[90px] mb-2 group-hover:border-[#2284DB] ${selectedCategory===category.title?" border-[#2284DB] ":"border-[#D3D9DE4D]"}`}>
                            <img src={category.src} alt="" />
                        </div>
                        <div>
                            <p className='text-[#05243F] text-[13px] '>{category.title}</p>
                        </div>
                    </div>
                    ))
                    }
                </div>
            </div>
        </div>
      );
}

export default Categories;