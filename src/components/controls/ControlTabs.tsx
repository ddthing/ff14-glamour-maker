export type ControlTab = 'general' | 'equipment';

interface ControlTabsProps {
  activeTab: ControlTab;
  equipmentLabel: string;
  generalLabel: string;
  onChange: (tab: ControlTab) => void;
}

export function ControlTabs({ activeTab, equipmentLabel, generalLabel, onChange }: ControlTabsProps) {
  return (
    <div className="flex border-b border-[var(--border)]" role="tablist">
      <button
        type="button"
        role="tab"
        id="equipment-tab"
        aria-controls="control-tabpanel"
        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'equipment' ? 'text-[var(--text-primary)] border-b-2 border-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
        onClick={() => onChange('equipment')}
        aria-selected={activeTab === 'equipment'}
      >
        {equipmentLabel}
      </button>
      <button
        type="button"
        role="tab"
        id="general-tab"
        aria-controls="control-tabpanel"
        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'general' ? 'text-[var(--text-primary)] border-b-2 border-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
        onClick={() => onChange('general')}
        aria-selected={activeTab === 'general'}
      >
        {generalLabel}
      </button>
    </div>
  );
}
