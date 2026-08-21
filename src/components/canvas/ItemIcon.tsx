import { useEffect, useState } from 'react';
import { reportMissingItem } from '../../utils/reportMissingItem';

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dlr5fs1pl/image/upload/v1/ff14-items';
const LOCAL_ASSET_BASE = '/item-icons';

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

/** Stable ID-based same-origin asset reference for regional/manual assets. */
function getLocalAssetUrl(assetKey: string): string {
    const encodedKey = assetKey.split('/').filter(Boolean).map(encodeURIComponent).join('/');
    return `${LOCAL_ASSET_BASE}/${encodedKey}.png`;
}

/** Legacy name-based Cloudinary fallback kept for older manually uploaded assets. */
function getLegacyCloudinaryUrl(name: string): string {
    const standardized = name.trim().normalize('NFC')
        .replace(/[^\uAC00-\uD7A30-9a-zA-Z]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    return `${CLOUDINARY_BASE}/${encodeURIComponent(standardized)}.png`;
}

interface ItemIconProps {
    nameKo?: string;
    iconPath?: string;
    iconAssetKey?: string;
    tarToUrl?: string;
    enableWebhook?: boolean;
    className?: string;
}

/**
 * ItemIcon
 * Design Reference: Cursor Warm Minimalism - Bordered asset with smooth loading
 */
export function ItemIcon({ nameKo, iconPath, iconAssetKey, tarToUrl, enableWebhook, className }: ItemIconProps) {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [fallbackSources, setFallbackSources] = useState<string[]>([]);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const sources = [
            iconAssetKey ? getLocalAssetUrl(iconAssetKey) : undefined,
            iconPath ? getXivapiUrl(iconPath) : undefined,
            tarToUrl,
            nameKo ? getLegacyCloudinaryUrl(nameKo) : undefined,
        ].filter((source): source is string => Boolean(source));
        const uniqueSources = [...new Set(sources)];

        setIsError(false);
        setImgSrc(uniqueSources[0] ?? null);
        setFallbackSources(uniqueSources.slice(1));
        if (uniqueSources.length === 0) setIsError(true);
    }, [iconAssetKey, iconPath, nameKo, tarToUrl]);

    const handleError = () => {
        const [nextSource, ...remainingSources] = fallbackSources;
        if (nextSource) {
            setImgSrc(nextSource);
            setFallbackSources(remainingSources);
        } else {
            setIsError(true);
        }
    };

    useEffect(() => {
        if (isError && enableWebhook && nameKo) {
            reportMissingItem(nameKo);
        }
    }, [isError, enableWebhook, nameKo]);

    if (!iconPath && !iconAssetKey && !tarToUrl && !nameKo) return null;

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
