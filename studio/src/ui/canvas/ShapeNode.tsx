import { Handle, NodeToolbar, Position, type Node, type NodeProps } from '@xyflow/react';
import { memo, useEffect, useRef, useState } from 'react';
import { COLORS, type ColorName, type DNode, type NodeKind } from '../../engine/types';
import { Icon } from '../context';
import { resolveGcpIconUrl } from '../gcpIcons';
import { KIND_ICONS, resolveNodeIcon } from '../icons';
import { kindColor } from '../theme';

export { KIND_ICONS, resolveGcpIconUrl, resolveNodeIcon };

export type Highlight = 'added' | 'updated';

export interface ShapeData extends Record<string, unknown> {
  node: DNode;
  highlight?: Highlight;
  editing: boolean;
  /** Only one node is selected: show its toolbar. */
  single: boolean;
  onEditLabel: (id: string, label: string | null) => void;
  onStartEdit: (id: string) => void;
  onColor: (id: string, color: ColorName | 'none') => void;
  onDelete: (id: string) => void;
}

export type ShapeNodeType = Node<ShapeData, 'shape'>;

const FLOW_SHAPES = new Set<NodeKind>(['process', 'decision', 'start', 'end', 'io', 'document', 'subprocess', 'note']);

const PROVIDER_LABEL: Record<string, string> = { gcp: 'Google Cloud', aws: 'AWS', azure: 'Azure', k8s: 'Kubernetes', onprem: 'On-prem' };

function LabelEditor({ value, onDone }: { value: string; onDone: (v: string | null) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(value);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <textarea
      ref={ref}
      className="label-editor nodrag nopan"
      value={text}
      rows={2}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => onDone(text)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.nativeEvent.isComposing || e.keyCode === 229) return;
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onDone(text);
        } else if (e.key === 'Escape') {
          onDone(null);
        }
      }}
    />
  );
}

function ShapeNodeView({ data, selected }: NodeProps<ShapeNodeType>) {
  const { node, highlight, editing } = data;
  const color = node.color ?? kindColor(node.kind);
  const flow = FLOW_SHAPES.has(node.kind);
  const caption = node.tech;
  const gcpIcon = flow ? null : resolveGcpIconUrl(node);
  const [iconFailed, setIconFailed] = useState(false);
  useEffect(() => {
    setIconFailed(false);
  }, [gcpIcon]);
  const showGcpIcon = Boolean(gcpIcon && !iconFailed);
  const label = editing
    ? <LabelEditor value={node.label} onDone={(v) => data.onEditLabel(node.id, v)} />
    : <div className="node-label">{node.label}</div>;

  const handles = (
    <>
      <Handle id="t" type="source" position={Position.Top} className="handle" />
      <Handle id="r" type="source" position={Position.Right} className="handle" />
      <Handle id="b" type="source" position={Position.Bottom} className="handle" />
      <Handle id="l" type="source" position={Position.Left} className="handle" />
    </>
  );

  const className = [
    'shape', flow ? `flow flow-${node.kind}` : `card kind-${node.kind}`, `color-${color}`,
    selected ? 'selected' : '', highlight ? `hl-${highlight}` : '',
  ].join(' ');

  return (
    <>
      <NodeToolbar isVisible={selected && data.single && !editing} position={Position.Top} offset={10}>
        <div className="node-toolbar" role="toolbar" aria-label="Node actions">
          <button type="button" className="tb-btn" onClick={() => data.onStartEdit(node.id)} aria-label="Rename" data-tooltip="Rename (Enter)">
            <Icon name="edit" size={18} />
          </button>
          <span className="tb-sep" />
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`swatch color-${c}${node.color === c ? ' active' : ''}`}
              aria-label={`Color ${c}`}
              data-tooltip={c[0].toUpperCase() + c.slice(1)}
              onClick={() => data.onColor(node.id, node.color === c ? 'none' : c)}
            />
          ))}
          <span className="tb-sep" />
          <button type="button" className="tb-btn" onClick={() => data.onDelete(node.id)} aria-label="Delete" data-tooltip="Delete (Del)">
            <Icon name="delete" size={18} />
          </button>
        </div>
      </NodeToolbar>
      <div className={className} style={{ width: node.w, height: node.h }} onDoubleClick={() => data.onStartEdit(node.id)}>
        {flow ? (
          <>
            {(node.kind === 'decision' || node.kind === 'io' || node.kind === 'document') && (
              <svg className="flow-bg" viewBox={`0 0 ${node.w} ${node.h}`} preserveAspectRatio="none" aria-hidden="true">
                {node.kind === 'decision' && <polygon points={`${node.w / 2},1 ${node.w - 1},${node.h / 2} ${node.w / 2},${node.h - 1} 1,${node.h / 2}`} />}
                {node.kind === 'io' && <polygon points={`18,1 ${node.w - 1},1 ${node.w - 18},${node.h - 1} 1,${node.h - 1}`} />}
                {node.kind === 'document' && <path d={`M1,1 H${node.w - 1} V${node.h - 6} C${node.w * 0.72},${node.h - 14} ${node.w * 0.28},${node.h + 6} 1,${node.h - 4} Z`} />}
              </svg>
            )}
            <div className="flow-content">
              {label}
              {caption && <div className="node-caption">{caption}</div>}
            </div>
          </>
        ) : (
          <>
            <div className={`node-icon${showGcpIcon ? ' has-gcp-svg' : ''}`}>
              {showGcpIcon
                ? <img className="gcp-node-icon" src={gcpIcon!} alt="" width={24} height={24} decoding="async" draggable={false} onError={() => setIconFailed(true)} />
                : <Icon name={resolveNodeIcon(node)} size={22} />}
            </div>
            <div className="node-text">
              {label}
              {(caption || node.description) && (
                <div className="node-caption" title={[caption, node.description].filter(Boolean).join(' — ')}>
                  {caption}{caption && node.description ? ' · ' : ''}{node.description}
                </div>
              )}
            </div>
            {node.provider && node.provider !== 'generic' && (
              <span className={`provider provider-${node.provider}`} title={PROVIDER_LABEL[node.provider]}>
                {node.provider === 'k8s' ? 'K8s' : node.provider.toUpperCase()}
              </span>
            )}
          </>
        )}
        {handles}
      </div>
    </>
  );
}

export const ShapeNode = memo(ShapeNodeView);
