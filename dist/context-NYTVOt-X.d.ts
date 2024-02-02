import * as _sinclair_typebox from '@sinclair/typebox';
import { TSchema, NumberOptions, SchemaOptions, TNumber, TProperties, ObjectOptions, TObject, TUnion, TNull, TUndefined, Static, TAnySchema } from '@sinclair/typebox';
import { TypeCheck } from '@sinclair/typebox/compiler';
import { WebSocketHandler, ServerWebSocket, Server, Serve } from 'bun';
import '@sinclair/typebox/system';
import { OpenAPIV3 } from 'openapi-types';
import { EventEmitter } from 'eventemitter3';

declare const websocket: WebSocketHandler<any>;
declare class ElysiaWS<WS extends ServerWebSocket<{
    id?: string;
    validator?: TypeCheck<TSchema>;
}>, Route extends RouteSchema = RouteSchema, Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}> {
    raw: WS;
    data: Context<Route, Decorators>;
    validator?: TypeCheck<TSchema>;
    constructor(raw: WS, data: Context<Route, Decorators>);
    get id(): string;
    set id(newID: string);
    get publish(): (topic: string, data?: Route['response'], compress?: boolean) => this;
    get send(): (data: Route['response']) => this;
    get subscribe(): (room: string) => this;
    get unsubscribe(): (room: string) => this;
    get cork(): (callback: (ws: WS) => this) => this;
    get close(): () => this;
    get terminate(): () => void;
    get isSubscribed(): (topic: string) => boolean;
    get remoteAddress(): string;
}

declare namespace WS {
    type Config = Omit<WebSocketHandler, 'open' | 'message' | 'close' | 'drain'>;
    type LocalHook<LocalSchema extends InputSchema = {}, Route extends RouteSchema = RouteSchema, Decorators extends DecoratorBase = {
        request: {};
        store: {};
        derive: {};
        resolve: {};
    }, Errors extends Record<string, Error> = {}, Path extends string = '', TypedRoute extends RouteSchema = keyof Route['params'] extends never ? Route & {
        params: Record<GetPathParameter<Path>, string>;
    } : Route> = (LocalSchema extends {} ? LocalSchema : Isolate<LocalSchema>) & Omit<Partial<WebSocketHandler<Context>>, 'open' | 'message' | 'close' | 'drain' | 'publish' | 'publishToSelf'> & (ElysiaWS<ServerWebSocket<{
        validator?: TypeCheck<TSchema>;
    }>, TypedRoute, Decorators> extends infer WS ? {
        transform?: MaybeArray<VoidHandler<TypedRoute, Decorators>>;
        transformMessage?: MaybeArray<VoidHandler<TypedRoute, Decorators>>;
        beforeHandle?: MaybeArray<Handler<TypedRoute, Decorators>>;
        /**
         * Catch error
         */
        error?: MaybeArray<ErrorHandler<Errors>>;
        /**
         * Headers to register to websocket before `upgrade`
         */
        upgrade?: HeadersInit | ((context: Context) => HeadersInit);
        /**
         * The {@link ServerWebSocket} has been opened
         *
         * @param ws The {@link ServerWebSocket} that was opened
         */
        open?: (ws: WS) => void | Promise<void>;
        /**
         * Handle an incoming message to a {@link ServerWebSocket}
         *
         * @param ws The {@link ServerWebSocket} that received the message
         * @param message The message received
         *
         * To change `message` to be an `ArrayBuffer` instead of a `Uint8Array`, set `ws.binaryType = "arraybuffer"`
         */
        message?: (ws: WS, message: Route['body']) => any;
        /**
         * The {@link ServerWebSocket} is being closed
         * @param ws The {@link ServerWebSocket} that was closed
         * @param code The close code
         * @param message The close message
         */
        close?: (ws: WS, code: number, message: string) => void | Promise<void>;
        /**
         * The {@link ServerWebSocket} is ready for more data
         *
         * @param ws The {@link ServerWebSocket} that is ready
         */
        drain?: (ws: WS) => void | Promise<void>;
    } : {});
}

declare const ERROR_CODE: unique symbol;
declare const ELYSIA_RESPONSE: unique symbol;
declare const isProduction: boolean;
type ElysiaErrors = InternalServerError | NotFoundError | ParseError | ValidationError | InvalidCookieSignature;
declare const error: <const Code extends number | "Continue" | "Switching Protocols" | "Processing" | "Early Hints" | "OK" | "Created" | "Accepted" | "Non-Authoritative Information" | "No Content" | "Reset Content" | "Partial Content" | "Multi-Status" | "Already Reported" | "Multiple Choices" | "Moved Permanently" | "Found" | "See Other" | "Not Modified" | "Temporary Redirect" | "Permanent Redirect" | "Bad Request" | "Unauthorized" | "Payment Required" | "Forbidden" | "Not Found" | "Method Not Allowed" | "Not Acceptable" | "Proxy Authentication Required" | "Request Timeout" | "Conflict" | "Gone" | "Length Required" | "Precondition Failed" | "Payload Too Large" | "URI Too Long" | "Unsupported Media Type" | "Range Not Satisfiable" | "Expectation Failed" | "I'm a teapot" | "Misdirected Request" | "Unprocessable Content" | "Locked" | "Failed Dependency" | "Too Early" | "Upgrade Required" | "Precondition Required" | "Too Many Requests" | "Request Header Fields Too Large" | "Unavailable For Legal Reasons" | "Internal Server Error" | "Not Implemented" | "Bad Gateway" | "Service Unavailable" | "Gateway Timeout" | "HTTP Version Not Supported" | "Variant Also Negotiates" | "Insufficient Storage" | "Loop Detected" | "Not Extended" | "Network Authentication Required", const T>(code: Code, response: T) => {
    response: T;
    [ELYSIA_RESPONSE]: Code extends "Continue" | "Switching Protocols" | "Processing" | "Early Hints" | "OK" | "Created" | "Accepted" | "Non-Authoritative Information" | "No Content" | "Reset Content" | "Partial Content" | "Multi-Status" | "Already Reported" | "Multiple Choices" | "Moved Permanently" | "Found" | "See Other" | "Not Modified" | "Temporary Redirect" | "Permanent Redirect" | "Bad Request" | "Unauthorized" | "Payment Required" | "Forbidden" | "Not Found" | "Method Not Allowed" | "Not Acceptable" | "Proxy Authentication Required" | "Request Timeout" | "Conflict" | "Gone" | "Length Required" | "Precondition Failed" | "Payload Too Large" | "URI Too Long" | "Unsupported Media Type" | "Range Not Satisfiable" | "Expectation Failed" | "I'm a teapot" | "Misdirected Request" | "Unprocessable Content" | "Locked" | "Failed Dependency" | "Too Early" | "Upgrade Required" | "Precondition Required" | "Too Many Requests" | "Request Header Fields Too Large" | "Unavailable For Legal Reasons" | "Internal Server Error" | "Not Implemented" | "Bad Gateway" | "Service Unavailable" | "Gateway Timeout" | "HTTP Version Not Supported" | "Variant Also Negotiates" | "Insufficient Storage" | "Loop Detected" | "Not Extended" | "Network Authentication Required" ? {
        readonly Continue: 100;
        readonly 'Switching Protocols': 101;
        readonly Processing: 102;
        readonly 'Early Hints': 103;
        readonly OK: 200;
        readonly Created: 201;
        readonly Accepted: 202;
        readonly 'Non-Authoritative Information': 203;
        readonly 'No Content': 204;
        readonly 'Reset Content': 205;
        readonly 'Partial Content': 206;
        readonly 'Multi-Status': 207;
        readonly 'Already Reported': 208;
        readonly 'Multiple Choices': 300;
        readonly 'Moved Permanently': 301;
        readonly Found: 302;
        readonly 'See Other': 303;
        readonly 'Not Modified': 304;
        readonly 'Temporary Redirect': 307;
        readonly 'Permanent Redirect': 308;
        readonly 'Bad Request': 400;
        readonly Unauthorized: 401;
        readonly 'Payment Required': 402;
        readonly Forbidden: 403;
        readonly 'Not Found': 404;
        readonly 'Method Not Allowed': 405;
        readonly 'Not Acceptable': 406;
        readonly 'Proxy Authentication Required': 407;
        readonly 'Request Timeout': 408;
        readonly Conflict: 409;
        readonly Gone: 410;
        readonly 'Length Required': 411;
        readonly 'Precondition Failed': 412;
        readonly 'Payload Too Large': 413;
        readonly 'URI Too Long': 414;
        readonly 'Unsupported Media Type': 415;
        readonly 'Range Not Satisfiable': 416;
        readonly 'Expectation Failed': 417;
        readonly "I'm a teapot": 418;
        readonly 'Misdirected Request': 421;
        readonly 'Unprocessable Content': 422;
        readonly Locked: 423;
        readonly 'Failed Dependency': 424;
        readonly 'Too Early': 425;
        readonly 'Upgrade Required': 426;
        readonly 'Precondition Required': 428;
        readonly 'Too Many Requests': 429;
        readonly 'Request Header Fields Too Large': 431;
        readonly 'Unavailable For Legal Reasons': 451;
        readonly 'Internal Server Error': 500;
        readonly 'Not Implemented': 501;
        readonly 'Bad Gateway': 502;
        readonly 'Service Unavailable': 503;
        readonly 'Gateway Timeout': 504;
        readonly 'HTTP Version Not Supported': 505;
        readonly 'Variant Also Negotiates': 506;
        readonly 'Insufficient Storage': 507;
        readonly 'Loop Detected': 508;
        readonly 'Not Extended': 510;
        readonly 'Network Authentication Required': 511;
    }[Code] : Code;
};
declare class InternalServerError extends Error {
    code: string;
    status: number;
    constructor(message?: string);
}
declare class NotFoundError extends Error {
    code: string;
    status: number;
    constructor(message?: string);
}
declare class ParseError extends Error {
    code: string;
    status: number;
    constructor(message?: string);
}
declare class InvalidCookieSignature extends Error {
    key: string;
    code: string;
    status: number;
    constructor(key: string, message?: string);
}
declare class ValidationError extends Error {
    type: string;
    validator: TSchema | TypeCheck<any>;
    value: unknown;
    code: string;
    status: number;
    constructor(type: string, validator: TSchema | TypeCheck<any>, value: unknown);
    get all(): any[];
    static simplifyModel(validator: TSchema | TypeCheck<any>): any;
    get model(): any;
    toResponse(headers?: Record<string, any>): Response;
}

