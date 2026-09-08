import { createContext, useContext } from 'react';
import { navigate } from '../../app/routing/navigation';
import type { ShellNavigate } from './shellTypes';
export const ShellNavigationContext = createContext<ShellNavigate>(navigate);
export const useShellNavigate = () => useContext(ShellNavigationContext);
