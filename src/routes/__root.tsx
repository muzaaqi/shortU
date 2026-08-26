/**
 * Root layout component.
 * Wraps all routes with QueryClientProvider, HTML document shell, styles, and navigation header.
 * Used by: TanStack Router for all routes
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeadContent, Link, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { TopNav } from "~/components/top-nav";
import appCss from "~/styles.css?url";

/**
 * Applies the stored or OS-preferred theme before first paint to prevent
 * a light-mode flash for dark-mode users. Mirrors the logic in
 * src/components/theme-toggle.tsx (STORAGE_KEY: "shortu-theme").
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem("shortu-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "shortU — URL Shortener & QR Generator" },
      {
        name: "description",
        content: "Fast, developer-grade URL shortener and QR code generator with optional creator monetization.",
      },
      { name: "theme-color", content: "#0f1117" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/favicon.ico", sizes: "64x64 32x32 24x24 16x16" },
      { rel: "icon", type: "image/png", href: "/favicon-32x32.png", sizes: "32x32" },
      { rel: "icon", type: "image/png", href: "/favicon-16x16.png", sizes: "16x16" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>
        <TopNav />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t border-border bg-surface-soft">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
            <p className="text-xs text-muted-foreground">
              shortU — fast links, scan-ready QR codes.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link
                to="/"
                className="hover:text-foreground transition-colors"
              >
                Shorten
              </Link>
              <Link
                to="/dashboard"
                className="hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </footer>
      </RootDocument>
    </QueryClientProvider>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static inline script with no user input; runs before paint to prevent dark-mode flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col"
        suppressHydrationWarning
      >
        {children}
        <Scripts />
      </body>
    </html>
  );
}
