import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#222831] text-[#EEEEEE] p-4 border-t border-[#393E46] shadow-inner mt-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-sm">
        <p className="text-[#EEEEEE]/70 mb-2 md:mb-0">
          &copy; {new Date().getFullYear()} CtrlFund. All rights reserved.
        </p>
        <nav className="flex space-x-4">
          <Link href="/privacy" className="text-[#00ADB5] hover:text-[#008c9e]">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-[#00ADB5] hover:text-[#008c9e]">
            Terms of Service
          </Link>
          <Link href="/contact" className="text-[#00ADB5] hover:text-[#008c9e]">
            Contact Us
          </Link>
        </nav>
      </div>
    </footer>
  )
}
