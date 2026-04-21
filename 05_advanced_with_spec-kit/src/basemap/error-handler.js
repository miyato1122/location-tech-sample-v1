export function notifyBasemapError(message) {
    const id = 'basemap-error-message';
    let node = document.getElementById(id);
    if (!node) {
        node = document.createElement('div');
        node.id = id;
        node.className = 'basemap-error-message';
        document.body.appendChild(node);
    }
    node.textContent = message;
    window.setTimeout(() => {
        if (node) {
            node.textContent = '';
        }
    }, 3000);
}

export function logBasemapError(error, context = '') {
    const suffix = context ? ` (${context})` : '';
    console.error(`Basemap update failed${suffix}`, error);
}
