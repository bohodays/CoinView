import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
