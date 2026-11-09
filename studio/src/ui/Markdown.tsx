/**
 * Renders the Markdown subset of text blocks (engine/markdown.ts) as React
 * elements, never as HTML strings, so text from the model cannot inject markup.
 */
import { Fragment, type ReactNode } from 'react';
import { tableSize } from '../engine/blocks';
import { parseInline, parseMarkdown } from '../engine/markdown';

export function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((s, i) => s.bold ? <strong key={i}>{s.text}</strong>
        : s.italic ? <em key={i}>{s.text}</em>
        : s.code ? <code key={i}>{s.text}</code>
        : <Fragment key={i}>{s.text}</Fragment>)}
    </>
  );
}

/** A table whose column widths match the size estimate of the block. */
export function TableView({ columns, rows, maxWidth }: { columns: string[]; rows: string[][]; maxWidth: number }) {
  const { colWidths } = tableSize(columns, rows, maxWidth);
  return (
    <table className="md-table">
      <colgroup>{colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
      <thead>
        <tr>{columns.map((c, i) => <th key={i} scope="col"><Inline text={c} /></th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{r.map((c, j) => <td key={j}><Inline text={c} /></td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

export function Markdown({ text, width, anchor, skipFirstHeading = false }: {
  text: string;
  width: number;
  /** Prefix of the heading ids (`${anchor}-h${n}`, n counts the headings), for a table of contents. */
  anchor?: string;
  /** Leaves out a leading heading that is already shown as the title. */
  skipFirstHeading?: boolean;
}) {
  const out: ReactNode[] = [];
  let heading = 0;
  parseMarkdown(text).forEach((b, i) => {
    switch (b.type) {
      case 'heading': {
        const n = heading++;
        if (skipFirstHeading && i === 0) break;
        const Tag = (`h${b.level + 2}`) as 'h3' | 'h4' | 'h5';
        out.push(<Tag key={i} id={anchor != null ? `${anchor}-h${n}` : undefined} className={`md-h${b.level}`}><Inline text={b.text} /></Tag>);
        break;
      }
      case 'paragraph':
        out.push(<p key={i} className="md-p"><Inline text={b.text} /></p>);
        break;
      case 'quote':
        out.push(<blockquote key={i} className="md-quote"><Inline text={b.text} /></blockquote>);
        break;
      case 'code':
        out.push(<pre key={i} className="md-code">{b.text}</pre>);
        break;
      case 'rule':
        out.push(<hr key={i} className="md-hr" />);
        break;
      case 'list': {
        const Tag = b.ordered ? 'ol' : 'ul';
        out.push(
          <Tag key={i} className={b.ordered ? 'md-ol' : 'md-ul'}>
            {b.items.map((it, j) => (
              <li key={j} style={it.depth > 0 ? { marginLeft: it.depth * 16 } : undefined}><Inline text={it.text} /></li>
            ))}
          </Tag>,
        );
        break;
      }
      case 'table':
        out.push(<TableView key={i} columns={b.header} rows={b.rows} maxWidth={width} />);
        break;
    }
  });
  return <div className="md">{out}</div>;
}
