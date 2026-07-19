import type { ReactNode } from 'react';

import '../../../design-system/foundations/papadata-brand-surface.css';
import './component-canvas.css';

type ComponentShowcaseProps = {
  children: ReactNode;
  description: string;
  title: string;
};

type ComponentSpecRowProps = {
  children: ReactNode;
  description: string;
  label: string;
  wide?: boolean;
};

export function ComponentShowcase({
  children,
  description,
  title,
}: ComponentShowcaseProps) {
  return (
    <section className="pds-component-showcase">
      <header className="pds-component-showcase__header">
        <h1>{title}</h1>
        <p>{description}</p>
      </header>

      <div className="pds-component-showcase__content">
        {children}
      </div>
    </section>
  );
}

export function ComponentSpecRow({
  children,
  description,
  label,
  wide = false,
}: ComponentSpecRowProps) {
  return (
    <div
      className={[
        'pds-component-spec-row',
        wide ? 'pds-component-spec-row--wide' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <strong>{label}</strong>
      <p>{description}</p>

      <div className="pds-component-spec-row__demo">
        {children}
      </div>
    </div>
  );
}
