import { defineConfig } from 'astro/config';
import mdx from "@astrojs/mdx";
import { readingTime } from "./src/js/reading-time.js";

// https://astro.build/config
export default defineConfig({
    site: 'https://trysusidy.kyiv.ua',
    compressHTML: true,
    markdown: {
        remarkPlugins: [readingTime]
    },
    integrations: [
        mdx(),
    ]
});