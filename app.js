import { render } from 'lit-html';
import { Router } from 'app/lib/router.js';
import { Header } from 'app/components/Header.js';
import { Feed } from 'app/components/Feed.js';
import { Profile } from 'app/components/Profile.js';
import { PostView } from 'app/components/PostView.js';
import { CreatePost } from 'app/components/CreatePost.js';

const appEl = document.getElementById('app');
const mainEl = document.createElement('main');

const routes = {
    '/': Feed,
    '/profile/:username': Profile,
    '/post/:postId': PostView,
    '/create': CreatePost,
};

const router = new Router(routes);

async function renderContent() {
    const path = location.hash.slice(1) || '/';
    const { component, params } = router.match(path);
    if (component) {
        render(await component(params), mainEl);
    } else {
        render(Feed(), mainEl); // Fallback to feed
    }
}

async function init() {
    render(await Header(), appEl);

