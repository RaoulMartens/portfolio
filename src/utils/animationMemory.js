// src/utils/animationMemory.ts
const PREFIX = "anim-played::";
const key = (id) => `${PREFIX}${id}`;
export function hasPlayed(id) {
    if (!id)
        return false;
    try {
        return sessionStorage.getItem(key(id)) === "1";
    }
    catch {
        return false;
    }
}
export function markPlayed(id) {
    if (!id)
        return;
    try {
        sessionStorage.setItem(key(id), "1");
    }
    catch { }
}
// Optional helpers if you ever want to reset
export function resetPlayed(id) {
    if (!id)
        return;
    try {
        sessionStorage.removeItem(key(id));
    }
    catch { }
}
export function clearAllPlayed() {
    try {
        Object.keys(sessionStorage).forEach((k) => {
            if (k.startsWith(PREFIX))
                sessionStorage.removeItem(k);
        });
    }
    catch { }
}
