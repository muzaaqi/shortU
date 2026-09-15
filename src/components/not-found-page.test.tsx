/**
 * Unit tests for NotFoundPage component.
 * Verifies 404 status indicator, explanation, and action links.
 */
import { describe, expect, it } from "bun:test";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { renderToString } from "react-dom/server";
import { NotFoundPage } from "./not-found-page";

describe("NotFoundPage Component", () => {
  it("renders 404 heading, terminal indicator, and explanation", async () => {
    const rootRoute = createRootRoute({
      component: NotFoundPage,
    });
    const router = createRouter({
      routeTree: rootRoute,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();

    const html = renderToString(<RouterProvider router={router} />);
    expect(html).toContain("404");
    expect(html).toContain("Link Not Found");
    expect(html).toContain("Shorten a New URL");
  });
});
