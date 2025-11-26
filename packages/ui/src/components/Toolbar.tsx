import React from 'react';

interface ToolbarProps {
    onClear: () => void;
    filter: string;
    onFilterChange: (value: string) => void;
    autoScroll: boolean;
    onAutoScrollChange: (value: boolean) => void;
    isConnected: boolean;
    onPurge: () => void;
    onDeleteSelected: () => void;
    onDeleteRange: () => void;
    startDate: string;
    endDate: string;
    onDateChange: (start: string, end: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
    onClear, filter, onFilterChange, autoScroll, onAutoScrollChange, isConnected, onPurge,
    onDeleteSelected, onDeleteRange, startDate, endDate, onDateChange
}) => {
    return (
        <div className="toolbar">
            <input
                type="text"
                placeholder="Filter..."
                value={filter}
                onChange={(e) => onFilterChange(e.target.value)}
                className="filter-input"
            />
            <button onClick={onClear} title="Clear current view">Clear View</button>
            <button onClick={onPurge} title="Delete all data from server" style={{ backgroundColor: 'var(--vscode-button-secondaryBackground)', color: 'var(--vscode-button-secondaryForeground)' }}>Purge Data</button>
            <div className="separator" style={{ width: '1px', height: '20px', backgroundColor: 'var(--vscode-panel-border)' }}></div>
            <button onClick={onDeleteSelected} title="Delete selected items">Delete Selected</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input type="datetime-local" value={startDate} onChange={(e) => onDateChange(e.target.value, endDate)} style={{ backgroundColor: 'var(--vscode-input-background)', color: 'var(--vscode-input-foreground)', border: '1px solid var(--vscode-input-border)' }} />
                <span>-</span>
                <input type="datetime-local" value={endDate} onChange={(e) => onDateChange(startDate, e.target.value)} style={{ backgroundColor: 'var(--vscode-input-background)', color: 'var(--vscode-input-foreground)', border: '1px solid var(--vscode-input-border)' }} />
                <button onClick={onDeleteRange} title="Delete data in range">Delete Range</button>
            </div>
            <label>
                <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => onAutoScrollChange(e.target.checked)}
                />
                Auto-scroll
            </label>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: isConnected ? 'var(--vscode-testing-iconPassed)' : 'var(--vscode-testing-iconFailed)'
                }} />
                <span style={{ fontSize: '0.8em' }}>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
        </div>
    );
};

export default Toolbar;
