# EngReader — 설계 문서 (PRD)

- **작성일**: 2026-05-05
- **상태**: 설계 합의 완료, 구현 계획 단계 직전
- **작성자**: 사용자 + Claude (브레인스토밍 세션)

## 1. 목적과 한 줄 정의

> **사용자가 제공한 영문 마크다운(`*.md`)과 외부 LLM이 사전 생성한 학습자료 마크다운(`*.learn.md`)을 짝지어 보여주는 정적 웹 뷰어. 한국어 초중급(CEFR A2~B1) 학습자가 영문을 "원어민처럼 술술 읽기" 위해 문장 단위 점진 reveal로 학습한다.**

이 앱은 **순수 뷰어**다. LLM 호출, 문장 분석, 학습자료 생성은 모두 **앱 외부**에서 이루어지며, 결과 마크다운만 폴더에 두면 빌드 시점에 정적 페이지로 변환된다.

## 2. 사용자와 학습 목표

- **타깃**: 한국어 모국어, 영어 CEFR A2~B1 (대략은 알지만 원어민의 자연스러운 읽기 흐름을 못 잡는 단계)
- **단일 사용자**: 본인 사용 전제. 인증/멀티 유저 없음.
- **학습 목표**: 영문 한 문장이 들어왔을 때
  1. 의미 청크를 원어민이 잡는 단위로 끊을 수 있다
  2. 문장 구조(주어/동사/부사구/절)를 빠르게 식별한다
  3. 핵심 어휘·구동사의 뉘앙스를 안다
  4. 그 표현이 어느 레지스터(뉴스/문어/구어)에 속하는지 감을 잡는다

## 3. 핵심 사용 시나리오

1. 사용자가 외부 도구(Claude Code 등)로 `prompts/generate-learn-md.md` 프롬프트를 사용해 `foo.md` → `foo.learn.md`를 생성한다.
2. 생성된 `*.learn.md`를 `content/<카테고리>/` 폴더에 저장한다.
3. `pnpm build`로 정적 사이트를 빌드(또는 dev 모드로 즉시 반영).
4. 사이드바에서 콘텐츠를 선택, 리더 페이지로 진입.
5. 문장별로 **Stage 0(원문) → Stage 1(번역+청크) → Stage 2(전체 6블록)** 순으로 점진 펼쳐 학습.
6. 어려운 문장은 ⭐ 북마크, 단어는 ⭐로 단어장에 누적, 읽은 문장은 ✓로 진도 표시.

## 4. 비스코프 (명시적 제외)

- 백엔드, DB, 사용자 인증
- 앱 내부에서의 실시간 LLM 호출
- 모바일 네이티브 앱 (반응형 웹은 지원)
- 학습자료 자동 생성 스크립트(이번 v1에서는 사용자가 수동으로 외부 LLM 사용)

## 5. 시스템 아키텍처

```
[외부] 사용자 → Claude Code 등 LLM에 prompts/generate-learn-md.md를 적용
              → *.learn.md 파일 생성
              ↓ (파일시스템에 저장)
content/<카테고리>/<basename>.md          ← 원문
content/<카테고리>/<basename>.learn.md    ← 학습자료
              ↓ (Next.js 빌드 시점 SSG)
정적 HTML 사이트 (Vercel 배포)
              ↓
[클라이언트] 점진 reveal · 진도/북마크/단어장은 localStorage
```

3대 원칙:
1. **앱은 순수 뷰어** — LLM 호출/MD 생성 책임 없음.
2. **빌드 시점 처리** — 콘텐츠 스캔/파싱은 build-time, 런타임 fetch 없음.
3. **상태는 클라이언트 only** — 진도·북마크·단어장은 localStorage. 서버/DB 없음.

## 6. 폴더 구조

```
eng_learning_app/
├── content/                       # 사용자 콘텐츠 (gitignore 권장 또는 sample만 포함)
│   ├── news/
│   │   ├── climate-2026.md
│   │   └── climate-2026.learn.md
│   └── essays/
│       └── orwell-politics.md
│       └── orwell-politics.learn.md
├── prompts/
│   └── generate-learn-md.md       # 외부 LLM용 학습자료 생성 프롬프트
├── docs/superpowers/specs/        # 본 설계문서 위치
├── mockup/
│   └── reader.html                # Tailwind CDN 정적 시안
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx               # 홈
│   │   ├── read/[...slug]/page.tsx
│   │   ├── vocab/page.tsx
│   │   └── bookmarks/page.tsx
│   ├── components/
│   ├── lib/
│   │   ├── content.ts             # MD 스캔/파싱
│   │   └── store.ts               # Zustand + persist
│   └── styles/
│       ├── tokens.css             # 폰트·색 변수 (openbook 스타일)
│       └── globals.css
├── tests/                         # Vitest 단위 테스트
├── e2e/                           # Playwright E2E
├── public/
├── package.json
└── ...
```

## 7. 콘텐츠 마크다운 규약

