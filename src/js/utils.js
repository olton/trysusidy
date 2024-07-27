export function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}

export function sortDate (a, b) {
    return Date.parse(b.frontmatter.date) - Date.parse(a.frontmatter.date)
}

export function buildToc(headings) {
    if (!headings) return []
    const toc = [];
    const parentHeadings = new Map();
    headings.forEach((h) => {
        const heading = { ...h, subheadings: [] };
        parentHeadings.set(heading.depth, heading);
        // Change 2 to 1 if your markdown includes your <h1>
        if (heading.depth === 2) {
            toc.push(heading);
        } else {
            parentHeadings.get(heading.depth - 1) && parentHeadings.get(heading.depth - 1).subheadings.push(heading);
        }
    });
    return toc;
}

export function shuffleArray(a){
    const c = a.slice(0)
    let current = c.length, temp, rand
    while (current !== 0) {
        rand = Math.floor(Math.random() * current);
        current -= 1;
        temp = c[current];
        c[current] = c[rand];
        c[rand] = temp;
    }
    return c
}

export function tagsWeight(posts){
    const weight = {}, tags = []
    posts.map( p => {
        p.data.tags.forEach(tag => {
            const tagName = tag.toUpperCase()
            weight[tagName] = weight[tagName] ? weight[tagName] + 1 : 1;
        });
    })
    for(let tag in weight) {
        tags.push({ name: tag, weight: weight[tag] });
    }
    return tags
}

export function filterPosts(posts, {
    filterOutDrafts = true,
    filterOutFuturePosts = true,
    sortByDate = true,
    limit = undefined
} = {}){
    const filteredPosts = posts.reduce((acc, post) => {
        const {draft, date} = post.data

        if (filterOutDrafts && draft) { return acc }
        if (filterOutFuturePosts && date > new Date()) { return acc }

        acc.push(post)

        return acc
    }, [])

    if (sortByDate) {
        filteredPosts.sort((a, b) => b.data.date - a.data.date)
    } else {
        filteredPosts.sort((a, b) => b.data.sort - a.data.sort)
    }

    if (typeof limit === "number" && limit > 0) {
        return filteredPosts.slice(0, limit)
    }

    return filteredPosts
}
