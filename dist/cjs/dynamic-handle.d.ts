import { H as Handler, L as LifeCycleStore, S as SchemaValidator, E as Elysia, C as Context, c as ElysiaErrors } from './context-NYTVOt-X.js';
import '@sinclair/typebox';
import '@sinclair/typebox/compiler';
import 'bun';
import '@sinclair/typebox/system';
import 'openapi-types';
import 'eventemitter3';

type DynamicHandler = {
    handle: Handler<any, any>;
    content?: string;
    hooks: LifeCycleStore;
    validator?: SchemaValidator;
};
declare const createDynamicHandler: (app: Elysia<any, any, any, any, any, any>) => (request: Request) => Promise<Response>;
declare const createDynamicErrorHandler: (app: Elysia<any, any, any, any, any, any>) => (context: Context, error: ElysiaErrors) => Promise<Response>;

export { type DynamicHandler, createDynamicErrorHandler, createDynamicHandler };
