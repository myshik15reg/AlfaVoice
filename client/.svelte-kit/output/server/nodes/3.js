

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dictionary/_page.svelte.js')).default;
export const imports = ["app/immutable/nodes/3.B5QjnC36.js"];
export const stylesheets = [];
export const fonts = [];
