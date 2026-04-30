import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sjsu: {
          blue: '#0055A2',
          'blue-dark': '#004A8C',
          'blue-muted': '#EBF2FA',
          gold: '#E5A823',
          'gold-light': '#F7D15D',
          gray: '#939597',
        },
      },
    },
  },
  plugins: [],
};

export default config;
