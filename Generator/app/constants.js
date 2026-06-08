export const ARCHITECTURE = {
    FLOOR_HEIGHTS: {
        BASE: 3.5,
        STANDARD: 3.2,
        COMMERCIAL: 4.0,
        PENTHOUSE: 3.8
    },

    MATERIALS: {
        CONCRETE: { color: 0xC0C0C0, roughness: 0.8, metalness: 0.1 },
        GLASS: { color: 0x88CCFF, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.6 },
        BRICK: { color: 0xB87333, roughness: 0.9, metalness: 0.0 },
        STEEL: { color: 0x888888, roughness: 0.3, metalness: 0.8 },
        WOOD: { color: 0x8B4513, roughness: 0.7, metalness: 0.1 },
        MARBLE: { color: 0xE8E8E8, roughness: 0.2, metalness: 0.3 },
        GRANITE: { color: 0x696969, roughness: 0.6, metalness: 0.2 }
    },

    WINDOW_TYPES: {
        OFFICE: { width: 1.8, height: 1.2 },
        RESIDENTIAL: { width: 1.5, height: 1.5 },
        PANORAMIC: { width: 3.0, height: 2.0 },
        SMALL: { width: 0.8, height: 1.2 }
    }
};

export const MathUtils = {
    randomFloat: (min, max) => Math.random() * (max - min) + min,
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
};
