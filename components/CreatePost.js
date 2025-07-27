import { html, render } from 'lit-html';
import { createPost, getCurrentUser } from 'app/api.js';

let imageUrl = '';
let isUploading = false;
let uploadError = '';
let isSubmitting = false;

function renderForm(container) {
    const template = html`
        <form class="create-post-form" @submit=${handleSubmit}>
            <h1>Create a New Post</h1>
            
            <div class="form-group">
                <label for="title">Title</label>
                <input type="text" id="title" name="title" required>
            </div>

            <div class="form-group">
                <label for="content">Content (Markdown supported)</label>
                <textarea id="content" name="content" required></textarea>
            </div>

            <div class="form-group">
                <label for="image">Cover Image</label>
                <input type="file" id="image" name="image" @change=${handleImageUpload} accept="image/*">
                ${isUploading ? html`<p>Uploading...</p>` : ''}
                ${uploadError ? html`<p style="color:red;">${uploadError}</p>` : ''}
                ${imageUrl ? html`<img src="${imageUrl}" class="image-preview" alt="Image preview">` : ''}
            </div>

            <button type="submit" .disabled=${isSubmitting}>
                ${isSubmitting ? 'Publishing...' : 'Publish Post'}
            </button>
        </form>
    `;
    render(template, container);
}

async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const container = e.target.closest('.create-post-form').parentElement;
    isUploading = true;
    uploadError = '';
    renderForm(container);

    try {
        imageUrl = await window.websim.upload(file);
    } catch (error) {
        console.error('Error uploading file:', error);
        uploadError = 'Image upload failed. Please try again.';
        imageUrl = '';
    } finally {
        isUploading = false;
        renderForm(container);
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const title = formData.get('title');
    const content = formData.get('content');
    
    const container = e.target.closest('.create-post-form').parentElement;
    isSubmitting = true;
    renderForm(container);

    const post = await createPost({ title, content, imageUrl });

    isSubmitting = false;
    renderForm(container);

    if (post) {
        window.location.hash = `#/post/${post.id}`;
    } else {
        alert('Failed to create post. Please try again.');
    }
}

export function CreatePost() {
    const container = document.createElement('div');
    
    // Reset state for new form display
    imageUrl = '';
    isUploading = false;
    uploadError = '';
    isSubmitting = false;

    getCurrentUser().then(user => {
        if (!user) {
            window.location.hash = '#/'; // Redirect if not logged in
            return;
        }
        renderForm(container);
    });

    return container;
}