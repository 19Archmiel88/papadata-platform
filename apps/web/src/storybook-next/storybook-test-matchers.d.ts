import 'storybook/test';

declare module 'storybook/test' {
  interface Assertion<T = unknown> {
    toBe(expected: unknown): Promise<void>;
    toEqual(expected: unknown): Promise<void>;
    toBeNull(): Promise<void>;
    toBeGreaterThan(expected: number): Promise<void>;
    toBeCloseTo(expected: number, precision?: number): Promise<void>;
    toBeInTheDocument(): Promise<void>;
    toHaveAttribute(attribute: string, value?: string | RegExp): Promise<void>;
    toHaveAccessibleName(name?: string | RegExp): Promise<void>;
    toHaveClass(...classNames: string[]): Promise<void>;
    toHaveFocus(): Promise<void>;
    toHaveValue(value?: string | number | string[]): Promise<void>;
    toHaveTextContent(text: string | RegExp): Promise<void>;
    toHaveLength(length: number): Promise<void>;
    toBeRequired(): Promise<void>;
    toBeDisabled(): Promise<void>;
    toBeEnabled(): Promise<void>;
    toBeChecked(): Promise<void>;
    toHaveBeenCalled(): Promise<void>;
  }
}

export {};
