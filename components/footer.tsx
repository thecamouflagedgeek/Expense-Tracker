import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#eff1e9]/60 backdrop-blur-md text-black/60 p-4 border-t border-black/5 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-xs font-semibold">
        <p className="text-black/50 mb-2 md:mb-0">
          &copy; {new Date().getFullYear()} CtrlFund. All rights reserved.
        </p>
        <nav className="flex space-x-6">
          <Link href="/privacy" className="text-black hover:text-black/80 hover:underline transition-all">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-black hover:text-black/80 hover:underline transition-all">
            Terms of Service
          </Link>
          <Link href="/contact" className="text-black hover:text-black/80 hover:underline transition-all">
            Contact Us
          </Link>
        </nav>
      </div>
    </footer>
  )
}
