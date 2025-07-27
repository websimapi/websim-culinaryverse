import { html, render } from 'lit-html';
import { getUser, getDBUserPosts, getStarBalance, getCurrentUser } from 'app/api.js';
import { PostCard } from 'app/components/Post.js';

let profileUser = null;
let posts = [];
let starBalance = 0;

async function fetchData(username) {
    profileUser = await getUser(username);
    if (profileUser) {
        posts = getDBUserPosts(username);
        starBalance = await getStarBalance(username);
    }
}

function renderProfile(container, username) {
    if (!profileUser) {
        render(html`<div class="loader">User not found.</div>`, container);
        return;
    }
    
    const template = html`
        <div class="profile-container">
            <div class="profile-header">
                <img class="user-avatar" src="${`https://images.websim.com/avatar/${profileUser.username}`}" alt="${profileUser.username}">
                <div class="profile-info">
                    <h1>${profileUser.username}</h1>
                    <div class="profile-stats">
                        <span><strong>${posts.length}</strong> Posts</span>
                        <div class="star-balance">
                            <img src="/star-icon.png" alt="Star" class="star-icon">
                            <span>${starBalance} Stars</span>
                        </div>
                    </div>
                </div>
            </div>
            <h2>Posts</h2>
            <div class="profile-posts-grid">
                ${posts.length > 0 ? posts.map(post => PostCard(post, true)) : html`<p>This user hasn't posted anything yet.</p>`}
            </div>
        </div>
    `;
    render(template, container);
}

export function Profile({ username }) {
    const container = document.createElement('div');

    const handleUpdate = (dbPosts) => {
        posts = dbPosts.filter(p => p.username === username).reverse();
        renderProfile(container, username);
    };

    const unsubscribe = window.room.collection('post_v1').subscribe(handleUpdate);
    const observer = new MutationObserver(() => {
        if (!document.body.contains(container)) {
            unsubscribe();
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    fetchData(username).then(() => {
        renderProfile(container, username);
    });

    return container;
}

