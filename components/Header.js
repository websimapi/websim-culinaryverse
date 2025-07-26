import { html, render } from 'lit-html';
import { getCurrentUser, getStarBalance } from 'app/api.js';

let currentUser = null;
let starBalance = 0;

async function updateBalance() {
    if (currentUser) {
        starBalance = await getStarBalance(currentUser.id);
        const headerEl = document.querySelector('.header');
        if (headerEl) {
           render(HeaderTemplate(), headerEl);
        }
    }
}

// Public function to be called after a tip
export function refreshHeaderBalance() {
    updateBalance();
}

const HeaderTemplate = () => html`
    <a href="#/" class="header-logo">CulinaryVerse</a>
    <nav class="header-nav">
        <a href="#/">Home</a>
        ${currentUser ? html`<a href="#/profile/${currentUser.username}">My Profile</a>` : ''}
    </nav>
    <div class="user-info">
        ${currentUser ? html`
            <div class="star-balance">
                <img src="/star-icon.png" alt="Star" class="star-icon">
                <span>${starBalance}</span>
            </div>
            <a href="#/profile/${currentUser.username}">
                <img class="user-avatar" src="${currentUser.avatar_url || `https://images.websim.com/avatar/${currentUser.username}`}" alt="${currentUser.username}">
                <span>@${currentUser.username}</span>
            </a>
        ` : html`
            <span>Loading...</span>
        `}
    </div>
`;

export async function Header() {
    const headerEl = document.createElement('header');
    headerEl.className = 'header';
    
    currentUser = await getCurrentUser();
    await updateBalance();
    
    render(HeaderTemplate(), headerEl);
    
    // Listen for custom event to refresh balance
    window.addEventListener('stars-updated', updateBalance);

    return headerEl;
}

