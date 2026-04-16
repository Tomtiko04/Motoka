import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { Icon } from "@iconify/react";

function WalletDemoChip() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF1FF] px-5 py-2">
      <Icon icon="solar:eye-bold" width="16" className="text-[#697C8C]" />
      <span className="text-lg font-semibold text-[#2B8DED]">₦0</span>
    </div>
  );
}

/**
 * Ladipo section layout — same idea as LicenseLayout: pass `title`, optional `subTitle`, `backPath`.
 * Title stays beside the back button (left), not centered.
 */
export default function LadipoLayout({
  children,
  title = "Ladipo",
  subTitle,
  backPath,
  /** Custom node on the right of the header (overrides showWalletDemo) */
  headerEnd,
  /** UI demo: wallet chip on the marketplace header */
  showWalletDemo = false,
}) {
  const navigate = useNavigate();
  const goBack = () => navigate(backPath ?? -1);

  const rightSlot =
    headerEnd ??
    (showWalletDemo ? (
      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
        <Link
          to="/settings"
          state={{ settingsPage: "ladipo-orders" }}
          className="whitespace-nowrap text-[13px] font-semibold text-[#2389E3] underline-offset-2 hover:underline sm:text-sm"
        >
          My Orders
        </Link>
        <WalletDemoChip />
      </div>
    ) : null);

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mt-3 mb-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <button
                type="button"
                onClick={goBack}
                className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E1E6F4] text-[#697C8C] transition-colors hover:bg-[#E5F3FF]"
              >
                <IoIosArrowBack className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-medium text-[#05243F] md:text-2xl line-clamp-2">
                  {title}
                </h1>
                {subTitle ? (
                  <p className="mt-1 text-sm font-normal text-[#05243F]/40 line-clamp-2">
                    {subTitle}
                  </p>
                ) : null}
              </div>
            </div>
            {rightSlot ? <div className="flex-shrink-0 pt-0.5">{rightSlot}</div> : null}
          </div>
        </div>
      </div>

      <div className="mx-4 max-w-4xl md:max-w-5xl h-full sm:mx-auto">{children}</div>
    </>
  );
}
