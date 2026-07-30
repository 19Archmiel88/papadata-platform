export type ComponentId = string;
export type TestId = string;
export type Locale = 'pl' | 'en';
export type Density = 'comfortable' | 'compact';
export type ComponentState = 'default' | 'loading' | 'disabled' | 'error' | 'empty' | 'readonly' | 'success';
export type ComponentVariant = 'default' | 'subtle' | 'strong' | 'critical' | 'success' | 'warning' | 'info';
export type AriaLive = 'off' | 'polite' | 'assertive';
export interface ComponentContext { tenantId: string; workspaceId: string; locale: Locale; density: Density; featureFlags?: string[]; }
export interface ComponentEvidence { evidenceId: string; label: string; source: string; confidence?: number; href?: string; }
export interface ComponentAction { actionId: string; label: string; kind: 'query' | 'command' | 'ui'; disabledReason?: string; requiresConfirmation?: boolean; }
export interface BaseComponentProps { id: ComponentId; testId?: TestId; context: ComponentContext; label?: string; description?: string | null; state?: ComponentState; variant?: ComponentVariant; ariaLabel?: string; ariaLive?: AriaLive; disabled?: boolean; disabledReason?: string; evidence?: ComponentEvidence[]; actions?: ComponentAction[]; }
export interface DataColumn { id: string; label: string; align?: 'left' | 'right' | 'center'; sortable?: boolean; width?: number; }
export interface DataRow { id: string; [key: string]: string | number | boolean | null | undefined; }
export interface ChartPoint { x: string; y: number | null; label?: string; confidenceLow?: number; confidenceHigh?: number; }
export interface ChartSeries { id: string; label: string; points: ChartPoint[]; unit?: string; }
export interface ComponentEvent<TPayload = Record<string, unknown>> { componentId: ComponentId; actionId: string; screenId?: string; correlationId: string; payload: TPayload; }