interface CookieOptions {
    /**
     * Specifies the value for the {@link https://tools.ietf.org/html/rfc6265#section-5.2.3|Domain Set-Cookie attribute}. By default, no
     * domain is set, and most clients will consider the cookie to apply to only
     * the current domain.
     */
    domain?: string | undefined;
    /**
     * Specifies the `Date` object to be the value for the {@link https://tools.ietf.org/html/rfc6265#section-5.2.1|`Expires` `Set-Cookie` attribute}. By default,
     * no expiration is set, and most clients will consider this a "non-persistent cookie" and will delete
     * it on a condition like exiting a web browser application.
     *
     * *Note* the {@link https://tools.ietf.org/html/rfc6265#section-5.3|cookie storage model specification}
     * states that if both `expires` and `maxAge` are set, then `maxAge` takes precedence, but it is
     * possible not all clients by obey this, so if both are set, they should
     * point to the same date and time.
     */
    expires?: Date | undefined;
    /**
     * Specifies the boolean value for the {@link https://tools.ietf.org/html/rfc6265#section-5.2.6|`HttpOnly` `Set-Cookie` attribute}.
     * When truthy, the `HttpOnly` attribute is set, otherwise it is not. By
     * default, the `HttpOnly` attribute is not set.
     *
     * *Note* be careful when setting this to true, as compliant clients will
     * not allow client-side JavaScript to see the cookie in `document.cookie`.
     */
    httpOnly?: boolean | undefined;
    /**
     * Specifies the number (in seconds) to be the value for the `Max-Age`
     * `Set-Cookie` attribute. The given number will be converted to an integer
     * by rounding down. By default, no maximum age is set.
     *
     * *Note* the {@link https://tools.ietf.org/html/rfc6265#section-5.3|cookie storage model specification}
     * states that if both `expires` and `maxAge` are set, then `maxAge` takes precedence, but it is
     * possible not all clients by obey this, so if both are set, they should
     * point to the same date and time.
     */
    maxAge?: number | undefined;
    /**
     * Specifies the value for the {@link https://tools.ietf.org/html/rfc6265#section-5.2.4|`Path` `Set-Cookie` attribute}.
     * By default, the path is considered the "default path".
     */
    path?: string | undefined;
    /**
     * Specifies the `string` to be the value for the [`Priority` `Set-Cookie` attribute][rfc-west-cookie-priority-00-4.1].
     *
     * - `'low'` will set the `Priority` attribute to `Low`.
     * - `'medium'` will set the `Priority` attribute to `Medium`, the default priority when not set.
     * - `'high'` will set the `Priority` attribute to `High`.
     *
     * More information about the different priority levels can be found in
     * [the specification][rfc-west-cookie-priority-00-4.1].
     *
     * **note** This is an attribute that has not yet been fully standardized, and may change in the future.
     * This also means many clients may ignore this attribute until they understand it.
     */
    priority?: 'low' | 'medium' | 'high' | undefined;
    /**
     * Specifies the boolean or string to be the value for the {@link https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.2.7|`SameSite` `Set-Cookie` attribute}.
     *
     * - `true` will set the `SameSite` attribute to `Strict` for strict same
     * site enforcement.
     * - `false` will not set the `SameSite` attribute.
     * - `'lax'` will set the `SameSite` attribute to Lax for lax same site
     * enforcement.
     * - `'strict'` will set the `SameSite` attribute to Strict for strict same
     * site enforcement.
     *  - `'none'` will set the SameSite attribute to None for an explicit
     *  cross-site cookie.
     *
     * More information about the different enforcement levels can be found in {@link https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-03#section-4.1.2.7|the specification}.
     *
     * *note* This is an attribute that has not yet been fully standardized, and may change in the future. This also means many clients may ignore this attribute until they understand it.
     */
    sameSite?: true | false | 'lax' | 'strict' | 'none' | undefined;
    /**
     * Specifies the boolean value for the {@link https://tools.ietf.org/html/rfc6265#section-5.2.5|`Secure` `Set-Cookie` attribute}. When truthy, the
     * `Secure` attribute is set, otherwise it is not. By default, the `Secure` attribute is not set.
     *
     * *Note* be careful when setting this to `true`, as compliant clients will
     * not send the cookie back to the server in the future if the browser does
     * not have an HTTPS connection.
     */
    secure?: boolean | undefined;
    /**
     * Secret key for signing cookie
     *
     * If array is passed, will use Key Rotation.
     *
     * Key rotation is when an encryption key is retired
     * and replaced by generating a new cryptographic key.
     */
    secrets?: string | string[];
}
type MutateCookie<T = unknown> = CookieOptions & {
    value?: T;
} extends infer A ? A | ((previous: A) => A) : never;
type CookieJar = Record<string, Cookie>;
declare class Cookie<T = unknown> implements CookieOptions {
    private _value;
    property: Readonly<CookieOptions>;
    name: string | undefined;
    private setter;
    constructor(_value: T, property?: Readonly<CookieOptions>);
    get(): T;
    get value(): T;
    set value(value: T);
    add<T>(config: MutateCookie<T>): Cookie<T>;
    set<T>(config: MutateCookie): Cookie<T>;
    remove(options?: Pick<CookieOptions, 'domain' | 'path' | 'sameSite' | 'secure'>): void;
    get domain(): string | undefined;
    set domain(value: string | undefined);
    get expires(): Date | undefined;
    set expires(value: Date | undefined);
    get httpOnly(): boolean | undefined;
    set httpOnly(value: boolean | undefined);
    get maxAge(): number | undefined;
    set maxAge(value: number | undefined);
    get path(): string | undefined;
    set path(value: string | undefined);
    get priority(): "low" | "medium" | "high" | undefined;
    set priority(value: "low" | "medium" | "high" | undefined);
    get sameSite(): boolean | "lax" | "strict" | "none" | undefined;
    set sameSite(value: boolean | "lax" | "strict" | "none" | undefined);
    get secure(): boolean | undefined;
    set secure(value: boolean | undefined);
    toString(): string;
    private sync;
}
declare const createCookieJar: (initial: CookieJar, set: Context['set'], properties?: CookieOptions) => CookieJar;
declare const parseCookie: (set: Context['set'], cookieString?: string | null, { secret, sign, ...properties }?: CookieOptions & {
    secret?: string | string[] | undefined;
    sign?: string | true | string[] | undefined;
}) => Promise<CookieJar>;

declare const t: _sinclair_typebox.JavaScriptTypeBuilder;
type MaybeArray$1<T> = T | T[];
declare namespace ElysiaTypeOptions {
    type Numeric = NumberOptions;
    type FileUnit = number | `${number}${'k' | 'm'}`;
    interface File extends SchemaOptions {
        type?: MaybeArray$1<(string & {}) | 'image' | 'image/jpeg' | 'image/png' | 'image/gif' | 'image/tiff' | 'image/x-icon' | 'image/svg' | 'image/webp' | 'image/avif' | 'audio' | 'audio/mpeg' | 'audio/x-ms-wma' | 'audio/vnd.rn-realaudio' | 'audio/x-wav' | 'video' | 'video/mpeg' | 'video/mp4' | 'video/quicktime' | 'video/x-ms-wmv' | 'video/x-msvideo' | 'video/x-flv' | 'video/webm' | 'text' | 'text/css' | 'text/csv' | 'text/html' | 'text/javascript' | 'text/plain' | 'text/xml' | 'application' | 'application/ogg' | 'application/pdf' | 'application/xhtml' | 'application/html' | 'application/json' | 'application/ld+json' | 'application/xml' | 'application/zip' | 'font' | 'font/woff2' | 'font/woff' | 'font/ttf' | 'font/otf'>;
        minSize?: FileUnit;
        maxSize?: FileUnit;
    }
    interface Files extends File {
        minItems?: number;
        maxItems?: number;
    }
}
declare const ElysiaType: {
    readonly Numeric: (property?: NumberOptions) => TNumber;
    readonly ObjectString: <T extends TProperties>(properties: T, options?: ObjectOptions) => TObject<T>;
    readonly File: (options?: Partial<ElysiaTypeOptions.File> | undefined) => _sinclair_typebox.TUnsafe<File>;
    readonly Files: (options?: ElysiaTypeOptions.Files) => _sinclair_typebox.TTransform<_sinclair_typebox.TUnsafe<File[]>, File[]>;
    readonly Nullable: <T extends TSchema>(schema: T) => TUnion<[T, TNull]>;
    /**
     * Allow Optional, Nullable and Undefined
     */
    readonly MaybeEmpty: <T_1 extends TSchema>(schema: T_1) => TUnion<[T_1, TUndefined]>;
    readonly Cookie: <T_2 extends TProperties>(properties: T_2, options?: (ObjectOptions & CookieOptions & {
        /**
         * Secret key for signing cookie
         *
         * If array is passed, will use Key Rotation.
         *
         * Key rotation is when an encryption key is retired
         * and replaced by generating a new cryptographic key.
         */
        secrets?: string | string[] | undefined;
        /**
         * Specified cookie name to be signed globally
         */
        sign?: readonly ((string & {}) | keyof T_2)[] | undefined;
    }) | undefined) => TObject<T_2>;
};
type TCookie = (typeof ElysiaType)['Cookie'];
declare module '@sinclair/typebox' {
    interface JavaScriptTypeBuilder {
        ObjectString: typeof ElysiaType.ObjectString;
        Numeric: typeof ElysiaType.Numeric;
        File: typeof ElysiaType.File;
        Files: typeof ElysiaType.Files;
        Nullable: typeof ElysiaType.Nullable;
        MaybeEmpty: typeof ElysiaType.MaybeEmpty;
        Cookie: typeof ElysiaType.Cookie;
    }
    interface SchemaOptions {
        error?: string | ((type: string, validator: TypeCheck<any>, value: unknown) => string | void);
    }
}

declare const isNotEmpty: (obj: Object) => boolean;
declare const parseSetCookies: (headers: Headers, setCookie: string[]) => Headers;
declare const cookieToHeader: (cookies: Context['set']['cookie']) => string | string[] | undefined;
declare const mapResponse: (response: unknown, set: Context['set']) => Response;
declare const mapEarlyResponse: (response: unknown, set: Context['set']) => Response | undefined;
declare const mapCompactResponse: (response: unknown) => Response;
declare const errorToResponse: (error: Error, set?: Context['set']) => Response;

/**
 * ### Elysia Server
 * Main instance to create web server using Elysia
 *
 * ---
 * @example
 * ```typescript
 * import { Elysia } from 'elysia'
 *
 * new Elysia()
 *     .get("/", () => "Hello")
 *     .listen(8080)
 * ```
 */
