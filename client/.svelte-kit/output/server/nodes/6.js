

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/settings/_page.svelte.js')).default;
export const imports = ["app/immutable/nodes/6.C7ylMSfm.js"];
export const stylesheets = [];
export const fonts = [];
