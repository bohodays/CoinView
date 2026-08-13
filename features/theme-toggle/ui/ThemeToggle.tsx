"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * 다크모드 전환을 위한 토글 버튼
 */
const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // resolvedTheme은 마운트 이후에야 확정되므로, 그 전까지는 렌더링을 미뤄 SSR/클라이언트 첫 렌더 불일치를 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="다크 모드로 전환"
        className="relative cursor-pointer rounded-full p-1 hover:bg-muted"
      >
        <Moon aria-hidden="true" className="size-6" />
      </button>
    );
  }

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
