// src/index.ts
import { Memoirist } from "memoirist";
import EventEmitter from "eventemitter3";

// src/trace.ts
var resolver = () => {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return [promise, resolve];
};
var createSignal = () => {
  const [start, resolveStart] = resolver();
  const [end, resolveEnd] = resolver();
  const children = [];
  const resolvers = [];
  return {
    signal: start,
    consume: (trace) => {
      switch (trace.type) {
        case "begin":
          if (trace.unit && children.length === 0)
            for (let i = 0; i < trace.unit; i++) {
              const [start2, resolveStart2] = resolver();
              const [end2, resolveEnd2] = resolver();
              children.push(start2);
              resolvers.push([
                (trace2) => {
                  resolveStart2({
                    children: [],
                    end: end2,
                    name: trace2.name ?? "",
                    skip: false,
                    time: trace2.time
                  });
                },
                (time) => {
                  resolveEnd2(time);
                }
              ]);
            }
          resolveStart({
            children,
            end,
            name: trace.name ?? "",
            skip: false,
            time: trace.time
          });
          break;
        case "end":
          resolveEnd(trace.time);
          break;
      }
    },
    consumeChild(trace) {
      switch (trace.type) {
        case "begin":
          if (!resolvers[0])
            return;
          const [resolveStart2] = resolvers[0];
          resolveStart2({
            children: [],
            end,
            name: trace.name ?? "",
            skip: false,
            time: trace.time
          });
          break;
        case "end":
          const child = resolvers.shift();
          if (!child)
            return;
          child[1](trace.time);
      }
    },
    resolve() {
      resolveStart({
        children: [],
        end: new Promise((resolve) => resolve(0)),
        name: "",
        skip: true,
        time: 0
      });
      for (const [resolveStart2, resolveEnd2] of resolvers) {
        resolveStart2({
          children: [],
          end: new Promise((resolve) => resolve(0)),
          name: "",
          skip: true,
          time: 0
        });
        resolveEnd2(0);
      }
      resolveEnd(0);
    }
  };
};
var createTraceListener = (getReporter, totalListener, handler) => {
  return async function trace(trace) {
    if (trace.event !== "request" || trace.type !== "begin")
      return;
    const id = trace.id;
    const reporter = getReporter();
    const request = createSignal();
    const parse2 = createSignal();
    const transform = createSignal();
    const beforeHandle = createSignal();
    const handle = createSignal();
    const afterHandle = createSignal();
    const error2 = createSignal();
    const response = createSignal();
    request.consume(trace);
    const reducer = (event) => {
      if (event.id === id)
        switch (event.event) {
          case "request":
            request.consume(event);
            break;
          case "request.unit":
            request.consumeChild(event);
            break;
          case "parse":
            parse2.consume(event);
            break;
          case "parse.unit":
            parse2.consumeChild(event);
            break;
          case "transform":
            transform.consume(event);
            break;
          case "transform.unit":
            transform.consumeChild(event);
            break;
          case "beforeHandle":
            beforeHandle.consume(event);
            break;
          case "beforeHandle.unit":
            beforeHandle.consumeChild(event);
            break;
          case "handle":
            handle.consume(event);
            break;
          case "afterHandle":
            afterHandle.consume(event);
            break;
          case "afterHandle.unit":
            afterHandle.consumeChild(event);
            break;
          case "error":
            error2.consume(event);
            break;
          case "error.unit":
            error2.consumeChild(event);
            break;
          case "response":
            if (event.type === "begin") {
              request.resolve();
              parse2.resolve();
              transform.resolve();
              beforeHandle.resolve();
              handle.resolve();
              afterHandle.resolve();
              error2.resolve();
            } else
              reporter.off("event", reducer);
            response.consume(event);
            break;
          case "response.unit":
            response.consumeChild(event);
            break;
          case "exit":
            request.resolve();
            parse2.resolve();
            transform.resolve();
            beforeHandle.resolve();
            handle.resolve();
            afterHandle.resolve();
            error2.resolve();
            break;
        }
    };
    reporter.on("event", reducer);
    await handler({
      id,
      // @ts-ignore
      context: trace.ctx,
      // @ts-ignore
      set: trace.ctx?.set,
      // @ts-ignore
      store: trace.ctx?.store,
      time: trace.time,
      request: request.signal,
      parse: parse2.signal,
      transform: transform.signal,
      beforeHandle: beforeHandle.signal,
      handle: handle.signal,
      afterHandle: afterHandle.signal,
      error: error2.signal,
      response: response.signal
    });
    reporter.emit(`res${id}.${totalListener}`, void 0);
  };
};

// src/error.ts
import { Value as Value2 } from "@sinclair/typebox/value";

// src/utils.ts
import { Kind } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { TypeCompiler } from "@sinclair/typebox/compiler";

// src/handler.ts
import { serialize } from "cookie";

// src/cookie.ts
import { parse } from "cookie";
var Cookie = class {
  constructor(_value, property = {}) {
    this._value = _value;
    this.property = property;
  }
  get() {
    return this._value;
  }
  get value() {
    return this._value;
  }
  set value(value) {
    if (typeof value === "object") {
      if (JSON.stringify(this.value) === JSON.stringify(value))
        return;
    } else if (this.value === value)
      return;
    this._value = value;
    this.sync();
  }
  add(config) {
    const updated = Object.assign(
      this.property,
      typeof config === "function" ? config(Object.assign(this.property, this.value)) : config
    );
    if ("value" in updated) {
      this._value = updated.value;
      delete updated.value;
    }
    this.property = updated;
    return this.sync();
  }
  set(config) {
    const updated = typeof config === "function" ? config(Object.assign(this.property, this.value)) : config;
    if ("value" in updated) {
      this._value = updated.value;
      delete updated.value;
    }
    this.property = updated;
    return this.sync();
  }
  remove(options) {
    if (this.value === void 0)
      return;
    this.set({
      domain: options?.domain,
      expires: /* @__PURE__ */ new Date(0),
      maxAge: 0,
      path: options?.path,
      sameSite: options?.sameSite,
      secure: options?.secure,
      value: ""
    });
  }
  get domain() {
    return this.property.domain;
  }
  set domain(value) {
    if (this.property.domain === value)
      return;
    this.property.domain = value;
    this.sync();
  }
  get expires() {
    return this.property.expires;
  }
  set expires(value) {
    if (this.property.expires?.getTime() === value?.getTime())
      return;
    this.property.expires = value;
    this.sync();
  }
  get httpOnly() {
    return this.property.httpOnly;
  }
  set httpOnly(value) {
    if (this.property.domain === value)
      return;
    this.property.httpOnly = value;
    this.sync();
  }
  get maxAge() {
    return this.property.maxAge;
  }
  set maxAge(value) {
    if (this.property.maxAge === value)
      return;
    this.property.maxAge = value;
    this.sync();
  }
  get path() {
    return this.property.path;
  }
  set path(value) {
    if (this.property.path === value)
      return;
    this.property.path = value;
    this.sync();
  }
  get priority() {
    return this.property.priority;
  }
  set priority(value) {
    if (this.property.priority === value)
      return;
    this.property.priority = value;
    this.sync();
  }
  get sameSite() {
    return this.property.sameSite;
  }
  set sameSite(value) {
    if (this.property.sameSite === value)
      return;
    this.property.sameSite = value;
    this.sync();
  }
  get secure() {
    return this.property.secure;
  }
  set secure(value) {
    if (this.property.secure === value)
      return;
    this.property.secure = value;
    this.sync();
  }
  toString() {
    return typeof this.value === "object" ? JSON.stringify(this.value) : this.value?.toString() ?? "";
  }
  sync() {
    if (!this.name || !this.setter)
      return this;
    if (!this.setter.cookie)
      this.setter.cookie = {
        [this.name]: Object.assign(this.property, {
          value: this.toString()
        })
      };
    else
      this.setter.cookie[this.name] = Object.assign(this.property, {
        value: this.toString()
      });
    return this;
  }
};
var createCookieJar = (initial, set, properties) => new Proxy(initial, {
  get(target, key) {
    if (key in target)
      return target[key];
    const cookie = new Cookie(
      void 0,
      properties ? { ...properties } : void 0
    );
    cookie.setter = set;
    cookie.name = key;
    return cookie;
  },
  set(target, key, value) {
    if (!(value instanceof Cookie))
      return false;
    if (!set.cookie)
      set.cookie = {};
    value.setter = set;
    value.name = key;
    value.sync();
    target[key] = value;
    return true;
  }
});
var parseCookie = async (set, cookieString, {
  secret,
  sign,
  ...properties
} = {}) => {
  if (!cookieString)
    return createCookieJar({}, set, properties);
  const jar = {};
  const isStringKey = typeof secret === "string";
  if (sign && sign !== true && !Array.isArray(sign))
    sign = [sign];
  const cookieKeys = Object.keys(parse(cookieString));
  for (let i = 0; i < cookieKeys.length; i++) {
    const key = cookieKeys[i];
    let value = parse(cookieString)[key];
    if (sign === true || sign?.includes(key)) {
      if (!secret)
        throw new Error("No secret is provided to cookie plugin");
      if (isStringKey) {
        value = await unsignCookie(value, secret);
        if (value === false)
          throw new InvalidCookieSignature(key);
      } else {
        let fail = true;
        for (let i2 = 0; i2 < secret.length; i2++) {
          const temp = await unsignCookie(value, secret[i2]);
          if (temp !== false) {
            value = temp;
            fail = false;
            break;
          }
        }
        if (fail)
          throw new InvalidCookieSignature(key);
      }
    }
    if (value === void 0)
      continue;
    const start = value.charCodeAt(0);
    if (start === 123 || start === 91)
      try {
        const cookie2 = new Cookie(JSON.parse(value));
        cookie2.setter = set;
        cookie2.name = key;
        jar[key] = cookie2;
        continue;
      } catch {
      }
    if (isNumericString(value))
      value = +value;
    else if (value === "true")
      value = true;
    else if (value === "false")
      value = false;
    const cookie = new Cookie(value, properties);
    cookie.setter = set;
    cookie.name = key;
    jar[key] = cookie;
  }
  return createCookieJar(jar, set);
};

