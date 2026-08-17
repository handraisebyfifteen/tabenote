import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // ワークスペース直下のシステムフォルダ(.config 等)を誤って拾わないよう、src 内に限定する
    include: ['src/**/*.test.ts'],
  },
});
