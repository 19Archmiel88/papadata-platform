import { createApplicationSessionContext, SessionContextProvider } from '../shell';
import { AuthOperationalScreen } from '../screens/auth/AuthOperationalScreen';

export function App() {
  const initialContext = createApplicationSessionContext();

  return (
    <SessionContextProvider initialContext={initialContext}>
      <AuthOperationalScreen initialScenario="login" theme="dark" />
    </SessionContextProvider>
  );
}
