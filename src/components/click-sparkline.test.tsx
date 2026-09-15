/**
 * Unit tests for ClickSparkline component.
 * Verifies rendering of GitHub contribution-style 7-day click trend graph.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "bun:test";
import { renderToString } from "react-dom/server";
import { ClickSparkline } from "./click-sparkline";

describe("ClickSparkline Component", () => {
  it("renders 7 horizontal square contribution cells", () => {
    const queryClient = new QueryClient();
    const mockData = [
      { date: "2026-09-09", label: "Wed", count: 0 },
      { date: "2026-09-10", label: "Thu", count: 2 },
      { date: "2026-09-11", label: "Fri", count: 5 },
      { date: "2026-09-12", label: "Sat", count: 1 },
      { date: "2026-09-13", label: "Sun", count: 0 },
      { date: "2026-09-14", label: "Mon", count: 8 },
      { date: "2026-09-15", label: "Tue", count: 12 },
    ];

    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <ClickSparkline linkId="link-123" initialData={mockData} />
      </QueryClientProvider>
    );

    expect(html).toContain("7-day trend");
    expect(html).toContain("2026-09-15");
    expect(html).toContain("Tue (2026-09-15): 12 clicks");
    expect(html).toContain("28"); // total sum of clicks
  });
});
