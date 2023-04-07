export function toJson(data: any) {
  return JSON.parse(
    JSON.stringify(data, (_, v) =>
      typeof v === 'bigint' ? `${v}n` : v
    ).replace(/"(-?\d+)n"/g, (_, a) => a)
  );
}
