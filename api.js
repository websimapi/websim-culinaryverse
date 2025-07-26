const API_BASE = '/api/v1';

export async function getCurrentUser() {
    return window.websim.getMe();
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

export async function getFeed() {
    try {
        const res = await fetch(`${API_BASE}/feed/posts?limit=20`);
        const data = await res.json();
        // The endpoint returns comments of type project_post, which is what we want.
        return data.comments.data.map(item => item.comment);
    } catch (error) {
        console.error('Failed to fetch feed:', error);
        return [];
    }
}

export async function getUserPosts(username) {
    try {
        // We get a user's projects and treat them as posts.
        // We only want posted projects for profiles.
        const res = await fetch(`${API_BASE}/users/${username}/projects?posted=true&first=50`);
        const data = await res.json();
        return data.projects.data.map(p => p.project);
    } catch (error) {
        console.error('Failed to fetch user posts:', error);
        return [];
    }
}

export async function getProjectDetails(projectId) {
     try {
        const res = await fetch(`${API_BASE}/projects/${projectId}`);
        const data = await res.json();
        return data.project;
    } catch (error) {
        console.error('Failed to fetch project details:', error);
        return null;
    }
}

// --- Star Currency System using websim.db ---

const STARTER_STARS = 100;

async function getStarKey(userId) {
    return `stars_${userId}`;
}

export async function getStarBalance(userId) {
    if (!userId) return 0;
    const key = await getStarKey(userId);
    let balance = await window.websim.db.get(key);
    if (balance === null) {
        balance = STARTER_STARS;
        await window.websim.db.set(key, balance);
    }
    return parseInt(balance, 10);
}

export async function giveStars(fromUserId, toUserId, amount) {
    if (!fromUserId || !toUserId || fromUserId === toUserId || amount <= 0) {
        return { success: false, message: 'Invalid transaction.' };
    }

    const fromKey = await getStarKey(fromUserId);
    const toKey = await getStarKey(toUserId);

    const fromBalance = await getStarBalance(fromUserId);

    if (fromBalance < amount) {
        return { success: false, message: 'Not enough stars.' };
    }
    
    const toBalance = await getStarBalance(toUserId);

    await window.websim.db.set(fromKey, fromBalance - amount);
    await window.websim.db.set(toKey, toBalance + amount);
    
    return { success: true, newBalance: fromBalance - amount };
}

