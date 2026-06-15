import { AuditEntry } from '../types';
import { generateHash, getDeviceInfo, getMockIpAddress } from '../utils/device';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const CRITICAL_ENTITIES = ['contract', 'consent', 'signature', 'batch', 'expense', 'approval'];

class AuditService {
  private entries: AuditEntry[] = [];

  async log(params: {
    entityType: string;
    entityId: string;
    action: AuditEntry['action'];
    userId: string;
    userName: string;
    oldValue?: string;
    newValue?: string;
    reason?: string;
  }): Promise<AuditEntry> {
    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...params,
      timestamp: new Date().toISOString(),
      ipAddress: getMockIpAddress(),
      deviceInfo: getDeviceInfo(),
      isCritical: CRITICAL_ENTITIES.includes(params.entityType),
      archived: false,
    };
    this.entries.unshift(entry);
    return entry;
  }

  getAll(filters?: { entityType?: string; userId?: string; archived?: boolean }): AuditEntry[] {
    let result = [...this.entries];
    if (filters?.entityType) result = result.filter((e) => e.entityType === filters.entityType);
    if (filters?.userId) result = result.filter((e) => e.userId === filters.userId);
    if (filters?.archived !== undefined) result = result.filter((e) => e.archived === filters.archived);
    return result;
  }

  canDelete(entry: AuditEntry): boolean {
    return !entry.isCritical;
  }

  async archive(id: string, userId: string, userName: string): Promise<boolean> {
    const entry = this.entries.find((e) => e.id === id);
    if (!entry) return false;
    entry.archived = true;
    await this.log({
      entityType: 'audit',
      entityId: id,
      action: 'archive',
      userId,
      userName,
      reason: 'Архивирование записи audit trail',
    });
    return true;
  }

  async exportAuditTrail(): Promise<string> {
    const data = JSON.stringify(this.entries, null, 2);
    const path = `${FileSystem.cacheDirectory}audit_trail_${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(path, data);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Экспорт Audit Trail' });
    }
    return path;
  }

  seed(entries: AuditEntry[]) {
    this.entries = entries;
  }
}

export const auditService = new AuditService();
