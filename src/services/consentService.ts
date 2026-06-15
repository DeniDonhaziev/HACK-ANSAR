import { Consent, ConsentType } from '../types';
import { auditService } from './auditService';

class ConsentService {
  private consents: Consent[] = [];

  create(params: Omit<Consent, 'id' | 'isActive' | 'history'>): Consent {
    const consent: Consent = {
      ...params,
      id: `consent-${Date.now()}`,
      isActive: true,
      history: [{
        id: `hist-${Date.now()}`,
        action: 'created',
        timestamp: new Date().toISOString(),
        userId: 'system',
        details: 'Согласие получено',
      }],
    };
    this.consents.unshift(consent);
    return consent;
  }

  async revoke(id: string, userId: string, reason: string): Promise<Consent | null> {
    const consent = this.consents.find((c) => c.id === id);
    if (!consent) return null;

    consent.isActive = false;
    consent.revokedAt = new Date().toISOString();
    consent.revokeReason = reason;
    consent.history.push({
      id: `hist-${Date.now()}`,
      action: 'revoked',
      timestamp: new Date().toISOString(),
      userId,
      details: reason,
    });

    await auditService.log({
      entityType: 'consent',
      entityId: id,
      action: 'update',
      userId,
      userName: userId,
      oldValue: 'active',
      newValue: 'revoked',
      reason,
    });

    return consent;
  }

  hasActiveConsent(clientId: string, type: ConsentType): boolean {
    const now = new Date();
    return this.consents.some((c) => {
      if (c.clientId !== clientId || c.type !== type || !c.isActive) return false;
      if (c.expiresAt && new Date(c.expiresAt) < now) return false;
      return true;
    });
  }

  canCommunicate(clientId: string): boolean {
    return this.hasActiveConsent(clientId, 'pharmacy_communication');
  }

  getAll(): Consent[] {
    return [...this.consents];
  }

  getByClient(clientId: string): Consent[] {
    return this.consents.filter((c) => c.clientId === clientId);
  }

  getExpiringSoon(days = 30): Consent[] {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);
    return this.consents.filter((c) => {
      if (!c.isActive || !c.expiresAt) return false;
      const exp = new Date(c.expiresAt);
      return exp <= threshold && exp > new Date();
    });
  }

  seed(data: Consent[]) {
    this.consents = data;
  }
}

export const consentService = new ConsentService();
