// Utility functions can be added here
export const cn = (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ');
};
