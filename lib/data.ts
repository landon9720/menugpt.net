export function colors(): string[] {
    return [
        "green",
        "yellow",
        "blue",
        "purple",
        "pink",
        "orange",
        "lavender",
        "puce",
    ];
}

export const database: { [id: string]: { prompt: string; body: string } } = {
    "1": {
        prompt: "ancient rome",
        body: "Ancient Rome was a kingdom, then a republic, then an empire, and then history.",
    },
};
