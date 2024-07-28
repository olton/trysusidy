import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const news = await getCollection('news');
    return rss({
        title: 'Новини ОСББ Три сусіди 1',
        description: '',
        site: context.site,
        items: news.map((post) => ({
            title: post.data.title,
            pubDate: post.data.date,
            description: post.data.description,
            link: `/news/`,
        })),
    });
}