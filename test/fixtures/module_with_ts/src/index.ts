import path from 'path';
import { Manifest } from '../../../../src';

const rootDir = path.resolve(__dirname, './');

export default ({
  items: [
    {
      path: path.resolve(rootDir, './test_service_a.ts'),
      extname: '.ts',
      filename: 'test_service_a.ts',
    },
    {
      path: path.resolve(rootDir, './test_service_b.ts'),
      extname: '.ts',
      filename: 'test_service_b.ts',
    },
  ],
}) as Manifest;
