/**
 * Root layout component.
 * Wraps all routes with QueryClientProvider, HTML document shell, styles, and navigation header.
 * Used by: TanStack Router for all routes
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HeadContent, Link, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { Link2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { UserNav } from "~/components/user-nav";
import appCss from "~/styles.css?url";

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
    ],
    links: [
      { rel: "stylesheet", href: appCss },
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
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold text-foreground tracking-tight">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Link2 className="size-4" />
              </div>
              <span>short<span className="text-primary font-bold">U</span></span>
            </Link>
            <nav className="flex items-center gap-3">
              <UserNav />
            </nav>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </RootDocument>
    </QueryClientProvider>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
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
