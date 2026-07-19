import type { Role } from './authz';
import type { PapaDataTheme, SystemState } from './ui';

export type FixtureMetadata = {
  description: string;
  id: string;
  roles: readonly Role[];
  state: SystemState;
  theme: PapaDataTheme;
};

export type StoryFixture<TData> = FixtureMetadata & {
  data: TData;
};
