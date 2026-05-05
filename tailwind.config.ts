import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Source Serif 4"', '"Noto Serif KR"', 'Georgia', '"Iowan Old Style"', 'serif'],
        sans: ['Inter', '"Wanted Sans Variable"', 'Pretendard', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['"D2Coding"', '"JetBrains Mono"', 'ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
      },
      maxWidth: { prose: '48rem' },
    },
  },
  plugins: [],
};
export default config;
