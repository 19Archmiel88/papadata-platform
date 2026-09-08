import type { Meta } from '@storybook/react-vite';
import * as stories from './SavedReports.story-support';
export default {
  title: 'RAPORTY/Zapisane raporty/Sekcje',
  parameters: { layout: 'fullscreen', a11y: { test: 'error' } },
} satisfies Meta;
export const Products = { ...stories.Products, name: 'Rentowność produktów' };
export const Inventory = { ...stories.Inventory, name: 'Zapasy i dostępność' };
export const Orders = { ...stories.Orders, name: 'Realizacja zamówień' };
export const Templates = { ...stories.Templates, name: 'Wybór szablonu' };
export const History = { ...stories.History, name: 'Historia i porównanie' };
export const Export = { ...stories.Export, name: 'Eksport i udostępnianie' };
