import { BaseEdge, EdgeLabelRenderer, type Edge, type EdgeProps } from '@xyflow/react';
import { memo } from 'react';
import { roundedPath, type Route } from '../../engine/routing';
import type { DEdge } from '../../engine/types';

export interface EdgeData extends Record<string, unknown> {
  edge: DEdge;
  /** Computed by the canvas around all nodes (engine/routing.ts). */
  route: Route;
  highlight?: boolean;
}

export type FloatingEdgeType = Edge<EdgeData, 'floating'>;

function FloatingEdgeView({ id, data, selected }: EdgeProps<FloatingEdgeType>) {
  if (data == null || data.route.points.length < 2) return null;
  const { edge, highlight, route } = data;
  const state = selected ? 'selected' : highlight ? 'highlight' : 'default';
  const arrow = edge.arrow ?? 'forward';
  return (
    <>
      <BaseEdge
        id={id}
        path={roundedPath(route.points)}
        className={`edge edge-${edge.style ?? 'solid'} edge-${state}`}
        markerEnd={arrow !== 'none' ? `url(#arrow-${state})` : undefined}
        markerStart={arrow === 'both' ? `url(#arrow-${state})` : undefined}
        interactionWidth={16}
      />
      {edge.label && (
        <EdgeLabelRenderer>
          <div
            className={`edge-label edge-label-${state} nodrag nopan`}
            style={{ transform: `translate(-50%, -50%) translate(${route.label.x}px, ${route.label.y}px)` }}
          >
            {edge.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const FloatingEdge = memo(FloatingEdgeView);

/** Arrow heads, styled by CSS (one per edge state). */
export function EdgeMarkers() {
  return (
    <svg className="edge-markers" aria-hidden="true">
      <defs>
        {['default', 'highlight', 'selected'].map((state) => (
          <marker
            key={state}
            id={`arrow-${state}`}
            viewBox="0 0 12 12"
            refX="10"
            refY="6"
            markerWidth="12"
            markerHeight="12"
            markerUnits="userSpaceOnUse"
            orient="auto-start-reverse"
          >
            <path d="M1,1.5 L10.5,6 L1,10.5 Z" className={`marker-${state}`} />
          </marker>
        ))}
      </defs>
    </svg>
  );
}
