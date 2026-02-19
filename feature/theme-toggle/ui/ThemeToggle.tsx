"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * 다크모드 전환을 위한 토글 버튼
 */
const ThemeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <div className="relative cursor-pointer hover:bg-muted rounded-full p-1">
      <Moon
        onClick={() => setTheme("dark")}
        className="size-6 transition-all dark:scale-0 dark:-rotate-90"
      />
      <Sun
        onClick={() => setTheme("light")}
        className="absolute size-6 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

export default ThemeToggle;
