import { html, render } from 'lit-html';
import { createPost } from 'app/api.js';

export function CreatePost() {
    const container = document.createElement('div');
    let postType = 'blog'; // 'blog' or 'recipe'

    const setPostType = (newType) => {
        postType = newType;
        renderComponent();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const title = formData.get('title');
        const image_url = formData.get('image_url');
        let description;

        if (postType === 'blog') {
            description = formData.get('description');
        } else {
            const ingredients = formData.get('ingredients')?.split('\n').filter(i => i.trim() !== '');
            const instructions = formData.get('instructions')?.split('\n').filter(i => i.trim() !== '');
            
            if (!ingredients || ingredients.length === 0 || !instructions || instructions.length === 0) {
                 alert('Ingredients and instructions are required for a recipe!');
                 return;
            }

            const ingredientsMd = ingredients.map(i => `- ${i.trim()}`).join('\n');
            const instructionsMd = instructions.map((step, index) => `${index + 1}. ${step.trim()}`).join('\n');

            description = `### Ingredients\n\n${ingredientsMd}\n\n### Instructions\n\n${instructionsMd}`;
        }
        
        const postData = { title, description, image_url, type: postType };
        
        if (!title || !description) {
            alert('Title and content are required!');
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

    const renderComponent = () => {
        const template = html`
            <div class="create-post-container">
                <h2>Create a new post</h2>
                
                <div class="post-type-selector">
                    <button class="post-type-button ${postType === 'blog' ? 'active' : ''}" @click=${() => setPostType('blog')}>Blog Post</button>
                    <button class="post-type-button ${postType === 'recipe' ? 'active' : ''}" @click=${() => setPostType('recipe')}>Recipe</button>
                </div>

                <form @submit=${handleSubmit}>
                    <div class="form-group">
                        <label for="title">Title</label>
                        <input type="text" id="title" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="image_url">Cover Image (optional)</label>
                        <div class="image-upload-wrapper">
                            <input type="url" id="image_url" name="image_url" placeholder="Enter URL or upload an image">
                            <input type="file" @change=${handleFileChange} style="display: none;" accept="image/*">
                            <button class="upload-button" @click=${handleUploadClick}>
                                <img src="/upload-icon.png" alt="Upload Icon" />
                                Upload
                            </button>
                        </div>
                    </div>

                    ${postType === 'blog' ? html`
                        <div class="form-group">
                            <label for="description">Content (Markdown supported)</label>
                            <textarea id="description" name="description" rows="15" required></textarea>
                        </div>
                    ` : html`
                        <div class="form-group">
                            <label for="ingredients">Ingredients (one per line)</label>
                            <textarea id="ingredients" name="ingredients" rows="10" placeholder="e.g., 1 cup flour" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="instructions">Instructions (one step per line)</label>
                            <textarea id="instructions" name="instructions" rows="15" placeholder="e.g., Mix all ingredients" required></textarea>
                        </div>
                    `}

                    <button type="submit">Publish Post</button>
                </form>
            </div>
        `;
        render(template, container);
    }
    
    renderComponent();
    return container;
}