import { WebsimSocket } from '@websim/websim-socket';

const room = new WebsimSocket();

const API_BASE = '/api/v1';

export async function getCurrentUser() {
    return window.websim.getUser();
}

export async function getUser(username) {
    try {
        const res = await fetch(`/api/v1/users/${username}`);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        return data.user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    }
}

export async function getFeed() {
    try {
        const postsWithAuthors = await room.query(`
            SELECT p.id, p.title, p.description, p.image_url, p.created_at, p.user_id, u.username, u.avatar_url
            FROM public.posts_v1 p
            JOIN public.user u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT 20
        `);
        
        return postsWithAuthors.map(p => ({
            post: {
                id: p.id,
                title: p.title,
                description: p.description,
                image_url: p.image_url,
            },
            author: { id: p.user_id, username: p.username, avatar_url: p.avatar_url }
        }));
    } catch (error) {
        console.error('Failed to fetch feed:', error);
        return [];
    }
}

export async function getUserPosts(username) {
    try {
        const user = await getUser(username);
        if (!user) return [];

        const posts = await room.collection('posts_v1').filter({ user_id: user.id }).getList();
        return posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (error) {
        console.error('Failed to fetch user posts:', error);
        return [];
    }
}

export async function getPostDetails(postId) {
     try {
        const results = await room.query(`
            SELECT p.id, p.title, p.description, p.image_url, p.created_at, p.user_id, u.username, u.avatar_url
            FROM public.posts_v1 p
            JOIN public.user u ON p.user_id = u.id
            WHERE p.id = $1
        `, [postId]);
        
        if (results.length > 0) {
            const p = results[0];
            return {
                id: p.id,
                title: p.title,
                description: p.description,
                image_url: p.image_url,
                created_by: { id: p.user_id, username: p.username, avatar_url: p.avatar_url }
            };
        }
        return null;
    } catch (error) {
        console.error('Failed to fetch post details:', error);
        return null;
    }
}

export async function createPost(postData) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("User not logged in");
        
        const post = await room.collection('posts_v1').create({
            title: postData.title,
            description: postData.description,
            image_url: postData.image_url,
        });
        return post;
    } catch(error) {
        console.error("Failed to create post:", error);
        return null;
    }
}

// --- Star Currency System using websim database ---

const STARTER_STARS = 100;

async function ensureUserBalance(userId) {
    const existing = await room.collection('star_balances_v1').get(userId).catch(() => null);
    if (!existing) {
        await room.collection('star_balances_v1').upsert({
            id: userId,
            balance: STARTER_STARS
        });
    }
}

export async function getStarBalance(userId) {
    if (!userId) return 0;
    
    await ensureUserBalance(userId);
    const balanceRecord = await room.collection('star_balances_v1').get(userId);
    return balanceRecord.balance;
}

export async function giveStars(fromUserId, toUserId, amount) {
    if (!fromUserId || !toUserId || fromUserId === toUserId || amount <= 0) {
        return { success: false, message: 'Invalid transaction.' };
    }

    await ensureUserBalance(fromUserId);
    await ensureUserBalance(toUserId);

    const fromBalanceRecord = await room.collection('star_balances_v1').get(fromUserId);

    if (fromBalanceRecord.balance < amount) {
        return { success: false, message: 'Not enough stars.' };
    }
    
    const toBalanceRecord = await room.collection('star_balances_v1').get(toUserId);

    await room.collection('star_balances_v1').upsert({
        id: fromUserId,
        balance: fromBalanceRecord.balance - amount,
    });
    
    await room.collection('star_balances_v1').upsert({
        id: toUserId,
        balance: toBalanceRecord.balance + amount,
    });
    
    return { success: true, newBalance: fromBalanceRecord.balance - amount };
}