import image from '../assets/images/signuppage.gif';

const AuthSideHero = ({ 
    imgSrc = image, 
    altText = "login image", 
    text = "Don’t stop for nothing",
    className = "" 
}) => {
    return (
        <div className={`hidden md:block w-1/2 relative overflow-hidden bg-[#E5F0FF] ${className}`}>
            <div className="flex flex-col w-full items-center justify-center h-full">
                <div className="absolute w-full flex items-center justify-center overflow-hidden h-full relative">
                    <img src={imgSrc} alt={altText} className="block w-full h-full object-cover" />
                </div>

                <div 
                    style={{ background: 'linear-gradient(179.96deg, rgba(35, 137, 227, 0.2) 36.13%, #2389E3 99.96%)' }} 
                    className="absolute w-full h-full flex items-end justify-center"
                >
                    <p className="font-medium text-3xl text-white text-center px-6 py-12">
                        {text}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthSideHero;
