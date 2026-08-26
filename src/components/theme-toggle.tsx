/**
 * Dark mode toggle button for the top navigation.
 * Toggles the `.dark` class on <html> and persists the choice in localStorage.
 * Falls back to the user's OS preference when no stored choice exists.
 * Initial paint is applied by the no-flash inline script in src/routes/__root.tsx;
 * icons are swapped purely via CSS so SSR and client markup always match.
 * Used by: src/routes/__root.tsx
 */
import { Moon, Sun } from "lucide-react";
import { memo, useCallback } from "react";
import { Button } from "~/components/ui/button";

const STORAGE_KEY = "shortu-theme";

/**
 * Applies the `.dark` class to <html> and stores the explicit choice.
 * Used by: ThemeToggle click handler
 */
const applyTheme = (dark: boolean) => {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    // localStorage may be unavailable (private mode) — theme still applies for this session
  }
};

export const ThemeToggle = memo(function ThemeToggle() {
  const handleToggle = useCallback(() => {
    applyTheme(!document.documentElement.classList.contains("dark"));
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      onClick={handleToggle}
      title="Toggle dark mode"
      aria-label="Toggle dark mode"
      className="text-muted-foreground hover:text-foreground cursor-pointer"
    >
      {/* CSS-only swap keeps SSR output stable regardless of active theme */}
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  );
});
