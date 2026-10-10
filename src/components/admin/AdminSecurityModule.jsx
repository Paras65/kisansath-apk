import React from 'react';
import { Grid } from '@mui/material';
import { AdminApiHealthSection } from './AdminApiHealthSection';
import { AdminAuditLogsSection } from './AdminAuditLogsSection';

export const AdminSecurityModule = ({
  apiHealth,
  checkingApis,
  handleCheckApiHealth,
  externalConfig,
  auditStats,
  auditFilter,
  setAuditFilter,
  auditSearch,
  setAuditSearch,
  loadAuditLogs,
  loadingAudit,
  handleClearAudit,
  handleCopyAuditReport,
  copiedAuditReport,
  auditLogs,
  setSelectedConsoleLog,
  handleLogout,
  onExit,
}) => {
  return (
    <Grid container spacing={3}>
      <AdminApiHealthSection
        apiHealth={apiHealth}
        checkingApis={checkingApis}
        handleCheckApiHealth={handleCheckApiHealth}
        externalConfig={externalConfig}
      />
      <AdminAuditLogsSection
        auditStats={auditStats}
        auditFilter={auditFilter}
        setAuditFilter={setAuditFilter}
        auditSearch={auditSearch}
        setAuditSearch={setAuditSearch}
        loadAuditLogs={loadAuditLogs}
        loadingAudit={loadingAudit}
        handleClearAudit={handleClearAudit}
        handleCopyAuditReport={handleCopyAuditReport}
        copiedAuditReport={copiedAuditReport}
        auditLogs={auditLogs}
        setSelectedConsoleLog={setSelectedConsoleLog}
        handleLogout={handleLogout}
        onExit={onExit}
      />
    </Grid>
  );
};

