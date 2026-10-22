import { LucideIconData } from 'lucide-angular';

// Local solid counterparts for the four outline Lucide navigation icons.
// Cutouts stay transparent so they work with the shared active surface token.
export const HouseSolid: LucideIconData = [
  ['path', { fill: 'currentColor', stroke: 'none', 'fill-rule': 'evenodd',
    d: 'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M9 21v-8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v8Z' }],
];

export const ShoppingCartSolid: LucideIconData = [
  ['path', { d: 'M2 2h3l1 5h16l-1.7 7.4a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L4 4H2Z', fill: 'currentColor', stroke: 'none' }],
  ['circle', { cx: '8', cy: '20', r: '2', fill: 'currentColor', stroke: 'none' }],
  ['circle', { cx: '19', cy: '20', r: '2', fill: 'currentColor', stroke: 'none' }],
];

export const BoxSolid: LucideIconData = [
  ['path', { d: 'M12 2 21 7 12 12 3 7Z M3 9l8 4.5V22l-8-4.5Z M21 9l-8 4.5V22l8-4.5Z', fill: 'currentColor', stroke: 'none' }],
];

export const MoreGridSolid: LucideIconData = [
  ['rect', { x: '3', y: '3', width: '8', height: '8', rx: '2', fill: 'currentColor', stroke: 'none' }],
  ['rect', { x: '13', y: '3', width: '8', height: '8', rx: '2', fill: 'currentColor', stroke: 'none' }],
  ['rect', { x: '3', y: '13', width: '8', height: '8', rx: '2', fill: 'currentColor', stroke: 'none' }],
  ['rect', { x: '13', y: '13', width: '8', height: '8', rx: '2', fill: 'currentColor', stroke: 'none' }],
];
