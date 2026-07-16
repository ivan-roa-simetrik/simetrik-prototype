'use client'
import React from 'react'

import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

export const BackgroundBeams = React.memo(({ className }: { className?: string }) => {
  const paths = [
    'M298.018 510.471C343.224 474.034 402.278 467.033 446.057 492.921L562.934 562.032L679.811 631.143C723.59 657.031 782.645 650.03 827.851 613.593L948.536 516.319',
    'M313.947 477.805C355.656 440.949 410.618 429.982 453.979 449.864L579.079 507.225L700.639 570.201C746.256 593.833 806.293 581.706 849.853 540.06L965.934 429.082',
    'M325.297 440.813C363.606 408.221 411.813 397.24 451.648 412.033L590.842 463.725L720.185 514.69C765.181 532.42 820.903 516.615 860.909 474.775L975.911 354.505',
    'M287.785 548.818C335.829 517.199 394.936 516.755 435.89 547.705L547.664 632.177L655.638 702.257C703.089 733.056 769.488 724.604 816.491 681.783L942.724 566.781',
    'M281.67 589.634C330.138 562.794 387.665 566.512 426.953 599.024L538.903 691.666L639.778 776.841C684.392 814.511 752.293 814.058 803.203 775.75L930.652 679.851',
    'M226.743 485.26L310.181 357.131C336.244 317.107 381.266 294.249 427.893 297.365L577.162 307.344L726.431 317.322C773.058 320.439 818.08 297.58 844.143 257.557L927.581 129.427',
    'M228.849 462.519L306.486 330.402C330.637 289.302 374.435 264.408 421.055 265.282L570.92 268.091L720.784 270.9C767.404 271.774 811.202 246.881 835.353 205.781L912.99 73.6634',
    'M219.228 439.691L303.106 299.889C325.76 262.132 365.219 238.241 408.281 236.211L564.661 228.836L714.808 221.756C761.252 219.566 803.222 191.991 824.678 149.571L894.042 12.4309',
    'M223.848 503.803L314.106 380.909C342.438 342.332 388.829 322.05 435.32 327.914L583.424 346.596L731.528 365.278C778.019 371.142 824.409 350.86 852.742 312.283L943 189.389',
    'M206.107 403.787L285.067 251.435C304.913 213.141 341.783 187.313 383.595 181.108C421.756 175.445 448.977 170.754 507.193 163.308L665.639 127.176C706.879 117.771 741.141 88.3145 757.371 48.3091L808.28 -77.1701',
    'M216.019 402.323L256.815 254.614C269.507 208.664 305.369 173.283 350.627 162.06L496.112 125.986L641.596 89.9122C686.855 78.69 722.717 43.3088 735.408 -2.64149L776.204 -150.351',
    'M205.761 372.975L237.267 222.555C247.012 176.027 280.416 138.529 324.71 124.393L467.909 78.693L611.107 32.993C655.402 18.8569 688.805 -18.6411 698.55 -65.1691L730.056 -215.588',
    'M210.266 432.647L301.211 271.432C322.452 233.779 360.343 209.11 402.577 205.438L539.157 193.562L671.234 170.983C716.46 163.252 754.416 131.555 770.946 87.7141L825.405 -56.7265',
    'M208.061 529.417L318.772 400.882C349.631 365.055 396.748 348.397 442.245 357.229L589.684 385.848L735.907 414.232C782.053 423.189 829.808 405.921 860.599 369.143L958.167 252.605',
    'M217.186 529.821L323.593 418.368C356.555 383.843 405.089 369.672 450.466 381.325L598.926 419.448L735.385 467.442C782.154 483.892 834.626 471.678 870.435 436.008L974.404 332.444'
  ]

  const pathLengths = React.useMemo(
    () =>
      paths.map(() => ({
        duration: 7 + Math.random(),
        delay: 0
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div
      className={cn(
        'absolute inset-y-0 flex h-full w-full items-center justify-center [mask-size:40px] [mask-repeat:no-repeat]',
        className
      )}
    >
      <svg
        className='pointer-events-none absolute z-0 h-full w-full opacity-80'
        width='644'
        height='864'
        viewBox='0 0 644 864'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
      >
        <title>Background beams decoration</title>
        <g>
          {paths.map((path, index) => (
            <path
              key={`beam-static-${index}`}
              d={path}
              stroke='var(--border)'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          ))}
        </g>

        {paths.map((path, index) => (
          <motion.path
            key={`beam-path-${index}`}
            d={path}
            stroke={`url(#linearGradient-${index})`}
            strokeOpacity='0.8'
            strokeWidth='2'
            strokeLinecap='round'
          ></motion.path>
        ))}
        <defs>
          {paths.map((_, index) => (
            <motion.linearGradient
              id={`linearGradient-${index}`}
              key={`beam-gradient-${index}`}
              initial={{
                x1: '0%',
                x2: '0%',
                y1: '0%',
                y2: '0%'
              }}
              animate={{
                x1: ['0%', '100%'],
                x2: ['0%', '95%'],
                y1: ['0%', '100%'],
                y2: ['0%', `${93 + (pathLengths[index].duration % 8)}%`]
              }}
              transition={{
                duration: pathLengths[index].duration,
                ease: 'easeInOut',
                repeat: Infinity,
                delay: pathLengths[index].delay
              }}
            >
              {/* Simetrik brand blues, sourced from the chart tokens in globals.css */}
              <stop stopColor='var(--chart-1)' stopOpacity='0'></stop>
              <stop stopColor='var(--chart-2)'></stop>
              <stop offset='32.5%' stopColor='var(--chart-3)'></stop>
              <stop offset='100%' stopColor='var(--chart-4)' stopOpacity='0'></stop>
            </motion.linearGradient>
          ))}

          <radialGradient
            id='paint0_radial_242_278'
            cx='0'
            cy='0'
            r='1'
            gradientUnits='userSpaceOnUse'
            gradientTransform='translate(352 34) rotate(90) scale(555 1560.62)'
          >
            <stop offset='0.0666667' stopColor='var(--border)'></stop>
            <stop offset='0.243243' stopColor='var(--border)'></stop>
            <stop offset='0.43594' stopColor='var(--background)' stopOpacity='0'></stop>
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
})

BackgroundBeams.displayName = 'BackgroundBeams'
