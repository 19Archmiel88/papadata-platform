import {
  useEffect,
  useState,
} from 'react';

import {
  SubscriptionBillingScreen,
} from '../../screens/subscription-billing/SubscriptionBillingScreen';
import type {
  SubscriptionBillingScreenData,
  SubscriptionBillingViewState,
} from '../../screens/subscription-billing/SubscriptionBillingScreen.model';
import {
  bffClient,
  BffProblem,
} from '../../runtime/shared/api/bffClient';
import {
  loadSubscriptionBillingRuntimeData,
} from './subscriptionBillingRuntimeAdapter';

type RuntimeState = {
  readonly data: SubscriptionBillingScreenData | null;
  readonly problem: string | null;
  readonly viewState: SubscriptionBillingViewState;
};

const initialState: RuntimeState = {
  data: null,
  problem: null,
  viewState: 'loading',
};

export function SubscriptionBillingPage() {
  const [state, setState] = useState<RuntimeState>(initialState);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setState(initialState);

    loadSubscriptionBillingRuntimeData(bffClient)
      .then((result) => {
        if (!active) return;
        setState({
          data: result.data,
          problem: null,
          viewState: result.partial ? 'partial' : 'ready',
        });
      })
      .catch((cause: unknown) => {
        if (!active) return;
        const forbidden = cause instanceof BffProblem && cause.status === 403;
        setState({
          data: null,
          problem: forbidden
            ? 'Twoja rola nie ma capability billing.read wymaganej do wyświetlenia danych rozliczeniowych.'
            : cause instanceof Error
              ? cause.message
              : 'Nie udało się pobrać danych rozliczeniowych.',
          viewState: forbidden ? 'forbidden' : 'error',
        });
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <SubscriptionBillingScreen
      data={state.data}
      onReload={() => setRefreshKey((current) => current + 1)}
      problem={state.problem}
      state={state.viewState}
    />
  );
}
