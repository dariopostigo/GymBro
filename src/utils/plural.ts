/** "1 artículo", "3 artículos": el número con la palabra en singular o en plural. */
export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}
