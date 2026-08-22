/**
 * Client entry point for TanStack Start.
 * Hydrates the application in the browser.
 */
import { StartClient } from "@tanstack/react-start/client";
import { hydrateRoot } from "react-dom/client";

hydrateRoot(document, <StartClient />);
