import { useState } from 'react';
import { activeAnnouncements } from './announcements';

const categoryLabel = { update: 'Update', news: 'Balita', event: 'Event', advisory: 'Advisory' } as const;

/** News and updates published from the admin dashboard. Renders nothing when there are none. */
export default function AnnouncementsCard() {
  const items = activeAnnouncements();
  const [showAll, setShowAll] = useState(false);
  if (!items.length) return null;
  const visible = showAll ? items : items.slice(0, 2);
  return <section className="kp-news" aria-labelledby="kp-news-title">
    <div className="kp-news-head"><span aria-hidden="true">📣</span><div><small>MGA BALITA AT UPDATE</small><h2 id="kp-news-title">News & updates</h2></div></div>
    <ul>{visible.map(item => <li key={item.id} className={`kp-news-item is-${item.category}`}>
      {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" />}
      <div>
        <small>{item.pinned ? '📌 ' : ''}{categoryLabel[item.category] ?? item.category}</small>
        <h3>{item.title}</h3>
        <p>{item.body}</p>
        {item.linkUrl && <a href={item.linkUrl} target="_blank" rel="noopener noreferrer">{item.linkLabel || 'Learn more'} ↗</a>}
      </div>
    </li>)}</ul>
    {items.length > 2 && <button className="kp-news-more" onClick={() => setShowAll(v => !v)}>{showAll ? 'Show fewer' : `Show all ${items.length} updates`}</button>}
  </section>;
}