declare class Elysia<BasePath extends string = '', Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}, Definitions extends DefinitionBase = {
    type: {};
    error: {};
}, ParentSchema extends RouteSchema = {}, Macro extends Record<string, unknown> = {}, Routes extends RouteBase = {}, Scoped extends boolean = false> {
    config: ElysiaConfig<BasePath>;
    private dependencies;
    store: Decorators['store'];
    private decorators;
    private definitions;
    schema: Routes;
    private macros;
    event: LifeCycleStore;
    reporter: TraceReporter;
    server: Server | null;
    private getServer;
    private validator;
    private router;
    private wsRouter;
    routes: InternalRoute[];
    private staticRouter;
    private wsPaths;
    private dynamicRouter;
    private lazyLoadModules;
    path: BasePath;
    stack: string | undefined;
    constructor(config?: Partial<ElysiaConfig<BasePath, Scoped>>);
    private add;
    private setHeaders?;
    headers(header: Context['set']['headers'] | undefined): this;
    /**
     * ### start | Life cycle event
     * Called after server is ready for serving
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .onStart(({ url, port }) => {
     *         console.log("Running at ${url}:${port}")
     *     })
     *     .listen(8080)
     * ```
     */
    onStart(handler: MaybeArray<GracefulHandler<this>>): this;
    /**
     * ### request | Life cycle event
     * Called on every new request is accepted
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .onRequest(({ method, url }) => {
     *         saveToAnalytic({ method, url })
     *     })
     * ```
     */
    onRequest<Schema extends RouteSchema = {}>(handler: MaybeArray<PreHandler<MergeSchema<Schema, ParentSchema>, Decorators>>): this;
    /**
     * ### parse | Life cycle event
     * Callback function to handle body parsing
     *
     * If truthy value is returned, will be assigned to `context.body`
     * Otherwise will skip the callback and look for the next one.
     *
     * Equivalent to Express's body parser
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .onParse((request, contentType) => {
     *         if(contentType === "application/json")
     *             return request.json()
     *     })
     * ```
     */
    onParse(parser: MaybeArray<BodyHandler<ParentSchema, Decorators>>): this;
    /**
     * ### transform | Life cycle event
     * Assign or transform anything related to context before validation.
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .onTransform(({ params }) => {
     *         if(params.id)
     *             params.id = +params.id
     *     })
     * ```
     */
    onTransform<Schema extends RouteSchema = {}>(handler: MaybeArray<TransformHandler<MergeSchema<Schema, ParentSchema>, Decorators>>): this;
    /**
     * ### After Handle | Life cycle event
     * Intercept request **after** main handler is called.
     *
     * If truthy value is returned, will be assigned as `Response`
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .onAfterHandle((context, response) => {
     *         if(typeof response === "object")
     *             return JSON.stringify(response)
     *     })
     * ```
     */
    /**
     * Derive new property for each request with access to `Context`.
     *
     * If error is thrown, the scope will skip to handling error instead.
     *
     * ---
     * @example
     * new Elysia()
     *     .state('counter', 1)
     *     .derive(({ store }) => ({
     *         increase() {
     *             store.counter++
     *         }
     *     }))
     */
    resolve<Resolver extends Object>(resolver: (context: Prettify<Context<ParentSchema, Decorators>>) => MaybePromise<Resolver> extends {
        store: any;
    } ? never : Resolver): Elysia<BasePath, {
        request: Decorators['request'];
        store: Decorators['store'];
        derive: Decorators['resolve'];
        resolve: Prettify<Decorators['resolve'] & Awaited<Resolver>>;
    }, Definitions, ParentSchema, Macro, Routes, Scoped>;
    /**
     * ### Before Handle | Life cycle event
     * Intercept request **before(()) main handler is called.
     *
     * If truthy value is returned, will be assigned as `Response` and skip the main handler
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .onBeforeHandle(({ params: { id }, status }) => {
     *         if(id && !isExisted(id)) {
     * 	           status(401)
     *
     *             return "Unauthorized"
     * 	       }
     *     })
     * ```
     */
    onBeforeHandle<Schema extends RouteSchema = {}>(handler: MaybeArray<OptionalHandler<MergeSchema<Schema, ParentSchema>, Decorators>>): this;
    /**
     * ### After Handle | Life cycle event
     * Intercept request **after** main handler is called.
     *
     * If truthy value is returned, will be assigned as `Response`
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .onAfterHandle((context, response) => {
     *         if(typeof response === "object")
     *             return JSON.stringify(response)
     *     })
     * ```
     */
    onAfterHandle<Schema extends RouteSchema = {}>(handler: MaybeArray<AfterHandler<MergeSchema<Schema, ParentSchema>, Decorators>>): this;
    /**
     * ### After Handle | Life cycle event
     * Intercept request **after** main handler is called.
     *
     * If truthy value is returned, will be assigned as `Response`
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .mapResponse((context, response) => {
     *         if(typeof response === "object")
     *             return JSON.stringify(response)
     *     })
     * ```
     */
    mapResponse<Schema extends RouteSchema = {}>(handler: MaybeArray<MapResponse<MergeSchema<Schema, ParentSchema>, Decorators>>): this;
    /**
     * ### response | Life cycle event
     * Called when handler is executed
     * Good for analytic metrics
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .onError(({ code }) => {
     *         if(code === "NOT_FOUND")
     *             return "Path not found :("
     *     })
     * ```
     */
    onResponse<Schema extends RouteSchema = {}>(handler: MaybeArray<VoidHandler<MergeSchema<Schema, ParentSchema>, Decorators>>): this;
    /**
     * ### After Handle | Life cycle event
     * Intercept request **after** main handler is called.
     *
     * If truthy value is returned, will be assigned as `Response`
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .onAfterHandle((context, response) => {
     *         if(typeof response === "object")
     *             return JSON.stringify(response)
     *     })
     * ```
     */
    trace<Route extends RouteSchema = {}>(handler: TraceHandler<Route, Decorators>): this;
    /**
     * Register errors
     *
     * ---
     * @example
     * ```typescript
     * class CustomError extends Error {
     *     constructor() {
     *         super()
     *     }
     * }
     *
     * new Elysia()
     *     .error('CUSTOM_ERROR', CustomError)
     * ```
     */
    error<const Errors extends Record<string, {
        prototype: Error;
    }>>(errors: Errors): Elysia<BasePath, Decorators, {
        type: Definitions['type'];
        error: Definitions['error'] & {
            [K in keyof Errors]: Errors[K] extends {
                prototype: infer LiteralError extends Error;
            } ? LiteralError : Errors[K];
        };
    }, ParentSchema, Macro, Routes, Scoped>;
    /**
     * Register errors
     *
     * ---
     * @example
     * ```typescript
     * class CustomError extends Error {
     *     constructor() {
     *         super()
     *     }
     * }
     *
     * new Elysia()
     *     .error({
     *         CUSTOM_ERROR: CustomError
     *     })
     * ```
     */
    error<Name extends string, const CustomError extends {
        prototype: Error;
    }>(name: Name, errors: CustomError): Elysia<BasePath, Decorators, {
        type: Definitions['type'];
        error: Definitions['error'] & {
            [name in Name]: CustomError extends {
                prototype: infer LiteralError extends Error;
            } ? LiteralError : CustomError;
        };
    }, ParentSchema, Macro, Routes, Scoped>;
    /**
     * Register errors
     *
     * ---
     * @example
     * ```typescript
     * class CustomError extends Error {
     *     constructor() {
     *         super()
     *     }
     * }
     *
     * new Elysia()
     *     .error('CUSTOM_ERROR', CustomError)
     * ```
     */
    error<const NewErrors extends Record<string, Error>>(mapper: (decorators: Definitions['error']) => NewErrors): Elysia<BasePath, Decorators, {
        type: Definitions['type'];
        error: {
            [K in keyof NewErrors]: NewErrors[K] extends {
                prototype: infer LiteralError extends Error;
            } ? LiteralError : never;
        };
    }, ParentSchema, Macro, Routes, Scoped>;
    /**
     * ### Error | Life cycle event
     * Called when error is thrown during processing request
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .onError(({ code }) => {
     *         if(code === "NOT_FOUND")
     *             return "Path not found :("
     *     })
     * ```
     */
    onError<Schema extends RouteSchema = {}>(handler: ErrorHandler<Definitions['error'], MergeSchema<Schema, ParentSchema>, Decorators>): this;
    /**
     * ### stop | Life cycle event
     * Called after server stop serving request
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .onStop((app) => {
     *         cleanup()
     *     })
     * ```
     */
    onStop(handler: MaybeArray<GracefulHandler<this>>): this;
    /**
     * ### on
     * Syntax sugar for attaching life cycle event by name
     *
     * Does the exact same thing as `.on[Event]()`
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .on('error', ({ code }) => {
     *         if(code === "NOT_FOUND")
     *             return "Path not found :("
     *     })
     * ```
     */
    on<Event extends keyof LifeCycleStore>(type: Exclude<Event, 'onResponse'> | 'response', handlers: MaybeArray<Extract<LifeCycleStore[Event], Function[]>[0]>): this;
    group<const NewElysia extends Elysia<any, any, any, any, any, any, any>, const Prefix extends string>(prefix: Prefix, run: (group: Elysia<`${BasePath}${Prefix}`, Decorators, Definitions, ParentSchema, Macro, {}>) => NewElysia): NewElysia extends Elysia<any, infer PluginDecorators, infer PluginDefinitions, infer PluginSchema, any, any> ? Elysia<BasePath, PluginDecorators, PluginDefinitions, PluginSchema, Macro, Prettify<Routes & NewElysia['schema']>> : this;
    group<const LocalSchema extends InputSchema<Extract<keyof Definitions['type'], string>>, const NewElysia extends Elysia<any, any, any, any, any, any, any>, const Prefix extends string, const Schema extends MergeSchema<UnwrapRoute<LocalSchema, Definitions['type']>, ParentSchema>>(prefix: Prefix, schema: LocalHook<LocalSchema, Schema, Decorators, Definitions['error'], Macro, `${BasePath}${Prefix}`>, run: (group: Elysia<`${BasePath}${Prefix}`, Decorators, Definitions, Schema, Macro, {}>) => NewElysia): Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro, Prettify<Routes & NewElysia['schema']>>;
    guard<const LocalSchema extends InputSchema, const Route extends MergeSchema<UnwrapRoute<LocalSchema, Definitions['type']>, ParentSchema>>(hook: LocalHook<LocalSchema, Route, Decorators, Definitions['error'], Macro, BasePath>): Elysia<BasePath, Decorators, Definitions, Route, Macro, Routes, Scoped>;
    guard<const LocalSchema extends InputSchema<Extract<keyof Definitions['type'], string>>, const NewElysia extends Elysia<any, any, any, any, any, any, any>, const Schema extends MergeSchema<UnwrapRoute<LocalSchema, Definitions['type']>, ParentSchema>>(schema: LocalHook<LocalSchema, Schema, Decorators, Definitions['error'], Macro>, run: (group: Elysia<BasePath, Decorators, Definitions, Schema, Macro, {}, Scoped>) => NewElysia): Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro, Prettify<Routes & NewElysia['schema']>>;
    use<NewElysia extends Elysia<any, any, any, any, any, any, any> = this>(plugin: MaybePromise<(app: NewElysia) => MaybePromise<NewElysia>>): NewElysia extends Elysia<any, infer PluginDecorators, infer PluginDefinitions, infer PluginSchema, infer PluginMacro, any> ? Elysia<BasePath, {
        request: Prettify<Decorators['request'] & PluginDecorators['request']>;
        store: Prettify<Decorators['store'] & PluginDecorators['store']>;
        derive: Prettify<Decorators['derive'] & PluginDecorators['derive']>;
        resolve: Prettify<Decorators['resolve'] & PluginDecorators['resolve']>;
    }, {
        type: Prettify<Definitions['type'] & PluginDefinitions['type']>;
        error: Prettify<Definitions['error'] & PluginDefinitions['error']>;
    }, Prettify<MergeSchema<ParentSchema, PluginSchema>>, Prettify<Macro & PluginMacro>, Routes & NewElysia['schema'], Scoped> : this;
    use<NewElysia extends Elysia<any, any, any, any, any, any, any>>(instance: MaybePromise<NewElysia>): NewElysia extends Elysia<any, infer PluginDecorators, infer PluginDefinitions, infer PluginSchema, infer PluginMacro, any, infer IsScoped> ? IsScoped extends true ? Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro, BasePath extends `` ? Routes & NewElysia['schema'] : Routes & AddPrefix<BasePath, NewElysia['schema']>, Scoped> : Elysia<BasePath, {
        request: Prettify<Decorators['request'] & PluginDecorators['request']>;
        store: Prettify<Decorators['store'] & PluginDecorators['store']>;
        derive: Prettify<Decorators['derive'] & PluginDecorators['derive']>;
        resolve: Prettify<Decorators['resolve'] & PluginDecorators['resolve']>;
    }, {
        type: Prettify<Definitions['type'] & PluginDefinitions['type']>;
        error: Prettify<Definitions['error'] & PluginDefinitions['error']>;
    }, Prettify<MergeSchema<ParentSchema, PluginSchema>>, Prettify<Macro & PluginMacro>, BasePath extends `` ? Routes & NewElysia['schema'] : Routes & AddPrefix<BasePath, NewElysia['schema']>, Scoped> : this;
    use<NewElysia extends Elysia<any, any, any, any, any, any, any>>(plugin: Promise<{
        default: (elysia: Elysia<any, any, any, any, any, any, any>) => MaybePromise<NewElysia>;
    }>): NewElysia extends Elysia<any, infer PluginDecorators, infer PluginDefinitions, infer PluginSchema, infer PluginMacro, any> ? Elysia<BasePath, {
        request: Decorators['request'] & PluginDecorators['request'];
        store: Decorators['store'] & PluginDecorators['store'];
        derive: Decorators['derive'] & PluginDecorators['derive'];
        resolve: Decorators['resolve'] & PluginDecorators['resolve'];
    }, {
        type: Definitions['type'] & PluginDefinitions['type'];
        error: Definitions['error'] & PluginDefinitions['error'];
    }, MergeSchema<ParentSchema, PluginSchema>, Prettify<Macro & PluginMacro>, BasePath extends `` ? Routes & NewElysia['schema'] : Routes & AddPrefix<BasePath, NewElysia['schema']>, Scoped> : this;
    use<LazyLoadElysia extends Elysia<any, any, any, any, any, any, any>>(plugin: Promise<{
        default: LazyLoadElysia;
    }>): LazyLoadElysia extends Elysia<any, infer PluginDecorators, infer PluginDefinitions, infer PluginSchema, infer PluginMacro, any> ? Elysia<BasePath, {
        request: PluginDecorators['request'] & Decorators['request'];
        store: PluginDecorators['store'] & Decorators['store'];
        derive: Decorators['derive'] & PluginDecorators['derive'];
        resolve: Decorators['resolve'] & PluginDecorators['resolve'];
    }, {
        type: PluginDefinitions['type'] & Definitions['type'];
        error: PluginDefinitions['error'] & Definitions['error'];
    }, MergeSchema<PluginSchema, ParentSchema>, Prettify<Macro & PluginMacro>, BasePath extends `` ? Routes & LazyLoadElysia['schema'] : Routes & AddPrefix<BasePath, LazyLoadElysia['schema']>> : this;
    private _use;
    macro<const NewMacro extends BaseMacro>(macro: (route: MacroManager<Routes, Decorators, Definitions['error']>) => NewMacro): Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro & Partial<MacroToProperty<NewMacro>>, Routes, Scoped>;
    mount(handle: ((request: Request) => MaybePromise<Response>) | Elysia<any, any, any, any, any, any, any>): this;
    mount(path: string, handle: ((request: Request) => MaybePromise<Response>) | Elysia<any, any, any, any, any, any, any>): this;
    /**
     * ### get
     * Register handler for path with method [GET]
     *
     * ---
     * @example
     * ```typescript
     * import { Elysia, t } from 'elysia'
     *
     * new Elysia()
     *     .get('/', () => 'hi')
     *     .get('/with-hook', () => 'hi', {
     *         schema: {
     *             response: t.String()
     *         }
     *     })
     * ```
     */
    get<const Path extends string, const LocalSchema extends InputSchema<keyof Definitions['type'] & string>, const Route extends MergeSchema<UnwrapRoute<LocalSchema, Definitions['type']>, ParentSchema>, const Handle extends Exclude<Route['response'], Handle> | Handler<Route, Decorators, `${BasePath}${Path}`>>(path: Path, handler: Handle, hook?: LocalHook<LocalSchema, Route, Decorators, Definitions['error'], Macro, `${BasePath}${Path}`>): Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro, Prettify<Routes & {
        [path in `${BasePath}${Path}`]: {
            get: {
                body: Route['body'];
                params: undefined extends Route['params'] ? Path extends `${string}/${':' | '*'}${string}` ? Record<GetPathParameter<Path>, string> : never : Route['params'];
                query: Route['query'];
                headers: Route['headers'];
                response: unknown extends Route['response'] ? (Handle extends (...a: any) => infer Returned ? Returned : Handle) extends infer Res ? keyof Res extends typeof ELYSIA_RESPONSE ? Prettify<{
                    200: Exclude<Res, {
                        [ELYSIA_RESPONSE]: number;
                    }>;
                } & (Extract<Res, {
                    [ELYSIA_RESPONSE]: number;
                }> extends infer ErrorResponse extends {
                    [ELYSIA_RESPONSE]: number;
                    response: any;
                } ? {
                    [status in ErrorResponse[typeof ELYSIA_RESPONSE]]: ErrorResponse['response'];
                } : {})> : {
                    200: Res;
                } : never : Route['response'] extends {
                    200: any;
                } ? Route['response'] : {
                    200: Route['response'];
                };
            };
        };
    }>, Scoped>;
    /**
     * ### post
     * Register handler for path with method [POST]
     *
     * ---
     * @example
     * ```typescript
     * import { Elysia, t } from 'elysia'
     *
     * new Elysia()
     *     .post('/', () => 'hi')
     *     .post('/with-hook', () => 'hi', {
     *         schema: {
     *             response: t.String()
     *         }
     *     })
     * ```
     */
    post<const Path extends string, const LocalSchema extends InputSchema<keyof Definitions['type'] & string>, const Route extends MergeSchema<UnwrapRoute<LocalSchema, Definitions['type']>, ParentSchema>, const Handle extends Exclude<Route['response'], Handle> | Handler<Route, Decorators, `${BasePath}${Path}`>>(path: Path, handler: Handle, hook?: LocalHook<LocalSchema, Route, Decorators, Definitions['error'], Macro, `${BasePath}${Path}`>): Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro, Prettify<Routes & {
        [path in `${BasePath}${Path}`]: {
            post: {
                body: Route['body'];
                params: undefined extends Route['params'] ? Path extends `${string}/${':' | '*'}${string}` ? Record<GetPathParameter<Path>, string> : never : Route['params'];
                query: Route['query'];
                headers: Route['headers'];
                response: unknown extends Route['response'] ? (Handle extends (...a: any) => infer Returned ? Returned : Handle) extends infer Res ? keyof Res extends typeof ELYSIA_RESPONSE ? Prettify<{
                    200: Exclude<Res, {
                        [ELYSIA_RESPONSE]: number;
                    }>;
                } & (Extract<Res, {
                    [ELYSIA_RESPONSE]: number;
                }> extends infer ErrorResponse extends {
                    [ELYSIA_RESPONSE]: number;
                    response: any;
                } ? {
                    [status in ErrorResponse[typeof ELYSIA_RESPONSE]]: ErrorResponse['response'];
                } : {})> : {
                    200: Res;
                } : never : Route['response'] extends {
                    200: any;
                } ? Route['response'] : {
                    200: Route['response'];
                };
            };
        };
    }>, Scoped>;
    /**
     * ### put
     * Register handler for path with method [PUT]
     *
     * ---
     * @example
     * ```typescript
     * import { Elysia, t } from 'elysia'
     *
     * new Elysia()
     *     .put('/', () => 'hi')
     *     .put('/with-hook', () => 'hi', {
     *         schema: {
     *             response: t.String()
     *         }
     *     })
     * ```
     */
    put<const Path extends string, const LocalSchema extends InputSchema<keyof Definitions['type'] & string>, const Route extends MergeSchema<UnwrapRoute<LocalSchema, Definitions['type']>, ParentSchema>, const Handle extends Exclude<Route['response'], Handle> | Handler<Route, Decorators, `${BasePath}${Path}`>>(path: Path, handler: Handle, hook?: LocalHook<LocalSchema, Route, Decorators, Definitions['error'], Macro, `${BasePath}${Path}`>): Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro, Prettify<Routes & {
        [path in `${BasePath}${Path}`]: {
            put: {
                body: Route['body'];
                params: undefined extends Route['params'] ? Path extends `${string}/${':' | '*'}${string}` ? Record<GetPathParameter<Path>, string> : never : Route['params'];
                query: Route['query'];
                headers: Route['headers'];
                response: unknown extends Route['response'] ? (Handle extends (...a: any) => infer Returned ? Returned : Handle) extends infer Res ? keyof Res extends typeof ELYSIA_RESPONSE ? Prettify<{
                    200: Exclude<Res, {
                        [ELYSIA_RESPONSE]: number;
                    }>;
                } & (Extract<Res, {
                    [ELYSIA_RESPONSE]: number;
                }> extends infer ErrorResponse extends {
                    [ELYSIA_RESPONSE]: number;
                    response: any;
                } ? {
                    [status in ErrorResponse[typeof ELYSIA_RESPONSE]]: ErrorResponse['response'];
                } : {})> : {
                    200: Res;
                } : never : Route['response'] extends {
                    200: any;
                } ? Route['response'] : {
                    200: Route['response'];
                };
            };
        };
    }>, Scoped>;
    /**
     * ### patch
     * Register handler for path with method [PATCH]
     *
     * ---
     * @example
     * ```typescript
     * import { Elysia, t } from 'elysia'
     *
     * new Elysia()
     *     .patch('/', () => 'hi')
     *     .patch('/with-hook', () => 'hi', {
     *         schema: {
     *             response: t.String()
     *         }
     *     })
     * ```
     */
    patch<const Path extends string, const LocalSchema extends InputSchema<keyof Definitions['type'] & string>, const Route extends MergeSchema<UnwrapRoute<LocalSchema, Definitions['type']>, ParentSchema>, const Handle extends Exclude<Route['response'], Handle> | Handler<Route, Decorators, `${BasePath}${Path}`>>(path: Path, handler: Handle, hook?: LocalHook<LocalSchema, Route, Decorators, Definitions['error'], Macro, `${BasePath}${Path}`>): Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro, Prettify<Routes & {
        [path in `${BasePath}${Path}`]: {
            patch: {
                body: Route['body'];
                params: undefined extends Route['params'] ? Path extends `${string}/${':' | '*'}${string}` ? Record<GetPathParameter<Path>, string> : never : Route['params'];
                query: Route['query'];
                headers: Route['headers'];
                response: unknown extends Route['response'] ? (Handle extends (...a: any) => infer Returned ? Returned : Handle) extends infer Res ? keyof Res extends typeof ELYSIA_RESPONSE ? Prettify<{
                    200: Exclude<Res, {
                        [ELYSIA_RESPONSE]: number;
                    }>;
                } & (Extract<Res, {
                    [ELYSIA_RESPONSE]: number;
                }> extends infer ErrorResponse extends {
                    [ELYSIA_RESPONSE]: number;
                    response: any;
                } ? {
                    [status in ErrorResponse[typeof ELYSIA_RESPONSE]]: ErrorResponse['response'];
                } : {})> : {
                    200: Res;
                } : never : Route['response'] extends {
                    200: any;
                } ? Route['response'] : {
                    200: Route['response'];
                };
            };
        };
    }>, Scoped>;
    /**
     * ### delete
     * Register handler for path with method [DELETE]
     *
     * ---
     * @example
     * ```typescript
     * import { Elysia, t } from 'elysia'
     *
     * new Elysia()
     *     .delete('/', () => 'hi')
     *     .delete('/with-hook', () => 'hi', {
     *         schema: {
     *             response: t.String()
     *         }
     *     })
     * ```
     */
    delete<const Path extends string, const LocalSchema extends InputSchema<keyof Definitions['type'] & string>, const Route extends MergeSchema<UnwrapRoute<LocalSchema, Definitions['type']>, ParentSchema>, const Handle extends Exclude<Route['response'], Handle> | Handler<Route, Decorators, `${BasePath}${Path}`>>(path: Path, handler: Handle, hook?: LocalHook<LocalSchema, Route, Decorators, Definitions['error'], Macro, `${BasePath}${Path}`>): Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro, Prettify<Routes & {
        [path in `${BasePath}${Path}`]: {
            delete: {
                body: Route['body'];
                params: undefined extends Route['params'] ? Path extends `${string}/${':' | '*'}${string}` ? Record<GetPathParameter<Path>, string> : never : Route['params'];
                query: Route['query'];
                headers: Route['headers'];
                response: unknown extends Route['response'] ? (Handle extends (...a: any) => infer Returned ? Returned : Handle) extends infer Res ? keyof Res extends typeof ELYSIA_RESPONSE ? Prettify<{
                    200: Exclude<Res, {
                        [ELYSIA_RESPONSE]: number;
                    }>;
                } & (Extract<Res, {
                    [ELYSIA_RESPONSE]: number;
                }> extends infer ErrorResponse extends {
                    [ELYSIA_RESPONSE]: number;
                    response: any;
                } ? {
                    [status in ErrorResponse[typeof ELYSIA_RESPONSE]]: ErrorResponse['response'];
                } : {})> : {
                    200: Res;
                } : never : Route['response'] extends {
                    200: any;
                } ? Route['response'] : {
                    200: Route['response'];
                };
            };
        };
    }>, Scoped>;
    /**
     * ### options
     * Register handler for path with method [OPTIONS]
     *
     * ---
     * @example
     * ```typescript
     * import { Elysia, t } from 'elysia'
     *
     * new Elysia()
     *     .options('/', () => 'hi')
     *     .options('/with-hook', () => 'hi', {
     *         schema: {
     *             response: t.String()
     *         }
     *     })
     * ```
     */
    options<const Path extends string, const LocalSchema extends InputSchema<keyof Definitions['type'] & string>, const Route extends MergeSchema<UnwrapRoute<LocalSchema, Definitions['type']>, ParentSchema>, const Handle extends Exclude<Route['response'], Handle> | Handler<Route, Decorators, `${BasePath}${Path}`>>(path: Path, handler: Handle, hook?: LocalHook<LocalSchema, Route, Decorators, Definitions['error'], Macro, `${BasePath}${Path}`>): Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro, Prettify<Routes & {
        [path in `${BasePath}${Path}`]: {
            get: {
                body: Route['body'];
                params: undefined extends Route['params'] ? Path extends `${string}/${':' | '*'}${string}` ? Record<GetPathParameter<Path>, string> : never : Route['params'];
                query: Route['query'];
                headers: Route['headers'];
                response: unknown extends Route['response'] ? (Handle extends (...a: any) => infer Returned ? Returned : Handle) extends infer Res ? keyof Res extends typeof ELYSIA_RESPONSE ? Prettify<{
                    200: Exclude<Res, {
                        [ELYSIA_RESPONSE]: number;
                    }>;
                } & (Extract<Res, {
                    [ELYSIA_RESPONSE]: number;
                }> extends infer ErrorResponse extends {
                    [ELYSIA_RESPONSE]: number;
                    response: any;
                } ? {
                    [status in ErrorResponse[typeof ELYSIA_RESPONSE]]: ErrorResponse['response'];
                } : {})> : {
                    200: Res;
                } : never : Route['response'] extends {
                    200: any;
                } ? Route['response'] : {
                    200: Route['response'];
                };
            };
        };
    }>, Scoped>;
    /**
     * ### all
     * Register handler for path with any method
     *
     * ---
     * @example
     * ```typescript
     * import { Elysia, t } from 'elysia'
     *
     * new Elysia()
     *     .all('/', () => 'hi')
     * ```
     */
    all<const Path extends string, const LocalSchema extends InputSchema<keyof Definitions['type'] & string>, const Route extends MergeSchema<UnwrapRoute<LocalSchema, Definitions['type']>, ParentSchema>, const Handle extends Exclude<Route['response'], Handle> | Handler<Route, Decorators, `${BasePath}${Path}`>>(path: Path, handler: Handle, hook?: LocalHook<LocalSchema, Route, Decorators, Definitions['error'], Macro, `${BasePath}${Path}`>): Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro, Prettify<Routes & {
        [path in `${BasePath}${Path}`]: {
            [method in string]: {
                body: Route['body'];
                params: undefined extends Route['params'] ? Path extends `${string}/${':' | '*'}${string}` ? Record<GetPathParameter<Path>, string> : never : Route['params'];
                query: Route['query'];
                headers: Route['headers'];
                response: unknown extends Route['response'] ? (Handle extends (...a: any) => infer Returned ? Returned : Handle) extends infer Res ? keyof Res extends typeof ELYSIA_RESPONSE ? Prettify<{
                    200: Exclude<Res, {
                        [ELYSIA_RESPONSE]: number;
                    }>;
                } & (Extract<Res, {
                    [ELYSIA_RESPONSE]: number;
                }> extends infer ErrorResponse extends {
                    [ELYSIA_RESPONSE]: number;
                    response: any;
                } ? {
                    [status in ErrorResponse[typeof ELYSIA_RESPONSE]]: ErrorResponse['response'];
                } : {})> : {
                    200: Res;
                } : never : Route['response'] extends {
                    200: any;
                } ? Route['response'] : {
                    200: Route['response'];
                };
            };
        };
    }>, Scoped>;
    /**
     * ### head
     * Register handler for path with method [HEAD]
     *
     * ---
     * @example
     * ```typescript
     * import { Elysia, t } from 'elysia'
     *
     * new Elysia()
     *     .head('/', () => 'hi')
     *     .head('/with-hook', () => 'hi', {
     *         schema: {
     *             response: t.String()
     *         }
     *     })
     * ```
     */
    head<const Path extends string, const LocalSchema extends InputSchema<keyof Definitions['type'] & string>, const Route extends MergeSchema<UnwrapRoute<LocalSchema, Definitions['type']>, ParentSchema>, const Handle extends Exclude<Route['response'], Handle> | Handler<Route, Decorators, `${BasePath}${Path}`>>(path: Path, handler: Handle, hook?: LocalHook<LocalSchema, Route, Decorators, Definitions['error'], Macro, `${BasePath}${Path}`>): Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro, Prettify<Routes & {
        [path in `${BasePath}${Path}`]: {
            head: {
                body: Route['body'];
                params: undefined extends Route['params'] ? Path extends `${string}/${':' | '*'}${string}` ? Record<GetPathParameter<Path>, string> : never : Route['params'];
                query: Route['query'];
                headers: Route['headers'];
                response: unknown extends Route['response'] ? (Handle extends (...a: any) => infer Returned ? Returned : Handle) extends infer Res ? keyof Res extends typeof ELYSIA_RESPONSE ? Prettify<{
                    200: Exclude<Res, {
                        [ELYSIA_RESPONSE]: number;
                    }>;
                } & (Extract<Res, {
                    [ELYSIA_RESPONSE]: number;
                }> extends infer ErrorResponse extends {
                    [ELYSIA_RESPONSE]: number;
                    response: any;
                } ? {
                    [status in ErrorResponse[typeof ELYSIA_RESPONSE]]: ErrorResponse['response'];
                } : {})> : {
                    200: Res;
                } : never : Route['response'] extends {
                    200: any;
                } ? Route['response'] : {
                    200: Route['response'];
                };
            };
        };
    }>, Scoped>;
    /**
     * ### connect
     * Register handler for path with method [CONNECT]
     *
     * ---
     * @example
     * ```typescript
     * import { Elysia, t } from 'elysia'
     *
     * new Elysia()
     *     .connect('/', () => 'hi')
     *     .connect('/with-hook', () => 'hi', {
     *         schema: {
     *             response: t.String()
     *         }
     *     })
     * ```
     */
    connect<const Path extends string, const LocalSchema extends InputSchema<keyof Definitions['type'] & string>, const Route extends MergeSchema<UnwrapRoute<LocalSchema, Definitions['type']>, ParentSchema>, const Handle extends Exclude<Route['response'], Handle> | Handler<Route, Decorators, `${BasePath}${Path}`>>(path: Path, handler: Handle, hook?: LocalHook<LocalSchema, Route, Decorators, Definitions['error'], Macro, `${BasePath}${Path}`>): Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro, Prettify<Routes & {
        [path in `${BasePath}${Path}`]: {
            connect: {
                body: Route['body'];
                params: undefined extends Route['params'] ? Path extends `${string}/${':' | '*'}${string}` ? Record<GetPathParameter<Path>, string> : never : Route['params'];
                query: Route['query'];
                headers: Route['headers'];
                response: unknown extends Route['response'] ? (Handle extends (...a: any) => infer Returned ? Returned : Handle) extends infer Res ? keyof Res extends typeof ELYSIA_RESPONSE ? Prettify<{
                    200: Exclude<Res, {
                        [ELYSIA_RESPONSE]: number;
                    }>;
                } & (Extract<Res, {
                    [ELYSIA_RESPONSE]: number;
                }> extends infer ErrorResponse extends {
                    [ELYSIA_RESPONSE]: number;
                    response: any;
                } ? {
                    [status in ErrorResponse[typeof ELYSIA_RESPONSE]]: ErrorResponse['response'];
                } : {})> : {
                    200: Res;
                } : never : Route['response'] extends {
                    200: any;
                } ? Route['response'] : {
                    200: Route['response'];
                };
            };
        };
    }>, Scoped>;
    /**
     * ### ws
     * Register handler for path with method [ws]
     *
     * ---
     * @example
     * ```typescript
     * import { Elysia, t } from 'elysia'
     *
     * new Elysia()
     *     .ws('/', {
     *         message(ws, message) {
     *             ws.send(message)
     *         }
     *     })
     * ```
     */
    ws<const Path extends string, const LocalSchema extends InputSchema<keyof Definitions['type'] & string>, const Route extends MergeSchema<UnwrapRoute<LocalSchema, Definitions['type']>, ParentSchema>>(path: Path, options: WS.LocalHook<LocalSchema, Route, Decorators, Definitions['error'], `${BasePath}${Path}`>): Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro, Prettify<Routes & {
        [path in `${BasePath}${Path}`]: {
            subscribe: {
                body: Route['body'];
                params: undefined extends Route['params'] ? Path extends `${string}/${':' | '*'}${string}` ? Record<GetPathParameter<Path>, string> : never : Route['params'];
                query: Route['query'];
                headers: Route['headers'];
                response: Route['response'];
            };
        };
    }>, Scoped>;
    /**
     * ### route
     * Register handler for path with custom method
     *
     * ---
     * @example
     * ```typescript
     * import { Elysia, t } from 'elysia'
     *
     * new Elysia()
     *     .route('CUSTOM', '/', () => 'hi')
     *     .route('CUSTOM', '/with-hook', () => 'hi', {
     *         schema: {
     *             response: t.String()
     *         }
     *     })
     * ```
     */
    route<const Method extends HTTPMethod, const Path extends string, const LocalSchema extends InputSchema<Extract<keyof Definitions['type'], string>>, const Handle extends Exclude<Route['response'], Handle> | Handler<Route, Decorators, `${BasePath}${Path}`>, const Route extends MergeSchema<UnwrapRoute<LocalSchema, Definitions['type']>, ParentSchema>>(method: Method, path: Path, handler: Handle, { config, ...hook }?: LocalHook<LocalSchema, Route, Decorators, Definitions['error'], Macro, `${BasePath}${Path}`> & {
        config: {
            allowMeta?: boolean;
        };
    }): Elysia<BasePath, Decorators, Definitions, ParentSchema, Macro, Prettify<Routes & {
        [path in `${BasePath}${Path}`]: {
            [method in Lowercase<Method>]: {
                body: Route['body'];
                params: undefined extends Route['params'] ? Path extends `${string}/${':' | '*'}${string}` ? Record<GetPathParameter<Path>, string> : never : Route['params'];
                query: Route['query'];
                headers: Route['headers'];
                response: unknown extends Route['response'] ? (Handle extends (...a: any) => infer Returned ? Returned : Handle) extends infer Res ? keyof Res extends typeof ELYSIA_RESPONSE ? Prettify<{
                    200: Exclude<Res, {
                        [ELYSIA_RESPONSE]: number;
                    }>;
                } & (Extract<Res, {
                    [ELYSIA_RESPONSE]: number;
                }> extends infer ErrorResponse extends {
                    [ELYSIA_RESPONSE]: number;
                    response: any;
                } ? {
                    [status in ErrorResponse[typeof ELYSIA_RESPONSE]]: ErrorResponse['response'];
                } : {})> : {
                    200: Res;
                } : never : Route['response'] extends {
                    200: any;
                } ? Route['response'] : {
                    200: Route['response'];
                };
            };
        };
    }>, Scoped>;
    /**
     * ### state
     * Assign global mutatable state accessible for all handler
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .state({ counter: 0 })
     *     .get('/', (({ counter }) => ++counter)
     * ```
     */
    state<Name extends string | number | symbol, Value>(name: Name, value: Value): Elysia<BasePath, {
        request: Decorators['request'];
        store: Prettify<Decorators['store'] & {
            [name in Name]: Value;
        }>;
        derive: Decorators['derive'];
        resolve: Decorators['resolve'];
    }, Definitions, ParentSchema, Macro, Routes, Scoped>;
    /**
     * ### state
     * Assign global mutatable state accessible for all handler
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .state('counter', 0)
     *     .get('/', (({ counter }) => ++counter)
     * ```
     */
    state<Store extends Record<string, unknown>>(store: Store): Elysia<BasePath, {
        request: Decorators['request'];
        store: Prettify<Decorators['store'] & Store>;
        derive: Decorators['derive'];
        resolve: Decorators['resolve'];
    }, Definitions, ParentSchema, Macro, Routes, Scoped>;
    state<const NewStore extends Record<string, unknown>>(mapper: (decorators: Decorators['store']) => NewStore): Elysia<BasePath, {
        request: Decorators['request'];
        store: NewStore;
        derive: Decorators['derive'];
        resolve: Decorators['resolve'];
    }, Definitions, ParentSchema, Macro, Routes, Scoped>;
    /**
     * ### decorate
     * Define custom method to `Context` accessible for all handler
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .decorate('getDate', () => Date.now())
     *     .get('/', (({ getDate }) => getDate())
     * ```
     */
    decorate<const Name extends string, const Value>(name: Name, value: Value): Elysia<BasePath, {
        request: Prettify<Decorators['request'] & {
            [name in Name]: Value;
        }>;
        store: Decorators['store'];
        derive: Decorators['derive'];
        resolve: Decorators['resolve'];
    }, Definitions, ParentSchema, Macro, Routes, Scoped>;
    /**
     * ### decorate
     * Define custom method to `Context` accessible for all handler
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .decorate('getDate', () => Date.now())
     *     .get('/', (({ getDate }) => getDate())
     * ```
     */
    decorate<const NewDecorators extends Record<string, unknown>>(decorators: NewDecorators): Elysia<BasePath, {
        request: Prettify<Decorators['request'] & NewDecorators>;
        store: Decorators['store'];
        derive: Decorators['derive'];
        resolve: Decorators['resolve'];
    }, Definitions, ParentSchema, Macro, Routes, Scoped>;
    decorate<const NewDecorators extends Record<string, unknown>>(mapper: (decorators: Decorators['request']) => NewDecorators): Elysia<BasePath, {
        request: NewDecorators;
        store: Decorators['store'];
        derive: Decorators['derive'];
        resolve: Decorators['resolve'];
    }, Definitions, ParentSchema, Macro, Routes, Scoped>;
    /**
     * Derive new property for each request with access to `Context`.
     *
     * If error is thrown, the scope will skip to handling error instead.
     *
     * ---
     * @example
     * new Elysia()
     *     .state('counter', 1)
     *     .derive(({ store }) => ({
     *         increase() {
     *             store.counter++
     *         }
     *     }))
     */
    derive<Derivative extends Object>(transform: (context: Prettify<Context<ParentSchema, Decorators>>) => MaybePromise<Derivative> extends {
        store: any;
    } ? never : Derivative): Elysia<BasePath, {
        request: Decorators['request'];
        store: Decorators['store'];
        derive: Prettify<Decorators['derive'] & Awaited<Derivative>>;
        resolve: Decorators['resolve'];
    }, Definitions, ParentSchema, Macro, Routes, Scoped>;
    model<Name extends string, Model extends TSchema>(name: Name, model: Model): Elysia<BasePath, Decorators, {
        type: Prettify<Definitions['type'] & {
            [name in Name]: Static<Model>;
        }>;
        error: Definitions['error'];
    }, ParentSchema, Macro, Routes, Scoped>;
    model<Recorder extends Record<string, TSchema>>(record: Recorder): Elysia<BasePath, Decorators, {
        type: Prettify<Definitions['type'] & {
            [key in keyof Recorder]: Static<Recorder[key]>;
        }>;
        error: Definitions['error'];
    }, ParentSchema, Macro, Routes, Scoped>;
    model<const NewType extends Record<string, TSchema>>(mapper: (decorators: {
        [type in keyof Definitions['type']]: ReturnType<typeof t.Unsafe<Definitions['type'][type]>>;
    }) => NewType): Elysia<BasePath, Decorators, {
        type: {
            [x in keyof NewType]: Static<NewType[x]>;
        };
        error: Definitions['error'];
    }, ParentSchema, Macro, Routes, Scoped>;
    mapDerive<const NewStore extends Record<string, unknown>>(mapper: (decorators: Decorators['request']) => MaybePromise<NewStore>): Elysia<BasePath, {
        request: Decorators['request'];
        store: NewStore;
        derive: Decorators['derive'];
        resolve: Decorators['resolve'];
    }, Definitions, ParentSchema, Macro, Routes, Scoped>;
    affix<const Base extends 'prefix' | 'suffix', const Type extends 'all' | 'decorator' | 'state' | 'model' | 'error', const Word extends string>(base: Base, type: Type, word: Word): Elysia<BasePath, {
        request: Type extends 'decorator' | 'all' ? 'prefix' extends Base ? Word extends `${string}${'_' | '-' | ' '}` ? AddPrefix<Word, Decorators['request']> : AddPrefixCapitalize<Word, Decorators['request']> : AddSuffixCapitalize<Word, Decorators['request']> : Decorators['request'];
        store: Type extends 'state' | 'all' ? 'prefix' extends Base ? Word extends `${string}${'_' | '-' | ' '}` ? AddPrefix<Word, Decorators['store']> : AddPrefixCapitalize<Word, Decorators['store']> : AddSuffix<Word, Decorators['store']> : Decorators['store'];
        derive: Type extends 'decorator' | 'all' ? 'prefix' extends Base ? Word extends `${string}${'_' | '-' | ' '}` ? AddPrefix<Word, Decorators['derive']> : AddPrefixCapitalize<Word, Decorators['derive']> : AddSuffixCapitalize<Word, Decorators['derive']> : Decorators['derive'];
        resolve: Type extends 'decorator' | 'all' ? 'prefix' extends Base ? Word extends `${string}${'_' | '-' | ' '}` ? AddPrefix<Word, Decorators['resolve']> : AddPrefixCapitalize<Word, Decorators['resolve']> : AddSuffixCapitalize<Word, Decorators['resolve']> : Decorators['resolve'];
    }, {
        type: Type extends 'model' | 'all' ? 'prefix' extends Base ? Word extends `${string}${'_' | '-' | ' '}` ? AddPrefix<Word, Definitions['type']> : AddPrefixCapitalize<Word, Definitions['type']> : AddSuffixCapitalize<Word, Definitions['type']> : Definitions['type'];
        error: Type extends 'error' | 'all' ? 'prefix' extends Base ? Word extends `${string}${'_' | '-' | ' '}` ? AddPrefix<Word, Definitions['error']> : AddPrefixCapitalize<Word, Definitions['error']> : AddSuffixCapitalize<Word, Definitions['error']> : Definitions['error'];
    }, ParentSchema, Macro, Routes, Scoped>;
    prefix<const Type extends 'all' | 'decorator' | 'state' | 'model' | 'error', const Word extends string>(type: Type, word: Word): Elysia<BasePath, {
        request: Type extends "all" | "decorator" ? Word extends `${string} ` | `${string}_` | `${string}-` ? AddPrefix<Word, Decorators["request"]> : AddPrefixCapitalize<Word, Decorators["request"]> : Decorators["request"];
        store: Type extends "all" | "state" ? Word extends `${string} ` | `${string}_` | `${string}-` ? AddPrefix<Word, Decorators["store"]> : AddPrefixCapitalize<Word, Decorators["store"]> : Decorators["store"];
        derive: Type extends "all" | "decorator" ? Word extends `${string} ` | `${string}_` | `${string}-` ? AddPrefix<Word, Decorators["derive"]> : AddPrefixCapitalize<Word, Decorators["derive"]> : Decorators["derive"];
        resolve: Type extends "all" | "decorator" ? Word extends `${string} ` | `${string}_` | `${string}-` ? AddPrefix<Word, Decorators["resolve"]> : AddPrefixCapitalize<Word, Decorators["resolve"]> : Decorators["resolve"];
    }, {
        type: Type extends "all" | "model" ? Word extends `${string} ` | `${string}_` | `${string}-` ? AddPrefix<Word, Definitions["type"]> : AddPrefixCapitalize<Word, Definitions["type"]> : Definitions["type"];
        error: Type extends "error" | "all" ? Word extends `${string} ` | `${string}_` | `${string}-` ? AddPrefix<Word, Definitions["error"]> : AddPrefixCapitalize<Word, Definitions["error"]> : Definitions["error"];
    }, ParentSchema, Macro, Routes, Scoped>;
    suffix<const Type extends 'all' | 'decorator' | 'state' | 'model' | 'error', const Word extends string>(type: Type, word: Word): Elysia<BasePath, {
        request: Type extends "all" | "decorator" ? AddSuffixCapitalize<Word, Decorators["request"]> : Decorators["request"];
        store: Type extends "all" | "state" ? AddSuffix<Word, Decorators["store"]> : Decorators["store"];
        derive: Type extends "all" | "decorator" ? AddSuffixCapitalize<Word, Decorators["derive"]> : Decorators["derive"];
        resolve: Type extends "all" | "decorator" ? AddSuffixCapitalize<Word, Decorators["resolve"]> : Decorators["resolve"];
    }, {
        type: Type extends "all" | "model" ? AddSuffixCapitalize<Word, Definitions["type"]> : Definitions["type"];
        error: Type extends "error" | "all" ? AddSuffixCapitalize<Word, Definitions["error"]> : Definitions["error"];
    }, ParentSchema, Macro, Routes, Scoped>;
    compile(): this;
    handle: (request: Request) => Promise<Response>;
    /**
     * Use handle can be either sync or async to save performance.
     *
     * Beside benchmark purpose, please use 'handle' instead.
     */
    fetch: (request: Request) => MaybePromise<Response>;
    private handleError;
    private outerErrorHandler;
    /**
     * ### listen
     * Assign current instance to port and start serving
     *
     * ---
     * @example
     * ```typescript
     * new Elysia()
     *     .get("/", () => 'hi')
     *     .listen(8080)
     * ```
     */
    listen: (options: string | number | Partial<Serve>, callback?: ListenCallback) => this;
    /**
     * ### stop
     * Stop server from serving
     *
     * ---
     * @example
     * ```typescript
     * const app = new Elysia()
     *     .get("/", () => 'hi')
     *     .listen(8080)
     *
     * // Sometime later
     * app.stop()
     * ```
     */
    stop: () => Promise<void>;
    /**
     * Wait until all lazy loaded modules all load is fully
     */
    get modules(): Promise<Elysia<any, any, {
        type: {};
        error: {};
    }, {}, {}, {}, false>[]>;
}

