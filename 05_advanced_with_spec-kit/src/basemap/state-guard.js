export async function applyWithRollback(currentState, applyFn) {
    try {
        const nextState = await applyFn();
        return { ok: true, state: nextState };
    } catch (error) {
        return {
            ok: false,
            state: currentState,
            error,
        };
    }
}
