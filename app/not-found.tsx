import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-muted-foreground">
        페이지를 찾을 수 없습니다.
      </p>
      <Link href="/" className="text-sm underline">
        홈으로 이동
      </Link>
    </div>
  );
}
