import logo from "../../assets/images/landing/Group 209.svg"
import { Link } from "react-router-dom";
function Header() {
    return ( 
        <div className="w-full bg-[#F2ECE2]">
              <div className="mx-auto px-10">
                <header className="flex flex-wrap items-center justify-between py-2">
                  <div
                    // onClick={handleHome}
                    className="flex cursor-pointer items-center"
                  >
                    <img
                      src={logo}
                      alt="Motoka"
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                    <div>
                        {[
                            { name: 'Home', href: '#' },
                            { name: 'Services', href: '#' },
                            { name: 'Testimonials', href: '#' },
                            { name: 'FAQs', href: '#' },
                        ].map((item) => (
                            <Link key={item.name} to={item.href} className={`text-base mx-4 font-normal hover:text-[#126cbb] ${item.name==="Home" ? 'text-[#2388E1]' : 'text-[#05243F99]'}`}>
                                {item.name}
                            </Link>
                        ))                  
                        }
                    </div>
                  <button className="bg-[#EBB850] mt-2 rounded-[10px] px-6 py-3 text-xl font-semibold text-[#05243F] sm:mt-0 ">
                    Register
                  </button>
                </header>
              </div>
            </div>
     );
}

export default Header;