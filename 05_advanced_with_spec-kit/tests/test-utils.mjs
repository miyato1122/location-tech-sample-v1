export function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

export async function runCases(title, cases) {
    for (const item of cases) {
        await item.test();
    }
    console.log(`PASS: ${title} (${cases.length} cases)`);
}
