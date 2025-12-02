export const typography = {
  display: { size: "text-5xl", leading: "leading-tight", weight: "font-bold" },
  headline: {
    size: "text-4xl",
    leading: "leading-snug",
    weight: "font-semibold",
  },
  title: { size: "text-3xl", leading: "leading-snug", weight: "font-semibold" },
  body: { size: "text-base", leading: "leading-7", weight: "font-normal" },
  caption: { size: "text-sm", leading: "leading-6", weight: "font-normal" },
};

export type TypographyKey = keyof typeof typography;
