const META_MARKER = Symbol('meta-envelope');

export interface MetaEnvelope<T> {
  readonly [META_MARKER]: true;
  data: T;
  meta: Record<string, unknown>;
}

export function withMeta<T>(data: T, meta: Record<string, unknown>): MetaEnvelope<T> {
  return { [META_MARKER]: true, data, meta };
}

export function isMetaEnvelope(val: unknown): val is MetaEnvelope<unknown> {
  return typeof val === 'object' && val !== null && META_MARKER in val;
}
