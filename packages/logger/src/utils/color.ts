import chalk from "chalk";

export function getContrastColor(hexColor: string): typeof chalk {
    const r = Number.parseInt(hexColor.slice(1, 3), 16);
    const g = Number.parseInt(hexColor.slice(3, 5), 16);
    const b = Number.parseInt(hexColor.slice(5, 7), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? chalk.black : chalk.white;
}

export function blendColors(color1: string, color2: string, ratio = 0.5): string {
    const r1 = Number.parseInt(color1.slice(1, 3), 16);
    const g1 = Number.parseInt(color1.slice(3, 5), 16);
    const b1 = Number.parseInt(color1.slice(5, 7), 16);

    const r2 = Number.parseInt(color2.slice(1, 3), 16);
    const g2 = Number.parseInt(color2.slice(3, 5), 16);
    const b2 = Number.parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
