import Link from "next/link"; 


export function Footer() {
  return (
    <footer className="py-20 border-t border-neutral-200/60 px-6 sm:px-12 bg-[#fcfcfb]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="space-y-4">
          <span className="font-serif italic text-xl tracking-tight text-neutral-900">PadCheck</span>
          <p className="text-sm text-neutral-500 max-w-[30ch]">
            Promoting transparency in the rental market, one review at a time.
          </p>
        </div>
        <div className="flex gap-16">
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Platform</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>Search Map</li>
              <li>Landlord Directory</li>
              <li>Verification</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Support</h4>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li>Privacy</li>
              <li>Terms</li>
              <li>Contact</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
