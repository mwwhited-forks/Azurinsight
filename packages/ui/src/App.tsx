import { useState, useEffect, useRef } from 'react';
import './App.css';
import TelemetryList, { type TelemetryItem } from './components/TelemetryList';
import TelemetryDetails from './components/TelemetryDetails';
import Toolbar from './components/Toolbar';
import ConfirmationModal from './components/ConfirmationModal';

function App() {
  const [items, setItems] = useState<TelemetryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TelemetryItem | null>(null);
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [isConnected, setIsConnected] = useState(false);

  // Helper to normalize telemetry items
  const normalizeItem = (item: any): TelemetryItem => {
    let data = item.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (e) { console.error('Error parsing data JSON', e); }
    }
    let tags = item.tags;
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch (e) { console.error('Error parsing tags JSON', e); }
    }

    let itemType = item.itemType;
    if (!itemType && data && data.baseType) {
      itemType = data.baseType.replace('Data', '');
    }

    return { ...item, data, tags, itemType: itemType || 'unknown' };
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/query?top=100');
      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result.value)) {
          const normalized = result.value.map(normalizeItem);
          setItems(() => {
            // Merge with existing, avoiding duplicates if needed (though simple replace or prepend is easier)
            // For now, let's just use history as base. 
            // Actually, if we are connected, we might get live items while fetching.
            // Let's just set items to history + whatever live items we might have (which is 0 on mount)
            return normalized;
          });
        }
      }
    } catch (e) {
      console.error('Error fetching history:', e);
    }
  };

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [pendingAction, setPendingAction] = useState<() => Promise<void> | void>(() => { });

  const confirmAction = (message: string, action: () => Promise<void> | void) => {
    setModalMessage(message);
    setPendingAction(() => action);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    setModalOpen(false);
    await pendingAction();
  };

  const handlePurge = () => {
    confirmAction('Are you sure you want to delete all telemetry data from the server? This cannot be undone.', async () => {
      console.log('Purge confirmed via modal');
      try {
        const response = await fetch('http://localhost:5000/api/purge', { method: 'DELETE' });
        console.log('Purge response status:', response.status);
        if (response.ok) {
          setItems([]);
          setSelectedIds(new Set());
        } else {
          console.error('Failed to purge data');
        }
      } catch (e) {
        console.error('Error purging data:', e);
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    confirmAction(`Delete ${selectedIds.size} selected items?`, async () => {
      console.log('Delete selected confirmed via modal');
      try {
        const ids = Array.from(selectedIds).join(',');
        const response = await fetch(`http://localhost:5000/api/telemetry?ids=${ids}`, { method: 'DELETE' });
        console.log('Delete selected response status:', response.status);
        if (response.ok) {
          setItems(prev => prev.filter(item => !selectedIds.has(item.id)));
          setSelectedIds(new Set());
        } else {
          console.error('Failed to delete items');
        }
      } catch (e) {
        console.error('Error deleting items:', e);
      }
    });
  };

  const handleDeleteRange = () => {
    if (!startDate || !endDate) {
      // Use console.error instead of alert for now, or could use a simple message in UI
      console.error('Please select both start and end dates');
      return;
    }
    confirmAction(`Delete items between ${new Date(startDate).toLocaleString()} and ${new Date(endDate).toLocaleString()}?`, async () => {
      console.log('Delete range confirmed via modal');
      try {
        const response = await fetch(`http://localhost:5000/api/telemetry?start=${new Date(startDate).toISOString()}&end=${new Date(endDate).toISOString()}`, { method: 'DELETE' });
        console.log('Delete range response status:', response.status);
        if (response.ok) {
          fetchHistory();
        } else {
          console.error('Failed to delete range');
        }
      } catch (e) {
        console.error('Error deleting range:', e);
      }
    });
  };

  const handleToggleSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    // Fetch history on mount
    fetchHistory();

    // WebSocket connection
    const ws = new WebSocket('ws://localhost:5000');

    ws.onopen = () => {
      console.log('Connected to Azurinsight server');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const rawItem = JSON.parse(event.data);
        const item = normalizeItem(rawItem);
        setItems(prev => [item, ...prev]); // Prepend new items
      } catch (e) {
        console.error('Error parsing telemetry:', e);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setIsConnected(false);
    };

    // Keep existing message listener for extension commands if needed
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === 'telemetry') {
        setItems(prev => [normalizeItem(message.data), ...prev]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      ws.close();
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [items, autoScroll]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase()) ||
    item.itemType.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="app-container">
      <Toolbar
        filter={filter}
        onFilterChange={setFilter}
        onClear={() => setItems([])}
        autoScroll={autoScroll}
        onAutoScrollChange={setAutoScroll}
        isConnected={isConnected}
        onPurge={handlePurge}
        onDeleteSelected={handleDeleteSelected}
        onDeleteRange={handleDeleteRange}
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
      />
      <div className="main-content">
        <TelemetryList
          items={filteredItems}
          onSelect={setSelectedItem}
          selectedId={selectedItem?.id}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
        />
        <div ref={bottomRef} />
      </div>
      {selectedItem && (
        <TelemetryDetails
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
      <ConfirmationModal
        isOpen={modalOpen}
        message={modalMessage}
        onConfirm={handleConfirm}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}

export default App;
