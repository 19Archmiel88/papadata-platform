import type {
  ContractCohortMatrixProps,
  HTMLAttributes,
} from '../domainShared';
import {
  TextAction,
  formatPercent,
  forwardRef,
  joinClassNames,
  useId,
} from '../domainShared';

export type CohortMatrixProps =
  ContractCohortMatrixProps & HTMLAttributes<HTMLElement>;

export const CohortMatrix = forwardRef<HTMLElement, CohortMatrixProps>(
  function CohortMatrix(
    {
      className,
      cohortMetric,
      columns,
      onSelectCohort,
      rows,
      selectedCohortId = null,
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
        className={joinClassNames('pd-cohort-matrix', className)}
      >
        <header className="pd-cohort-matrix__header">
          <div>
            <p>{cohortMetric}</p>
            <h2 id={titleId}>Macierz kohort</h2>
          </div>
        </header>
        <div className="pd-cohort-matrix__scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Kohorta</th>
                {columns.map((column) => (
                  <th key={column} scope="col">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.cohortId} data-selected={row.cohortId === selectedCohortId ? true : undefined}>
                  <th scope="row">
                    {onSelectCohort ? (
                      <TextAction
                        size="small"
                        onClick={() => {
                          onSelectCohort({
                            action: 'select-cohort',
                            cohortId: row.cohortId,
                            componentId: 'CohortMatrix',
                          });
                        }}
                      >
                        {row.label}
                      </TextAction>
                    ) : row.label}
                  </th>
                  {row.values.map((value, index) => (
                    <td key={`${row.cohortId}-${columns[index]}`}>
                      {value === null ? 'Brak danych' : formatPercent(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  },
);
