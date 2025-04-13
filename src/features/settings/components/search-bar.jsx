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

        <form class="max-w-md mx-auto bg-white rounded-lg">   
            <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div class="relative">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div>
                <input type="search" id="default-search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-3xl bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-white dark:border-gray-300 dark:placeholder-gray-400 dark:text-gray-900 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search " required />
                <button type="submit" class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-3xl text-sm px-5 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
            </div>
        </form>

      </div>
    )
  }
  
  