type HeadersInit = string[][] | Record<string, string | ReadonlyArray<string>> | Headers;
type ElysiaConfig<T extends string = '', Scoped extends boolean = false> = {
    name?: string;
    seed?: unknown;
    serve?: Partial<Serve>;
    prefix?: T;
    /**
     * Disable `new Error` thrown marked as Error on Bun 0.6
     */
    forceErrorEncapsulation?: boolean;
    /**
     * Disable Ahead of Time compliation
     *
     * Reduced performance but faster startup time
     */
    aot?: boolean;
    /**
     * Whether should Elysia tolerate suffix '/' or vice-versa
     *
     * @default false
     */
    strictPath?: boolean;
    /**
     * If set to true, other Elysia handler will not inherits global life-cycle, store, decorators from the current instance
     *
     * @default false
     */
    scoped?: Scoped;
    websocket?: Omit<WebSocketHandler<any>, 'open' | 'close' | 'message' | 'drain'>;
    cookie?: CookieOptions & {
        /**
         * Specified cookie name to be signed globally
         */
        sign?: true | string | string[];
    };
    /**
     * Capture more detail information for each dependencies
     */
    analytic?: boolean;
};
type MaybeArray<T> = T | T[];
type MaybePromise<T> = T | Promise<T>;
type ObjectValues<T extends object> = T[keyof T];
/**
 * @link https://stackoverflow.com/a/49928360/1490091
 */
