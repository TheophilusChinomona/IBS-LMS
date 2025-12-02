export const colors = {
  primary: ["#4F46E5", "#6366F1", "#818CF8"],
  secondary: ["#06B6D4", "#0EA5E9"],
  background: ["#FFFFFF", "#F9FAFB"],
  text: ["#0F172A", "#1E293B"],
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const shadows = {
  subtle: "0 1px 2px rgba(15, 23, 42, 0.08)",
  medium: "0 10px 25px rgba(15, 23, 42, 0.12)",
  large: "0 30px 60px rgba(79, 70, 229, 0.25)",
};

export const motion = {
  spring: {
    gentle: { type: "spring", stiffness: 140, damping: 20 },
    responsive: { type: "spring", stiffness: 200, damping: 26 },
    snappy: { type: "spring", stiffness: 260, damping: 32 },
  },
};

export type SpringToken = keyof typeof motion.spring;
