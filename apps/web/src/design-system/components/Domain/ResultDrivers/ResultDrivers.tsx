import type {
  ContractResultDriversProps,
  HTMLAttributes,
} from '../domainShared';
import {
  StatusBadge,
  TextAction,
  formatSignedNumber,
  forwardRef,
  joinClassNames,
  useId,
} from '../domainShared';

export type ResultDriversProps =
  ContractResultDriversProps & HTMLAttributes<HTMLElement>;

export const ResultDrivers = forwardRef<HTMLElement, ResultDriversProps>(
  function ResultDrivers(
    {
      baselineValue,
      className,
      currentValue,
      drivers,
      onInspectDriver,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const delta = currentValue - baselineValue;

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-result-drivers', className)}
      >
        <header className="pd-result-drivers__header">
          <div>
            <p>Drivery wyniku</p>
            <h2 id={titleId}>Wpływ czynników na zmianę</h2>
          </div>
          <StatusBadge
            status="Zmiana"
            text={formatSignedNumber(delta)}
            tone={delta >= 0 ? 'success' : 'warning'}
          />
        </header>

        <ul className="pd-result-drivers__list">
          {drivers.map((driver) => (
            <li key={driver.id} data-direction={driver.direction}>
              <div>
                <strong>{driver.label}</strong>
                <span>{driver.evidence.length} dowody</span>
              </div>
              <span>{formatSignedNumber(driver.contribution)}</span>
              {onInspectDriver ? (
                <TextAction
                  size="small"
                  onClick={() => {
                    onInspectDriver({
                      action: 'inspect-driver',
                      componentId: 'ResultDrivers',
                      driverId: driver.id,
                    });
                  }}
                >
                  Inspekcja
                </TextAction>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    );
  },
);