### 7.1 원문 MD (사용자 입력)
선택적 frontmatter + 평범한 마크다운 본문.
```markdown
---
title: "Climate Talks Stall in Geneva"
source: "Reuters, 2026-04-30"
level: "B1"
---

# Climate Talks Stall in Geneva

Despite the heavy rain, the climbers pressed on toward the summit.
The negotiations, however, made little progress...
```

### 7.2 학습자료 MD (`*.learn.md`, LLM 생성)
**고정 구조** — 빌드 시점 파싱이 결정적이도록.
```markdown
---
source: "climate-2026.md"
generated_at: "2026-05-05"
sentence_count: 24
---

## S1
> Despite the heavy rain, the climbers pressed on toward the summit.

### 번역
폭우에도 불구하고 등반대는 정상을 향해 계속 나아갔다.

### 청크
`Despite the heavy rain` // `the climbers` // `pressed on` // `toward the summit`
[양보 부사구][주어][동사구][방향 부사구]의 흐름.

### 구조
- 주절: the climbers (S) / pressed on (V)
- 부사구: Despite the heavy rain (양보), toward the summit (방향)

### 어휘
- **press on** *(phrasal v.)*: 어려움에도 계속 밀고 나가다 — *carry on*보다 의지가 강함
- **summit** *(n.)*: (산의) 정상; 비유적 "정점"

### 감각
"despite + 명사구"는 although절보다 문어적·간결. 뉴스/논픽션에서 빈출.
```

### 7.3 파싱 규칙
- `## S\d+` 헤딩으로 문장 분리.
- `> ...` 첫 줄 = 원문 문장.
- `### 번역|청크|구조|어휘|감각` 5개 서브섹션 = 5블록.
- frontmatter는 `gray-matter`, 본문은 `remark` AST로 파싱 후 정규화.
- `*.learn.md`가 없으면 `unpaired: true` 플래그로 표시, 사이드바에 ⚠️ + 안내 페이지로 이동.

## 8. UI / 페이지 구조

### 8.1 라우트
| 경로 | 역할 |
|---|---|
| `/` | 홈: 카테고리·최근 항목·진도 통계 |
| `/read/[...slug]` | 리더 (예: `/read/news/climate-2026`) |
| `/vocab` | 누적 단어장 |
| `/bookmarks` | 북마크 모음 |

### 8.2 리더 레이아웃
- **데스크톱**: 좌측 사이드바(트리) / 중앙 본문(max-w-3xl) / 우측 TOC(문장 점프)
- **모바일(≤768px)**: 사이드바·TOC 모두 토글 가능한 시트

### 8.3 점진 reveal
```
[Stage 0] 원문만 + ⭐/✓ 버튼 + [▼ 1단계 펼치기]
              ↓
[Stage 1] + 번역 + 청크 + [▼ 2단계 펼치기]
              ↓
[Stage 2] + 구조 + 어휘 + 감각 (전체)
              ↓ [△ 접기]
다시 Stage 0
```

### 8.4 단축키
| 키 | 동작 |
|---|---|
| `j` / `k` | 다음/이전 문장 포커스 |
| `0` / `1` / `2` | 현재 문장 stage 변경 |
| `e` / `c` | 모든 문장 펼치기 / 접기 |
| `b` | 북마크 토글 |
| `space` | 읽음 토글 |
| `?` | 단축키 도움말 모달 |

### 8.5 어휘 인터랙션
- 본문(원문)에서 어휘 블록에 등록된 단어는 **점선 밑줄** + 호버 툴팁으로 짧은 뜻.
- 어휘 블록의 단어 옆 ⭐ → 단어장 누적 저장.

## 9. 컴포넌트 트리

```
app/layout.tsx (RootLayout, ThemeProvider)
└── (reader)/layout.tsx
    ├── <Sidebar>                   # server, 트리 네비
    ├── app/read/[...slug]/page.tsx # SSG, generateStaticParams
    │   ├── <ReaderHeader>
    │   ├── <SentenceList>          # client, 단축키/포커스
    │   │   └── <SentenceCard> × N
    │   │       ├── <SentenceOriginal>
    │   │       ├── <SentenceActions>   # ⭐ ✓
    │   │       └── <RevealStages>
    │   │           ├── <BlockTranslation>
    │   │           ├── <BlockChunks>
    │   │           ├── <BlockStructure>
    │   │           ├── <BlockVocab>
    │   │           └── <BlockNuance>
    │   └── <KeyboardHelp>
    └── <RightTOC>                  # client
```

## 10. 상태 관리

### 10.1 빌드 시점 (server, 정적)
```ts
type Sentence = {
  id: string;             // "news/climate-2026/S1"
  index: number;
  original: string;
  translation: string;
  chunks: { text: string; role?: string }[];
  structure: string[];
  vocab: { word: string; pos?: string; meaning: string; nuance?: string }[];
  nuance: string;
};

type ContentDoc = {
  slug: string[];
  title: string;
  level?: string;
  category: string;
  sentences: Sentence[];
  unpaired?: boolean;
};
```