type IsPathParameter<Part extends string> = Part extends `:${infer Parameter}` ? Parameter : Part extends `*` ? '*' : never;
type GetPathParameter<Path extends string> = Path extends `${infer A}/${infer B}` ? IsPathParameter<A> | GetPathParameter<B> : IsPathParameter<Path>;
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
type Reconcile<A extends Object, B extends Object> = {
    [key in keyof A as key extends keyof B ? never : key]: A[key];
} extends infer Collision ? {} extends Collision ? {
    [key in keyof B]: B[key];
} : Prettify<Collision & {
    [key in keyof B]: B[key];
}> : never;
type DecoratorBase = {
    request: {
        [x: string]: unknown;
    };
    store: {
        [x: string]: unknown;
    };
    derive: {
        [x: string]: unknown;
    };
    resolve: {
        [x: string]: unknown;
    };
};
type DefinitionBase = {
    type: {
        [x: string]: unknown;
    };
    error: {
        [x: string]: Error;
    };
};
type RouteBase = {
    [path: string]: {
        [method: string]: RouteSchema;
    };
};
interface RouteSchema {
    body?: unknown;
    headers?: unknown;
    query?: unknown;
    params?: unknown;
    cookie?: unknown;
    response?: unknown;
}
type UnwrapSchema<Schema extends TSchema | string | undefined, Definitions extends DefinitionBase['type'] = {}> = Schema extends undefined ? unknown : Schema extends TSchema ? Static<NonNullable<Schema>> : Schema extends string ? Definitions extends Record<Schema, infer NamedSchema> ? NamedSchema : Definitions : unknown;
type UnwrapRoute<Schema extends InputSchema<any>, Definitions extends DefinitionBase['type'] = {}> = {
    body: UnwrapSchema<Schema['body'], Definitions>;
    headers: UnwrapSchema<Schema['headers'], Definitions> extends infer A extends Record<string, any> ? A : undefined;
    query: UnwrapSchema<Schema['query'], Definitions> extends infer A extends Record<string, any> ? A : undefined;
    params: UnwrapSchema<Schema['params'], Definitions> extends infer A extends Record<string, any> ? A : undefined;
    cookie: UnwrapSchema<Schema['cookie'], Definitions> extends infer A extends Record<string, any> ? A : undefined;
    response: Schema['response'] extends TSchema | string ? UnwrapSchema<Schema['response'], Definitions> : Schema['response'] extends {
        200: TAnySchema | string;
    } ? {
        [k in keyof Schema['response']]: UnwrapSchema<Schema['response'][k], Definitions>;
    } : unknown | void;
};
type UnwrapGroupGuardRoute<Schema extends InputSchema<any>, Definitions extends DefinitionBase['type'] = {}, Path extends string = ''> = {
    body: UnwrapSchema<Schema['body'], Definitions>;
    headers: UnwrapSchema<Schema['headers'], Definitions> extends infer A extends Record<string, unknown> ? A : undefined;
    query: UnwrapSchema<Schema['query'], Definitions> extends infer A extends Record<string, unknown> ? A : undefined;
    params: UnwrapSchema<Schema['params'], Definitions> extends infer A extends Record<string, unknown> ? A : Path extends `${string}/${':' | '*'}${string}` ? Record<GetPathParameter<Path>, string> : never;
    cookie: UnwrapSchema<Schema['cookie'], Definitions> extends infer A extends Record<string, unknown> ? A : undefined;
    response: Schema['response'] extends TSchema | string ? UnwrapSchema<Schema['response'], Definitions> : Schema['response'] extends {
        [k in string]: TSchema | string;
    } ? UnwrapSchema<ObjectValues<Schema['response']>, Definitions> : unknown | void;
};
interface LifeCycleStore {
    type?: ContentType;
    start: GracefulHandler<any>[];
    request: PreHandler<any, any>[];
    parse: BodyHandler<any, any>[];
    transform: TransformHandler<any, any>[];
    beforeHandle: OptionalHandler<any, any>[];
    afterHandle: AfterHandler<any, any>[];
    mapResponse: MapResponse<any, any>[];
    onResponse: VoidHandler<any, any>[];
    trace: TraceHandler<any, any>[];
    error: ErrorHandler<any, any, any>[];
    stop: GracefulHandler<any>[];
}
type LifeCycleEvent = 'start' | 'request' | 'parse' | 'transform' | 'beforeHandle' | 'afterHandle' | 'response' | 'error' | 'stop';
type ContentType = MaybeArray<(string & {}) | 'none' | 'text' | 'json' | 'formdata' | 'urlencoded' | 'arrayBuffer' | 'text/plain' | 'application/json' | 'multipart/form-data' | 'application/x-www-form-urlencoded'>;
type HTTPMethod = (string & {}) | 'ACL' | 'BIND' | 'CHECKOUT' | 'CONNECT' | 'COPY' | 'DELETE' | 'GET' | 'HEAD' | 'LINK' | 'LOCK' | 'M-SEARCH' | 'MERGE' | 'MKACTIVITY' | 'MKCALENDAR' | 'MKCOL' | 'MOVE' | 'NOTIFY' | 'OPTIONS' | 'PATCH' | 'POST' | 'PROPFIND' | 'PROPPATCH' | 'PURGE' | 'PUT' | 'REBIND' | 'REPORT' | 'SEARCH' | 'SOURCE' | 'SUBSCRIBE' | 'TRACE' | 'UNBIND' | 'UNLINK' | 'UNLOCK' | 'UNSUBSCRIBE' | 'ALL';
interface InputSchema<Name extends string = string> {
    body?: TSchema | Name;
    headers?: TObject | Name;
    query?: TObject | Name;
    params?: TObject | Name;
    cookie?: TObject | Name;
    response?: TSchema | Record<number, TSchema> | Name | Record<number, Name | TSchema>;
}
type MergeSchema<A extends RouteSchema, B extends RouteSchema> = {
    body: undefined extends A['body'] ? B['body'] : A['body'];
    headers: undefined extends A['headers'] ? B['headers'] : A['headers'];
    query: undefined extends A['query'] ? B['query'] : A['query'];
    params: undefined extends A['params'] ? B['params'] : A['params'];
    cookie: undefined extends A['cookie'] ? B['cookie'] : A['cookie'];
    response: undefined extends A['response'] ? B['response'] : A['response'];
};
type Handler<Route extends RouteSchema = {}, Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}, Path extends string = ''> = (context: Prettify<Context<Route, Decorators, Path>>) => Route['response'] extends {
    200: unknown;
} ? Response | MaybePromise<Route['response'][keyof Route['response']]> : Response | MaybePromise<Route['response']>;
type OptionalHandler<Route extends RouteSchema = {}, Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}> = Handler<Route, Decorators> extends (context: infer Context) => infer Returned ? (context: Context) => Returned | MaybePromise<void> : never;
type AfterHandler<Route extends RouteSchema = {}, Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}> = Handler<Route, Decorators> extends (context: infer Context) => infer Returned ? (context: Prettify<{
    response: Route['response'];
} & Context>) => Returned | MaybePromise<void> : never;
type MapResponse<Route extends RouteSchema = {}, Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}> = Handler<Omit<Route, 'response'> & {
    response: MaybePromise<Response | undefined | void>;
}, Decorators & {
    derive: {
        response: Route['response'];
    };
}>;
type VoidHandler<Route extends RouteSchema = {}, Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}> = (context: Prettify<Context<Route, Decorators>>) => MaybePromise<void>;
type TransformHandler<Route extends RouteSchema = {}, Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}> = (context: Prettify<Context<Route, Omit<Decorators, 'resolve'> & {
    resolve: {};
}>>) => MaybePromise<void>;
type TraceEvent = 'request' | 'parse' | 'transform' | 'beforeHandle' | 'afterHandle' | 'error' | 'response' extends infer Events extends string ? Events | `${Events}.unit` | 'handle' | 'exit' : never;
type TraceStream = {
    id: number;
    event: TraceEvent;
    type: 'begin' | 'end';
    time: number;
    name?: string;
    unit?: number;
};
type TraceReporter = EventEmitter<{
    [res in `res${number}.${number}`]: undefined;
} & {
    event(stream: TraceStream): MaybePromise<void>;
}>;
type TraceProcess<Type extends 'begin' | 'end' = 'begin' | 'end'> = Type extends 'begin' ? Prettify<{
    name: string;
    time: number;
    skip: boolean;
    end: Promise<TraceProcess<'end'>>;
    children: Promise<TraceProcess<'begin'>>[];
}> : number;
type TraceHandler<Route extends RouteSchema = {}, Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}> = (lifecycle: Prettify<{
    context: Context<Route, Decorators>;
    set: Context['set'];
    id: number;
    time: number;
} & {
    [x in 'request' | 'parse' | 'transform' | 'beforeHandle' | 'handle' | 'afterHandle' | 'error' | 'response']: Promise<TraceProcess<'begin'>>;
} & {
    store: Decorators['store'];
}>) => MaybePromise<void>;
type TraceListener = EventEmitter<{
    [event in TraceEvent | 'all']: (trace: TraceProcess) => MaybePromise<void>;
}>;
type BodyHandler<Route extends RouteSchema = {}, Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}> = (context: Prettify<Context<Route, Decorators>>, contentType: string) => MaybePromise<any>;
type PreHandler<Route extends RouteSchema = {}, Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}> = (context: Prettify<PreContext<Decorators>>) => MaybePromise<Route['response'] | void>;
type GracefulHandler<Instance extends Elysia<any, any, any, any, any, any, any>> = (data: Instance) => any;
type ErrorHandler<T extends Record<string, Error> = {}, Route extends RouteSchema = {}, Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}> = (context: Prettify<Context<Route, Decorators> & ({
    request: Request;
    code: 'UNKNOWN';
    error: Readonly<Error>;
    set: Context['set'];
} | {
    request: Request;
    code: 'VALIDATION';
    error: Readonly<ValidationError>;
    set: Context['set'];
} | {
    request: Request;
    code: 'NOT_FOUND';
    error: Readonly<NotFoundError>;
    set: Context['set'];
} | {
    request: Request;
    code: 'PARSE';
    error: Readonly<ParseError>;
    set: Context['set'];
} | {
    request: Request;
    code: 'INTERNAL_SERVER_ERROR';
    error: Readonly<InternalServerError>;
    set: Context['set'];
} | {
    request: Request;
    code: 'INVALID_COOKIE_SIGNATURE';
    error: Readonly<InvalidCookieSignature>;
    set: Context['set'];
} | {
    [K in keyof T]: {
        request: Request;
        code: K;
        error: Readonly<T[K]>;
        set: Context['set'];
    };
}[keyof T])>) => any | Promise<any>;
type Isolate<T> = {
    [P in keyof T]: T[P];
};
type LocalHook<LocalSchema extends InputSchema = {}, Route extends RouteSchema = RouteSchema, Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}, Errors extends Record<string, Error> = {}, Extension extends BaseMacro = {}, Path extends string = '', TypedRoute extends RouteSchema = Route extends {
    params: Record<string, unknown>;
} ? Route : Route & {
    params: Record<GetPathParameter<Path>, string>;
}> = (LocalSchema extends {} ? LocalSchema : Isolate<LocalSchema>) & Extension & {
    /**
     * Short for 'Content-Type'
     *
     * Available:
     * - 'none': do not parse body
     * - 'text' / 'text/plain': parse body as string
     * - 'json' / 'application/json': parse body as json
     * - 'formdata' / 'multipart/form-data': parse body as form-data
     * - 'urlencoded' / 'application/x-www-form-urlencoded: parse body as urlencoded
     * - 'arraybuffer': parse body as readable stream
     */
    type?: ContentType;
    detail?: Partial<OpenAPIV3.OperationObject>;
    /**
     * Custom body parser
     */
    parse?: MaybeArray<BodyHandler<TypedRoute, Decorators>>;
    /**
     * Transform context's value
     */
    transform?: MaybeArray<TransformHandler<TypedRoute, Decorators>>;
    /**
     * Execute before main handler
     */
    beforeHandle?: MaybeArray<OptionalHandler<TypedRoute, Decorators>>;
    /**
     * Execute after main handler
     */
    afterHandle?: MaybeArray<AfterHandler<TypedRoute, Decorators>>;
    /**
     * Execute after main handler
     */
    mapResponse?: MaybeArray<MapResponse<TypedRoute, Decorators>>;
    /**
     * Catch error
     */
    error?: MaybeArray<ErrorHandler<Errors, TypedRoute, Decorators>>;
    /**
     * Custom body parser
     */
    onResponse?: MaybeArray<VoidHandler<TypedRoute, Decorators>>;
};
type ComposedHandler = (context: Context) => MaybePromise<Response>;
interface InternalRoute {
    method: HTTPMethod;
    path: string;
    composed: ComposedHandler | Response | null;
    handler: Handler;
    hooks: LocalHook;
}
type SchemaValidator = {
    body?: TypeCheck<any>;
    headers?: TypeCheck<any>;
    query?: TypeCheck<any>;
    params?: TypeCheck<any>;
    cookie?: TypeCheck<any>;
    response?: Record<number, TypeCheck<any>>;
};
type ListenCallback = (server: Server) => MaybePromise<void>;
type AddPrefix<Prefix extends string, T> = {
    [K in keyof T as `${Prefix}${K & string}`]: T[K];
};
type AddPrefixCapitalize<Prefix extends string, T> = {
    [K in keyof T as `${Prefix}${Capitalize<K & string>}`]: T[K];
};
type AddSuffix<Suffix extends string, T> = {
    [K in keyof T as `${K & string}${Suffix}`]: T[K];
};
type AddSuffixCapitalize<Suffix extends string, T> = {
    [K in keyof T as `${K & string}${Capitalize<Suffix>}`]: T[K];
};
type Checksum = {
    name?: string;
    seed?: unknown;
    checksum: number;
    stack?: string;
    routes?: InternalRoute[];
    decorators?: DecoratorBase['request'];
    store?: DecoratorBase['store'];
    type?: DefinitionBase['type'];
    error?: DefinitionBase['error'];
    dependencies?: Record<string, Checksum[]>;
    derive?: {
        fn: string;
        stack: string;
    }[];
    resolve?: {
        fn: string;
        stack: string;
    }[];
};
type BaseMacro = Record<string, BaseMacro | ((a: any) => unknown)>;
type MacroToProperty<T extends BaseMacro> = Prettify<{
    [K in keyof T]: T[K] extends Function ? T[K] extends (a: infer Params) => any ? Params | undefined : T[K] : MacroToProperty<T[K]>;
}>;
interface MacroManager<TypedRoute extends RouteSchema = {}, Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}, Errors extends Record<string, Error> = {}> {
    onParse(fn: MaybeArray<BodyHandler<TypedRoute, Decorators>>): unknown;
    onParse(options: {
        insert?: 'before' | 'after';
        stack?: 'global' | 'local';
    }, fn: MaybeArray<BodyHandler<TypedRoute, Decorators>>): unknown;
    onTransform(fn: MaybeArray<VoidHandler<TypedRoute, Decorators>>): unknown;
    onTransform(options: {
        insert?: 'before' | 'after';
        stack?: 'global' | 'local';
    }, fn: MaybeArray<VoidHandler<TypedRoute, Decorators>>): unknown;
    onBeforeHandle(fn: MaybeArray<OptionalHandler<TypedRoute, Decorators>>): unknown;
    onBeforeHandle(options: {
        insert?: 'before' | 'after';
        stack?: 'global' | 'local';
    }, fn: MaybeArray<OptionalHandler<TypedRoute, Decorators>>): unknown;
    onAfterHandle(fn: MaybeArray<AfterHandler<TypedRoute, Decorators>>): unknown;
    onAfterHandle(options: {
        insert?: 'before' | 'after';
        stack?: 'global' | 'local';
    }, fn: MaybeArray<AfterHandler<TypedRoute, Decorators>>): unknown;
    onError(fn: MaybeArray<ErrorHandler<Errors, TypedRoute, Decorators>>): unknown;
    onError(options: {
        insert?: 'before' | 'after';
        stack?: 'global' | 'local';
    }, fn: MaybeArray<ErrorHandler<Errors, TypedRoute, Decorators>>): unknown;
    onResponse(fn: MaybeArray<VoidHandler<TypedRoute, Decorators>>): unknown;
    onResponse(options: {
        insert?: 'before' | 'after';
        stack?: 'global' | 'local';
    }, fn: MaybeArray<VoidHandler<TypedRoute, Decorators>>): unknown;
    events: {
        global: Prettify<LifeCycleStore & RouteSchema>;
        local: Prettify<LifeCycleStore & RouteSchema>;
    };
}