// src/handler.ts
var hasHeaderShorthand = "toJSON" in new Headers();
var isNotEmpty = (obj) => {
  for (const x in obj)
    return true;
  return false;
};
var handleFile = (response, set) => {
  const size = response.size;
  if (size && set && set.status !== 206 && set.status !== 304 && set.status !== 412 && set.status !== 416 || !set && size) {
    if (set) {
      if (set.headers instanceof Headers) {
        if (hasHeaderShorthand)
          set.headers = set.headers.toJSON();
        else
          for (const [key, value] of set.headers.entries())
            if (key in set.headers)
              set.headers[key] = value;
      }
      return new Response(response, {
        status: set.status,
        headers: Object.assign(
          {
            "accept-ranges": "bytes",
            "content-range": `bytes 0-${size - 1}/${size}`
          },
          set.headers
        )
      });
    }
    return new Response(response, {
      headers: {
        "accept-ranges": "bytes",
        "content-range": `bytes 0-${size - 1}/${size}`
      }
    });
  }
  return new Response(response);
};
var parseSetCookies = (headers, setCookie) => {
  if (!headers || !Array.isArray(setCookie))
    return headers;
  headers.delete("Set-Cookie");
  for (let i = 0; i < setCookie.length; i++) {
    const index = setCookie[i].indexOf("=");
    headers.append(
      "Set-Cookie",
      `${setCookie[i].slice(0, index)}=${setCookie[i].slice(index + 1)}`
    );
  }
  return headers;
};
var cookieToHeader = (cookies) => {
  if (!cookies || typeof cookies !== "object" || !isNotEmpty(cookies))
    return void 0;
  const set = [];
  for (const [key, property] of Object.entries(cookies)) {
    if (!key || !property)
      continue;
    if (Array.isArray(property.value)) {
      for (let i = 0; i < property.value.length; i++) {
        let value = property.value[i];
        if (value === void 0 || value === null)
          continue;
        if (typeof value === "object")
          value = JSON.stringify(value);
        set.push(serialize(key, value, property));
      }
    } else {
      let value = property.value;
      if (value === void 0 || value === null)
        continue;
      if (typeof value === "object")
        value = JSON.stringify(value);
      set.push(serialize(key, property.value, property));
    }
  }
  if (set.length === 0)
    return void 0;
  if (set.length === 1)
    return set[0];
  return set;
};
var mapResponse = (response, set) => {
  if (response?.[response.$passthrough])
    response = response[response.$passthrough];
  if (response?.[ELYSIA_RESPONSE]) {
    set.status = response[ELYSIA_RESPONSE];
    response = response.response;
  }
  if (isNotEmpty(set.headers) || set.status !== 200 || set.redirect || set.cookie) {
    if (typeof set.status === "string")
      set.status = StatusMap[set.status];
    if (set.redirect) {
      set.headers.Location = set.redirect;
      if (!set.status || set.status < 300 || set.status >= 400)
        set.status = 302;
    }
    if (set.cookie && isNotEmpty(set.cookie))
      set.headers["Set-Cookie"] = cookieToHeader(set.cookie);
    if (set.headers["Set-Cookie"] && Array.isArray(set.headers["Set-Cookie"]))
      set.headers = parseSetCookies(
        new Headers(set.headers),
        set.headers["Set-Cookie"]
      );
    switch (response?.constructor?.name) {
      case "String":
        return new Response(response, set);
      case "Blob":
        return handleFile(response, set);
      case "Object":
      case "Array":
        return Response.json(response, set);
      case "ReadableStream":
        if (!set.headers["content-type"]?.startsWith(
          "text/event-stream"
        ))
          set.headers["content-type"] = "text/event-stream; charset=utf-8";
        return new Response(
          response,
          set
        );
      case void 0:
        if (!response)
          return new Response("", set);
        return Response.json(response, set);
      case "Response":
        const inherits = { ...set.headers };
        if (hasHeaderShorthand)
          set.headers = response.headers.toJSON();
        else
          for (const [key, value] of response.headers.entries())
            if (key in set.headers)
              set.headers[key] = value;
        for (const key in inherits)
          response.headers.append(key, inherits[key]);
        return response;
      case "Error":
        return errorToResponse(response, set);
      case "Promise":
        return response.then(
          (x) => mapResponse(x, set)
        );
      case "Function":
        return mapResponse(response(), set);
      case "Number":
      case "Boolean":
        return new Response(
          response.toString(),
          set
        );
      case "Cookie":
        if (response instanceof Cookie)
          return new Response(response.value, set);
        return new Response(response?.toString(), set);
      default:
        if (response instanceof Response) {
          const inherits2 = { ...set.headers };
          if (hasHeaderShorthand)
            set.headers = response.headers.toJSON();
          else
            for (const [key, value] of response.headers.entries())
              if (key in set.headers)
                set.headers[key] = value;
          for (const key in inherits2)
            response.headers.append(
              key,
              inherits2[key]
            );
          return response;
        }
        if (response instanceof Promise)
          return response.then((x) => mapResponse(x, set));
        if (response instanceof Error)
          return errorToResponse(response, set);
        const r = JSON.stringify(response);
        if (r.charCodeAt(0) === 123) {
          if (!set.headers["Content-Type"])
            set.headers["Content-Type"] = "application/json";
          return new Response(
            JSON.stringify(response),
            set
          );
        }
        return new Response(r, set);
    }
  } else
    switch (response?.constructor?.name) {
      case "String":
        return new Response(response);
      case "Blob":
        return handleFile(response, set);
      case "Object":
      case "Array":
        return new Response(JSON.stringify(response), {
          headers: {
            "content-type": "application/json"
          }
        });
      case "ReadableStream":
        return new Response(response, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8"
          }
        });
      case void 0:
        if (!response)
          return new Response("");
        return new Response(JSON.stringify(response), {
          headers: {
            "content-type": "application/json"
          }
        });
      case "Response":
        return response;
      case "Error":
        return errorToResponse(response, set);
      case "Promise":
        return response.then((x) => {
          const r2 = mapCompactResponse(x);
          if (r2 !== void 0)
            return r2;
          return new Response("");
        });
      case "Function":
        return mapCompactResponse(response());
      case "Number":
      case "Boolean":
        return new Response(response.toString());
      case "Cookie":
        if (response instanceof Cookie)
          return new Response(response.value, set);
        return new Response(response?.toString(), set);
      default:
        if (response instanceof Response)
          return new Response(response.body, {
            headers: {
              "Content-Type": "application/json"
            }
          });
        if (response instanceof Promise)
          return response.then((x) => mapResponse(x, set));
        if (response instanceof Error)
          return errorToResponse(response, set);
        const r = JSON.stringify(response);
        if (r.charCodeAt(0) === 123)
          return new Response(JSON.stringify(response), {
            headers: {
              "Content-Type": "application/json"
            }
          });
        return new Response(r);
    }
};
var mapEarlyResponse = (response, set) => {
  if (response === void 0 || response === null)
    return;
  if (
    // @ts-ignore
    response?.$passthrough
  )
    response = response[response.$passthrough];
  if (response?.[ELYSIA_RESPONSE]) {
    set.status = response[ELYSIA_RESPONSE];
    response = response.response;
  }
  if (isNotEmpty(set.headers) || set.status !== 200 || set.redirect || set.cookie) {
    if (typeof set.status === "string")
      set.status = StatusMap[set.status];
    if (set.redirect) {
      set.headers.Location = set.redirect;
      if (!set.status || set.status < 300 || set.status >= 400)
        set.status = 302;
    }
    if (set.cookie && isNotEmpty(set.cookie))
      set.headers["Set-Cookie"] = cookieToHeader(set.cookie);
    if (set.headers["Set-Cookie"] && Array.isArray(set.headers["Set-Cookie"]))
      set.headers = parseSetCookies(
        new Headers(set.headers),
        set.headers["Set-Cookie"]
      );
    switch (response?.constructor?.name) {
      case "String":
        return new Response(response, set);
      case "Blob":
        return handleFile(response, set);
      case "Object":
      case "Array":
        return Response.json(response, set);
      case "ReadableStream":
        if (!set.headers["content-type"]?.startsWith(
          "text/event-stream"
        ))
          set.headers["content-type"] = "text/event-stream; charset=utf-8";
        return new Response(
          response,
          set
        );
      case void 0:
        if (!response)
          return;
        return Response.json(response, set);
      case "Response":
        const inherits = Object.assign({}, set.headers);
        if (hasHeaderShorthand)
          set.headers = response.headers.toJSON();
        else
          for (const [key, value] of response.headers.entries())
            if (!(key in set.headers))
              set.headers[key] = value;
        for (const key in inherits)
          response.headers.append(key, inherits[key]);
        if (response.status !== set.status)
          set.status = response.status;
        return response;
      case "Promise":
        return response.then((x) => {
          const r2 = mapEarlyResponse(x, set);
          if (r2 !== void 0)
            return r2;
          return;
        });
      case "Error":
        return errorToResponse(response, set);
      case "Function":
        return mapEarlyResponse(response(), set);
      case "Number":
      case "Boolean":
        return new Response(
          response.toString(),
          set
        );
      case "Cookie":
        if (response instanceof Cookie)
          return new Response(response.value, set);
        return new Response(response?.toString(), set);
      default:
        if (response instanceof Response) {
          const inherits2 = { ...set.headers };
          if (hasHeaderShorthand)
            set.headers = response.headers.toJSON();
          else
            for (const [key, value] of response.headers.entries())
              if (key in set.headers)
                set.headers[key] = value;
          for (const key in inherits2)
            response.headers.append(
              key,
              inherits2[key]
            );
          return response;
        }
        if (response instanceof Promise)
          return response.then((x) => mapEarlyResponse(x, set));
        if (response instanceof Error)
          return errorToResponse(response, set);
        const r = JSON.stringify(response);
        if (r.charCodeAt(0) === 123) {
          if (!set.headers["Content-Type"])
            set.headers["Content-Type"] = "application/json";
          return new Response(
            JSON.stringify(response),
            set
          );
        }
        return new Response(r, set);
    }
  } else
    switch (response?.constructor?.name) {
      case "String":
        return new Response(response);
      case "Blob":
        return handleFile(response, set);
      case "Object":
      case "Array":
        return new Response(JSON.stringify(response), {
          headers: {
            "content-type": "application/json"
          }
        });
      case "ReadableStream":
        return new Response(response, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8"
          }
        });
      case void 0:
        if (!response)
          return new Response("");
        return new Response(JSON.stringify(response), {
          headers: {
            "content-type": "application/json"
          }
        });
      case "Response":
        return response;
      case "Promise":
        return response.then((x) => {
          const r2 = mapEarlyResponse(x, set);
          if (r2 !== void 0)
            return r2;
          return;
        });
      case "Error":
        return errorToResponse(response, set);
      case "Function":
        return mapCompactResponse(response());
      case "Number":
      case "Boolean":
        return new Response(response.toString());
      case "Cookie":
        if (response instanceof Cookie)
          return new Response(response.value, set);
        return new Response(response?.toString(), set);
      default:
        if (response instanceof Response)
          return new Response(response.body, {
            headers: {
              "Content-Type": "application/json"
            }
          });
        if (response instanceof Promise)
          return response.then((x) => mapEarlyResponse(x, set));
        if (response instanceof Error)
          return errorToResponse(response, set);
        const r = JSON.stringify(response);
        if (r.charCodeAt(0) === 123)
          return new Response(JSON.stringify(response), {
            headers: {
              "Content-Type": "application/json"
            }
          });
        return new Response(r);
    }
};
var mapCompactResponse = (response) => {
  if (
    // @ts-ignore
    response?.$passthrough
  )
    response = response[response.$passthrough];
  if (response?.[ELYSIA_RESPONSE])
    return mapResponse(response.response, {
      // @ts-ignore
      status: response[ELYSIA_RESPONSE],
      headers: {}
    });
  switch (response?.constructor?.name) {
    case "String":
      return new Response(response);
    case "Blob":
      return handleFile(response);
    case "Object":
    case "Array":
      return new Response(JSON.stringify(response), {
        headers: {
          "content-type": "application/json"
        }
      });
    case "ReadableStream":
      return new Response(response, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8"
        }
      });
    case void 0:
      if (!response)
        return new Response("");
      return new Response(JSON.stringify(response), {
        headers: {
          "content-type": "application/json"
        }
      });
    case "Response":
      return response;
    case "Error":
      return errorToResponse(response);
    case "Promise":
      return response.then(
        mapCompactResponse
      );
    case "Function":
      return mapCompactResponse(response());
    case "Number":
    case "Boolean":
      return new Response(response.toString());
    default:
      if (response instanceof Response)
        return new Response(response.body, {
          headers: {
            "Content-Type": "application/json"
          }
        });
      if (response instanceof Promise)
        return response.then(mapCompactResponse);
      if (response instanceof Error)
        return errorToResponse(response);
      const r = JSON.stringify(response);
      if (r.charCodeAt(0) === 123)
        return new Response(JSON.stringify(response), {
          headers: {
            "Content-Type": "application/json"
          }
        });
      return new Response(r);
  }
};
var errorToResponse = (error2, set) => new Response(
  JSON.stringify({
    name: error2?.name,
    message: error2?.message,
    cause: error2?.cause
  }),
  {
    status: set?.status !== 200 ? set?.status ?? 500 : 500,
    headers: set?.headers
  }
);

// src/utils.ts
var isObject = (item) => item && typeof item === "object" && !Array.isArray(item);
var replaceUrlPath = (url, pathname) => {
  const urlObject = new URL(url);
  urlObject.pathname = pathname;
  return urlObject.toString();
};
var isClass = (v) => typeof v === "function" && /^\s*class\s+/.test(v.toString()) || // Handle import * as Sentry from '@sentry/bun'
// This also handle [object Date], [object Array]
// and FFI value like [object Prisma]
v.toString().startsWith("[object ") || // If object prototype is not pure, then probably a class-like object
isNotEmpty(Object.getPrototypeOf(v));
var mergeDeep = (target, source, {
  skipKeys
} = {}) => {
  if (isObject(target) && isObject(source))
    for (const [key, value] of Object.entries(source)) {
      if (skipKeys?.includes(key))
        continue;
      if (!isObject(value)) {
        target[key] = value;
        continue;
      }
      if (!(key in target)) {
        target[key] = value;
        continue;
      }
      if (isClass(value)) {
        target[key] = value;
        continue;
      }
      target[key] = mergeDeep(
        target[key],
        value
      );
    }
  return target;
};
var mergeCookie = (target, source) => mergeDeep(target, source, {
  skipKeys: ["properties"]
});
var mergeObjectArray = (a, b) => {
  if (!a)
    return [];
  const array = [...Array.isArray(a) ? a : [a]];
  const checksums = [];
  for (const item of array) {
    if (item.$elysiaChecksum)
      checksums.push(item.$elysiaChecksum);
  }
  for (const item of Array.isArray(b) ? b : [b]) {
    if (!checksums.includes(item?.$elysiaChecksum)) {
      array.push(item);
    }
  }
  return array;
};
var primitiveHooks = [
  "start",
  "request",
  "parse",
  "transform",
  "resolve",
  "beforeHandle",
  "afterHandle",
  "onResponse",
  "mapResponse",
  "trace",
  "error",
  "stop",
  "body",
  "headers",
  "params",
  "query",
  "response",
  "type",
  "detail"
];
var mergeHook = (a, b) => {
  return {
    ...a,
    ...b,
    // Merge local hook first
    // @ts-ignore
    body: b?.body ?? a?.body,
    // @ts-ignore
    headers: b?.headers ?? a?.headers,
    // @ts-ignore
    params: b?.params ?? a?.params,
    // @ts-ignore
    query: b?.query ?? a?.query,
    // @ts-ignore
    response: b?.response ?? a?.response,
    type: a?.type || b?.type,
    detail: mergeDeep(
      // @ts-ignore
      b?.detail ?? {},
      // @ts-ignore
      a?.detail ?? {}
    ),
    parse: mergeObjectArray(a?.parse ?? [], b?.parse ?? []),
    transform: mergeObjectArray(
      a?.transform ?? [],
      b?.transform ?? []
    ),
    beforeHandle: mergeObjectArray(
      a?.beforeHandle ?? [],
      b?.beforeHandle ?? []
    ),
    afterHandle: mergeObjectArray(
      a?.afterHandle ?? [],
      b?.afterHandle ?? []
    ),
    onResponse: mergeObjectArray(
      a?.onResponse ?? [],
      b?.onResponse ?? []
    ),
    mapResponse: mergeObjectArray(
      a?.mapResponse ?? [],
      b?.mapResponse ?? []
    ),
    trace: mergeObjectArray(a?.trace ?? [], b?.trace ?? []),
    error: mergeObjectArray(a?.error ?? [], b?.error ?? [])
  };
};
var getSchemaValidator = (s, {
  models = {},
  additionalProperties = false,
  dynamic = false
}) => {
  if (!s)
    return;
  if (typeof s === "string" && !(s in models))
    return;
  const schema = typeof s === "string" ? models[s] : s;
  if (schema.type === "object" && "additionalProperties" in schema === false)
    schema.additionalProperties = additionalProperties;
  if (dynamic)
    return {
      schema,
      references: "",
      checkFunc: () => {
      },
      code: "",
      Check: (value) => Value.Check(schema, value),
      Errors: (value) => Value.Errors(schema, value),
      Code: () => ""
    };
  return TypeCompiler.Compile(schema, Object.values(models));
};
var getResponseSchemaValidator = (s, {
  models = {},
  additionalProperties = false,
  dynamic = false
}) => {
  if (!s)
    return;
  if (typeof s === "string" && !(s in models))
    return;
  const maybeSchemaOrRecord = typeof s === "string" ? models[s] : s;
  const compile = (schema, references) => {
    if (dynamic)
      return {
        schema,
        references: "",
        checkFunc: () => {
        },
        code: "",
        Check: (value) => Value.Check(schema, value),
        Errors: (value) => Value.Errors(schema, value),
        Code: () => ""
      };
    return TypeCompiler.Compile(schema, references);
  };
  if (Kind in maybeSchemaOrRecord) {
    if ("additionalProperties" in maybeSchemaOrRecord === false)
      maybeSchemaOrRecord.additionalProperties = additionalProperties;
    return {
      200: compile(maybeSchemaOrRecord, Object.values(models))
    };
  }
  const record = {};
  Object.keys(maybeSchemaOrRecord).forEach((status) => {
    const maybeNameOrSchema = maybeSchemaOrRecord[+status];
    if (typeof maybeNameOrSchema === "string") {
      if (maybeNameOrSchema in models) {
        const schema = models[maybeNameOrSchema];
        schema.type === "object" && "additionalProperties" in schema === false;
        record[+status] = Kind in schema ? compile(schema, Object.values(models)) : schema;
      }
      return void 0;
    }
    if (maybeNameOrSchema.type === "object" && "additionalProperties" in maybeNameOrSchema === false)
      maybeNameOrSchema.additionalProperties = additionalProperties;
    record[+status] = Kind in maybeNameOrSchema ? compile(maybeNameOrSchema, Object.values(models)) : maybeNameOrSchema;
  });
  return record;
};
var isBun = typeof Bun !== "undefined";
var hasHash = isBun && typeof Bun.hash === "function";
var checksum = (s) => {
  if (hasHash)
    return Bun.hash(s);
  let h = 9;
  for (let i = 0; i < s.length; )
    h = Math.imul(h ^ s.charCodeAt(i++), 9 ** 9);
  return h = h ^ h >>> 9;
};
var mergeLifeCycle = (a, b, checksum2) => {
  const injectChecksum = (x) => {
    if (checksum2 && !x.$elysiaChecksum)
      x.$elysiaChecksum = checksum2;
    return x;
  };
  return {
    ...a,
    ...b,
    start: mergeObjectArray(
      a.start,
      ("start" in b ? b.start ?? [] : []).map(injectChecksum)
    ),
    request: mergeObjectArray(
      a.request,
      ("request" in b ? b.request ?? [] : []).map(injectChecksum)
    ),
    parse: mergeObjectArray(
      a.parse,
      "parse" in b ? b?.parse ?? [] : []
    ).map(injectChecksum),
    transform: mergeObjectArray(
      a.transform,
      (b?.transform ?? []).map(injectChecksum)
    ),
    beforeHandle: mergeObjectArray(
      a.beforeHandle,
      (b?.beforeHandle ?? []).map(injectChecksum)
    ),
    afterHandle: mergeObjectArray(
      a.afterHandle,
      (b?.afterHandle ?? []).map(injectChecksum)
    ),
    mapResponse: mergeObjectArray(
      a.mapResponse,
      (b?.mapResponse ?? []).map(injectChecksum)
    ),
    onResponse: mergeObjectArray(
      a.onResponse,
      (b?.onResponse ?? []).map(injectChecksum)
    ),
    trace: a.trace,
    error: mergeObjectArray(
      a.error,
      (b?.error ?? []).map(injectChecksum)
    ),
    stop: mergeObjectArray(
      a.stop,
      ("stop" in b ? b.stop ?? [] : []).map(injectChecksum)
    )
  };
};
var asGlobal = (fn, inject = true) => {
  if (!fn)
    return fn;
  if (typeof fn === "function") {
    if (inject)
      fn.$elysiaHookType = "global";
    else
      fn.$elysiaHookType = void 0;
    return fn;
  }
  return fn.map((x) => {
    if (inject)
      x.$elysiaHookType = "global";
    else
      x.$elysiaHookType = void 0;
    return x;
  });
};
var filterGlobal = (fn) => {
  if (!fn)
    return fn;
  if (typeof fn === "function") {
    return fn.$elysiaHookType === "global" ? fn : void 0;
  }
  return fn.filter((x) => x.$elysiaHookType === "global");
};
var filterGlobalHook = (hook) => {
  return {
    // rest is validator
    ...hook,
    type: hook?.type,
    detail: hook?.detail,
    parse: filterGlobal(hook?.parse),
    transform: filterGlobal(hook?.transform),
    beforeHandle: filterGlobal(hook?.beforeHandle),
    afterHandle: filterGlobal(hook?.afterHandle),
    onResponse: filterGlobal(hook?.onResponse),
    error: filterGlobal(hook?.error)
  };
};
var StatusMap = {
  Continue: 100,
  "Switching Protocols": 101,
  Processing: 102,
  "Early Hints": 103,
  OK: 200,
  Created: 201,
  Accepted: 202,
  "Non-Authoritative Information": 203,
  "No Content": 204,
  "Reset Content": 205,
  "Partial Content": 206,
  "Multi-Status": 207,
  "Already Reported": 208,
  "Multiple Choices": 300,
  "Moved Permanently": 301,
  Found: 302,
  "See Other": 303,
  "Not Modified": 304,
  "Temporary Redirect": 307,
  "Permanent Redirect": 308,
  "Bad Request": 400,
  Unauthorized: 401,
  "Payment Required": 402,
  Forbidden: 403,
  "Not Found": 404,
  "Method Not Allowed": 405,
  "Not Acceptable": 406,
  "Proxy Authentication Required": 407,
  "Request Timeout": 408,
  Conflict: 409,
  Gone: 410,
  "Length Required": 411,
  "Precondition Failed": 412,
  "Payload Too Large": 413,
  "URI Too Long": 414,
  "Unsupported Media Type": 415,
  "Range Not Satisfiable": 416,
  "Expectation Failed": 417,
  "I'm a teapot": 418,
  "Misdirected Request": 421,
  "Unprocessable Content": 422,
  Locked: 423,
  "Failed Dependency": 424,
  "Too Early": 425,
  "Upgrade Required": 426,
  "Precondition Required": 428,
  "Too Many Requests": 429,
  "Request Header Fields Too Large": 431,
  "Unavailable For Legal Reasons": 451,
  "Internal Server Error": 500,
  "Not Implemented": 501,
  "Bad Gateway": 502,
  "Service Unavailable": 503,
  "Gateway Timeout": 504,
  "HTTP Version Not Supported": 505,
  "Variant Also Negotiates": 506,
  "Insufficient Storage": 507,
  "Loop Detected": 508,
  "Not Extended": 510,
  "Network Authentication Required": 511
};
var signCookie = async (val, secret) => {
  if (typeof val !== "string")
    throw new TypeError("Cookie value must be provided as a string.");
  if (secret === null)
    throw new TypeError("Secret key must be provided.");
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const hmacBuffer = await crypto.subtle.sign(
    "HMAC",
    secretKey,
    encoder.encode(val)
  );
  const hmacArray = Array.from(new Uint8Array(hmacBuffer));
  const digest = btoa(String.fromCharCode(...hmacArray));
  return `${val}.${digest.replace(/=+$/, "")}`;
};
var unsignCookie = async (input, secret) => {
  if (typeof input !== "string")
    throw new TypeError("Signed cookie string must be provided.");
  if (null === secret)
    throw new TypeError("Secret key must be provided.");
  const tentativeValue = input.slice(0, input.lastIndexOf("."));
  const expectedInput = await signCookie(tentativeValue, secret);
  return expectedInput === input ? tentativeValue : false;
};
var traceBackMacro = (extension, property, hooks = property) => {
  for (const [key, value] of Object.entries(property ?? {})) {
    if (primitiveHooks.includes(key) || !(key in extension))
      continue;
    if (typeof extension[key] === "function") {
      extension[key](value);
    } else if (typeof extension[key] === "object")
      traceBackMacro(extension[key], value, hooks);
  }
};
var isNumericString = (message) => message.trim().length !== 0 && !Number.isNaN(Number(message));