### 10.2 런타임 (client, localStorage)
Zustand + `persist` 미들웨어, 키 `engreader:user-state:v1`.
```ts
type UserState = {
  read: Record<string, boolean>;            // sentenceId → 읽음
  bookmarked: Record<string, boolean>;
  vocab: Record<string, {
    meaning: string;
    sourceSentenceId: string;
    addedAt: string;
  }>;
};
```
**Reveal 단계는 메모리 only** — 매 세션 fresh하게 시작(능동 학습 의도).

## 11. 디자인 시스템

openbook(`/Users/jeongseongchae/dev/tools/openbook`) 폰트 시스템을 그대로 채택.

| 용도 | 패밀리 |
|---|---|
| 본문 (원문, 한국어 번역/감각) | `Source Serif 4`, `Noto Serif KR`, Georgia |
| UI · 메타 라벨 | `Inter`, `Wanted Sans Variable`, `Pretendard` |
| 청크 · 코드 | `JetBrains Mono` |

색상은 Tailwind slate 기본 + indigo/purple/emerald/amber 액센트, 다크모드(`next-themes`)는 slate-950 배경.

본문 폭 `max-w-3xl` (≈ 768px, 한 줄 ~75자).

## 12. 외부 LLM 프롬프트

`prompts/generate-learn-md.md`에 단일 표준 프롬프트 보관. 사용자는 이를 Claude Code에 붙여넣고 원문 파일을 같이 제공해 `*.learn.md` 결과를 받아 `content/`에 저장한다. 프롬프트 본문은 본 문서의 §7.2 형식과 1:1 일치하는 출력을 강제한다.

## 13. 기술 스택

- **프레임워크**: Next.js 15 (App Router), React 19
- **스타일**: Tailwind CSS, `next-themes`
- **MD 파서**: `gray-matter`, `remark`, `unified`
- **상태**: Zustand + persist
- **테스트**: Vitest + Testing Library, Playwright(E2E 스모크)
- **패키지 매니저**: pnpm
- **배포**: Vercel (정적 SSG)

## 14. 테스트 전략

| 영역 | 도구 | 검증 |
|---|---|---|
| 콘텐츠 파서 | Vitest | 6블록 추출, frontmatter, unpaired 처리 |
| 짝짓기 | Vitest | `*.learn.md` 누락 감지 |
| 컴포넌트 | Vitest + RTL | reveal 전이, 단축키, ⭐/✓ 토글 |
| 영속화 | Vitest | localStorage 직렬화/역직렬화 |
| E2E 스모크 | Playwright | 홈 → 리더 → reveal → 북마크 → 단어장 1바퀴 |
| CI 빌드 | GitHub Actions | `pnpm build` + Vercel preview |

샘플 콘텐츠 1~2건을 `content/samples/`에 포함시켜 CI가 항상 빌드 가능하도록 한다.

## 15. v1 스코프 (확정)

- 사이드바 트리 네비게이션 (서브폴더 카테고리)
- 점진 reveal (Stage 0/1/2)
- 6블록 학습자료 렌더링
- 다크모드, 진도(읽음), 북마크, 단어장
- 키보드 단축키 (j/k/0/1/2/e/c/b/space/?)
- 짝 누락 감지 + 안내 페이지
- LLM 프롬프트 템플릿 `prompts/generate-learn-md.md`
- Vercel 배포 가능 상태

## 16. v2 후보 (Backlog)

사용자 메모, 콘텐츠 검색, TTS 발음, 자동 LLM 호출 스크립트, 모국어 다국어, 진도 통계 대시보드, 모바일 네이티브.

## 17. 위험 / 미정 사항

- **LLM 출력 형식 일탈**: LLM이 §7.2 형식을 어기면 파싱 실패. 대응 — 파서는 관대하게(누락 블록은 빈 배열) + 빌드 경고 출력.
- **콘텐츠 폴더 git 정책**: 사용자 콘텐츠가 저작권 자료일 수 있음. `content/`는 `.gitignore`에 넣고 `content/samples/`만 커밋 권장.
- **모바일 단축키**: 키보드 없는 환경에서 동등 UX 보장 — 버튼 UI가 모든 키 동작을 커버해야 함.

---

## 부록 A — 참고 시안

`mockup/reader.html` — Tailwind CDN 단독 HTML. Stage 0/1/2 카드 동시 표시, 다크모드/단축키/툴팁 동작 확인 가능.

## 부록 B — 분석한 기존 앱

| 앱 | 우리가 차용한 점 |
|---|---|
| LingQ | 단어 클릭 → 누적 단어장 |
| Readlang | 인라인 어휘 표시 |
| Beelinguapp | 이중 언어 매칭 (단, 좌우 분할은 채택 안 함) |
| Satori Reader | 문장 단위 노트 reveal |
| Migaku | 청크/구조 시각화 |

차별점: 위 앱들은 모두 **콘텐츠가 앱에 lock-in**. EngReader는 사용자가 임의 마크다운을 자유롭게 넣고 외부 LLM이 학습자료를 생성하는 **콘텐츠-독립적 뷰어**다.
