import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import {datetime} from "@olton/datetime";

export async function GET(context) {
    const news = await getCollection('vacancies');
    return rss({
        title: 'Вакансії ОСББ Три сусіди 1',
        description: '',
        site: context.site,
        items: news.map((post) => ({
            title: `${post.data.title}, ${post.data.salary} грн`,
            description: `${post.data.description}. Заробітна плата ${post.data.salary} грн.`,
            pubDate: datetime().format('YYYY-MM-DD'),
            link: `/vacancies/`,
        })),
    });
}