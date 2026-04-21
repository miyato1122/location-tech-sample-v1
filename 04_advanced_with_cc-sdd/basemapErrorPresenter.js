/**
 * 背景地図の失敗/回復メッセージ表示を担当するプレゼンター
 */

/**
 * @param {{ subscribe: (listener: () => void) => () => void, getState: () => { hasError: boolean, message: string | null } }} channel
 * @param {{ textContent: string, style: { display: string } }} errorElement
 * @returns {() => void} unsubscribe
 */
export function bindBasemapErrorPresenter(channel, errorElement) {
    const render = () => {
        const state = channel.getState();
        if (state.hasError) {
            errorElement.textContent = state.message || '背景地図を表示できませんでした';
            errorElement.style.display = 'block';
            return;
        }
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    };

    render();
    return channel.subscribe(render);
}
