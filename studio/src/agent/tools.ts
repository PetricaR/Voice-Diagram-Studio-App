/**
 * Function declarations of the voice agent (Gemini API schema). Edits are
 * typed lists of operations on ids, so the model changes only what it names.
 */
import { ARROWS, COLORS, DIAGRAM_TYPES, EDGE_STYLES, GROUP_KINDS, NODE_KINDS, PROVIDERS } from '../engine/types';

type Schema = Record<string, unknown>;

const str = (description: string): Schema => ({ type: 'STRING', description });
const enumOf = (values: readonly string[], description: string): Schema =>
  ({ type: 'STRING', format: 'enum', enum: [...values], description });
const arrayOf = (items: Schema, description: string): Schema => ({ type: 'ARRAY', items, description });
const obj = (properties: Record<string, Schema>, required: string[], description?: string): Schema =>
  ({ type: 'OBJECT', properties, required, ...(description ? { description } : {}) });

const nodeFields = {
  id: str('Short lowercase English snake_case id, e.g. "orders_db". Never changes.'),
  label: str('Short label shown on the canvas, in the user\'s language.'),
  kind: enumOf(NODE_KINDS, 'What the node is; decides its shape and icon.'),
  tech: str('Technology or product, e.g. "Cloud Run", "PostgreSQL", "Kafka".'),
  provider: enumOf(PROVIDERS, 'Cloud provider of the product.'),
  description: str('Optional one-line description (C4 responsibilities).'),
  group: str('Id of the group (boundary) that contains the node.'),
  color: enumOf(COLORS, 'Only when the user asks for a color.'),
};

const edgeFields = {
  from: str('Id of the source node.'),
  to: str('Id of the target node.'),
  label: str('Protocol or intent, e.g. "HTTPS", "publishes", "Yes".'),
  style: enumOf(EDGE_STYLES, 'dashed for asynchronous messages and events.'),
  arrow: enumOf(ARROWS, 'Arrow heads, forward by default.'),
};

const groupFields = {
  id: str('Short lowercase English snake_case id.'),
  label: str('Label of the group, e.g. "Production VPC".'),
  kind: enumOf(GROUP_KINDS, 'What the group is.'),
  parent: str('Id of the enclosing group.'),
  color: enumOf(COLORS, 'Only when the user asks for a color.'),
};

