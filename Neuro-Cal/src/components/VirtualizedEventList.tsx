import React, { useState, useCallback, useMemo } from 'react';
import { Event, EventCard } from './EventCard';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedEventListProps {
  events: Event[];
  height: number;
  itemHeight?: number;
  className?: string;
}

export const VirtualizedEventList: React.FC<VirtualizedEventListProps> = ({
  events,
  height,
  itemHeight = 80,
  className = ''
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan: 5,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  const renderEvent = useCallback((event: Event, index: number) => (
    <div
      key={event.id}
      className="p-2"
      style={{
        height: `${itemHeight}px`,
        transform: `translateY(${virtualItems[index]?.start ?? 0}px)`,
      }}
    >
      <EventCard event={event} />
    </div>
  ), [itemHeight, virtualItems]);

  if (events.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No events found</p>
          <p className="text-xs">Create your first event to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualRow) => {
          const event = events[virtualRow.index];
          return renderEvent(event, virtualRow.index);
        })}
      </div>
    </div>
  );
};
