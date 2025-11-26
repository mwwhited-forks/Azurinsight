import React from 'react';

export interface TelemetryItem {
    id: string;
    time: string;
    name: string;
    iKey: string;
    itemType: string;
    data: any;
    tags: any;
}

interface TelemetryListProps {
    items: TelemetryItem[];
    onSelect: (item: TelemetryItem) => void;
    selectedId?: string;
    selectedIds: Set<string>;
    onToggleSelect: (id: string, selected: boolean) => void;
}

const TelemetryList: React.FC<TelemetryListProps> = ({ items, onSelect, selectedId, selectedIds, onToggleSelect }) => {
    const getSeverityColor = (item: TelemetryItem) => {
        if (item.itemType === 'exception') return 'var(--vscode-errorForeground)';
        if (item.data?.baseData?.success === false) return 'var(--vscode-errorForeground)';
        return 'inherit';
    };

    return (
        <div className="telemetry-list">
            <table>
                <thead>
                    <tr>
                        <th style={{ width: '30px' }}></th>
                        <th>Timestamp</th>
                        <th>Type</th>
                        <th>Name</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr
                            key={item.id}
                            onClick={() => onSelect(item)}
                            className={selectedId === item.id ? 'selected' : ''}
                            style={{ color: getSeverityColor(item) }}
                        >
                            <td onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(item.id)}
                                    onChange={(e) => onToggleSelect(item.id, e.target.checked)}
                                />
                            </td>
                            <td>{new Date(item.time).toLocaleString()}</td>
                            <td>{item.itemType}</td>
                            <td>{item.name}</td>
                            <td>
                                {item.itemType === 'request' && `${item.data?.baseData?.responseCode || ''} - ${item.data?.baseData?.duration || ''}`}
                                {item.itemType === 'dependency' && `${item.data?.baseData?.target || ''} - ${item.data?.baseData?.duration || ''}`}
                                {item.itemType === 'exception' && (item.data?.baseData?.exceptions?.[0]?.message || item.data?.baseData?.message)}
                                {item.itemType === 'trace' && item.data?.baseData?.message}
                                {item.itemType === 'metric' && JSON.stringify(item.data?.baseData?.metrics)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TelemetryList;