export const TOOL_DECLARATIONS = [
  {
    name: 'create_diagram',
    description: 'Draws a complete new diagram, laid out automatically. Only when the current page is empty, or the ' +
      'user asks for a new, separate diagram (new_page: true opens it on a new page and keeps the current one), or ' +
      'explicitly asks to replace this one / start over (replace: true). Every other change is edit_diagram. ' +
      'Returns the diagram state.',
    behavior: 'NON_BLOCKING',
    parameters: obj({
      diagram_type: enumOf(DIAGRAM_TYPES, 'Kind of diagram.'),
      direction: enumOf(['LR', 'TB'], 'LR (left to right) for architectures, TB (top to bottom) for flowcharts.'),
      title: str('Title shown above the diagram and on its page tab, e.g. "Checkout on Google Cloud".'),
      subtitle: str('Optional line under the title, e.g. scope, environment or version.'),
      groups: arrayOf(obj(groupFields, ['id', 'label']), 'Boundaries, e.g. cloud, region, VPC, cluster.'),
      nodes: arrayOf(obj(nodeFields, ['id', 'label', 'kind']), 'All nodes.'),
      edges: arrayOf(obj(edgeFields, ['from', 'to']), 'All connections.'),
      new_page: { type: 'BOOLEAN', description: 'True to draw it on a new page (tab) and keep the current diagram. Use for every new, separate or additional diagram when the current page is not empty.' },
      replace: { type: 'BOOLEAN', description: 'True to replace the diagram on the current page (only when the user explicitly asks to replace it or start over).' },
    }, ['diagram_type', 'nodes']),
  },
  {
    name: 'edit_diagram',
    description: 'Changes the diagram on the canvas with the smallest set of operations; everything not named stays ' +
      'exactly as it is, positions included. All operations of one request in one call. Returns the new state, or ' +
      'errors without changing anything.',
    behavior: 'NON_BLOCKING',
    parameters: obj({
      base_version: { type: 'INTEGER', description: 'Version of the state this edit is based on.' },
      summary: str('What changed, at most 8 words, in the user\'s language (shown in the history).'),
      add_nodes: arrayOf(obj({
        ...nodeFields,
        near: str('Only if the user says where: id of the node to put it next to.'),
        side: enumOf(['right', 'left', 'above', 'below'], 'Only if the user says where: side of near.'),
      }, ['id', 'label', 'kind']), 'New nodes.'),
      update_nodes: arrayOf(obj({
        id: str('Id of the node, or "@selected" for the selected nodes.'),
        label: nodeFields.label,
        kind: nodeFields.kind,
        tech: nodeFields.tech,
        provider: nodeFields.provider,
        description: nodeFields.description,
        group: str('Id of the group to move it into, or "none" to take it out of its group.'),
        color: enumOf([...COLORS, 'none'], 'Color, or none for the default.'),
      }, ['id']), 'Changes to existing nodes: only the given fields change.'),
      remove_nodes: arrayOf(str('Node id or "@selected".'), 'Nodes to remove, with their connections.'),
      add_edges: arrayOf(obj(edgeFields, ['from', 'to']), 'New connections.'),
      update_edges: arrayOf(obj({
        from: edgeFields.from,
        to: edgeFields.to,
        label: str('New label, or "" to remove it.'),
        style: edgeFields.style,
        arrow: edgeFields.arrow,
        new_from: str('Reconnect: id of the new source node.'),
        new_to: str('Reconnect: id of the new target node.'),
        reverse: { type: 'BOOLEAN', description: 'Swap the direction.' },
      }, ['from', 'to']), 'Changes to existing connections, found by their two nodes.'),
      remove_edges: arrayOf(obj({
        from: edgeFields.from,
        to: edgeFields.to,
        label: str('Only to pick one of several connections between the same nodes.'),
      }, ['from', 'to']), 'Connections to remove.'),
      add_groups: arrayOf(obj({
        ...groupFields,
        members: arrayOf(str('Node id or "@selected".'), 'Existing nodes to move into the group.'),
      }, ['id', 'label']), 'New groups.'),
      update_groups: arrayOf(obj({
        id: str('Id of the group.'),
        label: groupFields.label,
        kind: groupFields.kind,
        parent: str('Id of the new enclosing group, or "none".'),
        color: enumOf([...COLORS, 'none'], 'Color, or none for the default.'),
        add_members: arrayOf(str('Node id or "@selected".'), 'Nodes to move into the group.'),
        remove_members: arrayOf(str('Node id.'), 'Nodes to take out of the group.'),
      }, ['id']), 'Changes to existing groups.'),
      remove_groups: arrayOf(str('Group id.'), 'Groups to remove; their nodes stay.'),
      remove_blocks: arrayOf(str('Id of a documentation chapter (text or table), or "@selected" for the open chapter.'),
        'Chapters of the documentation to remove.'),
      title: str('New title of the diagram (also renames its page).'),
      subtitle: str('New line under the title, or "" to remove it.'),
      confirm_large_removal: {
        type: 'BOOLEAN',
        description: 'Only when the user explicitly asked to remove more than a third of the diagram.',
      },
    }, ['summary']),
  },
  {
    name: 'write_text',
    description: 'Writes one chapter of the documentation of the current page. The documentation is not on the ' +
      'canvas: it is a book in its own tab, with a table of contents (chapters, and the "## " headings of each ' +
      'chapter as its sections), and it opens at this chapter. Use it for overviews, descriptions of the ' +
      'architecture, data flows, decisions, risks, runbooks, notes. With the id of an existing chapter it rewrites ' +
      'that chapter (append: true adds to its end). Returns the state.',
    behavior: 'NON_BLOCKING',
    parameters: obj({
      id: str('Short snake_case id of a new chapter (e.g. "overview"), or the id of an existing chapter to rewrite.'),
      title: str('Title of the chapter in the table of contents, e.g. "Overview", "Data flow", "Security".'),
      text: str('Markdown body of the chapter, without the chapter title: "## " section headings, "- " bullets, ' +
        '"1. " steps, **bold**, `code`, "| a | b |" tables. Specific to the elements of the diagram, in the user\'s language.'),
      append: { type: 'BOOLEAN', description: 'Add the text to the end of the existing chapter instead of replacing it.' },
      after: str('Only to set the reading order: id of the chapter this one follows, or "start". New chapters go at the end.'),
      summary: str('What changed, at most 8 words (shown in the history).'),
    }, ['text']),
  },
  {
    name: 'write_table',
    description: 'Writes a table as a chapter of the documentation (its own tab, a book with a table of contents), ' +
      'e.g. components and responsibilities, ports and protocols, costs, SLAs, a comparison. With the id of an ' +
      'existing table it replaces its columns and rows (append: true adds the rows). Returns the state.',
    behavior: 'NON_BLOCKING',
    parameters: obj({
      id: str('Short snake_case id of a new table (e.g. "components"), or the id of an existing table to rewrite.'),
      title: str('Title of the chapter, e.g. "Components".'),
      columns: arrayOf(str('Column header.'), 'Column headers, 2 to 6 short ones.'),
      rows: arrayOf(arrayOf(str('Cell text.'), 'One row: one cell per column.'), 'Rows of the table.'),
      append: { type: 'BOOLEAN', description: 'Add the rows to the existing table instead of replacing them.' },
      after: str('Only to set the reading order: id of the chapter this one follows, or "start". New chapters go at the end.'),
      summary: str('What changed, at most 8 words (shown in the history).'),
    }, ['columns', 'rows']),
  },
  {
    name: 'new_page',
    description: 'Opens a new empty page (tab) after the current one and switches to it. To draw a new diagram on ' +
      'a new page in one step, use create_diagram with new_page: true instead.',
    behavior: 'NON_BLOCKING',
    parameters: obj({ title: str('Name of the page (the title of its diagram).') }, []),
  },
  {
    name: 'switch_page',
    description: 'Shows a page (tab): its diagram, or its documentation tab ("open the docs", "show the ' +
      'documentation", "back to the diagram"). Later tool calls act on that page.',
    behavior: 'NON_BLOCKING',
    parameters: obj({
      page: str('Page id, name, or number ("2"), or "next", "previous", "last"; the current page if omitted.'),
      view: enumOf(['diagram', 'documentation'], 'What to show: the diagram (default) or the documentation tab of the page.'),
      chapter: str('Id or title of the chapter to open in the documentation.'),
    }, []),
  },
  {
    name: 'rename_page',
    description: 'Renames a page (its diagram title).',
    behavior: 'NON_BLOCKING',
    parameters: obj({
      page: str('Page id, name or number; the current page if omitted.'),
      title: str('New name.'),
    }, ['title']),
  },
  {
    name: 'delete_page',
    description: 'Closes a page (tab) when the user asks to delete or close it. Its diagram stays in the diagram history.',
    behavior: 'NON_BLOCKING',
    parameters: obj({ page: str('Page id, name or number; the current page if omitted.') }, []),
  },
  {
    name: 'change_view',
    description: 'Moves the view of the canvas, only when the user asks: zoom in or out, fit the whole diagram, ' +
      '100 %, or focus on some elements.',
    behavior: 'NON_BLOCKING',
    parameters: obj({
      action: enumOf(['zoom_in', 'zoom_out', 'fit', 'actual_size', 'focus'], 'What to do with the view.'),
      targets: arrayOf(str('Id of a node or group (or of a chapter, which opens it in the documentation tab).'),
        'For focus: the elements to zoom to.'),
    }, ['action']),
  },
  {
    name: 'tidy_layout',
    description: 'Lays out the whole diagram again, keeping its order. Only when the user asks to tidy up, ' +
      'rearrange, or change the direction.',
    behavior: 'NON_BLOCKING',
    parameters: obj({
      direction: enumOf(['LR', 'TB'], 'New direction, if the user asked for one.'),
    }, []),
  },
  {
    name: 'get_diagram',
    description: 'Returns the current state of the canvas (the user may have changed it by hand) and the selection.',
    behavior: 'NON_BLOCKING',
  },
  {
    name: 'search_catalog',
    description: 'Searches the Gen AI Technical Blueprints & Cloud Architecture RAG knowledge base for reference ' +
      'architectures (Customer, Employee/RAG, Data/NL2SQL, Code/DevOps, Creative/Commerce, Security/SecOps agents, ' +
      'Three-Tier HA, Multi-Cloud Zero-Trust) and official cloud/AI components across all layers and providers.',
    behavior: 'NON_BLOCKING',
    parameters: obj({
      query: str('Search query: use case, industry, agent type, architectural layer, or component (e.g. "rag document ai", "customer agent", "secops", "vector database").'),
      provider: enumOf(PROVIDERS, 'Optional cloud provider filter ("gcp", "aws", "azure", "k8s", "onprem").'),
      category: enumOf(['customer', 'employee', 'data', 'code', 'creative', 'security', 'architecture', 'flowchart'], 'Optional blueprint category filter.'),
    }, ['query']),
  },
  {
    name: 'undo',
    description: 'Undoes the last change(s) on the canvas.',
    behavior: 'NON_BLOCKING',
    parameters: obj({ steps: { type: 'INTEGER', description: 'Number of changes to undo, 1 by default.' } }, []),
  },
  {
    name: 'redo',
    description: 'Redoes changes that were undone.',
    behavior: 'NON_BLOCKING',
    parameters: obj({ steps: { type: 'INTEGER', description: 'Number of changes to redo, 1 by default.' } }, []),
  },
];
