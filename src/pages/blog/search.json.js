import { getCollection } from "astro:content";
import {filterPosts} from "../../js/utils.js";

async function getPosts(){
    const posts = filterPosts(await getCollection('blog'))
    return posts.map((post) => ({
        slug: post.slug,
        title: post.data.title,
        description: post.data.description,
        date: post.data.date,
        body: post.body,
    }))
}

export async function GET({}){
    return new Response(JSON.stringify(await getPosts()), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
}