import { createLocalAuthGateway } from '../../auth/localAuthGateway';
import { localTestAuthFieldDefaults } from '../../fixtures/auth-local-test-defaults';
import {
  AuthOperationalScreen,
  type AuthOperationalScreenProps,
} from '../../screens/auth/AuthOperationalScreen';

export function renderLocalAuthStory(args: AuthOperationalScreenProps) {
  return (
    <AuthOperationalScreen
      {...args}
      fieldDefaults={localTestAuthFieldDefaults}
      gatewayFactory={createLocalAuthGateway}
    />
  );
}
