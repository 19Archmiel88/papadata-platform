import type {
  ReactElement,
  ReactNode,
} from 'react';

declare module '@storybook/react-vite' {
  export type StorybookCanvasElement = HTMLElement;

  export type StorybookPlayContext = {
    readonly canvasElement: StorybookCanvasElement;
    readonly step: (
      label: string,
      callback: () => Promise<void> | void,
    ) => Promise<void>;
  };

  export type Meta<TComponentOrArgs = unknown> = {
    readonly title?: string;
    readonly component?: unknown;
    readonly args?: any;
    readonly argTypes?: any;
    readonly decorators?: readonly unknown[];
    readonly parameters?: any;
    readonly tags?: readonly string[];
  };

  export type StoryObj<TMetaOrComponent = unknown> = {
    readonly name?: string;
    readonly args?: any;
    readonly argTypes?: any;
    readonly decorators?: readonly unknown[];
    readonly parameters?: any;
    readonly tags?: readonly string[];
    readonly render?: (
      args: any,
    ) => ReactElement | ReactNode;
    readonly play?: (
      context: StorybookPlayContext,
    ) => Promise<void> | void;
  } & Record<string, unknown>;
}

export {};