declare const replaceUrlPath: (url: string, pathname: string) => string;
declare const mergeDeep: <const A extends Record<string, any>, const B extends Record<string, any>>(target: A, source: B, { skipKeys }?: {
    skipKeys?: string[] | undefined;
}) => A & B;
declare const mergeCookie: <const A extends Object, const B extends Object>(target: A, source: B) => A & B;
declare const mergeObjectArray: <T>(a: T | T[], b: T | T[]) => T[];
declare const primitiveHooks: readonly ["start", "request", "parse", "transform", "resolve", "beforeHandle", "afterHandle", "onResponse", "mapResponse", "trace", "error", "stop", "body", "headers", "params", "query", "response", "type", "detail"];
declare const mergeHook: (a?: LocalHook<any, any, any, any> | LifeCycleStore, b?: LocalHook<any, any, any, any>) => LifeCycleStore;
declare const getSchemaValidator: (s: TSchema | string | undefined, { models, additionalProperties, dynamic }: {
    models?: Record<string, TSchema> | undefined;
    additionalProperties?: boolean | undefined;
    dynamic?: boolean | undefined;
}) => TypeCheck<TSchema> | undefined;
declare const getResponseSchemaValidator: (s: InputSchema['response'] | undefined, { models, additionalProperties, dynamic }: {
    models?: Record<string, TSchema> | undefined;
    additionalProperties?: boolean | undefined;
    dynamic?: boolean | undefined;
}) => Record<number, TypeCheck<any>> | undefined;
declare const checksum: (s: string) => number;
declare const mergeLifeCycle: (a: LifeCycleStore, b: LifeCycleStore | LocalHook, checksum?: number) => LifeCycleStore;
declare const asGlobalHook: (hook: LocalHook<any, any>, inject?: boolean) => LocalHook<any, any>;
declare const asGlobal: <T extends MaybeArray<Function> | undefined>(fn: T, inject?: boolean) => T;
declare const filterGlobalHook: (hook: LocalHook<any, any>) => LocalHook<any, any>;
declare const StatusMap: {
    readonly Continue: 100;
    readonly 'Switching Protocols': 101;
    readonly Processing: 102;
    readonly 'Early Hints': 103;
    readonly OK: 200;
    readonly Created: 201;
    readonly Accepted: 202;
    readonly 'Non-Authoritative Information': 203;
    readonly 'No Content': 204;
    readonly 'Reset Content': 205;
    readonly 'Partial Content': 206;
    readonly 'Multi-Status': 207;
    readonly 'Already Reported': 208;
    readonly 'Multiple Choices': 300;
    readonly 'Moved Permanently': 301;
    readonly Found: 302;
    readonly 'See Other': 303;
    readonly 'Not Modified': 304;
    readonly 'Temporary Redirect': 307;
    readonly 'Permanent Redirect': 308;
    readonly 'Bad Request': 400;
    readonly Unauthorized: 401;
    readonly 'Payment Required': 402;
    readonly Forbidden: 403;
    readonly 'Not Found': 404;
    readonly 'Method Not Allowed': 405;
    readonly 'Not Acceptable': 406;
    readonly 'Proxy Authentication Required': 407;
    readonly 'Request Timeout': 408;
    readonly Conflict: 409;
    readonly Gone: 410;
    readonly 'Length Required': 411;
    readonly 'Precondition Failed': 412;
    readonly 'Payload Too Large': 413;
    readonly 'URI Too Long': 414;
    readonly 'Unsupported Media Type': 415;
    readonly 'Range Not Satisfiable': 416;
    readonly 'Expectation Failed': 417;
    readonly "I'm a teapot": 418;
    readonly 'Misdirected Request': 421;
    readonly 'Unprocessable Content': 422;
    readonly Locked: 423;
    readonly 'Failed Dependency': 424;
    readonly 'Too Early': 425;
    readonly 'Upgrade Required': 426;
    readonly 'Precondition Required': 428;
    readonly 'Too Many Requests': 429;
    readonly 'Request Header Fields Too Large': 431;
    readonly 'Unavailable For Legal Reasons': 451;
    readonly 'Internal Server Error': 500;
    readonly 'Not Implemented': 501;
    readonly 'Bad Gateway': 502;
    readonly 'Service Unavailable': 503;
    readonly 'Gateway Timeout': 504;
    readonly 'HTTP Version Not Supported': 505;
    readonly 'Variant Also Negotiates': 506;
    readonly 'Insufficient Storage': 507;
    readonly 'Loop Detected': 508;
    readonly 'Not Extended': 510;
    readonly 'Network Authentication Required': 511;
};
type HTTPStatusName = keyof typeof StatusMap;
declare const signCookie: (val: string, secret: string | null) => Promise<string>;
declare const unsignCookie: (input: string, secret: string | null) => Promise<string | false>;
declare const traceBackMacro: (extension: any, property: Record<string, unknown>, hooks?: Record<string, unknown>) => void;
declare const isNumericString: (message: string) => boolean;

