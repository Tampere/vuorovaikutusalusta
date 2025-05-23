import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { useTranslations } from '@src/stores/TranslationContext';

type Props = PropsWithChildren<{
  id: string;
  type?: string;
}>;

interface Context {
  attributes: Record<string, any>;
  listeners: DraggableSyntheticListeners;
  ref(node: HTMLElement | null): void;
}

const SortableItemContext = createContext<Context>({
  attributes: {},
  listeners: undefined,
  ref() {},
});

export function SortableItem(props: Props) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    attributes,
    listeners,
    setActivatorNodeRef,
  } = useSortable({
    id: props.id,
    ...(props.type && { type: props.type }),
  });

  const style = {
    opacity: isDragging ? 0 : 1,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const context = useMemo(
    () => ({
      attributes,
      listeners,
      ref: setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef],
  );

  return (
    <SortableItemContext.Provider value={context}>
      <div ref={setNodeRef} style={style}>
        {props.children}
      </div>
    </SortableItemContext.Provider>
  );
}

export function DragHandle(props: PropsWithChildren<{ isDragging?: boolean }>) {
  const { tr } = useTranslations();
  const { attributes, listeners, ref } = useContext(SortableItemContext);

  if (!ref) {
    throw new Error('DragHandle must be a child of SortableItem');
  }

  return (
    <button
      ref={ref}
      {...attributes}
      {...listeners}
      aria-roledescription={tr.DragAndDrop.draggable}
      style={{
        cursor: props.isDragging ? 'grabbing' : 'grab',
        border: 'none',
        background: 'none',
        padding: '0 0.25rem',
      }}
    >
      {props.children}
    </button>
  );
}
