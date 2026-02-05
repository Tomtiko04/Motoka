import image from "../assets/images/loginpage.gif"
export default function LoginImage(){
    return(
        <div className="bg-[#E5F0FF] h-full w-full p-12">
            <div className="flex flex-col w-full">
                <div className="w-[350px] flex items-center justify-center rounded-full overflow-hidden">
                    <img src={image} alt="login image" className="rounded-full block"/>
                </div>
                <p className="font-medium text-xl text-center px-6 py- pt-8">
                    License, registration,<br />and a lot of explanation
                </p>
            </div>
        </div>
    )
}