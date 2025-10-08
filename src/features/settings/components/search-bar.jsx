import { Search } from "lucide-react";
export default function SearchBar() {
  return (
    // <div className="relative flex items-center border rounded-full overflow-hidden">
    //   <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
    //     <svg
    //       className="h-5 w-5 text-gray-400"
    //       xmlns="http://www.w3.org/2000/svg"
    //       viewBox="0 0 20 20"
    //       fill="currentColor"
    //     >
    //       <path
    //         fillRule="evenodd"
    //         d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
    //         clipRule="evenodd"
    //       />
    //     </svg>
    //   </div>
    //   <input
    //     type="text"
    //     placeholder="Search"
    //     className="pl-10 pr-4  w-full border-none focus:outline-none"
    //   />
    //   <button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 transition-colors">
    //     Search
    //   </button>
    // </div>
    <div>
      <form class="mx-auto max-w-md overflow-hidden rounded-full border border-gray-300 bg-white flex items-center gap-3 p-1 ps-3" >
        <label
          for="default-search"
          class="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Search
        </label>
        <Search className="text-[#45A1F2] mr-1" size={30}/>
          <input
            type="search"
            id="default-search"
            class="focus:ring-[#2389E3] outline-none focus:border-gray-500 block w-full border-none bg-white py-2 text-sm text-gray-900 dark:bg-white dark:placeholder-gray-400 "
            placeholder="Search "
            required
          />
        <button
            type="submit"
            class="hover:bg-[#45A1F2]-800 focus:ring-[#2389E3]-300 font-sm dark:bg-[#2389E3]-600 dark:hover:bg-[#2389E3]-700 dark:focus:ring-[#2389E3]-800  transform rounded-full bg-[#45A1F2] px-4 py-2 text-sm text-white focus:ring-4 focus:outline-none"
          >             
            Search
          </button>
      </form>
    </div>
  );
}
