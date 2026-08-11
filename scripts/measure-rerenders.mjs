// 홈 화면(코인 목록)에서 실시간 티커 갱신이 리스트 전체를 다시 그리는지,
// row 단위로만 그리는지를 React Profiler 커밋 데이터로 측정한다.
// 사용법: 프로덕션 서버(npm run build && npm run start)를 띄운 채로
//   node scripts/measure-rerenders.mjs
// 환경변수: BASE_URL(기본 http://localhost:3000), DURATION_MS(기본 20000)
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const DURATION_MS = Number(process.env.DURATION_MS ?? 20000);
const OUTPUT_PATH =
  process.env.OUTPUT_PATH ??
  join(__dirname, "..", "perf", "rerender-baseline.json");

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const url = `${BASE_URL}/?debug=profile`;
  await page.goto(url, { waitUntil: "networkidle" });

  console.log(`실시간 티커 커밋을 ${DURATION_MS / 1000}초 동안 수집합니다...`);
  await page.waitForTimeout(DURATION_MS);

  const log = await page.evaluate(() => window.__perfLog ?? []);
  await browser.close();

  // coin-list는 row 커밋을 감싸는 상위 Profiler라 자식이 커밋할 때마다
  // 함께 onRender가 호출된다("commits 수"는 리스트 격리의 증거가 아님).
  // "리스트 전체 재렌더 여부"의 진짜 증거는 phase별 actualDuration:
  // - mount: 초기 281+개 row가 한 번에 커밋되는 비용(1회, 큼)
  // - update: 티커 틱마다의 정상 상태 비용. row 1개 수준으로 작고
  //   고정적이면(목록 크기와 무관) row 단위 격리가 실제로 동작하는 것.
  function summarize(entries) {
    const byId = new Map();
    for (const entry of entries) {
      const stats = byId.get(entry.id) ?? {
        id: entry.id,
        commits: 0,
        totalDuration: 0,
        maxDuration: 0,
      };
      stats.commits += 1;
      stats.totalDuration += entry.actualDuration;
      stats.maxDuration = Math.max(stats.maxDuration, entry.actualDuration);
      byId.set(entry.id, stats);
    }
    return Array.from(byId.values())
      .map((s) => ({
        id: s.id,
        commits: s.commits,
        avgDurationMs: Number((s.totalDuration / s.commits).toFixed(3)),
        maxDurationMs: Number(s.maxDuration.toFixed(3)),
      }))
      .sort((a, b) => b.commits - a.commits);
  }

  const mountEntries = log.filter((e) => e.phase === "mount");
  const updateEntries = log.filter((e) => e.phase !== "mount");

  const mountPerComponent = summarize(mountEntries);
  const updatePerComponent = summarize(updateEntries);

  const listMount = mountPerComponent.find((c) => c.id === "coin-list");
  const listUpdate = updatePerComponent.find((c) => c.id === "coin-list");
  const rowUpdateStats = updatePerComponent.filter((c) => c.id !== "coin-list");

  const result = {
    measuredAt: new Date().toISOString(),
    url,
    durationMs: DURATION_MS,
    totalCommits: log.length,
    mount: {
      totalCommits: mountEntries.length,
      listContainer: listMount ?? null,
    },
    update: {
      totalCommits: updateEntries.length,
      listContainer: listUpdate ?? null,
      distinctRowsUpdated: rowUpdateStats.length,
      totalRowCommits: rowUpdateStats.reduce((sum, c) => sum + c.commits, 0),
      perRow: rowUpdateStats,
    },
  };

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));

  console.log(`총 커밋 수: ${result.totalCommits} (mount ${mountEntries.length} / update ${updateEntries.length})`);
  console.log(
    `[mount] coin-list: commits=${listMount?.commits ?? 0}, ` +
      `avgDuration=${listMount?.avgDurationMs ?? 0}ms, maxDuration=${listMount?.maxDurationMs ?? 0}ms`,
  );
  console.log(
    `[update, 정상 상태] coin-list: commits=${listUpdate?.commits ?? 0}, ` +
      `avgDuration=${listUpdate?.avgDurationMs ?? 0}ms, maxDuration=${listUpdate?.maxDurationMs ?? 0}ms`,
  );
  console.log(
    `[update] 개별 row 커밋 합계: ${result.update.totalRowCommits} (갱신된 서로 다른 row 수: ${result.update.distinctRowsUpdated})`,
  );
  console.log(`결과 저장: ${OUTPUT_PATH}`);
}

main();
