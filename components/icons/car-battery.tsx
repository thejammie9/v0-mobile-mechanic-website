import type React from "react"
export function CarBattery(props: React.SVGProps<SVGSVGElement>) {
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
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <line x1="6" y1="8" x2="6" y2="5" />
      <line x1="18" y1="8" x2="18" y2="5" />
      <line x1="14" y1="12" x2="14" y2="16" />
      <line x1="12" y1="14" x2="16" y2="14" />
      <line x1="8" y1="12" x2="8" y2="16" />
    </svg>
  )
}
