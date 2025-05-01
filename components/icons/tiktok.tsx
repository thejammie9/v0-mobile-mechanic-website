import type React from "react"
export function TikTok(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      <path d="M16 8v8a5 5 0 0 1-5 5v0a5 5 0 0 1-5-5v0" />
      <path d="M22 2 L18 2 C18 4.5 17 6.5 15 8" />
      <path d="M15 2v6" />
    </svg>
  )
}
