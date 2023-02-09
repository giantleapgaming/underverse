export const colorString = ({ name, color }: { name?: string; color: string }) =>
  `<span style="color:${color};font-weight:bold">${name || "Name"}</span>`;
