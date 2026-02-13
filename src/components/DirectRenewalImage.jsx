import image from "../assets/images/renewimage.gif"
export default function RenewImage() {
    return (
        <div className="bg-[#E5F0FF] h-full w-full relative overflow-hidden">
            <div className="flex flex-col w-full items-center justify-center h-full">
                <div className="absolute w-full flex items-center justify-center overflow-hidden h-full relative">

                    <img src={image} alt="login image" className=" block w-full h-full object-cover" />
                </div>

                <div style={{ background: 'linear-gradient(179.96deg, rgba(35, 137, 227, 0.2) 36.13%, #2389E3 99.96%)' }} className="absolute w-full h-full flex items-end justify-center">
                    <p className="font-medium text-3xl text-center px-6 py-12 text-white">
                        Motoka keeps you going
                    </p>
                </div>

            </div>
        </div>
    )
}

