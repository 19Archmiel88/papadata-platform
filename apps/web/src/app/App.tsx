import { SessionProvider } from './providers';
import { AppRouter } from './routing';

export function App() {
  return (
    <SessionProvider>
      <AppRouter />
    </SessionProvider>
  );
}
