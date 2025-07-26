import { html } from 'lit-html';
import { getProjectDetails } from 'app/api.js';

export async function PostView({ projectId }) {
    const post = await getProjectDetails(projectId);
    const converter = new showdown.Converter();

    if (!post) {
        return html`<div class="loader">Loading post...</div>`;
    }

    const postBodyHtml = converter.makeHtml(post.description || '');

    return html`
        <div class="post-view-container">
            <h1 class="post-view-title">${post.title}</h1>
            <div class="post-view-author">
                By <a href="#/profile/${post.created_by.username}">@${post.created_by.username}</a>
            </div>
            <img class="post-view-image" src="${post.thumbnail?.url || 'https://images.websim.com/v1/project/' + post.id + '/thumbnail/600'}" alt="${post.title}">
            <div class="post-view-body">${html([postBodyHtml])}</div>
        </div>
    `;
}

