import { defineCollection, z, reference } from "astro:content"

const authors = defineCollection({
    type: 'data',
    schema: z.object({
        name: z.string(),
        email: z.string(),
        photo: z.string(),
        role: z.string(),
        github: z.string(),
    })
})

const blog = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.date(),
        author: z.string().optional(),
        cover: z.object({
            src: z.string(),
            alt: z.string().default('Alt text')
        }),
        description: z.string().optional(),
        draft: z.boolean().default(false),
        category: z.string().default('general'),
        tags: z.array(z.string()),
        footnote: z.string().optional(),
        sort: z.number().optional(),
        relatedPosts: z.array(reference('blog')).optional(),
    })
})

const news = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.date(),
        important: z.boolean().default(false),
    })
})

const vacancies = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        salary: z.number(),
        important: z.boolean().default(false),
    })
})

const ads = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        price: z.number(),
        urgently: z.boolean().default(false),
        date: z.date(),
        color: z.string().default("normal"),
        contact: z.string().optional(),
        phone: z.string().optional(),
    })
})

const contacts = defineCollection({
    type: 'data',
    schema: z.object({
        name: z.string(),
        phone: z.string(),
        type: z.string(),
        description: z.string().optional(),
    })
})

export const collections = {
    authors,
    blog,
    news,
    vacancies,
    ads,
    contacts,
}