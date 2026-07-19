export function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`환경변수 ${name}가 설정되지 않았습니다.`);
  }
  return value;
}
