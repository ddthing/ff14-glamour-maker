import { useEffect, useState } from 'react';
import { CheckIcon, ClipboardCopyIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTranslation } from 'react-i18next';
import { COMMON_GLAMOUR_HASHTAGS } from '../../constants/hashtags';
import { copyTextToClipboard } from '../../utils/clipboard';

type CopyState = 'idle' | 'copying' | 'copied' | 'error';
type CopyScope = 'single' | 'multiple' | null;

interface CopyFeedback {
  tag: string | null;
  scope: CopyScope;
  state: CopyState;
}

export function HashtagTools() {
  const { t } = useTranslation();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<CopyFeedback>({ tag: null, scope: null, state: 'idle' });

  const selectedTagSet = new Set(selectedTags);
  const allTagsSelected = selectedTags.length === COMMON_GLAMOUR_HASHTAGS.length;
  const isCopying = feedback.state === 'copying';

  useEffect(() => {
    if (feedback.state !== 'copied' && feedback.state !== 'error') return;

    const timeout = window.setTimeout(() => setFeedback({ tag: null, scope: null, state: 'idle' }), 2400);
    return () => window.clearTimeout(timeout);
  }, [feedback.state]);

  const toggleTag = (tag: string) => {
    setSelectedTags(current => current.includes(tag)
      ? current.filter(selectedTag => selectedTag !== tag)
      : [...current, tag]);
  };

  const handleSelectAll = () => {
    setSelectedTags(allTagsSelected ? [] : [...COMMON_GLAMOUR_HASHTAGS]);
  };

  const handleCopy = async (tag: string) => {
    setFeedback({ tag, scope: 'single', state: 'copying' });
    const copied = await copyTextToClipboard(`#${tag}`);
    setFeedback({ tag, scope: 'single', state: copied ? 'copied' : 'error' });
  };

  const handleCopySelected = async () => {
    const tagsToCopy = COMMON_GLAMOUR_HASHTAGS.filter(tag => selectedTagSet.has(tag));
    if (tagsToCopy.length === 0) return;

    setFeedback({ tag: null, scope: 'multiple', state: 'copying' });
    const copied = await copyTextToClipboard(tagsToCopy.map(tag => `#${tag}`).join(' '));
    setFeedback({ tag: null, scope: 'multiple', state: copied ? 'copied' : 'error' });
  };

  const statusMessage = feedback.scope === 'multiple' && feedback.state === 'copied'
    ? t('common.hashtags_selected_copied')
    : feedback.state === 'copying'
      ? t('common.hashtags_copying')
      : feedback.state === 'copied'
        ? t('common.hashtags_copied')
        : feedback.state === 'error'
          ? t('common.hashtags_copy_failed')
          : '';

  const statusLabel = feedback.scope === 'single' && feedback.tag
    ? `${statusMessage}: #${feedback.tag}`
    : statusMessage;

  return (
    <section className="hashtag-tools" aria-labelledby="hashtag-tools-title">
      <div className="hashtag-tools-header">
        <h2 id="hashtag-tools-title" className="hashtag-tools-title">
          {t('common.hashtags_title')}
        </h2>
        <button
          type="button"
          className="hashtag-select-all-button"
          onClick={handleSelectAll}
          disabled={isCopying}
        >
          {allTagsSelected ? t('common.hashtags_clear_selection') : t('common.hashtags_select_all')}
        </button>
      </div>

      <p className="hashtag-tools-hint">{t('common.hashtags_hint')}</p>

      <div className="hashtag-chip-list" aria-label={t('common.hashtags_title')}>
        {COMMON_GLAMOUR_HASHTAGS.map(tag => (
          <div key={tag} className="hashtag-chip" data-selected={selectedTagSet.has(tag)}>
            <button
              type="button"
              className="hashtag-select-button"
              onClick={() => toggleTag(tag)}
              disabled={isCopying}
              aria-pressed={selectedTagSet.has(tag)}
              aria-label={`${t('common.select_hashtag')}: #${tag}`}
            >
              <span>#{tag}</span>
            </button>
            <button
              type="button"
              className="hashtag-copy-button"
              data-state={feedback.tag === tag ? feedback.state : 'idle'}
              onClick={() => handleCopy(tag)}
              disabled={isCopying}
              aria-label={`${t('common.copy_hashtag')}: #${tag}`}
            >
              <HugeiconsIcon
                icon={feedback.tag === tag && feedback.state === 'copied' ? CheckIcon : ClipboardCopyIcon}
                size={13}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="hashtag-copy-selected-button"
        onClick={handleCopySelected}
        disabled={selectedTags.length === 0 || isCopying}
      >
        <HugeiconsIcon icon={ClipboardCopyIcon} size={14} strokeWidth={1.8} aria-hidden="true" />
        <span>{t('common.copy_selected_hashtags')}</span>
        <span className="hashtag-selected-count">{selectedTags.length}</span>
      </button>

      <p
        className="hashtag-status"
        data-state={feedback.state}
        aria-live="polite"
        aria-atomic="true"
      >
        {statusLabel}
      </p>
    </section>
  );
}
