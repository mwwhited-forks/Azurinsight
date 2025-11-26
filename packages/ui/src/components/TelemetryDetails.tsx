import React from 'react';
import type { TelemetryItem } from './TelemetryList';

interface TelemetryDetailsProps {
    item: TelemetryItem | null;
    onClose: () => void;
}

const TelemetryDetails: React.FC<TelemetryDetailsProps> = ({ item, onClose }) => {
    if (!item) return null;

    return (
        <div className="telemetry-details">
            <div className="details-header">
                <h3>Details</h3>
                <button onClick={onClose}>Close</button>
            </div>
            <pre>{JSON.stringify(item, null, 2)}</pre>
        </div>
    );
};

export default TelemetryDetails;
