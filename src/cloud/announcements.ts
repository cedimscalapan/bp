/** Announcements and updates published from the admin dashboard (filled at launch by services/content-sync). */
export type Announcement = {
  id: string;
  title: string;
  body: string;
  category: 'update' | 'news' | 'event' | 'advisory';
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  startsAt?: string;
  endsAt?: string;
  pinned?: boolean;
};

export const announcements: Announcement[] = [];

/** Announcements that should be visible at `now`, pinned first, keeping admin order otherwise. */
export function activeAnnouncements(list: readonly Announcement[] = announcements, now = new Date()): Announcement[] {
  const time = now.getTime();
  return list
    .filter(item => (!item.startsAt || Date.parse(item.startsAt) <= time) && (!item.endsAt || Date.parse(item.endsAt) > time))
    .map((item, index) => ({ item, index }))
    .sort((a, b) => Number(Boolean(b.item.pinned)) - Number(Boolean(a.item.pinned)) || a.index - b.index)
    .map(({ item }) => item);
}
