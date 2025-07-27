import { html } from 'lit-html';
import { createPost } from 'app/api.js';

export function CreatePost() {

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const title = formData.get('title');
        const description = formData.get('description');
        const image_url = formData.get('image_url');
        
        const postData = { title, description, image_url };
        
        if (!title || !description) {
            alert('Title and description are required!');
            return;
        }
        
        const publishButton = form.querySelector('button[type="submit"]');
        publishButton.disabled = true;
        publishButton.textContent = 'Publishing...';

        const newPost = await createPost(postData);

        if (newPost) {
            window.location.hash = `/post/${newPost.id}`;
        } else {
            alert('Failed to create post. Please try again.');
            publishButton.disabled = false;
            publishButton.textContent = 'Publish Post';
        }
    };

    const handleUploadClick = (e) => {
        e.preventDefault();
        // The file input is inside the same wrapper, but hidden.
        const fileInput = e.currentTarget.previousElementSibling;
        fileInput.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadButton = e.currentTarget.nextElementSibling;
        const imageUrlInput = document.getElementById('image_url');
        
        const originalButtonContent = uploadButton.innerHTML;
        uploadButton.disabled = true;
        uploadButton.innerHTML = 'Uploading...';

        try {
            const url = await window.websim.upload(file);
            imageUrlInput.value = url;
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload image. Please try again or enter a URL manually.');
        } finally {
            uploadButton.disabled = false;
            uploadButton.innerHTML = originalButtonContent;
        }
    };

    return html`
        <div class="create-post-container">
            <h2>Create a new post</h2>
            <form @submit=${handleSubmit}>
                <div class="form-group">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="image_url">Image URL (optional)</label>
                    <div class="image-upload-wrapper">
                        <input type="url" id="image_url" name="image_url" placeholder="Enter URL or upload an image">
                        <input type="file" @change=${handleFileChange} style="display: none;" accept="image/*">
                        <button class="upload-button" @click=${handleUploadClick}>
                            <img src="/upload-icon.png" alt="Upload Icon" />
                            Upload
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="description">Content (Markdown supported)</label>
                    <textarea id="description" name="description" rows="15" required></textarea>
                </div>
                <button type="submit">Publish Post</button>
            </form>
        </div>
    `;
}