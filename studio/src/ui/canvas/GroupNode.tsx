import type { Node, NodeProps } from '@xyflow/react';
import { memo } from 'react';
import type { DGroup, GroupKind } from '../../engine/types';
import { Icon } from '../context';
import type { IconName } from '../icons';
import type { Highlight } from './ShapeNode';

export interface GroupData extends Record<string, unknown> {
  group: DGroup;
  w: number;
  h: number;
  depth: number;
  highlight?: Highlight;
}

export type GroupNodeType = Node<GroupData, 'group'>;

const GROUP_ICONS: Record<GroupKind, IconName> = {
  region: 'public', vpc: 'cloud', subnet: 'lan', cluster: 'hub', zone: 'group_work',
  system: 'schema', lane: 'swap_horiz', boundary: 'polyline', generic: 'group_work',
};

function GroupNodeView({ data, selected }: NodeProps<GroupNodeType>) {
  const { group, w, h, depth, highlight } = data;
  const color = group.color ?? (depth === 0 ? 'blue' : depth === 1 ? 'gray' : 'teal');
  return (
    <div
      className={`group-box kind-${group.kind} color-${color} depth-${Math.min(depth, 3)}${selected ? ' selected' : ''}${highlight ? ` hl-${highlight}` : ''}`}
      style={{ width: w, height: h }}
    >
      <div className="group-header">
        <Icon name={GROUP_ICONS[group.kind]} size={16} />
        <span>{group.label}</span>
      </div>
    </div>
  );
}

export const GroupNode = memo(GroupNodeView);
