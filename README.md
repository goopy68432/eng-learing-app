# EngReader

한국어 초중급(CEFR A2~B1) 학습자를 위한 영문 마크다운 리딩 학습 뷰어.

`content/` 폴더에 영문 원문(`*.md`)과 외부 LLM이 생성한 학습자료(`*.learn.md`)를 짝지어 두면, 문장 단위 점진 reveal로 학습할 수 있는 정적 사이트를 빌드합니다.

## 상태

🚧 **설계 단계**. 구현 전.

- 설계문서: [`docs/superpowers/specs/2026-05-05-engreader-design.md`](docs/superpowers/specs/2026-05-05-engreader-design.md)
- 시안: [`mockup/reader.html`](mockup/reader.html) (브라우저로 직접 열기)
- LLM 프롬프트: [`prompts/generate-learn-md.md`](prompts/generate-learn-md.md)

## 워크플로우 (예정)

1. `prompts/generate-learn-md.md`를 Claude Code 등에 적용해 `foo.md` → `foo.learn.md` 생성
2. `content/<카테고리>/`에 두 파일을 함께 저장
3. `pnpm dev` 또는 `pnpm build`로 사이트 실행/빌드
4. 사이드바에서 콘텐츠 선택 → 문장 단위 학습

## 라이선스

TBD
