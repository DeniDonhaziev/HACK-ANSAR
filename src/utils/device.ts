import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

export function getDeviceInfo(): string {
  return `${Platform.OS} ${Platform.Version}`;
}

export async function generateHash(data: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
}

export function getMockIpAddress(): string {
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}
