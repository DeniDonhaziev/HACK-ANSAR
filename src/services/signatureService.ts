import { ElectronicSignature, SignatureType } from '../types';
import { auditService } from './auditService';
import { generateHash, getDeviceInfo, getMockIpAddress } from '../utils/device';

class SignatureService {
  private signatures: ElectronicSignature[] = [];
  private lockedEntities = new Set<string>();

  async sign(params: {
    type: SignatureType;
    entityId: string;
    entityTitle: string;
    signedBy: string;
    signedByName: string;
    twoFactorVerified: boolean;
    payload: string;
  }): Promise<ElectronicSignature> {
    if (this.lockedEntities.has(params.entityId)) {
      throw new Error('Документ уже подписан и заблокирован для изменений');
    }

    const hash = await generateHash(`${params.payload}-${params.signedBy}-${Date.now()}`);
    const signature: ElectronicSignature = {
      id: `sig-${Date.now()}`,
      type: params.type,
      entityId: params.entityId,
      entityTitle: params.entityTitle,
      signedBy: params.signedBy,
      signedByName: params.signedByName,
      signedAt: new Date().toISOString(),
      signatureHash: hash,
      twoFactorVerified: params.twoFactorVerified,
      ipAddress: getMockIpAddress(),
      deviceInfo: getDeviceInfo(),
      isValid: true,
      locked: true,
    };

    this.signatures.unshift(signature);
    this.lockedEntities.add(params.entityId);

    await auditService.log({
      entityType: 'signature',
      entityId: signature.id,
      action: 'sign',
      userId: params.signedBy,
      userName: params.signedByName,
      newValue: hash,
      reason: `Подписание: ${params.entityTitle}`,
    });

    return signature;
  }

  validate(signatureId: string): boolean {
    const sig = this.signatures.find((s) => s.id === signatureId);
    return sig?.isValid ?? false;
  }

  isEntityLocked(entityId: string): boolean {
    return this.lockedEntities.has(entityId);
  }

  getAll(): ElectronicSignature[] {
    return [...this.signatures];
  }

  getByEntity(entityId: string): ElectronicSignature | undefined {
    return this.signatures.find((s) => s.entityId === entityId);
  }

  getHistory(): ElectronicSignature[] {
    return this.getAll();
  }

  seed(data: ElectronicSignature[]) {
    this.signatures = data;
    data.forEach((s) => { if (s.locked) this.lockedEntities.add(s.entityId); });
  }
}

export const signatureService = new SignatureService();
