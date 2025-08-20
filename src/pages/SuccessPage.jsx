import { Icon } from "@iconify/react";
function SuccessPage() {
  return (
    <div className="text-align-center flex h-96 w-full items-center justify-center">
      <div className="flex w-full flex-col items-center justify-center gap-2 rounded-[20px] bg-white p-24 text-center shadow-2xl shadow-[#05243F17] md:w-[425px]">
        <div className="w-fit rounded-full bg-[#F4F5FC] p-3">
          <Icon
            icon="material-symbols:check-rounded"
            //   icon="lets-icons:check-fill"

            width="50"
            height="50"
            className="text-[#50DD71]"
          />
        </div>
        <h2 className="text-[24px] font-[500] text-[#05243F]">success</h2>
        <p className="text-[16px] text-[#05243F66]">
          Your license has been successful renewed
        </p>
        <button className="w-full rounded-full bg-[#2389E3] py-2 text-[16px] text-white">
          Done
        </button>
      </div>
    </div>
  );
}

export default SuccessPage;
