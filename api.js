const API_BASE = '/api/v1';

export const room = new WebsimSocket();

export async function getCurrentUser() {
    return await window.websim.getCurrentUser();
}

export async function getUser(username) {
    try {
        const res = await fetch(`${API_BASE}/users/${username}`);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        return data.user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    }
}

// --- NEW DB-BASED POST FUNCTIONS ---
export function getDBPosts() {
    return window.room.collection('post_v1').getList().reverse();
}

export function getDBUserPosts(username) {
    return window.room.collection('post_v1').filter({ username }).getList().reverse();
}

export function getDBPostById(postId) {
    const posts = window.room.collection('post_v1').filter({ id: postId }).getList();
    return posts.length > 0 ? posts[0] : null;
}

export async function createPost({ title, content, imageUrl }) {
    try {
        const post = await window.room.collection('post_v1').create({
            title,
            content,
            imageUrl,
        });
        return post;
    } catch (e) {
        console.error("Failed to create post", e);
        return null;
    }
}

// --- Star Currency System using websim records ---

const STARTER_STARS = 100;

export async function getStarBalance(username) {
    if (!username) return 0;
    
    const balances = window.room.collection('star_balance_v1').filter({ username: username }).getList();
    if (balances.length > 0) {
        return balances[0].balance;
    } else {
        // Create initial balance for new user
        await window.room.collection('star_balance_v1').create({
            balance: STARTER_STARS,
            username: username
        });
        return STARTER_STARS;
    }
}

export async function giveStars(fromUsername, toUsername, amount) {
    if (!fromUsername || !toUsername || fromUsername === toUsername || amount <= 0) {
        return { success: false, message: 'Invalid transaction.' };
    }

    const fromBalanceRecord = window.room.collection('star_balance_v1').filter({ username: fromUsername }).getList()[0];
    const toBalanceRecord = window.room.collection('star_balance_v1').filter({ username: toUsername }).getList()[0];

    if (!fromBalanceRecord) {
         return { success: false, message: 'Sender balance not found.' };
    }

    if (fromBalanceRecord.balance < amount) {
        return { success: false, message: 'Not enough stars.' };
    }
    
    await window.room.collection('star_balance_v1').update(fromBalanceRecord.id, { balance: fromBalanceRecord.balance - amount });
    
    if (toBalanceRecord) {
        await window.room.collection('star_balance_v1').update(toBalanceRecord.id, { balance: toBalanceRecord.balance + amount });
    } else {
        // This case should be rare if getStarBalance is called on profile view
        await window.room.collection('star_balance_v1').create({ balance: STARTER_STARS + amount, username: toUsername });
    }
    
    return { success: true, newBalance: fromBalanceRecord.balance - amount };
}