"use client";

import { Button } from "./button";

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  message = "문제가 발생했습니다.",
  onRetry,
}: Props) {
  return (
    <div
      role="alert"
      className="flex h-full flex-1 flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          다시 시도
        </Button>
      )}
    </div>
  );
}
