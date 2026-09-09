import { BadRequestException } from '@nestjs/common';
export function object(value: unknown): Record<string, unknown> {
 if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BadRequestException('Expected a JSON object.');
 return value as Record<string, unknown>;
}
export function string(value: unknown, min = 1, max = 500): string {
 if (typeof value !== 'string' || value.trim().length < min || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new BadRequestException(`Expected text (${min}-${max} characters).`);
 return value.trim();
}
export function uuid(value: unknown): string {
 const id = string(value,36,36);
 if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new BadRequestException('Expected UUID v4.');
 return id;
}
export function version(value: unknown): number {
 if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw new BadRequestException('Expected a non-negative integer version.');
 return value;
}
export function onlyKeys(value: Record<string, unknown>, keys: readonly string[]): void {
 if (Object.keys(value).some(key => !keys.includes(key))) throw new BadRequestException('Unknown input field.');
}
export const dateString = (value: unknown): string | null => value instanceof Date ? value.toISOString() : typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
