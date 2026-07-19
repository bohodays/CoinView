"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * 다크모드 전환을 위한 토글 버튼
 */
const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative cursor-pointer rounded-full p-1 hover:bg-muted"
    >
      <Moon
        aria-hidden="true"
        className="size-6 transition-all dark:scale-0 dark:-rotate-90"
      />
      <Sun
        aria-hidden="true"
        className="absolute size-6 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </button>
  );
};

export default ThemeToggle;
