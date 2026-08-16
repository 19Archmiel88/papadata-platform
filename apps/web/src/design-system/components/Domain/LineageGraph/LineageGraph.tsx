import type {
  ContractLineageGraphProps,
  HTMLAttributes,
} from '../domainShared';
import {
  StatusBadge,
  TextAction,
  forwardRef,
  joinClassNames,
  resolveReadinessLabel,
  resolveReadinessTone,
  useId,
} from '../domainShared';

export type LineageGraphProps =
  ContractLineageGraphProps & HTMLAttributes<HTMLElement>;

export const LineageGraph = forwardRef<HTMLElement, LineageGraphProps>(
  function LineageGraph(
    {
      className,
      edges,
      nodes,
      onOpenNode,
      rootRecordId,
      ...props
    },
    ref,
  ) {
    const titleId = useId();

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-lineage-graph', className)}
      >
        <header className="pd-lineage-graph__header">
          <div>
            <p>{rootRecordId}</p>
            <h2 id={titleId}>Pochodzenie danych</h2>
          </div>
          <StatusBadge
            status="Węzły"
            text={`${nodes.length}`}
            tone="info"
          />
        </header>
        <ol className="pd-lineage-graph__nodes">
          {nodes.map((node) => (
            <li key={node.id}>
              <div>
                <strong>{node.label}</strong>
                <span>{node.type}</span>
              </div>
              <StatusBadge
                status="Stan danych"
                text={resolveReadinessLabel(node.status)}
                tone={resolveReadinessTone(node.status)}
              />
              {onOpenNode ? (
                <TextAction
                  size="small"
                  onClick={() => {
                    onOpenNode({
                      action: 'open-node',
                      componentId: 'LineageGraph',
                      nodeId: node.id,
                    });
                  }}
                >
                  Otwórz
                </TextAction>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="pd-lineage-graph__edges" role="status">
          Relacje pochodzenia: {edges.length}
        </p>
      </section>
    );
  },
);
