import image from "../assets/images/loginpage.gif"
export default function LoginImage(){
    return(
        <div className="bg-[#E5F0FF] h-full w-full py-2">
            <div className="flex flex-col w-full items-center justify-center h-full">
                <div className="w-[273px] flex items-center justify-center rounded-full overflow-hidden mt-4">
                    <img src={image} alt="login image" className="rounded-full block"/>
                </div>
                <p className="font-medium text-xl text-center px-6 py-2 mt-4">
                    License, registration,<br />and a lot of explanation
                </p>
            </div>
        </div>
    )
}