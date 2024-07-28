import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function readingTime() {
    return function (tree, { data }) {
        const textOnPage = toString(tree);
        const readingTime = getReadingTime(textOnPage);
        data.astro.frontmatter.time = `Час читання займе ${Math.ceil(readingTime.minutes)} хвил.`;
    };
}