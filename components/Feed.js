import { html } from 'lit-html';
import { getFeed } from 'app/api.js';
import { PostCard } from 'app/components/Post.js';

export async function Feed() {
    const posts = await getFeed();
    
    if (!posts || posts.length === 0) {
        return html`<div class="loader">No posts in the feed yet. Go create something!</div>`;
    }

    return html`
        <div class="feed-container">
            ${posts.map(post => PostCard(post.card_data.project, post.author))}
        </div>
    `;
}

