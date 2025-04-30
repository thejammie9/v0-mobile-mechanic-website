export function BrakeDisc({ className = "h-10 w-10 text-blue-800" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={className}>
      <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM256 128a128 128 0 1 0 0 256 128 128 0 1 0 0-256zM192 256a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z" />
    </svg>
  )
}
