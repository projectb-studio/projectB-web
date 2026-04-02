import Link from "next/link";
import { Instagram } from "lucide-react";
import { SITE_CONFIG, FOOTER_LINKS, STORE_INFO, BUSINESS_INFO } from "@/constants/site";

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
            <div className="flex gap-4 mt-6">
              <a
                href={STORE_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--pb-silver)] hover:text-[var(--pb-snow)] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
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

          {/* Legal */}
          <div>
            <h3 className="font-heading text-xs tracking-[0.15em] uppercase text-[var(--pb-snow)] mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
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
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[var(--pb-charcoal)]">
          <div className="flex flex-col gap-3 text-xs text-[var(--pb-gray)]">
            <p>
              {BUSINESS_INFO.companyName} | 대표: {BUSINESS_INFO.representative} | 사업자등록번호: {BUSINESS_INFO.businessNumber}
            </p>
            <p>
              {BUSINESS_INFO.address}
            </p>
            <p>
              전화: {BUSINESS_INFO.phone} | 이메일: {BUSINESS_INFO.email}
            </p>
            <p className="mt-2">
              &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