// src/error.ts
var env = typeof Bun !== "undefined" ? Bun.env : typeof process !== "undefined" ? process?.env : void 0;
var ERROR_CODE = Symbol("ElysiaErrorCode");
var ELYSIA_RESPONSE = Symbol("ElysiaResponse");
var isProduction = (env?.NODE_ENV ?? env?.ENV) === "production";
var error = (code, response) => ({
  // @ts-ignore
  [ELYSIA_RESPONSE]: StatusMap[code] ?? code,
  response
});
var InternalServerError = class extends Error {
  constructor(message) {
    super(message ?? "INTERNAL_SERVER_ERROR");
    this.code = "INTERNAL_SERVER_ERROR";
    this.status = 500;
  }
};
var NotFoundError = class extends Error {
  constructor(message) {
    super(message ?? "NOT_FOUND");
    this.code = "NOT_FOUND";
    this.status = 404;
  }
};
var ParseError = class extends Error {
  constructor(message) {
    super(message ?? "PARSE");
    this.code = "PARSE";
    this.status = 400;
  }
};
var InvalidCookieSignature = class extends Error {
  constructor(key, message) {
    super(message ?? `"${key}" has invalid cookie signature`);
    this.key = key;
    this.code = "INVALID_COOKIE_SIGNATURE";
    this.status = 400;
  }
};
var ValidationError = class _ValidationError extends Error {
  constructor(type, validator, value) {
    const error2 = isProduction ? void 0 : "Errors" in validator ? validator.Errors(value).First() : Value2.Errors(validator, value).First();
    const customError = error2?.schema.error ? typeof error2.schema.error === "function" ? error2.schema.error(type, validator, value) : error2.schema.error : void 0;
    const accessor = error2?.path?.slice(1) || "root";
    let message = "";
    if (customError) {
      message = typeof customError === "object" ? JSON.stringify(customError) : customError + "";
    } else if (isProduction) {
      message = JSON.stringify({
        type,
        message: error2?.message
      });
    } else {
      message = JSON.stringify(
        {
          type,
          at: accessor,
          message: error2?.message,
          expected: Value2.Create(
            // @ts-ignore private field
            validator.schema
          ),
          found: value,
          errors: [...validator.Errors(value)]
        },
        null,
        2
      );
    }
    super(message);
    this.type = type;
    this.validator = validator;
    this.value = value;
    this.code = "VALIDATION";
    this.status = 400;
    Object.setPrototypeOf(this, _ValidationError.prototype);
  }
  get all() {
    return [...this.validator.Errors(this.value)];
  }
  static simplifyModel(validator) {
    const model = "schema" in validator ? validator.schema : validator;
    try {
      return Value2.Create(model);
    } catch {
      return model;
    }
  }
  get model() {
    return _ValidationError.simplifyModel(this.validator);
  }
  toResponse(headers) {
    return new Response(this.message, {
      status: 400,
      headers
    });
  }
};

// src/ws/index.ts
var websocket = {
  open(ws) {
    ws.data.open?.(ws);
  },
  message(ws, message) {
    ws.data.message?.(ws, message);
  },
  drain(ws) {
    ws.data.drain?.(ws);
  },
  close(ws, code, reason) {
    ws.data.close?.(ws, code, reason);
  }
};
var ElysiaWS = class {
  constructor(raw, data) {
    this.raw = raw;
    this.data = data;
    this.validator = raw.data.validator;
    if (raw.data.id) {
      this.id = raw.data.id;
    } else {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      this.id = array[0].toString();
    }
  }
  get id() {
    return this.raw.data.id;
  }
  set id(newID) {
    this.raw.data.id = newID;
  }
  get publish() {
    return (topic, data = void 0, compress) => {
      if (this.validator?.Check(data) === false)
        throw new ValidationError("message", this.validator, data);
      if (typeof data === "object")
        data = JSON.stringify(data);
      this.raw.publish(topic, data, compress);
      return this;
    };
  }
  get send() {
    return (data) => {
      if (this.validator?.Check(data) === false)
        throw new ValidationError("message", this.validator, data);
      if (Buffer.isBuffer(data)) {
        this.raw.send(data);
        return this;
      }
      if (typeof data === "object")
        data = JSON.stringify(data);
      this.raw.send(data);
      return this;
    };
  }
  get subscribe() {
    return (room) => {
      this.raw.subscribe(room);
      return this;
    };
  }
  get unsubscribe() {
    return (room) => {
      this.raw.unsubscribe(room);
      return this;
    };
  }
  get cork() {
    return (callback) => {
      this.raw.cork(callback);
      return this;
    };
  }
  get close() {
    return () => {
      this.raw.close();
      return this;
    };
  }
  get terminate() {
    return this.raw.terminate.bind(this.raw);
  }
  get isSubscribed() {
    return this.raw.isSubscribed.bind(this.raw);
  }
  get remoteAddress() {
    return this.raw.remoteAddress;
  }
};

