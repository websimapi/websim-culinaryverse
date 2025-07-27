import { html, render } from 'lit-html';
import { createPost } from 'app/api.js';

export function CreatePost() {
    const container = document.createElement('div');
    let postType = 'blog'; // 'blog' or 'recipe'
    let ingredients = [''];
    let instructions = [''];

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
            const finalIngredients = ingredients.map(i => i.trim()).filter(i => i !== '');
            const finalInstructions = instructions.map(i => i.trim()).filter(i => i !== '');
            
            if (finalIngredients.length === 0 || finalInstructions.length === 0) {
                 alert('Ingredients and instructions are required for a recipe!');
                 return;
            }

            const ingredientsMd = finalIngredients.map(i => `- ${i}`).join('\n');
            const instructionsMd = finalInstructions.map((step, index) => `${index + 1}. ${step}`).join('\n');

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

    // --- Dynamic List Handlers ---
    const updateListItem = (list, index, value) => {
        list[index] = value;
    };

    const addListItem = (list, index) => {
        list.splice(index + 1, 0, '');
        renderComponent();
    };

    const removeListItem = (list, index) => {
        if (list.length > 1) {
            list.splice(index, 1);
        } else {
            list[index] = ''; // Clear if it's the last one
        }
        renderComponent();
    };

    const handleKeyDown = (e, list, index) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addListItem(list, index);
            
            // Focus new element - needs a small delay for DOM to update
            setTimeout(() => {
                const nextInput = e.target.closest('.list-item-input').nextElementSibling?.querySelector('input');
                nextInput?.focus();
            }, 0);
        }
    };

    const renderListComponent = (list, listName, placeholder, isOrdered) => html`
        <div class="form-group">
            <label>${listName.charAt(0).toUpperCase() + listName.slice(1)}</label>
            <div id="${listName}-list">
                ${list.map((item, index) => html`
                    <div class="list-item-input">
                        <span>${isOrdered ? `${index + 1}.` : '-'}</span>
                        <input
                            type="text"
                            .value=${item}
                            placeholder=${placeholder}
                            @input=${e => updateListItem(list, index, e.target.value)}
                            @keydown=${e => handleKeyDown(e, list, index)}
                        >
                        <button type="button" class="remove-item-btn" @click=${() => removeListItem(list, index)} title="Remove item">×</button>
                    </div>
                `)}
            </div>
            <button type="button" class="add-item-btn" @click=${() => addListItem(list, list.length - 1)}>+ Add ${listName.slice(0, -1)}</button>
        </div>
    `;


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
                        ${renderListComponent(ingredients, 'ingredients', 'e.g., 1 cup flour', false)}
                        ${renderListComponent(instructions, 'instructions', 'e.g., Mix all ingredients', true)}
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