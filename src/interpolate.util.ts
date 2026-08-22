// Same {{placeholder}} mechanic as leadMarketing's own interpolate() in
// builders.ts — lead-side placeholders only, no sender/white-label fields
// (unlike Warmup-as-a-Service's version — this product's GTM is a personal
// tool for one business owner, not a white-labeled reseller product).
export interface InterpolateLead {
  name: string;
  city?: string | null;
  country?: string | null;
  category?: string | null;
}

export function interpolate(text: string, lead: InterpolateLead): string {
  return text
    .replaceAll('{{name}}', lead.name)
    .replaceAll('{{city}}', lead.city ?? '')
    .replaceAll('{{country}}', lead.country ?? '')
    .replaceAll('{{category}}', lead.category ?? 'your business');
}

export const DEFAULT_TEMPLATE = {
  name: 'Default DM opener',
  body: `Hey {{name}}! Love what you're doing {{city}}. We help {{category}} businesses like yours get more bookings through a better online presence — mind if I send over a couple ideas?`,
};
