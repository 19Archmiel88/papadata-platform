import type { BaseComponentProps, ComponentEvent } from '../component-shared';

export interface FileInputProps extends BaseComponentProps {
  accept: string[];
  multiple: boolean;
  maxFiles: number;
  maxBytes: number;
  files: Array<{ id: string; name: string; bytes: number; status: 'ready' | 'uploading' | 'failed' }>;
}

export type FileInputEvent = ComponentEvent<{ type: 'fileinput'; value?: string | number | boolean | null }>;
