// ─── Equipment Parts ──────────────────────────────────────────────────────────

/**
 * Represents the 11 manageable equipment slots in Final Fantasy XIV.
 * Used internally to map state and UI components to their respective parts.
 */
export type EquipmentPart =
    | 'mainhand'
    | 'offhand'
    | 'head'
    | 'body'
    | 'hands'
    | 'legs'
    | 'feet'
    | 'ears'
    | 'neck'
    | 'wrists'
    | 'rings'
    | 'rings2'
    | 'face';

// ─── Item Data ────────────────────────────────────────────────────────────────

/**
 * Represents a single equipped item mapped to a specific slot.
 * Contains both localization data for display and configuration data for the preview canvas.
 */
export interface EquipItem {
    /** The specific equipment slot this item occupies (e.g., 'head') */
    id: EquipmentPart;
    /** The localized UI label for the slot (e.g., "머리", "몸통") */
    label: string;
    /** The user-provided or matched Korean name of the item */
    name: string;
    /** XIVAPI icon path (e.g. '/i/065000/060128.png') — used to build the direct image URL */
    iconPath?: string;
    
    // Localization & Metadata
    nameKo?: string;
    nameEn?: string;
    nameJa?: string;
    
    // Customization
    dye1?: string;
    dye2?: string;
    
    // UI State
    error?: string;
}

export interface FashionAccessorySelection {
    id: number;
    nameKo: string;
    nameEn: string;
    nameJa: string;
    iconPath?: string;
}

// ─── App State ────────────────────────────────────────────────────────────────

/**
 * The global application state object.
 * Manages the user's current character snapshot, customized equipment, and metadata.
 */
export interface AppState {
    /** The base64 or URL of the user's uploaded character screenshot */
    imageSrc: string | null;
    /** The final cropped character image for the canvas */
    croppedImageSrc: string | null;
    /** The specific x/y crop coordinates applied to the user's image */
    crop: { x: number; y: number };
    /** The zoom level applied during the cropping phase */
    zoom: number;
    /** A dictionary recording the user's item choices across all equipment slots */
    items: Record<EquipmentPart, EquipItem>;
    /** Optional cosmetic accessory equipped outside the normal gear slots. */
    fashionAccessory: FashionAccessorySelection | null;
    /** The user-defined title of the glamour set (e.g., "Casual Wear") */
    title: string;
    /** The creator's handle to serve as a watermark (e.g., "@twitter") */
    creator: string;
}

// ─── FF14 Dye Database ────────────────────────────────────────────────────────
// Definition moved to src/constants/dyes.ts
export interface FF14Dye {
    name: string;
    nameEn?: string;
    nameJa?: string;
    hex: string;
}
