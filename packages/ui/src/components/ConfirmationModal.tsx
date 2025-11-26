import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'var(--vscode-editor-background)',
                padding: '20px',
                border: '1px solid var(--vscode-panel-border)',
                borderRadius: '5px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <p style={{ marginBottom: '20px', color: 'var(--vscode-editor-foreground)' }}>{message}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onCancel} style={{
                        backgroundColor: 'var(--vscode-button-secondaryBackground)',
                        color: 'var(--vscode-button-secondaryForeground)',
                        border: 'none',
                        padding: '8px 12px',
                        cursor: 'pointer'
                    }}>Cancel</button>
                    <button onClick={onConfirm} style={{
                        backgroundColor: 'var(--vscode-button-background)',
                        color: 'var(--vscode-button-foreground)',
                        border: 'none',
                        padding: '8px 12px',
                        cursor: 'pointer'
                    }}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
