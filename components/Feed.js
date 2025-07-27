import { html } from 'lit-html';
import { getFeed } from 'app/api.js';
import { PostCard } from 'app/components/Post.js';

export async function Feed() {
    const feedItems = await getFeed();
    
    if (!feedItems || feedItems.length === 0) {
        return html`<div class="loader">No posts in the feed yet. Go create something!</div>`;
    }

    return html`
        <div class="feed-container">
            ${feedItems.map(item => PostCard(item.post, item.author))}
        </div>
    `;
}

