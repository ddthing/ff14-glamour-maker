import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

/**
 * LanguageSelector
 * Design Reference: Cursor Warm Minimalism - Clean text links
 */
export function LanguageSelector() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLng = i18n.language.split('-')[0]; // handle 'ko-KR' etc.

    return (
        <div className="flex items-center gap-2 px-1">
            <Languages size={14} className="text-[var(--text-muted)]" />
            <div className="flex items-center gap-1.5">
                {[
                    { code: 'ko', label: 'KR' },
                    { code: 'en', label: 'EN' },
                    { code: 'ja', label: 'JA' }
                ].map((lang, idx) => (
                    <React.Fragment key={lang.code}>
                        <button
                            onClick={() => changeLanguage(lang.code)}
                            className={`
                                text-[0.7rem] font-bold tracking-widest transition-colors
                                ${currentLng === lang.code 
                                    ? 'text-[var(--text-primary)]' 
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}
                            `}
                        >
                            {lang.label}
                        </button>
                        {idx < 2 && <span className="text-[var(--border)] text-[0.7rem] mx-0.5">/</span>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
