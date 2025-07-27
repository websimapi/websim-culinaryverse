import { html, render } from 'lit-html';
import { getDBPosts } from 'app/api.js';
import { PostCard } from 'app/components/Post.js';

let posts = [];

function renderFeed(container) {
    const template = html`
        <div class="feed-container">
            ${posts.length > 0
                ? posts.map(post => PostCard(post))
                : html`<div class="loader">No posts in the feed yet. Go create something!</div>`
            }
        </div>
    `;
    render(template, container);
}

export function Feed() {
    const container = document.createElement('div');

    const unsubscribe = window.room.collection('post_v1').subscribe(newPosts => {
        posts = newPosts.reverse();
        renderFeed(container);
    });

    // Cleanup subscription when navigating away
    // A bit of a hack for this simple router
    const observer = new MutationObserver((mutations) => {
        if (!document.body.contains(container)) {
            unsubscribe();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    posts = window.room.collection('post_v1').getList().reverse();
    renderFeed(container);

    return container;
}