import { BASEMAP_LABELS } from '../basemap/attribution-rules.js';

export function mountBasemapSwitcher(container, activeBasemap, onChange) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'basemap-switcher-panel';

    const title = document.createElement('div');
    title.className = 'basemap-switcher-title';
    title.textContent = '背景地図';
    wrapper.appendChild(title);

    Object.entries(BASEMAP_LABELS).forEach(([value, label]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'basemap-switcher-button';
        button.dataset.basemap = value;
        button.textContent = label;
        if (value === activeBasemap) {
            button.classList.add('is-active');
        }
        button.addEventListener('click', () => onChange(value));
        wrapper.appendChild(button);
    });

    container.appendChild(wrapper);
}

export function setActiveBasemapButton(container, basemapType) {
    const buttons = container.querySelectorAll('.basemap-switcher-button');
    buttons.forEach((button) => {
        button.classList.toggle('is-active', button.dataset.basemap === basemapType);
    });
}
