import React from 'react';
import { MarkerType } from 'react-flow-renderer';

export const nodes = [
  {
    id: '0000000000000',
    type: 'input',
    data: {
      label: '節點1',
    },
    position: { x: 100, y: 100 },
  },
  {
    id: '0000000000001',
    data: {
      label: '節點2',
    },
    position: { x: 100, y: 200 },
  }
];

export const edges = [
  { id: 'e1-2', source: '1', target: '2', label: 'this is an edge label' }
];