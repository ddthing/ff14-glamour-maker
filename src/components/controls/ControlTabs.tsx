export type ControlTab = 'general' | 'equipment';

interface ControlTabsProps {
  activeTab: ControlTab;
  equipmentLabel: string;
  generalLabel: string;
  onChange: (tab: ControlTab) => void;
}

export function ControlTabs({ activeTab, equipmentLabel, generalLabel, onChange }: ControlTabsProps) {
  return (
    <div className="control-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        id="equipment-tab"
        aria-controls="control-tabpanel"
        className="control-tab"
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
        className="control-tab"
        onClick={() => onChange('general')}
        aria-selected={activeTab === 'general'}
      >
        {generalLabel}
      </button>
    </div>
  );
}
