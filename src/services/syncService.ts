import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_QUEUE_KEY = '@pharma_crm_sync_queue';
const OFFLINE_DATA_KEY = '@pharma_crm_offline_data';
const LAST_SYNC_KEY = '@pharma_crm_last_sync';

interface SyncItem {
  id: string;
  type: string;
  action: string;
  payload: unknown;
  timestamp: string;
}

class SyncService {
  private isOnline = true;
  private syncInProgress = false;

  setOnlineStatus(online: boolean) {
    this.isOnline = online;
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  async queueForSync(item: Omit<SyncItem, 'id' | 'timestamp'>): Promise<void> {
    const queue = await this.getQueue();
    queue.push({
      ...item,
      id: `sync-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  async getQueue(): Promise<SyncItem[]> {
    const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  }

  async syncAll(): Promise<{ synced: number; failed: number }> {
    if (this.syncInProgress || !this.isOnline) return { synced: 0, failed: 0 };

    this.syncInProgress = true;
    const queue = await this.getQueue();
    let synced = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        // Симуляция синхронизации с сервером
        await new Promise((r) => setTimeout(r, 100));
        synced++;
      } catch {
        failed++;
      }
    }

    const remaining = queue.slice(failed);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
    await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    this.syncInProgress = false;
    return { synced, failed };
  }

  async saveOfflineData(key: string, data: unknown): Promise<void> {
    const stored = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
    const allData = stored ? JSON.parse(stored) : {};
    allData[key] = data;
    await AsyncStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(allData));
  }

  async getOfflineData<T>(key: string): Promise<T | null> {
    const stored = await AsyncStorage.getItem(OFFLINE_DATA_KEY);
    if (!stored) return null;
    const allData = JSON.parse(stored);
    return allData[key] ?? null;
  }

  async getLastSync(): Promise<string | null> {
    return AsyncStorage.getItem(LAST_SYNC_KEY);
  }
}

export const syncService = new SyncService();
