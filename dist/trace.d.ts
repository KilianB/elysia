import { T as TraceReporter, a as TraceHandler, b as TraceStream } from './context-wIpcitIo.js';
import '@sinclair/typebox';
import '@sinclair/typebox/compiler';
import 'bun';
import '@sinclair/typebox/system';
import 'openapi-types';
import 'eventemitter3';

declare const createTraceListener: (getReporter: () => TraceReporter, totalListener: number, handler: TraceHandler<any, any>) => (trace: TraceStream) => Promise<void>;

export { createTraceListener };
