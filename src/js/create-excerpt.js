import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();

export const createExcerpt = (body) => {
    return parser.render(body.split('<!-- -->')[0], body);
}