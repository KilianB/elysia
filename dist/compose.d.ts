import { L as LifeCycleStore, S as SchemaValidator, H as Handler, E as Elysia, P as PreHandler, d as ElysiaConfig, T as TraceReporter, e as ComposedHandler } from './context-wIpcitIo.js';
import { TAnySchema } from '@sinclair/typebox';
import '@sinclair/typebox/compiler';
import 'bun';
import '@sinclair/typebox/system';
import 'openapi-types';
import 'eventemitter3';

declare const hasReturn: (fnLiteral: string) => boolean;
declare const isFnUse: (keyword: string, fnLiteral: string) => boolean;
declare const hasType: (type: string, schema: TAnySchema) => any;
declare const hasProperty: (expectedProperty: string, schema: TAnySchema) => boolean | undefined;
declare const hasTransform: (schema: TAnySchema) => any;
declare const isAsync: (fn: Function) => boolean;
declare const composeHandler: ({ path, method, hooks, validator, handler, handleError, definitions, schema, onRequest, config, getReporter, setHeader }: {
    path: string;
    method: string;
    hooks: LifeCycleStore;
    validator: SchemaValidator;
    handler: unknown | Handler<any, any>;
    handleError: Elysia['handleError'];
    definitions?: {} | undefined;
    schema?: {} | undefined;
    onRequest: PreHandler<any, any>[];
    config: ElysiaConfig<any>;
    getReporter: () => TraceReporter;
    setHeader: Object | undefined;
}) => ComposedHandler;
declare const composeGeneralHandler: (app: Elysia<any, any, any, any, any, any>) => any;
declare const composeErrorHandler: (app: Elysia<any, any, any, any, any, any>) => any;

export { composeErrorHandler, composeGeneralHandler, composeHandler, hasProperty, hasReturn, hasTransform, hasType, isAsync, isFnUse };
