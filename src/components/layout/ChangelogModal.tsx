import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X, ChevronRight, Check } from 'lucide-react';
import updates from '../../data/updates.json';

export interface UpdateItem {
  version: string;
  date: string;
  title: {
    ko: string;
    en: string;
    ja: string;
  };
  content: {
    ko: string[];
    en: string[];
    ja: string[];
  };
}

interface ChangelogModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * ChangelogModal
 * P2 UX 개선: 3초 후 자동 팝업(인터럽트) → 헤더 배지 클릭으로 열기 방식 변경됨.
 * 이 컴포넌트는 배지 클릭 시 수동으로 열리는 방식으로만 사용됨.
 */
export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  const { t, i18n } = useTranslation();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const currentLang = i18n.language.split('-')[0] as 'ko' | 'en' | 'ja';
  const displayLang: 'ko' | 'en' | 'ja' = ['ko', 'en', 'ja'].includes(currentLang) ? currentLang : 'ko';

  const typedUpdates = updates as UpdateItem[];
  const latestUpdate = typedUpdates[0];

  useEffect(() => {
    if (isOpen) setDontShowAgain(false);
  }, [isOpen]);

  if (!isOpen || !latestUpdate) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideChangelogVersion', latestUpdate.version);
    }
    if (onClose) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-title"
      onClick={handleClose}
      className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-[var(--bg-panel)] p-10 rounded-[var(--radius-lg)] flex flex-col w-full max-w-[480px] border border-[var(--border)] relative animate-slide-up"
        style={{ boxShadow: 'var(--shadow-elevated)' }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label={t('common.close')}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[var(--surface-300)] border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center hover:text-[var(--error)] transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header Section */}
        <div className="flex items-center gap-2 text-[var(--accent)] mb-2">
          <Sparkles size={18} className="fill-current" />
          <span className="text-[0.75rem] font-bold uppercase tracking-[0.2em]">
            V{latestUpdate.version} {t('common.update')}
          </span>
        </div>

        <h2 id="changelog-title" className="text-[2rem] font-bold text-[var(--text-primary)] leading-[1.1] mb-8">
          {t('common.new_updates')}
        </h2>

        {/* Updates List */}
        <div className="flex flex-col gap-8 mb-10 overflow-y-auto max-h-[40vh] pr-4 scrollbar-thin overscroll-contain">
          {typedUpdates.slice(0, 1).map((up: UpdateItem) => (
            <div key={up.version} className="flex flex-col gap-4">
              <div className="flex justify-between items-baseline border-b border-[var(--border)] pb-2">
                <span className="text-[1.1rem] font-bold tracking-tight">VERSION {up.version}</span>
                <span className="text-[0.75rem] font-medium text-[var(--text-muted)] uppercase tracking-widest">{up.date}</span>
              </div>
              <div className="flex flex-col gap-3">
                {(up.content[displayLang] || up.content['ko']).map((item, i) => (
                  <div key={i} className="flex gap-3 items-start leading-relaxed group">
                    <ChevronRight size={14} className="text-[var(--accent)] mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span className="text-[0.95rem] text-[var(--text-secondary)] font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-4 mt-auto">
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div className="relative flex items-center justify-center w-5 h-5">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={e => setDontShowAgain(e.target.checked)}
                className="peer appearance-none w-5 h-5 border border-[var(--border)] rounded-md bg-[var(--surface-100)] checked:bg-[var(--accent)] checked:border-[var(--accent)] transition-all cursor-pointer"
              />
              <Check size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
            </div>
            <span className="text-[0.85rem] font-bold text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
              {t('common.hide_version')}
            </span>
          </label>

          <button
            onClick={handleClose}
            className="btn-primary uppercase tracking-wider text-lg"
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
