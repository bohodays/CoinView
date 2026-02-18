"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * 다크모드 전환을 위한 토글 버튼
 */
const ThemeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <div className="relative cursor-pointer">
      <Moon
        onClick={() => setTheme("dark")}
        className="size-6 transition-all dark:scale-0 dark:-rotate-90"
      />
      <Sun
        onClick={() => setTheme("light")}
        className="absolute inset-0 size-6 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
      />
    </div>
  );
};

export default ThemeToggle;
