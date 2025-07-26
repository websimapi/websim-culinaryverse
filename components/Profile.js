import { html } from 'lit-html';
import { getUser, getUserPosts, getStarBalance } from 'app/api.js';
import { PostCard } from 'app/components/Post.js';

export async function Profile({ username }) {
    const user = await getUser(username);
    
    if (!user) {
        return html`<div class="loader">User not found.</div>`;
    }

    const posts = await getUserPosts(username);
    const starBalance = await getStarBalance(user.id);

    return html`
        <div class="profile-container">
            <div class="profile-header">
                <img class="user-avatar" src="${user.avatar_url || `https://images.websim.com/avatar/${user.username}`}" alt="${user.username}">
                <div class="profile-info">
                    <h1>${user.username}</h1>
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
                ${posts.length > 0 ? posts.map(post => PostCard(post, user, true)) : html`<p>This user hasn't posted anything yet.</p>`}
            </div>
        </div>
    `;
}

