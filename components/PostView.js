import { html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { getPostDetails } from 'app/api.js';

export async function PostView({ postId }) {
    const post = await getPostDetails(postId);
    const converter = new showdown.Converter();

    if (!post) {
        return html`<div class="loader">Loading post...</div>`;
    }

    const postBodyHtml = converter.makeHtml(post.description || '');

    return html`
        <div class="post-view-container">
            <h1 class="post-view-title">${post.title}</h1>
            <div class="post-view-author">
                ${post.created_by ? html`By <a href="#/profile/${post.created_by.username}">@${post.created_by.username}</a>` : 'By an unknown user'}
            </div>
            <img class="post-view-image" src="${post.image_url || '/placeholder.png'}" alt="${post.title}">
            <div class="post-view-body">${unsafeHTML(postBodyHtml)}</div>
        </div>
    `;
}

