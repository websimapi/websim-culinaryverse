import { html, render } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { getDBPostById } from 'app/api.js';

function renderPost(container, postId) {
    const post = getDBPostById(postId);
    const converter = new showdown.Converter();
    
    let template;

    if (!post) {
        template = html`<div class="loader">Loading post...</div>`;
    } else {
        const postBodyHtml = converter.makeHtml(post.content || '');
        template = html`
            <div class="post-view-container">
                <h1 class="post-view-title">${post.title}</h1>
                <div class="post-view-author">
                    By <a href="#/profile/${post.username}">@${post.username}</a>
                </div>
                ${post.imageUrl ? html`<img class="post-view-image" src="${post.imageUrl}" alt="${post.title}">` : ''}
                <div class="post-view-body">${unsafeHTML(postBodyHtml)}</div>
            </div>
        `;
    }
    render(template, container);
}


export function PostView({ postId }) {
    const container = document.createElement('div');

    const unsubscribe = window.room.collection('post_v1').subscribe(() => {
        renderPost(container, postId);
    });

    const observer = new MutationObserver(() => {
        if (!document.body.contains(container)) {
            unsubscribe();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    renderPost(container, postId);

    return container;
}

