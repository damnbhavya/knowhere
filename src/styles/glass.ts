// tailwind v4 strips backdrop-filter in prod builds,
// so we apply it inline as a workaround

export const glassStyles = {
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
} as const;
