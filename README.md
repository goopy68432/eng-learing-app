# EngReader

한국어 초중급(CEFR A2~B1) 학습자를 위한 영문 마크다운 리딩 학습 뷰어.
`content/`에 영문 원문(`*.md`)과 외부 LLM이 생성한 학습자료(`*.learn.md`)를 짝지으면, 문장 단위 점진 reveal로 학습할 수 있는 정적 사이트가 빌드됩니다.

## 설계 / 계획 문서

- 스펙: [`docs/superpowers/specs/2026-05-05-engreader-design.md`](docs/superpowers/specs/2026-05-05-engreader-design.md)
- 구현 계획: [`docs/superpowers/plans/2026-05-05-engreader-v1.md`](docs/superpowers/plans/2026-05-05-engreader-v1.md)
- 시안 (단독 HTML): [`mockup/reader.html`](mockup/reader.html)
- 학습자료 생성 프롬프트: [`prompts/generate-learn-md.md`](prompts/generate-learn-md.md)

## 빠른 시작

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

## 빌드 & 배포

```bash
pnpm build    # → out/ (정적 사이트)
```

`out/` 디렉토리를 Vercel, Netlify, GitHub Pages 등 정적 호스팅에 그대로 배포하세요.

## 콘텐츠 추가 방법

1. 영문 원문을 `content/<카테고리>/<이름>.md`로 저장합니다.
2. `prompts/generate-learn-md.md`를 Claude Code(또는 다른 LLM)에 적용해 같은 위치에 `<이름>.learn.md`를 생성합니다.
3. `pnpm dev`(개발 모드는 자동 반영) 또는 `pnpm build`(정적 사이트)로 사이트에 반영합니다.

`content/samples/`는 CI 스모크 테스트용으로 커밋되어 있습니다. 본인의 콘텐츠는 저작권에 따라 `.gitignore`로 제외하는 것을 권장합니다(기본 설정).

## 단축키

| 키 | 동작 |
|---|---|
| `j` / `k` | 다음/이전 문장 |
| `0` / `1` / `2` | 현재 문장 stage 변경 |
| `e` / `c` | 모두 펼치기 / 접기 |
| `b` | 북마크 토글 |
| `space` | 읽음 토글 |
| `+` / `-` | 본문 글자 크게 / 작게 |
| `?` | 단축키 도움말 모달 |

## 점진 reveal 단계

| Stage | 표시 영역 |
|---|---|
| 0 | 원문 + ⭐(북마크) ✓(읽음) |
| 1 | + 번역 + 청크 |
| 2 | + 구조 + 어휘 + 원어민 감각 |

## 환경설정

- **다크모드**: 사이드바 하단 🌙/☀️ 버튼
- **본문 글자크기**: 사이드바의 가-/가/가+ 3버튼 또는 `+`/`-` 키
- 모든 설정은 localStorage(`engreader:user-state:v1`)에 저장됩니다.

## 테스트

```bash
pnpm test       # Vitest 단위 테스트
pnpm e2e        # Playwright 스모크 E2E (사전 빌드 필요)
pnpm typecheck
```

## 스택

Next.js 15 (App Router · SSG) · React 19 · Tailwind CSS · Zustand (+ persist) · gray-matter · next-themes · Vitest · Testing Library · Playwright

폰트 시스템:
- **Serif** (본문): Source Serif 4 → Noto Serif KR → Georgia
- **Sans** (UI): Inter → Wanted Sans Variable → Pretendard
- **Mono** (청크/코드): Naver D2Coding → JetBrains Mono → ui-monospace

## 라이선스

TBD