type WithoutNullableKeys<Type> = {
    [Key in keyof Type]-?: NonNullable<Type[Key]>;
};

type Context<Route extends RouteSchema = RouteSchema, Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}, Path extends string = ''> = Prettify<{
    body: Route['body'];
    query: undefined extends Route['query'] ? Record<string, string | undefined> : Route['query'];
    params: undefined extends Route['params'] ? Path extends `${string}/${':' | '*'}${string}` ? Record<GetPathParameter<Path>, string> : never : Route['params'];
    headers: undefined extends Route['headers'] ? Record<string, string | undefined> : Route['headers'];
    cookie: undefined extends Route['cookie'] ? Record<string, Cookie<any>> : Record<string, Cookie<any>> & WithoutNullableKeys<{
        [key in keyof Route['cookie']]: Cookie<Route['cookie'][key]>;
    }>;
    set: {
        headers: Record<string, string> & {
            'Set-Cookie'?: string | string[];
        };
        status?: number | HTTPStatusName;
        redirect?: string;
        /**
         * ! Internal Property
         *
         * Use `Context.cookie` instead
         */
        cookie?: Record<string, Prettify<{
            value: string;
        } & CookieOptions>>;
    };
    path: string;
    request: Request;
    store: Decorators['store'];
} & Decorators['request'] & Decorators['derive'] & Decorators['resolve']>;
type PreContext<Decorators extends DecoratorBase = {
    request: {};
    store: {};
    derive: {};
    resolve: {};
}> = Prettify<{
    store: Decorators['store'];
    request: Request;
    set: {
        headers: {
            [header: string]: string;
        } & {
            ['Set-Cookie']?: string | string[];
        };
        status?: number;
        redirect?: string;
    };
} & Decorators['request']>;