// src/compose.ts
import { Value as Value3 } from "@sinclair/typebox/value";
import { parse as parseQuery } from "fast-querystring";
import decodeURIComponent from "fast-decode-uri-component";
var headersHasToJSON = new Headers().toJSON;
var findAliases = new RegExp(` (\\w+) = context`, "g");
var requestId = { value: 0 };
var createReport = ({
  hasTrace,
  hasTraceSet = false,
  addFn,
  condition = {}
}) => {
  if (hasTrace) {
    addFn(`
const reporter = getReporter()
`);
    return (event, {
      name,
      attribute = "",
      unit = 0
    } = {}) => {
      const dotIndex = event.indexOf(".");
      const isGroup = dotIndex === -1;
      if (event !== "request" && event !== "response" && !condition[isGroup ? event : event.slice(0, dotIndex)])
        return () => {
          if (hasTraceSet && event === "afterHandle")
            addFn(`
await traceDone
`);
        };
      if (isGroup)
        name ||= event;
      else
        name ||= "anonymous";
      addFn(
        "\n" + `reporter.emit('event', {
					id,
					event: '${event}',
					type: 'begin',
					name: '${name}',
					time: performance.now(),
					${isGroup ? `unit: ${unit},` : ""}
					${attribute}
				})`.replace(/(\t| |\n)/g, "") + "\n"
      );
      let handled = false;
      return () => {
        if (handled)
          return;
        handled = true;
        addFn(
          "\n" + `reporter.emit('event', {
							id,
							event: '${event}',
							type: 'end',
							time: performance.now()
						})`.replace(/(\t| |\n)/g, "") + "\n"
        );
        if (hasTraceSet && event === "afterHandle")
          addFn(`
await traceDone
`);
      };
    };
  } else {
    return () => () => {
    };
  }
};
var hasReturn = (fnLiteral) => {
  const parenthesisEnd = fnLiteral.indexOf(")");
  if (fnLiteral.charCodeAt(parenthesisEnd + 2) === 61 && fnLiteral.charCodeAt(parenthesisEnd + 5) !== 123) {
    return true;
  }
  return fnLiteral.includes("return");
};
var composeValidationFactory = (hasErrorHandler, {
  injectResponse = ""
} = {}) => ({
  composeValidation: (type, value = `c.${type}`) => hasErrorHandler ? `c.set.status = 400; throw new ValidationError(
'${type}',
${type},
${value}
)` : `c.set.status = 400; return new ValidationError(
	'${type}',
	${type},
	${value}
).toResponse(c.set.headers)`,
  composeResponseValidation: (name = "r") => {
    const returnError = hasErrorHandler ? `throw new ValidationError(
'response',
response[c.set.status],
${name}
)` : `return new ValidationError(
'response',
response[c.set.status],
${name}
).toResponse(c.set.headers)`;
    return `
${injectResponse}
		if(!(${name} instanceof Response) && response[c.set.status]?.Check(${name}) === false) {
	if(!(response instanceof Error))
		${returnError}
}
`;
  }
});
var isFnUse = (keyword, fnLiteral) => {
  if (fnLiteral.startsWith("[object "))
    return false;
  fnLiteral = fnLiteral.trimStart();
  fnLiteral = fnLiteral.replaceAll(/^async /g, "");
  if (/^(\w+)\(/g.test(fnLiteral))
    fnLiteral = fnLiteral.slice(fnLiteral.indexOf("("));
  const argument = (
    // CharCode 40 is '('
    fnLiteral.charCodeAt(0) === 40 || fnLiteral.startsWith("function") ? (
      // Bun: (context) => {}
      fnLiteral.slice(
        fnLiteral.indexOf("(") + 1,
        fnLiteral.indexOf(")")
      )
    ) : (
      // Node: context => {}
      fnLiteral.slice(0, fnLiteral.indexOf("=") - 1)
    )
  );
  if (argument === "")
    return false;
  const restIndex = argument.charCodeAt(0) === 123 ? argument.indexOf("...") : -1;
  if (argument.charCodeAt(0) === 123) {
    if (argument.includes(keyword))
      return true;
    if (restIndex === -1)
      return false;
  }
  if (fnLiteral.match(
    new RegExp(`${argument}(.${keyword}|\\["${keyword}"\\])`)
  )) {
    return true;
  }
  const restAlias = restIndex !== -1 ? argument.slice(
    restIndex + 3,
    argument.indexOf(" ", restIndex + 3)
  ) : void 0;
  if (fnLiteral.match(
    new RegExp(`${restAlias}(.${keyword}|\\["${keyword}"\\])`)
  ))
    return true;
  const aliases = [argument];
  if (restAlias)
    aliases.push(restAlias);
  for (const found of fnLiteral.matchAll(findAliases))
    aliases.push(found[1]);
  const destructuringRegex = new RegExp(`{.*?} = (${aliases.join("|")})`, "g");
  for (const [params] of fnLiteral.matchAll(destructuringRegex))
    if (params.includes(`{ ${keyword}`) || params.includes(`, ${keyword}`))
      return true;
  return false;
};
var isContextPassToFunction = (fnLiteral) => {
  fnLiteral = fnLiteral.trimStart();
  if (fnLiteral.startsWith("[object"))
    return false;
  fnLiteral = fnLiteral.replaceAll(/^async /g, "");
  if (/^(\w+)\(/g.test(fnLiteral))
    fnLiteral = fnLiteral.slice(fnLiteral.indexOf("("));
  const argument = (
    // CharCode 40 is '('
    fnLiteral.charCodeAt(0) === 40 || fnLiteral.startsWith("function") ? (
      // Bun: (context) => {}
      fnLiteral.slice(
        fnLiteral.indexOf("(") + 1,
        fnLiteral.indexOf(")")
      )
    ) : (
      // Node: context => {}
      fnLiteral.slice(0, fnLiteral.indexOf("=") - 1)
    )
  );
  if (argument === "")
    return false;
  const restIndex = argument.charCodeAt(0) === 123 ? argument.indexOf("...") : -1;
  const restAlias = restIndex !== -1 ? argument.slice(
    restIndex + 3,
    argument.indexOf(" ", restIndex + 3)
  ) : void 0;
  const aliases = [argument];
  if (restAlias)
    aliases.push(restAlias);
  for (const found of fnLiteral.matchAll(findAliases))
    aliases.push(found[1]);
  for (const alias of aliases)
    if (new RegExp(`\\b\\w+\\([^)]*\\b${alias}\\b[^)]*\\)`).test(fnLiteral))
      return true;
  const destructuringRegex = new RegExp(`{.*?} = (${aliases.join("|")})`, "g");
  for (const [renamed] of fnLiteral.matchAll(destructuringRegex))
    if (new RegExp(`\\b\\w+\\([^)]*\\b${renamed}\\b[^)]*\\)`).test(
      fnLiteral
    ))
      return true;
  return false;
};
var KindSymbol = Symbol.for("TypeBox.Kind");
var hasType = (type, schema) => {
  if (!schema)
    return;
  if (KindSymbol in schema && schema[KindSymbol] === type)
    return true;
  if (schema.type === "object") {
    const properties = schema.properties;
    for (const key of Object.keys(properties)) {
      const property = properties[key];
      if (property.type === "object") {
        if (hasType(type, property))
          return true;
      } else if (property.anyOf) {
        for (let i = 0; i < property.anyOf.length; i++)
          if (hasType(type, property.anyOf[i]))
            return true;
      }
      if (KindSymbol in property && property[KindSymbol] === type)
        return true;
    }
    return false;
  }
  return schema.properties && KindSymbol in schema.properties && schema.properties[KindSymbol] === type;
};
var hasProperty = (expectedProperty, schema) => {
  if (!schema)
    return;
  if (schema.type === "object") {
    const properties = schema.properties;
    if (!properties)
      return false;
    for (const key of Object.keys(properties)) {
      const property = properties[key];
      if (expectedProperty in property)
        return true;
      if (property.type === "object") {
        if (hasProperty(expectedProperty, property))
          return true;
      } else if (property.anyOf) {
        for (let i = 0; i < property.anyOf.length; i++) {
          if (hasProperty(expectedProperty, property.anyOf[i]))
            return true;
        }
      }
    }
    return false;
  }
  return expectedProperty in schema;
};
var TransformSymbol = Symbol.for("TypeBox.Transform");
var hasTransform = (schema) => {
  if (!schema)
    return;
  if (schema.type === "object" && schema.properties) {
    const properties = schema.properties;
    for (const key of Object.keys(properties)) {
      const property = properties[key];
      if (property.type === "object") {
        if (hasTransform(property))
          return true;
      } else if (property.anyOf) {
        for (let i = 0; i < property.anyOf.length; i++)
          if (hasTransform(property.anyOf[i]))
            return true;
      }
      const hasTransformSymbol = TransformSymbol in property;
      if (hasTransformSymbol)
        return true;
    }
    return false;
  }
  return TransformSymbol in schema || schema.properties && TransformSymbol in schema.properties;
};
var getUnionedType = (validator) => {
  if (!validator)
    return;
  const schema = validator?.schema;
  if (schema && "anyOf" in schema) {
    let foundDifference = false;
    const type = schema.anyOf[0].type;
    for (const validator2 of schema.anyOf) {
      if (validator2.type !== type) {
        foundDifference = true;
        break;
      }
    }
    if (!foundDifference)
      return type;
  }
  return validator.schema?.type;
};
var matchFnReturn = /(?:return|=>) \S+\(/g;
var isAsync = (fn) => {
  if (fn.constructor.name === "AsyncFunction")
    return true;
  const literal = fn.toString();
  if (literal.includes("=> response.clone("))
    return false;
  return !!literal.match(matchFnReturn);
};
var getDestructureQuery = (fn) => {
  if (!fn.includes("query: {") || fn.includes("query,") || fn.includes("query }"))
    return false;
  const start = fn.indexOf("query: {");
  fn = fn.slice(start + 9);
  fn = fn.slice(0, fn.indexOf("}"));
  return fn.split(",").map((x) => {
    const indexOf = x.indexOf(":");
    if (indexOf === -1)
      return x.trim();
    return x.slice(0, indexOf).trim();
  });
};
var composeHandler = ({
  path,
  method,
  hooks,
  validator,
  handler,
  handleError,
  definitions,
  schema,
  onRequest,
  config,
  getReporter,
  setHeader
}) => {
  const hasErrorHandler = config.forceErrorEncapsulation || hooks.error.length > 0 || typeof Bun === "undefined" || hooks.onResponse.length > 0 || !!hooks.trace.length;
  const isHandleFn = typeof handler === "function";
  const handle = isHandleFn ? `handler(c)` : `handler`;
  const handleResponse = hooks.onResponse.length ? `
;(async () => {${hooks.onResponse.map((_, i) => `await res${i}(c)`).join(";")}})();
` : "";
  const traceLiteral = hooks.trace.map((x) => x.toString());
  let hasUnknownContext = false;
  if (isHandleFn && isContextPassToFunction(handler.toString()))
    hasUnknownContext = true;
  if (!hasUnknownContext)
    for (const [key, value] of Object.entries(hooks)) {
      if (!Array.isArray(value) || !value.length || ![
        "parse",
        "transform",
        "beforeHandle",
        "afterHandle",
        "onResponse"
      ].includes(key))
        continue;
      for (const handle2 of value) {
        if (typeof handle2 !== "function")
          continue;
        if (isContextPassToFunction(handle2.toString())) {
          hasUnknownContext = true;
          break;
        }
      }
      if (hasUnknownContext)
        break;
    }
  const traceConditions = {
    parse: traceLiteral.some((x) => isFnUse("parse", x)),
    transform: traceLiteral.some((x) => isFnUse("transform", x)),
    handle: traceLiteral.some((x) => isFnUse("handle", x)),
    beforeHandle: traceLiteral.some((x) => isFnUse("beforeHandle", x)),
    afterHandle: traceLiteral.some((x) => isFnUse("afterHandle", x)),
    error: hasErrorHandler || traceLiteral.some((x) => isFnUse("error", x))
  };
  const hasTrace = hooks.trace.length > 0;
  let fnLiteral = "";
  const lifeCycleLiteral = validator || method !== "GET" && method !== "HEAD" ? [
    handler,
    ...hooks.transform,
    ...hooks.beforeHandle,
    ...hooks.afterHandle,
    ...hooks.mapResponse
  ].map((x) => typeof x === "function" ? x.toString() : `${x}`) : [];
  const hasBody = method !== "GET" && method !== "HEAD" && (hasUnknownContext || hooks.type !== "none" && (!!validator.body || !!hooks.type || lifeCycleLiteral.some((fn) => isFnUse("body", fn))));
  const hasHeaders = hasUnknownContext || validator.headers || lifeCycleLiteral.some((fn) => isFnUse("headers", fn)) || setHeader && Object.keys(setHeader).length;
  const hasCookie = hasUnknownContext || !!validator.cookie || lifeCycleLiteral.some((fn) => isFnUse("cookie", fn));
  const cookieMeta = validator?.cookie?.schema;
  let encodeCookie = "";
  if (cookieMeta?.sign) {
    if (!cookieMeta.secrets)
      throw new Error(
        `t.Cookie required secret which is not set in (${method}) ${path}.`
      );
    const secret = !cookieMeta.secrets ? void 0 : typeof cookieMeta.secrets === "string" ? cookieMeta.secrets : cookieMeta.secrets[0];
    encodeCookie += `const _setCookie = c.set.cookie
		if(_setCookie) {`;
    if (cookieMeta.sign === true) {
      encodeCookie += `for(const [key, cookie] of Object.entries(_setCookie)) {
				c.set.cookie[key].value = await signCookie(cookie.value, '${secret}')
			}`;
    } else
      for (const name of cookieMeta.sign) {
        encodeCookie += `if(_setCookie['${name}']?.value) { c.set.cookie['${name}'].value = await signCookie(_setCookie['${name}'].value, '${secret}') }
`;
      }
    encodeCookie += "}\n";
  }
  const { composeValidation, composeResponseValidation } = composeValidationFactory(hasErrorHandler);
  if (hasHeaders) {
    fnLiteral += headersHasToJSON ? `c.headers = c.request.headers.toJSON()
` : `c.headers = {}
                for (const [key, value] of c.request.headers.entries())
					c.headers[key] = value
				`;
  }
  if (hasCookie) {
    const get = (name, defaultValue) => {
      const value = cookieMeta?.[name] ?? defaultValue;
      if (!value)
        return typeof defaultValue === "string" ? `${name}: "${defaultValue}",` : `${name}: ${defaultValue},`;
      if (typeof value === "string")
        return `${name}: '${value}',`;
      if (value instanceof Date)
        return `${name}: new Date(${value.getTime()}),`;
      return `${name}: ${value},`;
    };
    const options = cookieMeta ? `{
			secret: ${cookieMeta.secrets !== void 0 ? typeof cookieMeta.secrets === "string" ? `'${cookieMeta.secrets}'` : "[" + cookieMeta.secrets.reduce(
      (a, b) => a + `'${b}',`,
      ""
    ) + "]" : "undefined"},
			sign: ${cookieMeta.sign === true ? true : cookieMeta.sign !== void 0 ? "[" + cookieMeta.sign.reduce((a, b) => a + `'${b}',`, "") + "]" : "undefined"},
			${get("domain")}
			${get("expires")}
			${get("httpOnly")}
			${get("maxAge")}
			${get("path", "/")}
			${get("priority")}
			${get("sameSite")}
			${get("secure")}
		}` : "undefined";
    if (hasHeaders)
      fnLiteral += `
c.cookie = await parseCookie(c.set, c.headers.cookie, ${options})
`;
    else
      fnLiteral += `
c.cookie = await parseCookie(c.set, c.request.headers.get('cookie'), ${options})
`;
  }
  const hasQuery = hasUnknownContext || validator.query || lifeCycleLiteral.some((fn) => isFnUse("query", fn));
  if (hasQuery) {
    let destructured = [];
    let referenceFullQuery = false;
    if (validator.query && validator.query.schema.type === "object") {
      destructured = Object.keys(validator.query.schema.properties);
    } else
      for (const event of lifeCycleLiteral) {
        const queries = getDestructureQuery(event);
        if (!queries) {
          referenceFullQuery = true;
          continue;
        }
        for (const query of queries)
          if (destructured.indexOf(query) === -1)
            destructured.push(query);
      }
    if (!referenceFullQuery && destructured.length) {
      fnLiteral += `
			let requestUrl = c.request.url.slice(c.qi + 1)
			if(requestUrl.includes('+')) requestUrl = requestUrl.replaceAll('+', ' ')

			if(c.qi !== -1) {	
				const url = decodeURIComponent(requestUrl)
				let memory = 0

				${destructured.map(
        (name, index) => `
						memory = url.indexOf('${name}=')

						const a${index} = memory === -1 ? undefined : url.slice(memory = memory + ${name.length + 1}, (memory = url.indexOf('&', memory)) === -1 ? undefined : memory)`
      ).join("\n")}

				c.query = {
					${destructured.map((name, index) => `${name}: a${index}`).join(", ")}
				}
			} else {
				c.query = {}
			}`;
    } else {
      fnLiteral += `c.query = c.qi !== -1 ? parseQuery(decodeURIComponent(c.request.url.slice(c.qi + 1))) : {}`;
    }
  }
  const traceLiterals = hooks.trace.map((x) => x.toString());
  const hasTraceSet = traceLiterals.some(
    (fn) => isFnUse("set", fn) || isContextPassToFunction(fn)
  );
  hasUnknownContext || hooks.trace.some((fn) => isFnUse("set", fn.toString()));
  const hasSet = setHeader && Object.keys(setHeader).length || hasTraceSet || hasCookie || lifeCycleLiteral.some((fn) => isFnUse("set", fn)) || onRequest.some((fn) => isFnUse("set", fn.toString()));
  if (hasTrace)
    fnLiteral += "\nconst id = c.$$requestId\n";
  const report = createReport({
    hasTrace,
    hasTraceSet,
    condition: traceConditions,
    addFn: (word) => {
      fnLiteral += word;
    }
  });
  fnLiteral += hasErrorHandler ? "\n try {\n" : "";
  if (hasTraceSet) {
    fnLiteral += `
const traceDone = Promise.all([`;
    for (let i = 0; i < hooks.trace.length; i++) {
      fnLiteral += `new Promise(r => { reporter.once(\`res\${id}.${i}\`, r) }),`;
    }
    fnLiteral += `])
`;
  }
  const isAsyncHandler = typeof handler === "function" && isAsync(handler);
  const maybeAsync = hasCookie || hasBody || hasTraceSet || isAsyncHandler || !!hooks.mapResponse.length || hooks.parse.length > 0 || hooks.afterHandle.some(isAsync) || hooks.beforeHandle.some(isAsync) || hooks.transform.some(isAsync);
  const endParse = report("parse", {
    unit: hooks.parse.length
  });
  if (hasBody) {
    const type = getUnionedType(validator?.body);
    if (hooks.type && !Array.isArray(hooks.type)) {
      if (hooks.type) {
        switch (hooks.type) {
          case "json":
          case "application/json":
            fnLiteral += `c.body = await c.request.json()
`;
            break;
          case "text":
          case "text/plain":
            fnLiteral += `c.body = await c.request.text()
`;
            break;
          case "urlencoded":
          case "application/x-www-form-urlencoded":
            fnLiteral += `c.body = parseQuery(await c.request.text())
`;
            break;
          case "arrayBuffer":
          case "application/octet-stream":
            fnLiteral += `c.body = await c.request.arrayBuffer()
`;
            break;
          case "formdata":
          case "multipart/form-data":
            fnLiteral += `c.body = {}

						const form = await c.request.formData()
						for (const key of form.keys()) {
							if (c.body[key])
								continue

							const value = form.getAll(key)
							if (value.length === 1)
								c.body[key] = value[0]
							else c.body[key] = value
						}
`;
            break;
        }
      }
      if (hooks.parse.length)
        fnLiteral += "}}";
    } else {
      const getAotParser = () => {
        if (hooks.parse.length && type && !Array.isArray(hooks.type)) {
          const schema2 = validator?.body?.schema;
          switch (type) {
            case "object":
              if (hasType("File", schema2) || hasType("Files", schema2))
                return `c.body = {}

								const form = await c.request.formData()
								for (const key of form.keys()) {
									if (c.body[key])
										continue

									const value = form.getAll(key)
									if (value.length === 1)
										c.body[key] = value[0]
									else c.body[key] = value
								}`;
              break;
            default:
              break;
          }
        }
      };
      const aotParse = getAotParser();
      if (aotParse)
        fnLiteral += aotParse;
      else {
        fnLiteral += "\n";
        fnLiteral += hasHeaders ? `let contentType = c.headers['content-type']` : `let contentType = c.request.headers.get('content-type')`;
        fnLiteral += `
				if (contentType) {
					const index = contentType.indexOf(';')
					if (index !== -1) contentType = contentType.substring(0, index)
`;
        if (hooks.parse.length) {
          fnLiteral += `let used = false
`;
          const endReport = report("parse", {
            unit: hooks.parse.length
          });
          for (let i = 0; i < hooks.parse.length; i++) {
            const endUnit = report("parse.unit", {
              name: hooks.parse[i].name
            });
            const name = `bo${i}`;
            if (i !== 0)
              fnLiteral += `if(!used) {
`;
            fnLiteral += `let ${name} = parse[${i}](c, contentType)
`;
            fnLiteral += `if(${name} instanceof Promise) ${name} = await ${name}
`;
            fnLiteral += `if(${name} !== undefined) { c.body = ${name}; used = true }
`;
            endUnit();
            if (i !== 0)
              fnLiteral += `}`;
          }
          endReport();
        }
        if (hooks.parse.length)
          fnLiteral += `if (!used)`;
        fnLiteral += `
				switch (contentType) {
					case 'application/json':
						c.body = await c.request.json()
						break

					case 'text/plain':
						c.body = await c.request.text()
						break

					case 'application/x-www-form-urlencoded':
						c.body = parseQuery(await c.request.text())
						break

					case 'application/octet-stream':
						c.body = await c.request.arrayBuffer();
						break

					case 'multipart/form-data':
						c.body = {}

						const form = await c.request.formData()
						for (const key of form.keys()) {
							if (c.body[key])
								continue

							const value = form.getAll(key)
							if (value.length === 1)
								c.body[key] = value[0]
							else c.body[key] = value
						}

						break
					}
`;
        fnLiteral += "}\n";
      }
    }
    fnLiteral += "\n";
  }
  endParse();
  if (hooks?.transform) {
    const endTransform = report("transform", {
      unit: hooks.transform.length
    });
    for (let i = 0; i < hooks.transform.length; i++) {
      const transform = hooks.transform[i];
      const endUnit = report("transform.unit", {
        name: transform.name
      });
      if (transform.$elysia === "derive")
        fnLiteral += isAsync(transform) ? `Object.assign(c, await transform[${i}](c));` : `Object.assign(c, transform[${i}](c));`;
      else
        fnLiteral += isAsync(transform) ? `await transform[${i}](c);` : `transform[${i}](c);`;
      endUnit();
    }
    endTransform();
  }
  if (validator) {
    fnLiteral += "\n";
    if (validator.headers) {
      if (hasProperty("default", validator.headers.params))
        for (const [key, value] of Object.entries(
          Value3.Default(
            // @ts-ignore
            validator.headers.schema,
            {}
          )
        )) {
          const parsed = typeof value === "object" ? JSON.stringify(value) : `'${value}'`;
          if (parsed)
            fnLiteral += `c.headers['${key}'] ??= ${parsed}
`;
        }
      fnLiteral += `if(headers.Check(c.headers) === false) {
				${composeValidation("headers")}
			}`;
      if (hasTransform(validator.headers.schema))
        fnLiteral += `
c.headers = headers.Decode(c.headers)
`;
    }
    if (validator.params) {
      if (hasProperty("default", validator.params.schema))
        for (const [key, value] of Object.entries(
          Value3.Default(
            // @ts-ignore
            validator.params.schema,
            {}
          )
        )) {
          const parsed = typeof value === "object" ? JSON.stringify(value) : `'${value}'`;
          if (parsed)
            fnLiteral += `c.params['${key}'] ??= ${parsed}
`;
        }
      fnLiteral += `if(params.Check(c.params) === false) {
				${composeValidation("params")}
			}`;
      if (hasTransform(validator.params.schema))
        fnLiteral += `
c.params = params.Decode(c.params)
`;
    }
    if (validator.query) {
      if (hasProperty("default", validator.query.schema))
        for (const [key, value] of Object.entries(
          Value3.Default(
            // @ts-ignore
            validator.query.schema,
            {}
          )
        )) {
          const parsed = typeof value === "object" ? JSON.stringify(value) : `'${value}'`;
          if (parsed)
            fnLiteral += `c.query['${key}'] ??= ${parsed}
`;
        }
      fnLiteral += `if(query.Check(c.query) === false) {
				${composeValidation("query")}
			}`;
      if (hasTransform(validator.query.schema))
        fnLiteral += `
c.query = query.Decode(Object.assign({}, c.query))
`;
    }
    if (validator.body) {
      if (hasProperty("default", validator.body.schema))
        fnLiteral += `if(body.Check(c.body) === false) {
    				c.body = Object.assign(${JSON.stringify(
          Value3.Default(
            // @ts-ignore
            validator.body.schema,
            null
          ) ?? {}
        )}, c.body)

    				if(body.Check(c.query) === false) {
        				${composeValidation("body")}
     			}
            }`;
      else
        fnLiteral += `if(body.Check(c.body) === false) {
			${composeValidation("body")}
		}`;
      if (hasTransform(validator.body.schema))
        fnLiteral += `
c.body = body.Decode(c.body)
`;
    }
    if (isNotEmpty(validator.cookie?.schema.properties ?? {})) {
      fnLiteral += `const cookieValue = {}
    			for(const [key, value] of Object.entries(c.cookie))
    				cookieValue[key] = value.value
`;
      if (hasProperty("default", validator.cookie.schema))
        for (const [key, value] of Object.entries(
          Value3.Default(
            // @ts-ignore
            validator.cookie.schema,
            {}
          )
        )) {
          fnLiteral += `cookieValue['${key}'] = ${typeof value === "object" ? JSON.stringify(value) : value}
`;
        }
      fnLiteral += `if(cookie.Check(cookieValue) === false) {
				${composeValidation("cookie", "cookieValue")}
			}`;
      if (hasTransform(validator.cookie.schema))
        fnLiteral += `
c.cookie = params.Decode(c.cookie)
`;
    }
  }
  if (hooks?.beforeHandle) {
    const endBeforeHandle = report("beforeHandle", {
      unit: hooks.beforeHandle.length
    });
    for (let i = 0; i < hooks.beforeHandle.length; i++) {
      const beforeHandle = hooks.beforeHandle[i];
      const endUnit = report("beforeHandle.unit", {
        name: beforeHandle.name
      });
      const returning = hasReturn(beforeHandle.toString());
      if (beforeHandle.$elysia === "resolve") {
        fnLiteral += isAsync(beforeHandle) ? `Object.assign(c, await beforeHandle[${i}](c));` : `Object.assign(c, beforeHandle[${i}](c));`;
      } else if (!returning) {
        fnLiteral += isAsync(beforeHandle) ? `await beforeHandle[${i}](c);
` : `beforeHandle[${i}](c);
`;
        endUnit();
      } else {
        fnLiteral += isAsync(beforeHandle) ? `be = await beforeHandle[${i}](c);
` : `be = beforeHandle[${i}](c);
`;
        endUnit();
        fnLiteral += `if(be !== undefined) {
`;
        const endAfterHandle = report("afterHandle", {
          unit: hooks.transform.length
        });
        if (hooks.afterHandle) {
          report("handle", {
            name: isHandleFn ? handler.name : void 0
          })();
          for (let i2 = 0; i2 < hooks.afterHandle.length; i2++) {
            const returning2 = hasReturn(
              hooks.afterHandle[i2].toString()
            );
            const endUnit2 = report("afterHandle.unit", {
              name: hooks.afterHandle[i2].name
            });
            fnLiteral += `c.response = be
`;
            if (!returning2) {
              fnLiteral += isAsync(hooks.afterHandle[i2]) ? `await afterHandle[${i2}](c, be)
` : `afterHandle[${i2}](c, be)
`;
            } else {
              fnLiteral += isAsync(hooks.afterHandle[i2]) ? `af = await afterHandle[${i2}](c)
` : `af = afterHandle[${i2}](c)
`;
              fnLiteral += `if(af !== undefined) { c.response = be = af }
`;
            }
            endUnit2();
          }
        }
        endAfterHandle();
        if (validator.response)
          fnLiteral += composeResponseValidation("be");
        if (hooks.mapResponse.length) {
          fnLiteral += `c.response = be`;
          for (let i2 = 0; i2 < hooks.mapResponse.length; i2++) {
            fnLiteral += `
if(mr === undefined) {
							mr = onMapResponse[${i2}](c)
							if(mr instanceof Promise) mr = await mr
							if(mr !== undefined) c.response = mr
						}
`;
          }
        }
        fnLiteral += encodeCookie;
        fnLiteral += `return mapEarlyResponse(be, c.set)}
`;
      }
    }
    endBeforeHandle();
  }
  if (hooks?.afterHandle.length) {
    const endHandle = report("handle", {
      name: isHandleFn ? handler.name : void 0
    });
    if (hooks.afterHandle.length)
      fnLiteral += isAsyncHandler ? `let r = c.response = await ${handle};
` : `let r = c.response = ${handle};
`;
    else
      fnLiteral += isAsyncHandler ? `let r = await ${handle};
` : `let r = ${handle};
`;
    endHandle();
    const endAfterHandle = report("afterHandle", {
      unit: hooks.afterHandle.length
    });
    for (let i = 0; i < hooks.afterHandle.length; i++) {
      const returning = hasReturn(hooks.afterHandle[i].toString());
      const endUnit = report("afterHandle.unit", {
        name: hooks.afterHandle[i].name
      });
      if (!returning) {
        fnLiteral += isAsync(hooks.afterHandle[i]) ? `await afterHandle[${i}](c)
` : `afterHandle[${i}](c)
`;
        endUnit();
      } else {
        fnLiteral += isAsync(hooks.afterHandle[i]) ? `af = await afterHandle[${i}](c)
` : `af = afterHandle[${i}](c)
`;
        endUnit();
        if (validator.response) {
          fnLiteral += `if(af !== undefined) {`;
          endAfterHandle();
          fnLiteral += composeResponseValidation("af");
          fnLiteral += `c.response = af }`;
        } else {
          fnLiteral += `if(af !== undefined) {`;
          endAfterHandle();
          fnLiteral += `c.response = af}
`;
        }
      }
    }
    endAfterHandle();
    fnLiteral += `r = c.response
`;
    if (validator.response)
      fnLiteral += composeResponseValidation();
    fnLiteral += encodeCookie;
    if (hooks.mapResponse.length) {
      for (let i = 0; i < hooks.mapResponse.length; i++) {
        fnLiteral += `
mr = onMapResponse[${i}](c)
				if(mr instanceof Promise) mr = await mr
				if(mr !== undefined) c.response = mr
`;
      }
    }
    if (hasSet)
      fnLiteral += `return mapResponse(r, c.set)
`;
    else
      fnLiteral += `return mapCompactResponse(r)
`;
  } else {
    const endHandle = report("handle", {
      name: isHandleFn ? handler.name : void 0
    });
    if (validator.response || hooks.mapResponse.length) {
      fnLiteral += isAsyncHandler ? `let r = await ${handle};
` : `let r = ${handle};
`;
      endHandle();
      if (validator.response)
        fnLiteral += composeResponseValidation();
      report("afterHandle")();
      if (hooks.mapResponse.length) {
        fnLiteral += "c.response = r";
        for (let i = 0; i < hooks.mapResponse.length; i++) {
          fnLiteral += `
if(mr === undefined) { 
						mr = onMapResponse[${i}](c)
						if(mr instanceof Promise) mr = await mr
    					if(mr !== undefined) r = c.response = mr
					}
`;
        }
      }
      fnLiteral += encodeCookie;
      if (handler instanceof Response)
        fnLiteral += `return ${handle}.clone()
`;
      else if (hasSet)
        fnLiteral += `return mapResponse(r, c.set)
`;
      else
        fnLiteral += `return mapCompactResponse(r)
`;
    } else {
      if (traceConditions.handle || hasCookie) {
        fnLiteral += isAsyncHandler ? `let r = await ${handle};
` : `let r = ${handle};
`;
        endHandle();
        report("afterHandle")();
        if (hooks.mapResponse.length) {
          fnLiteral += "c.response = r";
          for (let i = 0; i < hooks.mapResponse.length; i++) {
            fnLiteral += `
if(mr === undefined) {
							mr = onMapResponse[${i}](c)
							if(mr instanceof Promise) mr = await mr
    						if(mr !== undefined) r = c.response = mr
						}
`;
          }
        }
        fnLiteral += encodeCookie;
        if (hasSet)
          fnLiteral += `return mapResponse(r, c.set)
`;
        else
          fnLiteral += `return mapCompactResponse(r)
`;
      } else {
        endHandle();
        const handled = isAsyncHandler ? `await ${handle}` : handle;
        report("afterHandle")();
        if (handler instanceof Response)
          fnLiteral += `return ${handle}.clone()
`;
        else if (hasSet)
          fnLiteral += `return mapResponse(${handled}, c.set)
`;
        else
          fnLiteral += `return mapCompactResponse(${handled})
`;
      }
    }
  }
  if (hasErrorHandler || handleResponse) {
    fnLiteral += `
} catch(error) {`;
    if (!maybeAsync)
      fnLiteral += `return (async () => {`;
    fnLiteral += `const set = c.set

		if (!set.status || set.status < 300) set.status = error?.status || 500
	`;
    const endError = report("error", {
      unit: hooks.error.length
    });
    if (hooks.error.length) {
      fnLiteral += `
				c.error = error
				c.code = error.code ?? error[ERROR_CODE] ?? "UNKNOWN"
			`;
      for (let i = 0; i < hooks.error.length; i++) {
        const name = `er${i}`;
        const endUnit = report("error.unit", {
          name: hooks.error[i].name
        });
        fnLiteral += `
let ${name} = handleErrors[${i}](c)
`;
        if (isAsync(hooks.error[i]))
          fnLiteral += `if (${name} instanceof Promise) ${name} = await ${name}
`;
        endUnit();
        fnLiteral += `${name} = mapEarlyResponse(${name}, set)
`;
        fnLiteral += `if (${name}) {`;
        fnLiteral += `return ${name} }
`;
      }
    }
    endError();
    fnLiteral += `return handleError(c, error)

`;
    if (!maybeAsync)
      fnLiteral += "})()";
    fnLiteral += "}";
    if (handleResponse || hasTrace) {
      fnLiteral += ` finally { `;
      const endResponse = report("response", {
        unit: hooks.onResponse.length
      });
      fnLiteral += handleResponse;
      endResponse();
      fnLiteral += `}`;
    }
  }
  fnLiteral = `const {
		handler,
		handleError,
		hooks: {
			transform,
			resolve,
			beforeHandle,
			afterHandle,
			mapResponse: onMapResponse,
			parse,
			error: handleErrors,
			onResponse
		},
		validator: {
			body,
			headers,
			params,
			query,
			response,
			cookie
		},
		utils: {
			mapResponse,
			mapCompactResponse,
			mapEarlyResponse,
			parseQuery
		},
		error: {
			NotFoundError,
			ValidationError,
			InternalServerError
		},
		schema,
		definitions,
		ERROR_CODE,
		getReporter,
		requestId,
		parseCookie,
		signCookie,
		decodeURIComponent
	} = hooks

	${hooks.onResponse.length ? `const ${hooks.onResponse.map((x, i) => `res${i} = onResponse[${i}]`).join(",")}` : ""}

	return ${maybeAsync ? "async" : ""} function handle(c) {
		${hooks.beforeHandle.length ? "let be" : ""}
		${hooks.afterHandle.length ? "let af" : ""}
		${hooks.mapResponse.length ? "let mr" : ""}

		${schema && definitions ? "c.schema = schema; c.defs = definitions;" : ""}
		${fnLiteral}
	}`;
  const createHandler = Function("hooks", fnLiteral);
  return createHandler({
    handler,
    hooks,
    validator,
    handleError,
    utils: {
      mapResponse,
      mapCompactResponse,
      mapEarlyResponse,
      parseQuery
    },
    error: {
      NotFoundError,
      ValidationError,
      InternalServerError
    },
    schema,
    definitions,
    ERROR_CODE,
    getReporter,
    requestId,
    parseCookie,
    signCookie,
    decodeURIComponent
  });
};
var composeGeneralHandler = (app) => {
  let decoratorsLiteral = "";
  let fnLiteral = "";
  for (const key of Object.keys(app.decorators))
    decoratorsLiteral += `,${key}: app.decorators.${key}`;
  const { router, staticRouter } = app;
  const hasTrace = app.event.trace.length > 0;
  const findDynamicRoute = `
	const route = router.find(request.method, path) ${router.root.ALL ? '?? router.find("ALL", path)' : ""}
	if (route === null)
		return ${app.event.error.length ? `app.handleError(ctx, notFound)` : app.event.request.length ? `new Response(error404Message, {
					status: ctx.set.status === 200 ? 404 : ctx.set.status,
					headers: ctx.set.headers
				})` : `error404.clone()`}

	ctx.params = route.params

	return route.store(ctx)`;
  let switchMap = ``;
  for (const [path, { code, all }] of Object.entries(staticRouter.map))
    switchMap += `case '${path}':
switch(request.method) {
${code}
${all ?? `default: break map`}}

`;
  const maybeAsync = app.event.request.some(isAsync);
  fnLiteral += `const {
		app,
		app: { store, router, staticRouter, wsRouter },
		mapEarlyResponse,
		NotFoundError,
		requestId,
		getReporter,
		handleError
	} = data

	const notFound = new NotFoundError()

	${app.event.request.length ? `const onRequest = app.event.request` : ""}
	${staticRouter.variables}
	${app.event.error.length ? "" : `
	const error404Message = notFound.message.toString()
	const error404 = new Response(error404Message, { status: 404 });
	`}

	return ${maybeAsync ? "async" : ""} function map(request) {
`;
  if (app.event.request.length)
    fnLiteral += `let re`;
  const traceLiteral = app.event.trace.map((x) => x.toString());
  const report = createReport({
    hasTrace,
    hasTraceSet: app.event.trace.some((fn) => {
      const literal = fn.toString();
      return isFnUse("set", literal) || isContextPassToFunction(literal);
    }),
    condition: {
      request: traceLiteral.some(
        (x) => isFnUse("request", x) || isContextPassToFunction(x)
      )
    },
    addFn: (word) => {
      fnLiteral += word;
    }
  });
  if (app.event.request.length) {
    fnLiteral += `
			${hasTrace ? "const id = +requestId.value++" : ""}

			const ctx = {
				request,
				store,
				set: {
					headers: ${// @ts-ignore
    Object.keys(app.setHeaders ?? {}).length ? "Object.assign({}, app.setHeaders)" : "{}"},
					status: 200
				}
				${hasTrace ? ",$$requestId: +id" : ""}
				${decoratorsLiteral}
			}
		`;
    const endReport = report("request", {
      attribute: "ctx",
      unit: app.event.request.length
    });
    fnLiteral += `
 try {
`;
    for (let i = 0; i < app.event.request.length; i++) {
      const fn = app.event.request[i];
      const withReturn = hasReturn(fn.toString());
      const maybeAsync2 = isAsync(fn);
      const endUnit = report("request.unit", {
        name: app.event.request[i].name
      });
      if (withReturn) {
        fnLiteral += `re = mapEarlyResponse(
					${maybeAsync2 ? "await" : ""} onRequest[${i}](ctx),
					ctx.set
				)
`;
        endUnit();
        if (withReturn)
          fnLiteral += `if(re !== undefined) return re
`;
      } else {
        fnLiteral += `${maybeAsync2 ? "await" : ""} onRequest[${i}](ctx)
`;
        endUnit();
      }
    }
    fnLiteral += `} catch (error) {
			return app.handleError(ctx, error)
		}`;
    endReport();
    fnLiteral += `
		const url = request.url
		const s = url.indexOf('/', 11)
		const qi = ctx.qi = url.indexOf('?', s + 1)
		const path = ctx.path = url.substring(s, qi === -1 ? undefined : qi)`;
  } else {
    fnLiteral += `
		const url = request.url
		const s = url.indexOf('/', 11)
		const qi = url.indexOf('?', s + 1)
		const path = url.substring(s, qi === -1 ? undefined : qi)
		${hasTrace ? "const id = +requestId.value++" : ""}
		const ctx = {
			request,
			store,
			qi,
			path,
			set: {
				headers: ${// @ts-ignore
    Object.keys(app.setHeaders ?? {}).length ? "Object.assign({}, app.setHeaders)" : "{}"},
				status: 200
			}
			${hasTrace ? ",$$requestId: id" : ""}
			${decoratorsLiteral}
		}`;
    report("request", {
      unit: app.event.request.length,
      attribute: traceLiteral.some((x) => isFnUse("context", x)) || traceLiteral.some((x) => isFnUse("store", x)) || traceLiteral.some((x) => isFnUse("set", x)) ? "ctx" : ""
    })();
  }
  const wsPaths = app.wsPaths;
  const wsRouter = app.wsRouter;
  if (Object.keys(wsPaths).length || wsRouter.history.length) {
    fnLiteral += `
			if(request.method === 'GET') {
				switch(path) {`;
    for (const [path, index] of Object.entries(wsPaths)) {
      fnLiteral += `
					case '${path}':
						if(request.headers.get('upgrade') === 'websocket')
							return st${index}(ctx)

						break`;
    }
    fnLiteral += `
				default:
					if(request.headers.get('upgrade') === 'websocket') {
						const route = wsRouter.find('ws', path)

						if(route) {
							ctx.params = route.params

							return route.store(ctx)
						}
					}

					break
			}
		}
`;
  }
  fnLiteral += `
		map: switch(path) {
			${switchMap}

			default:
				break
		}

		${findDynamicRoute}
	}`;
  const handleError = composeErrorHandler(app);
  app.handleError = handleError;
  return Function(
    "data",
    fnLiteral
  )({
    app,
    mapEarlyResponse,
    NotFoundError,
    // @ts-ignore
    getReporter: () => app.reporter,
    requestId,
    handleError
  });
};
var composeErrorHandler = (app) => {
  let fnLiteral = `const {
		app: { event: { error: onError, onResponse: res } },
		mapResponse,
		ERROR_CODE,
		ELYSIA_RESPONSE
	} = inject

	return ${app.event.error.find(isAsync) ? "async" : ""} function(context, error) {
		let r

		const { set } = context

		context.code = error.code
		context.error = error

		if(error[ELYSIA_RESPONSE]) {
			error.status = error[ELYSIA_RESPONSE]
			error.message = error.response
		}
`;
  for (let i = 0; i < app.event.error.length; i++) {
    const handler = app.event.error[i];
    const response = `${isAsync(handler) ? "await " : ""}onError[${i}](context)`;
    if (hasReturn(handler.toString()))
      fnLiteral += `r = ${response}; if(r !== undefined) {
				if(r instanceof Response) return r

				if(r[ELYSIA_RESPONSE]) {
					error.status = error[ELYSIA_RESPONSE]
					error.message = error.response
				}
		
				if(set.status === 200) set.status = error.status
				return mapResponse(r, set)
			}
`;
    else
      fnLiteral += response + "\n";
  }
  fnLiteral += `if(error.constructor.name === "ValidationError" || error.constructor.name === "TransformDecodeError") {
		set.status = error.status ?? 400
		return new Response(
			error.message,
			{ headers: set.headers, status: set.status }
		)
	} else {
		if(error.code && typeof error.status === "number")
			return new Response(
				error.message,
				{ headers: set.headers, status: error.status }
			)

		return mapResponse(error, set)
	}
}`;
  return Function(
    "inject",
    fnLiteral
  )({
    app,
    mapResponse,
    ERROR_CODE,
    ELYSIA_RESPONSE
  });
};

// src/dynamic-handle.ts
import { parse as parseQuery2 } from "fast-querystring";
var createDynamicHandler = (app) => async (request) => {
  const set = {
    cookie: {},
    status: 200,
    headers: {}
  };
  let context;
  if (app.decorators) {
    context = app.decorators;
    context.request = request;
    context.set = set;
    context.store = app.store;
  } else {
    context = {
      set,
      store: app.store,
      request
    };
  }
  const url = request.url, s = url.indexOf("/", 11), q = url.indexOf("?", s + 1), path = q === -1 ? url.substring(s) : url.substring(s, q);
  try {
    for (let i = 0; i < app.event.request.length; i++) {
      const onRequest = app.event.request[i];
      let response2 = onRequest(context);
      if (response2 instanceof Promise)
        response2 = await response2;
      response2 = mapEarlyResponse(response2, set);
      if (response2)
        return response2;
    }
    const handler = (
      // @ts-ignore
      app.dynamicRouter.find(request.method, path) ?? // @ts-ignore
      app.dynamicRouter.find("ALL", path)
    );
    if (!handler)
      throw new NotFoundError();
    const { handle, hooks, validator, content } = handler.store;
    let body;
    if (request.method !== "GET" && request.method !== "HEAD") {
      if (content) {
        switch (content) {
          case "application/json":
            body = await request.json();
            break;
          case "text/plain":
            body = await request.text();
            break;
          case "application/x-www-form-urlencoded":
            body = parseQuery2(await request.text());
            break;
          case "application/octet-stream":
            body = await request.arrayBuffer();
            break;
          case "multipart/form-data":
            body = {};
            const form = await request.formData();
            for (const key of form.keys()) {
              if (body[key])
                continue;
              const value = form.getAll(key);
              if (value.length === 1)
                body[key] = value[0];
              else
                body[key] = value;
            }
            break;
        }
      } else {
        let contentType = request.headers.get("content-type");
        if (contentType) {
          const index = contentType.indexOf(";");
          if (index !== -1)
            contentType = contentType.slice(0, index);
          for (let i = 0; i < hooks.parse.length; i++) {
            let temp = hooks.parse[i](context, contentType);
            if (temp instanceof Promise)
              temp = await temp;
            if (temp) {
              body = temp;
              break;
            }
          }
          if (body === void 0) {
            switch (contentType) {
              case "application/json":
                body = await request.json();
                break;
              case "text/plain":
                body = await request.text();
                break;
              case "application/x-www-form-urlencoded":
                body = parseQuery2(await request.text());
                break;
              case "application/octet-stream":
                body = await request.arrayBuffer();
                break;
              case "multipart/form-data":
                body = {};
                const form = await request.formData();
                for (const key of form.keys()) {
                  if (body[key])
                    continue;
                  const value = form.getAll(key);
                  if (value.length === 1)
                    body[key] = value[0];
                  else
                    body[key] = value;
                }
                break;
            }
          }
        }
      }
    }
    context.body = body;
    context.params = handler?.params || void 0;
    context.query = q === -1 ? {} : parseQuery2(url.substring(q + 1));
    context.headers = {};
    for (const [key, value] of request.headers.entries())
      context.headers[key] = value;
    const cookieMeta = validator?.cookie?.schema;
    context.cookie = await parseCookie(
      context.set,
      context.headers.cookie,
      cookieMeta ? {
        secret: cookieMeta.secrets !== void 0 ? typeof cookieMeta.secrets === "string" ? cookieMeta.secrets : cookieMeta.secrets.join(",") : void 0,
        sign: cookieMeta.sign === true ? true : cookieMeta.sign !== void 0 ? typeof cookieMeta.sign === "string" ? cookieMeta.sign : cookieMeta.sign.join(",") : void 0
      } : void 0
    );
    for (let i = 0; i < hooks.transform.length; i++) {
      const operation = hooks.transform[i](context);
      if (hooks.transform[i].$elysia === "derive") {
        if (operation instanceof Promise)
          Object.assign(context, await operation);
        else
          Object.assign(context, operation);
      } else if (operation instanceof Promise)
        await operation;
    }
    if (validator) {
      if (validator.headers) {
        const _header = {};
        for (const key in request.headers)
          _header[key] = request.headers.get(key);
        if (validator.headers.Check(_header) === false)
          throw new ValidationError(
            "header",
            validator.headers,
            _header
          );
      }
      if (validator.params?.Check(context.params) === false)
        throw new ValidationError(
          "params",
          validator.params,
          context.params
        );
      if (validator.query?.Check(context.query) === false)
        throw new ValidationError(
          "query",
          validator.query,
          context.query
        );
      if (validator.cookie) {
        const cookieValue = {};
        for (const [key, value] of Object.entries(context.cookie))
          cookieValue[key] = value.value;
        if (validator.cookie?.Check(cookieValue) === false)
          throw new ValidationError(
            "cookie",
            validator.cookie,
            cookieValue
          );
      }
      if (validator.body?.Check(body) === false)
        throw new ValidationError("body", validator.body, body);
    }
    for (let i = 0; i < hooks.beforeHandle.length; i++) {
      let response2 = hooks.beforeHandle[i](context);
      if (response2 instanceof Promise)
        response2 = await response2;
      if (response2 !== void 0) {
        ;
        context.response = response2;
        for (let i2 = 0; i2 < hooks.afterHandle.length; i2++) {
          let newResponse = hooks.afterHandle[i2](
            context
          );
          if (newResponse instanceof Promise)
            newResponse = await newResponse;
          if (newResponse)
            response2 = newResponse;
        }
        const result = mapEarlyResponse(response2, context.set);
        if (result)
          return result;
      }
    }
    let response = handle(context);
    if (response instanceof Promise)
      response = await response;
    if (!hooks.afterHandle.length) {
      const responseValidator = validator?.response?.[response.status];
      if (responseValidator?.Check(response) === false)
        throw new ValidationError(
          "response",
          responseValidator,
          response
        );
    } else {
      ;
      context.response = response;
      for (let i = 0; i < hooks.afterHandle.length; i++) {
        let newResponse = hooks.afterHandle[i](
          context
        );
        if (newResponse instanceof Promise)
          newResponse = await newResponse;
        const result = mapEarlyResponse(newResponse, context.set);
        if (result !== void 0) {
          const responseValidator = validator?.response?.[response.status];
          if (responseValidator?.Check(result) === false)
            throw new ValidationError(
              "response",
              responseValidator,
              result
            );
          return result;
        }
      }
    }
    if (context.set.cookie && cookieMeta?.sign) {
      const secret = !cookieMeta.secrets ? void 0 : typeof cookieMeta.secrets === "string" ? cookieMeta.secrets : cookieMeta.secrets[0];
      if (cookieMeta.sign === true)
        for (const [key, cookie] of Object.entries(
          context.set.cookie
        ))
          context.set.cookie[key].value = await signCookie(
            cookie.value,
            "${secret}"
          );
      else
        for (const name of cookieMeta.sign) {
          if (!(name in cookieMeta.properties))
            continue;
          if (context.set.cookie[name]?.value) {
            context.set.cookie[name].value = await signCookie(
              context.set.cookie[name].value,
              secret
            );
          }
        }
    }
    return mapResponse(response, context.set);
  } catch (error2) {
    if (error2.status)
      set.status = error2.status;
    return app.handleError(context, error2);
  } finally {
    for (const onResponse of app.event.onResponse)
      await onResponse(context);
  }
};
var createDynamicErrorHandler = (app) => async (context, error2) => {
  const errorContext = Object.assign(context, { error: error2, code: error2.code });
  errorContext.set = context.set;
  for (let i = 0; i < app.event.error.length; i++) {
    let response = app.event.error[i](errorContext);
    if (response instanceof Promise)
      response = await response;
    if (response !== void 0 && response !== null)
      return mapResponse(response, context.set);
  }
  return new Response(
    typeof error2.cause === "string" ? error2.cause : error2.message,
    {
      headers: context.set.headers,
      status: error2.status ?? 500
    }
  );
};

// src/type-system.ts
import { TypeSystem } from "@sinclair/typebox/system";
import {
  Type,
  FormatRegistry
} from "@sinclair/typebox";
import { Value as Value4 } from "@sinclair/typebox/value";
import {
  TypeSystemPolicy,
  TypeSystem as TypeSystem2,
  TypeSystemDuplicateFormat,
  TypeSystemDuplicateTypeKind
} from "@sinclair/typebox/system";
import { TypeCompiler as TypeCompiler2, TypeCheck as TypeCheck2 } from "@sinclair/typebox/compiler";
var t = Object.assign({}, Type);
try {
  TypeSystem.Format(
    "email",
    (value) => /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(
      value
    )
  );
  TypeSystem.Format(
    "uuid",
    (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
  TypeSystem.Format(
    "date",
    (value) => !Number.isNaN(new Date(value).getTime())
  );
  TypeSystem.Format(
    "date-time",
    (value) => !Number.isNaN(new Date(value).getTime())
  );
} catch {
}
var parseFileUnit = (size) => {
  if (typeof size === "string")
    switch (size.slice(-1)) {
      case "k":
        return +size.slice(0, size.length - 1) * 1024;
      case "m":
        return +size.slice(0, size.length - 1) * 1048576;
      default:
        return +size;
    }
  return size;
};
var validateFile = (options, value) => {
  if (!(value instanceof Blob))
    return false;
  if (options.minSize && value.size < parseFileUnit(options.minSize))
    return false;
  if (options.maxSize && value.size > parseFileUnit(options.maxSize))
    return false;
  if (options.extension)
    if (typeof options.extension === "string") {
      if (!value.type.startsWith(options.extension))
        return false;
    } else {
      for (let i = 0; i < options.extension.length; i++)
        if (value.type.startsWith(options.extension[i]))
          return true;
      return false;
    }
  return true;
};
var Files = TypeSystem.Type(
  "Files",
  (options, value) => {
    if (!Array.isArray(value))
      return validateFile(options, value);
    if (options.minItems && value.length < options.minItems)
      return false;
    if (options.maxItems && value.length > options.maxItems)
      return false;
    for (let i = 0; i < value.length; i++)
      if (!validateFile(options, value[i]))
        return false;
    return true;
  }
);
FormatRegistry.Set("numeric", (value) => !!value && !isNaN(+value));
FormatRegistry.Set("boolean", (value) => value === "true" || value === "false");
FormatRegistry.Set("ObjectString", (value) => {
  let start = value.charCodeAt(0);
  if (start === 9 || start === 10 || start === 32)
    start = value.trimStart().charCodeAt(0);
  if (start !== 123 && start !== 91)
    return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
});
var ElysiaType = {
  Numeric: (property) => {
    const schema = Type.Number(property);
    return t.Transform(
      t.Union(
        [
          t.String({
            format: "numeric",
            default: 0
          }),
          t.Number(property)
        ],
        property
      )
    ).Decode((value) => {
      const number = +value;
      if (isNaN(number))
        return value;
      if (property && !Value4.Check(schema, number))
        throw new ValidationError("property", schema, number);
      return number;
    }).Encode((value) => value);
  },
  BooleanString: (property) => {
    const schema = Type.Boolean(property);
    return t.Transform(
      t.Union(
        [
          t.String({
            format: "boolean",
            default: false
          }),
          t.Boolean(property)
        ],
        property
      )
    ).Decode((value) => {
      if (typeof value === "string")
        return value === "true";
      if (property && !Value4.Check(schema, value))
        throw new ValidationError("property", schema, value);
      return value;
    }).Encode((value) => value);
  },
  ObjectString: (properties, options) => t.Transform(
    t.Union(
      [
        t.String({
          format: "ObjectString",
          default: ""
        }),
        t.Object(properties, options)
      ],
      options
    )
  ).Decode((value) => {
    if (typeof value === "string")
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    return value;
  }).Encode((value) => JSON.stringify(value)),
  File: TypeSystem.Type("File", validateFile),
  Files: (options = {}) => t.Transform(t.Union([Files(options)])).Decode((value) => {
    if (Array.isArray(value))
      return value;
    return [value];
  }).Encode((value) => value),
  Nullable: (schema) => t.Union([t.Null(), schema]),
  /**
   * Allow Optional, Nullable and Undefined
   */
  MaybeEmpty: (schema) => t.Union([t.Null(), t.Undefined(), schema]),
  Cookie: (properties, options) => t.Object(properties, options)
};
t.BooleanString = ElysiaType.BooleanString;
t.ObjectString = ElysiaType.ObjectString;
t.Numeric = ElysiaType.Numeric;
t.File = (arg = {}) => ElysiaType.File({
  default: "File",
  ...arg,
  extension: arg?.type,
  type: "string",
  format: "binary"
});
t.Files = (arg = {}) => ElysiaType.Files({
  ...arg,
  elysiaMeta: "Files",
  default: "Files",
  extension: arg?.type,
  type: "array",
  items: {
    ...arg,
    default: "Files",
    type: "string",
    format: "binary"
  }
});
t.Nullable = (schema) => ElysiaType.Nullable(schema);
t.MaybeEmpty = ElysiaType.MaybeEmpty;
t.Cookie = ElysiaType.Cookie;

// src/index.ts
var Elysia = class _Elysia {
  constructor(config) {
    this.dependencies = {};
    this.store = {};
    this.decorators = {};
    this.definitions = {
      type: {},
      error: {}
    };
    this.schema = {};
    this.macros = [];
    this.event = {
      start: [],
      request: [],
      parse: [],
      transform: [],
      beforeHandle: [],
      afterHandle: [],
      mapResponse: [],
      onResponse: [],
      trace: [],
      error: [],
      stop: []
    };
    this.reporter = new EventEmitter();
    this.server = null;
    this.validator = null;
    this.router = new Memoirist();
    this.wsRouter = new Memoirist();
    this.routes = [];
    this.staticRouter = {
      handlers: [],
      variables: "",
      map: {},
      all: ""
    };
    this.wsPaths = {};
    this.dynamicRouter = new Memoirist();
    this.lazyLoadModules = [];
    this.path = "";
    this.stack = void 0;
    this.handle = async (request) => this.fetch(request);
    /**
     * Use handle can be either sync or async to save performance.
     *
     * Beside benchmark purpose, please use 'handle' instead.
     */
    this.fetch = (request) => {
      if (process.env.NODE_ENV === "production")
        console.warn(
          "Performance degradation found. Please call Elysia.compile() before using 'fetch'"
        );
      return (this.fetch = this.config.aot ? composeGeneralHandler(this) : createDynamicHandler(this))(request);
    };
    this.handleError = async (context, error2) => (this.handleError = this.config.aot ? composeErrorHandler(this) : createDynamicErrorHandler(this))(context, error2);
    this.outerErrorHandler = (error2) => new Response(error2.message || error2.name || "Error", {
      // @ts-ignore
      status: error2?.status ?? 500
    });
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
    this.listen = (options, callback) => {
      if (typeof Bun === "undefined")
        throw new Error(
          ".listen() is designed to run on Bun only. If you are running Elysia in other environment please use a dedicated plugin or export the handler via Elysia.fetch"
        );
      this.compile();
      if (typeof options === "string") {
        options = +options.trim();
        if (Number.isNaN(options))
          throw new Error("Port must be a numeric value");
      }
      const fetch = this.fetch;
      const serve = typeof options === "object" ? {
        development: !isProduction,
        reusePort: true,
        ...this.config.serve || {},
        ...options || {},
        websocket: {
          ...this.config.websocket || {},
          ...websocket || {}
        },
        fetch,
        error: this.outerErrorHandler
      } : {
        development: !isProduction,
        reusePort: true,
        ...this.config.serve || {},
        websocket: {
          ...this.config.websocket || {},
          ...websocket || {}
        },
        port: options,
        fetch,
        error: this.outerErrorHandler
      };
      this.server = Bun?.serve(serve);
      if (this.event.start.length)
        for (let i = 0; i < this.event.start.length; i++)
          this.event.start[i](this);
      if (callback)
        callback(this.server);
      process.on("beforeExit", () => {
        for (let i = 0; i < this.event.stop.length; i++)
          this.event.stop[i](this);
      });
      Promise.all(this.lazyLoadModules).then(() => {
        Bun?.gc(false);
      });
      return this;
    };
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
    this.stop = async () => {
      if (!this.server)
        throw new Error(
          "Elysia isn't running. Call `app.listen` to start the server."
        );
      this.server.stop();
      if (this.event.stop.length)
        for (let i = 0; i < this.event.stop.length; i++)
          this.event.stop[i](this);
    };
    this.config = {
      forceErrorEncapsulation: true,
      prefix: "",
      aot: true,
      strictPath: false,
      scoped: false,
      cookie: {},
      analytic: false,
      ...config || {},
      seed: config?.seed === void 0 ? "" : config?.seed
    };
    if (config?.analytic && (config?.name || config?.seed !== void 0))
      this.stack = new Error().stack;
  }
  getServer() {
    return this.server;
  }
  add(method, paths, handle, localHook, { allowMeta = false, skipPrefix = false } = {
    allowMeta: false,
    skipPrefix: false
  }) {
    if (typeof paths === "string")
      paths = [paths];
    for (let path of paths) {
      path = path === "" ? path : path.charCodeAt(0) === 47 ? path : `/${path}`;
      if (this.config.prefix && !skipPrefix && !this.config.scoped)
        path = this.config.prefix + path;
      if (localHook?.type)
        switch (localHook.type) {
          case "text":
            localHook.type = "text/plain";
            break;
          case "json":
            localHook.type = "application/json";
            break;
          case "formdata":
            localHook.type = "multipart/form-data";
            break;
          case "urlencoded":
            localHook.type = "application/x-www-form-urlencoded";
            break;
          case "arrayBuffer":
            localHook.type = "application/octet-stream";
            break;
          default:
            break;
        }
      const models = this.definitions.type;
      let cookieValidator = getSchemaValidator(
        localHook?.cookie ?? this.validator?.cookie,
        {
          dynamic: !this.config.aot,
          models,
          additionalProperties: true
        }
      );
      if (isNotEmpty(this.config.cookie ?? {})) {
        if (cookieValidator) {
          cookieValidator.schema = mergeCookie(
            // @ts-ignore
            cookieValidator.schema,
            this.config.cookie ?? {}
          );
        } else {
          cookieValidator = getSchemaValidator(
            // @ts-ignore
            t.Cookie({}, this.config.cookie),
            {
              dynamic: !this.config.aot,
              models,
              additionalProperties: true
            }
          );
        }
      }
      const validator = {
        body: getSchemaValidator(
          localHook?.body ?? this.validator?.body,
          {
            dynamic: !this.config.aot,
            models
          }
        ),
        headers: getSchemaValidator(
          localHook?.headers ?? this.validator?.headers,
          {
            dynamic: !this.config.aot,
            models,
            additionalProperties: true
          }
        ),
        params: getSchemaValidator(
          localHook?.params ?? this.validator?.params,
          {
            dynamic: !this.config.aot,
            models
          }
        ),
        query: getSchemaValidator(
          localHook?.query ?? this.validator?.query,
          {
            dynamic: !this.config.aot,
            models
          }
        ),
        cookie: cookieValidator,
        response: getResponseSchemaValidator(
          localHook?.response ?? this.validator?.response,
          {
            dynamic: !this.config.aot,
            models
          }
        )
      };
      const globalHook = this.event;
      const loosePath = path.endsWith("/") ? path.slice(0, path.length - 1) : path + "/";
      if (this.macros.length) {
        const createManager = (stackName) => (type, fn) => {
          if (typeof type === "function" || Array.isArray(type)) {
            if (!localHook[stackName])
              localHook[stackName] = [];
            if (typeof localHook[stackName] === "function")
              localHook[stackName] = [localHook[stackName]];
            if (Array.isArray(type))
              localHook[stackName] = localHook[stackName].concat(type);
            else
              localHook[stackName].push(type);
            return;
          }
          const { insert = "after", stack = "local" } = type;
          if (stack === "global") {
            if (!Array.isArray(fn)) {
              if (insert === "before") {
                ;
                globalHook[stackName].unshift(
                  fn
                );
              } else {
                ;
                globalHook[stackName].push(fn);
              }
            } else {
              if (insert === "before") {
                globalHook[stackName] = fn.concat(
                  globalHook[stackName]
                );
              } else {
                globalHook[stackName] = globalHook[stackName].concat(fn);
              }
            }
            return;
          } else {
            if (!localHook[stackName])
              localHook[stackName] = [];
            if (typeof localHook[stackName] === "function")
              localHook[stackName] = [localHook[stackName]];
            if (!Array.isArray(fn)) {
              if (insert === "before") {
                ;
                localHook[stackName].unshift(fn);
              } else {
                ;
                localHook[stackName].push(fn);
              }
            } else {
              if (insert === "before") {
                localHook[stackName] = fn.concat(
                  localHook[stackName]
                );
              } else {
                localHook[stackName] = localHook[stackName].concat(fn);
              }
            }
            return;
          }
        };
        const manager = {
          events: {
            global: globalHook,
            local: localHook
          },
          onParse: createManager("parse"),
          onTransform: createManager("transform"),
          onBeforeHandle: createManager("beforeHandle"),
          onAfterHandle: createManager("afterHandle"),
          onResponse: createManager("onResponse"),
          onError: createManager("error")
        };
        for (const macro of this.macros)
          traceBackMacro(macro(manager), localHook);
      }
      const hooks = mergeHook(globalHook, localHook);
      const isFn = typeof handle === "function";
      if (this.config.aot === false) {
        this.dynamicRouter.add(method, path, {
          validator,
          hooks,
          content: localHook?.type,
          handle
        });
        if (this.config.strictPath === false) {
          this.dynamicRouter.add(method, loosePath, {
            validator,
            hooks,
            content: localHook?.type,
            handle
          });
        }
        this.routes.push({
          method,
          path,
          composed: null,
          handler: handle,
          hooks
        });
        return;
      }
      const mainHandler = composeHandler({
        path,
        method,
        hooks,
        validator,
        handler: handle,
        handleError: this.handleError,
        onRequest: this.event.request,
        config: this.config,
        definitions: allowMeta ? this.definitions.type : void 0,
        schema: allowMeta ? this.schema : void 0,
        getReporter: () => this.reporter,
        setHeader: this.setHeaders
      });
      if (!isFn) {
        const context = Object.assign(
          {
            headers: {},
            query: {},
            params: {},
            body: void 0,
            request: new Request(`http://localhost${path}`),
            store: this.store,
            path,
            set: {
              headers: this.setHeaders ?? {},
              status: 200
            }
          },
          this.decorators
        );
        let response;
        for (const onRequest of Object.values(hooks.request)) {
          try {
            const inner = mapEarlyResponse(
              onRequest(context),
              context.set
            );
            if (inner !== void 0) {
              response = inner;
              break;
            }
          } catch (error2) {
            response = this.handleError(context, error2);
            break;
          }
        }
        if (response)
          mainHandler.response = response;
        else {
          try {
            mainHandler.response = mainHandler(context);
          } catch (error2) {
            mainHandler.response = this.handleError(
              context,
              error2
            );
          }
        }
      }
      const existingRouteIndex = this.routes.findIndex(
        (route) => route.path === path && route.method === method
      );
      if (existingRouteIndex !== -1) {
        this.routes.splice(existingRouteIndex, 1);
      }
      this.routes.push({
        method,
        path,
        composed: mainHandler,
        handler: handle,
        hooks
      });
      if (method === "$INTERNALWS") {
        const loose = this.config.strictPath ? void 0 : path.endsWith("/") ? path.slice(0, path.length - 1) : path + "/";
        if (path.indexOf(":") === -1 && path.indexOf("*") === -1) {
          const index = this.staticRouter.handlers.length;
          this.staticRouter.handlers.push(mainHandler);
          if (mainHandler.response instanceof Response)
            this.staticRouter.variables += `const st${index} = staticRouter.handlers[${index}].response
`;
          else
            this.staticRouter.variables += `const st${index} = staticRouter.handlers[${index}]
`;
          this.wsPaths[path] = index;
          if (loose)
            this.wsPaths[loose] = index;
        } else {
          this.wsRouter.add("ws", path, mainHandler);
          if (loose)
            this.wsRouter.add("ws", loose, mainHandler);
        }
        return;
      }
      if (path.indexOf(":") === -1 && path.indexOf("*") === -1) {
        const index = this.staticRouter.handlers.length;
        this.staticRouter.handlers.push(mainHandler);
        if (mainHandler.response instanceof Response)
          this.staticRouter.variables += `const st${index} = staticRouter.handlers[${index}].response
`;
        else
          this.staticRouter.variables += `const st${index} = staticRouter.handlers[${index}]
`;
        if (!this.staticRouter.map[path])
          this.staticRouter.map[path] = {
            code: ""
          };
        if (method === "ALL")
          this.staticRouter.map[path].all = `default: return st${index}(ctx)
`;
        else {
          if (mainHandler.response instanceof Response)
            this.staticRouter.map[path].code = `case '${method}': return st${index}.clone()
${this.staticRouter.map[path].code}`;
          else
            this.staticRouter.map[path].code = `case '${method}': return st${index}(ctx)
${this.staticRouter.map[path].code}`;
        }
        if (!this.config.strictPath) {
          if (!this.staticRouter.map[loosePath])
            this.staticRouter.map[loosePath] = {
              code: ""
            };
          if (method === "ALL")
            this.staticRouter.map[loosePath].all = `default: return st${index}(ctx)
`;
          else {
            if (mainHandler.response instanceof Response)
              this.staticRouter.map[loosePath].code = `case '${method}': return st${index}.clone()
${this.staticRouter.map[loosePath].code}`;
            else
              this.staticRouter.map[loosePath].code = `case '${method}': return st${index}(ctx)
${this.staticRouter.map[loosePath].code}`;
          }
        }
      } else {
        this.router.add(method, path, mainHandler);
        if (!this.config.strictPath)
          this.router.add(
            method,
            path.endsWith("/") ? path.slice(0, path.length - 1) : path + "/",
            mainHandler
          );
      }
    }
  }
  headers(header) {
    if (!header)
      return this;
    if (!this.setHeaders)
      this.setHeaders = {};
    this.setHeaders = mergeDeep(this.setHeaders, header);
    return this;
  }
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
  onStart(handler) {
    this.on("start", handler);
    return this;
  }
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
  onRequest(handler) {
    this.on("request", handler);
    return this;
  }
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
  onParse(parser) {
    this.on("parse", parser);
    return this;
  }
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
  onTransform(handler) {
    this.on("transform", handler);
    return this;
  }
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
  resolve(resolver2) {
    resolver2.$elysia = "resolve";
    return this.onBeforeHandle(resolver2);
  }
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
  onBeforeHandle(handler) {
    this.on("beforeHandle", handler);
    return this;
  }
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
  onAfterHandle(handler) {
    this.on("afterHandle", handler);
    return this;
  }
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
  mapResponse(handler) {
    this.on("mapResponse", handler);
    return this;
  }
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
  onResponse(handler) {
    this.on("response", handler);
    return this;
  }
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
  trace(handler) {
    this.reporter.on(
      "event",
      createTraceListener(
        () => this.reporter,
        this.event.trace.length,
        handler
      )
    );
    this.on("trace", handler);
    return this;
  }
  error(name, error2) {
    switch (typeof name) {
      case "string":
        error2.prototype[ERROR_CODE] = name;
        this.definitions.error[name] = error2;
        return this;
      case "function":
        this.definitions.error = name(this.definitions.error);
        return this;
    }
    for (const [code, error3] of Object.entries(name)) {
      error3.prototype[ERROR_CODE] = code;
      this.definitions.error[code] = error3;
    }
    return this;
  }
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
  onError(handler) {
    this.on("error", handler);
    return this;
  }
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
  onStop(handler) {
    this.on("stop", handler);
    return this;
  }
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
  on(type, handlers) {
    for (let handler of Array.isArray(handlers) ? handlers : [handlers]) {
      handler = asGlobal(handler);
      switch (type) {
        case "start":
          this.event.start.push(handler);
          break;
        case "request":
          this.event.request.push(handler);
          break;
        case "parse":
          this.event.parse.splice(
            this.event.parse.length - 1,
            0,
            handler
          );
          break;
        case "transform":
          this.event.transform.push(handler);
          break;
        case "beforeHandle":
          this.event.beforeHandle.push(handler);
          break;
        case "afterHandle":
          this.event.afterHandle.push(handler);
          break;
        case "mapResponse":
          this.event.mapResponse.push(handler);
          break;
        case "response":
          this.event.onResponse.push(handler);
          break;
        case "trace":
          this.event.trace.push(handler);
          break;
        case "error":
          this.event.error.push(handler);
          break;
        case "stop":
          this.event.stop.push(handler);
          break;
      }
    }
    return this;
  }
  /**
   * ### group
   * Encapsulate and group path with prefix
   *
   * ---
   * @example
   * ```typescript
   * new Elysia()
   *     .group('/v1', app => app
   *         .get('/', () => 'Hi')
   *         .get('/name', () => 'Elysia')
   *     })
   * ```
   */
  group(prefix, schemaOrRun, run) {
    const instance = new _Elysia({
      ...this.config || {},
      prefix: ""
    });
    instance.store = this.store;
    instance.definitions = this.definitions;
    instance.getServer = () => this.server;
    const isSchema = typeof schemaOrRun === "object";
    const sandbox = (isSchema ? run : schemaOrRun)(instance);
    this.decorators = mergeDeep(this.decorators, instance.decorators);
    if (sandbox.event.request.length)
      this.event.request = [
        ...this.event.request || [],
        ...sandbox.event.request || []
      ];
    if (sandbox.event.onResponse.length)
      this.event.onResponse = [
        ...this.event.onResponse || [],
        ...sandbox.event.onResponse || []
      ];
    this.model(sandbox.definitions.type);
    Object.values(instance.routes).forEach(
      ({ method, path, handler, hooks }) => {
        path = (isSchema ? "" : this.config.prefix) + prefix + path;
        if (isSchema) {
          const hook = schemaOrRun;
          const localHook = hooks;
          this.add(
            method,
            path,
            handler,
            mergeHook(hook, {
              ...localHook || {},
              error: !localHook.error ? sandbox.event.error : Array.isArray(localHook.error) ? [
                ...localHook.error || {},
                ...sandbox.event.error || {}
              ] : [
                localHook.error,
                ...sandbox.event.error || {}
              ]
            })
          );
        } else {
          this.add(
            method,
            path,
            handler,
            mergeHook(hooks, {
              error: sandbox.event.error
            }),
            {
              skipPrefix: true
            }
          );
        }
      }
    );
    return this;
  }
  /**
   * ### guard
   * Encapsulate and pass hook into all child handler
   *
   * ---
   * @example
   * ```typescript
   * import { t } from 'elysia'
   *
   * new Elysia()
   *     .guard({
   *          schema: {
   *              body: t.Object({
   *                  username: t.String(),
   *                  password: t.String()
   *              })
   *          }
   *     }, app => app
   *         .get("/", () => 'Hi')
   *         .get("/name", () => 'Elysia')
   *     })
   * ```
   */
  guard(hook, run) {
    if (!run) {
      this.event = mergeLifeCycle(this.event, hook);
      this.validator = {
        body: hook.body,
        headers: hook.headers,
        params: hook.params,
        query: hook.query,
        response: hook.response
      };
      return this;
    }
    const instance = new _Elysia({
      ...this.config || {},
      prefix: ""
    });
    instance.store = this.store;
    instance.definitions = this.definitions;
    const sandbox = run(instance);
    this.decorators = mergeDeep(this.decorators, instance.decorators);
    if (sandbox.event.request.length)
      this.event.request = [
        ...this.event.request || [],
        ...sandbox.event.request || []
      ];
    if (sandbox.event.onResponse.length)
      this.event.onResponse = [
        ...this.event.onResponse || [],
        ...sandbox.event.onResponse || []
      ];
    this.model(sandbox.definitions.type);
    Object.values(instance.routes).forEach(
      ({ method, path, handler, hooks: localHook }) => {
        this.add(
          method,
          path,
          handler,
          mergeHook(hook, {
            ...localHook || {},
            error: !localHook.error ? sandbox.event.error : Array.isArray(localHook.error) ? [
              ...localHook.error || {},
              ...sandbox.event.error || []
            ] : [localHook.error, ...sandbox.event.error || []]
          })
        );
      }
    );
    return this;
  }
  /**
   * ### use
   * Merge separate logic of Elysia with current
   *
   * ---
   * @example
   * ```typescript
   * const plugin = (app: Elysia) => app
   *     .get('/plugin', () => 'hi')
   *
   * new Elysia()
   *     .use(plugin)
   * ```
   */
  use(plugin) {
    if (plugin instanceof Promise) {
      this.lazyLoadModules.push(
        plugin.then((plugin2) => {
          if (typeof plugin2 === "function") {
            return plugin2(
              this
            );
          }
          if (typeof plugin2.default === "function")
            return plugin2.default(
              this
            );
          return this._use(plugin2);
        }).then((x) => x.compile())
      );
      return this;
    } else
      return this._use(plugin);
    return this;
  }
  _use(plugin) {
    if (typeof plugin === "function") {
      const instance = plugin(this);
      if (instance instanceof Promise) {
        this.lazyLoadModules.push(
          instance.then((plugin2) => {
            if (plugin2 instanceof _Elysia) {
              this.compile();
              for (const {
                method,
                path,
                handler,
                hooks
              } of Object.values(plugin2.routes)) {
                this.add(
                  method,
                  path,
                  handler,
                  mergeHook(
                    hooks,
                    {
                      error: plugin2.event.error
                    }
                  )
                );
              }
              return plugin2;
            }
            if (typeof plugin2 === "function")
              return plugin2(
                this
              );
            if (typeof plugin2.default === "function")
              return plugin2.default(
                this
              );
            return this._use(plugin2);
          }).then((x) => x.compile())
        );
        return this;
      }
      return instance;
    }
    const { name, seed } = plugin.config;
    plugin.getServer = () => this.getServer();
    this.headers(plugin.setHeaders);
    const isScoped = plugin.config.scoped;
    if (isScoped) {
      if (name) {
        if (!(name in this.dependencies))
          this.dependencies[name] = [];
        const current = seed !== void 0 ? checksum(name + JSON.stringify(seed)) : 0;
        if (this.dependencies[name].some(
          ({ checksum: checksum2 }) => current === checksum2
        ))
          return this;
        this.dependencies[name].push(
          !this.config?.analytic ? {
            name: plugin.config.name,
            seed: plugin.config.seed,
            checksum: current,
            dependencies: plugin.dependencies
          } : {
            name: plugin.config.name,
            seed: plugin.config.seed,
            checksum: current,
            dependencies: plugin.dependencies,
            stack: plugin.stack,
            routes: plugin.routes,
            decorators: plugin.decorators,
            store: plugin.store,
            type: plugin.definitions.type,
            error: plugin.definitions.error,
            derive: plugin.event.transform.filter((x) => x.$elysia === "derive").map((x) => ({
              fn: x.toString(),
              stack: new Error().stack ?? ""
            })),
            resolve: plugin.event.transform.filter((x) => x.$elysia === "derive").map((x) => ({
              fn: x.toString(),
              stack: new Error().stack ?? ""
            }))
          }
        );
      }
      plugin.model(this.definitions.type);
      plugin.error(this.definitions.error);
      plugin.macros = [...this.macros || [], ...plugin.macros || []];
      plugin.onRequest((context) => {
        Object.assign(context, this.decorators);
        Object.assign(context.store, this.store);
      });
      plugin.event.trace = [
        ...this.event.trace || [],
        ...plugin.event.trace || []
      ];
      if (isScoped && !plugin.config.prefix)
        console.warn(
          "When using scoped plugins it is recommended to use a prefix, else routing may not work correctly for the second scoped instance"
        );
      plugin.event.error.push(...this.event.error);
      if (plugin.config.aot)
        plugin.compile();
      let instance;
      if (isScoped && plugin.config.prefix) {
        instance = this.mount(plugin.config.prefix + "/", plugin.fetch);
        plugin.routes.forEach((r) => {
          this.routes.push({
            ...r,
            path: `${plugin.config.prefix}${r.path}`,
            //This probably has no effect as the routes object itself is not used to execute these handlers? The plugin is taking care of it.
            hooks: mergeHook(
              r.hooks,
              {
                error: this.event.error
              }
            )
          });
        });
      } else {
        instance = this.mount(plugin.fetch);
        this.routes = this.routes.concat(instance.routes);
      }
      return this;
    } else {
      plugin.reporter = this.reporter;
      for (const trace of plugin.event.trace)
        this.trace(trace);
      if (name) {
        if (!(name in this.dependencies))
          this.dependencies[name] = [];
        const current = seed !== void 0 ? checksum(name + JSON.stringify(seed)) : 0;
        if (!this.dependencies[name].some(
          ({ checksum: checksum2 }) => current === checksum2
        ))
          this.macros.push(...plugin.macros || []);
        const macroHashes = [];
        for (let i = 0; i < this.macros.length; i++) {
          const macro = this.macros[i];
          if (macroHashes.includes(macro.$elysiaChecksum)) {
            this.macros.splice(i, 1);
            i--;
          }
          macroHashes.push(macro.$elysiaChecksum);
        }
      }
    }
    this.decorate(plugin.decorators);
    this.state(plugin.store);
    this.model(plugin.definitions.type);
    this.error(plugin.definitions.error);
    for (const { method, path, handler, hooks } of Object.values(
      plugin.routes
    )) {
      this.add(
        method,
        path,
        handler,
        mergeHook(
          hooks,
          {
            error: plugin.event.error
          }
        )
      );
    }
    if (!isScoped)
      if (name) {
        if (!(name in this.dependencies))
          this.dependencies[name] = [];
        const current = seed !== void 0 ? checksum(name + JSON.stringify(seed)) : 0;
        if (this.dependencies[name].some(
          ({ checksum: checksum2 }) => current === checksum2
        ))
          return this;
        this.dependencies[name].push(
          !this.config?.analytic ? {
            name: plugin.config.name,
            seed: plugin.config.seed,
            checksum: current,
            dependencies: plugin.dependencies
          } : {
            name: plugin.config.name,
            seed: plugin.config.seed,
            checksum: current,
            dependencies: plugin.dependencies,
            stack: plugin.stack,
            routes: plugin.routes,
            decorators: plugin.decorators,
            store: plugin.store,
            type: plugin.definitions.type,
            error: plugin.definitions.error,
            derive: plugin.event.transform.filter((x) => x?.$elysia === "derive").map((x) => ({
              fn: x.toString(),
              stack: new Error().stack ?? ""
            })),
            resolve: plugin.event.transform.filter((x) => x?.$elysia === "resolve").map((x) => ({
              fn: x.toString(),
              stack: new Error().stack ?? ""
            }))
          }
        );
        this.event = mergeLifeCycle(
          this.event,
          filterGlobalHook(plugin.event),
          current
        );
      } else {
        this.event = mergeLifeCycle(
          this.event,
          filterGlobalHook(plugin.event)
        );
      }
    return this;
  }
  macro(macro) {
    macro.$elysiaChecksum = checksum(
      JSON.stringify({
        name: this.config.name,
        seed: this.config.seed,
        content: macro.toString()
      })
    );
    this.macros.push(macro);
    return this;
  }
  mount(path, handle) {
    if (path instanceof _Elysia || typeof path === "function" || path.length === 0 || path === "/") {
      const run = typeof path === "function" ? path : path instanceof _Elysia ? path.compile().fetch : handle instanceof _Elysia ? handle.compile().fetch : handle;
      const handler2 = async ({ request, path: path2 }) => run(
        new Request(
          replaceUrlPath(request.url, path2 || "/"),
          request
        )
      );
      this.all(
        "/",
        handler2,
        {
          type: "none"
        }
      );
      this.all(
        "/*",
        handler2,
        {
          type: "none"
        }
      );
      return this;
    }
    const length = path.length;
    if (handle instanceof _Elysia)
      handle = handle.compile().fetch;
    const handler = async ({ request, path: path2 }) => handle(
      new Request(
        replaceUrlPath(request.url, path2.slice(length) || "/"),
        request
      )
    );
    this.all(
      path,
      handler,
      {
        type: "none"
      }
    );
    this.all(
      path + (path.endsWith("/") ? "*" : "/*"),
      handler,
      {
        type: "none"
      }
    );
    return this;
  }
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
  get(path, handler, hook) {
    this.add("GET", path, handler, hook);
    return this;
  }
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
  post(path, handler, hook) {
    this.add("POST", path, handler, hook);
    return this;
  }
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
  put(path, handler, hook) {
    this.add("PUT", path, handler, hook);
    return this;
  }
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
  patch(path, handler, hook) {
    this.add("PATCH", path, handler, hook);
    return this;
  }
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
  delete(path, handler, hook) {
    this.add("DELETE", path, handler, hook);
    return this;
  }
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
  options(path, handler, hook) {
    this.add("OPTIONS", path, handler, hook);
    return this;
  }
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
  all(path, handler, hook) {
    this.add("ALL", path, handler, hook);
    return this;
  }
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
  head(path, handler, hook) {
    this.add("HEAD", path, handler, hook);
    return this;
  }
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
  connect(path, handler, hook) {
    this.add("CONNECT", path, handler, hook);
    return this;
  }
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
  ws(path, options) {
    const transform = options.transformMessage ? Array.isArray(options.transformMessage) ? options.transformMessage : [options.transformMessage] : void 0;
    let server = null;
    const validateMessage = getSchemaValidator(options?.body, {
      models: this.definitions.type
    });
    const validateResponse = getSchemaValidator(options?.response, {
      models: this.definitions.type
    });
    const parseMessage = (message) => {
      if (typeof message === "string") {
        const start = message?.charCodeAt(0);
        if (start === 47 || start === 123)
          try {
            message = JSON.parse(message);
          } catch {
          }
        else if (isNumericString(message))
          message = +message;
      }
      if (transform?.length)
        for (let i = 0; i < transform.length; i++) {
          const temp = transform[i](message);
          if (temp !== void 0)
            message = temp;
        }
      return message;
    };
    this.route(
      "$INTERNALWS",
      path,
      // @ts-ignore
      (context) => {
        const { set, path: path2, qi, headers, query, params } = context;
        if (server === null)
          server = this.getServer();
        if (server?.upgrade(context.request, {
          headers: typeof options.upgrade === "function" ? options.upgrade(context) : options.upgrade,
          data: {
            validator: validateResponse,
            open(ws) {
              options.open?.(new ElysiaWS(ws, context));
            },
            message: (ws, msg) => {
              const message = parseMessage(msg);
              if (validateMessage?.Check(message) === false)
                return void ws.send(
                  new ValidationError(
                    "message",
                    validateMessage,
                    message
                  ).message
                );
              options.message?.(
                new ElysiaWS(ws, context),
                message
              );
            },
            drain(ws) {
              options.drain?.(
                new ElysiaWS(ws, context)
              );
            },
            close(ws, code, reason) {
              options.close?.(
                new ElysiaWS(ws, context),
                code,
                reason
              );
            }
          }
        }))
          return;
        set.status = 400;
        return "Expected a websocket connection";
      },
      {
        beforeHandle: options.beforeHandle,
        transform: options.transform,
        headers: options.headers,
        params: options.params,
        query: options.query
      }
    );
    return this;
  }
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
  route(method, path, handler, {
    config,
    ...hook
  } = {
    config: {
      allowMeta: false
    }
  }) {
    this.add(method, path, handler, hook, config);
    return this;
  }
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
  state(name, value) {
    switch (typeof name) {
      case "object":
        this.store = mergeDeep(this.store, name);
        return this;
      case "function":
        this.store = name(this.store);
        return this;
    }
    if (!(name in this.store)) {
      ;
      this.store[name] = value;
    }
    return this;
  }
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
  decorate(name, value) {
    switch (typeof name) {
      case "object":
        this.decorators = mergeDeep(this.decorators, name);
        return this;
      case "function":
        this.decorators = name(this.decorators);
        return this;
    }
    if (!(name in this.decorators))
      this.decorators[name] = value;
    return this;
  }
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
  derive(transform) {
    transform.$elysia = "derive";
    return this.onTransform(transform);
  }
  model(name, model) {
    switch (typeof name) {
      case "object":
        Object.entries(name).forEach(([key, value]) => {
          if (!(key in this.definitions.type))
            this.definitions.type[key] = value;
        });
        return this;
      case "function":
        this.definitions.type = name(this.definitions.type);
        return this;
    }
    ;
    this.definitions.type[name] = model;
    return this;
  }
  mapDerive(mapper) {
    mapper.$elysia = "derive";
    return this.onTransform(mapper);
  }
  affix(base, type, word) {
    if (word === "")
      return this;
    const delimieter = ["_", "-", " "];
    const capitalize = (word2) => word2[0].toUpperCase() + word2.slice(1);
    const joinKey = base === "prefix" ? (prefix, word2) => delimieter.includes(prefix.at(-1) ?? "") ? prefix + word2 : prefix + capitalize(word2) : delimieter.includes(word.at(-1) ?? "") ? (suffix, word2) => word2 + suffix : (suffix, word2) => word2 + capitalize(suffix);
    const remap = (type2) => {
      const store = {};
      switch (type2) {
        case "decorator":
          for (const key in this.decorators)
            store[joinKey(word, key)] = this.decorators[key];
          this.decorators = store;
          break;
        case "state":
          for (const key in this.store)
            store[joinKey(word, key)] = this.store[key];
          this.store = store;
          break;
        case "model":
          for (const key in this.definitions.type)
            store[joinKey(word, key)] = this.definitions.type[key];
          this.definitions.type = store;
          break;
        case "error":
          for (const key in this.definitions.error)
            store[joinKey(word, key)] = this.definitions.error[key];
          this.definitions.error = store;
          break;
      }
    };
    const types = Array.isArray(type) ? type : [type];
    for (const type2 of types.some((x) => x === "all") ? ["decorator", "state", "model", "error"] : types)
      remap(type2);
    return this;
  }
  prefix(type, word) {
    return this.affix("prefix", type, word);
  }
  suffix(type, word) {
    return this.affix("suffix", type, word);
  }
  compile() {
    this.fetch = this.config.aot ? composeGeneralHandler(this) : createDynamicHandler(this);
    if (typeof this.server?.reload === "function")
      this.server.reload({
        ...this.server || {},
        fetch: this.fetch
      });
    return this;
  }
  /**
   * Wait until all lazy loaded modules all load is fully
   */
  get modules() {
    return Promise.all(this.lazyLoadModules);
  }
};
export {
  Cookie,
  Elysia,
  InternalServerError,
  InvalidCookieSignature,
  NotFoundError,
  ParseError,
  ValidationError,
  Elysia as default,
  error,
  getResponseSchemaValidator,
  getSchemaValidator,
  mapCompactResponse,
  mapEarlyResponse,
  mapResponse,
  mergeDeep,
  mergeHook,
  mergeObjectArray,
  t
};
