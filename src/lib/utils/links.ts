/** Detail pages use a query parameter so every package works with a static export. */
export function appDetailHref(packageName: string, hash?: string): string {
  const base = `/app/?p=${encodeURIComponent(packageName)}`;
  return hash ? `${base}#${hash}` : base;
}
