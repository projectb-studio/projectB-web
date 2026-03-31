import Link from "next/link";
import { SITE_CONFIG, FOOTER_LINKS } from "@/constants/site";

export function Footer() {
  return (
    <footer className="bg-[var(--pb-jet-black)] text-[var(--pb-silver)]">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h2 className="heading-display text-lg text-[var(--pb-snow)] tracking-[0.3em] mb-4">
              {SITE_CONFIG.name}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--pb-gray)]">
              Handcrafted accessories
              <br />& lifestyle goods
            </p>
          </div>

          {/* CS */}
          <div>
            <h3 className="font-heading text-xs tracking-[0.15em] uppercase text-[var(--pb-snow)] mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.cs.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[var(--pb-snow)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-heading text-xs tracking-[0.15em] uppercase text-[var(--pb-snow)] mb-4">
              Information
            </h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[var(--pb-snow)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + SNS */}
          <div>
            <h3 className="font-heading text-xs tracking-[0.15em] uppercase text-[var(--pb-snow)] mb-4">
              Legal
            </h3>
            <ul className="space-y-2 mb-8">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-[var(--pb-snow)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex gap-4">
              {/* TODO: Instagram, KakaoTalk icons */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-[var(--pb-snow)] transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[var(--pb-charcoal)]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[var(--pb-gray)]">
              © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights
              reserved.
            </p>
            <p className="text-xs text-[var(--pb-gray)]">
              사업자등록번호: 000-00-00000 | 통신판매업신고:
              제0000-서울강남-0000호
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
