import { useState, useEffect } from 'react';
import { reportMissingItem } from '../../utils/reportMissingItem';

/**
 * XIVAPI v2 Asset API helper
 */
function getXivapiUrl(iconPath: string): string {
    const match = iconPath.match(/\/i\/(\d+)\/(\d+)\.png/);
    if (match) {
        const folder = match[1];
        const fileId = match[2];
        return `${window.location.origin}/xivapi/api/asset?path=ui/icon/${folder}/${fileId}_hr1.tex&format=png`;
    }
    return `${window.location.origin}/xivapi${iconPath}`;
}

/**
 * Cloudinary URL generator (Fallback)
 */
function getCloudinaryUrl(name: string): string {
    const standardized = name.trim().normalize('NFC')
        .replace(/[^\uAC00-\uD7A30-9a-zA-Z]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    return `https://res.cloudinary.com/dlr5fs1pl/image/upload/v1/ff14-items/${encodeURIComponent(standardized)}.png`;
}

interface ItemIconProps {
    nameKo?: string;
    iconPath?: string;
    tarToUrl?: string;
    enableWebhook?: boolean;
    className?: string;
}

/**
 * ItemIcon
 * Design Reference: Cursor Warm Minimalism - Bordered asset with smooth loading
 */
export function ItemIcon({ nameKo, iconPath, tarToUrl, enableWebhook, className }: ItemIconProps) {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        setIsError(false);

        if (iconPath) {
            setImgSrc(getXivapiUrl(iconPath));
        } else if (tarToUrl) {
            setImgSrc(tarToUrl);
        } else if (nameKo) {
            setImgSrc(getCloudinaryUrl(nameKo));
        } else {
            setIsError(true);
        }
    }, [iconPath, tarToUrl, nameKo]);

    const handleError = () => {
        if (nameKo && imgSrc !== getCloudinaryUrl(nameKo)) {
            setImgSrc(getCloudinaryUrl(nameKo));
        } else {
            setIsError(true);
        }
    };

    useEffect(() => {
        if (isError && enableWebhook && nameKo) {
            reportMissingItem(nameKo);
        }
    }, [isError, enableWebhook, nameKo]);

    if (!iconPath && !tarToUrl && !nameKo) return null;

    if (isError) {
        return (
            <div className={`bg-[var(--surface-300)] border border-[var(--border)] opacity-20 ${className}`} />
        );
    }

    if (!imgSrc) return null;

    return (
        <img
            src={imgSrc}
            alt=""
            width={64}
            height={64}
            className={`${className} transition-opacity duration-300`}
            crossOrigin="anonymous"
            onError={handleError}
            loading="lazy"
        />
    );
}
