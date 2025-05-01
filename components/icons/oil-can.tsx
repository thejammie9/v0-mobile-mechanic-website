import type React from "react"
export function OilCan(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1e40af"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 18h18.5L22 4H8" />
      <path d="M11 4c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z" />
      <path d="M15.3 18 14 12" />
      <path d="M16.7 12H12l1.3 6" />
    </svg>
  )
}
