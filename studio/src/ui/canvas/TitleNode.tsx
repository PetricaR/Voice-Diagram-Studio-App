/** The title (and subtitle) of the diagram, above everything on the page. Double-click to rename. */
import type { Node, NodeProps } from '@xyflow/react';
import { memo, useEffect, useRef, useState } from 'react';

export interface TitleData extends Record<string, unknown> {
  title: string;
  subtitle?: string;
  onRename: (title: string | null) => void;
}

export type TitleNodeType = Node<TitleData, 'title'>;

function TitleNodeView({ data }: NodeProps<TitleNodeType>) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(data.title);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (editing) {
      setText(data.title);
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing, data.title]);
  const done = (v: string | null) => {
    setEditing(false);
    data.onRename(v);
  };
  return (
    <div className="diagram-title" onDoubleClick={() => setEditing(true)}>
      {editing ? (
        <input
          ref={ref}
          className="title-editor nodrag nopan"
          value={text}
          aria-label="Diagram title"
          onChange={(e) => setText(e.target.value)}
          onBlur={() => done(text)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.nativeEvent.isComposing || e.keyCode === 229) return;
            if (e.key === 'Enter') done(text);
            else if (e.key === 'Escape') done(null);
          }}
        />
      ) : (
        <h2>{data.title}</h2>
      )}
      {data.subtitle && <p>{data.subtitle}</p>}
    </div>
  );
}

export const TitleNode = memo(TitleNodeView);
