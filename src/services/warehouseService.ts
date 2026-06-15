import { Batch, BatchMovement, Shipment } from '../types';
import { auditService } from './auditService';

class WarehouseService {
  private batches: Batch[] = [];
  private shipments: Shipment[] = [];

  getStockByWarehouse(warehouseId: string): Batch[] {
    return this.batches.filter((b) => b.warehouseId === warehouseId && b.status === 'available');
  }

  getStockByBatch(batchNumber: string): Batch | undefined {
    return this.batches.find((b) => b.batchNumber === batchNumber);
  }

  getExpiringSoon(days = 90): Batch[] {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);
    return this.batches.filter((b) => {
      const exp = new Date(b.expiryDate);
      return exp <= threshold && exp > new Date() && b.status === 'available';
    });
  }

  getLowStock(): Batch[] {
    return this.batches.filter((b) => b.available <= 50 && b.status === 'available');
  }

  reserve(batchId: string, quantity: number): boolean {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch || batch.available < quantity) return false;
    batch.reserved += quantity;
    batch.available -= quantity;
    return true;
  }

  async blockBatch(batchId: string, userId: string, userName: string, reason: string): Promise<boolean> {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch) return false;
    batch.status = 'blocked';
    await auditService.log({
      entityType: 'batch',
      entityId: batchId,
      action: 'update',
      userId,
      userName,
      oldValue: 'available',
      newValue: 'blocked',
      reason,
    });
    return true;
  }

  async recallBatch(batchId: string, userId: string, userName: string): Promise<boolean> {
    const batch = this.batches.find((b) => b.id === batchId);
    if (!batch) return false;
    batch.status = 'recalled';
    batch.movements.push({
      id: `mov-${Date.now()}`,
      type: 'recall',
      quantity: batch.quantity,
      timestamp: new Date().toISOString(),
      userId,
    });
    await auditService.log({
      entityType: 'batch',
      entityId: batchId,
      action: 'update',
      userId,
      userName,
      newValue: 'recalled',
      reason: 'Отзыв серии',
    });
    return true;
  }

  createShipment(shipment: Omit<Shipment, 'id' | 'createdAt'>): Shipment {
    const newShipment: Shipment = {
      ...shipment,
      id: `shp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.shipments.unshift(newShipment);
    return newShipment;
  }

  getShipments(): Shipment[] {
    return [...this.shipments];
  }

  getBatches(): Batch[] {
    return [...this.batches];
  }

  traceBatch(batchNumber: string): BatchMovement[] {
    const batch = this.batches.find((b) => b.batchNumber === batchNumber);
    return batch?.movements ?? [];
  }

  seed(batches: Batch[], shipments: Shipment[]) {
    this.batches = batches;
    this.shipments = shipments;
  }
}

export const warehouseService = new WarehouseService();
