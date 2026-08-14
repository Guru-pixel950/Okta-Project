import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle, Database, Shield } from 'lucide-react';
import { oktaApi } from '../api/oktaApi';
import { useToast } from '../context/ToastContext';

export const ExportUsersView = () => {
  const { showToast } = useToast();
  const [format, setFormat] = useState('csv');
  const [includeAudits, setIncludeAudits] = useState(true);

  const handleExport = () => {
    window.location.href = oktaApi.getExportUrl();
    showToast('Starting CSV download of directory users...', 'info', 'Export Started');
  };

  return (
    <div className="page-container">
      <div className="card-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="card-section-title">Export Okta User Directory</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generate structured CSV reports of all directory accounts</div>
            </div>
          </div>
        </div>

        <div className="modal-body" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Export Format</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div
                style={{
                  padding: '1rem',
                  border: `2px solid ${format === 'csv' ? '#2563eb' : 'var(--border-color)'}`,
                  backgroundColor: format === 'csv' ? '#eff6ff' : '#ffffff',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
                onClick={() => setFormat('csv')}
              >
                <div style={{ fontWeight: 700, color: format === 'csv' ? '#2563eb' : 'var(--text-primary)' }}>CSV Spreadsheet (.csv)</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Standard comma-separated format compatible with Excel and Google Sheets.</div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  border: `2px solid ${format === 'json' ? '#2563eb' : 'var(--border-color)'}`,
                  backgroundColor: format === 'json' ? '#eff6ff' : '#ffffff',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
                onClick={() => setFormat('json')}
              >
                <div style={{ fontWeight: 700, color: format === 'json' ? '#2563eb' : 'var(--text-primary)' }}>JSON Directory (.json)</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Full structured JSON hierarchy for automated integrations.</div>
              </div>
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '1.75rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Included Columns & Fields:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div>✓ User ID (Okta UID)</div>
              <div>✓ First & Last Name</div>
              <div>✓ Primary Work Email</div>
              <div>✓ Lifecycle Status</div>
              <div>✓ Assigned Role</div>
              <div>✓ Created Timestamp</div>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem' }}
            onClick={handleExport}
          >
            <Download size={18} />
            <span>Generate & Download {format.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
