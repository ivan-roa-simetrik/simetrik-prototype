import type { SVGAttributes } from "react";

import { cn } from "@/lib/utils";

const LogoMark = (props: SVGAttributes<SVGElement>) => (
  <svg viewBox="-8 35 135 130" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M41.0652 99.0616L103.401 77.2126C106.035 76.2928 108.506 74.804 110.611 72.6994C118.094 65.2163 118.094 53.0876 110.611 45.6123C106.869 41.8708 101.966 40 97.0634 40H30.4876C22.685 40 14.8823 42.9776 8.92705 48.9329C-2.97568 60.8356 -2.97568 80.1435 8.92705 92.0462C17.6183 100.737 30.2382 103.053 41.0574 99.0616H41.0652Z"
      fill="#3838F9"
    />
    <path
      d="M75.1677 100.714L12.8323 122.563C10.2054 123.483 7.72667 124.972 5.62206 127.076C-1.861 134.559 -1.861 146.688 5.62206 154.163C9.36359 157.905 14.2665 159.776 19.1617 159.776H85.7375C93.5402 159.776 101.343 156.798 107.298 150.851C119.201 138.948 119.201 119.64 107.298 107.737C98.6068 99.0461 85.987 96.731 75.1677 100.722V100.714Z"
      fill="#3838F9"
    />
  </svg>
);

export const Logo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <LogoMark className="size-7" />
    <span className="text-xl font-semibold tracking-tight">Simetrik</span>
  </div>
);

export default Logo;
