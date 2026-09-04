import { timingSafeEqual } from "node:crypto";

export function safeSecretEqual(expected: string | undefined, supplied: string | null) {
  const left = expected?.trim() ?? "";
  const right = supplied ?? "";
  if (!left || left.length !== right.length) return false;
  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}
