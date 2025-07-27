import { html, render } from 'lit-html';
import { getCurrentUser, giveStars, getUser } from 'app/api.js';
import { refreshHeaderBalance } from 'app/components/Header.js';

const navigateToPost = (postId) => {
    window.location.hash = `/post/${postId}`;
};

const TipModal = (authorUsername) => {
    let amount = 1;

    const close = () => document.body.removeChild(document.querySelector('.modal-overlay'));

    const handleTip = async (e) => {
        e.stopPropagation();
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            alert('You must be logged in to tip!');
            return;
        }
        
        const result = await giveStars(currentUser.username, authorUsername, amount);
        if (result.success) {
            alert(`You tipped @${authorUsername} ${amount} star(s)!`);
            window.dispatchEvent(new CustomEvent('stars-updated'));
            close();
        } else {
            alert(`Failed to tip: ${result.message}`);
        }
    };
    
    const onInput = (e) => {
        amount = parseInt(e.target.value, 10) || 0;
    };

    const modal = html`
        <div class="modal-overlay" @click=${close}>
            <div class="modal-content" @click=${e => e.stopPropagation()}>
                <h3>Tip @${authorUsername}</h3>
                <p>Show your appreciation by tipping some stars!</p>
                <input type="number" min="1" value="1" @input=${onInput}>
                <div class="tip-actions">
                    <button @click=${handleTip}>Send Tip</button>
                    <button @click=${close} style="background-color: #aaa;">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    const container = document.createElement('div');
    document.body.appendChild(container);
    render(modal, container);
};

const handleTipClick = (e, authorUsername) => {
    e.stopPropagation();
    TipModal(authorUsername);
};

export function PostCard(post, isCompact = false) {
    if (!post) return '';

    const authorTemplate = html`
        <a href="#/profile/${post.username}" @click=${e => e.stopPropagation()}>
            <div class="post-card-author">
                <img class="user-avatar" src="${`https://images.websim.com/avatar/${post.username}`}" alt="${post.username}">
                <strong>@${post.username}</strong>
            </div>
        </a>
    `;

    return html`
        <div class="post-card" @click=${() => navigateToPost(post.id)}>
            ${!isCompact ? authorTemplate : ''}
            ${post.imageUrl ? html`<img class="post-card-image" src="${post.imageUrl}" alt="${post.title}">` : ''}
            <div class="post-card-content">
                <h2>${post.title || 'Untitled Post'}</h2>
                <p>${post.content?.substring(0, 100) || ''}${post.content?.length > 100 ? '...' : ''}</p>
                 <button @click=${(e) => handleTipClick(e, post.username)}>Tip Stars</button>
            </div>
        </div>
    `;
}

