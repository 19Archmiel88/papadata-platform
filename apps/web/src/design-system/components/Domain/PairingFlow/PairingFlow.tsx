import type {
  ContractPairingFlowProps,
  HTMLAttributes,
} from '../domainShared';
import {
  Button,
  StatusBadge,
  forwardRef,
  joinClassNames,
  resolveDevicePairingLabel,
  resolvePairingStepLabel,
  resolvePairingStepTone,
  useId,
} from '../domainShared';

export type PairingFlowProps =
  ContractPairingFlowProps & HTMLAttributes<HTMLElement>;

export const PairingFlow = forwardRef<HTMLElement, PairingFlowProps>(
  function PairingFlow(
    {
      className,
      deviceStatus = undefined,
      onCancel,
      onConfirm,
      onStart,
      provider,
      sessionId = undefined,
      steps,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const activeChallenge = steps.find((step) => step.challengeCode);

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-pairing-flow', className)}
      >
        <header className="pd-pairing-flow__header">
          <div>
            <p>{provider}</p>
            <h2 id={titleId}>Parowanie integracji</h2>
          </div>
          {deviceStatus ? (
            <StatusBadge
              status="Urządzenie"
              text={resolveDevicePairingLabel(deviceStatus)}
              tone={deviceStatus === 'paired' ? 'success' : 'warning'}
            />
          ) : null}
        </header>
        <ol className="pd-pairing-flow__steps">
          {steps.map((step) => (
            <li key={step.id}>
              <div>
                <strong>{step.label}</strong>
                {step.challengeCode ? (
                  <span>Kod: {step.challengeCode}</span>
                ) : null}
              </div>
              <StatusBadge
                status="Krok"
                text={resolvePairingStepLabel(step.status)}
                tone={resolvePairingStepTone(step.status)}
              />
            </li>
          ))}
        </ol>
        <div className="pd-pairing-flow__actions">
          <Button
            size="small"
            onClick={() => {
              onStart({
                action: 'start-pairing',
                componentId: 'PairingFlow',
                provider,
              });
            }}
          >
            Rozpocznij
          </Button>
          <Button
            disabled={!activeChallenge}
            size="small"
            variant="secondary"
            onClick={() => {
              if (!activeChallenge?.challengeCode) {
                return;
              }

              onConfirm({
                action: 'confirm-pairing',
                challengeCode: activeChallenge.challengeCode,
                componentId: 'PairingFlow',
                itemId: sessionId,
              });
            }}
          >
            Potwierdź kod
          </Button>
          {onCancel ? (
            <Button
              size="small"
              variant="ghost"
              onClick={() => {
                onCancel({
                  action: 'cancel-pairing',
                  componentId: 'PairingFlow',
                  itemId: sessionId,
                });
              }}
            >
              Anuluj
            </Button>
          ) : null}
        </div>
      </section>
    );
  },
);
