import SiteNav from "@/components/site-nav"
import WhatsAppButton from "@/components/whatsapp-button"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      {children}
      <WhatsAppButton />
    </>
  )
}
