import React, { useState, useEffect } from 'react';
import { getActivityByArtisanId } from '../services/firestoreService';
import type { ActivityEvent } from '../data/activityFeed';
import Spinner from './Spinner';

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
);

const OrderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-green" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l.238-.238L7.654 8H14a1 1 0 00.894-.553l3-6A1 1 0 0017 0H5a1 1 0 00-.938.602L3.68 2.41l-.255.025A1 1 0 003 1z" />
        <path fillRule="evenodd" d="M6 16a2 2 0 100 4 2 2 0 000-4zm9 0a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" />
    </svg>
);


interface ActivityFeedProps {
  artisanId: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ artisanId }) => {
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      const data = await getActivityByArtisanId(artisanId);
      setActivity(data);
      setLoading(false);
    };
    fetchActivity();
  }, [artisanId]);

  const orders = activity.filter(e => e.type === 'order');
  const likes = activity.filter(e => e.type === 'like');

  const renderIcon = (type: 'like' | 'order') => {
    switch(type) {
        case 'like':
            return <div className="bg-red-100 p-2 rounded-full"><HeartIcon /></div>;
        case 'order':
            return <div className="bg-emerald-100 p-2 rounded-full"><OrderIcon /></div>;
        default:
            return null;
    }
  };

  const ActivityItem: React.FC<{ event: ActivityEvent }> = ({ event }) => (
    <div className="flex items-start space-x-4 p-3 bg-surface rounded-md">
      <div className="flex-shrink-0">
        {renderIcon(event.type)}
      </div>
      <div>
        <p className="text-sm text-text-primary">
          {event.type === 'like' ? 'New like on ' : 'New order for '}
          <span className="font-semibold">{event.productTitle}</span>.
        </p>
        <p className="text-xs text-text-secondary mt-1">{event.timestamp}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-background/50 p-6 rounded-lg border border-accent/50 h-full">
      <h2 className="text-2xl font-heading font-bold text-secondary mb-6">Recent Activity</h2>
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-8">
          {/* Orders Section */}
          <div>
            <h3 className="text-lg font-bold text-secondary mb-3">New Orders</h3>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map(event => <ActivityItem key={event.id} event={event} />)}
              </div>
            ) : (
              <p className="text-sm text-text-secondary p-3 bg-surface rounded-md">No new orders.</p>
            )}
          </div>

          {/* Likes Section */}
          <div>
            <h3 className="text-lg font-bold text-secondary mb-3">Recent Likes</h3>
            {likes.length > 0 ? (
              <div className="space-y-3">
                {likes.map(event => <ActivityItem key={event.id} event={event} />)}
              </div>
            ) : (
              <p className="text-sm text-text-secondary p-3 bg-surface rounded-md">No recent likes on your products.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;