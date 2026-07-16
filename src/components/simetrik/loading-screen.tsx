import { assetPath } from "@/lib/asset-path";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand asset, no responsive srcset needed */}
      <img
        src={assetPath("/simetrik-logo.svg")}
        alt="Simetrik"
        width={200}
        height={59}
        className="animate-breathe w-[224px] sm:w-[269px]"
      />
    </div>
  );
}
