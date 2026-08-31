import {
  commandCenterDemoSeed,
} from '../../fixtures/command-center/commandCenterDemoSeed';

import type {
  CommandCenterScreenData,
} from '../../screens/command-center/CommandCenterScreen.model';

export function createCommandCenterRuntimeData(): CommandCenterScreenData {
  return commandCenterDemoSeed;
}
