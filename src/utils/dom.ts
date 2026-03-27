export const $ = (sel: string, ctx: Document | HTMLElement = document) => ctx.querySelector(sel);
export const $$ = (sel: string, ctx: Document | HTMLElement = document) =>
  ctx.querySelectorAll(sel);
