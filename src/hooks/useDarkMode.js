// src/hooks/useDarkMode.tsx
import { useState, useEffect } from 'react';
export const useDarkMode = () => {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark';
        }
        return false;
    });
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            document.body.classList.add('dark');
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        else {
            document.body.classList.remove('dark');
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);
    const toggleDarkMode = () => {
        setIsDark(prev => !prev);
    };
    return { isDark, toggleDarkMode };
};
