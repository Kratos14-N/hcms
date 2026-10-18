import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hostel Complaint Management System | Arya Operations",
  description: "Enterprise SaaS maintenance & SLA dispatch desk",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const removeExtensionAttrs = (el) => {
                    if (!el || !el.removeAttribute) return;
                    if (el.hasAttribute('bis_skin_checked')) el.removeAttribute('bis_skin_checked');
                    if (el.hasAttribute('bis_register')) el.removeAttribute('bis_register');
                    if (el.hasAttribute('bis_frame_id')) el.removeAttribute('bis_frame_id');
                  };
                  document.querySelectorAll('[bis_skin_checked],[bis_register],[bis_frame_id]').forEach(removeExtensionAttrs);
                  const observer = new MutationObserver((mutations) => {
                    for (const m of mutations) {
                      if (m.type === 'attributes') {
                        removeExtensionAttrs(m.target);
                      } else if (m.addedNodes) {
                        for (const n of m.addedNodes) {
                          if (n.nodeType === 1) {
                            removeExtensionAttrs(n);
                            n.querySelectorAll?.('[bis_skin_checked],[bis_register],[bis_frame_id]').forEach(removeExtensionAttrs);
                          }
                        }
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    subtree: true,
                    childList: true,
                    attributeFilter: ['bis_skin_checked', 'bis_register', 'bis_frame_id']
                  });
                } catch (e) {}

                // Theme initialization
                try {
                  const stored = localStorage.getItem('theme');
                  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen antialiased text-slate-900 dark:text-slate-100 bg-[#F4F7F6] dark:bg-[#0B0F17] transition-colors duration-200`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}