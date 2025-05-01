import type React from "react"

export function OilCan(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 18h18.5L22 4H9.5L8 2H2v16Z" />
      <path d="M14 7h6" />
      <path d="M13 11.5a1.5 1.5 0 0 0-3 0v6a1.5 1.5 0 0 0 3 0v-6Z" />
    </svg>
  )
}
