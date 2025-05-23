import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import React, { PropsWithChildren, ReactNode, useState } from 'react';
import { SortableItem } from './SortableItem';

interface SortableItem {
  id: string;
  renderElement: (isDragging?: boolean) => ReactNode;
}

export interface DragEndOptions {
  newItemOrder: SortableItem[];
  movedItemId: UniqueIdentifier;
  oldIndex: number;
  newIndex: number;
}

interface Announcements {
  onDragStart: ({ active }: { active: { id: UniqueIdentifier } }) => string;
  onDragOver: ({
    active,
    over,
  }: {
    active: { id: UniqueIdentifier };
    over: { id: UniqueIdentifier } | null;
  }) => string;
  onDragEnd: ({
    active,
    over,
  }: {
    active: { id: UniqueIdentifier };
    over: { id: UniqueIdentifier } | null;
  }) => string;
  onDragCancel: ({ active }: { active: { id: UniqueIdentifier } }) => string;
}

type Props = PropsWithChildren<{
  sortableItems: SortableItem[];
  onDragEnd: (options: DragEndOptions) => void;
  announcements?: Announcements;
  screenReaderInstructions?: string;
}>;

export function DndWrapper({
  sortableItems,
  onDragEnd,
  announcements,
  screenReaderInstructions,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DndContext
      accessibility={{
        announcements: announcements,
        screenReaderInstructions: { draggable: screenReaderInstructions },
      }}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <SortableContext
        strategy={verticalListSortingStrategy}
        items={sortableItems.map((item) => item.id)}
      >
        {sortableItems.map((item) => (
          <SortableItem key={item.id} id={item.id}>
            {item.renderElement()}
          </SortableItem>
        ))}
      </SortableContext>

      <DragOverlay>
        {isDragging
          ? sortableItems
              .find((item) => item.id === activeId)
              .renderElement(isDragging)
          : null}
      </DragOverlay>
    </DndContext>
  );

  function handleDragStart(event: DragStartEvent) {
    setIsDragging(true);
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!event.over) {
      setIsDragging(false);
      setActiveId(null);
      return;
    }
    const oldIndex = sortableItems.findIndex((i) => i.id === event.active.id);
    const newIndex = sortableItems.findIndex((i) => i.id === event.over.id);
    onDragEnd({
      newItemOrder: arrayMove(sortableItems, oldIndex, newIndex),
      movedItemId: event.active.id,
      oldIndex,
      newIndex,
    });
    setIsDragging(false);
    setActiveId(null);
  }
}