export { type InternalRoute as $, mapCompactResponse as A, errorToResponse as B, type Context as C, getSchemaValidator as D, Elysia as E, mergeDeep as F, mergeHook as G, type Handler as H, InternalServerError as I, mergeObjectArray as J, getResponseSchemaValidator as K, type LifeCycleStore as L, type PreContext as M, NotFoundError as N, type DecoratorBase as O, type PreHandler as P, type DefinitionBase as Q, type RouteBase as R, type SchemaValidator as S, type TraceReporter as T, type InputSchema as U, ValidationError as V, WS as W, type LocalHook as X, type MergeSchema as Y, type RouteSchema as Z, type UnwrapRoute as _, type TraceHandler as a, type HTTPMethod as a0, type VoidHandler as a1, type BodyHandler as a2, type OptionalHandler as a3, type ErrorHandler as a4, type AfterHandler as a5, type LifeCycleEvent as a6, type TraceEvent as a7, type MaybePromise as a8, type ListenCallback as a9, checksum as aA, mergeLifeCycle as aB, asGlobalHook as aC, asGlobal as aD, filterGlobalHook as aE, StatusMap as aF, type HTTPStatusName as aG, signCookie as aH, unsignCookie as aI, traceBackMacro as aJ, isNumericString as aK, type UnwrapSchema as aa, type TraceProcess as ab, type Checksum as ac, type HeadersInit as ad, type MaybeArray as ae, type ObjectValues as af, type GetPathParameter as ag, type Prettify as ah, type Reconcile as ai, type UnwrapGroupGuardRoute as aj, type ContentType as ak, type MapResponse as al, type TransformHandler as am, type TraceListener as an, type GracefulHandler as ao, type Isolate as ap, type AddPrefix as aq, type AddPrefixCapitalize as ar, type AddSuffix as as, type AddSuffixCapitalize as at, type BaseMacro as au, type MacroToProperty as av, type MacroManager as aw, replaceUrlPath as ax, mergeCookie as ay, primitiveHooks as az, type TraceStream as b, type ElysiaErrors as c, type ElysiaConfig as d, type ComposedHandler as e, ElysiaWS as f, ERROR_CODE as g, ELYSIA_RESPONSE as h, isProduction as i, error as j, ParseError as k, InvalidCookieSignature as l, type CookieOptions as m, Cookie as n, createCookieJar as o, parseCookie as p, ElysiaTypeOptions as q, ElysiaType as r, type TCookie as s, t, isNotEmpty as u, parseSetCookies as v, websocket as w, cookieToHeader as x, mapResponse as y, mapEarlyResponse as z };
