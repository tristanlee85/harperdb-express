#!/usr/bin/env node
import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS((exports) => {
  var ALIAS = Symbol.for("yaml.alias");
  var DOC = Symbol.for("yaml.document");
  var MAP = Symbol.for("yaml.map");
  var PAIR = Symbol.for("yaml.pair");
  var SCALAR = Symbol.for("yaml.scalar");
  var SEQ = Symbol.for("yaml.seq");
  var NODE_TYPE = Symbol.for("yaml.node.type");
  var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
  var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
  var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
  var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
  var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
  var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
  function isCollection(node) {
    if (node && typeof node === "object")
      switch (node[NODE_TYPE]) {
        case MAP:
        case SEQ:
          return true;
      }
    return false;
  }
  function isNode(node) {
    if (node && typeof node === "object")
      switch (node[NODE_TYPE]) {
        case ALIAS:
        case MAP:
        case SCALAR:
        case SEQ:
          return true;
      }
    return false;
  }
  var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
  exports.ALIAS = ALIAS;
  exports.DOC = DOC;
  exports.MAP = MAP;
  exports.NODE_TYPE = NODE_TYPE;
  exports.PAIR = PAIR;
  exports.SCALAR = SCALAR;
  exports.SEQ = SEQ;
  exports.hasAnchor = hasAnchor;
  exports.isAlias = isAlias;
  exports.isCollection = isCollection;
  exports.isDocument = isDocument;
  exports.isMap = isMap;
  exports.isNode = isNode;
  exports.isPair = isPair;
  exports.isScalar = isScalar;
  exports.isSeq = isSeq;
});

// node_modules/yaml/dist/visit.js
var require_visit = __commonJS((exports) => {
  var identity = require_identity();
  var BREAK = Symbol("break visit");
  var SKIP = Symbol("skip children");
  var REMOVE = Symbol("remove node");
  function visit(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if (identity.isDocument(node)) {
      const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
      if (cd === REMOVE)
        node.contents = null;
    } else
      visit_(null, node, visitor_, Object.freeze([]));
  }
  visit.BREAK = BREAK;
  visit.SKIP = SKIP;
  visit.REMOVE = REMOVE;
  function visit_(key, node, visitor, path) {
    const ctrl = callVisitor(key, node, visitor, path);
    if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
      replaceNode(key, path, ctrl);
      return visit_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== "symbol") {
      if (identity.isCollection(node)) {
        path = Object.freeze(path.concat(node));
        for (let i = 0;i < node.items.length; ++i) {
          const ci = visit_(i, node.items[i], visitor, path);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK)
            return BREAK;
          else if (ci === REMOVE) {
            node.items.splice(i, 1);
            i -= 1;
          }
        }
      } else if (identity.isPair(node)) {
        path = Object.freeze(path.concat(node));
        const ck = visit_("key", node.key, visitor, path);
        if (ck === BREAK)
          return BREAK;
        else if (ck === REMOVE)
          node.key = null;
        const cv = visit_("value", node.value, visitor, path);
        if (cv === BREAK)
          return BREAK;
        else if (cv === REMOVE)
          node.value = null;
      }
    }
    return ctrl;
  }
  async function visitAsync(node, visitor) {
    const visitor_ = initVisitor(visitor);
    if (identity.isDocument(node)) {
      const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
      if (cd === REMOVE)
        node.contents = null;
    } else
      await visitAsync_(null, node, visitor_, Object.freeze([]));
  }
  visitAsync.BREAK = BREAK;
  visitAsync.SKIP = SKIP;
  visitAsync.REMOVE = REMOVE;
  async function visitAsync_(key, node, visitor, path) {
    const ctrl = await callVisitor(key, node, visitor, path);
    if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
      replaceNode(key, path, ctrl);
      return visitAsync_(key, ctrl, visitor, path);
    }
    if (typeof ctrl !== "symbol") {
      if (identity.isCollection(node)) {
        path = Object.freeze(path.concat(node));
        for (let i = 0;i < node.items.length; ++i) {
          const ci = await visitAsync_(i, node.items[i], visitor, path);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK)
            return BREAK;
          else if (ci === REMOVE) {
            node.items.splice(i, 1);
            i -= 1;
          }
        }
      } else if (identity.isPair(node)) {
        path = Object.freeze(path.concat(node));
        const ck = await visitAsync_("key", node.key, visitor, path);
        if (ck === BREAK)
          return BREAK;
        else if (ck === REMOVE)
          node.key = null;
        const cv = await visitAsync_("value", node.value, visitor, path);
        if (cv === BREAK)
          return BREAK;
        else if (cv === REMOVE)
          node.value = null;
      }
    }
    return ctrl;
  }
  function initVisitor(visitor) {
    if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
      return Object.assign({
        Alias: visitor.Node,
        Map: visitor.Node,
        Scalar: visitor.Node,
        Seq: visitor.Node
      }, visitor.Value && {
        Map: visitor.Value,
        Scalar: visitor.Value,
        Seq: visitor.Value
      }, visitor.Collection && {
        Map: visitor.Collection,
        Seq: visitor.Collection
      }, visitor);
    }
    return visitor;
  }
  function callVisitor(key, node, visitor, path) {
    if (typeof visitor === "function")
      return visitor(key, node, path);
    if (identity.isMap(node))
      return visitor.Map?.(key, node, path);
    if (identity.isSeq(node))
      return visitor.Seq?.(key, node, path);
    if (identity.isPair(node))
      return visitor.Pair?.(key, node, path);
    if (identity.isScalar(node))
      return visitor.Scalar?.(key, node, path);
    if (identity.isAlias(node))
      return visitor.Alias?.(key, node, path);
    return;
  }
  function replaceNode(key, path, node) {
    const parent = path[path.length - 1];
    if (identity.isCollection(parent)) {
      parent.items[key] = node;
    } else if (identity.isPair(parent)) {
      if (key === "key")
        parent.key = node;
      else
        parent.value = node;
    } else if (identity.isDocument(parent)) {
      parent.contents = node;
    } else {
      const pt = identity.isAlias(parent) ? "alias" : "scalar";
      throw new Error(`Cannot replace node with ${pt} parent`);
    }
  }
  exports.visit = visit;
  exports.visitAsync = visitAsync;
});

// node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS((exports) => {
  var identity = require_identity();
  var visit = require_visit();
  var escapeChars = {
    "!": "%21",
    ",": "%2C",
    "[": "%5B",
    "]": "%5D",
    "{": "%7B",
    "}": "%7D"
  };
  var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);

  class Directives {
    constructor(yaml, tags) {
      this.docStart = null;
      this.docEnd = false;
      this.yaml = Object.assign({}, Directives.defaultYaml, yaml);
      this.tags = Object.assign({}, Directives.defaultTags, tags);
    }
    clone() {
      const copy = new Directives(this.yaml, this.tags);
      copy.docStart = this.docStart;
      return copy;
    }
    atDocument() {
      const res = new Directives(this.yaml, this.tags);
      switch (this.yaml.version) {
        case "1.1":
          this.atNextDocument = true;
          break;
        case "1.2":
          this.atNextDocument = false;
          this.yaml = {
            explicit: Directives.defaultYaml.explicit,
            version: "1.2"
          };
          this.tags = Object.assign({}, Directives.defaultTags);
          break;
      }
      return res;
    }
    add(line, onError) {
      if (this.atNextDocument) {
        this.yaml = { explicit: Directives.defaultYaml.explicit, version: "1.1" };
        this.tags = Object.assign({}, Directives.defaultTags);
        this.atNextDocument = false;
      }
      const parts = line.trim().split(/[ \t]+/);
      const name = parts.shift();
      switch (name) {
        case "%TAG": {
          if (parts.length !== 2) {
            onError(0, "%TAG directive should contain exactly two parts");
            if (parts.length < 2)
              return false;
          }
          const [handle, prefix] = parts;
          this.tags[handle] = prefix;
          return true;
        }
        case "%YAML": {
          this.yaml.explicit = true;
          if (parts.length !== 1) {
            onError(0, "%YAML directive should contain exactly one part");
            return false;
          }
          const [version] = parts;
          if (version === "1.1" || version === "1.2") {
            this.yaml.version = version;
            return true;
          } else {
            const isValid = /^\d+\.\d+$/.test(version);
            onError(6, `Unsupported YAML version ${version}`, isValid);
            return false;
          }
        }
        default:
          onError(0, `Unknown directive ${name}`, true);
          return false;
      }
    }
    tagName(source, onError) {
      if (source === "!")
        return "!";
      if (source[0] !== "!") {
        onError(`Not a valid tag: ${source}`);
        return null;
      }
      if (source[1] === "<") {
        const verbatim = source.slice(2, -1);
        if (verbatim === "!" || verbatim === "!!") {
          onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
          return null;
        }
        if (source[source.length - 1] !== ">")
          onError("Verbatim tags must end with a >");
        return verbatim;
      }
      const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
      if (!suffix)
        onError(`The ${source} tag has no suffix`);
      const prefix = this.tags[handle];
      if (prefix) {
        try {
          return prefix + decodeURIComponent(suffix);
        } catch (error) {
          onError(String(error));
          return null;
        }
      }
      if (handle === "!")
        return source;
      onError(`Could not resolve tag: ${source}`);
      return null;
    }
    tagString(tag) {
      for (const [handle, prefix] of Object.entries(this.tags)) {
        if (tag.startsWith(prefix))
          return handle + escapeTagName(tag.substring(prefix.length));
      }
      return tag[0] === "!" ? tag : `!<${tag}>`;
    }
    toString(doc) {
      const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
      const tagEntries = Object.entries(this.tags);
      let tagNames;
      if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
        const tags = {};
        visit.visit(doc.contents, (_key, node) => {
          if (identity.isNode(node) && node.tag)
            tags[node.tag] = true;
        });
        tagNames = Object.keys(tags);
      } else
        tagNames = [];
      for (const [handle, prefix] of tagEntries) {
        if (handle === "!!" && prefix === "tag:yaml.org,2002:")
          continue;
        if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
          lines.push(`%TAG ${handle} ${prefix}`);
      }
      return lines.join(`
`);
    }
  }
  Directives.defaultYaml = { explicit: false, version: "1.2" };
  Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
  exports.Directives = Directives;
});

// node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS((exports) => {
  var identity = require_identity();
  var visit = require_visit();
  function anchorIsValid(anchor) {
    if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
      const sa = JSON.stringify(anchor);
      const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
      throw new Error(msg);
    }
    return true;
  }
  function anchorNames(root) {
    const anchors = new Set;
    visit.visit(root, {
      Value(_key, node) {
        if (node.anchor)
          anchors.add(node.anchor);
      }
    });
    return anchors;
  }
  function findNewAnchor(prefix, exclude) {
    for (let i = 1;; ++i) {
      const name = `${prefix}${i}`;
      if (!exclude.has(name))
        return name;
    }
  }
  function createNodeAnchors(doc, prefix) {
    const aliasObjects = [];
    const sourceObjects = new Map;
    let prevAnchors = null;
    return {
      onAnchor: (source) => {
        aliasObjects.push(source);
        if (!prevAnchors)
          prevAnchors = anchorNames(doc);
        const anchor = findNewAnchor(prefix, prevAnchors);
        prevAnchors.add(anchor);
        return anchor;
      },
      setAnchors: () => {
        for (const source of aliasObjects) {
          const ref = sourceObjects.get(source);
          if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
            ref.node.anchor = ref.anchor;
          } else {
            const error = new Error("Failed to resolve repeated object (this should not happen)");
            error.source = source;
            throw error;
          }
        }
      },
      sourceObjects
    };
  }
  exports.anchorIsValid = anchorIsValid;
  exports.anchorNames = anchorNames;
  exports.createNodeAnchors = createNodeAnchors;
  exports.findNewAnchor = findNewAnchor;
});

// node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS((exports) => {
  function applyReviver(reviver, obj, key, val) {
    if (val && typeof val === "object") {
      if (Array.isArray(val)) {
        for (let i = 0, len = val.length;i < len; ++i) {
          const v0 = val[i];
          const v1 = applyReviver(reviver, val, String(i), v0);
          if (v1 === undefined)
            delete val[i];
          else if (v1 !== v0)
            val[i] = v1;
        }
      } else if (val instanceof Map) {
        for (const k of Array.from(val.keys())) {
          const v0 = val.get(k);
          const v1 = applyReviver(reviver, val, k, v0);
          if (v1 === undefined)
            val.delete(k);
          else if (v1 !== v0)
            val.set(k, v1);
        }
      } else if (val instanceof Set) {
        for (const v0 of Array.from(val)) {
          const v1 = applyReviver(reviver, val, v0, v0);
          if (v1 === undefined)
            val.delete(v0);
          else if (v1 !== v0) {
            val.delete(v0);
            val.add(v1);
          }
        }
      } else {
        for (const [k, v0] of Object.entries(val)) {
          const v1 = applyReviver(reviver, val, k, v0);
          if (v1 === undefined)
            delete val[k];
          else if (v1 !== v0)
            val[k] = v1;
        }
      }
    }
    return reviver.call(obj, key, val);
  }
  exports.applyReviver = applyReviver;
});

// node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS((exports) => {
  var identity = require_identity();
  function toJS(value, arg, ctx) {
    if (Array.isArray(value))
      return value.map((v, i) => toJS(v, String(i), ctx));
    if (value && typeof value.toJSON === "function") {
      if (!ctx || !identity.hasAnchor(value))
        return value.toJSON(arg, ctx);
      const data = { aliasCount: 0, count: 1, res: undefined };
      ctx.anchors.set(value, data);
      ctx.onCreate = (res2) => {
        data.res = res2;
        delete ctx.onCreate;
      };
      const res = value.toJSON(arg, ctx);
      if (ctx.onCreate)
        ctx.onCreate(res);
      return res;
    }
    if (typeof value === "bigint" && !ctx?.keep)
      return Number(value);
    return value;
  }
  exports.toJS = toJS;
});

// node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS((exports) => {
  var applyReviver = require_applyReviver();
  var identity = require_identity();
  var toJS = require_toJS();

  class NodeBase {
    constructor(type) {
      Object.defineProperty(this, identity.NODE_TYPE, { value: type });
    }
    clone() {
      const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
      if (!identity.isDocument(doc))
        throw new TypeError("A document argument is required");
      const ctx = {
        anchors: new Map,
        doc,
        keep: true,
        mapAsMap: mapAsMap === true,
        mapKeyWarned: false,
        maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
      };
      const res = toJS.toJS(this, "", ctx);
      if (typeof onAnchor === "function")
        for (const { count, res: res2 } of ctx.anchors.values())
          onAnchor(res2, count);
      return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
    }
  }
  exports.NodeBase = NodeBase;
});

// node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS((exports) => {
  var anchors = require_anchors();
  var visit = require_visit();
  var identity = require_identity();
  var Node = require_Node();
  var toJS = require_toJS();

  class Alias extends Node.NodeBase {
    constructor(source) {
      super(identity.ALIAS);
      this.source = source;
      Object.defineProperty(this, "tag", {
        set() {
          throw new Error("Alias nodes cannot have tags");
        }
      });
    }
    resolve(doc) {
      let found = undefined;
      visit.visit(doc, {
        Node: (_key, node) => {
          if (node === this)
            return visit.visit.BREAK;
          if (node.anchor === this.source)
            found = node;
        }
      });
      return found;
    }
    toJSON(_arg, ctx) {
      if (!ctx)
        return { source: this.source };
      const { anchors: anchors2, doc, maxAliasCount } = ctx;
      const source = this.resolve(doc);
      if (!source) {
        const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new ReferenceError(msg);
      }
      let data = anchors2.get(source);
      if (!data) {
        toJS.toJS(source, null, ctx);
        data = anchors2.get(source);
      }
      if (!data || data.res === undefined) {
        const msg = "This should not happen: Alias anchor was not resolved?";
        throw new ReferenceError(msg);
      }
      if (maxAliasCount >= 0) {
        data.count += 1;
        if (data.aliasCount === 0)
          data.aliasCount = getAliasCount(doc, source, anchors2);
        if (data.count * data.aliasCount > maxAliasCount) {
          const msg = "Excessive alias count indicates a resource exhaustion attack";
          throw new ReferenceError(msg);
        }
      }
      return data.res;
    }
    toString(ctx, _onComment, _onChompKeep) {
      const src = `*${this.source}`;
      if (ctx) {
        anchors.anchorIsValid(this.source);
        if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new Error(msg);
        }
        if (ctx.implicitKey)
          return `${src} `;
      }
      return src;
    }
  }
  function getAliasCount(doc, node, anchors2) {
    if (identity.isAlias(node)) {
      const source = node.resolve(doc);
      const anchor = anchors2 && source && anchors2.get(source);
      return anchor ? anchor.count * anchor.aliasCount : 0;
    } else if (identity.isCollection(node)) {
      let count = 0;
      for (const item of node.items) {
        const c = getAliasCount(doc, item, anchors2);
        if (c > count)
          count = c;
      }
      return count;
    } else if (identity.isPair(node)) {
      const kc = getAliasCount(doc, node.key, anchors2);
      const vc = getAliasCount(doc, node.value, anchors2);
      return Math.max(kc, vc);
    }
    return 1;
  }
  exports.Alias = Alias;
});

// node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS((exports) => {
  var identity = require_identity();
  var Node = require_Node();
  var toJS = require_toJS();
  var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";

  class Scalar extends Node.NodeBase {
    constructor(value) {
      super(identity.SCALAR);
      this.value = value;
    }
    toJSON(arg, ctx) {
      return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
    }
    toString() {
      return String(this.value);
    }
  }
  Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
  Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
  Scalar.PLAIN = "PLAIN";
  Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
  Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
  exports.Scalar = Scalar;
  exports.isScalarValue = isScalarValue;
});

// node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS((exports) => {
  var Alias = require_Alias();
  var identity = require_identity();
  var Scalar = require_Scalar();
  var defaultTagPrefix = "tag:yaml.org,2002:";
  function findTagObject(value, tagName, tags) {
    if (tagName) {
      const match = tags.filter((t) => t.tag === tagName);
      const tagObj = match.find((t) => !t.format) ?? match[0];
      if (!tagObj)
        throw new Error(`Tag ${tagName} not found`);
      return tagObj;
    }
    return tags.find((t) => t.identify?.(value) && !t.format);
  }
  function createNode(value, tagName, ctx) {
    if (identity.isDocument(value))
      value = value.contents;
    if (identity.isNode(value))
      return value;
    if (identity.isPair(value)) {
      const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
      map.items.push(value);
      return map;
    }
    if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
      value = value.valueOf();
    }
    const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
    let ref = undefined;
    if (aliasDuplicateObjects && value && typeof value === "object") {
      ref = sourceObjects.get(value);
      if (ref) {
        if (!ref.anchor)
          ref.anchor = onAnchor(value);
        return new Alias.Alias(ref.anchor);
      } else {
        ref = { anchor: null, node: null };
        sourceObjects.set(value, ref);
      }
    }
    if (tagName?.startsWith("!!"))
      tagName = defaultTagPrefix + tagName.slice(2);
    let tagObj = findTagObject(value, tagName, schema.tags);
    if (!tagObj) {
      if (value && typeof value.toJSON === "function") {
        value = value.toJSON();
      }
      if (!value || typeof value !== "object") {
        const node2 = new Scalar.Scalar(value);
        if (ref)
          ref.node = node2;
        return node2;
      }
      tagObj = value instanceof Map ? schema[identity.MAP] : (Symbol.iterator in Object(value)) ? schema[identity.SEQ] : schema[identity.MAP];
    }
    if (onTagObj) {
      onTagObj(tagObj);
      delete ctx.onTagObj;
    }
    const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
    if (tagName)
      node.tag = tagName;
    else if (!tagObj.default)
      node.tag = tagObj.tag;
    if (ref)
      ref.node = node;
    return node;
  }
  exports.createNode = createNode;
});

// node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS((exports) => {
  var createNode = require_createNode();
  var identity = require_identity();
  var Node = require_Node();
  function collectionFromPath(schema, path, value) {
    let v = value;
    for (let i = path.length - 1;i >= 0; --i) {
      const k = path[i];
      if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
        const a = [];
        a[k] = v;
        v = a;
      } else {
        v = new Map([[k, v]]);
      }
    }
    return createNode.createNode(v, undefined, {
      aliasDuplicateObjects: false,
      keepUndefined: false,
      onAnchor: () => {
        throw new Error("This should not happen, please report a bug.");
      },
      schema,
      sourceObjects: new Map
    });
  }
  var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;

  class Collection extends Node.NodeBase {
    constructor(type, schema) {
      super(type);
      Object.defineProperty(this, "schema", {
        value: schema,
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
    clone(schema) {
      const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
      if (schema)
        copy.schema = schema;
      copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    addIn(path, value) {
      if (isEmptyPath(path))
        this.add(value);
      else {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (identity.isCollection(node))
          node.addIn(rest, value);
        else if (node === undefined && this.schema)
          this.set(key, collectionFromPath(this.schema, rest, value));
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
    }
    deleteIn(path) {
      const [key, ...rest] = path;
      if (rest.length === 0)
        return this.delete(key);
      const node = this.get(key, true);
      if (identity.isCollection(node))
        return node.deleteIn(rest);
      else
        throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
    }
    getIn(path, keepScalar) {
      const [key, ...rest] = path;
      const node = this.get(key, true);
      if (rest.length === 0)
        return !keepScalar && identity.isScalar(node) ? node.value : node;
      else
        return identity.isCollection(node) ? node.getIn(rest, keepScalar) : undefined;
    }
    hasAllNullValues(allowScalar) {
      return this.items.every((node) => {
        if (!identity.isPair(node))
          return false;
        const n = node.value;
        return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
      });
    }
    hasIn(path) {
      const [key, ...rest] = path;
      if (rest.length === 0)
        return this.has(key);
      const node = this.get(key, true);
      return identity.isCollection(node) ? node.hasIn(rest) : false;
    }
    setIn(path, value) {
      const [key, ...rest] = path;
      if (rest.length === 0) {
        this.set(key, value);
      } else {
        const node = this.get(key, true);
        if (identity.isCollection(node))
          node.setIn(rest, value);
        else if (node === undefined && this.schema)
          this.set(key, collectionFromPath(this.schema, rest, value));
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
    }
  }
  exports.Collection = Collection;
  exports.collectionFromPath = collectionFromPath;
  exports.isEmptyPath = isEmptyPath;
});

// node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS((exports) => {
  var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
  function indentComment(comment, indent) {
    if (/^\n+$/.test(comment))
      return comment.substring(1);
    return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
  }
  var lineComment = (str, indent, comment) => str.endsWith(`
`) ? indentComment(comment, indent) : comment.includes(`
`) ? `
` + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
  exports.indentComment = indentComment;
  exports.lineComment = lineComment;
  exports.stringifyComment = stringifyComment;
});

// node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS((exports) => {
  var FOLD_FLOW = "flow";
  var FOLD_BLOCK = "block";
  var FOLD_QUOTED = "quoted";
  function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
    if (!lineWidth || lineWidth < 0)
      return text;
    if (lineWidth < minContentWidth)
      minContentWidth = 0;
    const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
    if (text.length <= endStep)
      return text;
    const folds = [];
    const escapedFolds = {};
    let end = lineWidth - indent.length;
    if (typeof indentAtStart === "number") {
      if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
        folds.push(0);
      else
        end = lineWidth - indentAtStart;
    }
    let split = undefined;
    let prev = undefined;
    let overflow = false;
    let i = -1;
    let escStart = -1;
    let escEnd = -1;
    if (mode === FOLD_BLOCK) {
      i = consumeMoreIndentedLines(text, i, indent.length);
      if (i !== -1)
        end = i + endStep;
    }
    for (let ch;ch = text[i += 1]; ) {
      if (mode === FOLD_QUOTED && ch === "\\") {
        escStart = i;
        switch (text[i + 1]) {
          case "x":
            i += 3;
            break;
          case "u":
            i += 5;
            break;
          case "U":
            i += 9;
            break;
          default:
            i += 1;
        }
        escEnd = i;
      }
      if (ch === `
`) {
        if (mode === FOLD_BLOCK)
          i = consumeMoreIndentedLines(text, i, indent.length);
        end = i + indent.length + endStep;
        split = undefined;
      } else {
        if (ch === " " && prev && prev !== " " && prev !== `
` && prev !== "\t") {
          const next = text[i + 1];
          if (next && next !== " " && next !== `
` && next !== "\t")
            split = i;
        }
        if (i >= end) {
          if (split) {
            folds.push(split);
            end = split + endStep;
            split = undefined;
          } else if (mode === FOLD_QUOTED) {
            while (prev === " " || prev === "\t") {
              prev = ch;
              ch = text[i += 1];
              overflow = true;
            }
            const j = i > escEnd + 1 ? i - 2 : escStart - 1;
            if (escapedFolds[j])
              return text;
            folds.push(j);
            escapedFolds[j] = true;
            end = j + endStep;
            split = undefined;
          } else {
            overflow = true;
          }
        }
      }
      prev = ch;
    }
    if (overflow && onOverflow)
      onOverflow();
    if (folds.length === 0)
      return text;
    if (onFold)
      onFold();
    let res = text.slice(0, folds[0]);
    for (let i2 = 0;i2 < folds.length; ++i2) {
      const fold = folds[i2];
      const end2 = folds[i2 + 1] || text.length;
      if (fold === 0)
        res = `
${indent}${text.slice(0, end2)}`;
      else {
        if (mode === FOLD_QUOTED && escapedFolds[fold])
          res += `${text[fold]}\\`;
        res += `
${indent}${text.slice(fold + 1, end2)}`;
      }
    }
    return res;
  }
  function consumeMoreIndentedLines(text, i, indent) {
    let end = i;
    let start = i + 1;
    let ch = text[start];
    while (ch === " " || ch === "\t") {
      if (i < start + indent) {
        ch = text[++i];
      } else {
        do {
          ch = text[++i];
        } while (ch && ch !== `
`);
        end = i;
        start = i + 1;
        ch = text[start];
      }
    }
    return end;
  }
  exports.FOLD_BLOCK = FOLD_BLOCK;
  exports.FOLD_FLOW = FOLD_FLOW;
  exports.FOLD_QUOTED = FOLD_QUOTED;
  exports.foldFlowLines = foldFlowLines;
});

// node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var foldFlowLines = require_foldFlowLines();
  var getFoldOptions = (ctx, isBlock) => ({
    indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
    lineWidth: ctx.options.lineWidth,
    minContentWidth: ctx.options.minContentWidth
  });
  var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
  function lineLengthOverLimit(str, lineWidth, indentLength) {
    if (!lineWidth || lineWidth < 0)
      return false;
    const limit = lineWidth - indentLength;
    const strLen = str.length;
    if (strLen <= limit)
      return false;
    for (let i = 0, start = 0;i < strLen; ++i) {
      if (str[i] === `
`) {
        if (i - start > limit)
          return true;
        start = i + 1;
        if (strLen - start <= limit)
          return false;
      }
    }
    return true;
  }
  function doubleQuotedString(value, ctx) {
    const json = JSON.stringify(value);
    if (ctx.options.doubleQuotedAsJSON)
      return json;
    const { implicitKey } = ctx;
    const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
    const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
    let str = "";
    let start = 0;
    for (let i = 0, ch = json[i];ch; ch = json[++i]) {
      if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
        str += json.slice(start, i) + "\\ ";
        i += 1;
        start = i;
        ch = "\\";
      }
      if (ch === "\\")
        switch (json[i + 1]) {
          case "u":
            {
              str += json.slice(start, i);
              const code = json.substr(i + 2, 4);
              switch (code) {
                case "0000":
                  str += "\\0";
                  break;
                case "0007":
                  str += "\\a";
                  break;
                case "000b":
                  str += "\\v";
                  break;
                case "001b":
                  str += "\\e";
                  break;
                case "0085":
                  str += "\\N";
                  break;
                case "00a0":
                  str += "\\_";
                  break;
                case "2028":
                  str += "\\L";
                  break;
                case "2029":
                  str += "\\P";
                  break;
                default:
                  if (code.substr(0, 2) === "00")
                    str += "\\x" + code.substr(2);
                  else
                    str += json.substr(i, 6);
              }
              i += 5;
              start = i + 1;
            }
            break;
          case "n":
            if (implicitKey || json[i + 2] === '"' || json.length < minMultiLineLength) {
              i += 1;
            } else {
              str += json.slice(start, i) + `

`;
              while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== '"') {
                str += `
`;
                i += 2;
              }
              str += indent;
              if (json[i + 2] === " ")
                str += "\\";
              i += 1;
              start = i + 1;
            }
            break;
          default:
            i += 1;
        }
    }
    str = start ? str + json.slice(start) : json;
    return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
  }
  function singleQuotedString(value, ctx) {
    if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes(`
`) || /[ \t]\n|\n[ \t]/.test(value))
      return doubleQuotedString(value, ctx);
    const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
    const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
    return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
  }
  function quotedString(value, ctx) {
    const { singleQuote } = ctx.options;
    let qs;
    if (singleQuote === false)
      qs = doubleQuotedString;
    else {
      const hasDouble = value.includes('"');
      const hasSingle = value.includes("'");
      if (hasDouble && !hasSingle)
        qs = singleQuotedString;
      else if (hasSingle && !hasDouble)
        qs = doubleQuotedString;
      else
        qs = singleQuote ? singleQuotedString : doubleQuotedString;
    }
    return qs(value, ctx);
  }
  var blockEndNewlines;
  try {
    blockEndNewlines = new RegExp(`(^|(?<!
))
+(?!
|$)`, "g");
  } catch {
    blockEndNewlines = /\n+(?!\n|$)/g;
  }
  function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
    const { blockQuote, commentString, lineWidth } = ctx.options;
    if (!blockQuote || /\n[\t ]+$/.test(value) || /^\s*$/.test(value)) {
      return quotedString(value, ctx);
    }
    const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
    const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
    if (!value)
      return literal ? `|
` : `>
`;
    let chomp;
    let endStart;
    for (endStart = value.length;endStart > 0; --endStart) {
      const ch = value[endStart - 1];
      if (ch !== `
` && ch !== "\t" && ch !== " ")
        break;
    }
    let end = value.substring(endStart);
    const endNlPos = end.indexOf(`
`);
    if (endNlPos === -1) {
      chomp = "-";
    } else if (value === end || endNlPos !== end.length - 1) {
      chomp = "+";
      if (onChompKeep)
        onChompKeep();
    } else {
      chomp = "";
    }
    if (end) {
      value = value.slice(0, -end.length);
      if (end[end.length - 1] === `
`)
        end = end.slice(0, -1);
      end = end.replace(blockEndNewlines, `$&${indent}`);
    }
    let startWithSpace = false;
    let startEnd;
    let startNlPos = -1;
    for (startEnd = 0;startEnd < value.length; ++startEnd) {
      const ch = value[startEnd];
      if (ch === " ")
        startWithSpace = true;
      else if (ch === `
`)
        startNlPos = startEnd;
      else
        break;
    }
    let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
    if (start) {
      value = value.substring(start.length);
      start = start.replace(/\n+/g, `$&${indent}`);
    }
    const indentSize = indent ? "2" : "1";
    let header = (startWithSpace ? indentSize : "") + chomp;
    if (comment) {
      header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
      if (onComment)
        onComment();
    }
    if (!literal) {
      const foldedValue = value.replace(/\n+/g, `
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
      let literalFallback = false;
      const foldOptions = getFoldOptions(ctx, true);
      if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
        foldOptions.onOverflow = () => {
          literalFallback = true;
        };
      }
      const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
      if (!literalFallback)
        return `>${header}
${indent}${body}`;
    }
    value = value.replace(/\n+/g, `$&${indent}`);
    return `|${header}
${indent}${start}${value}${end}`;
  }
  function plainString(item, ctx, onComment, onChompKeep) {
    const { type, value } = item;
    const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
    if (implicitKey && value.includes(`
`) || inFlow && /[[\]{},]/.test(value)) {
      return quotedString(value, ctx);
    }
    if (!value || /^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
      return implicitKey || inFlow || !value.includes(`
`) ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
    }
    if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes(`
`)) {
      return blockString(item, ctx, onComment, onChompKeep);
    }
    if (containsDocumentMarker(value)) {
      if (indent === "") {
        ctx.forceBlockIndent = true;
        return blockString(item, ctx, onComment, onChompKeep);
      } else if (implicitKey && indent === indentStep) {
        return quotedString(value, ctx);
      }
    }
    const str = value.replace(/\n+/g, `$&
${indent}`);
    if (actualString) {
      const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
      const { compat, tags } = ctx.doc.schema;
      if (tags.some(test) || compat?.some(test))
        return quotedString(value, ctx);
    }
    return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
  }
  function stringifyString(item, ctx, onComment, onChompKeep) {
    const { implicitKey, inFlow } = ctx;
    const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
    let { type } = item;
    if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
      if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
        type = Scalar.Scalar.QUOTE_DOUBLE;
    }
    const _stringify = (_type) => {
      switch (_type) {
        case Scalar.Scalar.BLOCK_FOLDED:
        case Scalar.Scalar.BLOCK_LITERAL:
          return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
        case Scalar.Scalar.QUOTE_DOUBLE:
          return doubleQuotedString(ss.value, ctx);
        case Scalar.Scalar.QUOTE_SINGLE:
          return singleQuotedString(ss.value, ctx);
        case Scalar.Scalar.PLAIN:
          return plainString(ss, ctx, onComment, onChompKeep);
        default:
          return null;
      }
    };
    let res = _stringify(type);
    if (res === null) {
      const { defaultKeyType, defaultStringType } = ctx.options;
      const t = implicitKey && defaultKeyType || defaultStringType;
      res = _stringify(t);
      if (res === null)
        throw new Error(`Unsupported default string type ${t}`);
    }
    return res;
  }
  exports.stringifyString = stringifyString;
});

// node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS((exports) => {
  var anchors = require_anchors();
  var identity = require_identity();
  var stringifyComment = require_stringifyComment();
  var stringifyString = require_stringifyString();
  function createStringifyContext(doc, options) {
    const opt = Object.assign({
      blockQuote: true,
      commentString: stringifyComment.stringifyComment,
      defaultKeyType: null,
      defaultStringType: "PLAIN",
      directives: null,
      doubleQuotedAsJSON: false,
      doubleQuotedMinMultiLineLength: 40,
      falseStr: "false",
      flowCollectionPadding: true,
      indentSeq: true,
      lineWidth: 80,
      minContentWidth: 20,
      nullStr: "null",
      simpleKeys: false,
      singleQuote: null,
      trueStr: "true",
      verifyAliasOrder: true
    }, doc.schema.toStringOptions, options);
    let inFlow;
    switch (opt.collectionStyle) {
      case "block":
        inFlow = false;
        break;
      case "flow":
        inFlow = true;
        break;
      default:
        inFlow = null;
    }
    return {
      anchors: new Set,
      doc,
      flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
      indent: "",
      indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
      inFlow,
      options: opt
    };
  }
  function getTagObject(tags, item) {
    if (item.tag) {
      const match = tags.filter((t) => t.tag === item.tag);
      if (match.length > 0)
        return match.find((t) => t.format === item.format) ?? match[0];
    }
    let tagObj = undefined;
    let obj;
    if (identity.isScalar(item)) {
      obj = item.value;
      let match = tags.filter((t) => t.identify?.(obj));
      if (match.length > 1) {
        const testMatch = match.filter((t) => t.test);
        if (testMatch.length > 0)
          match = testMatch;
      }
      tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
    } else {
      obj = item;
      tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
    }
    if (!tagObj) {
      const name = obj?.constructor?.name ?? typeof obj;
      throw new Error(`Tag not resolved for ${name} value`);
    }
    return tagObj;
  }
  function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
    if (!doc.directives)
      return "";
    const props = [];
    const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
    if (anchor && anchors.anchorIsValid(anchor)) {
      anchors$1.add(anchor);
      props.push(`&${anchor}`);
    }
    const tag = node.tag ? node.tag : tagObj.default ? null : tagObj.tag;
    if (tag)
      props.push(doc.directives.tagString(tag));
    return props.join(" ");
  }
  function stringify(item, ctx, onComment, onChompKeep) {
    if (identity.isPair(item))
      return item.toString(ctx, onComment, onChompKeep);
    if (identity.isAlias(item)) {
      if (ctx.doc.directives)
        return item.toString(ctx);
      if (ctx.resolvedAliases?.has(item)) {
        throw new TypeError(`Cannot stringify circular structure without alias nodes`);
      } else {
        if (ctx.resolvedAliases)
          ctx.resolvedAliases.add(item);
        else
          ctx.resolvedAliases = new Set([item]);
        item = item.resolve(ctx.doc);
      }
    }
    let tagObj = undefined;
    const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
    if (!tagObj)
      tagObj = getTagObject(ctx.doc.schema.tags, node);
    const props = stringifyProps(node, tagObj, ctx);
    if (props.length > 0)
      ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
    const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
    if (!props)
      return str;
    return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
  }
  exports.createStringifyContext = createStringifyContext;
  exports.stringify = stringify;
});

// node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS((exports) => {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var stringify = require_stringify();
  var stringifyComment = require_stringifyComment();
  function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
    const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
    let keyComment = identity.isNode(key) && key.comment || null;
    if (simpleKeys) {
      if (keyComment) {
        throw new Error("With simple keys, key nodes cannot have comments");
      }
      if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
        const msg = "With simple keys, collection cannot be used as a key value";
        throw new Error(msg);
      }
    }
    let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
    ctx = Object.assign({}, ctx, {
      allNullValues: false,
      implicitKey: !explicitKey && (simpleKeys || !allNullValues),
      indent: indent + indentStep
    });
    let keyCommentDone = false;
    let chompKeep = false;
    let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
    if (!explicitKey && !ctx.inFlow && str.length > 1024) {
      if (simpleKeys)
        throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
      explicitKey = true;
    }
    if (ctx.inFlow) {
      if (allNullValues || value == null) {
        if (keyCommentDone && onComment)
          onComment();
        return str === "" ? "?" : explicitKey ? `? ${str}` : str;
      }
    } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
      str = `? ${str}`;
      if (keyComment && !keyCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    if (keyCommentDone)
      keyComment = null;
    if (explicitKey) {
      if (keyComment)
        str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      str = `? ${str}
${indent}:`;
    } else {
      str = `${str}:`;
      if (keyComment)
        str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
    }
    let vsb, vcb, valueComment;
    if (identity.isNode(value)) {
      vsb = !!value.spaceBefore;
      vcb = value.commentBefore;
      valueComment = value.comment;
    } else {
      vsb = false;
      vcb = null;
      valueComment = null;
      if (value && typeof value === "object")
        value = doc.createNode(value);
    }
    ctx.implicitKey = false;
    if (!explicitKey && !keyComment && identity.isScalar(value))
      ctx.indentAtStart = str.length + 1;
    chompKeep = false;
    if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
      ctx.indent = ctx.indent.substring(2);
    }
    let valueCommentDone = false;
    const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
    let ws = " ";
    if (keyComment || vsb || vcb) {
      ws = vsb ? `
` : "";
      if (vcb) {
        const cs = commentString(vcb);
        ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
      }
      if (valueStr === "" && !ctx.inFlow) {
        if (ws === `
`)
          ws = `

`;
      } else {
        ws += `
${ctx.indent}`;
      }
    } else if (!explicitKey && identity.isCollection(value)) {
      const vs0 = valueStr[0];
      const nl0 = valueStr.indexOf(`
`);
      const hasNewline = nl0 !== -1;
      const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
      if (hasNewline || !flow) {
        let hasPropsLine = false;
        if (hasNewline && (vs0 === "&" || vs0 === "!")) {
          let sp0 = valueStr.indexOf(" ");
          if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
            sp0 = valueStr.indexOf(" ", sp0 + 1);
          }
          if (sp0 === -1 || nl0 < sp0)
            hasPropsLine = true;
        }
        if (!hasPropsLine)
          ws = `
${ctx.indent}`;
      }
    } else if (valueStr === "" || valueStr[0] === `
`) {
      ws = "";
    }
    str += ws + valueStr;
    if (ctx.inFlow) {
      if (valueCommentDone && onComment)
        onComment();
    } else if (valueComment && !valueCommentDone) {
      str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
    } else if (chompKeep && onChompKeep) {
      onChompKeep();
    }
    return str;
  }
  exports.stringifyPair = stringifyPair;
});

// node_modules/yaml/dist/log.js
var require_log = __commonJS((exports) => {
  var node_process = __require("node:process");
  function debug(logLevel, ...messages) {
    if (logLevel === "debug")
      console.log(...messages);
  }
  function warn(logLevel, warning) {
    if (logLevel === "debug" || logLevel === "warn") {
      if (typeof node_process.emitWarning === "function")
        node_process.emitWarning(warning);
      else
        console.warn(warning);
    }
  }
  exports.debug = debug;
  exports.warn = warn;
});

// node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS((exports) => {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var MERGE_KEY = "<<";
  var merge = {
    identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
    default: "key",
    tag: "tag:yaml.org,2002:merge",
    test: /^<<$/,
    resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
      addToJSMap: addMergeToJSMap
    }),
    stringify: () => MERGE_KEY
  };
  var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
  function addMergeToJSMap(ctx, map, value) {
    value = ctx && identity.isAlias(value) ? value.resolve(ctx.doc) : value;
    if (identity.isSeq(value))
      for (const it of value.items)
        mergeValue(ctx, map, it);
    else if (Array.isArray(value))
      for (const it of value)
        mergeValue(ctx, map, it);
    else
      mergeValue(ctx, map, value);
  }
  function mergeValue(ctx, map, value) {
    const source = ctx && identity.isAlias(value) ? value.resolve(ctx.doc) : value;
    if (!identity.isMap(source))
      throw new Error("Merge sources must be maps or map aliases");
    const srcMap = source.toJSON(null, ctx, Map);
    for (const [key, value2] of srcMap) {
      if (map instanceof Map) {
        if (!map.has(key))
          map.set(key, value2);
      } else if (map instanceof Set) {
        map.add(key);
      } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
        Object.defineProperty(map, key, {
          value: value2,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
    }
    return map;
  }
  exports.addMergeToJSMap = addMergeToJSMap;
  exports.isMergeKey = isMergeKey;
  exports.merge = merge;
});

// node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS((exports) => {
  var log = require_log();
  var merge = require_merge();
  var stringify = require_stringify();
  var identity = require_identity();
  var toJS = require_toJS();
  function addPairToJSMap(ctx, map, { key, value }) {
    if (identity.isNode(key) && key.addToJSMap)
      key.addToJSMap(ctx, map, value);
    else if (merge.isMergeKey(ctx, key))
      merge.addMergeToJSMap(ctx, map, value);
    else {
      const jsKey = toJS.toJS(key, "", ctx);
      if (map instanceof Map) {
        map.set(jsKey, toJS.toJS(value, jsKey, ctx));
      } else if (map instanceof Set) {
        map.add(jsKey);
      } else {
        const stringKey = stringifyKey(key, jsKey, ctx);
        const jsValue = toJS.toJS(value, stringKey, ctx);
        if (stringKey in map)
          Object.defineProperty(map, stringKey, {
            value: jsValue,
            writable: true,
            enumerable: true,
            configurable: true
          });
        else
          map[stringKey] = jsValue;
      }
    }
    return map;
  }
  function stringifyKey(key, jsKey, ctx) {
    if (jsKey === null)
      return "";
    if (typeof jsKey !== "object")
      return String(jsKey);
    if (identity.isNode(key) && ctx?.doc) {
      const strCtx = stringify.createStringifyContext(ctx.doc, {});
      strCtx.anchors = new Set;
      for (const node of ctx.anchors.keys())
        strCtx.anchors.add(node.anchor);
      strCtx.inFlow = true;
      strCtx.inStringifyKey = true;
      const strKey = key.toString(strCtx);
      if (!ctx.mapKeyWarned) {
        let jsonStr = JSON.stringify(strKey);
        if (jsonStr.length > 40)
          jsonStr = jsonStr.substring(0, 36) + '..."';
        log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
        ctx.mapKeyWarned = true;
      }
      return strKey;
    }
    return JSON.stringify(jsKey);
  }
  exports.addPairToJSMap = addPairToJSMap;
});

// node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS((exports) => {
  var createNode = require_createNode();
  var stringifyPair = require_stringifyPair();
  var addPairToJSMap = require_addPairToJSMap();
  var identity = require_identity();
  function createPair(key, value, ctx) {
    const k = createNode.createNode(key, undefined, ctx);
    const v = createNode.createNode(value, undefined, ctx);
    return new Pair(k, v);
  }

  class Pair {
    constructor(key, value = null) {
      Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
      this.key = key;
      this.value = value;
    }
    clone(schema) {
      let { key, value } = this;
      if (identity.isNode(key))
        key = key.clone(schema);
      if (identity.isNode(value))
        value = value.clone(schema);
      return new Pair(key, value);
    }
    toJSON(_, ctx) {
      const pair = ctx?.mapAsMap ? new Map : {};
      return addPairToJSMap.addPairToJSMap(ctx, pair, this);
    }
    toString(ctx, onComment, onChompKeep) {
      return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
    }
  }
  exports.Pair = Pair;
  exports.createPair = createPair;
});

// node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS((exports) => {
  var identity = require_identity();
  var stringify = require_stringify();
  var stringifyComment = require_stringifyComment();
  function stringifyCollection(collection, ctx, options) {
    const flow = ctx.inFlow ?? collection.flow;
    const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
    return stringify2(collection, ctx, options);
  }
  function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
    const { indent, options: { commentString } } = ctx;
    const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
    let chompKeep = false;
    const lines = [];
    for (let i = 0;i < items.length; ++i) {
      const item = items[i];
      let comment2 = null;
      if (identity.isNode(item)) {
        if (!chompKeep && item.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
        if (item.comment)
          comment2 = item.comment;
      } else if (identity.isPair(item)) {
        const ik = identity.isNode(item.key) ? item.key : null;
        if (ik) {
          if (!chompKeep && ik.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
        }
      }
      chompKeep = false;
      let str2 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
      if (comment2)
        str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment2));
      if (chompKeep && comment2)
        chompKeep = false;
      lines.push(blockItemPrefix + str2);
    }
    let str;
    if (lines.length === 0) {
      str = flowChars.start + flowChars.end;
    } else {
      str = lines[0];
      for (let i = 1;i < lines.length; ++i) {
        const line = lines[i];
        str += line ? `
${indent}${line}` : `
`;
      }
    }
    if (comment) {
      str += `
` + stringifyComment.indentComment(commentString(comment), indent);
      if (onComment)
        onComment();
    } else if (chompKeep && onChompKeep)
      onChompKeep();
    return str;
  }
  function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
    const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
    itemIndent += indentStep;
    const itemCtx = Object.assign({}, ctx, {
      indent: itemIndent,
      inFlow: true,
      type: null
    });
    let reqNewline = false;
    let linesAtValue = 0;
    const lines = [];
    for (let i = 0;i < items.length; ++i) {
      const item = items[i];
      let comment = null;
      if (identity.isNode(item)) {
        if (item.spaceBefore)
          lines.push("");
        addCommentBefore(ctx, lines, item.commentBefore, false);
        if (item.comment)
          comment = item.comment;
      } else if (identity.isPair(item)) {
        const ik = identity.isNode(item.key) ? item.key : null;
        if (ik) {
          if (ik.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, ik.commentBefore, false);
          if (ik.comment)
            reqNewline = true;
        }
        const iv = identity.isNode(item.value) ? item.value : null;
        if (iv) {
          if (iv.comment)
            comment = iv.comment;
          if (iv.commentBefore)
            reqNewline = true;
        } else if (item.value == null && ik?.comment) {
          comment = ik.comment;
        }
      }
      if (comment)
        reqNewline = true;
      let str = stringify.stringify(item, itemCtx, () => comment = null);
      if (i < items.length - 1)
        str += ",";
      if (comment)
        str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
      if (!reqNewline && (lines.length > linesAtValue || str.includes(`
`)))
        reqNewline = true;
      lines.push(str);
      linesAtValue = lines.length;
    }
    const { start, end } = flowChars;
    if (lines.length === 0) {
      return start + end;
    } else {
      if (!reqNewline) {
        const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
        reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
      }
      if (reqNewline) {
        let str = start;
        for (const line of lines)
          str += line ? `
${indentStep}${indent}${line}` : `
`;
        return `${str}
${indent}${end}`;
      } else {
        return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
      }
    }
  }
  function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
    if (comment && chompKeep)
      comment = comment.replace(/^\n+/, "");
    if (comment) {
      const ic = stringifyComment.indentComment(commentString(comment), indent);
      lines.push(ic.trimStart());
    }
  }
  exports.stringifyCollection = stringifyCollection;
});

// node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS((exports) => {
  var stringifyCollection = require_stringifyCollection();
  var addPairToJSMap = require_addPairToJSMap();
  var Collection = require_Collection();
  var identity = require_identity();
  var Pair = require_Pair();
  var Scalar = require_Scalar();
  function findPair(items, key) {
    const k = identity.isScalar(key) ? key.value : key;
    for (const it of items) {
      if (identity.isPair(it)) {
        if (it.key === key || it.key === k)
          return it;
        if (identity.isScalar(it.key) && it.key.value === k)
          return it;
      }
    }
    return;
  }

  class YAMLMap extends Collection.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:map";
    }
    constructor(schema) {
      super(identity.MAP, schema);
      this.items = [];
    }
    static from(schema, obj, ctx) {
      const { keepUndefined, replacer } = ctx;
      const map = new this(schema);
      const add = (key, value) => {
        if (typeof replacer === "function")
          value = replacer.call(obj, key, value);
        else if (Array.isArray(replacer) && !replacer.includes(key))
          return;
        if (value !== undefined || keepUndefined)
          map.items.push(Pair.createPair(key, value, ctx));
      };
      if (obj instanceof Map) {
        for (const [key, value] of obj)
          add(key, value);
      } else if (obj && typeof obj === "object") {
        for (const key of Object.keys(obj))
          add(key, obj[key]);
      }
      if (typeof schema.sortMapEntries === "function") {
        map.items.sort(schema.sortMapEntries);
      }
      return map;
    }
    add(pair, overwrite) {
      let _pair;
      if (identity.isPair(pair))
        _pair = pair;
      else if (!pair || typeof pair !== "object" || !("key" in pair)) {
        _pair = new Pair.Pair(pair, pair?.value);
      } else
        _pair = new Pair.Pair(pair.key, pair.value);
      const prev = findPair(this.items, _pair.key);
      const sortEntries = this.schema?.sortMapEntries;
      if (prev) {
        if (!overwrite)
          throw new Error(`Key ${_pair.key} already set`);
        if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
          prev.value.value = _pair.value;
        else
          prev.value = _pair.value;
      } else if (sortEntries) {
        const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
        if (i === -1)
          this.items.push(_pair);
        else
          this.items.splice(i, 0, _pair);
      } else {
        this.items.push(_pair);
      }
    }
    delete(key) {
      const it = findPair(this.items, key);
      if (!it)
        return false;
      const del = this.items.splice(this.items.indexOf(it), 1);
      return del.length > 0;
    }
    get(key, keepScalar) {
      const it = findPair(this.items, key);
      const node = it?.value;
      return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? undefined;
    }
    has(key) {
      return !!findPair(this.items, key);
    }
    set(key, value) {
      this.add(new Pair.Pair(key, value), true);
    }
    toJSON(_, ctx, Type) {
      const map = Type ? new Type : ctx?.mapAsMap ? new Map : {};
      if (ctx?.onCreate)
        ctx.onCreate(map);
      for (const item of this.items)
        addPairToJSMap.addPairToJSMap(ctx, map, item);
      return map;
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      for (const item of this.items) {
        if (!identity.isPair(item))
          throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
      }
      if (!ctx.allNullValues && this.hasAllNullValues(false))
        ctx = Object.assign({}, ctx, { allNullValues: true });
      return stringifyCollection.stringifyCollection(this, ctx, {
        blockItemPrefix: "",
        flowChars: { start: "{", end: "}" },
        itemIndent: ctx.indent || "",
        onChompKeep,
        onComment
      });
    }
  }
  exports.YAMLMap = YAMLMap;
  exports.findPair = findPair;
});

// node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS((exports) => {
  var identity = require_identity();
  var YAMLMap = require_YAMLMap();
  var map = {
    collection: "map",
    default: true,
    nodeClass: YAMLMap.YAMLMap,
    tag: "tag:yaml.org,2002:map",
    resolve(map2, onError) {
      if (!identity.isMap(map2))
        onError("Expected a mapping for this tag");
      return map2;
    },
    createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
  };
  exports.map = map;
});

// node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS((exports) => {
  var createNode = require_createNode();
  var stringifyCollection = require_stringifyCollection();
  var Collection = require_Collection();
  var identity = require_identity();
  var Scalar = require_Scalar();
  var toJS = require_toJS();

  class YAMLSeq extends Collection.Collection {
    static get tagName() {
      return "tag:yaml.org,2002:seq";
    }
    constructor(schema) {
      super(identity.SEQ, schema);
      this.items = [];
    }
    add(value) {
      this.items.push(value);
    }
    delete(key) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        return false;
      const del = this.items.splice(idx, 1);
      return del.length > 0;
    }
    get(key, keepScalar) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        return;
      const it = this.items[idx];
      return !keepScalar && identity.isScalar(it) ? it.value : it;
    }
    has(key) {
      const idx = asItemIndex(key);
      return typeof idx === "number" && idx < this.items.length;
    }
    set(key, value) {
      const idx = asItemIndex(key);
      if (typeof idx !== "number")
        throw new Error(`Expected a valid index, not ${key}.`);
      const prev = this.items[idx];
      if (identity.isScalar(prev) && Scalar.isScalarValue(value))
        prev.value = value;
      else
        this.items[idx] = value;
    }
    toJSON(_, ctx) {
      const seq = [];
      if (ctx?.onCreate)
        ctx.onCreate(seq);
      let i = 0;
      for (const item of this.items)
        seq.push(toJS.toJS(item, String(i++), ctx));
      return seq;
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      return stringifyCollection.stringifyCollection(this, ctx, {
        blockItemPrefix: "- ",
        flowChars: { start: "[", end: "]" },
        itemIndent: (ctx.indent || "") + "  ",
        onChompKeep,
        onComment
      });
    }
    static from(schema, obj, ctx) {
      const { replacer } = ctx;
      const seq = new this(schema);
      if (obj && Symbol.iterator in Object(obj)) {
        let i = 0;
        for (let it of obj) {
          if (typeof replacer === "function") {
            const key = obj instanceof Set ? it : String(i++);
            it = replacer.call(obj, key, it);
          }
          seq.items.push(createNode.createNode(it, undefined, ctx));
        }
      }
      return seq;
    }
  }
  function asItemIndex(key) {
    let idx = identity.isScalar(key) ? key.value : key;
    if (idx && typeof idx === "string")
      idx = Number(idx);
    return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
  }
  exports.YAMLSeq = YAMLSeq;
});

// node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS((exports) => {
  var identity = require_identity();
  var YAMLSeq = require_YAMLSeq();
  var seq = {
    collection: "seq",
    default: true,
    nodeClass: YAMLSeq.YAMLSeq,
    tag: "tag:yaml.org,2002:seq",
    resolve(seq2, onError) {
      if (!identity.isSeq(seq2))
        onError("Expected a sequence for this tag");
      return seq2;
    },
    createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
  };
  exports.seq = seq;
});

// node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS((exports) => {
  var stringifyString = require_stringifyString();
  var string = {
    identify: (value) => typeof value === "string",
    default: true,
    tag: "tag:yaml.org,2002:str",
    resolve: (str) => str,
    stringify(item, ctx, onComment, onChompKeep) {
      ctx = Object.assign({ actualString: true }, ctx);
      return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
    }
  };
  exports.string = string;
});

// node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var nullTag = {
    identify: (value) => value == null,
    createNode: () => new Scalar.Scalar(null),
    default: true,
    tag: "tag:yaml.org,2002:null",
    test: /^(?:~|[Nn]ull|NULL)?$/,
    resolve: () => new Scalar.Scalar(null),
    stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
  };
  exports.nullTag = nullTag;
});

// node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var boolTag = {
    identify: (value) => typeof value === "boolean",
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
    resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
    stringify({ source, value }, ctx) {
      if (source && boolTag.test.test(source)) {
        const sv = source[0] === "t" || source[0] === "T";
        if (value === sv)
          return source;
      }
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
  };
  exports.boolTag = boolTag;
});

// node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS((exports) => {
  function stringifyNumber({ format, minFractionDigits, tag, value }) {
    if (typeof value === "bigint")
      return String(value);
    const num = typeof value === "number" ? value : Number(value);
    if (!isFinite(num))
      return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
    let n = JSON.stringify(value);
    if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^\d/.test(n)) {
      let i = n.indexOf(".");
      if (i < 0) {
        i = n.length;
        n += ".";
      }
      let d = minFractionDigits - (n.length - i - 1);
      while (d-- > 0)
        n += "0";
    }
    return n;
  }
  exports.stringifyNumber = stringifyNumber;
});

// node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var stringifyNumber = require_stringifyNumber();
  var floatNaN = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: stringifyNumber.stringifyNumber
  };
  var floatExp = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
    resolve: (str) => parseFloat(str),
    stringify(node) {
      const num = Number(node.value);
      return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
    }
  };
  var float = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
    resolve(str) {
      const node = new Scalar.Scalar(parseFloat(str));
      const dot = str.indexOf(".");
      if (dot !== -1 && str[str.length - 1] === "0")
        node.minFractionDigits = str.length - dot - 1;
      return node;
    },
    stringify: stringifyNumber.stringifyNumber
  };
  exports.float = float;
  exports.floatExp = floatExp;
  exports.floatNaN = floatNaN;
});

// node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS((exports) => {
  var stringifyNumber = require_stringifyNumber();
  var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
  var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
  function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value) && value >= 0)
      return prefix + value.toString(radix);
    return stringifyNumber.stringifyNumber(node);
  }
  var intOct = {
    identify: (value) => intIdentify(value) && value >= 0,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^0o[0-7]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
    stringify: (node) => intStringify(node, 8, "0o")
  };
  var int = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: stringifyNumber.stringifyNumber
  };
  var intHex = {
    identify: (value) => intIdentify(value) && value >= 0,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^0x[0-9a-fA-F]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: (node) => intStringify(node, 16, "0x")
  };
  exports.int = int;
  exports.intHex = intHex;
  exports.intOct = intOct;
});

// node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS((exports) => {
  var map = require_map();
  var _null = require_null();
  var seq = require_seq();
  var string = require_string();
  var bool = require_bool();
  var float = require_float();
  var int = require_int();
  var schema = [
    map.map,
    seq.seq,
    string.string,
    _null.nullTag,
    bool.boolTag,
    int.intOct,
    int.int,
    int.intHex,
    float.floatNaN,
    float.floatExp,
    float.float
  ];
  exports.schema = schema;
});

// node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var map = require_map();
  var seq = require_seq();
  function intIdentify(value) {
    return typeof value === "bigint" || Number.isInteger(value);
  }
  var stringifyJSON = ({ value }) => JSON.stringify(value);
  var jsonScalars = [
    {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify: stringifyJSON
    },
    {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^null$/,
      resolve: () => null,
      stringify: stringifyJSON
    },
    {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^true$|^false$/,
      resolve: (str) => str === "true",
      stringify: stringifyJSON
    },
    {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^-?(?:0|[1-9][0-9]*)$/,
      resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
      stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
    },
    {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
      resolve: (str) => parseFloat(str),
      stringify: stringifyJSON
    }
  ];
  var jsonError = {
    default: true,
    tag: "",
    test: /^/,
    resolve(str, onError) {
      onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
      return str;
    }
  };
  var schema = [map.map, seq.seq].concat(jsonScalars, jsonError);
  exports.schema = schema;
});

// node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS((exports) => {
  var node_buffer = __require("node:buffer");
  var Scalar = require_Scalar();
  var stringifyString = require_stringifyString();
  var binary = {
    identify: (value) => value instanceof Uint8Array,
    default: false,
    tag: "tag:yaml.org,2002:binary",
    resolve(src, onError) {
      if (typeof node_buffer.Buffer === "function") {
        return node_buffer.Buffer.from(src, "base64");
      } else if (typeof atob === "function") {
        const str = atob(src.replace(/[\n\r]/g, ""));
        const buffer = new Uint8Array(str.length);
        for (let i = 0;i < str.length; ++i)
          buffer[i] = str.charCodeAt(i);
        return buffer;
      } else {
        onError("This environment does not support reading binary tags; either Buffer or atob is required");
        return src;
      }
    },
    stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
      const buf = value;
      let str;
      if (typeof node_buffer.Buffer === "function") {
        str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
      } else if (typeof btoa === "function") {
        let s = "";
        for (let i = 0;i < buf.length; ++i)
          s += String.fromCharCode(buf[i]);
        str = btoa(s);
      } else {
        throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
      }
      if (!type)
        type = Scalar.Scalar.BLOCK_LITERAL;
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
        const n = Math.ceil(str.length / lineWidth);
        const lines = new Array(n);
        for (let i = 0, o = 0;i < n; ++i, o += lineWidth) {
          lines[i] = str.substr(o, lineWidth);
        }
        str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? `
` : " ");
      }
      return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
    }
  };
  exports.binary = binary;
});

// node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS((exports) => {
  var identity = require_identity();
  var Pair = require_Pair();
  var Scalar = require_Scalar();
  var YAMLSeq = require_YAMLSeq();
  function resolvePairs(seq, onError) {
    if (identity.isSeq(seq)) {
      for (let i = 0;i < seq.items.length; ++i) {
        let item = seq.items[i];
        if (identity.isPair(item))
          continue;
        else if (identity.isMap(item)) {
          if (item.items.length > 1)
            onError("Each pair must have its own sequence indicator");
          const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
          if (item.commentBefore)
            pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
          if (item.comment) {
            const cn = pair.value ?? pair.key;
            cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
          }
          item = pair;
        }
        seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
      }
    } else
      onError("Expected a sequence for this tag");
    return seq;
  }
  function createPairs(schema, iterable, ctx) {
    const { replacer } = ctx;
    const pairs2 = new YAMLSeq.YAMLSeq(schema);
    pairs2.tag = "tag:yaml.org,2002:pairs";
    let i = 0;
    if (iterable && Symbol.iterator in Object(iterable))
      for (let it of iterable) {
        if (typeof replacer === "function")
          it = replacer.call(iterable, String(i++), it);
        let key, value;
        if (Array.isArray(it)) {
          if (it.length === 2) {
            key = it[0];
            value = it[1];
          } else
            throw new TypeError(`Expected [key, value] tuple: ${it}`);
        } else if (it && it instanceof Object) {
          const keys = Object.keys(it);
          if (keys.length === 1) {
            key = keys[0];
            value = it[key];
          } else {
            throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
          }
        } else {
          key = it;
        }
        pairs2.items.push(Pair.createPair(key, value, ctx));
      }
    return pairs2;
  }
  var pairs = {
    collection: "seq",
    default: false,
    tag: "tag:yaml.org,2002:pairs",
    resolve: resolvePairs,
    createNode: createPairs
  };
  exports.createPairs = createPairs;
  exports.pairs = pairs;
  exports.resolvePairs = resolvePairs;
});

// node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS((exports) => {
  var identity = require_identity();
  var toJS = require_toJS();
  var YAMLMap = require_YAMLMap();
  var YAMLSeq = require_YAMLSeq();
  var pairs = require_pairs();

  class YAMLOMap extends YAMLSeq.YAMLSeq {
    constructor() {
      super();
      this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
      this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
      this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
      this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
      this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
      this.tag = YAMLOMap.tag;
    }
    toJSON(_, ctx) {
      if (!ctx)
        return super.toJSON(_);
      const map = new Map;
      if (ctx?.onCreate)
        ctx.onCreate(map);
      for (const pair of this.items) {
        let key, value;
        if (identity.isPair(pair)) {
          key = toJS.toJS(pair.key, "", ctx);
          value = toJS.toJS(pair.value, key, ctx);
        } else {
          key = toJS.toJS(pair, "", ctx);
        }
        if (map.has(key))
          throw new Error("Ordered maps must not include duplicate keys");
        map.set(key, value);
      }
      return map;
    }
    static from(schema, iterable, ctx) {
      const pairs$1 = pairs.createPairs(schema, iterable, ctx);
      const omap2 = new this;
      omap2.items = pairs$1.items;
      return omap2;
    }
  }
  YAMLOMap.tag = "tag:yaml.org,2002:omap";
  var omap = {
    collection: "seq",
    identify: (value) => value instanceof Map,
    nodeClass: YAMLOMap,
    default: false,
    tag: "tag:yaml.org,2002:omap",
    resolve(seq, onError) {
      const pairs$1 = pairs.resolvePairs(seq, onError);
      const seenKeys = [];
      for (const { key } of pairs$1.items) {
        if (identity.isScalar(key)) {
          if (seenKeys.includes(key.value)) {
            onError(`Ordered maps must not include duplicate keys: ${key.value}`);
          } else {
            seenKeys.push(key.value);
          }
        }
      }
      return Object.assign(new YAMLOMap, pairs$1);
    },
    createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
  };
  exports.YAMLOMap = YAMLOMap;
  exports.omap = omap;
});

// node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS((exports) => {
  var Scalar = require_Scalar();
  function boolStringify({ value, source }, ctx) {
    const boolObj = value ? trueTag : falseTag;
    if (source && boolObj.test.test(source))
      return source;
    return value ? ctx.options.trueStr : ctx.options.falseStr;
  }
  var trueTag = {
    identify: (value) => value === true,
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
    resolve: () => new Scalar.Scalar(true),
    stringify: boolStringify
  };
  var falseTag = {
    identify: (value) => value === false,
    default: true,
    tag: "tag:yaml.org,2002:bool",
    test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
    resolve: () => new Scalar.Scalar(false),
    stringify: boolStringify
  };
  exports.falseTag = falseTag;
  exports.trueTag = trueTag;
});

// node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var stringifyNumber = require_stringifyNumber();
  var floatNaN = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
    resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
    stringify: stringifyNumber.stringifyNumber
  };
  var floatExp = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "EXP",
    test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
    resolve: (str) => parseFloat(str.replace(/_/g, "")),
    stringify(node) {
      const num = Number(node.value);
      return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
    }
  };
  var float = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
    resolve(str) {
      const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
      const dot = str.indexOf(".");
      if (dot !== -1) {
        const f = str.substring(dot + 1).replace(/_/g, "");
        if (f[f.length - 1] === "0")
          node.minFractionDigits = f.length;
      }
      return node;
    },
    stringify: stringifyNumber.stringifyNumber
  };
  exports.float = float;
  exports.floatExp = floatExp;
  exports.floatNaN = floatNaN;
});

// node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS((exports) => {
  var stringifyNumber = require_stringifyNumber();
  var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
  function intResolve(str, offset, radix, { intAsBigInt }) {
    const sign = str[0];
    if (sign === "-" || sign === "+")
      offset += 1;
    str = str.substring(offset).replace(/_/g, "");
    if (intAsBigInt) {
      switch (radix) {
        case 2:
          str = `0b${str}`;
          break;
        case 8:
          str = `0o${str}`;
          break;
        case 16:
          str = `0x${str}`;
          break;
      }
      const n2 = BigInt(str);
      return sign === "-" ? BigInt(-1) * n2 : n2;
    }
    const n = parseInt(str, radix);
    return sign === "-" ? -1 * n : n;
  }
  function intStringify(node, radix, prefix) {
    const { value } = node;
    if (intIdentify(value)) {
      const str = value.toString(radix);
      return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
    }
    return stringifyNumber.stringifyNumber(node);
  }
  var intBin = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "BIN",
    test: /^[-+]?0b[0-1_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
    stringify: (node) => intStringify(node, 2, "0b")
  };
  var intOct = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "OCT",
    test: /^[-+]?0[0-7_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
    stringify: (node) => intStringify(node, 8, "0")
  };
  var int = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    test: /^[-+]?[0-9][0-9_]*$/,
    resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
    stringify: stringifyNumber.stringifyNumber
  };
  var intHex = {
    identify: intIdentify,
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "HEX",
    test: /^[-+]?0x[0-9a-fA-F_]+$/,
    resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
    stringify: (node) => intStringify(node, 16, "0x")
  };
  exports.int = int;
  exports.intBin = intBin;
  exports.intHex = intHex;
  exports.intOct = intOct;
});

// node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS((exports) => {
  var identity = require_identity();
  var Pair = require_Pair();
  var YAMLMap = require_YAMLMap();

  class YAMLSet extends YAMLMap.YAMLMap {
    constructor(schema) {
      super(schema);
      this.tag = YAMLSet.tag;
    }
    add(key) {
      let pair;
      if (identity.isPair(key))
        pair = key;
      else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
        pair = new Pair.Pair(key.key, null);
      else
        pair = new Pair.Pair(key, null);
      const prev = YAMLMap.findPair(this.items, pair.key);
      if (!prev)
        this.items.push(pair);
    }
    get(key, keepPair) {
      const pair = YAMLMap.findPair(this.items, key);
      return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
    }
    set(key, value) {
      if (typeof value !== "boolean")
        throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
      const prev = YAMLMap.findPair(this.items, key);
      if (prev && !value) {
        this.items.splice(this.items.indexOf(prev), 1);
      } else if (!prev && value) {
        this.items.push(new Pair.Pair(key));
      }
    }
    toJSON(_, ctx) {
      return super.toJSON(_, ctx, Set);
    }
    toString(ctx, onComment, onChompKeep) {
      if (!ctx)
        return JSON.stringify(this);
      if (this.hasAllNullValues(true))
        return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
      else
        throw new Error("Set items must all have null values");
    }
    static from(schema, iterable, ctx) {
      const { replacer } = ctx;
      const set2 = new this(schema);
      if (iterable && Symbol.iterator in Object(iterable))
        for (let value of iterable) {
          if (typeof replacer === "function")
            value = replacer.call(iterable, value, value);
          set2.items.push(Pair.createPair(value, null, ctx));
        }
      return set2;
    }
  }
  YAMLSet.tag = "tag:yaml.org,2002:set";
  var set = {
    collection: "map",
    identify: (value) => value instanceof Set,
    nodeClass: YAMLSet,
    default: false,
    tag: "tag:yaml.org,2002:set",
    createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
    resolve(map, onError) {
      if (identity.isMap(map)) {
        if (map.hasAllNullValues(true))
          return Object.assign(new YAMLSet, map);
        else
          onError("Set items must all have null values");
      } else
        onError("Expected a mapping for this tag");
      return map;
    }
  };
  exports.YAMLSet = YAMLSet;
  exports.set = set;
});

// node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS((exports) => {
  var stringifyNumber = require_stringifyNumber();
  function parseSexagesimal(str, asBigInt) {
    const sign = str[0];
    const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
    const num = (n) => asBigInt ? BigInt(n) : Number(n);
    const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num(60) + num(p), num(0));
    return sign === "-" ? num(-1) * res : res;
  }
  function stringifySexagesimal(node) {
    let { value } = node;
    let num = (n) => n;
    if (typeof value === "bigint")
      num = (n) => BigInt(n);
    else if (isNaN(value) || !isFinite(value))
      return stringifyNumber.stringifyNumber(node);
    let sign = "";
    if (value < 0) {
      sign = "-";
      value *= num(-1);
    }
    const _60 = num(60);
    const parts = [value % _60];
    if (value < 60) {
      parts.unshift(0);
    } else {
      value = (value - parts[0]) / _60;
      parts.unshift(value % _60);
      if (value >= 60) {
        value = (value - parts[0]) / _60;
        parts.unshift(value);
      }
    }
    return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
  }
  var intTime = {
    identify: (value) => typeof value === "bigint" || Number.isInteger(value),
    default: true,
    tag: "tag:yaml.org,2002:int",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
    resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
    stringify: stringifySexagesimal
  };
  var floatTime = {
    identify: (value) => typeof value === "number",
    default: true,
    tag: "tag:yaml.org,2002:float",
    format: "TIME",
    test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
    resolve: (str) => parseSexagesimal(str, false),
    stringify: stringifySexagesimal
  };
  var timestamp = {
    identify: (value) => value instanceof Date,
    default: true,
    tag: "tag:yaml.org,2002:timestamp",
    test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})" + "(?:" + "(?:t|T|[ \\t]+)" + "([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)" + "(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?" + ")?$"),
    resolve(str) {
      const match = str.match(timestamp.test);
      if (!match)
        throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
      const [, year, month, day, hour, minute, second] = match.map(Number);
      const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
      let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
      const tz = match[8];
      if (tz && tz !== "Z") {
        let d = parseSexagesimal(tz, false);
        if (Math.abs(d) < 30)
          d *= 60;
        date -= 60000 * d;
      }
      return new Date(date);
    },
    stringify: ({ value }) => value.toISOString().replace(/(T00:00:00)?\.000Z$/, "")
  };
  exports.floatTime = floatTime;
  exports.intTime = intTime;
  exports.timestamp = timestamp;
});

// node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS((exports) => {
  var map = require_map();
  var _null = require_null();
  var seq = require_seq();
  var string = require_string();
  var binary = require_binary();
  var bool = require_bool2();
  var float = require_float2();
  var int = require_int2();
  var merge = require_merge();
  var omap = require_omap();
  var pairs = require_pairs();
  var set = require_set();
  var timestamp = require_timestamp();
  var schema = [
    map.map,
    seq.seq,
    string.string,
    _null.nullTag,
    bool.trueTag,
    bool.falseTag,
    int.intBin,
    int.intOct,
    int.int,
    int.intHex,
    float.floatNaN,
    float.floatExp,
    float.float,
    binary.binary,
    merge.merge,
    omap.omap,
    pairs.pairs,
    set.set,
    timestamp.intTime,
    timestamp.floatTime,
    timestamp.timestamp
  ];
  exports.schema = schema;
});

// node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS((exports) => {
  var map = require_map();
  var _null = require_null();
  var seq = require_seq();
  var string = require_string();
  var bool = require_bool();
  var float = require_float();
  var int = require_int();
  var schema = require_schema();
  var schema$1 = require_schema2();
  var binary = require_binary();
  var merge = require_merge();
  var omap = require_omap();
  var pairs = require_pairs();
  var schema$2 = require_schema3();
  var set = require_set();
  var timestamp = require_timestamp();
  var schemas = new Map([
    ["core", schema.schema],
    ["failsafe", [map.map, seq.seq, string.string]],
    ["json", schema$1.schema],
    ["yaml11", schema$2.schema],
    ["yaml-1.1", schema$2.schema]
  ]);
  var tagsByName = {
    binary: binary.binary,
    bool: bool.boolTag,
    float: float.float,
    floatExp: float.floatExp,
    floatNaN: float.floatNaN,
    floatTime: timestamp.floatTime,
    int: int.int,
    intHex: int.intHex,
    intOct: int.intOct,
    intTime: timestamp.intTime,
    map: map.map,
    merge: merge.merge,
    null: _null.nullTag,
    omap: omap.omap,
    pairs: pairs.pairs,
    seq: seq.seq,
    set: set.set,
    timestamp: timestamp.timestamp
  };
  var coreKnownTags = {
    "tag:yaml.org,2002:binary": binary.binary,
    "tag:yaml.org,2002:merge": merge.merge,
    "tag:yaml.org,2002:omap": omap.omap,
    "tag:yaml.org,2002:pairs": pairs.pairs,
    "tag:yaml.org,2002:set": set.set,
    "tag:yaml.org,2002:timestamp": timestamp.timestamp
  };
  function getTags(customTags, schemaName, addMergeTag) {
    const schemaTags = schemas.get(schemaName);
    if (schemaTags && !customTags) {
      return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
    }
    let tags = schemaTags;
    if (!tags) {
      if (Array.isArray(customTags))
        tags = [];
      else {
        const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
        throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
      }
    }
    if (Array.isArray(customTags)) {
      for (const tag of customTags)
        tags = tags.concat(tag);
    } else if (typeof customTags === "function") {
      tags = customTags(tags.slice());
    }
    if (addMergeTag)
      tags = tags.concat(merge.merge);
    return tags.reduce((tags2, tag) => {
      const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
      if (!tagObj) {
        const tagName = JSON.stringify(tag);
        const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
        throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
      }
      if (!tags2.includes(tagObj))
        tags2.push(tagObj);
      return tags2;
    }, []);
  }
  exports.coreKnownTags = coreKnownTags;
  exports.getTags = getTags;
});

// node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS((exports) => {
  var identity = require_identity();
  var map = require_map();
  var seq = require_seq();
  var string = require_string();
  var tags = require_tags();
  var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;

  class Schema {
    constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
      this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
      this.name = typeof schema === "string" && schema || "core";
      this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
      this.tags = tags.getTags(customTags, this.name, merge);
      this.toStringOptions = toStringDefaults ?? null;
      Object.defineProperty(this, identity.MAP, { value: map.map });
      Object.defineProperty(this, identity.SCALAR, { value: string.string });
      Object.defineProperty(this, identity.SEQ, { value: seq.seq });
      this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
    }
    clone() {
      const copy = Object.create(Schema.prototype, Object.getOwnPropertyDescriptors(this));
      copy.tags = this.tags.slice();
      return copy;
    }
  }
  exports.Schema = Schema;
});

// node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS((exports) => {
  var identity = require_identity();
  var stringify = require_stringify();
  var stringifyComment = require_stringifyComment();
  function stringifyDocument(doc, options) {
    const lines = [];
    let hasDirectives = options.directives === true;
    if (options.directives !== false && doc.directives) {
      const dir = doc.directives.toString(doc);
      if (dir) {
        lines.push(dir);
        hasDirectives = true;
      } else if (doc.directives.docStart)
        hasDirectives = true;
    }
    if (hasDirectives)
      lines.push("---");
    const ctx = stringify.createStringifyContext(doc, options);
    const { commentString } = ctx.options;
    if (doc.commentBefore) {
      if (lines.length !== 1)
        lines.unshift("");
      const cs = commentString(doc.commentBefore);
      lines.unshift(stringifyComment.indentComment(cs, ""));
    }
    let chompKeep = false;
    let contentComment = null;
    if (doc.contents) {
      if (identity.isNode(doc.contents)) {
        if (doc.contents.spaceBefore && hasDirectives)
          lines.push("");
        if (doc.contents.commentBefore) {
          const cs = commentString(doc.contents.commentBefore);
          lines.push(stringifyComment.indentComment(cs, ""));
        }
        ctx.forceBlockIndent = !!doc.comment;
        contentComment = doc.contents.comment;
      }
      const onChompKeep = contentComment ? undefined : () => chompKeep = true;
      let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
      if (contentComment)
        body += stringifyComment.lineComment(body, "", commentString(contentComment));
      if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
        lines[lines.length - 1] = `--- ${body}`;
      } else
        lines.push(body);
    } else {
      lines.push(stringify.stringify(doc.contents, ctx));
    }
    if (doc.directives?.docEnd) {
      if (doc.comment) {
        const cs = commentString(doc.comment);
        if (cs.includes(`
`)) {
          lines.push("...");
          lines.push(stringifyComment.indentComment(cs, ""));
        } else {
          lines.push(`... ${cs}`);
        }
      } else {
        lines.push("...");
      }
    } else {
      let dc = doc.comment;
      if (dc && chompKeep)
        dc = dc.replace(/^\n+/, "");
      if (dc) {
        if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
          lines.push("");
        lines.push(stringifyComment.indentComment(commentString(dc), ""));
      }
    }
    return lines.join(`
`) + `
`;
  }
  exports.stringifyDocument = stringifyDocument;
});

// node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS((exports) => {
  var Alias = require_Alias();
  var Collection = require_Collection();
  var identity = require_identity();
  var Pair = require_Pair();
  var toJS = require_toJS();
  var Schema = require_Schema();
  var stringifyDocument = require_stringifyDocument();
  var anchors = require_anchors();
  var applyReviver = require_applyReviver();
  var createNode = require_createNode();
  var directives = require_directives();

  class Document {
    constructor(value, replacer, options) {
      this.commentBefore = null;
      this.comment = null;
      this.errors = [];
      this.warnings = [];
      Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === undefined && replacer) {
        options = replacer;
        replacer = undefined;
      }
      const opt = Object.assign({
        intAsBigInt: false,
        keepSourceTokens: false,
        logLevel: "warn",
        prettyErrors: true,
        strict: true,
        stringKeys: false,
        uniqueKeys: true,
        version: "1.2"
      }, options);
      this.options = opt;
      let { version } = opt;
      if (options?._directives) {
        this.directives = options._directives.atDocument();
        if (this.directives.yaml.explicit)
          version = this.directives.yaml.version;
      } else
        this.directives = new directives.Directives({ version });
      this.setSchema(version, options);
      this.contents = value === undefined ? null : this.createNode(value, _replacer, options);
    }
    clone() {
      const copy = Object.create(Document.prototype, {
        [identity.NODE_TYPE]: { value: identity.DOC }
      });
      copy.commentBefore = this.commentBefore;
      copy.comment = this.comment;
      copy.errors = this.errors.slice();
      copy.warnings = this.warnings.slice();
      copy.options = Object.assign({}, this.options);
      if (this.directives)
        copy.directives = this.directives.clone();
      copy.schema = this.schema.clone();
      copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
      if (this.range)
        copy.range = this.range.slice();
      return copy;
    }
    add(value) {
      if (assertCollection(this.contents))
        this.contents.add(value);
    }
    addIn(path, value) {
      if (assertCollection(this.contents))
        this.contents.addIn(path, value);
    }
    createAlias(node, name) {
      if (!node.anchor) {
        const prev = anchors.anchorNames(this);
        node.anchor = !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
      }
      return new Alias.Alias(node.anchor);
    }
    createNode(value, replacer, options) {
      let _replacer = undefined;
      if (typeof replacer === "function") {
        value = replacer.call({ "": value }, "", value);
        _replacer = replacer;
      } else if (Array.isArray(replacer)) {
        const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
        const asStr = replacer.filter(keyToStr).map(String);
        if (asStr.length > 0)
          replacer = replacer.concat(asStr);
        _replacer = replacer;
      } else if (options === undefined && replacer) {
        options = replacer;
        replacer = undefined;
      }
      const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
      const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(this, anchorPrefix || "a");
      const ctx = {
        aliasDuplicateObjects: aliasDuplicateObjects ?? true,
        keepUndefined: keepUndefined ?? false,
        onAnchor,
        onTagObj,
        replacer: _replacer,
        schema: this.schema,
        sourceObjects
      };
      const node = createNode.createNode(value, tag, ctx);
      if (flow && identity.isCollection(node))
        node.flow = true;
      setAnchors();
      return node;
    }
    createPair(key, value, options = {}) {
      const k = this.createNode(key, null, options);
      const v = this.createNode(value, null, options);
      return new Pair.Pair(k, v);
    }
    delete(key) {
      return assertCollection(this.contents) ? this.contents.delete(key) : false;
    }
    deleteIn(path) {
      if (Collection.isEmptyPath(path)) {
        if (this.contents == null)
          return false;
        this.contents = null;
        return true;
      }
      return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
    }
    get(key, keepScalar) {
      return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : undefined;
    }
    getIn(path, keepScalar) {
      if (Collection.isEmptyPath(path))
        return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
      return identity.isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : undefined;
    }
    has(key) {
      return identity.isCollection(this.contents) ? this.contents.has(key) : false;
    }
    hasIn(path) {
      if (Collection.isEmptyPath(path))
        return this.contents !== undefined;
      return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
    }
    set(key, value) {
      if (this.contents == null) {
        this.contents = Collection.collectionFromPath(this.schema, [key], value);
      } else if (assertCollection(this.contents)) {
        this.contents.set(key, value);
      }
    }
    setIn(path, value) {
      if (Collection.isEmptyPath(path)) {
        this.contents = value;
      } else if (this.contents == null) {
        this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
      } else if (assertCollection(this.contents)) {
        this.contents.setIn(path, value);
      }
    }
    setSchema(version, options = {}) {
      if (typeof version === "number")
        version = String(version);
      let opt;
      switch (version) {
        case "1.1":
          if (this.directives)
            this.directives.yaml.version = "1.1";
          else
            this.directives = new directives.Directives({ version: "1.1" });
          opt = { resolveKnownTags: false, schema: "yaml-1.1" };
          break;
        case "1.2":
        case "next":
          if (this.directives)
            this.directives.yaml.version = version;
          else
            this.directives = new directives.Directives({ version });
          opt = { resolveKnownTags: true, schema: "core" };
          break;
        case null:
          if (this.directives)
            delete this.directives;
          opt = null;
          break;
        default: {
          const sv = JSON.stringify(version);
          throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
        }
      }
      if (options.schema instanceof Object)
        this.schema = options.schema;
      else if (opt)
        this.schema = new Schema.Schema(Object.assign(opt, options));
      else
        throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
    }
    toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
      const ctx = {
        anchors: new Map,
        doc: this,
        keep: !json,
        mapAsMap: mapAsMap === true,
        mapKeyWarned: false,
        maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
      };
      const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
      if (typeof onAnchor === "function")
        for (const { count, res: res2 } of ctx.anchors.values())
          onAnchor(res2, count);
      return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
    }
    toJSON(jsonArg, onAnchor) {
      return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
    }
    toString(options = {}) {
      if (this.errors.length > 0)
        throw new Error("Document with errors cannot be stringified");
      if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
        const s = JSON.stringify(options.indent);
        throw new Error(`"indent" option must be a positive integer, not ${s}`);
      }
      return stringifyDocument.stringifyDocument(this, options);
    }
  }
  function assertCollection(contents) {
    if (identity.isCollection(contents))
      return true;
    throw new Error("Expected a YAML collection as document contents");
  }
  exports.Document = Document;
});

// node_modules/yaml/dist/errors.js
var require_errors = __commonJS((exports) => {
  class YAMLError extends Error {
    constructor(name, pos, code, message) {
      super();
      this.name = name;
      this.code = code;
      this.message = message;
      this.pos = pos;
    }
  }

  class YAMLParseError extends YAMLError {
    constructor(pos, code, message) {
      super("YAMLParseError", pos, code, message);
    }
  }

  class YAMLWarning extends YAMLError {
    constructor(pos, code, message) {
      super("YAMLWarning", pos, code, message);
    }
  }
  var prettifyError = (src, lc) => (error) => {
    if (error.pos[0] === -1)
      return;
    error.linePos = error.pos.map((pos) => lc.linePos(pos));
    const { line, col } = error.linePos[0];
    error.message += ` at line ${line}, column ${col}`;
    let ci = col - 1;
    let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
    if (ci >= 60 && lineStr.length > 80) {
      const trimStart = Math.min(ci - 39, lineStr.length - 79);
      lineStr = "…" + lineStr.substring(trimStart);
      ci -= trimStart - 1;
    }
    if (lineStr.length > 80)
      lineStr = lineStr.substring(0, 79) + "…";
    if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
      let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
      if (prev.length > 80)
        prev = prev.substring(0, 79) + `…
`;
      lineStr = prev + lineStr;
    }
    if (/[^ ]/.test(lineStr)) {
      let count = 1;
      const end = error.linePos[1];
      if (end && end.line === line && end.col > col) {
        count = Math.max(1, Math.min(end.col - col, 80 - ci));
      }
      const pointer = " ".repeat(ci) + "^".repeat(count);
      error.message += `:

${lineStr}
${pointer}
`;
    }
  };
  exports.YAMLError = YAMLError;
  exports.YAMLParseError = YAMLParseError;
  exports.YAMLWarning = YAMLWarning;
  exports.prettifyError = prettifyError;
});

// node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS((exports) => {
  function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
    let spaceBefore = false;
    let atNewline = startOnNewline;
    let hasSpace = startOnNewline;
    let comment = "";
    let commentSep = "";
    let hasNewline = false;
    let reqSpace = false;
    let tab = null;
    let anchor = null;
    let tag = null;
    let newlineAfterProp = null;
    let comma = null;
    let found = null;
    let start = null;
    for (const token of tokens) {
      if (reqSpace) {
        if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
          onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
        reqSpace = false;
      }
      if (tab) {
        if (atNewline && token.type !== "comment" && token.type !== "newline") {
          onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
        }
        tab = null;
      }
      switch (token.type) {
        case "space":
          if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("\t")) {
            tab = token;
          }
          hasSpace = true;
          break;
        case "comment": {
          if (!hasSpace)
            onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const cb = token.source.substring(1) || " ";
          if (!comment)
            comment = cb;
          else
            comment += commentSep + cb;
          commentSep = "";
          atNewline = false;
          break;
        }
        case "newline":
          if (atNewline) {
            if (comment)
              comment += token.source;
            else if (!found || indicator !== "seq-item-ind")
              spaceBefore = true;
          } else
            commentSep += token.source;
          atNewline = true;
          hasNewline = true;
          if (anchor || tag)
            newlineAfterProp = token;
          hasSpace = true;
          break;
        case "anchor":
          if (anchor)
            onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
          if (token.source.endsWith(":"))
            onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
          anchor = token;
          if (start === null)
            start = token.offset;
          atNewline = false;
          hasSpace = false;
          reqSpace = true;
          break;
        case "tag": {
          if (tag)
            onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
          tag = token;
          if (start === null)
            start = token.offset;
          atNewline = false;
          hasSpace = false;
          reqSpace = true;
          break;
        }
        case indicator:
          if (anchor || tag)
            onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
          if (found)
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
          found = token;
          atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
          hasSpace = false;
          break;
        case "comma":
          if (flow) {
            if (comma)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
            comma = token;
            atNewline = false;
            hasSpace = false;
            break;
          }
        default:
          onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
          atNewline = false;
          hasSpace = false;
      }
    }
    const last = tokens[tokens.length - 1];
    const end = last ? last.offset + last.source.length : offset;
    if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
      onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
    }
    if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
      onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
    return {
      comma,
      found,
      spaceBefore,
      comment,
      hasNewline,
      anchor,
      tag,
      newlineAfterProp,
      end,
      start: start ?? end
    };
  }
  exports.resolveProps = resolveProps;
});

// node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS((exports) => {
  function containsNewline(key) {
    if (!key)
      return null;
    switch (key.type) {
      case "alias":
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        if (key.source.includes(`
`))
          return true;
        if (key.end) {
          for (const st of key.end)
            if (st.type === "newline")
              return true;
        }
        return false;
      case "flow-collection":
        for (const it of key.items) {
          for (const st of it.start)
            if (st.type === "newline")
              return true;
          if (it.sep) {
            for (const st of it.sep)
              if (st.type === "newline")
                return true;
          }
          if (containsNewline(it.key) || containsNewline(it.value))
            return true;
        }
        return false;
      default:
        return true;
    }
  }
  exports.containsNewline = containsNewline;
});

// node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS((exports) => {
  var utilContainsNewline = require_util_contains_newline();
  function flowIndentCheck(indent, fc, onError) {
    if (fc?.type === "flow-collection") {
      const end = fc.end[0];
      if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
        const msg = "Flow end indicator should be more indented than parent";
        onError(end, "BAD_INDENT", msg, true);
      }
    }
  }
  exports.flowIndentCheck = flowIndentCheck;
});

// node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS((exports) => {
  var identity = require_identity();
  function mapIncludes(ctx, items, search) {
    const { uniqueKeys } = ctx.options;
    if (uniqueKeys === false)
      return false;
    const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
    return items.some((pair) => isEqual(pair.key, search));
  }
  exports.mapIncludes = mapIncludes;
});

// node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS((exports) => {
  var Pair = require_Pair();
  var YAMLMap = require_YAMLMap();
  var resolveProps = require_resolve_props();
  var utilContainsNewline = require_util_contains_newline();
  var utilFlowIndentCheck = require_util_flow_indent_check();
  var utilMapIncludes = require_util_map_includes();
  var startColMsg = "All mapping items must start at the same column";
  function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
    const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
    const map = new NodeClass(ctx.schema);
    if (ctx.atRoot)
      ctx.atRoot = false;
    let offset = bm.offset;
    let commentEnd = null;
    for (const collItem of bm.items) {
      const { start, key, sep, value } = collItem;
      const keyProps = resolveProps.resolveProps(start, {
        indicator: "explicit-key-ind",
        next: key ?? sep?.[0],
        offset,
        onError,
        parentIndent: bm.indent,
        startOnNewline: true
      });
      const implicitKey = !keyProps.found;
      if (implicitKey) {
        if (key) {
          if (key.type === "block-seq")
            onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
          else if ("indent" in key && key.indent !== bm.indent)
            onError(offset, "BAD_INDENT", startColMsg);
        }
        if (!keyProps.anchor && !keyProps.tag && !sep) {
          commentEnd = keyProps.end;
          if (keyProps.comment) {
            if (map.comment)
              map.comment += `
` + keyProps.comment;
            else
              map.comment = keyProps.comment;
          }
          continue;
        }
        if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
          onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
        }
      } else if (keyProps.found?.indent !== bm.indent) {
        onError(offset, "BAD_INDENT", startColMsg);
      }
      ctx.atKey = true;
      const keyStart = keyProps.end;
      const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
      if (ctx.schema.compat)
        utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
      ctx.atKey = false;
      if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
        onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
      const valueProps = resolveProps.resolveProps(sep ?? [], {
        indicator: "map-value-ind",
        next: value,
        offset: keyNode.range[2],
        onError,
        parentIndent: bm.indent,
        startOnNewline: !key || key.type === "block-scalar"
      });
      offset = valueProps.end;
      if (valueProps.found) {
        if (implicitKey) {
          if (value?.type === "block-map" && !valueProps.hasNewline)
            onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
          if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
            onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
        }
        const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
        offset = valueNode.range[2];
        const pair = new Pair.Pair(keyNode, valueNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        map.items.push(pair);
      } else {
        if (implicitKey)
          onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
        if (valueProps.comment) {
          if (keyNode.comment)
            keyNode.comment += `
` + valueProps.comment;
          else
            keyNode.comment = valueProps.comment;
        }
        const pair = new Pair.Pair(keyNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        map.items.push(pair);
      }
    }
    if (commentEnd && commentEnd < offset)
      onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
    map.range = [bm.offset, offset, commentEnd ?? offset];
    return map;
  }
  exports.resolveBlockMap = resolveBlockMap;
});

// node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS((exports) => {
  var YAMLSeq = require_YAMLSeq();
  var resolveProps = require_resolve_props();
  var utilFlowIndentCheck = require_util_flow_indent_check();
  function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
    const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
    const seq = new NodeClass(ctx.schema);
    if (ctx.atRoot)
      ctx.atRoot = false;
    if (ctx.atKey)
      ctx.atKey = false;
    let offset = bs.offset;
    let commentEnd = null;
    for (const { start, value } of bs.items) {
      const props = resolveProps.resolveProps(start, {
        indicator: "seq-item-ind",
        next: value,
        offset,
        onError,
        parentIndent: bs.indent,
        startOnNewline: true
      });
      if (!props.found) {
        if (props.anchor || props.tag || value) {
          if (value && value.type === "block-seq")
            onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
          else
            onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
        } else {
          commentEnd = props.end;
          if (props.comment)
            seq.comment = props.comment;
          continue;
        }
      }
      const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
      if (ctx.schema.compat)
        utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
      offset = node.range[2];
      seq.items.push(node);
    }
    seq.range = [bs.offset, offset, commentEnd ?? offset];
    return seq;
  }
  exports.resolveBlockSeq = resolveBlockSeq;
});

// node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS((exports) => {
  function resolveEnd(end, offset, reqSpace, onError) {
    let comment = "";
    if (end) {
      let hasSpace = false;
      let sep = "";
      for (const token of end) {
        const { source, type } = token;
        switch (type) {
          case "space":
            hasSpace = true;
            break;
          case "comment": {
            if (reqSpace && !hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += sep + cb;
            sep = "";
            break;
          }
          case "newline":
            if (comment)
              sep += source;
            hasSpace = true;
            break;
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
        }
        offset += source.length;
      }
    }
    return { comment, offset };
  }
  exports.resolveEnd = resolveEnd;
});

// node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS((exports) => {
  var identity = require_identity();
  var Pair = require_Pair();
  var YAMLMap = require_YAMLMap();
  var YAMLSeq = require_YAMLSeq();
  var resolveEnd = require_resolve_end();
  var resolveProps = require_resolve_props();
  var utilContainsNewline = require_util_contains_newline();
  var utilMapIncludes = require_util_map_includes();
  var blockMsg = "Block collections are not allowed within flow collections";
  var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
  function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
    const isMap = fc.start.source === "{";
    const fcName = isMap ? "flow map" : "flow sequence";
    const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
    const coll = new NodeClass(ctx.schema);
    coll.flow = true;
    const atRoot = ctx.atRoot;
    if (atRoot)
      ctx.atRoot = false;
    if (ctx.atKey)
      ctx.atKey = false;
    let offset = fc.offset + fc.start.source.length;
    for (let i = 0;i < fc.items.length; ++i) {
      const collItem = fc.items[i];
      const { start, key, sep, value } = collItem;
      const props = resolveProps.resolveProps(start, {
        flow: fcName,
        indicator: "explicit-key-ind",
        next: key ?? sep?.[0],
        offset,
        onError,
        parentIndent: fc.indent,
        startOnNewline: false
      });
      if (!props.found) {
        if (!props.anchor && !props.tag && !sep && !value) {
          if (i === 0 && props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
          else if (i < fc.items.length - 1)
            onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
          if (props.comment) {
            if (coll.comment)
              coll.comment += `
` + props.comment;
            else
              coll.comment = props.comment;
          }
          offset = props.end;
          continue;
        }
        if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
          onError(key, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
      }
      if (i === 0) {
        if (props.comma)
          onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
      } else {
        if (!props.comma)
          onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
        if (props.comment) {
          let prevItemComment = "";
          loop:
            for (const st of start) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
          if (prevItemComment) {
            let prev = coll.items[coll.items.length - 1];
            if (identity.isPair(prev))
              prev = prev.value ?? prev.key;
            if (prev.comment)
              prev.comment += `
` + prevItemComment;
            else
              prev.comment = prevItemComment;
            props.comment = props.comment.substring(prevItemComment.length + 1);
          }
        }
      }
      if (!isMap && !sep && !props.found) {
        const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
        coll.items.push(valueNode);
        offset = valueNode.range[2];
        if (isBlock(value))
          onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
      } else {
        ctx.atKey = true;
        const keyStart = props.end;
        const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
        if (isBlock(key))
          onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
        ctx.atKey = false;
        const valueProps = resolveProps.resolveProps(sep ?? [], {
          flow: fcName,
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (valueProps.found) {
          if (!isMap && !props.found && ctx.options.strict) {
            if (sep)
              for (const st of sep) {
                if (st === valueProps.found)
                  break;
                if (st.type === "newline") {
                  onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                  break;
                }
              }
            if (props.start < valueProps.found.offset - 1024)
              onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
          }
        } else if (value) {
          if ("source" in value && value.source && value.source[0] === ":")
            onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
          else
            onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
        }
        const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
        if (valueNode) {
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else if (valueProps.comment) {
          if (keyNode.comment)
            keyNode.comment += `
` + valueProps.comment;
          else
            keyNode.comment = valueProps.comment;
        }
        const pair = new Pair.Pair(keyNode, valueNode);
        if (ctx.options.keepSourceTokens)
          pair.srcToken = collItem;
        if (isMap) {
          const map = coll;
          if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
            onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
          map.items.push(pair);
        } else {
          const map = new YAMLMap.YAMLMap(ctx.schema);
          map.flow = true;
          map.items.push(pair);
          const endRange = (valueNode ?? keyNode).range;
          map.range = [keyNode.range[0], endRange[1], endRange[2]];
          coll.items.push(map);
        }
        offset = valueNode ? valueNode.range[2] : valueProps.end;
      }
    }
    const expectedEnd = isMap ? "}" : "]";
    const [ce, ...ee] = fc.end;
    let cePos = offset;
    if (ce && ce.source === expectedEnd)
      cePos = ce.offset + ce.source.length;
    else {
      const name = fcName[0].toUpperCase() + fcName.substring(1);
      const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
      onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
      if (ce && ce.source.length !== 1)
        ee.unshift(ce);
    }
    if (ee.length > 0) {
      const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
      if (end.comment) {
        if (coll.comment)
          coll.comment += `
` + end.comment;
        else
          coll.comment = end.comment;
      }
      coll.range = [fc.offset, cePos, end.offset];
    } else {
      coll.range = [fc.offset, cePos, cePos];
    }
    return coll;
  }
  exports.resolveFlowCollection = resolveFlowCollection;
});

// node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS((exports) => {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var YAMLMap = require_YAMLMap();
  var YAMLSeq = require_YAMLSeq();
  var resolveBlockMap = require_resolve_block_map();
  var resolveBlockSeq = require_resolve_block_seq();
  var resolveFlowCollection = require_resolve_flow_collection();
  function resolveCollection(CN, ctx, token, onError, tagName, tag) {
    const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
    const Coll = coll.constructor;
    if (tagName === "!" || tagName === Coll.tagName) {
      coll.tag = Coll.tagName;
      return coll;
    }
    if (tagName)
      coll.tag = tagName;
    return coll;
  }
  function composeCollection(CN, ctx, token, props, onError) {
    const tagToken = props.tag;
    const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
    if (token.type === "block-seq") {
      const { anchor, newlineAfterProp: nl } = props;
      const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
      if (lastProp && (!nl || nl.offset < lastProp.offset)) {
        const message = "Missing newline after block sequence props";
        onError(lastProp, "MISSING_CHAR", message);
      }
    }
    const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
    if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
      return resolveCollection(CN, ctx, token, onError, tagName);
    }
    let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
    if (!tag) {
      const kt = ctx.schema.knownTags[tagName];
      if (kt && kt.collection === expType) {
        ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
        tag = kt;
      } else {
        if (kt?.collection) {
          onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection}`, true);
        } else {
          onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
        }
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
    }
    const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
    const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
    const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
    node.range = coll.range;
    node.tag = tagName;
    if (tag?.format)
      node.format = tag.format;
    return node;
  }
  exports.composeCollection = composeCollection;
});

// node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS((exports) => {
  var Scalar = require_Scalar();
  function resolveBlockScalar(ctx, scalar, onError) {
    const start = scalar.offset;
    const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
    if (!header)
      return { value: "", type: null, comment: "", range: [start, start, start] };
    const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
    const lines = scalar.source ? splitLines(scalar.source) : [];
    let chompStart = lines.length;
    for (let i = lines.length - 1;i >= 0; --i) {
      const content = lines[i][1];
      if (content === "" || content === "\r")
        chompStart = i;
      else
        break;
    }
    if (chompStart === 0) {
      const value2 = header.chomp === "+" && lines.length > 0 ? `
`.repeat(Math.max(1, lines.length - 1)) : "";
      let end2 = start + header.length;
      if (scalar.source)
        end2 += scalar.source.length;
      return { value: value2, type, comment: header.comment, range: [start, end2, end2] };
    }
    let trimIndent = scalar.indent + header.indent;
    let offset = scalar.offset + header.length;
    let contentStart = 0;
    for (let i = 0;i < chompStart; ++i) {
      const [indent, content] = lines[i];
      if (content === "" || content === "\r") {
        if (header.indent === 0 && indent.length > trimIndent)
          trimIndent = indent.length;
      } else {
        if (indent.length < trimIndent) {
          const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
          onError(offset + indent.length, "MISSING_CHAR", message);
        }
        if (header.indent === 0)
          trimIndent = indent.length;
        contentStart = i;
        if (trimIndent === 0 && !ctx.atRoot) {
          const message = "Block scalar values in collections must be indented";
          onError(offset, "BAD_INDENT", message);
        }
        break;
      }
      offset += indent.length + content.length + 1;
    }
    for (let i = lines.length - 1;i >= chompStart; --i) {
      if (lines[i][0].length > trimIndent)
        chompStart = i + 1;
    }
    let value = "";
    let sep = "";
    let prevMoreIndented = false;
    for (let i = 0;i < contentStart; ++i)
      value += lines[i][0].slice(trimIndent) + `
`;
    for (let i = contentStart;i < chompStart; ++i) {
      let [indent, content] = lines[i];
      offset += indent.length + content.length + 1;
      const crlf = content[content.length - 1] === "\r";
      if (crlf)
        content = content.slice(0, -1);
      if (content && indent.length < trimIndent) {
        const src = header.indent ? "explicit indentation indicator" : "first line";
        const message = `Block scalar lines must not be less indented than their ${src}`;
        onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
        indent = "";
      }
      if (type === Scalar.Scalar.BLOCK_LITERAL) {
        value += sep + indent.slice(trimIndent) + content;
        sep = `
`;
      } else if (indent.length > trimIndent || content[0] === "\t") {
        if (sep === " ")
          sep = `
`;
        else if (!prevMoreIndented && sep === `
`)
          sep = `

`;
        value += sep + indent.slice(trimIndent) + content;
        sep = `
`;
        prevMoreIndented = true;
      } else if (content === "") {
        if (sep === `
`)
          value += `
`;
        else
          sep = `
`;
      } else {
        value += sep + content;
        sep = " ";
        prevMoreIndented = false;
      }
    }
    switch (header.chomp) {
      case "-":
        break;
      case "+":
        for (let i = chompStart;i < lines.length; ++i)
          value += `
` + lines[i][0].slice(trimIndent);
        if (value[value.length - 1] !== `
`)
          value += `
`;
        break;
      default:
        value += `
`;
    }
    const end = start + header.length + scalar.source.length;
    return { value, type, comment: header.comment, range: [start, end, end] };
  }
  function parseBlockScalarHeader({ offset, props }, strict, onError) {
    if (props[0].type !== "block-scalar-header") {
      onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
      return null;
    }
    const { source } = props[0];
    const mode = source[0];
    let indent = 0;
    let chomp = "";
    let error = -1;
    for (let i = 1;i < source.length; ++i) {
      const ch = source[i];
      if (!chomp && (ch === "-" || ch === "+"))
        chomp = ch;
      else {
        const n = Number(ch);
        if (!indent && n)
          indent = n;
        else if (error === -1)
          error = offset + i;
      }
    }
    if (error !== -1)
      onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
    let hasSpace = false;
    let comment = "";
    let length = source.length;
    for (let i = 1;i < props.length; ++i) {
      const token = props[i];
      switch (token.type) {
        case "space":
          hasSpace = true;
        case "newline":
          length += token.source.length;
          break;
        case "comment":
          if (strict && !hasSpace) {
            const message = "Comments must be separated from other tokens by white space characters";
            onError(token, "MISSING_CHAR", message);
          }
          length += token.source.length;
          comment = token.source.substring(1);
          break;
        case "error":
          onError(token, "UNEXPECTED_TOKEN", token.message);
          length += token.source.length;
          break;
        default: {
          const message = `Unexpected token in block scalar header: ${token.type}`;
          onError(token, "UNEXPECTED_TOKEN", message);
          const ts = token.source;
          if (ts && typeof ts === "string")
            length += ts.length;
        }
      }
    }
    return { mode, indent, chomp, comment, length };
  }
  function splitLines(source) {
    const split = source.split(/\n( *)/);
    const first = split[0];
    const m = first.match(/^( *)/);
    const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
    const lines = [line0];
    for (let i = 1;i < split.length; i += 2)
      lines.push([split[i], split[i + 1]]);
    return lines;
  }
  exports.resolveBlockScalar = resolveBlockScalar;
});

// node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS((exports) => {
  var Scalar = require_Scalar();
  var resolveEnd = require_resolve_end();
  function resolveFlowScalar(scalar, strict, onError) {
    const { offset, type, source, end } = scalar;
    let _type;
    let value;
    const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
    switch (type) {
      case "scalar":
        _type = Scalar.Scalar.PLAIN;
        value = plainValue(source, _onError);
        break;
      case "single-quoted-scalar":
        _type = Scalar.Scalar.QUOTE_SINGLE;
        value = singleQuotedValue(source, _onError);
        break;
      case "double-quoted-scalar":
        _type = Scalar.Scalar.QUOTE_DOUBLE;
        value = doubleQuotedValue(source, _onError);
        break;
      default:
        onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
        return {
          value: "",
          type: null,
          comment: "",
          range: [offset, offset + source.length, offset + source.length]
        };
    }
    const valueEnd = offset + source.length;
    const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
    return {
      value,
      type: _type,
      comment: re.comment,
      range: [offset, valueEnd, re.offset]
    };
  }
  function plainValue(source, onError) {
    let badChar = "";
    switch (source[0]) {
      case "\t":
        badChar = "a tab character";
        break;
      case ",":
        badChar = "flow indicator character ,";
        break;
      case "%":
        badChar = "directive indicator character %";
        break;
      case "|":
      case ">": {
        badChar = `block scalar indicator ${source[0]}`;
        break;
      }
      case "@":
      case "`": {
        badChar = `reserved character ${source[0]}`;
        break;
      }
    }
    if (badChar)
      onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
    return foldLines(source);
  }
  function singleQuotedValue(source, onError) {
    if (source[source.length - 1] !== "'" || source.length === 1)
      onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
    return foldLines(source.slice(1, -1)).replace(/''/g, "'");
  }
  function foldLines(source) {
    let first, line;
    try {
      first = new RegExp(`(.*?)(?<![ \t])[ \t]*\r?
`, "sy");
      line = new RegExp(`[ \t]*(.*?)(?:(?<![ \t])[ \t]*)?\r?
`, "sy");
    } catch {
      first = /(.*?)[ \t]*\r?\n/sy;
      line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
    }
    let match = first.exec(source);
    if (!match)
      return source;
    let res = match[1];
    let sep = " ";
    let pos = first.lastIndex;
    line.lastIndex = pos;
    while (match = line.exec(source)) {
      if (match[1] === "") {
        if (sep === `
`)
          res += sep;
        else
          sep = `
`;
      } else {
        res += sep + match[1];
        sep = " ";
      }
      pos = line.lastIndex;
    }
    const last = /[ \t]*(.*)/sy;
    last.lastIndex = pos;
    match = last.exec(source);
    return res + sep + (match?.[1] ?? "");
  }
  function doubleQuotedValue(source, onError) {
    let res = "";
    for (let i = 1;i < source.length - 1; ++i) {
      const ch = source[i];
      if (ch === "\r" && source[i + 1] === `
`)
        continue;
      if (ch === `
`) {
        const { fold, offset } = foldNewline(source, i);
        res += fold;
        i = offset;
      } else if (ch === "\\") {
        let next = source[++i];
        const cc = escapeCodes[next];
        if (cc)
          res += cc;
        else if (next === `
`) {
          next = source[i + 1];
          while (next === " " || next === "\t")
            next = source[++i + 1];
        } else if (next === "\r" && source[i + 1] === `
`) {
          next = source[++i + 1];
          while (next === " " || next === "\t")
            next = source[++i + 1];
        } else if (next === "x" || next === "u" || next === "U") {
          const length = { x: 2, u: 4, U: 8 }[next];
          res += parseCharCode(source, i + 1, length, onError);
          i += length;
        } else {
          const raw = source.substr(i - 1, 2);
          onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
          res += raw;
        }
      } else if (ch === " " || ch === "\t") {
        const wsStart = i;
        let next = source[i + 1];
        while (next === " " || next === "\t")
          next = source[++i + 1];
        if (next !== `
` && !(next === "\r" && source[i + 2] === `
`))
          res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
      } else {
        res += ch;
      }
    }
    if (source[source.length - 1] !== '"' || source.length === 1)
      onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
    return res;
  }
  function foldNewline(source, offset) {
    let fold = "";
    let ch = source[offset + 1];
    while (ch === " " || ch === "\t" || ch === `
` || ch === "\r") {
      if (ch === "\r" && source[offset + 2] !== `
`)
        break;
      if (ch === `
`)
        fold += `
`;
      offset += 1;
      ch = source[offset + 1];
    }
    if (!fold)
      fold = " ";
    return { fold, offset };
  }
  var escapeCodes = {
    "0": "\x00",
    a: "\x07",
    b: "\b",
    e: "\x1B",
    f: "\f",
    n: `
`,
    r: "\r",
    t: "\t",
    v: "\v",
    N: "",
    _: " ",
    L: "\u2028",
    P: "\u2029",
    " ": " ",
    '"': '"',
    "/": "/",
    "\\": "\\",
    "\t": "\t"
  };
  function parseCharCode(source, offset, length, onError) {
    const cc = source.substr(offset, length);
    const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
    const code = ok ? parseInt(cc, 16) : NaN;
    if (isNaN(code)) {
      const raw = source.substr(offset - 2, length + 2);
      onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
      return raw;
    }
    return String.fromCodePoint(code);
  }
  exports.resolveFlowScalar = resolveFlowScalar;
});

// node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS((exports) => {
  var identity = require_identity();
  var Scalar = require_Scalar();
  var resolveBlockScalar = require_resolve_block_scalar();
  var resolveFlowScalar = require_resolve_flow_scalar();
  function composeScalar(ctx, token, tagToken, onError) {
    const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
    const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
    let tag;
    if (ctx.options.stringKeys && ctx.atKey) {
      tag = ctx.schema[identity.SCALAR];
    } else if (tagName)
      tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
    else if (token.type === "scalar")
      tag = findScalarTagByTest(ctx, value, token, onError);
    else
      tag = ctx.schema[identity.SCALAR];
    let scalar;
    try {
      const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
      scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
      scalar = new Scalar.Scalar(value);
    }
    scalar.range = range;
    scalar.source = value;
    if (type)
      scalar.type = type;
    if (tagName)
      scalar.tag = tagName;
    if (tag.format)
      scalar.format = tag.format;
    if (comment)
      scalar.comment = comment;
    return scalar;
  }
  function findScalarTagByName(schema, value, tagName, tagToken, onError) {
    if (tagName === "!")
      return schema[identity.SCALAR];
    const matchWithTest = [];
    for (const tag of schema.tags) {
      if (!tag.collection && tag.tag === tagName) {
        if (tag.default && tag.test)
          matchWithTest.push(tag);
        else
          return tag;
      }
    }
    for (const tag of matchWithTest)
      if (tag.test?.test(value))
        return tag;
    const kt = schema.knownTags[tagName];
    if (kt && !kt.collection) {
      schema.tags.push(Object.assign({}, kt, { default: false, test: undefined }));
      return kt;
    }
    onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
    return schema[identity.SCALAR];
  }
  function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
    const tag = schema.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema[identity.SCALAR];
    if (schema.compat) {
      const compat = schema.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema[identity.SCALAR];
      if (tag.tag !== compat.tag) {
        const ts = directives.tagString(tag.tag);
        const cs = directives.tagString(compat.tag);
        const msg = `Value may be parsed as either ${ts} or ${cs}`;
        onError(token, "TAG_RESOLVE_FAILED", msg, true);
      }
    }
    return tag;
  }
  exports.composeScalar = composeScalar;
});

// node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS((exports) => {
  function emptyScalarPosition(offset, before, pos) {
    if (before) {
      if (pos === null)
        pos = before.length;
      for (let i = pos - 1;i >= 0; --i) {
        let st = before[i];
        switch (st.type) {
          case "space":
          case "comment":
          case "newline":
            offset -= st.source.length;
            continue;
        }
        st = before[++i];
        while (st?.type === "space") {
          offset += st.source.length;
          st = before[++i];
        }
        break;
      }
    }
    return offset;
  }
  exports.emptyScalarPosition = emptyScalarPosition;
});

// node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS((exports) => {
  var Alias = require_Alias();
  var identity = require_identity();
  var composeCollection = require_compose_collection();
  var composeScalar = require_compose_scalar();
  var resolveEnd = require_resolve_end();
  var utilEmptyScalarPosition = require_util_empty_scalar_position();
  var CN = { composeNode, composeEmptyNode };
  function composeNode(ctx, token, props, onError) {
    const atKey = ctx.atKey;
    const { spaceBefore, comment, anchor, tag } = props;
    let node;
    let isSrcToken = true;
    switch (token.type) {
      case "alias":
        node = composeAlias(ctx, token, onError);
        if (anchor || tag)
          onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
        break;
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "block-scalar":
        node = composeScalar.composeScalar(ctx, token, tag, onError);
        if (anchor)
          node.anchor = anchor.source.substring(1);
        break;
      case "block-map":
      case "block-seq":
      case "flow-collection":
        node = composeCollection.composeCollection(CN, ctx, token, props, onError);
        if (anchor)
          node.anchor = anchor.source.substring(1);
        break;
      default: {
        const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
        onError(token, "UNEXPECTED_TOKEN", message);
        node = composeEmptyNode(ctx, token.offset, undefined, null, props, onError);
        isSrcToken = false;
      }
    }
    if (anchor && node.anchor === "")
      onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
    if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
      const msg = "With stringKeys, all keys must be strings";
      onError(tag ?? token, "NON_STRING_KEY", msg);
    }
    if (spaceBefore)
      node.spaceBefore = true;
    if (comment) {
      if (token.type === "scalar" && token.source === "")
        node.comment = comment;
      else
        node.commentBefore = comment;
    }
    if (ctx.options.keepSourceTokens && isSrcToken)
      node.srcToken = token;
    return node;
  }
  function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
    const token = {
      type: "scalar",
      offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
      indent: -1,
      source: ""
    };
    const node = composeScalar.composeScalar(ctx, token, tag, onError);
    if (anchor) {
      node.anchor = anchor.source.substring(1);
      if (node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
    }
    if (spaceBefore)
      node.spaceBefore = true;
    if (comment) {
      node.comment = comment;
      node.range[2] = end;
    }
    return node;
  }
  function composeAlias({ options }, { offset, source, end }, onError) {
    const alias = new Alias.Alias(source.substring(1));
    if (alias.source === "")
      onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
    if (alias.source.endsWith(":"))
      onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
    const valueEnd = offset + source.length;
    const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
    alias.range = [offset, valueEnd, re.offset];
    if (re.comment)
      alias.comment = re.comment;
    return alias;
  }
  exports.composeEmptyNode = composeEmptyNode;
  exports.composeNode = composeNode;
});

// node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS((exports) => {
  var Document = require_Document();
  var composeNode = require_compose_node();
  var resolveEnd = require_resolve_end();
  var resolveProps = require_resolve_props();
  function composeDoc(options, directives, { offset, start, value, end }, onError) {
    const opts = Object.assign({ _directives: directives }, options);
    const doc = new Document.Document(undefined, opts);
    const ctx = {
      atKey: false,
      atRoot: true,
      directives: doc.directives,
      options: doc.options,
      schema: doc.schema
    };
    const props = resolveProps.resolveProps(start, {
      indicator: "doc-start",
      next: value ?? end?.[0],
      offset,
      onError,
      parentIndent: 0,
      startOnNewline: true
    });
    if (props.found) {
      doc.directives.docStart = true;
      if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
        onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
    }
    doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
    const contentEnd = doc.contents.range[2];
    const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
    if (re.comment)
      doc.comment = re.comment;
    doc.range = [offset, contentEnd, re.offset];
    return doc;
  }
  exports.composeDoc = composeDoc;
});

// node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS((exports) => {
  var node_process = __require("node:process");
  var directives = require_directives();
  var Document = require_Document();
  var errors = require_errors();
  var identity = require_identity();
  var composeDoc = require_compose_doc();
  var resolveEnd = require_resolve_end();
  function getErrorPos(src) {
    if (typeof src === "number")
      return [src, src + 1];
    if (Array.isArray(src))
      return src.length === 2 ? src : [src[0], src[1]];
    const { offset, source } = src;
    return [offset, offset + (typeof source === "string" ? source.length : 1)];
  }
  function parsePrelude(prelude) {
    let comment = "";
    let atComment = false;
    let afterEmptyLine = false;
    for (let i = 0;i < prelude.length; ++i) {
      const source = prelude[i];
      switch (source[0]) {
        case "#":
          comment += (comment === "" ? "" : afterEmptyLine ? `

` : `
`) + (source.substring(1) || " ");
          atComment = true;
          afterEmptyLine = false;
          break;
        case "%":
          if (prelude[i + 1]?.[0] !== "#")
            i += 1;
          atComment = false;
          break;
        default:
          if (!atComment)
            afterEmptyLine = true;
          atComment = false;
      }
    }
    return { comment, afterEmptyLine };
  }

  class Composer {
    constructor(options = {}) {
      this.doc = null;
      this.atDirectives = false;
      this.prelude = [];
      this.errors = [];
      this.warnings = [];
      this.onError = (source, code, message, warning) => {
        const pos = getErrorPos(source);
        if (warning)
          this.warnings.push(new errors.YAMLWarning(pos, code, message));
        else
          this.errors.push(new errors.YAMLParseError(pos, code, message));
      };
      this.directives = new directives.Directives({ version: options.version || "1.2" });
      this.options = options;
    }
    decorate(doc, afterDoc) {
      const { comment, afterEmptyLine } = parsePrelude(this.prelude);
      if (comment) {
        const dc = doc.contents;
        if (afterDoc) {
          doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
        } else if (afterEmptyLine || doc.directives.docStart || !dc) {
          doc.commentBefore = comment;
        } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
          let it = dc.items[0];
          if (identity.isPair(it))
            it = it.key;
          const cb = it.commentBefore;
          it.commentBefore = cb ? `${comment}
${cb}` : comment;
        } else {
          const cb = dc.commentBefore;
          dc.commentBefore = cb ? `${comment}
${cb}` : comment;
        }
      }
      if (afterDoc) {
        Array.prototype.push.apply(doc.errors, this.errors);
        Array.prototype.push.apply(doc.warnings, this.warnings);
      } else {
        doc.errors = this.errors;
        doc.warnings = this.warnings;
      }
      this.prelude = [];
      this.errors = [];
      this.warnings = [];
    }
    streamInfo() {
      return {
        comment: parsePrelude(this.prelude).comment,
        directives: this.directives,
        errors: this.errors,
        warnings: this.warnings
      };
    }
    *compose(tokens, forceDoc = false, endOffset = -1) {
      for (const token of tokens)
        yield* this.next(token);
      yield* this.end(forceDoc, endOffset);
    }
    *next(token) {
      if (node_process.env.LOG_STREAM)
        console.dir(token, { depth: null });
      switch (token.type) {
        case "directive":
          this.directives.add(token.source, (offset, message, warning) => {
            const pos = getErrorPos(token);
            pos[0] += offset;
            this.onError(pos, "BAD_DIRECTIVE", message, warning);
          });
          this.prelude.push(token.source);
          this.atDirectives = true;
          break;
        case "document": {
          const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
          if (this.atDirectives && !doc.directives.docStart)
            this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
          this.decorate(doc, false);
          if (this.doc)
            yield this.doc;
          this.doc = doc;
          this.atDirectives = false;
          break;
        }
        case "byte-order-mark":
        case "space":
          break;
        case "comment":
        case "newline":
          this.prelude.push(token.source);
          break;
        case "error": {
          const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
          const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
          if (this.atDirectives || !this.doc)
            this.errors.push(error);
          else
            this.doc.errors.push(error);
          break;
        }
        case "doc-end": {
          if (!this.doc) {
            const msg = "Unexpected doc-end without preceding document";
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
            break;
          }
          this.doc.directives.docEnd = true;
          const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
          this.decorate(this.doc, true);
          if (end.comment) {
            const dc = this.doc.comment;
            this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
          }
          this.doc.range[2] = end.offset;
          break;
        }
        default:
          this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
      }
    }
    *end(forceDoc = false, endOffset = -1) {
      if (this.doc) {
        this.decorate(this.doc, true);
        yield this.doc;
        this.doc = null;
      } else if (forceDoc) {
        const opts = Object.assign({ _directives: this.directives }, this.options);
        const doc = new Document.Document(undefined, opts);
        if (this.atDirectives)
          this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
        doc.range = [0, endOffset, endOffset];
        this.decorate(doc, false);
        yield doc;
      }
    }
  }
  exports.Composer = Composer;
});

// node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS((exports) => {
  var resolveBlockScalar = require_resolve_block_scalar();
  var resolveFlowScalar = require_resolve_flow_scalar();
  var errors = require_errors();
  var stringifyString = require_stringifyString();
  function resolveAsScalar(token, strict = true, onError) {
    if (token) {
      const _onError = (pos, code, message) => {
        const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
        if (onError)
          onError(offset, code, message);
        else
          throw new errors.YAMLParseError([offset, offset + 1], code, message);
      };
      switch (token.type) {
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
        case "block-scalar":
          return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
      }
    }
    return null;
  }
  function createScalarToken(value, context) {
    const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
    const source = stringifyString.stringifyString({ type, value }, {
      implicitKey,
      indent: indent > 0 ? " ".repeat(indent) : "",
      inFlow,
      options: { blockQuote: true, lineWidth: -1 }
    });
    const end = context.end ?? [
      { type: "newline", offset: -1, indent, source: `
` }
    ];
    switch (source[0]) {
      case "|":
      case ">": {
        const he = source.indexOf(`
`);
        const head = source.substring(0, he);
        const body = source.substring(he + 1) + `
`;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, end))
          props.push({ type: "newline", offset: -1, indent, source: `
` });
        return { type: "block-scalar", offset, indent, props, source: body };
      }
      case '"':
        return { type: "double-quoted-scalar", offset, indent, source, end };
      case "'":
        return { type: "single-quoted-scalar", offset, indent, source, end };
      default:
        return { type: "scalar", offset, indent, source, end };
    }
  }
  function setScalarValue(token, value, context = {}) {
    let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
    let indent = "indent" in token ? token.indent : null;
    if (afterKey && typeof indent === "number")
      indent += 2;
    if (!type)
      switch (token.type) {
        case "single-quoted-scalar":
          type = "QUOTE_SINGLE";
          break;
        case "double-quoted-scalar":
          type = "QUOTE_DOUBLE";
          break;
        case "block-scalar": {
          const header = token.props[0];
          if (header.type !== "block-scalar-header")
            throw new Error("Invalid block scalar header");
          type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
          break;
        }
        default:
          type = "PLAIN";
      }
    const source = stringifyString.stringifyString({ type, value }, {
      implicitKey: implicitKey || indent === null,
      indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
      inFlow,
      options: { blockQuote: true, lineWidth: -1 }
    });
    switch (source[0]) {
      case "|":
      case ">":
        setBlockScalarValue(token, source);
        break;
      case '"':
        setFlowScalarValue(token, source, "double-quoted-scalar");
        break;
      case "'":
        setFlowScalarValue(token, source, "single-quoted-scalar");
        break;
      default:
        setFlowScalarValue(token, source, "scalar");
    }
  }
  function setBlockScalarValue(token, source) {
    const he = source.indexOf(`
`);
    const head = source.substring(0, he);
    const body = source.substring(he + 1) + `
`;
    if (token.type === "block-scalar") {
      const header = token.props[0];
      if (header.type !== "block-scalar-header")
        throw new Error("Invalid block scalar header");
      header.source = head;
      token.source = body;
    } else {
      const { offset } = token;
      const indent = "indent" in token ? token.indent : -1;
      const props = [
        { type: "block-scalar-header", offset, indent, source: head }
      ];
      if (!addEndtoBlockProps(props, "end" in token ? token.end : undefined))
        props.push({ type: "newline", offset: -1, indent, source: `
` });
      for (const key of Object.keys(token))
        if (key !== "type" && key !== "offset")
          delete token[key];
      Object.assign(token, { type: "block-scalar", indent, props, source: body });
    }
  }
  function addEndtoBlockProps(props, end) {
    if (end)
      for (const st of end)
        switch (st.type) {
          case "space":
          case "comment":
            props.push(st);
            break;
          case "newline":
            props.push(st);
            return true;
        }
    return false;
  }
  function setFlowScalarValue(token, source, type) {
    switch (token.type) {
      case "scalar":
      case "double-quoted-scalar":
      case "single-quoted-scalar":
        token.type = type;
        token.source = source;
        break;
      case "block-scalar": {
        const end = token.props.slice(1);
        let oa = source.length;
        if (token.props[0].type === "block-scalar-header")
          oa -= token.props[0].source.length;
        for (const tok of end)
          tok.offset += oa;
        delete token.props;
        Object.assign(token, { type, source, end });
        break;
      }
      case "block-map":
      case "block-seq": {
        const offset = token.offset + source.length;
        const nl = { type: "newline", offset, indent: token.indent, source: `
` };
        delete token.items;
        Object.assign(token, { type, source, end: [nl] });
        break;
      }
      default: {
        const indent = "indent" in token ? token.indent : -1;
        const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type, indent, source, end });
      }
    }
  }
  exports.createScalarToken = createScalarToken;
  exports.resolveAsScalar = resolveAsScalar;
  exports.setScalarValue = setScalarValue;
});

// node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS((exports) => {
  var stringify = (cst) => ("type" in cst) ? stringifyToken(cst) : stringifyItem(cst);
  function stringifyToken(token) {
    switch (token.type) {
      case "block-scalar": {
        let res = "";
        for (const tok of token.props)
          res += stringifyToken(tok);
        return res + token.source;
      }
      case "block-map":
      case "block-seq": {
        let res = "";
        for (const item of token.items)
          res += stringifyItem(item);
        return res;
      }
      case "flow-collection": {
        let res = token.start.source;
        for (const item of token.items)
          res += stringifyItem(item);
        for (const st of token.end)
          res += st.source;
        return res;
      }
      case "document": {
        let res = stringifyItem(token);
        if (token.end)
          for (const st of token.end)
            res += st.source;
        return res;
      }
      default: {
        let res = token.source;
        if ("end" in token && token.end)
          for (const st of token.end)
            res += st.source;
        return res;
      }
    }
  }
  function stringifyItem({ start, key, sep, value }) {
    let res = "";
    for (const st of start)
      res += st.source;
    if (key)
      res += stringifyToken(key);
    if (sep)
      for (const st of sep)
        res += st.source;
    if (value)
      res += stringifyToken(value);
    return res;
  }
  exports.stringify = stringify;
});

// node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS((exports) => {
  var BREAK = Symbol("break visit");
  var SKIP = Symbol("skip children");
  var REMOVE = Symbol("remove item");
  function visit(cst, visitor) {
    if ("type" in cst && cst.type === "document")
      cst = { start: cst.start, value: cst.value };
    _visit(Object.freeze([]), cst, visitor);
  }
  visit.BREAK = BREAK;
  visit.SKIP = SKIP;
  visit.REMOVE = REMOVE;
  visit.itemAtPath = (cst, path) => {
    let item = cst;
    for (const [field, index] of path) {
      const tok = item?.[field];
      if (tok && "items" in tok) {
        item = tok.items[index];
      } else
        return;
    }
    return item;
  };
  visit.parentCollection = (cst, path) => {
    const parent = visit.itemAtPath(cst, path.slice(0, -1));
    const field = path[path.length - 1][0];
    const coll = parent?.[field];
    if (coll && "items" in coll)
      return coll;
    throw new Error("Parent collection not found");
  };
  function _visit(path, item, visitor) {
    let ctrl = visitor(item, path);
    if (typeof ctrl === "symbol")
      return ctrl;
    for (const field of ["key", "value"]) {
      const token = item[field];
      if (token && "items" in token) {
        for (let i = 0;i < token.items.length; ++i) {
          const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
          if (typeof ci === "number")
            i = ci - 1;
          else if (ci === BREAK)
            return BREAK;
          else if (ci === REMOVE) {
            token.items.splice(i, 1);
            i -= 1;
          }
        }
        if (typeof ctrl === "function" && field === "key")
          ctrl = ctrl(item, path);
      }
    }
    return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
  }
  exports.visit = visit;
});

// node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS((exports) => {
  var cstScalar = require_cst_scalar();
  var cstStringify = require_cst_stringify();
  var cstVisit = require_cst_visit();
  var BOM = "\uFEFF";
  var DOCUMENT = "\x02";
  var FLOW_END = "\x18";
  var SCALAR = "\x1F";
  var isCollection = (token) => !!token && ("items" in token);
  var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
  function prettyToken(token) {
    switch (token) {
      case BOM:
        return "<BOM>";
      case DOCUMENT:
        return "<DOC>";
      case FLOW_END:
        return "<FLOW_END>";
      case SCALAR:
        return "<SCALAR>";
      default:
        return JSON.stringify(token);
    }
  }
  function tokenType(source) {
    switch (source) {
      case BOM:
        return "byte-order-mark";
      case DOCUMENT:
        return "doc-mode";
      case FLOW_END:
        return "flow-error-end";
      case SCALAR:
        return "scalar";
      case "---":
        return "doc-start";
      case "...":
        return "doc-end";
      case "":
      case `
`:
      case `\r
`:
        return "newline";
      case "-":
        return "seq-item-ind";
      case "?":
        return "explicit-key-ind";
      case ":":
        return "map-value-ind";
      case "{":
        return "flow-map-start";
      case "}":
        return "flow-map-end";
      case "[":
        return "flow-seq-start";
      case "]":
        return "flow-seq-end";
      case ",":
        return "comma";
    }
    switch (source[0]) {
      case " ":
      case "\t":
        return "space";
      case "#":
        return "comment";
      case "%":
        return "directive-line";
      case "*":
        return "alias";
      case "&":
        return "anchor";
      case "!":
        return "tag";
      case "'":
        return "single-quoted-scalar";
      case '"':
        return "double-quoted-scalar";
      case "|":
      case ">":
        return "block-scalar-header";
    }
    return null;
  }
  exports.createScalarToken = cstScalar.createScalarToken;
  exports.resolveAsScalar = cstScalar.resolveAsScalar;
  exports.setScalarValue = cstScalar.setScalarValue;
  exports.stringify = cstStringify.stringify;
  exports.visit = cstVisit.visit;
  exports.BOM = BOM;
  exports.DOCUMENT = DOCUMENT;
  exports.FLOW_END = FLOW_END;
  exports.SCALAR = SCALAR;
  exports.isCollection = isCollection;
  exports.isScalar = isScalar;
  exports.prettyToken = prettyToken;
  exports.tokenType = tokenType;
});

// node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS((exports) => {
  var cst = require_cst();
  function isEmpty(ch) {
    switch (ch) {
      case undefined:
      case " ":
      case `
`:
      case "\r":
      case "\t":
        return true;
      default:
        return false;
    }
  }
  var hexDigits = new Set("0123456789ABCDEFabcdef");
  var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
  var flowIndicatorChars = new Set(",[]{}");
  var invalidAnchorChars = new Set(` ,[]{}
\r\t`);
  var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);

  class Lexer {
    constructor() {
      this.atEnd = false;
      this.blockScalarIndent = -1;
      this.blockScalarKeep = false;
      this.buffer = "";
      this.flowKey = false;
      this.flowLevel = 0;
      this.indentNext = 0;
      this.indentValue = 0;
      this.lineEndPos = null;
      this.next = null;
      this.pos = 0;
    }
    *lex(source, incomplete = false) {
      if (source) {
        if (typeof source !== "string")
          throw TypeError("source is not a string");
        this.buffer = this.buffer ? this.buffer + source : source;
        this.lineEndPos = null;
      }
      this.atEnd = !incomplete;
      let next = this.next ?? "stream";
      while (next && (incomplete || this.hasChars(1)))
        next = yield* this.parseNext(next);
    }
    atLineEnd() {
      let i = this.pos;
      let ch = this.buffer[i];
      while (ch === " " || ch === "\t")
        ch = this.buffer[++i];
      if (!ch || ch === "#" || ch === `
`)
        return true;
      if (ch === "\r")
        return this.buffer[i + 1] === `
`;
      return false;
    }
    charAt(n) {
      return this.buffer[this.pos + n];
    }
    continueScalar(offset) {
      let ch = this.buffer[offset];
      if (this.indentNext > 0) {
        let indent = 0;
        while (ch === " ")
          ch = this.buffer[++indent + offset];
        if (ch === "\r") {
          const next = this.buffer[indent + offset + 1];
          if (next === `
` || !next && !this.atEnd)
            return offset + indent + 1;
        }
        return ch === `
` || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
      }
      if (ch === "-" || ch === ".") {
        const dt = this.buffer.substr(offset, 3);
        if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
          return -1;
      }
      return offset;
    }
    getLine() {
      let end = this.lineEndPos;
      if (typeof end !== "number" || end !== -1 && end < this.pos) {
        end = this.buffer.indexOf(`
`, this.pos);
        this.lineEndPos = end;
      }
      if (end === -1)
        return this.atEnd ? this.buffer.substring(this.pos) : null;
      if (this.buffer[end - 1] === "\r")
        end -= 1;
      return this.buffer.substring(this.pos, end);
    }
    hasChars(n) {
      return this.pos + n <= this.buffer.length;
    }
    setNext(state) {
      this.buffer = this.buffer.substring(this.pos);
      this.pos = 0;
      this.lineEndPos = null;
      this.next = state;
      return null;
    }
    peek(n) {
      return this.buffer.substr(this.pos, n);
    }
    *parseNext(next) {
      switch (next) {
        case "stream":
          return yield* this.parseStream();
        case "line-start":
          return yield* this.parseLineStart();
        case "block-start":
          return yield* this.parseBlockStart();
        case "doc":
          return yield* this.parseDocument();
        case "flow":
          return yield* this.parseFlowCollection();
        case "quoted-scalar":
          return yield* this.parseQuotedScalar();
        case "block-scalar":
          return yield* this.parseBlockScalar();
        case "plain-scalar":
          return yield* this.parsePlainScalar();
      }
    }
    *parseStream() {
      let line = this.getLine();
      if (line === null)
        return this.setNext("stream");
      if (line[0] === cst.BOM) {
        yield* this.pushCount(1);
        line = line.substring(1);
      }
      if (line[0] === "%") {
        let dirEnd = line.length;
        let cs = line.indexOf("#");
        while (cs !== -1) {
          const ch = line[cs - 1];
          if (ch === " " || ch === "\t") {
            dirEnd = cs - 1;
            break;
          } else {
            cs = line.indexOf("#", cs + 1);
          }
        }
        while (true) {
          const ch = line[dirEnd - 1];
          if (ch === " " || ch === "\t")
            dirEnd -= 1;
          else
            break;
        }
        const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
        yield* this.pushCount(line.length - n);
        this.pushNewline();
        return "stream";
      }
      if (this.atLineEnd()) {
        const sp = yield* this.pushSpaces(true);
        yield* this.pushCount(line.length - sp);
        yield* this.pushNewline();
        return "stream";
      }
      yield cst.DOCUMENT;
      return yield* this.parseLineStart();
    }
    *parseLineStart() {
      const ch = this.charAt(0);
      if (!ch && !this.atEnd)
        return this.setNext("line-start");
      if (ch === "-" || ch === ".") {
        if (!this.atEnd && !this.hasChars(4))
          return this.setNext("line-start");
        const s = this.peek(3);
        if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
          yield* this.pushCount(3);
          this.indentValue = 0;
          this.indentNext = 0;
          return s === "---" ? "doc" : "stream";
        }
      }
      this.indentValue = yield* this.pushSpaces(false);
      if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
        this.indentNext = this.indentValue;
      return yield* this.parseBlockStart();
    }
    *parseBlockStart() {
      const [ch0, ch1] = this.peek(2);
      if (!ch1 && !this.atEnd)
        return this.setNext("block-start");
      if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
        const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
        this.indentNext = this.indentValue + 1;
        this.indentValue += n;
        return yield* this.parseBlockStart();
      }
      return "doc";
    }
    *parseDocument() {
      yield* this.pushSpaces(true);
      const line = this.getLine();
      if (line === null)
        return this.setNext("doc");
      let n = yield* this.pushIndicators();
      switch (line[n]) {
        case "#":
          yield* this.pushCount(line.length - n);
        case undefined:
          yield* this.pushNewline();
          return yield* this.parseLineStart();
        case "{":
        case "[":
          yield* this.pushCount(1);
          this.flowKey = false;
          this.flowLevel = 1;
          return "flow";
        case "}":
        case "]":
          yield* this.pushCount(1);
          return "doc";
        case "*":
          yield* this.pushUntil(isNotAnchorChar);
          return "doc";
        case '"':
        case "'":
          return yield* this.parseQuotedScalar();
        case "|":
        case ">":
          n += yield* this.parseBlockScalarHeader();
          n += yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - n);
          yield* this.pushNewline();
          return yield* this.parseBlockScalar();
        default:
          return yield* this.parsePlainScalar();
      }
    }
    *parseFlowCollection() {
      let nl, sp;
      let indent = -1;
      do {
        nl = yield* this.pushNewline();
        if (nl > 0) {
          sp = yield* this.pushSpaces(false);
          this.indentValue = indent = sp;
        } else {
          sp = 0;
        }
        sp += yield* this.pushSpaces(true);
      } while (nl + sp > 0);
      const line = this.getLine();
      if (line === null)
        return this.setNext("flow");
      if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
        const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
        if (!atFlowEndMarker) {
          this.flowLevel = 0;
          yield cst.FLOW_END;
          return yield* this.parseLineStart();
        }
      }
      let n = 0;
      while (line[n] === ",") {
        n += yield* this.pushCount(1);
        n += yield* this.pushSpaces(true);
        this.flowKey = false;
      }
      n += yield* this.pushIndicators();
      switch (line[n]) {
        case undefined:
          return "flow";
        case "#":
          yield* this.pushCount(line.length - n);
          return "flow";
        case "{":
        case "[":
          yield* this.pushCount(1);
          this.flowKey = false;
          this.flowLevel += 1;
          return "flow";
        case "}":
        case "]":
          yield* this.pushCount(1);
          this.flowKey = true;
          this.flowLevel -= 1;
          return this.flowLevel ? "flow" : "doc";
        case "*":
          yield* this.pushUntil(isNotAnchorChar);
          return "flow";
        case '"':
        case "'":
          this.flowKey = true;
          return yield* this.parseQuotedScalar();
        case ":": {
          const next = this.charAt(1);
          if (this.flowKey || isEmpty(next) || next === ",") {
            this.flowKey = false;
            yield* this.pushCount(1);
            yield* this.pushSpaces(true);
            return "flow";
          }
        }
        default:
          this.flowKey = false;
          return yield* this.parsePlainScalar();
      }
    }
    *parseQuotedScalar() {
      const quote = this.charAt(0);
      let end = this.buffer.indexOf(quote, this.pos + 1);
      if (quote === "'") {
        while (end !== -1 && this.buffer[end + 1] === "'")
          end = this.buffer.indexOf("'", end + 2);
      } else {
        while (end !== -1) {
          let n = 0;
          while (this.buffer[end - 1 - n] === "\\")
            n += 1;
          if (n % 2 === 0)
            break;
          end = this.buffer.indexOf('"', end + 1);
        }
      }
      const qb = this.buffer.substring(0, end);
      let nl = qb.indexOf(`
`, this.pos);
      if (nl !== -1) {
        while (nl !== -1) {
          const cs = this.continueScalar(nl + 1);
          if (cs === -1)
            break;
          nl = qb.indexOf(`
`, cs);
        }
        if (nl !== -1) {
          end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
        }
      }
      if (end === -1) {
        if (!this.atEnd)
          return this.setNext("quoted-scalar");
        end = this.buffer.length;
      }
      yield* this.pushToIndex(end + 1, false);
      return this.flowLevel ? "flow" : "doc";
    }
    *parseBlockScalarHeader() {
      this.blockScalarIndent = -1;
      this.blockScalarKeep = false;
      let i = this.pos;
      while (true) {
        const ch = this.buffer[++i];
        if (ch === "+")
          this.blockScalarKeep = true;
        else if (ch > "0" && ch <= "9")
          this.blockScalarIndent = Number(ch) - 1;
        else if (ch !== "-")
          break;
      }
      return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
    }
    *parseBlockScalar() {
      let nl = this.pos - 1;
      let indent = 0;
      let ch;
      loop:
        for (let i2 = this.pos;ch = this.buffer[i2]; ++i2) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case `
`:
              nl = i2;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i2 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === `
`)
                break;
            }
            default:
              break loop;
          }
        }
      if (!ch && !this.atEnd)
        return this.setNext("block-scalar");
      if (indent >= this.indentNext) {
        if (this.blockScalarIndent === -1)
          this.indentNext = indent;
        else {
          this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
        }
        do {
          const cs = this.continueScalar(nl + 1);
          if (cs === -1)
            break;
          nl = this.buffer.indexOf(`
`, cs);
        } while (nl !== -1);
        if (nl === -1) {
          if (!this.atEnd)
            return this.setNext("block-scalar");
          nl = this.buffer.length;
        }
      }
      let i = nl + 1;
      ch = this.buffer[i];
      while (ch === " ")
        ch = this.buffer[++i];
      if (ch === "\t") {
        while (ch === "\t" || ch === " " || ch === "\r" || ch === `
`)
          ch = this.buffer[++i];
        nl = i - 1;
      } else if (!this.blockScalarKeep) {
        do {
          let i2 = nl - 1;
          let ch2 = this.buffer[i2];
          if (ch2 === "\r")
            ch2 = this.buffer[--i2];
          const lastChar = i2;
          while (ch2 === " ")
            ch2 = this.buffer[--i2];
          if (ch2 === `
` && i2 >= this.pos && i2 + 1 + indent > lastChar)
            nl = i2;
          else
            break;
        } while (true);
      }
      yield cst.SCALAR;
      yield* this.pushToIndex(nl + 1, true);
      return yield* this.parseLineStart();
    }
    *parsePlainScalar() {
      const inFlow = this.flowLevel > 0;
      let end = this.pos - 1;
      let i = this.pos - 1;
      let ch;
      while (ch = this.buffer[++i]) {
        if (ch === ":") {
          const next = this.buffer[i + 1];
          if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
            break;
          end = i;
        } else if (isEmpty(ch)) {
          let next = this.buffer[i + 1];
          if (ch === "\r") {
            if (next === `
`) {
              i += 1;
              ch = `
`;
              next = this.buffer[i + 1];
            } else
              end = i;
          }
          if (next === "#" || inFlow && flowIndicatorChars.has(next))
            break;
          if (ch === `
`) {
            const cs = this.continueScalar(i + 1);
            if (cs === -1)
              break;
            i = Math.max(i, cs - 2);
          }
        } else {
          if (inFlow && flowIndicatorChars.has(ch))
            break;
          end = i;
        }
      }
      if (!ch && !this.atEnd)
        return this.setNext("plain-scalar");
      yield cst.SCALAR;
      yield* this.pushToIndex(end + 1, true);
      return inFlow ? "flow" : "doc";
    }
    *pushCount(n) {
      if (n > 0) {
        yield this.buffer.substr(this.pos, n);
        this.pos += n;
        return n;
      }
      return 0;
    }
    *pushToIndex(i, allowEmpty) {
      const s = this.buffer.slice(this.pos, i);
      if (s) {
        yield s;
        this.pos += s.length;
        return s.length;
      } else if (allowEmpty)
        yield "";
      return 0;
    }
    *pushIndicators() {
      switch (this.charAt(0)) {
        case "!":
          return (yield* this.pushTag()) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
        case "&":
          return (yield* this.pushUntil(isNotAnchorChar)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
        case "-":
        case "?":
        case ":": {
          const inFlow = this.flowLevel > 0;
          const ch1 = this.charAt(1);
          if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
            if (!inFlow)
              this.indentNext = this.indentValue + 1;
            else if (this.flowKey)
              this.flowKey = false;
            return (yield* this.pushCount(1)) + (yield* this.pushSpaces(true)) + (yield* this.pushIndicators());
          }
        }
      }
      return 0;
    }
    *pushTag() {
      if (this.charAt(1) === "<") {
        let i = this.pos + 2;
        let ch = this.buffer[i];
        while (!isEmpty(ch) && ch !== ">")
          ch = this.buffer[++i];
        return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
      } else {
        let i = this.pos + 1;
        let ch = this.buffer[i];
        while (ch) {
          if (tagChars.has(ch))
            ch = this.buffer[++i];
          else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
            ch = this.buffer[i += 3];
          } else
            break;
        }
        return yield* this.pushToIndex(i, false);
      }
    }
    *pushNewline() {
      const ch = this.buffer[this.pos];
      if (ch === `
`)
        return yield* this.pushCount(1);
      else if (ch === "\r" && this.charAt(1) === `
`)
        return yield* this.pushCount(2);
      else
        return 0;
    }
    *pushSpaces(allowTabs) {
      let i = this.pos - 1;
      let ch;
      do {
        ch = this.buffer[++i];
      } while (ch === " " || allowTabs && ch === "\t");
      const n = i - this.pos;
      if (n > 0) {
        yield this.buffer.substr(this.pos, n);
        this.pos = i;
      }
      return n;
    }
    *pushUntil(test) {
      let i = this.pos;
      let ch = this.buffer[i];
      while (!test(ch))
        ch = this.buffer[++i];
      return yield* this.pushToIndex(i, false);
    }
  }
  exports.Lexer = Lexer;
});

// node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS((exports) => {
  class LineCounter {
    constructor() {
      this.lineStarts = [];
      this.addNewLine = (offset) => this.lineStarts.push(offset);
      this.linePos = (offset) => {
        let low = 0;
        let high = this.lineStarts.length;
        while (low < high) {
          const mid = low + high >> 1;
          if (this.lineStarts[mid] < offset)
            low = mid + 1;
          else
            high = mid;
        }
        if (this.lineStarts[low] === offset)
          return { line: low + 1, col: 1 };
        if (low === 0)
          return { line: 0, col: offset };
        const start = this.lineStarts[low - 1];
        return { line: low, col: offset - start + 1 };
      };
    }
  }
  exports.LineCounter = LineCounter;
});

// node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS((exports) => {
  var node_process = __require("node:process");
  var cst = require_cst();
  var lexer = require_lexer();
  function includesToken(list, type) {
    for (let i = 0;i < list.length; ++i)
      if (list[i].type === type)
        return true;
    return false;
  }
  function findNonEmptyIndex(list) {
    for (let i = 0;i < list.length; ++i) {
      switch (list[i].type) {
        case "space":
        case "comment":
        case "newline":
          break;
        default:
          return i;
      }
    }
    return -1;
  }
  function isFlowToken(token) {
    switch (token?.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
      case "flow-collection":
        return true;
      default:
        return false;
    }
  }
  function getPrevProps(parent) {
    switch (parent.type) {
      case "document":
        return parent.start;
      case "block-map": {
        const it = parent.items[parent.items.length - 1];
        return it.sep ?? it.start;
      }
      case "block-seq":
        return parent.items[parent.items.length - 1].start;
      default:
        return [];
    }
  }
  function getFirstKeyStartProps(prev) {
    if (prev.length === 0)
      return [];
    let i = prev.length;
    loop:
      while (--i >= 0) {
        switch (prev[i].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
    while (prev[++i]?.type === "space") {
    }
    return prev.splice(i, prev.length);
  }
  function fixFlowSeqItems(fc) {
    if (fc.start.type === "flow-seq-start") {
      for (const it of fc.items) {
        if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
          if (it.key)
            it.value = it.key;
          delete it.key;
          if (isFlowToken(it.value)) {
            if (it.value.end)
              Array.prototype.push.apply(it.value.end, it.sep);
            else
              it.value.end = it.sep;
          } else
            Array.prototype.push.apply(it.start, it.sep);
          delete it.sep;
        }
      }
    }
  }

  class Parser {
    constructor(onNewLine) {
      this.atNewLine = true;
      this.atScalar = false;
      this.indent = 0;
      this.offset = 0;
      this.onKeyLine = false;
      this.stack = [];
      this.source = "";
      this.type = "";
      this.lexer = new lexer.Lexer;
      this.onNewLine = onNewLine;
    }
    *parse(source, incomplete = false) {
      if (this.onNewLine && this.offset === 0)
        this.onNewLine(0);
      for (const lexeme of this.lexer.lex(source, incomplete))
        yield* this.next(lexeme);
      if (!incomplete)
        yield* this.end();
    }
    *next(source) {
      this.source = source;
      if (node_process.env.LOG_TOKENS)
        console.log("|", cst.prettyToken(source));
      if (this.atScalar) {
        this.atScalar = false;
        yield* this.step();
        this.offset += source.length;
        return;
      }
      const type = cst.tokenType(source);
      if (!type) {
        const message = `Not a YAML token: ${source}`;
        yield* this.pop({ type: "error", offset: this.offset, message, source });
        this.offset += source.length;
      } else if (type === "scalar") {
        this.atNewLine = false;
        this.atScalar = true;
        this.type = "scalar";
      } else {
        this.type = type;
        yield* this.step();
        switch (type) {
          case "newline":
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine)
              this.onNewLine(this.offset + source.length);
            break;
          case "space":
            if (this.atNewLine && source[0] === " ")
              this.indent += source.length;
            break;
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
            if (this.atNewLine)
              this.indent += source.length;
            break;
          case "doc-mode":
          case "flow-error-end":
            return;
          default:
            this.atNewLine = false;
        }
        this.offset += source.length;
      }
    }
    *end() {
      while (this.stack.length > 0)
        yield* this.pop();
    }
    get sourceToken() {
      const st = {
        type: this.type,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
      return st;
    }
    *step() {
      const top = this.peek(1);
      if (this.type === "doc-end" && (!top || top.type !== "doc-end")) {
        while (this.stack.length > 0)
          yield* this.pop();
        this.stack.push({
          type: "doc-end",
          offset: this.offset,
          source: this.source
        });
        return;
      }
      if (!top)
        return yield* this.stream();
      switch (top.type) {
        case "document":
          return yield* this.document(top);
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return yield* this.scalar(top);
        case "block-scalar":
          return yield* this.blockScalar(top);
        case "block-map":
          return yield* this.blockMap(top);
        case "block-seq":
          return yield* this.blockSequence(top);
        case "flow-collection":
          return yield* this.flowCollection(top);
        case "doc-end":
          return yield* this.documentEnd(top);
      }
      yield* this.pop();
    }
    peek(n) {
      return this.stack[this.stack.length - n];
    }
    *pop(error) {
      const token = error ?? this.stack.pop();
      if (!token) {
        const message = "Tried to pop an empty stack";
        yield { type: "error", offset: this.offset, source: "", message };
      } else if (this.stack.length === 0) {
        yield token;
      } else {
        const top = this.peek(1);
        if (token.type === "block-scalar") {
          token.indent = "indent" in top ? top.indent : 0;
        } else if (token.type === "flow-collection" && top.type === "document") {
          token.indent = 0;
        }
        if (token.type === "flow-collection")
          fixFlowSeqItems(token);
        switch (top.type) {
          case "document":
            top.value = token;
            break;
          case "block-scalar":
            top.props.push(token);
            break;
          case "block-map": {
            const it = top.items[top.items.length - 1];
            if (it.value) {
              top.items.push({ start: [], key: token, sep: [] });
              this.onKeyLine = true;
              return;
            } else if (it.sep) {
              it.value = token;
            } else {
              Object.assign(it, { key: token, sep: [] });
              this.onKeyLine = !it.explicitKey;
              return;
            }
            break;
          }
          case "block-seq": {
            const it = top.items[top.items.length - 1];
            if (it.value)
              top.items.push({ start: [], value: token });
            else
              it.value = token;
            break;
          }
          case "flow-collection": {
            const it = top.items[top.items.length - 1];
            if (!it || it.value)
              top.items.push({ start: [], key: token, sep: [] });
            else if (it.sep)
              it.value = token;
            else
              Object.assign(it, { key: token, sep: [] });
            return;
          }
          default:
            yield* this.pop();
            yield* this.pop(token);
        }
        if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
          const last = token.items[token.items.length - 1];
          if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
            if (top.type === "document")
              top.end = last.start;
            else
              top.items.push({ start: last.start });
            token.items.splice(-1, 1);
          }
        }
      }
    }
    *stream() {
      switch (this.type) {
        case "directive-line":
          yield { type: "directive", offset: this.offset, source: this.source };
          return;
        case "byte-order-mark":
        case "space":
        case "comment":
        case "newline":
          yield this.sourceToken;
          return;
        case "doc-mode":
        case "doc-start": {
          const doc = {
            type: "document",
            offset: this.offset,
            start: []
          };
          if (this.type === "doc-start")
            doc.start.push(this.sourceToken);
          this.stack.push(doc);
          return;
        }
      }
      yield {
        type: "error",
        offset: this.offset,
        message: `Unexpected ${this.type} token in YAML stream`,
        source: this.source
      };
    }
    *document(doc) {
      if (doc.value)
        return yield* this.lineEnd(doc);
      switch (this.type) {
        case "doc-start": {
          if (findNonEmptyIndex(doc.start) !== -1) {
            yield* this.pop();
            yield* this.step();
          } else
            doc.start.push(this.sourceToken);
          return;
        }
        case "anchor":
        case "tag":
        case "space":
        case "comment":
        case "newline":
          doc.start.push(this.sourceToken);
          return;
      }
      const bv = this.startBlockValue(doc);
      if (bv)
        this.stack.push(bv);
      else {
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML document`,
          source: this.source
        };
      }
    }
    *scalar(scalar) {
      if (this.type === "map-value-ind") {
        const prev = getPrevProps(this.peek(2));
        const start = getFirstKeyStartProps(prev);
        let sep;
        if (scalar.end) {
          sep = scalar.end;
          sep.push(this.sourceToken);
          delete scalar.end;
        } else
          sep = [this.sourceToken];
        const map = {
          type: "block-map",
          offset: scalar.offset,
          indent: scalar.indent,
          items: [{ start, key: scalar, sep }]
        };
        this.onKeyLine = true;
        this.stack[this.stack.length - 1] = map;
      } else
        yield* this.lineEnd(scalar);
    }
    *blockScalar(scalar) {
      switch (this.type) {
        case "space":
        case "comment":
        case "newline":
          scalar.props.push(this.sourceToken);
          return;
        case "scalar":
          scalar.source = this.source;
          this.atNewLine = true;
          this.indent = 0;
          if (this.onNewLine) {
            let nl = this.source.indexOf(`
`) + 1;
            while (nl !== 0) {
              this.onNewLine(this.offset + nl);
              nl = this.source.indexOf(`
`, nl) + 1;
            }
          }
          yield* this.pop();
          break;
        default:
          yield* this.pop();
          yield* this.step();
      }
    }
    *blockMap(map) {
      const it = map.items[map.items.length - 1];
      switch (this.type) {
        case "newline":
          this.onKeyLine = false;
          if (it.value) {
            const end = "end" in it.value ? it.value.end : undefined;
            const last = Array.isArray(end) ? end[end.length - 1] : undefined;
            if (last?.type === "comment")
              end?.push(this.sourceToken);
            else
              map.items.push({ start: [this.sourceToken] });
          } else if (it.sep) {
            it.sep.push(this.sourceToken);
          } else {
            it.start.push(this.sourceToken);
          }
          return;
        case "space":
        case "comment":
          if (it.value) {
            map.items.push({ start: [this.sourceToken] });
          } else if (it.sep) {
            it.sep.push(this.sourceToken);
          } else {
            if (this.atIndentedComment(it.start, map.indent)) {
              const prev = map.items[map.items.length - 2];
              const end = prev?.value?.end;
              if (Array.isArray(end)) {
                Array.prototype.push.apply(end, it.start);
                end.push(this.sourceToken);
                map.items.pop();
                return;
              }
            }
            it.start.push(this.sourceToken);
          }
          return;
      }
      if (this.indent >= map.indent) {
        const atMapIndent = !this.onKeyLine && this.indent === map.indent;
        const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
        let start = [];
        if (atNextItem && it.sep && !it.value) {
          const nl = [];
          for (let i = 0;i < it.sep.length; ++i) {
            const st = it.sep[i];
            switch (st.type) {
              case "newline":
                nl.push(i);
                break;
              case "space":
                break;
              case "comment":
                if (st.indent > map.indent)
                  nl.length = 0;
                break;
              default:
                nl.length = 0;
            }
          }
          if (nl.length >= 2)
            start = it.sep.splice(nl[1]);
        }
        switch (this.type) {
          case "anchor":
          case "tag":
            if (atNextItem || it.value) {
              start.push(this.sourceToken);
              map.items.push({ start });
              this.onKeyLine = true;
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "explicit-key-ind":
            if (!it.sep && !it.explicitKey) {
              it.start.push(this.sourceToken);
              it.explicitKey = true;
            } else if (atNextItem || it.value) {
              start.push(this.sourceToken);
              map.items.push({ start, explicitKey: true });
            } else {
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: [this.sourceToken], explicitKey: true }]
              });
            }
            this.onKeyLine = true;
            return;
          case "map-value-ind":
            if (it.explicitKey) {
              if (!it.sep) {
                if (includesToken(it.start, "newline")) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else {
                  const start2 = getFirstKeyStartProps(it.start);
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                  });
                }
              } else if (it.value) {
                map.items.push({ start: [], key: null, sep: [this.sourceToken] });
              } else if (includesToken(it.sep, "map-value-ind")) {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start, key: null, sep: [this.sourceToken] }]
                });
              } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                const start2 = getFirstKeyStartProps(it.start);
                const key = it.key;
                const sep = it.sep;
                sep.push(this.sourceToken);
                delete it.key;
                delete it.sep;
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: start2, key, sep }]
                });
              } else if (start.length > 0) {
                it.sep = it.sep.concat(start, this.sourceToken);
              } else {
                it.sep.push(this.sourceToken);
              }
            } else {
              if (!it.sep) {
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              } else if (it.value || atNextItem) {
                map.items.push({ start, key: null, sep: [this.sourceToken] });
              } else if (includesToken(it.sep, "map-value-ind")) {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [], key: null, sep: [this.sourceToken] }]
                });
              } else {
                it.sep.push(this.sourceToken);
              }
            }
            this.onKeyLine = true;
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const fs = this.flowScalar(this.type);
            if (atNextItem || it.value) {
              map.items.push({ start, key: fs, sep: [] });
              this.onKeyLine = true;
            } else if (it.sep) {
              this.stack.push(fs);
            } else {
              Object.assign(it, { key: fs, sep: [] });
              this.onKeyLine = true;
            }
            return;
          }
          default: {
            const bv = this.startBlockValue(map);
            if (bv) {
              if (atMapIndent && bv.type !== "block-seq") {
                map.items.push({ start });
              }
              this.stack.push(bv);
              return;
            }
          }
        }
      }
      yield* this.pop();
      yield* this.step();
    }
    *blockSequence(seq) {
      const it = seq.items[seq.items.length - 1];
      switch (this.type) {
        case "newline":
          if (it.value) {
            const end = "end" in it.value ? it.value.end : undefined;
            const last = Array.isArray(end) ? end[end.length - 1] : undefined;
            if (last?.type === "comment")
              end?.push(this.sourceToken);
            else
              seq.items.push({ start: [this.sourceToken] });
          } else
            it.start.push(this.sourceToken);
          return;
        case "space":
        case "comment":
          if (it.value)
            seq.items.push({ start: [this.sourceToken] });
          else {
            if (this.atIndentedComment(it.start, seq.indent)) {
              const prev = seq.items[seq.items.length - 2];
              const end = prev?.value?.end;
              if (Array.isArray(end)) {
                Array.prototype.push.apply(end, it.start);
                end.push(this.sourceToken);
                seq.items.pop();
                return;
              }
            }
            it.start.push(this.sourceToken);
          }
          return;
        case "anchor":
        case "tag":
          if (it.value || this.indent <= seq.indent)
            break;
          it.start.push(this.sourceToken);
          return;
        case "seq-item-ind":
          if (this.indent !== seq.indent)
            break;
          if (it.value || includesToken(it.start, "seq-item-ind"))
            seq.items.push({ start: [this.sourceToken] });
          else
            it.start.push(this.sourceToken);
          return;
      }
      if (this.indent > seq.indent) {
        const bv = this.startBlockValue(seq);
        if (bv) {
          this.stack.push(bv);
          return;
        }
      }
      yield* this.pop();
      yield* this.step();
    }
    *flowCollection(fc) {
      const it = fc.items[fc.items.length - 1];
      if (this.type === "flow-error-end") {
        let top;
        do {
          yield* this.pop();
          top = this.peek(1);
        } while (top && top.type === "flow-collection");
      } else if (fc.end.length === 0) {
        switch (this.type) {
          case "comma":
          case "explicit-key-ind":
            if (!it || it.sep)
              fc.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
          case "map-value-ind":
            if (!it || it.value)
              fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
            else if (it.sep)
              it.sep.push(this.sourceToken);
            else
              Object.assign(it, { key: null, sep: [this.sourceToken] });
            return;
          case "space":
          case "comment":
          case "newline":
          case "anchor":
          case "tag":
            if (!it || it.value)
              fc.items.push({ start: [this.sourceToken] });
            else if (it.sep)
              it.sep.push(this.sourceToken);
            else
              it.start.push(this.sourceToken);
            return;
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar": {
            const fs = this.flowScalar(this.type);
            if (!it || it.value)
              fc.items.push({ start: [], key: fs, sep: [] });
            else if (it.sep)
              this.stack.push(fs);
            else
              Object.assign(it, { key: fs, sep: [] });
            return;
          }
          case "flow-map-end":
          case "flow-seq-end":
            fc.end.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(fc);
        if (bv)
          this.stack.push(bv);
        else {
          yield* this.pop();
          yield* this.step();
        }
      } else {
        const parent = this.peek(2);
        if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
          yield* this.pop();
          yield* this.step();
        } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          fixFlowSeqItems(fc);
          const sep = fc.end.splice(1, fc.end.length);
          sep.push(this.sourceToken);
          const map = {
            type: "block-map",
            offset: fc.offset,
            indent: fc.indent,
            items: [{ start, key: fc, sep }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else {
          yield* this.lineEnd(fc);
        }
      }
    }
    flowScalar(type) {
      if (this.onNewLine) {
        let nl = this.source.indexOf(`
`) + 1;
        while (nl !== 0) {
          this.onNewLine(this.offset + nl);
          nl = this.source.indexOf(`
`, nl) + 1;
        }
      }
      return {
        type,
        offset: this.offset,
        indent: this.indent,
        source: this.source
      };
    }
    startBlockValue(parent) {
      switch (this.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
          return this.flowScalar(this.type);
        case "block-scalar-header":
          return {
            type: "block-scalar",
            offset: this.offset,
            indent: this.indent,
            props: [this.sourceToken],
            source: ""
          };
        case "flow-map-start":
        case "flow-seq-start":
          return {
            type: "flow-collection",
            offset: this.offset,
            indent: this.indent,
            start: this.sourceToken,
            items: [],
            end: []
          };
        case "seq-item-ind":
          return {
            type: "block-seq",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: [this.sourceToken] }]
          };
        case "explicit-key-ind": {
          this.onKeyLine = true;
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          start.push(this.sourceToken);
          return {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start, explicitKey: true }]
          };
        }
        case "map-value-ind": {
          this.onKeyLine = true;
          const prev = getPrevProps(parent);
          const start = getFirstKeyStartProps(prev);
          return {
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start, key: null, sep: [this.sourceToken] }]
          };
        }
      }
      return null;
    }
    atIndentedComment(start, indent) {
      if (this.type !== "comment")
        return false;
      if (this.indent <= indent)
        return false;
      return start.every((st) => st.type === "newline" || st.type === "space");
    }
    *documentEnd(docEnd) {
      if (this.type !== "doc-mode") {
        if (docEnd.end)
          docEnd.end.push(this.sourceToken);
        else
          docEnd.end = [this.sourceToken];
        if (this.type === "newline")
          yield* this.pop();
      }
    }
    *lineEnd(token) {
      switch (this.type) {
        case "comma":
        case "doc-start":
        case "doc-end":
        case "flow-seq-end":
        case "flow-map-end":
        case "map-value-ind":
          yield* this.pop();
          yield* this.step();
          break;
        case "newline":
          this.onKeyLine = false;
        case "space":
        case "comment":
        default:
          if (token.end)
            token.end.push(this.sourceToken);
          else
            token.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
      }
    }
  }
  exports.Parser = Parser;
});

// node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS((exports) => {
  var composer = require_composer();
  var Document = require_Document();
  var errors = require_errors();
  var log = require_log();
  var identity = require_identity();
  var lineCounter = require_line_counter();
  var parser = require_parser();
  function parseOptions(options) {
    const prettyErrors = options.prettyErrors !== false;
    const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter || null;
    return { lineCounter: lineCounter$1, prettyErrors };
  }
  function parseAllDocuments(source, options = {}) {
    const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
    const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
    const composer$1 = new composer.Composer(options);
    const docs = Array.from(composer$1.compose(parser$1.parse(source)));
    if (prettyErrors && lineCounter2)
      for (const doc of docs) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
    if (docs.length > 0)
      return docs;
    return Object.assign([], { empty: true }, composer$1.streamInfo());
  }
  function parseDocument(source, options = {}) {
    const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
    const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
    const composer$1 = new composer.Composer(options);
    let doc = null;
    for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
      if (!doc)
        doc = _doc;
      else if (doc.options.logLevel !== "silent") {
        doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
        break;
      }
    }
    if (prettyErrors && lineCounter2) {
      doc.errors.forEach(errors.prettifyError(source, lineCounter2));
      doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
    }
    return doc;
  }
  function parse(src, reviver, options) {
    let _reviver = undefined;
    if (typeof reviver === "function") {
      _reviver = reviver;
    } else if (options === undefined && reviver && typeof reviver === "object") {
      options = reviver;
    }
    const doc = parseDocument(src, options);
    if (!doc)
      return null;
    doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
    if (doc.errors.length > 0) {
      if (doc.options.logLevel !== "silent")
        throw doc.errors[0];
      else
        doc.errors = [];
    }
    return doc.toJS(Object.assign({ reviver: _reviver }, options));
  }
  function stringify(value, replacer, options) {
    let _replacer = null;
    if (typeof replacer === "function" || Array.isArray(replacer)) {
      _replacer = replacer;
    } else if (options === undefined && replacer) {
      options = replacer;
    }
    if (typeof options === "string")
      options = options.length;
    if (typeof options === "number") {
      const indent = Math.round(options);
      options = indent < 1 ? undefined : indent > 8 ? { indent: 8 } : { indent };
    }
    if (value === undefined) {
      const { keepUndefined } = options ?? replacer ?? {};
      if (!keepUndefined)
        return;
    }
    if (identity.isDocument(value) && !_replacer)
      return value.toString(options);
    return new Document.Document(value, _replacer, options).toString(options);
  }
  exports.parse = parse;
  exports.parseAllDocuments = parseAllDocuments;
  exports.parseDocument = parseDocument;
  exports.stringify = stringify;
});

// node_modules/yaml/dist/index.js
var require_dist = __commonJS((exports) => {
  var composer = require_composer();
  var Document = require_Document();
  var Schema = require_Schema();
  var errors = require_errors();
  var Alias = require_Alias();
  var identity = require_identity();
  var Pair = require_Pair();
  var Scalar = require_Scalar();
  var YAMLMap = require_YAMLMap();
  var YAMLSeq = require_YAMLSeq();
  var cst = require_cst();
  var lexer = require_lexer();
  var lineCounter = require_line_counter();
  var parser = require_parser();
  var publicApi = require_public_api();
  var visit = require_visit();
  exports.Composer = composer.Composer;
  exports.Document = Document.Document;
  exports.Schema = Schema.Schema;
  exports.YAMLError = errors.YAMLError;
  exports.YAMLParseError = errors.YAMLParseError;
  exports.YAMLWarning = errors.YAMLWarning;
  exports.Alias = Alias.Alias;
  exports.isAlias = identity.isAlias;
  exports.isCollection = identity.isCollection;
  exports.isDocument = identity.isDocument;
  exports.isMap = identity.isMap;
  exports.isNode = identity.isNode;
  exports.isPair = identity.isPair;
  exports.isScalar = identity.isScalar;
  exports.isSeq = identity.isSeq;
  exports.Pair = Pair.Pair;
  exports.Scalar = Scalar.Scalar;
  exports.YAMLMap = YAMLMap.YAMLMap;
  exports.YAMLSeq = YAMLSeq.YAMLSeq;
  exports.CST = cst;
  exports.Lexer = lexer.Lexer;
  exports.LineCounter = lineCounter.LineCounter;
  exports.Parser = parser.Parser;
  exports.parse = publicApi.parse;
  exports.parseAllDocuments = publicApi.parseAllDocuments;
  exports.parseDocument = publicApi.parseDocument;
  exports.stringify = publicApi.stringify;
  exports.visit = visit.visit;
  exports.visitAsync = visit.visitAsync;
});

// node_modules/y18n/build/index.cjs
var require_build = __commonJS((exports, module) => {
  var fs2 = __require("fs");
  var util2 = __require("util");
  var path2 = __require("path");
  var shim;

  class Y18N {
    constructor(opts) {
      opts = opts || {};
      this.directory = opts.directory || "./locales";
      this.updateFiles = typeof opts.updateFiles === "boolean" ? opts.updateFiles : true;
      this.locale = opts.locale || "en";
      this.fallbackToLanguage = typeof opts.fallbackToLanguage === "boolean" ? opts.fallbackToLanguage : true;
      this.cache = Object.create(null);
      this.writeQueue = [];
    }
    __(...args) {
      if (typeof arguments[0] !== "string") {
        return this._taggedLiteral(arguments[0], ...arguments);
      }
      const str = args.shift();
      let cb = function() {
      };
      if (typeof args[args.length - 1] === "function")
        cb = args.pop();
      cb = cb || function() {
      };
      if (!this.cache[this.locale])
        this._readLocaleFile();
      if (!this.cache[this.locale][str] && this.updateFiles) {
        this.cache[this.locale][str] = str;
        this._enqueueWrite({
          directory: this.directory,
          locale: this.locale,
          cb
        });
      } else {
        cb();
      }
      return shim.format.apply(shim.format, [this.cache[this.locale][str] || str].concat(args));
    }
    __n() {
      const args = Array.prototype.slice.call(arguments);
      const singular = args.shift();
      const plural = args.shift();
      const quantity = args.shift();
      let cb = function() {
      };
      if (typeof args[args.length - 1] === "function")
        cb = args.pop();
      if (!this.cache[this.locale])
        this._readLocaleFile();
      let str = quantity === 1 ? singular : plural;
      if (this.cache[this.locale][singular]) {
        const entry = this.cache[this.locale][singular];
        str = entry[quantity === 1 ? "one" : "other"];
      }
      if (!this.cache[this.locale][singular] && this.updateFiles) {
        this.cache[this.locale][singular] = {
          one: singular,
          other: plural
        };
        this._enqueueWrite({
          directory: this.directory,
          locale: this.locale,
          cb
        });
      } else {
        cb();
      }
      const values = [str];
      if (~str.indexOf("%d"))
        values.push(quantity);
      return shim.format.apply(shim.format, values.concat(args));
    }
    setLocale(locale) {
      this.locale = locale;
    }
    getLocale() {
      return this.locale;
    }
    updateLocale(obj) {
      if (!this.cache[this.locale])
        this._readLocaleFile();
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          this.cache[this.locale][key] = obj[key];
        }
      }
    }
    _taggedLiteral(parts, ...args) {
      let str = "";
      parts.forEach(function(part, i) {
        const arg = args[i + 1];
        str += part;
        if (typeof arg !== "undefined") {
          str += "%s";
        }
      });
      return this.__.apply(this, [str].concat([].slice.call(args, 1)));
    }
    _enqueueWrite(work) {
      this.writeQueue.push(work);
      if (this.writeQueue.length === 1)
        this._processWriteQueue();
    }
    _processWriteQueue() {
      const _this = this;
      const work = this.writeQueue[0];
      const directory = work.directory;
      const locale = work.locale;
      const cb = work.cb;
      const languageFile = this._resolveLocaleFile(directory, locale);
      const serializedLocale = JSON.stringify(this.cache[locale], null, 2);
      shim.fs.writeFile(languageFile, serializedLocale, "utf-8", function(err) {
        _this.writeQueue.shift();
        if (_this.writeQueue.length > 0)
          _this._processWriteQueue();
        cb(err);
      });
    }
    _readLocaleFile() {
      let localeLookup = {};
      const languageFile = this._resolveLocaleFile(this.directory, this.locale);
      try {
        if (shim.fs.readFileSync) {
          localeLookup = JSON.parse(shim.fs.readFileSync(languageFile, "utf-8"));
        }
      } catch (err) {
        if (err instanceof SyntaxError) {
          err.message = "syntax error in " + languageFile;
        }
        if (err.code === "ENOENT")
          localeLookup = {};
        else
          throw err;
      }
      this.cache[this.locale] = localeLookup;
    }
    _resolveLocaleFile(directory, locale) {
      let file = shim.resolve(directory, "./", locale + ".json");
      if (this.fallbackToLanguage && !this._fileExistsSync(file) && ~locale.lastIndexOf("_")) {
        const languageFile = shim.resolve(directory, "./", locale.split("_")[0] + ".json");
        if (this._fileExistsSync(languageFile))
          file = languageFile;
      }
      return file;
    }
    _fileExistsSync(file) {
      return shim.exists(file);
    }
  }
  function y18n$1(opts, _shim) {
    shim = _shim;
    const y18n2 = new Y18N(opts);
    return {
      __: y18n2.__.bind(y18n2),
      __n: y18n2.__n.bind(y18n2),
      setLocale: y18n2.setLocale.bind(y18n2),
      getLocale: y18n2.getLocale.bind(y18n2),
      updateLocale: y18n2.updateLocale.bind(y18n2),
      locale: y18n2.locale
    };
  }
  var nodePlatformShim = {
    fs: {
      readFileSync: fs2.readFileSync,
      writeFile: fs2.writeFile
    },
    format: util2.format,
    resolve: path2.resolve,
    exists: (file) => {
      try {
        return fs2.statSync(file).isFile();
      } catch (err) {
        return false;
      }
    }
  };
  var y18n = (opts) => {
    return y18n$1(opts, nodePlatformShim);
  };
  module.exports = y18n;
});

// node_modules/yargs-parser/build/index.cjs
var require_build2 = __commonJS((exports, module) => {
  var util2 = __require("util");
  var path2 = __require("path");
  var fs2 = __require("fs");
  function camelCase(str) {
    const isCamelCase = str !== str.toLowerCase() && str !== str.toUpperCase();
    if (!isCamelCase) {
      str = str.toLowerCase();
    }
    if (str.indexOf("-") === -1 && str.indexOf("_") === -1) {
      return str;
    } else {
      let camelcase = "";
      let nextChrUpper = false;
      const leadingHyphens = str.match(/^-+/);
      for (let i = leadingHyphens ? leadingHyphens[0].length : 0;i < str.length; i++) {
        let chr = str.charAt(i);
        if (nextChrUpper) {
          nextChrUpper = false;
          chr = chr.toUpperCase();
        }
        if (i !== 0 && (chr === "-" || chr === "_")) {
          nextChrUpper = true;
        } else if (chr !== "-" && chr !== "_") {
          camelcase += chr;
        }
      }
      return camelcase;
    }
  }
  function decamelize(str, joinString) {
    const lowercase = str.toLowerCase();
    joinString = joinString || "-";
    let notCamelcase = "";
    for (let i = 0;i < str.length; i++) {
      const chrLower = lowercase.charAt(i);
      const chrString = str.charAt(i);
      if (chrLower !== chrString && i > 0) {
        notCamelcase += `${joinString}${lowercase.charAt(i)}`;
      } else {
        notCamelcase += chrString;
      }
    }
    return notCamelcase;
  }
  function looksLikeNumber(x) {
    if (x === null || x === undefined)
      return false;
    if (typeof x === "number")
      return true;
    if (/^0x[0-9a-f]+$/i.test(x))
      return true;
    if (/^0[^.]/.test(x))
      return false;
    return /^[-]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
  }
  function tokenizeArgString(argString) {
    if (Array.isArray(argString)) {
      return argString.map((e) => typeof e !== "string" ? e + "" : e);
    }
    argString = argString.trim();
    let i = 0;
    let prevC = null;
    let c = null;
    let opening = null;
    const args = [];
    for (let ii = 0;ii < argString.length; ii++) {
      prevC = c;
      c = argString.charAt(ii);
      if (c === " " && !opening) {
        if (!(prevC === " ")) {
          i++;
        }
        continue;
      }
      if (c === opening) {
        opening = null;
      } else if ((c === "'" || c === '"') && !opening) {
        opening = c;
      }
      if (!args[i])
        args[i] = "";
      args[i] += c;
    }
    return args;
  }
  var DefaultValuesForTypeKey;
  (function(DefaultValuesForTypeKey2) {
    DefaultValuesForTypeKey2["BOOLEAN"] = "boolean";
    DefaultValuesForTypeKey2["STRING"] = "string";
    DefaultValuesForTypeKey2["NUMBER"] = "number";
    DefaultValuesForTypeKey2["ARRAY"] = "array";
  })(DefaultValuesForTypeKey || (DefaultValuesForTypeKey = {}));
  var mixin;

  class YargsParser {
    constructor(_mixin) {
      mixin = _mixin;
    }
    parse(argsInput, options) {
      const opts = Object.assign({
        alias: undefined,
        array: undefined,
        boolean: undefined,
        config: undefined,
        configObjects: undefined,
        configuration: undefined,
        coerce: undefined,
        count: undefined,
        default: undefined,
        envPrefix: undefined,
        narg: undefined,
        normalize: undefined,
        string: undefined,
        number: undefined,
        __: undefined,
        key: undefined
      }, options);
      const args = tokenizeArgString(argsInput);
      const inputIsString = typeof argsInput === "string";
      const aliases = combineAliases(Object.assign(Object.create(null), opts.alias));
      const configuration = Object.assign({
        "boolean-negation": true,
        "camel-case-expansion": true,
        "combine-arrays": false,
        "dot-notation": true,
        "duplicate-arguments-array": true,
        "flatten-duplicate-arrays": true,
        "greedy-arrays": true,
        "halt-at-non-option": false,
        "nargs-eats-options": false,
        "negation-prefix": "no-",
        "parse-numbers": true,
        "parse-positional-numbers": true,
        "populate--": false,
        "set-placeholder-key": false,
        "short-option-groups": true,
        "strip-aliased": false,
        "strip-dashed": false,
        "unknown-options-as-args": false
      }, opts.configuration);
      const defaults = Object.assign(Object.create(null), opts.default);
      const configObjects = opts.configObjects || [];
      const envPrefix = opts.envPrefix;
      const notFlagsOption = configuration["populate--"];
      const notFlagsArgv = notFlagsOption ? "--" : "_";
      const newAliases = Object.create(null);
      const defaulted = Object.create(null);
      const __ = opts.__ || mixin.format;
      const flags = {
        aliases: Object.create(null),
        arrays: Object.create(null),
        bools: Object.create(null),
        strings: Object.create(null),
        numbers: Object.create(null),
        counts: Object.create(null),
        normalize: Object.create(null),
        configs: Object.create(null),
        nargs: Object.create(null),
        coercions: Object.create(null),
        keys: []
      };
      const negative = /^-([0-9]+(\.[0-9]+)?|\.[0-9]+)$/;
      const negatedBoolean = new RegExp("^--" + configuration["negation-prefix"] + "(.+)");
      [].concat(opts.array || []).filter(Boolean).forEach(function(opt) {
        const key = typeof opt === "object" ? opt.key : opt;
        const assignment = Object.keys(opt).map(function(key2) {
          const arrayFlagKeys = {
            boolean: "bools",
            string: "strings",
            number: "numbers"
          };
          return arrayFlagKeys[key2];
        }).filter(Boolean).pop();
        if (assignment) {
          flags[assignment][key] = true;
        }
        flags.arrays[key] = true;
        flags.keys.push(key);
      });
      [].concat(opts.boolean || []).filter(Boolean).forEach(function(key) {
        flags.bools[key] = true;
        flags.keys.push(key);
      });
      [].concat(opts.string || []).filter(Boolean).forEach(function(key) {
        flags.strings[key] = true;
        flags.keys.push(key);
      });
      [].concat(opts.number || []).filter(Boolean).forEach(function(key) {
        flags.numbers[key] = true;
        flags.keys.push(key);
      });
      [].concat(opts.count || []).filter(Boolean).forEach(function(key) {
        flags.counts[key] = true;
        flags.keys.push(key);
      });
      [].concat(opts.normalize || []).filter(Boolean).forEach(function(key) {
        flags.normalize[key] = true;
        flags.keys.push(key);
      });
      if (typeof opts.narg === "object") {
        Object.entries(opts.narg).forEach(([key, value]) => {
          if (typeof value === "number") {
            flags.nargs[key] = value;
            flags.keys.push(key);
          }
        });
      }
      if (typeof opts.coerce === "object") {
        Object.entries(opts.coerce).forEach(([key, value]) => {
          if (typeof value === "function") {
            flags.coercions[key] = value;
            flags.keys.push(key);
          }
        });
      }
      if (typeof opts.config !== "undefined") {
        if (Array.isArray(opts.config) || typeof opts.config === "string") {
          [].concat(opts.config).filter(Boolean).forEach(function(key) {
            flags.configs[key] = true;
          });
        } else if (typeof opts.config === "object") {
          Object.entries(opts.config).forEach(([key, value]) => {
            if (typeof value === "boolean" || typeof value === "function") {
              flags.configs[key] = value;
            }
          });
        }
      }
      extendAliases(opts.key, aliases, opts.default, flags.arrays);
      Object.keys(defaults).forEach(function(key) {
        (flags.aliases[key] || []).forEach(function(alias) {
          defaults[alias] = defaults[key];
        });
      });
      let error = null;
      checkConfiguration();
      let notFlags = [];
      const argv = Object.assign(Object.create(null), { _: [] });
      const argvReturn = {};
      for (let i = 0;i < args.length; i++) {
        const arg = args[i];
        const truncatedArg = arg.replace(/^-{3,}/, "---");
        let broken;
        let key;
        let letters;
        let m;
        let next;
        let value;
        if (arg !== "--" && /^-/.test(arg) && isUnknownOptionAsArg(arg)) {
          pushPositional(arg);
        } else if (truncatedArg.match(/^---+(=|$)/)) {
          pushPositional(arg);
          continue;
        } else if (arg.match(/^--.+=/) || !configuration["short-option-groups"] && arg.match(/^-.+=/)) {
          m = arg.match(/^--?([^=]+)=([\s\S]*)$/);
          if (m !== null && Array.isArray(m) && m.length >= 3) {
            if (checkAllAliases(m[1], flags.arrays)) {
              i = eatArray(i, m[1], args, m[2]);
            } else if (checkAllAliases(m[1], flags.nargs) !== false) {
              i = eatNargs(i, m[1], args, m[2]);
            } else {
              setArg(m[1], m[2], true);
            }
          }
        } else if (arg.match(negatedBoolean) && configuration["boolean-negation"]) {
          m = arg.match(negatedBoolean);
          if (m !== null && Array.isArray(m) && m.length >= 2) {
            key = m[1];
            setArg(key, checkAllAliases(key, flags.arrays) ? [false] : false);
          }
        } else if (arg.match(/^--.+/) || !configuration["short-option-groups"] && arg.match(/^-[^-]+/)) {
          m = arg.match(/^--?(.+)/);
          if (m !== null && Array.isArray(m) && m.length >= 2) {
            key = m[1];
            if (checkAllAliases(key, flags.arrays)) {
              i = eatArray(i, key, args);
            } else if (checkAllAliases(key, flags.nargs) !== false) {
              i = eatNargs(i, key, args);
            } else {
              next = args[i + 1];
              if (next !== undefined && (!next.match(/^-/) || next.match(negative)) && !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts)) {
                setArg(key, next);
                i++;
              } else if (/^(true|false)$/.test(next)) {
                setArg(key, next);
                i++;
              } else {
                setArg(key, defaultValue(key));
              }
            }
          }
        } else if (arg.match(/^-.\..+=/)) {
          m = arg.match(/^-([^=]+)=([\s\S]*)$/);
          if (m !== null && Array.isArray(m) && m.length >= 3) {
            setArg(m[1], m[2]);
          }
        } else if (arg.match(/^-.\..+/) && !arg.match(negative)) {
          next = args[i + 1];
          m = arg.match(/^-(.\..+)/);
          if (m !== null && Array.isArray(m) && m.length >= 2) {
            key = m[1];
            if (next !== undefined && !next.match(/^-/) && !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts)) {
              setArg(key, next);
              i++;
            } else {
              setArg(key, defaultValue(key));
            }
          }
        } else if (arg.match(/^-[^-]+/) && !arg.match(negative)) {
          letters = arg.slice(1, -1).split("");
          broken = false;
          for (let j = 0;j < letters.length; j++) {
            next = arg.slice(j + 2);
            if (letters[j + 1] && letters[j + 1] === "=") {
              value = arg.slice(j + 3);
              key = letters[j];
              if (checkAllAliases(key, flags.arrays)) {
                i = eatArray(i, key, args, value);
              } else if (checkAllAliases(key, flags.nargs) !== false) {
                i = eatNargs(i, key, args, value);
              } else {
                setArg(key, value);
              }
              broken = true;
              break;
            }
            if (next === "-") {
              setArg(letters[j], next);
              continue;
            }
            if (/[A-Za-z]/.test(letters[j]) && /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next) && checkAllAliases(next, flags.bools) === false) {
              setArg(letters[j], next);
              broken = true;
              break;
            }
            if (letters[j + 1] && letters[j + 1].match(/\W/)) {
              setArg(letters[j], next);
              broken = true;
              break;
            } else {
              setArg(letters[j], defaultValue(letters[j]));
            }
          }
          key = arg.slice(-1)[0];
          if (!broken && key !== "-") {
            if (checkAllAliases(key, flags.arrays)) {
              i = eatArray(i, key, args);
            } else if (checkAllAliases(key, flags.nargs) !== false) {
              i = eatNargs(i, key, args);
            } else {
              next = args[i + 1];
              if (next !== undefined && (!/^(-|--)[^-]/.test(next) || next.match(negative)) && !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts)) {
                setArg(key, next);
                i++;
              } else if (/^(true|false)$/.test(next)) {
                setArg(key, next);
                i++;
              } else {
                setArg(key, defaultValue(key));
              }
            }
          }
        } else if (arg.match(/^-[0-9]$/) && arg.match(negative) && checkAllAliases(arg.slice(1), flags.bools)) {
          key = arg.slice(1);
          setArg(key, defaultValue(key));
        } else if (arg === "--") {
          notFlags = args.slice(i + 1);
          break;
        } else if (configuration["halt-at-non-option"]) {
          notFlags = args.slice(i);
          break;
        } else {
          pushPositional(arg);
        }
      }
      applyEnvVars(argv, true);
      applyEnvVars(argv, false);
      setConfig(argv);
      setConfigObjects();
      applyDefaultsAndAliases(argv, flags.aliases, defaults, true);
      applyCoercions(argv);
      if (configuration["set-placeholder-key"])
        setPlaceholderKeys(argv);
      Object.keys(flags.counts).forEach(function(key) {
        if (!hasKey(argv, key.split(".")))
          setArg(key, 0);
      });
      if (notFlagsOption && notFlags.length)
        argv[notFlagsArgv] = [];
      notFlags.forEach(function(key) {
        argv[notFlagsArgv].push(key);
      });
      if (configuration["camel-case-expansion"] && configuration["strip-dashed"]) {
        Object.keys(argv).filter((key) => key !== "--" && key.includes("-")).forEach((key) => {
          delete argv[key];
        });
      }
      if (configuration["strip-aliased"]) {
        [].concat(...Object.keys(aliases).map((k) => aliases[k])).forEach((alias) => {
          if (configuration["camel-case-expansion"] && alias.includes("-")) {
            delete argv[alias.split(".").map((prop) => camelCase(prop)).join(".")];
          }
          delete argv[alias];
        });
      }
      function pushPositional(arg) {
        const maybeCoercedNumber = maybeCoerceNumber("_", arg);
        if (typeof maybeCoercedNumber === "string" || typeof maybeCoercedNumber === "number") {
          argv._.push(maybeCoercedNumber);
        }
      }
      function eatNargs(i, key, args2, argAfterEqualSign) {
        let ii;
        let toEat = checkAllAliases(key, flags.nargs);
        toEat = typeof toEat !== "number" || isNaN(toEat) ? 1 : toEat;
        if (toEat === 0) {
          if (!isUndefined(argAfterEqualSign)) {
            error = Error(__("Argument unexpected for: %s", key));
          }
          setArg(key, defaultValue(key));
          return i;
        }
        let available = isUndefined(argAfterEqualSign) ? 0 : 1;
        if (configuration["nargs-eats-options"]) {
          if (args2.length - (i + 1) + available < toEat) {
            error = Error(__("Not enough arguments following: %s", key));
          }
          available = toEat;
        } else {
          for (ii = i + 1;ii < args2.length; ii++) {
            if (!args2[ii].match(/^-[^0-9]/) || args2[ii].match(negative) || isUnknownOptionAsArg(args2[ii]))
              available++;
            else
              break;
          }
          if (available < toEat)
            error = Error(__("Not enough arguments following: %s", key));
        }
        let consumed = Math.min(available, toEat);
        if (!isUndefined(argAfterEqualSign) && consumed > 0) {
          setArg(key, argAfterEqualSign);
          consumed--;
        }
        for (ii = i + 1;ii < consumed + i + 1; ii++) {
          setArg(key, args2[ii]);
        }
        return i + consumed;
      }
      function eatArray(i, key, args2, argAfterEqualSign) {
        let argsToSet = [];
        let next = argAfterEqualSign || args2[i + 1];
        const nargsCount = checkAllAliases(key, flags.nargs);
        if (checkAllAliases(key, flags.bools) && !/^(true|false)$/.test(next)) {
          argsToSet.push(true);
        } else if (isUndefined(next) || isUndefined(argAfterEqualSign) && /^-/.test(next) && !negative.test(next) && !isUnknownOptionAsArg(next)) {
          if (defaults[key] !== undefined) {
            const defVal = defaults[key];
            argsToSet = Array.isArray(defVal) ? defVal : [defVal];
          }
        } else {
          if (!isUndefined(argAfterEqualSign)) {
            argsToSet.push(processValue(key, argAfterEqualSign, true));
          }
          for (let ii = i + 1;ii < args2.length; ii++) {
            if (!configuration["greedy-arrays"] && argsToSet.length > 0 || nargsCount && typeof nargsCount === "number" && argsToSet.length >= nargsCount)
              break;
            next = args2[ii];
            if (/^-/.test(next) && !negative.test(next) && !isUnknownOptionAsArg(next))
              break;
            i = ii;
            argsToSet.push(processValue(key, next, inputIsString));
          }
        }
        if (typeof nargsCount === "number" && (nargsCount && argsToSet.length < nargsCount || isNaN(nargsCount) && argsToSet.length === 0)) {
          error = Error(__("Not enough arguments following: %s", key));
        }
        setArg(key, argsToSet);
        return i;
      }
      function setArg(key, val, shouldStripQuotes = inputIsString) {
        if (/-/.test(key) && configuration["camel-case-expansion"]) {
          const alias = key.split(".").map(function(prop) {
            return camelCase(prop);
          }).join(".");
          addNewAlias(key, alias);
        }
        const value = processValue(key, val, shouldStripQuotes);
        const splitKey = key.split(".");
        setKey(argv, splitKey, value);
        if (flags.aliases[key]) {
          flags.aliases[key].forEach(function(x) {
            const keyProperties = x.split(".");
            setKey(argv, keyProperties, value);
          });
        }
        if (splitKey.length > 1 && configuration["dot-notation"]) {
          (flags.aliases[splitKey[0]] || []).forEach(function(x) {
            let keyProperties = x.split(".");
            const a = [].concat(splitKey);
            a.shift();
            keyProperties = keyProperties.concat(a);
            if (!(flags.aliases[key] || []).includes(keyProperties.join("."))) {
              setKey(argv, keyProperties, value);
            }
          });
        }
        if (checkAllAliases(key, flags.normalize) && !checkAllAliases(key, flags.arrays)) {
          const keys = [key].concat(flags.aliases[key] || []);
          keys.forEach(function(key2) {
            Object.defineProperty(argvReturn, key2, {
              enumerable: true,
              get() {
                return val;
              },
              set(value2) {
                val = typeof value2 === "string" ? mixin.normalize(value2) : value2;
              }
            });
          });
        }
      }
      function addNewAlias(key, alias) {
        if (!(flags.aliases[key] && flags.aliases[key].length)) {
          flags.aliases[key] = [alias];
          newAliases[alias] = true;
        }
        if (!(flags.aliases[alias] && flags.aliases[alias].length)) {
          addNewAlias(alias, key);
        }
      }
      function processValue(key, val, shouldStripQuotes) {
        if (shouldStripQuotes) {
          val = stripQuotes(val);
        }
        if (checkAllAliases(key, flags.bools) || checkAllAliases(key, flags.counts)) {
          if (typeof val === "string")
            val = val === "true";
        }
        let value = Array.isArray(val) ? val.map(function(v) {
          return maybeCoerceNumber(key, v);
        }) : maybeCoerceNumber(key, val);
        if (checkAllAliases(key, flags.counts) && (isUndefined(value) || typeof value === "boolean")) {
          value = increment();
        }
        if (checkAllAliases(key, flags.normalize) && checkAllAliases(key, flags.arrays)) {
          if (Array.isArray(val))
            value = val.map((val2) => {
              return mixin.normalize(val2);
            });
          else
            value = mixin.normalize(val);
        }
        return value;
      }
      function maybeCoerceNumber(key, value) {
        if (!configuration["parse-positional-numbers"] && key === "_")
          return value;
        if (!checkAllAliases(key, flags.strings) && !checkAllAliases(key, flags.bools) && !Array.isArray(value)) {
          const shouldCoerceNumber = looksLikeNumber(value) && configuration["parse-numbers"] && Number.isSafeInteger(Math.floor(parseFloat(`${value}`)));
          if (shouldCoerceNumber || !isUndefined(value) && checkAllAliases(key, flags.numbers)) {
            value = Number(value);
          }
        }
        return value;
      }
      function setConfig(argv2) {
        const configLookup = Object.create(null);
        applyDefaultsAndAliases(configLookup, flags.aliases, defaults);
        Object.keys(flags.configs).forEach(function(configKey) {
          const configPath = argv2[configKey] || configLookup[configKey];
          if (configPath) {
            try {
              let config = null;
              const resolvedConfigPath = mixin.resolve(mixin.cwd(), configPath);
              const resolveConfig = flags.configs[configKey];
              if (typeof resolveConfig === "function") {
                try {
                  config = resolveConfig(resolvedConfigPath);
                } catch (e) {
                  config = e;
                }
                if (config instanceof Error) {
                  error = config;
                  return;
                }
              } else {
                config = mixin.require(resolvedConfigPath);
              }
              setConfigObject(config);
            } catch (ex) {
              if (ex.name === "PermissionDenied")
                error = ex;
              else if (argv2[configKey])
                error = Error(__("Invalid JSON config file: %s", configPath));
            }
          }
        });
      }
      function setConfigObject(config, prev) {
        Object.keys(config).forEach(function(key) {
          const value = config[key];
          const fullKey = prev ? prev + "." + key : key;
          if (typeof value === "object" && value !== null && !Array.isArray(value) && configuration["dot-notation"]) {
            setConfigObject(value, fullKey);
          } else {
            if (!hasKey(argv, fullKey.split(".")) || checkAllAliases(fullKey, flags.arrays) && configuration["combine-arrays"]) {
              setArg(fullKey, value);
            }
          }
        });
      }
      function setConfigObjects() {
        if (typeof configObjects !== "undefined") {
          configObjects.forEach(function(configObject) {
            setConfigObject(configObject);
          });
        }
      }
      function applyEnvVars(argv2, configOnly) {
        if (typeof envPrefix === "undefined")
          return;
        const prefix = typeof envPrefix === "string" ? envPrefix : "";
        const env2 = mixin.env();
        Object.keys(env2).forEach(function(envVar) {
          if (prefix === "" || envVar.lastIndexOf(prefix, 0) === 0) {
            const keys = envVar.split("__").map(function(key, i) {
              if (i === 0) {
                key = key.substring(prefix.length);
              }
              return camelCase(key);
            });
            if ((configOnly && flags.configs[keys.join(".")] || !configOnly) && !hasKey(argv2, keys)) {
              setArg(keys.join("."), env2[envVar]);
            }
          }
        });
      }
      function applyCoercions(argv2) {
        let coerce2;
        const applied = new Set;
        Object.keys(argv2).forEach(function(key) {
          if (!applied.has(key)) {
            coerce2 = checkAllAliases(key, flags.coercions);
            if (typeof coerce2 === "function") {
              try {
                const value = maybeCoerceNumber(key, coerce2(argv2[key]));
                [].concat(flags.aliases[key] || [], key).forEach((ali) => {
                  applied.add(ali);
                  argv2[ali] = value;
                });
              } catch (err) {
                error = err;
              }
            }
          }
        });
      }
      function setPlaceholderKeys(argv2) {
        flags.keys.forEach((key) => {
          if (~key.indexOf("."))
            return;
          if (typeof argv2[key] === "undefined")
            argv2[key] = undefined;
        });
        return argv2;
      }
      function applyDefaultsAndAliases(obj, aliases2, defaults2, canLog = false) {
        Object.keys(defaults2).forEach(function(key) {
          if (!hasKey(obj, key.split("."))) {
            setKey(obj, key.split("."), defaults2[key]);
            if (canLog)
              defaulted[key] = true;
            (aliases2[key] || []).forEach(function(x) {
              if (hasKey(obj, x.split(".")))
                return;
              setKey(obj, x.split("."), defaults2[key]);
            });
          }
        });
      }
      function hasKey(obj, keys) {
        let o = obj;
        if (!configuration["dot-notation"])
          keys = [keys.join(".")];
        keys.slice(0, -1).forEach(function(key2) {
          o = o[key2] || {};
        });
        const key = keys[keys.length - 1];
        if (typeof o !== "object")
          return false;
        else
          return key in o;
      }
      function setKey(obj, keys, value) {
        let o = obj;
        if (!configuration["dot-notation"])
          keys = [keys.join(".")];
        keys.slice(0, -1).forEach(function(key2) {
          key2 = sanitizeKey(key2);
          if (typeof o === "object" && o[key2] === undefined) {
            o[key2] = {};
          }
          if (typeof o[key2] !== "object" || Array.isArray(o[key2])) {
            if (Array.isArray(o[key2])) {
              o[key2].push({});
            } else {
              o[key2] = [o[key2], {}];
            }
            o = o[key2][o[key2].length - 1];
          } else {
            o = o[key2];
          }
        });
        const key = sanitizeKey(keys[keys.length - 1]);
        const isTypeArray = checkAllAliases(keys.join("."), flags.arrays);
        const isValueArray = Array.isArray(value);
        let duplicate = configuration["duplicate-arguments-array"];
        if (!duplicate && checkAllAliases(key, flags.nargs)) {
          duplicate = true;
          if (!isUndefined(o[key]) && flags.nargs[key] === 1 || Array.isArray(o[key]) && o[key].length === flags.nargs[key]) {
            o[key] = undefined;
          }
        }
        if (value === increment()) {
          o[key] = increment(o[key]);
        } else if (Array.isArray(o[key])) {
          if (duplicate && isTypeArray && isValueArray) {
            o[key] = configuration["flatten-duplicate-arrays"] ? o[key].concat(value) : (Array.isArray(o[key][0]) ? o[key] : [o[key]]).concat([value]);
          } else if (!duplicate && Boolean(isTypeArray) === Boolean(isValueArray)) {
            o[key] = value;
          } else {
            o[key] = o[key].concat([value]);
          }
        } else if (o[key] === undefined && isTypeArray) {
          o[key] = isValueArray ? value : [value];
        } else if (duplicate && !(o[key] === undefined || checkAllAliases(key, flags.counts) || checkAllAliases(key, flags.bools))) {
          o[key] = [o[key], value];
        } else {
          o[key] = value;
        }
      }
      function extendAliases(...args2) {
        args2.forEach(function(obj) {
          Object.keys(obj || {}).forEach(function(key) {
            if (flags.aliases[key])
              return;
            flags.aliases[key] = [].concat(aliases[key] || []);
            flags.aliases[key].concat(key).forEach(function(x) {
              if (/-/.test(x) && configuration["camel-case-expansion"]) {
                const c = camelCase(x);
                if (c !== key && flags.aliases[key].indexOf(c) === -1) {
                  flags.aliases[key].push(c);
                  newAliases[c] = true;
                }
              }
            });
            flags.aliases[key].concat(key).forEach(function(x) {
              if (x.length > 1 && /[A-Z]/.test(x) && configuration["camel-case-expansion"]) {
                const c = decamelize(x, "-");
                if (c !== key && flags.aliases[key].indexOf(c) === -1) {
                  flags.aliases[key].push(c);
                  newAliases[c] = true;
                }
              }
            });
            flags.aliases[key].forEach(function(x) {
              flags.aliases[x] = [key].concat(flags.aliases[key].filter(function(y) {
                return x !== y;
              }));
            });
          });
        });
      }
      function checkAllAliases(key, flag) {
        const toCheck = [].concat(flags.aliases[key] || [], key);
        const keys = Object.keys(flag);
        const setAlias = toCheck.find((key2) => keys.includes(key2));
        return setAlias ? flag[setAlias] : false;
      }
      function hasAnyFlag(key) {
        const flagsKeys = Object.keys(flags);
        const toCheck = [].concat(flagsKeys.map((k) => flags[k]));
        return toCheck.some(function(flag) {
          return Array.isArray(flag) ? flag.includes(key) : flag[key];
        });
      }
      function hasFlagsMatching(arg, ...patterns) {
        const toCheck = [].concat(...patterns);
        return toCheck.some(function(pattern) {
          const match = arg.match(pattern);
          return match && hasAnyFlag(match[1]);
        });
      }
      function hasAllShortFlags(arg) {
        if (arg.match(negative) || !arg.match(/^-[^-]+/)) {
          return false;
        }
        let hasAllFlags = true;
        let next;
        const letters = arg.slice(1).split("");
        for (let j = 0;j < letters.length; j++) {
          next = arg.slice(j + 2);
          if (!hasAnyFlag(letters[j])) {
            hasAllFlags = false;
            break;
          }
          if (letters[j + 1] && letters[j + 1] === "=" || next === "-" || /[A-Za-z]/.test(letters[j]) && /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next) || letters[j + 1] && letters[j + 1].match(/\W/)) {
            break;
          }
        }
        return hasAllFlags;
      }
      function isUnknownOptionAsArg(arg) {
        return configuration["unknown-options-as-args"] && isUnknownOption(arg);
      }
      function isUnknownOption(arg) {
        arg = arg.replace(/^-{3,}/, "--");
        if (arg.match(negative)) {
          return false;
        }
        if (hasAllShortFlags(arg)) {
          return false;
        }
        const flagWithEquals = /^-+([^=]+?)=[\s\S]*$/;
        const normalFlag = /^-+([^=]+?)$/;
        const flagEndingInHyphen = /^-+([^=]+?)-$/;
        const flagEndingInDigits = /^-+([^=]+?\d+)$/;
        const flagEndingInNonWordCharacters = /^-+([^=]+?)\W+.*$/;
        return !hasFlagsMatching(arg, flagWithEquals, negatedBoolean, normalFlag, flagEndingInHyphen, flagEndingInDigits, flagEndingInNonWordCharacters);
      }
      function defaultValue(key) {
        if (!checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts) && `${key}` in defaults) {
          return defaults[key];
        } else {
          return defaultForType(guessType(key));
        }
      }
      function defaultForType(type) {
        const def = {
          [DefaultValuesForTypeKey.BOOLEAN]: true,
          [DefaultValuesForTypeKey.STRING]: "",
          [DefaultValuesForTypeKey.NUMBER]: undefined,
          [DefaultValuesForTypeKey.ARRAY]: []
        };
        return def[type];
      }
      function guessType(key) {
        let type = DefaultValuesForTypeKey.BOOLEAN;
        if (checkAllAliases(key, flags.strings))
          type = DefaultValuesForTypeKey.STRING;
        else if (checkAllAliases(key, flags.numbers))
          type = DefaultValuesForTypeKey.NUMBER;
        else if (checkAllAliases(key, flags.bools))
          type = DefaultValuesForTypeKey.BOOLEAN;
        else if (checkAllAliases(key, flags.arrays))
          type = DefaultValuesForTypeKey.ARRAY;
        return type;
      }
      function isUndefined(num) {
        return num === undefined;
      }
      function checkConfiguration() {
        Object.keys(flags.counts).find((key) => {
          if (checkAllAliases(key, flags.arrays)) {
            error = Error(__("Invalid configuration: %s, opts.count excludes opts.array.", key));
            return true;
          } else if (checkAllAliases(key, flags.nargs)) {
            error = Error(__("Invalid configuration: %s, opts.count excludes opts.narg.", key));
            return true;
          }
          return false;
        });
      }
      return {
        aliases: Object.assign({}, flags.aliases),
        argv: Object.assign(argvReturn, argv),
        configuration,
        defaulted: Object.assign({}, defaulted),
        error,
        newAliases: Object.assign({}, newAliases)
      };
    }
  }
  function combineAliases(aliases) {
    const aliasArrays = [];
    const combined = Object.create(null);
    let change = true;
    Object.keys(aliases).forEach(function(key) {
      aliasArrays.push([].concat(aliases[key], key));
    });
    while (change) {
      change = false;
      for (let i = 0;i < aliasArrays.length; i++) {
        for (let ii = i + 1;ii < aliasArrays.length; ii++) {
          const intersect = aliasArrays[i].filter(function(v) {
            return aliasArrays[ii].indexOf(v) !== -1;
          });
          if (intersect.length) {
            aliasArrays[i] = aliasArrays[i].concat(aliasArrays[ii]);
            aliasArrays.splice(ii, 1);
            change = true;
            break;
          }
        }
      }
    }
    aliasArrays.forEach(function(aliasArray) {
      aliasArray = aliasArray.filter(function(v, i, self) {
        return self.indexOf(v) === i;
      });
      const lastAlias = aliasArray.pop();
      if (lastAlias !== undefined && typeof lastAlias === "string") {
        combined[lastAlias] = aliasArray;
      }
    });
    return combined;
  }
  function increment(orig) {
    return orig !== undefined ? orig + 1 : 1;
  }
  function sanitizeKey(key) {
    if (key === "__proto__")
      return "___proto___";
    return key;
  }
  function stripQuotes(val) {
    return typeof val === "string" && (val[0] === "'" || val[0] === '"') && val[val.length - 1] === val[0] ? val.substring(1, val.length - 1) : val;
  }
  var _a;
  var _b;
  var _c;
  var minNodeVersion = process && process.env && process.env.YARGS_MIN_NODE_VERSION ? Number(process.env.YARGS_MIN_NODE_VERSION) : 12;
  var nodeVersion = (_b = (_a = process === null || process === undefined ? undefined : process.versions) === null || _a === undefined ? undefined : _a.node) !== null && _b !== undefined ? _b : (_c = process === null || process === undefined ? undefined : process.version) === null || _c === undefined ? undefined : _c.slice(1);
  if (nodeVersion) {
    const major = Number(nodeVersion.match(/^([^.]+)/)[1]);
    if (major < minNodeVersion) {
      throw Error(`yargs parser supports a minimum Node.js version of ${minNodeVersion}. Read our version support policy: https://github.com/yargs/yargs-parser#supported-nodejs-versions`);
    }
  }
  var env = process ? process.env : {};
  var parser = new YargsParser({
    cwd: process.cwd,
    env: () => {
      return env;
    },
    format: util2.format,
    normalize: path2.normalize,
    resolve: path2.resolve,
    require: (path3) => {
      if (true) {
        return __require(path3);
      } else
        ;
    }
  });
  var yargsParser = function Parser(args, opts) {
    const result = parser.parse(args.slice(), opts);
    return result.argv;
  };
  yargsParser.detailed = function(args, opts) {
    return parser.parse(args.slice(), opts);
  };
  yargsParser.camelCase = camelCase;
  yargsParser.decamelize = decamelize;
  yargsParser.looksLikeNumber = looksLikeNumber;
  module.exports = yargsParser;
});

// node_modules/ansi-regex/index.js
var require_ansi_regex = __commonJS((exports, module) => {
  module.exports = ({ onlyFirst = false } = {}) => {
    const pattern = [
      "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
      "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
    ].join("|");
    return new RegExp(pattern, onlyFirst ? undefined : "g");
  };
});

// node_modules/strip-ansi/index.js
var require_strip_ansi = __commonJS((exports, module) => {
  var ansiRegex = require_ansi_regex();
  module.exports = (string) => typeof string === "string" ? string.replace(ansiRegex(), "") : string;
});

// node_modules/is-fullwidth-code-point/index.js
var require_is_fullwidth_code_point = __commonJS((exports, module) => {
  var isFullwidthCodePoint = (codePoint) => {
    if (Number.isNaN(codePoint)) {
      return false;
    }
    if (codePoint >= 4352 && (codePoint <= 4447 || codePoint === 9001 || codePoint === 9002 || 11904 <= codePoint && codePoint <= 12871 && codePoint !== 12351 || 12880 <= codePoint && codePoint <= 19903 || 19968 <= codePoint && codePoint <= 42182 || 43360 <= codePoint && codePoint <= 43388 || 44032 <= codePoint && codePoint <= 55203 || 63744 <= codePoint && codePoint <= 64255 || 65040 <= codePoint && codePoint <= 65049 || 65072 <= codePoint && codePoint <= 65131 || 65281 <= codePoint && codePoint <= 65376 || 65504 <= codePoint && codePoint <= 65510 || 110592 <= codePoint && codePoint <= 110593 || 127488 <= codePoint && codePoint <= 127569 || 131072 <= codePoint && codePoint <= 262141)) {
      return true;
    }
    return false;
  };
  module.exports = isFullwidthCodePoint;
  module.exports.default = isFullwidthCodePoint;
});

// node_modules/emoji-regex/index.js
var require_emoji_regex = __commonJS((exports, module) => {
  module.exports = function() {
    return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
  };
});

// node_modules/string-width/index.js
var require_string_width = __commonJS((exports, module) => {
  var stripAnsi = require_strip_ansi();
  var isFullwidthCodePoint = require_is_fullwidth_code_point();
  var emojiRegex2 = require_emoji_regex();
  var stringWidth = (string) => {
    if (typeof string !== "string" || string.length === 0) {
      return 0;
    }
    string = stripAnsi(string);
    if (string.length === 0) {
      return 0;
    }
    string = string.replace(emojiRegex2(), "  ");
    let width = 0;
    for (let i = 0;i < string.length; i++) {
      const code = string.codePointAt(i);
      if (code <= 31 || code >= 127 && code <= 159) {
        continue;
      }
      if (code >= 768 && code <= 879) {
        continue;
      }
      if (code > 65535) {
        i++;
      }
      width += isFullwidthCodePoint(code) ? 2 : 1;
    }
    return width;
  };
  module.exports = stringWidth;
  module.exports.default = stringWidth;
});

// node_modules/color-name/index.js
var require_color_name = __commonJS((exports, module) => {
  module.exports = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 134, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 250, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 221],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [112, 128, 144],
    slategrey: [112, 128, 144],
    snow: [255, 250, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 50]
  };
});

// node_modules/color-convert/conversions.js
var require_conversions = __commonJS((exports, module) => {
  var cssKeywords = require_color_name();
  var reverseKeywords = {};
  for (const key of Object.keys(cssKeywords)) {
    reverseKeywords[cssKeywords[key]] = key;
  }
  var convert = {
    rgb: { channels: 3, labels: "rgb" },
    hsl: { channels: 3, labels: "hsl" },
    hsv: { channels: 3, labels: "hsv" },
    hwb: { channels: 3, labels: "hwb" },
    cmyk: { channels: 4, labels: "cmyk" },
    xyz: { channels: 3, labels: "xyz" },
    lab: { channels: 3, labels: "lab" },
    lch: { channels: 3, labels: "lch" },
    hex: { channels: 1, labels: ["hex"] },
    keyword: { channels: 1, labels: ["keyword"] },
    ansi16: { channels: 1, labels: ["ansi16"] },
    ansi256: { channels: 1, labels: ["ansi256"] },
    hcg: { channels: 3, labels: ["h", "c", "g"] },
    apple: { channels: 3, labels: ["r16", "g16", "b16"] },
    gray: { channels: 1, labels: ["gray"] }
  };
  module.exports = convert;
  for (const model of Object.keys(convert)) {
    if (!("channels" in convert[model])) {
      throw new Error("missing channels property: " + model);
    }
    if (!("labels" in convert[model])) {
      throw new Error("missing channel labels property: " + model);
    }
    if (convert[model].labels.length !== convert[model].channels) {
      throw new Error("channel and label counts mismatch: " + model);
    }
    const { channels, labels } = convert[model];
    delete convert[model].channels;
    delete convert[model].labels;
    Object.defineProperty(convert[model], "channels", { value: channels });
    Object.defineProperty(convert[model], "labels", { value: labels });
  }
  convert.rgb.hsl = function(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    const delta = max - min;
    let h;
    let s;
    if (max === min) {
      h = 0;
    } else if (r === max) {
      h = (g - b) / delta;
    } else if (g === max) {
      h = 2 + (b - r) / delta;
    } else if (b === max) {
      h = 4 + (r - g) / delta;
    }
    h = Math.min(h * 60, 360);
    if (h < 0) {
      h += 360;
    }
    const l = (min + max) / 2;
    if (max === min) {
      s = 0;
    } else if (l <= 0.5) {
      s = delta / (max + min);
    } else {
      s = delta / (2 - max - min);
    }
    return [h, s * 100, l * 100];
  };
  convert.rgb.hsv = function(rgb) {
    let rdif;
    let gdif;
    let bdif;
    let h;
    let s;
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const v = Math.max(r, g, b);
    const diff = v - Math.min(r, g, b);
    const diffc = function(c) {
      return (v - c) / 6 / diff + 1 / 2;
    };
    if (diff === 0) {
      h = 0;
      s = 0;
    } else {
      s = diff / v;
      rdif = diffc(r);
      gdif = diffc(g);
      bdif = diffc(b);
      if (r === v) {
        h = bdif - gdif;
      } else if (g === v) {
        h = 1 / 3 + rdif - bdif;
      } else if (b === v) {
        h = 2 / 3 + gdif - rdif;
      }
      if (h < 0) {
        h += 1;
      } else if (h > 1) {
        h -= 1;
      }
    }
    return [
      h * 360,
      s * 100,
      v * 100
    ];
  };
  convert.rgb.hwb = function(rgb) {
    const r = rgb[0];
    const g = rgb[1];
    let b = rgb[2];
    const h = convert.rgb.hsl(rgb)[0];
    const w = 1 / 255 * Math.min(r, Math.min(g, b));
    b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
    return [h, w * 100, b * 100];
  };
  convert.rgb.cmyk = function(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const k = Math.min(1 - r, 1 - g, 1 - b);
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;
    return [c * 100, m * 100, y * 100, k * 100];
  };
  function comparativeDistance(x, y) {
    return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
  }
  convert.rgb.keyword = function(rgb) {
    const reversed = reverseKeywords[rgb];
    if (reversed) {
      return reversed;
    }
    let currentClosestDistance = Infinity;
    let currentClosestKeyword;
    for (const keyword of Object.keys(cssKeywords)) {
      const value = cssKeywords[keyword];
      const distance = comparativeDistance(rgb, value);
      if (distance < currentClosestDistance) {
        currentClosestDistance = distance;
        currentClosestKeyword = keyword;
      }
    }
    return currentClosestKeyword;
  };
  convert.keyword.rgb = function(keyword) {
    return cssKeywords[keyword];
  };
  convert.rgb.xyz = function(rgb) {
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;
    r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
    g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
    b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z2 = r * 0.0193 + g * 0.1192 + b * 0.9505;
    return [x * 100, y * 100, z2 * 100];
  };
  convert.rgb.lab = function(rgb) {
    const xyz = convert.rgb.xyz(rgb);
    let x = xyz[0];
    let y = xyz[1];
    let z2 = xyz[2];
    x /= 95.047;
    y /= 100;
    z2 /= 108.883;
    x = x > 0.008856 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
    z2 = z2 > 0.008856 ? z2 ** (1 / 3) : 7.787 * z2 + 16 / 116;
    const l = 116 * y - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z2);
    return [l, a, b];
  };
  convert.hsl.rgb = function(hsl) {
    const h = hsl[0] / 360;
    const s = hsl[1] / 100;
    const l = hsl[2] / 100;
    let t2;
    let t3;
    let val;
    if (s === 0) {
      val = l * 255;
      return [val, val, val];
    }
    if (l < 0.5) {
      t2 = l * (1 + s);
    } else {
      t2 = l + s - l * s;
    }
    const t1 = 2 * l - t2;
    const rgb = [0, 0, 0];
    for (let i = 0;i < 3; i++) {
      t3 = h + 1 / 3 * -(i - 1);
      if (t3 < 0) {
        t3++;
      }
      if (t3 > 1) {
        t3--;
      }
      if (6 * t3 < 1) {
        val = t1 + (t2 - t1) * 6 * t3;
      } else if (2 * t3 < 1) {
        val = t2;
      } else if (3 * t3 < 2) {
        val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
      } else {
        val = t1;
      }
      rgb[i] = val * 255;
    }
    return rgb;
  };
  convert.hsl.hsv = function(hsl) {
    const h = hsl[0];
    let s = hsl[1] / 100;
    let l = hsl[2] / 100;
    let smin = s;
    const lmin = Math.max(l, 0.01);
    l *= 2;
    s *= l <= 1 ? l : 2 - l;
    smin *= lmin <= 1 ? lmin : 2 - lmin;
    const v = (l + s) / 2;
    const sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
    return [h, sv * 100, v * 100];
  };
  convert.hsv.rgb = function(hsv) {
    const h = hsv[0] / 60;
    const s = hsv[1] / 100;
    let v = hsv[2] / 100;
    const hi = Math.floor(h) % 6;
    const f = h - Math.floor(h);
    const p = 255 * v * (1 - s);
    const q = 255 * v * (1 - s * f);
    const t = 255 * v * (1 - s * (1 - f));
    v *= 255;
    switch (hi) {
      case 0:
        return [v, t, p];
      case 1:
        return [q, v, p];
      case 2:
        return [p, v, t];
      case 3:
        return [p, q, v];
      case 4:
        return [t, p, v];
      case 5:
        return [v, p, q];
    }
  };
  convert.hsv.hsl = function(hsv) {
    const h = hsv[0];
    const s = hsv[1] / 100;
    const v = hsv[2] / 100;
    const vmin = Math.max(v, 0.01);
    let sl;
    let l;
    l = (2 - s) * v;
    const lmin = (2 - s) * vmin;
    sl = s * vmin;
    sl /= lmin <= 1 ? lmin : 2 - lmin;
    sl = sl || 0;
    l /= 2;
    return [h, sl * 100, l * 100];
  };
  convert.hwb.rgb = function(hwb) {
    const h = hwb[0] / 360;
    let wh = hwb[1] / 100;
    let bl = hwb[2] / 100;
    const ratio = wh + bl;
    let f;
    if (ratio > 1) {
      wh /= ratio;
      bl /= ratio;
    }
    const i = Math.floor(6 * h);
    const v = 1 - bl;
    f = 6 * h - i;
    if ((i & 1) !== 0) {
      f = 1 - f;
    }
    const n = wh + f * (v - wh);
    let r;
    let g;
    let b;
    switch (i) {
      default:
      case 6:
      case 0:
        r = v;
        g = n;
        b = wh;
        break;
      case 1:
        r = n;
        g = v;
        b = wh;
        break;
      case 2:
        r = wh;
        g = v;
        b = n;
        break;
      case 3:
        r = wh;
        g = n;
        b = v;
        break;
      case 4:
        r = n;
        g = wh;
        b = v;
        break;
      case 5:
        r = v;
        g = wh;
        b = n;
        break;
    }
    return [r * 255, g * 255, b * 255];
  };
  convert.cmyk.rgb = function(cmyk) {
    const c = cmyk[0] / 100;
    const m = cmyk[1] / 100;
    const y = cmyk[2] / 100;
    const k = cmyk[3] / 100;
    const r = 1 - Math.min(1, c * (1 - k) + k);
    const g = 1 - Math.min(1, m * (1 - k) + k);
    const b = 1 - Math.min(1, y * (1 - k) + k);
    return [r * 255, g * 255, b * 255];
  };
  convert.xyz.rgb = function(xyz) {
    const x = xyz[0] / 100;
    const y = xyz[1] / 100;
    const z2 = xyz[2] / 100;
    let r;
    let g;
    let b;
    r = x * 3.2406 + y * -1.5372 + z2 * -0.4986;
    g = x * -0.9689 + y * 1.8758 + z2 * 0.0415;
    b = x * 0.0557 + y * -0.204 + z2 * 1.057;
    r = r > 0.0031308 ? 1.055 * r ** (1 / 2.4) - 0.055 : r * 12.92;
    g = g > 0.0031308 ? 1.055 * g ** (1 / 2.4) - 0.055 : g * 12.92;
    b = b > 0.0031308 ? 1.055 * b ** (1 / 2.4) - 0.055 : b * 12.92;
    r = Math.min(Math.max(0, r), 1);
    g = Math.min(Math.max(0, g), 1);
    b = Math.min(Math.max(0, b), 1);
    return [r * 255, g * 255, b * 255];
  };
  convert.xyz.lab = function(xyz) {
    let x = xyz[0];
    let y = xyz[1];
    let z2 = xyz[2];
    x /= 95.047;
    y /= 100;
    z2 /= 108.883;
    x = x > 0.008856 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
    z2 = z2 > 0.008856 ? z2 ** (1 / 3) : 7.787 * z2 + 16 / 116;
    const l = 116 * y - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z2);
    return [l, a, b];
  };
  convert.lab.xyz = function(lab) {
    const l = lab[0];
    const a = lab[1];
    const b = lab[2];
    let x;
    let y;
    let z2;
    y = (l + 16) / 116;
    x = a / 500 + y;
    z2 = y - b / 200;
    const y2 = y ** 3;
    const x2 = x ** 3;
    const z22 = z2 ** 3;
    y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
    x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
    z2 = z22 > 0.008856 ? z22 : (z2 - 16 / 116) / 7.787;
    x *= 95.047;
    y *= 100;
    z2 *= 108.883;
    return [x, y, z2];
  };
  convert.lab.lch = function(lab) {
    const l = lab[0];
    const a = lab[1];
    const b = lab[2];
    let h;
    const hr = Math.atan2(b, a);
    h = hr * 360 / 2 / Math.PI;
    if (h < 0) {
      h += 360;
    }
    const c = Math.sqrt(a * a + b * b);
    return [l, c, h];
  };
  convert.lch.lab = function(lch) {
    const l = lch[0];
    const c = lch[1];
    const h = lch[2];
    const hr = h / 360 * 2 * Math.PI;
    const a = c * Math.cos(hr);
    const b = c * Math.sin(hr);
    return [l, a, b];
  };
  convert.rgb.ansi16 = function(args, saturation = null) {
    const [r, g, b] = args;
    let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation;
    value = Math.round(value / 50);
    if (value === 0) {
      return 30;
    }
    let ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
    if (value === 2) {
      ansi += 60;
    }
    return ansi;
  };
  convert.hsv.ansi16 = function(args) {
    return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
  };
  convert.rgb.ansi256 = function(args) {
    const r = args[0];
    const g = args[1];
    const b = args[2];
    if (r === g && g === b) {
      if (r < 8) {
        return 16;
      }
      if (r > 248) {
        return 231;
      }
      return Math.round((r - 8) / 247 * 24) + 232;
    }
    const ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
    return ansi;
  };
  convert.ansi16.rgb = function(args) {
    let color = args % 10;
    if (color === 0 || color === 7) {
      if (args > 50) {
        color += 3.5;
      }
      color = color / 10.5 * 255;
      return [color, color, color];
    }
    const mult = (~~(args > 50) + 1) * 0.5;
    const r = (color & 1) * mult * 255;
    const g = (color >> 1 & 1) * mult * 255;
    const b = (color >> 2 & 1) * mult * 255;
    return [r, g, b];
  };
  convert.ansi256.rgb = function(args) {
    if (args >= 232) {
      const c = (args - 232) * 10 + 8;
      return [c, c, c];
    }
    args -= 16;
    let rem;
    const r = Math.floor(args / 36) / 5 * 255;
    const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
    const b = rem % 6 / 5 * 255;
    return [r, g, b];
  };
  convert.rgb.hex = function(args) {
    const integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
    const string = integer.toString(16).toUpperCase();
    return "000000".substring(string.length) + string;
  };
  convert.hex.rgb = function(args) {
    const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
    if (!match) {
      return [0, 0, 0];
    }
    let colorString = match[0];
    if (match[0].length === 3) {
      colorString = colorString.split("").map((char) => {
        return char + char;
      }).join("");
    }
    const integer = parseInt(colorString, 16);
    const r = integer >> 16 & 255;
    const g = integer >> 8 & 255;
    const b = integer & 255;
    return [r, g, b];
  };
  convert.rgb.hcg = function(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const max = Math.max(Math.max(r, g), b);
    const min = Math.min(Math.min(r, g), b);
    const chroma = max - min;
    let grayscale;
    let hue;
    if (chroma < 1) {
      grayscale = min / (1 - chroma);
    } else {
      grayscale = 0;
    }
    if (chroma <= 0) {
      hue = 0;
    } else if (max === r) {
      hue = (g - b) / chroma % 6;
    } else if (max === g) {
      hue = 2 + (b - r) / chroma;
    } else {
      hue = 4 + (r - g) / chroma;
    }
    hue /= 6;
    hue %= 1;
    return [hue * 360, chroma * 100, grayscale * 100];
  };
  convert.hsl.hcg = function(hsl) {
    const s = hsl[1] / 100;
    const l = hsl[2] / 100;
    const c = l < 0.5 ? 2 * s * l : 2 * s * (1 - l);
    let f = 0;
    if (c < 1) {
      f = (l - 0.5 * c) / (1 - c);
    }
    return [hsl[0], c * 100, f * 100];
  };
  convert.hsv.hcg = function(hsv) {
    const s = hsv[1] / 100;
    const v = hsv[2] / 100;
    const c = s * v;
    let f = 0;
    if (c < 1) {
      f = (v - c) / (1 - c);
    }
    return [hsv[0], c * 100, f * 100];
  };
  convert.hcg.rgb = function(hcg) {
    const h = hcg[0] / 360;
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    if (c === 0) {
      return [g * 255, g * 255, g * 255];
    }
    const pure = [0, 0, 0];
    const hi = h % 1 * 6;
    const v = hi % 1;
    const w = 1 - v;
    let mg = 0;
    switch (Math.floor(hi)) {
      case 0:
        pure[0] = 1;
        pure[1] = v;
        pure[2] = 0;
        break;
      case 1:
        pure[0] = w;
        pure[1] = 1;
        pure[2] = 0;
        break;
      case 2:
        pure[0] = 0;
        pure[1] = 1;
        pure[2] = v;
        break;
      case 3:
        pure[0] = 0;
        pure[1] = w;
        pure[2] = 1;
        break;
      case 4:
        pure[0] = v;
        pure[1] = 0;
        pure[2] = 1;
        break;
      default:
        pure[0] = 1;
        pure[1] = 0;
        pure[2] = w;
    }
    mg = (1 - c) * g;
    return [
      (c * pure[0] + mg) * 255,
      (c * pure[1] + mg) * 255,
      (c * pure[2] + mg) * 255
    ];
  };
  convert.hcg.hsv = function(hcg) {
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    const v = c + g * (1 - c);
    let f = 0;
    if (v > 0) {
      f = c / v;
    }
    return [hcg[0], f * 100, v * 100];
  };
  convert.hcg.hsl = function(hcg) {
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    const l = g * (1 - c) + 0.5 * c;
    let s = 0;
    if (l > 0 && l < 0.5) {
      s = c / (2 * l);
    } else if (l >= 0.5 && l < 1) {
      s = c / (2 * (1 - l));
    }
    return [hcg[0], s * 100, l * 100];
  };
  convert.hcg.hwb = function(hcg) {
    const c = hcg[1] / 100;
    const g = hcg[2] / 100;
    const v = c + g * (1 - c);
    return [hcg[0], (v - c) * 100, (1 - v) * 100];
  };
  convert.hwb.hcg = function(hwb) {
    const w = hwb[1] / 100;
    const b = hwb[2] / 100;
    const v = 1 - b;
    const c = v - w;
    let g = 0;
    if (c < 1) {
      g = (v - c) / (1 - c);
    }
    return [hwb[0], c * 100, g * 100];
  };
  convert.apple.rgb = function(apple) {
    return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
  };
  convert.rgb.apple = function(rgb) {
    return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
  };
  convert.gray.rgb = function(args) {
    return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
  };
  convert.gray.hsl = function(args) {
    return [0, 0, args[0]];
  };
  convert.gray.hsv = convert.gray.hsl;
  convert.gray.hwb = function(gray) {
    return [0, 100, gray[0]];
  };
  convert.gray.cmyk = function(gray) {
    return [0, 0, 0, gray[0]];
  };
  convert.gray.lab = function(gray) {
    return [gray[0], 0, 0];
  };
  convert.gray.hex = function(gray) {
    const val = Math.round(gray[0] / 100 * 255) & 255;
    const integer = (val << 16) + (val << 8) + val;
    const string = integer.toString(16).toUpperCase();
    return "000000".substring(string.length) + string;
  };
  convert.rgb.gray = function(rgb) {
    const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
    return [val / 255 * 100];
  };
});

// node_modules/color-convert/route.js
var require_route = __commonJS((exports, module) => {
  var conversions = require_conversions();
  function buildGraph() {
    const graph = {};
    const models = Object.keys(conversions);
    for (let len = models.length, i = 0;i < len; i++) {
      graph[models[i]] = {
        distance: -1,
        parent: null
      };
    }
    return graph;
  }
  function deriveBFS(fromModel) {
    const graph = buildGraph();
    const queue = [fromModel];
    graph[fromModel].distance = 0;
    while (queue.length) {
      const current = queue.pop();
      const adjacents = Object.keys(conversions[current]);
      for (let len = adjacents.length, i = 0;i < len; i++) {
        const adjacent = adjacents[i];
        const node = graph[adjacent];
        if (node.distance === -1) {
          node.distance = graph[current].distance + 1;
          node.parent = current;
          queue.unshift(adjacent);
        }
      }
    }
    return graph;
  }
  function link(from, to) {
    return function(args) {
      return to(from(args));
    };
  }
  function wrapConversion(toModel, graph) {
    const path2 = [graph[toModel].parent, toModel];
    let fn = conversions[graph[toModel].parent][toModel];
    let cur = graph[toModel].parent;
    while (graph[cur].parent) {
      path2.unshift(graph[cur].parent);
      fn = link(conversions[graph[cur].parent][cur], fn);
      cur = graph[cur].parent;
    }
    fn.conversion = path2;
    return fn;
  }
  module.exports = function(fromModel) {
    const graph = deriveBFS(fromModel);
    const conversion = {};
    const models = Object.keys(graph);
    for (let len = models.length, i = 0;i < len; i++) {
      const toModel = models[i];
      const node = graph[toModel];
      if (node.parent === null) {
        continue;
      }
      conversion[toModel] = wrapConversion(toModel, graph);
    }
    return conversion;
  };
});

// node_modules/color-convert/index.js
var require_color_convert = __commonJS((exports, module) => {
  var conversions = require_conversions();
  var route = require_route();
  var convert = {};
  var models = Object.keys(conversions);
  function wrapRaw(fn) {
    const wrappedFn = function(...args) {
      const arg0 = args[0];
      if (arg0 === undefined || arg0 === null) {
        return arg0;
      }
      if (arg0.length > 1) {
        args = arg0;
      }
      return fn(args);
    };
    if ("conversion" in fn) {
      wrappedFn.conversion = fn.conversion;
    }
    return wrappedFn;
  }
  function wrapRounded(fn) {
    const wrappedFn = function(...args) {
      const arg0 = args[0];
      if (arg0 === undefined || arg0 === null) {
        return arg0;
      }
      if (arg0.length > 1) {
        args = arg0;
      }
      const result = fn(args);
      if (typeof result === "object") {
        for (let len = result.length, i = 0;i < len; i++) {
          result[i] = Math.round(result[i]);
        }
      }
      return result;
    };
    if ("conversion" in fn) {
      wrappedFn.conversion = fn.conversion;
    }
    return wrappedFn;
  }
  models.forEach((fromModel) => {
    convert[fromModel] = {};
    Object.defineProperty(convert[fromModel], "channels", { value: conversions[fromModel].channels });
    Object.defineProperty(convert[fromModel], "labels", { value: conversions[fromModel].labels });
    const routes = route(fromModel);
    const routeModels = Object.keys(routes);
    routeModels.forEach((toModel) => {
      const fn = routes[toModel];
      convert[fromModel][toModel] = wrapRounded(fn);
      convert[fromModel][toModel].raw = wrapRaw(fn);
    });
  });
  module.exports = convert;
});

// node_modules/ansi-styles/index.js
var require_ansi_styles = __commonJS((exports, module) => {
  var wrapAnsi16 = (fn, offset) => (...args) => {
    const code = fn(...args);
    return `\x1B[${code + offset}m`;
  };
  var wrapAnsi256 = (fn, offset) => (...args) => {
    const code = fn(...args);
    return `\x1B[${38 + offset};5;${code}m`;
  };
  var wrapAnsi16m = (fn, offset) => (...args) => {
    const rgb = fn(...args);
    return `\x1B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
  };
  var ansi2ansi = (n) => n;
  var rgb2rgb = (r, g, b) => [r, g, b];
  var setLazyProperty = (object, property, get) => {
    Object.defineProperty(object, property, {
      get: () => {
        const value = get();
        Object.defineProperty(object, property, {
          value,
          enumerable: true,
          configurable: true
        });
        return value;
      },
      enumerable: true,
      configurable: true
    });
  };
  var colorConvert;
  var makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
    if (colorConvert === undefined) {
      colorConvert = require_color_convert();
    }
    const offset = isBackground ? 10 : 0;
    const styles = {};
    for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
      const name = sourceSpace === "ansi16" ? "ansi" : sourceSpace;
      if (sourceSpace === targetSpace) {
        styles[name] = wrap(identity, offset);
      } else if (typeof suite === "object") {
        styles[name] = wrap(suite[targetSpace], offset);
      }
    }
    return styles;
  };
  function assembleStyles() {
    const codes = new Map;
    const styles = {
      modifier: {
        reset: [0, 0],
        bold: [1, 22],
        dim: [2, 22],
        italic: [3, 23],
        underline: [4, 24],
        inverse: [7, 27],
        hidden: [8, 28],
        strikethrough: [9, 29]
      },
      color: {
        black: [30, 39],
        red: [31, 39],
        green: [32, 39],
        yellow: [33, 39],
        blue: [34, 39],
        magenta: [35, 39],
        cyan: [36, 39],
        white: [37, 39],
        blackBright: [90, 39],
        redBright: [91, 39],
        greenBright: [92, 39],
        yellowBright: [93, 39],
        blueBright: [94, 39],
        magentaBright: [95, 39],
        cyanBright: [96, 39],
        whiteBright: [97, 39]
      },
      bgColor: {
        bgBlack: [40, 49],
        bgRed: [41, 49],
        bgGreen: [42, 49],
        bgYellow: [43, 49],
        bgBlue: [44, 49],
        bgMagenta: [45, 49],
        bgCyan: [46, 49],
        bgWhite: [47, 49],
        bgBlackBright: [100, 49],
        bgRedBright: [101, 49],
        bgGreenBright: [102, 49],
        bgYellowBright: [103, 49],
        bgBlueBright: [104, 49],
        bgMagentaBright: [105, 49],
        bgCyanBright: [106, 49],
        bgWhiteBright: [107, 49]
      }
    };
    styles.color.gray = styles.color.blackBright;
    styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
    styles.color.grey = styles.color.blackBright;
    styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;
    for (const [groupName, group] of Object.entries(styles)) {
      for (const [styleName, style] of Object.entries(group)) {
        styles[styleName] = {
          open: `\x1B[${style[0]}m`,
          close: `\x1B[${style[1]}m`
        };
        group[styleName] = styles[styleName];
        codes.set(style[0], style[1]);
      }
      Object.defineProperty(styles, groupName, {
        value: group,
        enumerable: false
      });
    }
    Object.defineProperty(styles, "codes", {
      value: codes,
      enumerable: false
    });
    styles.color.close = "\x1B[39m";
    styles.bgColor.close = "\x1B[49m";
    setLazyProperty(styles.color, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, false));
    setLazyProperty(styles.color, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, false));
    setLazyProperty(styles.color, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, false));
    setLazyProperty(styles.bgColor, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, true));
    setLazyProperty(styles.bgColor, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, true));
    setLazyProperty(styles.bgColor, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, true));
    return styles;
  }
  Object.defineProperty(module, "exports", {
    enumerable: true,
    get: assembleStyles
  });
});

// node_modules/wrap-ansi/index.js
var require_wrap_ansi = __commonJS((exports, module) => {
  var stringWidth = require_string_width();
  var stripAnsi = require_strip_ansi();
  var ansiStyles = require_ansi_styles();
  var ESCAPES = new Set([
    "\x1B",
    ""
  ]);
  var END_CODE = 39;
  var ANSI_ESCAPE_BELL = "\x07";
  var ANSI_CSI = "[";
  var ANSI_OSC = "]";
  var ANSI_SGR_TERMINATOR = "m";
  var ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;
  var wrapAnsi = (code) => `${ESCAPES.values().next().value}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
  var wrapAnsiHyperlink = (uri) => `${ESCAPES.values().next().value}${ANSI_ESCAPE_LINK}${uri}${ANSI_ESCAPE_BELL}`;
  var wordLengths = (string) => string.split(" ").map((character) => stringWidth(character));
  var wrapWord = (rows, word, columns) => {
    const characters = [...word];
    let isInsideEscape = false;
    let isInsideLinkEscape = false;
    let visible = stringWidth(stripAnsi(rows[rows.length - 1]));
    for (const [index, character] of characters.entries()) {
      const characterLength = stringWidth(character);
      if (visible + characterLength <= columns) {
        rows[rows.length - 1] += character;
      } else {
        rows.push(character);
        visible = 0;
      }
      if (ESCAPES.has(character)) {
        isInsideEscape = true;
        isInsideLinkEscape = characters.slice(index + 1).join("").startsWith(ANSI_ESCAPE_LINK);
      }
      if (isInsideEscape) {
        if (isInsideLinkEscape) {
          if (character === ANSI_ESCAPE_BELL) {
            isInsideEscape = false;
            isInsideLinkEscape = false;
          }
        } else if (character === ANSI_SGR_TERMINATOR) {
          isInsideEscape = false;
        }
        continue;
      }
      visible += characterLength;
      if (visible === columns && index < characters.length - 1) {
        rows.push("");
        visible = 0;
      }
    }
    if (!visible && rows[rows.length - 1].length > 0 && rows.length > 1) {
      rows[rows.length - 2] += rows.pop();
    }
  };
  var stringVisibleTrimSpacesRight = (string) => {
    const words = string.split(" ");
    let last = words.length;
    while (last > 0) {
      if (stringWidth(words[last - 1]) > 0) {
        break;
      }
      last--;
    }
    if (last === words.length) {
      return string;
    }
    return words.slice(0, last).join(" ") + words.slice(last).join("");
  };
  var exec = (string, columns, options = {}) => {
    if (options.trim !== false && string.trim() === "") {
      return "";
    }
    let returnValue = "";
    let escapeCode;
    let escapeUrl;
    const lengths = wordLengths(string);
    let rows = [""];
    for (const [index, word] of string.split(" ").entries()) {
      if (options.trim !== false) {
        rows[rows.length - 1] = rows[rows.length - 1].trimStart();
      }
      let rowLength = stringWidth(rows[rows.length - 1]);
      if (index !== 0) {
        if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
          rows.push("");
          rowLength = 0;
        }
        if (rowLength > 0 || options.trim === false) {
          rows[rows.length - 1] += " ";
          rowLength++;
        }
      }
      if (options.hard && lengths[index] > columns) {
        const remainingColumns = columns - rowLength;
        const breaksStartingThisLine = 1 + Math.floor((lengths[index] - remainingColumns - 1) / columns);
        const breaksStartingNextLine = Math.floor((lengths[index] - 1) / columns);
        if (breaksStartingNextLine < breaksStartingThisLine) {
          rows.push("");
        }
        wrapWord(rows, word, columns);
        continue;
      }
      if (rowLength + lengths[index] > columns && rowLength > 0 && lengths[index] > 0) {
        if (options.wordWrap === false && rowLength < columns) {
          wrapWord(rows, word, columns);
          continue;
        }
        rows.push("");
      }
      if (rowLength + lengths[index] > columns && options.wordWrap === false) {
        wrapWord(rows, word, columns);
        continue;
      }
      rows[rows.length - 1] += word;
    }
    if (options.trim !== false) {
      rows = rows.map(stringVisibleTrimSpacesRight);
    }
    const pre = [...rows.join(`
`)];
    for (const [index, character] of pre.entries()) {
      returnValue += character;
      if (ESCAPES.has(character)) {
        const { groups } = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`).exec(pre.slice(index).join("")) || { groups: {} };
        if (groups.code !== undefined) {
          const code2 = Number.parseFloat(groups.code);
          escapeCode = code2 === END_CODE ? undefined : code2;
        } else if (groups.uri !== undefined) {
          escapeUrl = groups.uri.length === 0 ? undefined : groups.uri;
        }
      }
      const code = ansiStyles.codes.get(Number(escapeCode));
      if (pre[index + 1] === `
`) {
        if (escapeUrl) {
          returnValue += wrapAnsiHyperlink("");
        }
        if (escapeCode && code) {
          returnValue += wrapAnsi(code);
        }
      } else if (character === `
`) {
        if (escapeCode && code) {
          returnValue += wrapAnsi(escapeCode);
        }
        if (escapeUrl) {
          returnValue += wrapAnsiHyperlink(escapeUrl);
        }
      }
    }
    return returnValue;
  };
  module.exports = (string, columns, options) => {
    return String(string).normalize().replace(/\r\n/g, `
`).split(`
`).map((line) => exec(line, columns, options)).join(`
`);
  };
});

// node_modules/cliui/build/index.cjs
var require_build3 = __commonJS((exports, module) => {
  var align = {
    right: alignRight,
    center: alignCenter
  };
  var top = 0;
  var right = 1;
  var bottom = 2;
  var left = 3;

  class UI {
    constructor(opts) {
      var _a;
      this.width = opts.width;
      this.wrap = (_a = opts.wrap) !== null && _a !== undefined ? _a : true;
      this.rows = [];
    }
    span(...args) {
      const cols = this.div(...args);
      cols.span = true;
    }
    resetOutput() {
      this.rows = [];
    }
    div(...args) {
      if (args.length === 0) {
        this.div("");
      }
      if (this.wrap && this.shouldApplyLayoutDSL(...args) && typeof args[0] === "string") {
        return this.applyLayoutDSL(args[0]);
      }
      const cols = args.map((arg) => {
        if (typeof arg === "string") {
          return this.colFromString(arg);
        }
        return arg;
      });
      this.rows.push(cols);
      return cols;
    }
    shouldApplyLayoutDSL(...args) {
      return args.length === 1 && typeof args[0] === "string" && /[\t\n]/.test(args[0]);
    }
    applyLayoutDSL(str) {
      const rows = str.split(`
`).map((row) => row.split("\t"));
      let leftColumnWidth = 0;
      rows.forEach((columns) => {
        if (columns.length > 1 && mixin.stringWidth(columns[0]) > leftColumnWidth) {
          leftColumnWidth = Math.min(Math.floor(this.width * 0.5), mixin.stringWidth(columns[0]));
        }
      });
      rows.forEach((columns) => {
        this.div(...columns.map((r, i) => {
          return {
            text: r.trim(),
            padding: this.measurePadding(r),
            width: i === 0 && columns.length > 1 ? leftColumnWidth : undefined
          };
        }));
      });
      return this.rows[this.rows.length - 1];
    }
    colFromString(text) {
      return {
        text,
        padding: this.measurePadding(text)
      };
    }
    measurePadding(str) {
      const noAnsi = mixin.stripAnsi(str);
      return [0, noAnsi.match(/\s*$/)[0].length, 0, noAnsi.match(/^\s*/)[0].length];
    }
    toString() {
      const lines = [];
      this.rows.forEach((row) => {
        this.rowToString(row, lines);
      });
      return lines.filter((line) => !line.hidden).map((line) => line.text).join(`
`);
    }
    rowToString(row, lines) {
      this.rasterize(row).forEach((rrow, r) => {
        let str = "";
        rrow.forEach((col, c) => {
          const { width } = row[c];
          const wrapWidth = this.negatePadding(row[c]);
          let ts = col;
          if (wrapWidth > mixin.stringWidth(col)) {
            ts += " ".repeat(wrapWidth - mixin.stringWidth(col));
          }
          if (row[c].align && row[c].align !== "left" && this.wrap) {
            const fn = align[row[c].align];
            ts = fn(ts, wrapWidth);
            if (mixin.stringWidth(ts) < wrapWidth) {
              ts += " ".repeat((width || 0) - mixin.stringWidth(ts) - 1);
            }
          }
          const padding = row[c].padding || [0, 0, 0, 0];
          if (padding[left]) {
            str += " ".repeat(padding[left]);
          }
          str += addBorder(row[c], ts, "| ");
          str += ts;
          str += addBorder(row[c], ts, " |");
          if (padding[right]) {
            str += " ".repeat(padding[right]);
          }
          if (r === 0 && lines.length > 0) {
            str = this.renderInline(str, lines[lines.length - 1]);
          }
        });
        lines.push({
          text: str.replace(/ +$/, ""),
          span: row.span
        });
      });
      return lines;
    }
    renderInline(source, previousLine) {
      const match = source.match(/^ */);
      const leadingWhitespace = match ? match[0].length : 0;
      const target = previousLine.text;
      const targetTextWidth = mixin.stringWidth(target.trimRight());
      if (!previousLine.span) {
        return source;
      }
      if (!this.wrap) {
        previousLine.hidden = true;
        return target + source;
      }
      if (leadingWhitespace < targetTextWidth) {
        return source;
      }
      previousLine.hidden = true;
      return target.trimRight() + " ".repeat(leadingWhitespace - targetTextWidth) + source.trimLeft();
    }
    rasterize(row) {
      const rrows = [];
      const widths = this.columnWidths(row);
      let wrapped;
      row.forEach((col, c) => {
        col.width = widths[c];
        if (this.wrap) {
          wrapped = mixin.wrap(col.text, this.negatePadding(col), { hard: true }).split(`
`);
        } else {
          wrapped = col.text.split(`
`);
        }
        if (col.border) {
          wrapped.unshift("." + "-".repeat(this.negatePadding(col) + 2) + ".");
          wrapped.push("'" + "-".repeat(this.negatePadding(col) + 2) + "'");
        }
        if (col.padding) {
          wrapped.unshift(...new Array(col.padding[top] || 0).fill(""));
          wrapped.push(...new Array(col.padding[bottom] || 0).fill(""));
        }
        wrapped.forEach((str, r) => {
          if (!rrows[r]) {
            rrows.push([]);
          }
          const rrow = rrows[r];
          for (let i = 0;i < c; i++) {
            if (rrow[i] === undefined) {
              rrow.push("");
            }
          }
          rrow.push(str);
        });
      });
      return rrows;
    }
    negatePadding(col) {
      let wrapWidth = col.width || 0;
      if (col.padding) {
        wrapWidth -= (col.padding[left] || 0) + (col.padding[right] || 0);
      }
      if (col.border) {
        wrapWidth -= 4;
      }
      return wrapWidth;
    }
    columnWidths(row) {
      if (!this.wrap) {
        return row.map((col) => {
          return col.width || mixin.stringWidth(col.text);
        });
      }
      let unset = row.length;
      let remainingWidth = this.width;
      const widths = row.map((col) => {
        if (col.width) {
          unset--;
          remainingWidth -= col.width;
          return col.width;
        }
        return;
      });
      const unsetWidth = unset ? Math.floor(remainingWidth / unset) : 0;
      return widths.map((w, i) => {
        if (w === undefined) {
          return Math.max(unsetWidth, _minWidth(row[i]));
        }
        return w;
      });
    }
  }
  function addBorder(col, ts, style) {
    if (col.border) {
      if (/[.']-+[.']/.test(ts)) {
        return "";
      }
      if (ts.trim().length !== 0) {
        return style;
      }
      return "  ";
    }
    return "";
  }
  function _minWidth(col) {
    const padding = col.padding || [];
    const minWidth = 1 + (padding[left] || 0) + (padding[right] || 0);
    if (col.border) {
      return minWidth + 4;
    }
    return minWidth;
  }
  function getWindowWidth() {
    if (typeof process === "object" && process.stdout && process.stdout.columns) {
      return process.stdout.columns;
    }
    return 80;
  }
  function alignRight(str, width) {
    str = str.trim();
    const strWidth = mixin.stringWidth(str);
    if (strWidth < width) {
      return " ".repeat(width - strWidth) + str;
    }
    return str;
  }
  function alignCenter(str, width) {
    str = str.trim();
    const strWidth = mixin.stringWidth(str);
    if (strWidth >= width) {
      return str;
    }
    return " ".repeat(width - strWidth >> 1) + str;
  }
  var mixin;
  function cliui(opts, _mixin) {
    mixin = _mixin;
    return new UI({
      width: (opts === null || opts === undefined ? undefined : opts.width) || getWindowWidth(),
      wrap: opts === null || opts === undefined ? undefined : opts.wrap
    });
  }
  var stringWidth = require_string_width();
  var stripAnsi = require_strip_ansi();
  var wrap = require_wrap_ansi();
  function ui(opts) {
    return cliui(opts, {
      stringWidth,
      stripAnsi,
      wrap
    });
  }
  module.exports = ui;
});

// node_modules/escalade/sync/index.js
var require_sync = __commonJS((exports, module) => {
  var { dirname, resolve } = __require("path");
  var { readdirSync, statSync } = __require("fs");
  module.exports = function(start, callback) {
    let dir = resolve(".", start);
    let tmp, stats = statSync(dir);
    if (!stats.isDirectory()) {
      dir = dirname(dir);
    }
    while (true) {
      tmp = callback(dir, readdirSync(dir));
      if (tmp)
        return resolve(dir, tmp);
      dir = dirname(tmp = dir);
      if (tmp === dir)
        break;
    }
  };
});

// node_modules/get-caller-file/index.js
var require_get_caller_file = __commonJS((exports, module) => {
  module.exports = function getCallerFile(position) {
    if (position === undefined) {
      position = 2;
    }
    if (position >= Error.stackTraceLimit) {
      throw new TypeError("getCallerFile(position) requires position be less then Error.stackTraceLimit but position was: `" + position + "` and Error.stackTraceLimit was: `" + Error.stackTraceLimit + "`");
    }
    var oldPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack2) {
      return stack2;
    };
    var stack = new Error().stack;
    Error.prepareStackTrace = oldPrepareStackTrace;
    if (stack !== null && typeof stack === "object") {
      return stack[position] ? stack[position].getFileName() : undefined;
    }
  };
});

// node_modules/require-directory/index.js
var require_require_directory = __commonJS((exports, module) => {
  var fs2 = __require("fs");
  var join = __require("path").join;
  var resolve = __require("path").resolve;
  var dirname = __require("path").dirname;
  var defaultOptions = {
    extensions: ["js", "json", "coffee"],
    recurse: true,
    rename: function(name) {
      return name;
    },
    visit: function(obj) {
      return obj;
    }
  };
  function checkFileInclusion(path2, filename, options) {
    return new RegExp("\\.(" + options.extensions.join("|") + ")$", "i").test(filename) && !(options.include && options.include instanceof RegExp && !options.include.test(path2)) && !(options.include && typeof options.include === "function" && !options.include(path2, filename)) && !(options.exclude && options.exclude instanceof RegExp && options.exclude.test(path2)) && !(options.exclude && typeof options.exclude === "function" && options.exclude(path2, filename));
  }
  function requireDirectory(m, path2, options) {
    var retval = {};
    if (path2 && !options && typeof path2 !== "string") {
      options = path2;
      path2 = null;
    }
    options = options || {};
    for (var prop in defaultOptions) {
      if (typeof options[prop] === "undefined") {
        options[prop] = defaultOptions[prop];
      }
    }
    path2 = !path2 ? dirname(m.filename) : resolve(dirname(m.filename), path2);
    fs2.readdirSync(path2).forEach(function(filename) {
      var joined = join(path2, filename), files, key, obj;
      if (fs2.statSync(joined).isDirectory() && options.recurse) {
        files = requireDirectory(m, joined, options);
        if (Object.keys(files).length) {
          retval[options.rename(filename, joined, filename)] = files;
        }
      } else {
        if (joined !== m.filename && checkFileInclusion(joined, filename, options)) {
          key = filename.substring(0, filename.lastIndexOf("."));
          obj = m.require(joined);
          retval[options.rename(key, joined, filename)] = options.visit(obj, joined, filename) || obj;
        }
      }
    });
    return retval;
  }
  module.exports = requireDirectory;
  module.exports.defaults = defaultOptions;
});

// node_modules/yargs/build/index.cjs
var require_build4 = __commonJS((exports, module) => {
  var __dirname = "/Users/tlee/Projects/harperdb/proxy-transform/node_modules/yargs/build";
  var t = __require("assert");

  class e extends Error {
    constructor(t2) {
      super(t2 || "yargs error"), this.name = "YError", Error.captureStackTrace && Error.captureStackTrace(this, e);
    }
  }
  var s;
  var i = [];
  function n(t2, o2, a2, h2) {
    s = h2;
    let l2 = {};
    if (Object.prototype.hasOwnProperty.call(t2, "extends")) {
      if (typeof t2.extends != "string")
        return l2;
      const r2 = /\.json|\..*rc$/.test(t2.extends);
      let h3 = null;
      if (r2)
        h3 = function(t3, e2) {
          return s.path.resolve(t3, e2);
        }(o2, t2.extends);
      else
        try {
          h3 = __require.resolve(t2.extends);
        } catch (e2) {
          return t2;
        }
      (function(t3) {
        if (i.indexOf(t3) > -1)
          throw new e(`Circular extended configurations: '${t3}'.`);
      })(h3), i.push(h3), l2 = r2 ? JSON.parse(s.readFileSync(h3, "utf8")) : __require(t2.extends), delete t2.extends, l2 = n(l2, s.path.dirname(h3), a2, s);
    }
    return i = [], a2 ? r(l2, t2) : Object.assign({}, l2, t2);
  }
  function r(t2, e2) {
    const s2 = {};
    function i2(t3) {
      return t3 && typeof t3 == "object" && !Array.isArray(t3);
    }
    Object.assign(s2, t2);
    for (const n2 of Object.keys(e2))
      i2(e2[n2]) && i2(s2[n2]) ? s2[n2] = r(t2[n2], e2[n2]) : s2[n2] = e2[n2];
    return s2;
  }
  function o(t2) {
    const e2 = t2.replace(/\s{2,}/g, " ").split(/\s+(?![^[]*]|[^<]*>)/), s2 = /\.*[\][<>]/g, i2 = e2.shift();
    if (!i2)
      throw new Error(`No command found in: ${t2}`);
    const n2 = { cmd: i2.replace(s2, ""), demanded: [], optional: [] };
    return e2.forEach((t3, i3) => {
      let r2 = false;
      t3 = t3.replace(/\s/g, ""), /\.+[\]>]/.test(t3) && i3 === e2.length - 1 && (r2 = true), /^\[/.test(t3) ? n2.optional.push({ cmd: t3.replace(s2, "").split("|"), variadic: r2 }) : n2.demanded.push({ cmd: t3.replace(s2, "").split("|"), variadic: r2 });
    }), n2;
  }
  var a = ["first", "second", "third", "fourth", "fifth", "sixth"];
  function h(t2, s2, i2) {
    try {
      let n2 = 0;
      const [r2, a2, h2] = typeof t2 == "object" ? [{ demanded: [], optional: [] }, t2, s2] : [o(`cmd ${t2}`), s2, i2], f2 = [].slice.call(a2);
      for (;f2.length && f2[f2.length - 1] === undefined; )
        f2.pop();
      const d2 = h2 || f2.length;
      if (d2 < r2.demanded.length)
        throw new e(`Not enough arguments provided. Expected ${r2.demanded.length} but received ${f2.length}.`);
      const u2 = r2.demanded.length + r2.optional.length;
      if (d2 > u2)
        throw new e(`Too many arguments provided. Expected max ${u2} but received ${d2}.`);
      r2.demanded.forEach((t3) => {
        const e2 = l(f2.shift());
        t3.cmd.filter((t4) => t4 === e2 || t4 === "*").length === 0 && c(e2, t3.cmd, n2), n2 += 1;
      }), r2.optional.forEach((t3) => {
        if (f2.length === 0)
          return;
        const e2 = l(f2.shift());
        t3.cmd.filter((t4) => t4 === e2 || t4 === "*").length === 0 && c(e2, t3.cmd, n2), n2 += 1;
      });
    } catch (t3) {
      console.warn(t3.stack);
    }
  }
  function l(t2) {
    return Array.isArray(t2) ? "array" : t2 === null ? "null" : typeof t2;
  }
  function c(t2, s2, i2) {
    throw new e(`Invalid ${a[i2] || "manyith"} argument. Expected ${s2.join(" or ")} but received ${t2}.`);
  }
  function f(t2) {
    return !!t2 && !!t2.then && typeof t2.then == "function";
  }
  function d(t2, e2, s2, i2) {
    s2.assert.notStrictEqual(t2, e2, i2);
  }
  function u(t2, e2) {
    e2.assert.strictEqual(typeof t2, "string");
  }
  function p(t2) {
    return Object.keys(t2);
  }
  function g(t2 = {}, e2 = () => true) {
    const s2 = {};
    return p(t2).forEach((i2) => {
      e2(i2, t2[i2]) && (s2[i2] = t2[i2]);
    }), s2;
  }
  function m() {
    return process.versions.electron && !process.defaultApp ? 0 : 1;
  }
  function y() {
    return process.argv[m()];
  }
  var b = Object.freeze({ __proto__: null, hideBin: function(t2) {
    return t2.slice(m() + 1);
  }, getProcessArgvBin: y });
  function v(t2, e2, s2, i2) {
    if (s2 === "a" && !i2)
      throw new TypeError("Private accessor was defined without a getter");
    if (typeof e2 == "function" ? t2 !== e2 || !i2 : !e2.has(t2))
      throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return s2 === "m" ? i2 : s2 === "a" ? i2.call(t2) : i2 ? i2.value : e2.get(t2);
  }
  function O(t2, e2, s2, i2, n2) {
    if (i2 === "m")
      throw new TypeError("Private method is not writable");
    if (i2 === "a" && !n2)
      throw new TypeError("Private accessor was defined without a setter");
    if (typeof e2 == "function" ? t2 !== e2 || !n2 : !e2.has(t2))
      throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return i2 === "a" ? n2.call(t2, s2) : n2 ? n2.value = s2 : e2.set(t2, s2), s2;
  }

  class w {
    constructor(t2) {
      this.globalMiddleware = [], this.frozens = [], this.yargs = t2;
    }
    addMiddleware(t2, e2, s2 = true, i2 = false) {
      if (h("<array|function> [boolean] [boolean] [boolean]", [t2, e2, s2], arguments.length), Array.isArray(t2)) {
        for (let i3 = 0;i3 < t2.length; i3++) {
          if (typeof t2[i3] != "function")
            throw Error("middleware must be a function");
          const n2 = t2[i3];
          n2.applyBeforeValidation = e2, n2.global = s2;
        }
        Array.prototype.push.apply(this.globalMiddleware, t2);
      } else if (typeof t2 == "function") {
        const n2 = t2;
        n2.applyBeforeValidation = e2, n2.global = s2, n2.mutates = i2, this.globalMiddleware.push(t2);
      }
      return this.yargs;
    }
    addCoerceMiddleware(t2, e2) {
      const s2 = this.yargs.getAliases();
      return this.globalMiddleware = this.globalMiddleware.filter((t3) => {
        const i2 = [...s2[e2] || [], e2];
        return !t3.option || !i2.includes(t3.option);
      }), t2.option = e2, this.addMiddleware(t2, true, true, true);
    }
    getMiddleware() {
      return this.globalMiddleware;
    }
    freeze() {
      this.frozens.push([...this.globalMiddleware]);
    }
    unfreeze() {
      const t2 = this.frozens.pop();
      t2 !== undefined && (this.globalMiddleware = t2);
    }
    reset() {
      this.globalMiddleware = this.globalMiddleware.filter((t2) => t2.global);
    }
  }
  function C(t2, e2, s2, i2) {
    return s2.reduce((t3, s3) => {
      if (s3.applyBeforeValidation !== i2)
        return t3;
      if (s3.mutates) {
        if (s3.applied)
          return t3;
        s3.applied = true;
      }
      if (f(t3))
        return t3.then((t4) => Promise.all([t4, s3(t4, e2)])).then(([t4, e3]) => Object.assign(t4, e3));
      {
        const i3 = s3(t3, e2);
        return f(i3) ? i3.then((e3) => Object.assign(t3, e3)) : Object.assign(t3, i3);
      }
    }, t2);
  }
  function j(t2, e2, s2 = (t3) => {
    throw t3;
  }) {
    try {
      const s3 = typeof t2 == "function" ? t2() : t2;
      return f(s3) ? s3.then((t3) => e2(t3)) : e2(s3);
    } catch (t3) {
      return s2(t3);
    }
  }
  var M = /(^\*)|(^\$0)/;

  class _ {
    constructor(t2, e2, s2, i2) {
      this.requireCache = new Set, this.handlers = {}, this.aliasMap = {}, this.frozens = [], this.shim = i2, this.usage = t2, this.globalMiddleware = s2, this.validation = e2;
    }
    addDirectory(t2, e2, s2, i2) {
      typeof (i2 = i2 || {}).recurse != "boolean" && (i2.recurse = false), Array.isArray(i2.extensions) || (i2.extensions = ["js"]);
      const n2 = typeof i2.visit == "function" ? i2.visit : (t3) => t3;
      i2.visit = (t3, e3, s3) => {
        const i3 = n2(t3, e3, s3);
        if (i3) {
          if (this.requireCache.has(e3))
            return i3;
          this.requireCache.add(e3), this.addHandler(i3);
        }
        return i3;
      }, this.shim.requireDirectory({ require: e2, filename: s2 }, t2, i2);
    }
    addHandler(t2, e2, s2, i2, n2, r2) {
      let a2 = [];
      const h2 = function(t3) {
        return t3 ? t3.map((t4) => (t4.applyBeforeValidation = false, t4)) : [];
      }(n2);
      if (i2 = i2 || (() => {
      }), Array.isArray(t2))
        if (function(t3) {
          return t3.every((t4) => typeof t4 == "string");
        }(t2))
          [t2, ...a2] = t2;
        else
          for (const e3 of t2)
            this.addHandler(e3);
      else {
        if (function(t3) {
          return typeof t3 == "object" && !Array.isArray(t3);
        }(t2)) {
          let e3 = Array.isArray(t2.command) || typeof t2.command == "string" ? t2.command : this.moduleName(t2);
          return t2.aliases && (e3 = [].concat(e3).concat(t2.aliases)), void this.addHandler(e3, this.extractDesc(t2), t2.builder, t2.handler, t2.middlewares, t2.deprecated);
        }
        if (k(s2))
          return void this.addHandler([t2].concat(a2), e2, s2.builder, s2.handler, s2.middlewares, s2.deprecated);
      }
      if (typeof t2 == "string") {
        const n3 = o(t2);
        a2 = a2.map((t3) => o(t3).cmd);
        let l2 = false;
        const c2 = [n3.cmd].concat(a2).filter((t3) => !M.test(t3) || (l2 = true, false));
        c2.length === 0 && l2 && c2.push("$0"), l2 && (n3.cmd = c2[0], a2 = c2.slice(1), t2 = t2.replace(M, n3.cmd)), a2.forEach((t3) => {
          this.aliasMap[t3] = n3.cmd;
        }), e2 !== false && this.usage.command(t2, e2, l2, a2, r2), this.handlers[n3.cmd] = { original: t2, description: e2, handler: i2, builder: s2 || {}, middlewares: h2, deprecated: r2, demanded: n3.demanded, optional: n3.optional }, l2 && (this.defaultCommand = this.handlers[n3.cmd]);
      }
    }
    getCommandHandlers() {
      return this.handlers;
    }
    getCommands() {
      return Object.keys(this.handlers).concat(Object.keys(this.aliasMap));
    }
    hasDefaultCommand() {
      return !!this.defaultCommand;
    }
    runCommand(t2, e2, s2, i2, n2, r2) {
      const o2 = this.handlers[t2] || this.handlers[this.aliasMap[t2]] || this.defaultCommand, a2 = e2.getInternalMethods().getContext(), h2 = a2.commands.slice(), l2 = !t2;
      t2 && (a2.commands.push(t2), a2.fullCommands.push(o2.original));
      const c2 = this.applyBuilderUpdateUsageAndParse(l2, o2, e2, s2.aliases, h2, i2, n2, r2);
      return f(c2) ? c2.then((t3) => this.applyMiddlewareAndGetResult(l2, o2, t3.innerArgv, a2, n2, t3.aliases, e2)) : this.applyMiddlewareAndGetResult(l2, o2, c2.innerArgv, a2, n2, c2.aliases, e2);
    }
    applyBuilderUpdateUsageAndParse(t2, e2, s2, i2, n2, r2, o2, a2) {
      const h2 = e2.builder;
      let l2 = s2;
      if (x(h2)) {
        s2.getInternalMethods().getUsageInstance().freeze();
        const c2 = h2(s2.getInternalMethods().reset(i2), a2);
        if (f(c2))
          return c2.then((i3) => {
            var a3;
            return l2 = (a3 = i3) && typeof a3.getInternalMethods == "function" ? i3 : s2, this.parseAndUpdateUsage(t2, e2, l2, n2, r2, o2);
          });
      } else
        (function(t3) {
          return typeof t3 == "object";
        })(h2) && (s2.getInternalMethods().getUsageInstance().freeze(), l2 = s2.getInternalMethods().reset(i2), Object.keys(e2.builder).forEach((t3) => {
          l2.option(t3, h2[t3]);
        }));
      return this.parseAndUpdateUsage(t2, e2, l2, n2, r2, o2);
    }
    parseAndUpdateUsage(t2, e2, s2, i2, n2, r2) {
      t2 && s2.getInternalMethods().getUsageInstance().unfreeze(true), this.shouldUpdateUsage(s2) && s2.getInternalMethods().getUsageInstance().usage(this.usageFromParentCommandsCommandHandler(i2, e2), e2.description);
      const o2 = s2.getInternalMethods().runYargsParserAndExecuteCommands(null, undefined, true, n2, r2);
      return f(o2) ? o2.then((t3) => ({ aliases: s2.parsed.aliases, innerArgv: t3 })) : { aliases: s2.parsed.aliases, innerArgv: o2 };
    }
    shouldUpdateUsage(t2) {
      return !t2.getInternalMethods().getUsageInstance().getUsageDisabled() && t2.getInternalMethods().getUsageInstance().getUsage().length === 0;
    }
    usageFromParentCommandsCommandHandler(t2, e2) {
      const s2 = M.test(e2.original) ? e2.original.replace(M, "").trim() : e2.original, i2 = t2.filter((t3) => !M.test(t3));
      return i2.push(s2), `$0 ${i2.join(" ")}`;
    }
    handleValidationAndGetResult(t2, e2, s2, i2, n2, r2, o2, a2) {
      if (!r2.getInternalMethods().getHasOutput()) {
        const e3 = r2.getInternalMethods().runValidation(n2, a2, r2.parsed.error, t2);
        s2 = j(s2, (t3) => (e3(t3), t3));
      }
      if (e2.handler && !r2.getInternalMethods().getHasOutput()) {
        r2.getInternalMethods().setHasOutput();
        const i3 = !!r2.getOptions().configuration["populate--"];
        r2.getInternalMethods().postProcess(s2, i3, false, false), s2 = j(s2 = C(s2, r2, o2, false), (t3) => {
          const s3 = e2.handler(t3);
          return f(s3) ? s3.then(() => t3) : t3;
        }), t2 || r2.getInternalMethods().getUsageInstance().cacheHelpMessage(), f(s2) && !r2.getInternalMethods().hasParseCallback() && s2.catch((t3) => {
          try {
            r2.getInternalMethods().getUsageInstance().fail(null, t3);
          } catch (t4) {
          }
        });
      }
      return t2 || (i2.commands.pop(), i2.fullCommands.pop()), s2;
    }
    applyMiddlewareAndGetResult(t2, e2, s2, i2, n2, r2, o2) {
      let a2 = {};
      if (n2)
        return s2;
      o2.getInternalMethods().getHasOutput() || (a2 = this.populatePositionals(e2, s2, i2, o2));
      const h2 = this.globalMiddleware.getMiddleware().slice(0).concat(e2.middlewares), l2 = C(s2, o2, h2, true);
      return f(l2) ? l2.then((s3) => this.handleValidationAndGetResult(t2, e2, s3, i2, r2, o2, h2, a2)) : this.handleValidationAndGetResult(t2, e2, l2, i2, r2, o2, h2, a2);
    }
    populatePositionals(t2, e2, s2, i2) {
      e2._ = e2._.slice(s2.commands.length);
      const n2 = t2.demanded.slice(0), r2 = t2.optional.slice(0), o2 = {};
      for (this.validation.positionalCount(n2.length, e2._.length);n2.length; ) {
        const t3 = n2.shift();
        this.populatePositional(t3, e2, o2);
      }
      for (;r2.length; ) {
        const t3 = r2.shift();
        this.populatePositional(t3, e2, o2);
      }
      return e2._ = s2.commands.concat(e2._.map((t3) => "" + t3)), this.postProcessPositionals(e2, o2, this.cmdToParseOptions(t2.original), i2), o2;
    }
    populatePositional(t2, e2, s2) {
      const i2 = t2.cmd[0];
      t2.variadic ? s2[i2] = e2._.splice(0).map(String) : e2._.length && (s2[i2] = [String(e2._.shift())]);
    }
    cmdToParseOptions(t2) {
      const e2 = { array: [], default: {}, alias: {}, demand: {} }, s2 = o(t2);
      return s2.demanded.forEach((t3) => {
        const [s3, ...i2] = t3.cmd;
        t3.variadic && (e2.array.push(s3), e2.default[s3] = []), e2.alias[s3] = i2, e2.demand[s3] = true;
      }), s2.optional.forEach((t3) => {
        const [s3, ...i2] = t3.cmd;
        t3.variadic && (e2.array.push(s3), e2.default[s3] = []), e2.alias[s3] = i2;
      }), e2;
    }
    postProcessPositionals(t2, e2, s2, i2) {
      const n2 = Object.assign({}, i2.getOptions());
      n2.default = Object.assign(s2.default, n2.default);
      for (const t3 of Object.keys(s2.alias))
        n2.alias[t3] = (n2.alias[t3] || []).concat(s2.alias[t3]);
      n2.array = n2.array.concat(s2.array), n2.config = {};
      const r2 = [];
      if (Object.keys(e2).forEach((t3) => {
        e2[t3].map((e3) => {
          n2.configuration["unknown-options-as-args"] && (n2.key[t3] = true), r2.push(`--${t3}`), r2.push(e3);
        });
      }), !r2.length)
        return;
      const o2 = Object.assign({}, n2.configuration, { "populate--": false }), a2 = this.shim.Parser.detailed(r2, Object.assign({}, n2, { configuration: o2 }));
      if (a2.error)
        i2.getInternalMethods().getUsageInstance().fail(a2.error.message, a2.error);
      else {
        const s3 = Object.keys(e2);
        Object.keys(e2).forEach((t3) => {
          s3.push(...a2.aliases[t3]);
        }), Object.keys(a2.argv).forEach((n3) => {
          s3.includes(n3) && (e2[n3] || (e2[n3] = a2.argv[n3]), !this.isInConfigs(i2, n3) && !this.isDefaulted(i2, n3) && Object.prototype.hasOwnProperty.call(t2, n3) && Object.prototype.hasOwnProperty.call(a2.argv, n3) && (Array.isArray(t2[n3]) || Array.isArray(a2.argv[n3])) ? t2[n3] = [].concat(t2[n3], a2.argv[n3]) : t2[n3] = a2.argv[n3]);
        });
      }
    }
    isDefaulted(t2, e2) {
      const { default: s2 } = t2.getOptions();
      return Object.prototype.hasOwnProperty.call(s2, e2) || Object.prototype.hasOwnProperty.call(s2, this.shim.Parser.camelCase(e2));
    }
    isInConfigs(t2, e2) {
      const { configObjects: s2 } = t2.getOptions();
      return s2.some((t3) => Object.prototype.hasOwnProperty.call(t3, e2)) || s2.some((t3) => Object.prototype.hasOwnProperty.call(t3, this.shim.Parser.camelCase(e2)));
    }
    runDefaultBuilderOn(t2) {
      if (!this.defaultCommand)
        return;
      if (this.shouldUpdateUsage(t2)) {
        const e3 = M.test(this.defaultCommand.original) ? this.defaultCommand.original : this.defaultCommand.original.replace(/^[^[\]<>]*/, "$0 ");
        t2.getInternalMethods().getUsageInstance().usage(e3, this.defaultCommand.description);
      }
      const e2 = this.defaultCommand.builder;
      if (x(e2))
        return e2(t2, true);
      k(e2) || Object.keys(e2).forEach((s2) => {
        t2.option(s2, e2[s2]);
      });
    }
    moduleName(t2) {
      const e2 = function(t3) {
        if (false)
          ;
        for (let e3, s2 = 0, i2 = Object.keys(__require.cache);s2 < i2.length; s2++)
          if (e3 = __require.cache[i2[s2]], e3.exports === t3)
            return e3;
        return null;
      }(t2);
      if (!e2)
        throw new Error(`No command name given for module: ${this.shim.inspect(t2)}`);
      return this.commandFromFilename(e2.filename);
    }
    commandFromFilename(t2) {
      return this.shim.path.basename(t2, this.shim.path.extname(t2));
    }
    extractDesc({ describe: t2, description: e2, desc: s2 }) {
      for (const i2 of [t2, e2, s2]) {
        if (typeof i2 == "string" || i2 === false)
          return i2;
        d(i2, true, this.shim);
      }
      return false;
    }
    freeze() {
      this.frozens.push({ handlers: this.handlers, aliasMap: this.aliasMap, defaultCommand: this.defaultCommand });
    }
    unfreeze() {
      const t2 = this.frozens.pop();
      d(t2, undefined, this.shim), { handlers: this.handlers, aliasMap: this.aliasMap, defaultCommand: this.defaultCommand } = t2;
    }
    reset() {
      return this.handlers = {}, this.aliasMap = {}, this.defaultCommand = undefined, this.requireCache = new Set, this;
    }
  }
  function k(t2) {
    return typeof t2 == "object" && !!t2.builder && typeof t2.handler == "function";
  }
  function x(t2) {
    return typeof t2 == "function";
  }
  function E(t2) {
    typeof process != "undefined" && [process.stdout, process.stderr].forEach((e2) => {
      const s2 = e2;
      s2._handle && s2.isTTY && typeof s2._handle.setBlocking == "function" && s2._handle.setBlocking(t2);
    });
  }
  function A(t2) {
    return typeof t2 == "boolean";
  }
  function P(t2, s2) {
    const i2 = s2.y18n.__, n2 = {}, r2 = [];
    n2.failFn = function(t3) {
      r2.push(t3);
    };
    let o2 = null, a2 = null, h2 = true;
    n2.showHelpOnFail = function(e2 = true, s3) {
      const [i3, r3] = typeof e2 == "string" ? [true, e2] : [e2, s3];
      return t2.getInternalMethods().isGlobalContext() && (a2 = r3), o2 = r3, h2 = i3, n2;
    };
    let l2 = false;
    n2.fail = function(s3, i3) {
      const c3 = t2.getInternalMethods().getLoggerInstance();
      if (!r2.length) {
        if (t2.getExitProcess() && E(true), !l2) {
          l2 = true, h2 && (t2.showHelp("error"), c3.error()), (s3 || i3) && c3.error(s3 || i3);
          const e2 = o2 || a2;
          e2 && ((s3 || i3) && c3.error(""), c3.error(e2));
        }
        if (i3 = i3 || new e(s3), t2.getExitProcess())
          return t2.exit(1);
        if (t2.getInternalMethods().hasParseCallback())
          return t2.exit(1, i3);
        throw i3;
      }
      for (let t3 = r2.length - 1;t3 >= 0; --t3) {
        const e2 = r2[t3];
        if (A(e2)) {
          if (i3)
            throw i3;
          if (s3)
            throw Error(s3);
        } else
          e2(s3, i3, n2);
      }
    };
    let c2 = [], f2 = false;
    n2.usage = (t3, e2) => t3 === null ? (f2 = true, c2 = [], n2) : (f2 = false, c2.push([t3, e2 || ""]), n2), n2.getUsage = () => c2, n2.getUsageDisabled = () => f2, n2.getPositionalGroupName = () => i2("Positionals:");
    let d2 = [];
    n2.example = (t3, e2) => {
      d2.push([t3, e2 || ""]);
    };
    let u2 = [];
    n2.command = function(t3, e2, s3, i3, n3 = false) {
      s3 && (u2 = u2.map((t4) => (t4[2] = false, t4))), u2.push([t3, e2 || "", s3, i3, n3]);
    }, n2.getCommands = () => u2;
    let p2 = {};
    n2.describe = function(t3, e2) {
      Array.isArray(t3) ? t3.forEach((t4) => {
        n2.describe(t4, e2);
      }) : typeof t3 == "object" ? Object.keys(t3).forEach((e3) => {
        n2.describe(e3, t3[e3]);
      }) : p2[t3] = e2;
    }, n2.getDescriptions = () => p2;
    let m2 = [];
    n2.epilog = (t3) => {
      m2.push(t3);
    };
    let y2, b2 = false;
    n2.wrap = (t3) => {
      b2 = true, y2 = t3;
    }, n2.getWrap = () => s2.getEnv("YARGS_DISABLE_WRAP") ? null : (b2 || (y2 = function() {
      const t3 = 80;
      return s2.process.stdColumns ? Math.min(t3, s2.process.stdColumns) : t3;
    }(), b2 = true), y2);
    const v2 = "__yargsString__:";
    function O2(t3, e2, i3) {
      let n3 = 0;
      return Array.isArray(t3) || (t3 = Object.values(t3).map((t4) => [t4])), t3.forEach((t4) => {
        n3 = Math.max(s2.stringWidth(i3 ? `${i3} ${I(t4[0])}` : I(t4[0])) + $(t4[0]), n3);
      }), e2 && (n3 = Math.min(n3, parseInt((0.5 * e2).toString(), 10))), n3;
    }
    let w2;
    function C2(e2) {
      return t2.getOptions().hiddenOptions.indexOf(e2) < 0 || t2.parsed.argv[t2.getOptions().showHiddenOpt];
    }
    function j2(t3, e2) {
      let s3 = `[${i2("default:")} `;
      if (t3 === undefined && !e2)
        return null;
      if (e2)
        s3 += e2;
      else
        switch (typeof t3) {
          case "string":
            s3 += `"${t3}"`;
            break;
          case "object":
            s3 += JSON.stringify(t3);
            break;
          default:
            s3 += t3;
        }
      return `${s3}]`;
    }
    n2.deferY18nLookup = (t3) => v2 + t3, n2.help = function() {
      if (w2)
        return w2;
      (function() {
        const e3 = t2.getDemandedOptions(), s3 = t2.getOptions();
        (Object.keys(s3.alias) || []).forEach((i3) => {
          s3.alias[i3].forEach((r4) => {
            p2[r4] && n2.describe(i3, p2[r4]), r4 in e3 && t2.demandOption(i3, e3[r4]), s3.boolean.includes(r4) && t2.boolean(i3), s3.count.includes(r4) && t2.count(i3), s3.string.includes(r4) && t2.string(i3), s3.normalize.includes(r4) && t2.normalize(i3), s3.array.includes(r4) && t2.array(i3), s3.number.includes(r4) && t2.number(i3);
          });
        });
      })();
      const e2 = t2.customScriptName ? t2.$0 : s2.path.basename(t2.$0), r3 = t2.getDemandedOptions(), o3 = t2.getDemandedCommands(), a3 = t2.getDeprecatedOptions(), h3 = t2.getGroups(), l3 = t2.getOptions();
      let g2 = [];
      g2 = g2.concat(Object.keys(p2)), g2 = g2.concat(Object.keys(r3)), g2 = g2.concat(Object.keys(o3)), g2 = g2.concat(Object.keys(l3.default)), g2 = g2.filter(C2), g2 = Object.keys(g2.reduce((t3, e3) => (e3 !== "_" && (t3[e3] = true), t3), {}));
      const y3 = n2.getWrap(), b3 = s2.cliui({ width: y3, wrap: !!y3 });
      if (!f2) {
        if (c2.length)
          c2.forEach((t3) => {
            b3.div({ text: `${t3[0].replace(/\$0/g, e2)}` }), t3[1] && b3.div({ text: `${t3[1]}`, padding: [1, 0, 0, 0] });
          }), b3.div();
        else if (u2.length) {
          let t3 = null;
          t3 = o3._ ? `${e2} <${i2("command")}>
` : `${e2} [${i2("command")}]
`, b3.div(`${t3}`);
        }
      }
      if (u2.length > 1 || u2.length === 1 && !u2[0][2]) {
        b3.div(i2("Commands:"));
        const s3 = t2.getInternalMethods().getContext(), n3 = s3.commands.length ? `${s3.commands.join(" ")} ` : "";
        t2.getInternalMethods().getParserConfiguration()["sort-commands"] === true && (u2 = u2.sort((t3, e3) => t3[0].localeCompare(e3[0])));
        const r4 = e2 ? `${e2} ` : "";
        u2.forEach((t3) => {
          const s4 = `${r4}${n3}${t3[0].replace(/^\$0 ?/, "")}`;
          b3.span({ text: s4, padding: [0, 2, 0, 2], width: O2(u2, y3, `${e2}${n3}`) + 4 }, { text: t3[1] });
          const o4 = [];
          t3[2] && o4.push(`[${i2("default")}]`), t3[3] && t3[3].length && o4.push(`[${i2("aliases:")} ${t3[3].join(", ")}]`), t3[4] && (typeof t3[4] == "string" ? o4.push(`[${i2("deprecated: %s", t3[4])}]`) : o4.push(`[${i2("deprecated")}]`)), o4.length ? b3.div({ text: o4.join(" "), padding: [0, 0, 0, 2], align: "right" }) : b3.div();
        }), b3.div();
      }
      const M3 = (Object.keys(l3.alias) || []).concat(Object.keys(t2.parsed.newAliases) || []);
      g2 = g2.filter((e3) => !t2.parsed.newAliases[e3] && M3.every((t3) => (l3.alias[t3] || []).indexOf(e3) === -1));
      const _3 = i2("Options:");
      h3[_3] || (h3[_3] = []), function(t3, e3, s3, i3) {
        let n3 = [], r4 = null;
        Object.keys(s3).forEach((t4) => {
          n3 = n3.concat(s3[t4]);
        }), t3.forEach((t4) => {
          r4 = [t4].concat(e3[t4]), r4.some((t5) => n3.indexOf(t5) !== -1) || s3[i3].push(t4);
        });
      }(g2, l3.alias, h3, _3);
      const k2 = (t3) => /^--/.test(I(t3)), x2 = Object.keys(h3).filter((t3) => h3[t3].length > 0).map((t3) => ({ groupName: t3, normalizedKeys: h3[t3].filter(C2).map((t4) => {
        if (M3.includes(t4))
          return t4;
        for (let e3, s3 = 0;(e3 = M3[s3]) !== undefined; s3++)
          if ((l3.alias[e3] || []).includes(t4))
            return e3;
        return t4;
      }) })).filter(({ normalizedKeys: t3 }) => t3.length > 0).map(({ groupName: t3, normalizedKeys: e3 }) => {
        const s3 = e3.reduce((e4, s4) => (e4[s4] = [s4].concat(l3.alias[s4] || []).map((e5) => t3 === n2.getPositionalGroupName() ? e5 : (/^[0-9]$/.test(e5) ? l3.boolean.includes(s4) ? "-" : "--" : e5.length > 1 ? "--" : "-") + e5).sort((t4, e5) => k2(t4) === k2(e5) ? 0 : k2(t4) ? 1 : -1).join(", "), e4), {});
        return { groupName: t3, normalizedKeys: e3, switches: s3 };
      });
      if (x2.filter(({ groupName: t3 }) => t3 !== n2.getPositionalGroupName()).some(({ normalizedKeys: t3, switches: e3 }) => !t3.every((t4) => k2(e3[t4]))) && x2.filter(({ groupName: t3 }) => t3 !== n2.getPositionalGroupName()).forEach(({ normalizedKeys: t3, switches: e3 }) => {
        t3.forEach((t4) => {
          var s3, i3;
          k2(e3[t4]) && (e3[t4] = (s3 = e3[t4], i3 = 4, S(s3) ? { text: s3.text, indentation: s3.indentation + i3 } : { text: s3, indentation: i3 }));
        });
      }), x2.forEach(({ groupName: e3, normalizedKeys: s3, switches: o4 }) => {
        b3.div(e3), s3.forEach((e4) => {
          const s4 = o4[e4];
          let h4 = p2[e4] || "", c3 = null;
          h4.includes(v2) && (h4 = i2(h4.substring(16))), l3.boolean.includes(e4) && (c3 = `[${i2("boolean")}]`), l3.count.includes(e4) && (c3 = `[${i2("count")}]`), l3.string.includes(e4) && (c3 = `[${i2("string")}]`), l3.normalize.includes(e4) && (c3 = `[${i2("string")}]`), l3.array.includes(e4) && (c3 = `[${i2("array")}]`), l3.number.includes(e4) && (c3 = `[${i2("number")}]`);
          const f3 = [e4 in a3 ? (d3 = a3[e4], typeof d3 == "string" ? `[${i2("deprecated: %s", d3)}]` : `[${i2("deprecated")}]`) : null, c3, e4 in r3 ? `[${i2("required")}]` : null, l3.choices && l3.choices[e4] ? `[${i2("choices:")} ${n2.stringifiedValues(l3.choices[e4])}]` : null, j2(l3.default[e4], l3.defaultDescription[e4])].filter(Boolean).join(" ");
          var d3;
          b3.span({ text: I(s4), padding: [0, 2, 0, 2 + $(s4)], width: O2(o4, y3) + 4 }, h4);
          const u3 = t2.getInternalMethods().getUsageConfiguration()["hide-types"] === true;
          f3 && !u3 ? b3.div({ text: f3, padding: [0, 0, 0, 2], align: "right" }) : b3.div();
        }), b3.div();
      }), d2.length && (b3.div(i2("Examples:")), d2.forEach((t3) => {
        t3[0] = t3[0].replace(/\$0/g, e2);
      }), d2.forEach((t3) => {
        t3[1] === "" ? b3.div({ text: t3[0], padding: [0, 2, 0, 2] }) : b3.div({ text: t3[0], padding: [0, 2, 0, 2], width: O2(d2, y3) + 4 }, { text: t3[1] });
      }), b3.div()), m2.length > 0) {
        const t3 = m2.map((t4) => t4.replace(/\$0/g, e2)).join(`
`);
        b3.div(`${t3}
`);
      }
      return b3.toString().replace(/\s*$/, "");
    }, n2.cacheHelpMessage = function() {
      w2 = this.help();
    }, n2.clearCachedHelpMessage = function() {
      w2 = undefined;
    }, n2.hasCachedHelpMessage = function() {
      return !!w2;
    }, n2.showHelp = (e2) => {
      const s3 = t2.getInternalMethods().getLoggerInstance();
      e2 || (e2 = "error");
      (typeof e2 == "function" ? e2 : s3[e2])(n2.help());
    }, n2.functionDescription = (t3) => ["(", t3.name ? s2.Parser.decamelize(t3.name, "-") : i2("generated-value"), ")"].join(""), n2.stringifiedValues = function(t3, e2) {
      let s3 = "";
      const i3 = e2 || ", ", n3 = [].concat(t3);
      return t3 && n3.length ? (n3.forEach((t4) => {
        s3.length && (s3 += i3), s3 += JSON.stringify(t4);
      }), s3) : s3;
    };
    let M2 = null;
    n2.version = (t3) => {
      M2 = t3;
    }, n2.showVersion = (e2) => {
      const s3 = t2.getInternalMethods().getLoggerInstance();
      e2 || (e2 = "error");
      (typeof e2 == "function" ? e2 : s3[e2])(M2);
    }, n2.reset = function(t3) {
      return o2 = null, l2 = false, c2 = [], f2 = false, m2 = [], d2 = [], u2 = [], p2 = g(p2, (e2) => !t3[e2]), n2;
    };
    const _2 = [];
    return n2.freeze = function() {
      _2.push({ failMessage: o2, failureOutput: l2, usages: c2, usageDisabled: f2, epilogs: m2, examples: d2, commands: u2, descriptions: p2 });
    }, n2.unfreeze = function(t3 = false) {
      const e2 = _2.pop();
      e2 && (t3 ? (p2 = { ...e2.descriptions, ...p2 }, u2 = [...e2.commands, ...u2], c2 = [...e2.usages, ...c2], d2 = [...e2.examples, ...d2], m2 = [...e2.epilogs, ...m2]) : { failMessage: o2, failureOutput: l2, usages: c2, usageDisabled: f2, epilogs: m2, examples: d2, commands: u2, descriptions: p2 } = e2);
    }, n2;
  }
  function S(t2) {
    return typeof t2 == "object";
  }
  function $(t2) {
    return S(t2) ? t2.indentation : 0;
  }
  function I(t2) {
    return S(t2) ? t2.text : t2;
  }

  class D {
    constructor(t2, e2, s2, i2) {
      var n2, r2, o2;
      this.yargs = t2, this.usage = e2, this.command = s2, this.shim = i2, this.completionKey = "get-yargs-completions", this.aliases = null, this.customCompletionFunction = null, this.indexAfterLastReset = 0, this.zshShell = (o2 = ((n2 = this.shim.getEnv("SHELL")) === null || n2 === undefined ? undefined : n2.includes("zsh")) || ((r2 = this.shim.getEnv("ZSH_NAME")) === null || r2 === undefined ? undefined : r2.includes("zsh"))) !== null && o2 !== undefined && o2;
    }
    defaultCompletion(t2, e2, s2, i2) {
      const n2 = this.command.getCommandHandlers();
      for (let e3 = 0, s3 = t2.length;e3 < s3; ++e3)
        if (n2[t2[e3]] && n2[t2[e3]].builder) {
          const s4 = n2[t2[e3]].builder;
          if (x(s4)) {
            this.indexAfterLastReset = e3 + 1;
            const t3 = this.yargs.getInternalMethods().reset();
            return s4(t3, true), t3.argv;
          }
        }
      const r2 = [];
      this.commandCompletions(r2, t2, s2), this.optionCompletions(r2, t2, e2, s2), this.choicesFromOptionsCompletions(r2, t2, e2, s2), this.choicesFromPositionalsCompletions(r2, t2, e2, s2), i2(null, r2);
    }
    commandCompletions(t2, e2, s2) {
      const i2 = this.yargs.getInternalMethods().getContext().commands;
      s2.match(/^-/) || i2[i2.length - 1] === s2 || this.previousArgHasChoices(e2) || this.usage.getCommands().forEach((s3) => {
        const i3 = o(s3[0]).cmd;
        if (e2.indexOf(i3) === -1)
          if (this.zshShell) {
            const e3 = s3[1] || "";
            t2.push(i3.replace(/:/g, "\\:") + ":" + e3);
          } else
            t2.push(i3);
      });
    }
    optionCompletions(t2, e2, s2, i2) {
      if ((i2.match(/^-/) || i2 === "" && t2.length === 0) && !this.previousArgHasChoices(e2)) {
        const s3 = this.yargs.getOptions(), n2 = this.yargs.getGroups()[this.usage.getPositionalGroupName()] || [];
        Object.keys(s3.key).forEach((r2) => {
          const o2 = !!s3.configuration["boolean-negation"] && s3.boolean.includes(r2);
          n2.includes(r2) || s3.hiddenOptions.includes(r2) || this.argsContainKey(e2, r2, o2) || this.completeOptionKey(r2, t2, i2, o2 && !!s3.default[r2]);
        });
      }
    }
    choicesFromOptionsCompletions(t2, e2, s2, i2) {
      if (this.previousArgHasChoices(e2)) {
        const s3 = this.getPreviousArgChoices(e2);
        s3 && s3.length > 0 && t2.push(...s3.map((t3) => t3.replace(/:/g, "\\:")));
      }
    }
    choicesFromPositionalsCompletions(t2, e2, s2, i2) {
      if (i2 === "" && t2.length > 0 && this.previousArgHasChoices(e2))
        return;
      const n2 = this.yargs.getGroups()[this.usage.getPositionalGroupName()] || [], r2 = Math.max(this.indexAfterLastReset, this.yargs.getInternalMethods().getContext().commands.length + 1), o2 = n2[s2._.length - r2 - 1];
      if (!o2)
        return;
      const a2 = this.yargs.getOptions().choices[o2] || [];
      for (const e3 of a2)
        e3.startsWith(i2) && t2.push(e3.replace(/:/g, "\\:"));
    }
    getPreviousArgChoices(t2) {
      if (t2.length < 1)
        return;
      let e2 = t2[t2.length - 1], s2 = "";
      if (!e2.startsWith("-") && t2.length > 1 && (s2 = e2, e2 = t2[t2.length - 2]), !e2.startsWith("-"))
        return;
      const i2 = e2.replace(/^-+/, ""), n2 = this.yargs.getOptions(), r2 = [i2, ...this.yargs.getAliases()[i2] || []];
      let o2;
      for (const t3 of r2)
        if (Object.prototype.hasOwnProperty.call(n2.key, t3) && Array.isArray(n2.choices[t3])) {
          o2 = n2.choices[t3];
          break;
        }
      return o2 ? o2.filter((t3) => !s2 || t3.startsWith(s2)) : undefined;
    }
    previousArgHasChoices(t2) {
      const e2 = this.getPreviousArgChoices(t2);
      return e2 !== undefined && e2.length > 0;
    }
    argsContainKey(t2, e2, s2) {
      const i2 = (e3) => t2.indexOf((/^[^0-9]$/.test(e3) ? "-" : "--") + e3) !== -1;
      if (i2(e2))
        return true;
      if (s2 && i2(`no-${e2}`))
        return true;
      if (this.aliases) {
        for (const t3 of this.aliases[e2])
          if (i2(t3))
            return true;
      }
      return false;
    }
    completeOptionKey(t2, e2, s2, i2) {
      var n2, r2, o2, a2;
      let h2 = t2;
      if (this.zshShell) {
        const e3 = this.usage.getDescriptions(), s3 = (r2 = (n2 = this == null ? undefined : this.aliases) === null || n2 === undefined ? undefined : n2[t2]) === null || r2 === undefined ? undefined : r2.find((t3) => {
          const s4 = e3[t3];
          return typeof s4 == "string" && s4.length > 0;
        }), i3 = s3 ? e3[s3] : undefined, l3 = (a2 = (o2 = e3[t2]) !== null && o2 !== undefined ? o2 : i3) !== null && a2 !== undefined ? a2 : "";
        h2 = `${t2.replace(/:/g, "\\:")}:${l3.replace("__yargsString__:", "").replace(/(\r\n|\n|\r)/gm, " ")}`;
      }
      const l2 = !/^--/.test(s2) && ((t3) => /^[^0-9]$/.test(t3))(t2) ? "-" : "--";
      e2.push(l2 + h2), i2 && e2.push(l2 + "no-" + h2);
    }
    customCompletion(t2, e2, s2, i2) {
      if (d(this.customCompletionFunction, null, this.shim), this.customCompletionFunction.length < 3) {
        const t3 = this.customCompletionFunction(s2, e2);
        return f(t3) ? t3.then((t4) => {
          this.shim.process.nextTick(() => {
            i2(null, t4);
          });
        }).catch((t4) => {
          this.shim.process.nextTick(() => {
            i2(t4, undefined);
          });
        }) : i2(null, t3);
      }
      return function(t3) {
        return t3.length > 3;
      }(this.customCompletionFunction) ? this.customCompletionFunction(s2, e2, (n2 = i2) => this.defaultCompletion(t2, e2, s2, n2), (t3) => {
        i2(null, t3);
      }) : this.customCompletionFunction(s2, e2, (t3) => {
        i2(null, t3);
      });
    }
    getCompletion(t2, e2) {
      const s2 = t2.length ? t2[t2.length - 1] : "", i2 = this.yargs.parse(t2, true), n2 = this.customCompletionFunction ? (i3) => this.customCompletion(t2, i3, s2, e2) : (i3) => this.defaultCompletion(t2, i3, s2, e2);
      return f(i2) ? i2.then(n2) : n2(i2);
    }
    generateCompletionScript(t2, e2) {
      let s2 = this.zshShell ? `#compdef {{app_name}}
###-begin-{{app_name}}-completions-###
#
# yargs command completion script
#
# Installation: {{app_path}} {{completion_command}} >> ~/.zshrc
#    or {{app_path}} {{completion_command}} >> ~/.zprofile on OSX.
#
_{{app_name}}_yargs_completions()
{
  local reply
  local si=$IFS
  IFS=$'
' reply=($(COMP_CWORD="$((CURRENT-1))" COMP_LINE="$BUFFER" COMP_POINT="$CURSOR" {{app_path}} --get-yargs-completions "\${words[@]}"))
  IFS=$si
  _describe 'values' reply
}
compdef _{{app_name}}_yargs_completions {{app_name}}
###-end-{{app_name}}-completions-###
` : `###-begin-{{app_name}}-completions-###
#
# yargs command completion script
#
# Installation: {{app_path}} {{completion_command}} >> ~/.bashrc
#    or {{app_path}} {{completion_command}} >> ~/.bash_profile on OSX.
#
_{{app_name}}_yargs_completions()
{
    local cur_word args type_list

    cur_word="\${COMP_WORDS[COMP_CWORD]}"
    args=("\${COMP_WORDS[@]}")

    # ask yargs to generate completions.
    type_list=$({{app_path}} --get-yargs-completions "\${args[@]}")

    COMPREPLY=( $(compgen -W "\${type_list}" -- \${cur_word}) )

    # if no match was found, fall back to filename completion
    if [ \${#COMPREPLY[@]} -eq 0 ]; then
      COMPREPLY=()
    fi

    return 0
}
complete -o bashdefault -o default -F _{{app_name}}_yargs_completions {{app_name}}
###-end-{{app_name}}-completions-###
`;
      const i2 = this.shim.path.basename(t2);
      return t2.match(/\.js$/) && (t2 = `./${t2}`), s2 = s2.replace(/{{app_name}}/g, i2), s2 = s2.replace(/{{completion_command}}/g, e2), s2.replace(/{{app_path}}/g, t2);
    }
    registerFunction(t2) {
      this.customCompletionFunction = t2;
    }
    setParsed(t2) {
      this.aliases = t2.aliases;
    }
  }
  function N(t2, e2) {
    if (t2.length === 0)
      return e2.length;
    if (e2.length === 0)
      return t2.length;
    const s2 = [];
    let i2, n2;
    for (i2 = 0;i2 <= e2.length; i2++)
      s2[i2] = [i2];
    for (n2 = 0;n2 <= t2.length; n2++)
      s2[0][n2] = n2;
    for (i2 = 1;i2 <= e2.length; i2++)
      for (n2 = 1;n2 <= t2.length; n2++)
        e2.charAt(i2 - 1) === t2.charAt(n2 - 1) ? s2[i2][n2] = s2[i2 - 1][n2 - 1] : i2 > 1 && n2 > 1 && e2.charAt(i2 - 2) === t2.charAt(n2 - 1) && e2.charAt(i2 - 1) === t2.charAt(n2 - 2) ? s2[i2][n2] = s2[i2 - 2][n2 - 2] + 1 : s2[i2][n2] = Math.min(s2[i2 - 1][n2 - 1] + 1, Math.min(s2[i2][n2 - 1] + 1, s2[i2 - 1][n2] + 1));
    return s2[e2.length][t2.length];
  }
  var H = ["$0", "--", "_"];
  var z2;
  var W;
  var q;
  var U;
  var F;
  var L;
  var V;
  var G;
  var R;
  var T;
  var B;
  var Y;
  var K;
  var J;
  var Z;
  var X;
  var Q;
  var tt;
  var et;
  var st;
  var it;
  var nt;
  var rt;
  var ot;
  var at;
  var ht;
  var lt;
  var ct;
  var ft;
  var dt;
  var ut;
  var pt;
  var gt;
  var mt;
  var yt;
  var bt = Symbol("copyDoubleDash");
  var vt = Symbol("copyDoubleDash");
  var Ot = Symbol("deleteFromParserHintObject");
  var wt = Symbol("emitWarning");
  var Ct = Symbol("freeze");
  var jt = Symbol("getDollarZero");
  var Mt = Symbol("getParserConfiguration");
  var _t = Symbol("getUsageConfiguration");
  var kt = Symbol("guessLocale");
  var xt = Symbol("guessVersion");
  var Et = Symbol("parsePositionalNumbers");
  var At = Symbol("pkgUp");
  var Pt = Symbol("populateParserHintArray");
  var St = Symbol("populateParserHintSingleValueDictionary");
  var $t = Symbol("populateParserHintArrayDictionary");
  var It = Symbol("populateParserHintDictionary");
  var Dt = Symbol("sanitizeKey");
  var Nt = Symbol("setKey");
  var Ht = Symbol("unfreeze");
  var zt = Symbol("validateAsync");
  var Wt = Symbol("getCommandInstance");
  var qt = Symbol("getContext");
  var Ut = Symbol("getHasOutput");
  var Ft = Symbol("getLoggerInstance");
  var Lt = Symbol("getParseContext");
  var Vt = Symbol("getUsageInstance");
  var Gt = Symbol("getValidationInstance");
  var Rt = Symbol("hasParseCallback");
  var Tt = Symbol("isGlobalContext");
  var Bt = Symbol("postProcess");
  var Yt = Symbol("rebase");
  var Kt = Symbol("reset");
  var Jt = Symbol("runYargsParserAndExecuteCommands");
  var Zt = Symbol("runValidation");
  var Xt = Symbol("setHasOutput");
  var Qt = Symbol("kTrackManuallySetKeys");

  class te {
    constructor(t2 = [], e2, s2, i2) {
      this.customScriptName = false, this.parsed = false, z2.set(this, undefined), W.set(this, undefined), q.set(this, { commands: [], fullCommands: [] }), U.set(this, null), F.set(this, null), L.set(this, "show-hidden"), V.set(this, null), G.set(this, true), R.set(this, {}), T.set(this, true), B.set(this, []), Y.set(this, undefined), K.set(this, {}), J.set(this, false), Z.set(this, null), X.set(this, true), Q.set(this, undefined), tt.set(this, ""), et.set(this, undefined), st.set(this, undefined), it.set(this, {}), nt.set(this, null), rt.set(this, null), ot.set(this, {}), at.set(this, {}), ht.set(this, undefined), lt.set(this, false), ct.set(this, undefined), ft.set(this, false), dt.set(this, false), ut.set(this, false), pt.set(this, undefined), gt.set(this, {}), mt.set(this, null), yt.set(this, undefined), O(this, ct, i2, "f"), O(this, ht, t2, "f"), O(this, W, e2, "f"), O(this, st, s2, "f"), O(this, Y, new w(this), "f"), this.$0 = this[jt](), this[Kt](), O(this, z2, v(this, z2, "f"), "f"), O(this, pt, v(this, pt, "f"), "f"), O(this, yt, v(this, yt, "f"), "f"), O(this, et, v(this, et, "f"), "f"), v(this, et, "f").showHiddenOpt = v(this, L, "f"), O(this, Q, this[vt](), "f");
    }
    addHelpOpt(t2, e2) {
      return h("[string|boolean] [string]", [t2, e2], arguments.length), v(this, Z, "f") && (this[Ot](v(this, Z, "f")), O(this, Z, null, "f")), t2 === false && e2 === undefined || (O(this, Z, typeof t2 == "string" ? t2 : "help", "f"), this.boolean(v(this, Z, "f")), this.describe(v(this, Z, "f"), e2 || v(this, pt, "f").deferY18nLookup("Show help"))), this;
    }
    help(t2, e2) {
      return this.addHelpOpt(t2, e2);
    }
    addShowHiddenOpt(t2, e2) {
      if (h("[string|boolean] [string]", [t2, e2], arguments.length), t2 === false && e2 === undefined)
        return this;
      const s2 = typeof t2 == "string" ? t2 : v(this, L, "f");
      return this.boolean(s2), this.describe(s2, e2 || v(this, pt, "f").deferY18nLookup("Show hidden options")), v(this, et, "f").showHiddenOpt = s2, this;
    }
    showHidden(t2, e2) {
      return this.addShowHiddenOpt(t2, e2);
    }
    alias(t2, e2) {
      return h("<object|string|array> [string|array]", [t2, e2], arguments.length), this[$t](this.alias.bind(this), "alias", t2, e2), this;
    }
    array(t2) {
      return h("<array|string>", [t2], arguments.length), this[Pt]("array", t2), this[Qt](t2), this;
    }
    boolean(t2) {
      return h("<array|string>", [t2], arguments.length), this[Pt]("boolean", t2), this[Qt](t2), this;
    }
    check(t2, e2) {
      return h("<function> [boolean]", [t2, e2], arguments.length), this.middleware((e3, s2) => j(() => t2(e3, s2.getOptions()), (s3) => (s3 ? (typeof s3 == "string" || s3 instanceof Error) && v(this, pt, "f").fail(s3.toString(), s3) : v(this, pt, "f").fail(v(this, ct, "f").y18n.__("Argument check failed: %s", t2.toString())), e3), (t3) => (v(this, pt, "f").fail(t3.message ? t3.message : t3.toString(), t3), e3)), false, e2), this;
    }
    choices(t2, e2) {
      return h("<object|string|array> [string|array]", [t2, e2], arguments.length), this[$t](this.choices.bind(this), "choices", t2, e2), this;
    }
    coerce(t2, s2) {
      if (h("<object|string|array> [function]", [t2, s2], arguments.length), Array.isArray(t2)) {
        if (!s2)
          throw new e("coerce callback must be provided");
        for (const e2 of t2)
          this.coerce(e2, s2);
        return this;
      }
      if (typeof t2 == "object") {
        for (const e2 of Object.keys(t2))
          this.coerce(e2, t2[e2]);
        return this;
      }
      if (!s2)
        throw new e("coerce callback must be provided");
      return v(this, et, "f").key[t2] = true, v(this, Y, "f").addCoerceMiddleware((i2, n2) => {
        let r2;
        return Object.prototype.hasOwnProperty.call(i2, t2) ? j(() => (r2 = n2.getAliases(), s2(i2[t2])), (e2) => {
          i2[t2] = e2;
          const s3 = n2.getInternalMethods().getParserConfiguration()["strip-aliased"];
          if (r2[t2] && s3 !== true)
            for (const s4 of r2[t2])
              i2[s4] = e2;
          return i2;
        }, (t3) => {
          throw new e(t3.message);
        }) : i2;
      }, t2), this;
    }
    conflicts(t2, e2) {
      return h("<string|object> [string|array]", [t2, e2], arguments.length), v(this, yt, "f").conflicts(t2, e2), this;
    }
    config(t2 = "config", e2, s2) {
      return h("[object|string] [string|function] [function]", [t2, e2, s2], arguments.length), typeof t2 != "object" || Array.isArray(t2) ? (typeof e2 == "function" && (s2 = e2, e2 = undefined), this.describe(t2, e2 || v(this, pt, "f").deferY18nLookup("Path to JSON config file")), (Array.isArray(t2) ? t2 : [t2]).forEach((t3) => {
        v(this, et, "f").config[t3] = s2 || true;
      }), this) : (t2 = n(t2, v(this, W, "f"), this[Mt]()["deep-merge-config"] || false, v(this, ct, "f")), v(this, et, "f").configObjects = (v(this, et, "f").configObjects || []).concat(t2), this);
    }
    completion(t2, e2, s2) {
      return h("[string] [string|boolean|function] [function]", [t2, e2, s2], arguments.length), typeof e2 == "function" && (s2 = e2, e2 = undefined), O(this, F, t2 || v(this, F, "f") || "completion", "f"), e2 || e2 === false || (e2 = "generate completion script"), this.command(v(this, F, "f"), e2), s2 && v(this, U, "f").registerFunction(s2), this;
    }
    command(t2, e2, s2, i2, n2, r2) {
      return h("<string|array|object> [string|boolean] [function|object] [function] [array] [boolean|string]", [t2, e2, s2, i2, n2, r2], arguments.length), v(this, z2, "f").addHandler(t2, e2, s2, i2, n2, r2), this;
    }
    commands(t2, e2, s2, i2, n2, r2) {
      return this.command(t2, e2, s2, i2, n2, r2);
    }
    commandDir(t2, e2) {
      h("<string> [object]", [t2, e2], arguments.length);
      const s2 = v(this, st, "f") || v(this, ct, "f").require;
      return v(this, z2, "f").addDirectory(t2, s2, v(this, ct, "f").getCallerFile(), e2), this;
    }
    count(t2) {
      return h("<array|string>", [t2], arguments.length), this[Pt]("count", t2), this[Qt](t2), this;
    }
    default(t2, e2, s2) {
      return h("<object|string|array> [*] [string]", [t2, e2, s2], arguments.length), s2 && (u(t2, v(this, ct, "f")), v(this, et, "f").defaultDescription[t2] = s2), typeof e2 == "function" && (u(t2, v(this, ct, "f")), v(this, et, "f").defaultDescription[t2] || (v(this, et, "f").defaultDescription[t2] = v(this, pt, "f").functionDescription(e2)), e2 = e2.call()), this[St](this.default.bind(this), "default", t2, e2), this;
    }
    defaults(t2, e2, s2) {
      return this.default(t2, e2, s2);
    }
    demandCommand(t2 = 1, e2, s2, i2) {
      return h("[number] [number|string] [string|null|undefined] [string|null|undefined]", [t2, e2, s2, i2], arguments.length), typeof e2 != "number" && (s2 = e2, e2 = 1 / 0), this.global("_", false), v(this, et, "f").demandedCommands._ = { min: t2, max: e2, minMsg: s2, maxMsg: i2 }, this;
    }
    demand(t2, e2, s2) {
      return Array.isArray(e2) ? (e2.forEach((t3) => {
        d(s2, true, v(this, ct, "f")), this.demandOption(t3, s2);
      }), e2 = 1 / 0) : typeof e2 != "number" && (s2 = e2, e2 = 1 / 0), typeof t2 == "number" ? (d(s2, true, v(this, ct, "f")), this.demandCommand(t2, e2, s2, s2)) : Array.isArray(t2) ? t2.forEach((t3) => {
        d(s2, true, v(this, ct, "f")), this.demandOption(t3, s2);
      }) : typeof s2 == "string" ? this.demandOption(t2, s2) : s2 !== true && s2 !== undefined || this.demandOption(t2), this;
    }
    demandOption(t2, e2) {
      return h("<object|string|array> [string]", [t2, e2], arguments.length), this[St](this.demandOption.bind(this), "demandedOptions", t2, e2), this;
    }
    deprecateOption(t2, e2) {
      return h("<string> [string|boolean]", [t2, e2], arguments.length), v(this, et, "f").deprecatedOptions[t2] = e2, this;
    }
    describe(t2, e2) {
      return h("<object|string|array> [string]", [t2, e2], arguments.length), this[Nt](t2, true), v(this, pt, "f").describe(t2, e2), this;
    }
    detectLocale(t2) {
      return h("<boolean>", [t2], arguments.length), O(this, G, t2, "f"), this;
    }
    env(t2) {
      return h("[string|boolean]", [t2], arguments.length), t2 === false ? delete v(this, et, "f").envPrefix : v(this, et, "f").envPrefix = t2 || "", this;
    }
    epilogue(t2) {
      return h("<string>", [t2], arguments.length), v(this, pt, "f").epilog(t2), this;
    }
    epilog(t2) {
      return this.epilogue(t2);
    }
    example(t2, e2) {
      return h("<string|array> [string]", [t2, e2], arguments.length), Array.isArray(t2) ? t2.forEach((t3) => this.example(...t3)) : v(this, pt, "f").example(t2, e2), this;
    }
    exit(t2, e2) {
      O(this, J, true, "f"), O(this, V, e2, "f"), v(this, T, "f") && v(this, ct, "f").process.exit(t2);
    }
    exitProcess(t2 = true) {
      return h("[boolean]", [t2], arguments.length), O(this, T, t2, "f"), this;
    }
    fail(t2) {
      if (h("<function|boolean>", [t2], arguments.length), typeof t2 == "boolean" && t2 !== false)
        throw new e("Invalid first argument. Expected function or boolean 'false'");
      return v(this, pt, "f").failFn(t2), this;
    }
    getAliases() {
      return this.parsed ? this.parsed.aliases : {};
    }
    async getCompletion(t2, e2) {
      return h("<array> [function]", [t2, e2], arguments.length), e2 ? v(this, U, "f").getCompletion(t2, e2) : new Promise((e3, s2) => {
        v(this, U, "f").getCompletion(t2, (t3, i2) => {
          t3 ? s2(t3) : e3(i2);
        });
      });
    }
    getDemandedOptions() {
      return h([], 0), v(this, et, "f").demandedOptions;
    }
    getDemandedCommands() {
      return h([], 0), v(this, et, "f").demandedCommands;
    }
    getDeprecatedOptions() {
      return h([], 0), v(this, et, "f").deprecatedOptions;
    }
    getDetectLocale() {
      return v(this, G, "f");
    }
    getExitProcess() {
      return v(this, T, "f");
    }
    getGroups() {
      return Object.assign({}, v(this, K, "f"), v(this, at, "f"));
    }
    getHelp() {
      if (O(this, J, true, "f"), !v(this, pt, "f").hasCachedHelpMessage()) {
        if (!this.parsed) {
          const t3 = this[Jt](v(this, ht, "f"), undefined, undefined, 0, true);
          if (f(t3))
            return t3.then(() => v(this, pt, "f").help());
        }
        const t2 = v(this, z2, "f").runDefaultBuilderOn(this);
        if (f(t2))
          return t2.then(() => v(this, pt, "f").help());
      }
      return Promise.resolve(v(this, pt, "f").help());
    }
    getOptions() {
      return v(this, et, "f");
    }
    getStrict() {
      return v(this, ft, "f");
    }
    getStrictCommands() {
      return v(this, dt, "f");
    }
    getStrictOptions() {
      return v(this, ut, "f");
    }
    global(t2, e2) {
      return h("<string|array> [boolean]", [t2, e2], arguments.length), t2 = [].concat(t2), e2 !== false ? v(this, et, "f").local = v(this, et, "f").local.filter((e3) => t2.indexOf(e3) === -1) : t2.forEach((t3) => {
        v(this, et, "f").local.includes(t3) || v(this, et, "f").local.push(t3);
      }), this;
    }
    group(t2, e2) {
      h("<string|array> <string>", [t2, e2], arguments.length);
      const s2 = v(this, at, "f")[e2] || v(this, K, "f")[e2];
      v(this, at, "f")[e2] && delete v(this, at, "f")[e2];
      const i2 = {};
      return v(this, K, "f")[e2] = (s2 || []).concat(t2).filter((t3) => !i2[t3] && (i2[t3] = true)), this;
    }
    hide(t2) {
      return h("<string>", [t2], arguments.length), v(this, et, "f").hiddenOptions.push(t2), this;
    }
    implies(t2, e2) {
      return h("<string|object> [number|string|array]", [t2, e2], arguments.length), v(this, yt, "f").implies(t2, e2), this;
    }
    locale(t2) {
      return h("[string]", [t2], arguments.length), t2 === undefined ? (this[kt](), v(this, ct, "f").y18n.getLocale()) : (O(this, G, false, "f"), v(this, ct, "f").y18n.setLocale(t2), this);
    }
    middleware(t2, e2, s2) {
      return v(this, Y, "f").addMiddleware(t2, !!e2, s2);
    }
    nargs(t2, e2) {
      return h("<string|object|array> [number]", [t2, e2], arguments.length), this[St](this.nargs.bind(this), "narg", t2, e2), this;
    }
    normalize(t2) {
      return h("<array|string>", [t2], arguments.length), this[Pt]("normalize", t2), this;
    }
    number(t2) {
      return h("<array|string>", [t2], arguments.length), this[Pt]("number", t2), this[Qt](t2), this;
    }
    option(t2, e2) {
      if (h("<string|object> [object]", [t2, e2], arguments.length), typeof t2 == "object")
        Object.keys(t2).forEach((e3) => {
          this.options(e3, t2[e3]);
        });
      else {
        typeof e2 != "object" && (e2 = {}), this[Qt](t2), !v(this, mt, "f") || t2 !== "version" && (e2 == null ? undefined : e2.alias) !== "version" || this[wt](['"version" is a reserved word.', "Please do one of the following:", '- Disable version with `yargs.version(false)` if using "version" as an option', "- Use the built-in `yargs.version` method instead (if applicable)", "- Use a different option key", "https://yargs.js.org/docs/#api-reference-version"].join(`
`), undefined, "versionWarning"), v(this, et, "f").key[t2] = true, e2.alias && this.alias(t2, e2.alias);
        const s2 = e2.deprecate || e2.deprecated;
        s2 && this.deprecateOption(t2, s2);
        const i2 = e2.demand || e2.required || e2.require;
        i2 && this.demand(t2, i2), e2.demandOption && this.demandOption(t2, typeof e2.demandOption == "string" ? e2.demandOption : undefined), e2.conflicts && this.conflicts(t2, e2.conflicts), "default" in e2 && this.default(t2, e2.default), e2.implies !== undefined && this.implies(t2, e2.implies), e2.nargs !== undefined && this.nargs(t2, e2.nargs), e2.config && this.config(t2, e2.configParser), e2.normalize && this.normalize(t2), e2.choices && this.choices(t2, e2.choices), e2.coerce && this.coerce(t2, e2.coerce), e2.group && this.group(t2, e2.group), (e2.boolean || e2.type === "boolean") && (this.boolean(t2), e2.alias && this.boolean(e2.alias)), (e2.array || e2.type === "array") && (this.array(t2), e2.alias && this.array(e2.alias)), (e2.number || e2.type === "number") && (this.number(t2), e2.alias && this.number(e2.alias)), (e2.string || e2.type === "string") && (this.string(t2), e2.alias && this.string(e2.alias)), (e2.count || e2.type === "count") && this.count(t2), typeof e2.global == "boolean" && this.global(t2, e2.global), e2.defaultDescription && (v(this, et, "f").defaultDescription[t2] = e2.defaultDescription), e2.skipValidation && this.skipValidation(t2);
        const n2 = e2.describe || e2.description || e2.desc, r2 = v(this, pt, "f").getDescriptions();
        Object.prototype.hasOwnProperty.call(r2, t2) && typeof n2 != "string" || this.describe(t2, n2), e2.hidden && this.hide(t2), e2.requiresArg && this.requiresArg(t2);
      }
      return this;
    }
    options(t2, e2) {
      return this.option(t2, e2);
    }
    parse(t2, e2, s2) {
      h("[string|array] [function|boolean|object] [function]", [t2, e2, s2], arguments.length), this[Ct](), t2 === undefined && (t2 = v(this, ht, "f")), typeof e2 == "object" && (O(this, rt, e2, "f"), e2 = s2), typeof e2 == "function" && (O(this, nt, e2, "f"), e2 = false), e2 || O(this, ht, t2, "f"), v(this, nt, "f") && O(this, T, false, "f");
      const i2 = this[Jt](t2, !!e2), n2 = this.parsed;
      return v(this, U, "f").setParsed(this.parsed), f(i2) ? i2.then((t3) => (v(this, nt, "f") && v(this, nt, "f").call(this, v(this, V, "f"), t3, v(this, tt, "f")), t3)).catch((t3) => {
        throw v(this, nt, "f") && v(this, nt, "f")(t3, this.parsed.argv, v(this, tt, "f")), t3;
      }).finally(() => {
        this[Ht](), this.parsed = n2;
      }) : (v(this, nt, "f") && v(this, nt, "f").call(this, v(this, V, "f"), i2, v(this, tt, "f")), this[Ht](), this.parsed = n2, i2);
    }
    parseAsync(t2, e2, s2) {
      const i2 = this.parse(t2, e2, s2);
      return f(i2) ? i2 : Promise.resolve(i2);
    }
    parseSync(t2, s2, i2) {
      const n2 = this.parse(t2, s2, i2);
      if (f(n2))
        throw new e(".parseSync() must not be used with asynchronous builders, handlers, or middleware");
      return n2;
    }
    parserConfiguration(t2) {
      return h("<object>", [t2], arguments.length), O(this, it, t2, "f"), this;
    }
    pkgConf(t2, e2) {
      h("<string> [string]", [t2, e2], arguments.length);
      let s2 = null;
      const i2 = this[At](e2 || v(this, W, "f"));
      return i2[t2] && typeof i2[t2] == "object" && (s2 = n(i2[t2], e2 || v(this, W, "f"), this[Mt]()["deep-merge-config"] || false, v(this, ct, "f")), v(this, et, "f").configObjects = (v(this, et, "f").configObjects || []).concat(s2)), this;
    }
    positional(t2, e2) {
      h("<string> <object>", [t2, e2], arguments.length);
      const s2 = ["default", "defaultDescription", "implies", "normalize", "choices", "conflicts", "coerce", "type", "describe", "desc", "description", "alias"];
      e2 = g(e2, (t3, e3) => !(t3 === "type" && !["string", "number", "boolean"].includes(e3)) && s2.includes(t3));
      const i2 = v(this, q, "f").fullCommands[v(this, q, "f").fullCommands.length - 1], n2 = i2 ? v(this, z2, "f").cmdToParseOptions(i2) : { array: [], alias: {}, default: {}, demand: {} };
      return p(n2).forEach((s3) => {
        const i3 = n2[s3];
        Array.isArray(i3) ? i3.indexOf(t2) !== -1 && (e2[s3] = true) : i3[t2] && !(s3 in e2) && (e2[s3] = i3[t2]);
      }), this.group(t2, v(this, pt, "f").getPositionalGroupName()), this.option(t2, e2);
    }
    recommendCommands(t2 = true) {
      return h("[boolean]", [t2], arguments.length), O(this, lt, t2, "f"), this;
    }
    required(t2, e2, s2) {
      return this.demand(t2, e2, s2);
    }
    require(t2, e2, s2) {
      return this.demand(t2, e2, s2);
    }
    requiresArg(t2) {
      return h("<array|string|object> [number]", [t2], arguments.length), typeof t2 == "string" && v(this, et, "f").narg[t2] || this[St](this.requiresArg.bind(this), "narg", t2, NaN), this;
    }
    showCompletionScript(t2, e2) {
      return h("[string] [string]", [t2, e2], arguments.length), t2 = t2 || this.$0, v(this, Q, "f").log(v(this, U, "f").generateCompletionScript(t2, e2 || v(this, F, "f") || "completion")), this;
    }
    showHelp(t2) {
      if (h("[string|function]", [t2], arguments.length), O(this, J, true, "f"), !v(this, pt, "f").hasCachedHelpMessage()) {
        if (!this.parsed) {
          const e3 = this[Jt](v(this, ht, "f"), undefined, undefined, 0, true);
          if (f(e3))
            return e3.then(() => {
              v(this, pt, "f").showHelp(t2);
            }), this;
        }
        const e2 = v(this, z2, "f").runDefaultBuilderOn(this);
        if (f(e2))
          return e2.then(() => {
            v(this, pt, "f").showHelp(t2);
          }), this;
      }
      return v(this, pt, "f").showHelp(t2), this;
    }
    scriptName(t2) {
      return this.customScriptName = true, this.$0 = t2, this;
    }
    showHelpOnFail(t2, e2) {
      return h("[boolean|string] [string]", [t2, e2], arguments.length), v(this, pt, "f").showHelpOnFail(t2, e2), this;
    }
    showVersion(t2) {
      return h("[string|function]", [t2], arguments.length), v(this, pt, "f").showVersion(t2), this;
    }
    skipValidation(t2) {
      return h("<array|string>", [t2], arguments.length), this[Pt]("skipValidation", t2), this;
    }
    strict(t2) {
      return h("[boolean]", [t2], arguments.length), O(this, ft, t2 !== false, "f"), this;
    }
    strictCommands(t2) {
      return h("[boolean]", [t2], arguments.length), O(this, dt, t2 !== false, "f"), this;
    }
    strictOptions(t2) {
      return h("[boolean]", [t2], arguments.length), O(this, ut, t2 !== false, "f"), this;
    }
    string(t2) {
      return h("<array|string>", [t2], arguments.length), this[Pt]("string", t2), this[Qt](t2), this;
    }
    terminalWidth() {
      return h([], 0), v(this, ct, "f").process.stdColumns;
    }
    updateLocale(t2) {
      return this.updateStrings(t2);
    }
    updateStrings(t2) {
      return h("<object>", [t2], arguments.length), O(this, G, false, "f"), v(this, ct, "f").y18n.updateLocale(t2), this;
    }
    usage(t2, s2, i2, n2) {
      if (h("<string|null|undefined> [string|boolean] [function|object] [function]", [t2, s2, i2, n2], arguments.length), s2 !== undefined) {
        if (d(t2, null, v(this, ct, "f")), (t2 || "").match(/^\$0( |$)/))
          return this.command(t2, s2, i2, n2);
        throw new e(".usage() description must start with $0 if being used as alias for .command()");
      }
      return v(this, pt, "f").usage(t2), this;
    }
    usageConfiguration(t2) {
      return h("<object>", [t2], arguments.length), O(this, gt, t2, "f"), this;
    }
    version(t2, e2, s2) {
      const i2 = "version";
      if (h("[boolean|string] [string] [string]", [t2, e2, s2], arguments.length), v(this, mt, "f") && (this[Ot](v(this, mt, "f")), v(this, pt, "f").version(undefined), O(this, mt, null, "f")), arguments.length === 0)
        s2 = this[xt](), t2 = i2;
      else if (arguments.length === 1) {
        if (t2 === false)
          return this;
        s2 = t2, t2 = i2;
      } else
        arguments.length === 2 && (s2 = e2, e2 = undefined);
      return O(this, mt, typeof t2 == "string" ? t2 : i2, "f"), e2 = e2 || v(this, pt, "f").deferY18nLookup("Show version number"), v(this, pt, "f").version(s2 || undefined), this.boolean(v(this, mt, "f")), this.describe(v(this, mt, "f"), e2), this;
    }
    wrap(t2) {
      return h("<number|null|undefined>", [t2], arguments.length), v(this, pt, "f").wrap(t2), this;
    }
    [(z2 = new WeakMap, W = new WeakMap, q = new WeakMap, U = new WeakMap, F = new WeakMap, L = new WeakMap, V = new WeakMap, G = new WeakMap, R = new WeakMap, T = new WeakMap, B = new WeakMap, Y = new WeakMap, K = new WeakMap, J = new WeakMap, Z = new WeakMap, X = new WeakMap, Q = new WeakMap, tt = new WeakMap, et = new WeakMap, st = new WeakMap, it = new WeakMap, nt = new WeakMap, rt = new WeakMap, ot = new WeakMap, at = new WeakMap, ht = new WeakMap, lt = new WeakMap, ct = new WeakMap, ft = new WeakMap, dt = new WeakMap, ut = new WeakMap, pt = new WeakMap, gt = new WeakMap, mt = new WeakMap, yt = new WeakMap, bt)](t2) {
      if (!t2._ || !t2["--"])
        return t2;
      t2._.push.apply(t2._, t2["--"]);
      try {
        delete t2["--"];
      } catch (t3) {
      }
      return t2;
    }
    [vt]() {
      return { log: (...t2) => {
        this[Rt]() || console.log(...t2), O(this, J, true, "f"), v(this, tt, "f").length && O(this, tt, v(this, tt, "f") + `
`, "f"), O(this, tt, v(this, tt, "f") + t2.join(" "), "f");
      }, error: (...t2) => {
        this[Rt]() || console.error(...t2), O(this, J, true, "f"), v(this, tt, "f").length && O(this, tt, v(this, tt, "f") + `
`, "f"), O(this, tt, v(this, tt, "f") + t2.join(" "), "f");
      } };
    }
    [Ot](t2) {
      p(v(this, et, "f")).forEach((e2) => {
        if (e2 === "configObjects")
          return;
        const s2 = v(this, et, "f")[e2];
        Array.isArray(s2) ? s2.includes(t2) && s2.splice(s2.indexOf(t2), 1) : typeof s2 == "object" && delete s2[t2];
      }), delete v(this, pt, "f").getDescriptions()[t2];
    }
    [wt](t2, e2, s2) {
      v(this, R, "f")[s2] || (v(this, ct, "f").process.emitWarning(t2, e2), v(this, R, "f")[s2] = true);
    }
    [Ct]() {
      v(this, B, "f").push({ options: v(this, et, "f"), configObjects: v(this, et, "f").configObjects.slice(0), exitProcess: v(this, T, "f"), groups: v(this, K, "f"), strict: v(this, ft, "f"), strictCommands: v(this, dt, "f"), strictOptions: v(this, ut, "f"), completionCommand: v(this, F, "f"), output: v(this, tt, "f"), exitError: v(this, V, "f"), hasOutput: v(this, J, "f"), parsed: this.parsed, parseFn: v(this, nt, "f"), parseContext: v(this, rt, "f") }), v(this, pt, "f").freeze(), v(this, yt, "f").freeze(), v(this, z2, "f").freeze(), v(this, Y, "f").freeze();
    }
    [jt]() {
      let t2, e2 = "";
      return t2 = /\b(node|iojs|electron)(\.exe)?$/.test(v(this, ct, "f").process.argv()[0]) ? v(this, ct, "f").process.argv().slice(1, 2) : v(this, ct, "f").process.argv().slice(0, 1), e2 = t2.map((t3) => {
        const e3 = this[Yt](v(this, W, "f"), t3);
        return t3.match(/^(\/|([a-zA-Z]:)?\\)/) && e3.length < t3.length ? e3 : t3;
      }).join(" ").trim(), v(this, ct, "f").getEnv("_") && v(this, ct, "f").getProcessArgvBin() === v(this, ct, "f").getEnv("_") && (e2 = v(this, ct, "f").getEnv("_").replace(`${v(this, ct, "f").path.dirname(v(this, ct, "f").process.execPath())}/`, "")), e2;
    }
    [Mt]() {
      return v(this, it, "f");
    }
    [_t]() {
      return v(this, gt, "f");
    }
    [kt]() {
      if (!v(this, G, "f"))
        return;
      const t2 = v(this, ct, "f").getEnv("LC_ALL") || v(this, ct, "f").getEnv("LC_MESSAGES") || v(this, ct, "f").getEnv("LANG") || v(this, ct, "f").getEnv("LANGUAGE") || "en_US";
      this.locale(t2.replace(/[.:].*/, ""));
    }
    [xt]() {
      return this[At]().version || "unknown";
    }
    [Et](t2) {
      const e2 = t2["--"] ? t2["--"] : t2._;
      for (let t3, s2 = 0;(t3 = e2[s2]) !== undefined; s2++)
        v(this, ct, "f").Parser.looksLikeNumber(t3) && Number.isSafeInteger(Math.floor(parseFloat(`${t3}`))) && (e2[s2] = Number(t3));
      return t2;
    }
    [At](t2) {
      const e2 = t2 || "*";
      if (v(this, ot, "f")[e2])
        return v(this, ot, "f")[e2];
      let s2 = {};
      try {
        let e3 = t2 || v(this, ct, "f").mainFilename;
        !t2 && v(this, ct, "f").path.extname(e3) && (e3 = v(this, ct, "f").path.dirname(e3));
        const i2 = v(this, ct, "f").findUp(e3, (t3, e4) => e4.includes("package.json") ? "package.json" : undefined);
        d(i2, undefined, v(this, ct, "f")), s2 = JSON.parse(v(this, ct, "f").readFileSync(i2, "utf8"));
      } catch (t3) {
      }
      return v(this, ot, "f")[e2] = s2 || {}, v(this, ot, "f")[e2];
    }
    [Pt](t2, e2) {
      (e2 = [].concat(e2)).forEach((e3) => {
        e3 = this[Dt](e3), v(this, et, "f")[t2].push(e3);
      });
    }
    [St](t2, e2, s2, i2) {
      this[It](t2, e2, s2, i2, (t3, e3, s3) => {
        v(this, et, "f")[t3][e3] = s3;
      });
    }
    [$t](t2, e2, s2, i2) {
      this[It](t2, e2, s2, i2, (t3, e3, s3) => {
        v(this, et, "f")[t3][e3] = (v(this, et, "f")[t3][e3] || []).concat(s3);
      });
    }
    [It](t2, e2, s2, i2, n2) {
      if (Array.isArray(s2))
        s2.forEach((e3) => {
          t2(e3, i2);
        });
      else if (((t3) => typeof t3 == "object")(s2))
        for (const e3 of p(s2))
          t2(e3, s2[e3]);
      else
        n2(e2, this[Dt](s2), i2);
    }
    [Dt](t2) {
      return t2 === "__proto__" ? "___proto___" : t2;
    }
    [Nt](t2, e2) {
      return this[St](this[Nt].bind(this), "key", t2, e2), this;
    }
    [Ht]() {
      var t2, e2, s2, i2, n2, r2, o2, a2, h2, l2, c2, f2;
      const u2 = v(this, B, "f").pop();
      let p2;
      d(u2, undefined, v(this, ct, "f")), t2 = this, e2 = this, s2 = this, i2 = this, n2 = this, r2 = this, o2 = this, a2 = this, h2 = this, l2 = this, c2 = this, f2 = this, { options: { set value(e3) {
        O(t2, et, e3, "f");
      } }.value, configObjects: p2, exitProcess: { set value(t3) {
        O(e2, T, t3, "f");
      } }.value, groups: { set value(t3) {
        O(s2, K, t3, "f");
      } }.value, output: { set value(t3) {
        O(i2, tt, t3, "f");
      } }.value, exitError: { set value(t3) {
        O(n2, V, t3, "f");
      } }.value, hasOutput: { set value(t3) {
        O(r2, J, t3, "f");
      } }.value, parsed: this.parsed, strict: { set value(t3) {
        O(o2, ft, t3, "f");
      } }.value, strictCommands: { set value(t3) {
        O(a2, dt, t3, "f");
      } }.value, strictOptions: { set value(t3) {
        O(h2, ut, t3, "f");
      } }.value, completionCommand: { set value(t3) {
        O(l2, F, t3, "f");
      } }.value, parseFn: { set value(t3) {
        O(c2, nt, t3, "f");
      } }.value, parseContext: { set value(t3) {
        O(f2, rt, t3, "f");
      } }.value } = u2, v(this, et, "f").configObjects = p2, v(this, pt, "f").unfreeze(), v(this, yt, "f").unfreeze(), v(this, z2, "f").unfreeze(), v(this, Y, "f").unfreeze();
    }
    [zt](t2, e2) {
      return j(e2, (e3) => (t2(e3), e3));
    }
    getInternalMethods() {
      return { getCommandInstance: this[Wt].bind(this), getContext: this[qt].bind(this), getHasOutput: this[Ut].bind(this), getLoggerInstance: this[Ft].bind(this), getParseContext: this[Lt].bind(this), getParserConfiguration: this[Mt].bind(this), getUsageConfiguration: this[_t].bind(this), getUsageInstance: this[Vt].bind(this), getValidationInstance: this[Gt].bind(this), hasParseCallback: this[Rt].bind(this), isGlobalContext: this[Tt].bind(this), postProcess: this[Bt].bind(this), reset: this[Kt].bind(this), runValidation: this[Zt].bind(this), runYargsParserAndExecuteCommands: this[Jt].bind(this), setHasOutput: this[Xt].bind(this) };
    }
    [Wt]() {
      return v(this, z2, "f");
    }
    [qt]() {
      return v(this, q, "f");
    }
    [Ut]() {
      return v(this, J, "f");
    }
    [Ft]() {
      return v(this, Q, "f");
    }
    [Lt]() {
      return v(this, rt, "f") || {};
    }
    [Vt]() {
      return v(this, pt, "f");
    }
    [Gt]() {
      return v(this, yt, "f");
    }
    [Rt]() {
      return !!v(this, nt, "f");
    }
    [Tt]() {
      return v(this, X, "f");
    }
    [Bt](t2, e2, s2, i2) {
      if (s2)
        return t2;
      if (f(t2))
        return t2;
      e2 || (t2 = this[bt](t2));
      return (this[Mt]()["parse-positional-numbers"] || this[Mt]()["parse-positional-numbers"] === undefined) && (t2 = this[Et](t2)), i2 && (t2 = C(t2, this, v(this, Y, "f").getMiddleware(), false)), t2;
    }
    [Kt](t2 = {}) {
      O(this, et, v(this, et, "f") || {}, "f");
      const e2 = {};
      e2.local = v(this, et, "f").local || [], e2.configObjects = v(this, et, "f").configObjects || [];
      const s2 = {};
      e2.local.forEach((e3) => {
        s2[e3] = true, (t2[e3] || []).forEach((t3) => {
          s2[t3] = true;
        });
      }), Object.assign(v(this, at, "f"), Object.keys(v(this, K, "f")).reduce((t3, e3) => {
        const i2 = v(this, K, "f")[e3].filter((t4) => !(t4 in s2));
        return i2.length > 0 && (t3[e3] = i2), t3;
      }, {})), O(this, K, {}, "f");
      return ["array", "boolean", "string", "skipValidation", "count", "normalize", "number", "hiddenOptions"].forEach((t3) => {
        e2[t3] = (v(this, et, "f")[t3] || []).filter((t4) => !s2[t4]);
      }), ["narg", "key", "alias", "default", "defaultDescription", "config", "choices", "demandedOptions", "demandedCommands", "deprecatedOptions"].forEach((t3) => {
        e2[t3] = g(v(this, et, "f")[t3], (t4) => !s2[t4]);
      }), e2.envPrefix = v(this, et, "f").envPrefix, O(this, et, e2, "f"), O(this, pt, v(this, pt, "f") ? v(this, pt, "f").reset(s2) : P(this, v(this, ct, "f")), "f"), O(this, yt, v(this, yt, "f") ? v(this, yt, "f").reset(s2) : function(t3, e3, s3) {
        const i2 = s3.y18n.__, n2 = s3.y18n.__n, r2 = { nonOptionCount: function(s4) {
          const i3 = t3.getDemandedCommands(), r3 = s4._.length + (s4["--"] ? s4["--"].length : 0) - t3.getInternalMethods().getContext().commands.length;
          i3._ && (r3 < i3._.min || r3 > i3._.max) && (r3 < i3._.min ? i3._.minMsg !== undefined ? e3.fail(i3._.minMsg ? i3._.minMsg.replace(/\$0/g, r3.toString()).replace(/\$1/, i3._.min.toString()) : null) : e3.fail(n2("Not enough non-option arguments: got %s, need at least %s", "Not enough non-option arguments: got %s, need at least %s", r3, r3.toString(), i3._.min.toString())) : r3 > i3._.max && (i3._.maxMsg !== undefined ? e3.fail(i3._.maxMsg ? i3._.maxMsg.replace(/\$0/g, r3.toString()).replace(/\$1/, i3._.max.toString()) : null) : e3.fail(n2("Too many non-option arguments: got %s, maximum of %s", "Too many non-option arguments: got %s, maximum of %s", r3, r3.toString(), i3._.max.toString()))));
        }, positionalCount: function(t4, s4) {
          s4 < t4 && e3.fail(n2("Not enough non-option arguments: got %s, need at least %s", "Not enough non-option arguments: got %s, need at least %s", s4, s4 + "", t4 + ""));
        }, requiredArguments: function(t4, s4) {
          let i3 = null;
          for (const e4 of Object.keys(s4))
            Object.prototype.hasOwnProperty.call(t4, e4) && t4[e4] !== undefined || (i3 = i3 || {}, i3[e4] = s4[e4]);
          if (i3) {
            const t5 = [];
            for (const e4 of Object.keys(i3)) {
              const s6 = i3[e4];
              s6 && t5.indexOf(s6) < 0 && t5.push(s6);
            }
            const s5 = t5.length ? `
${t5.join(`
`)}` : "";
            e3.fail(n2("Missing required argument: %s", "Missing required arguments: %s", Object.keys(i3).length, Object.keys(i3).join(", ") + s5));
          }
        }, unknownArguments: function(s4, i3, o3, a3, h2 = true) {
          var l3;
          const c3 = t3.getInternalMethods().getCommandInstance().getCommands(), f2 = [], d2 = t3.getInternalMethods().getContext();
          if (Object.keys(s4).forEach((e4) => {
            H.includes(e4) || Object.prototype.hasOwnProperty.call(o3, e4) || Object.prototype.hasOwnProperty.call(t3.getInternalMethods().getParseContext(), e4) || r2.isValidAndSomeAliasIsNotNew(e4, i3) || f2.push(e4);
          }), h2 && (d2.commands.length > 0 || c3.length > 0 || a3) && s4._.slice(d2.commands.length).forEach((t4) => {
            c3.includes("" + t4) || f2.push("" + t4);
          }), h2) {
            const e4 = ((l3 = t3.getDemandedCommands()._) === null || l3 === undefined ? undefined : l3.max) || 0, i4 = d2.commands.length + e4;
            i4 < s4._.length && s4._.slice(i4).forEach((t4) => {
              t4 = String(t4), d2.commands.includes(t4) || f2.includes(t4) || f2.push(t4);
            });
          }
          f2.length && e3.fail(n2("Unknown argument: %s", "Unknown arguments: %s", f2.length, f2.map((t4) => t4.trim() ? t4 : `"${t4}"`).join(", ")));
        }, unknownCommands: function(s4) {
          const i3 = t3.getInternalMethods().getCommandInstance().getCommands(), r3 = [], o3 = t3.getInternalMethods().getContext();
          return (o3.commands.length > 0 || i3.length > 0) && s4._.slice(o3.commands.length).forEach((t4) => {
            i3.includes("" + t4) || r3.push("" + t4);
          }), r3.length > 0 && (e3.fail(n2("Unknown command: %s", "Unknown commands: %s", r3.length, r3.join(", "))), true);
        }, isValidAndSomeAliasIsNotNew: function(e4, s4) {
          if (!Object.prototype.hasOwnProperty.call(s4, e4))
            return false;
          const i3 = t3.parsed.newAliases;
          return [e4, ...s4[e4]].some((t4) => !Object.prototype.hasOwnProperty.call(i3, t4) || !i3[e4]);
        }, limitedChoices: function(s4) {
          const n3 = t3.getOptions(), r3 = {};
          if (!Object.keys(n3.choices).length)
            return;
          Object.keys(s4).forEach((t4) => {
            H.indexOf(t4) === -1 && Object.prototype.hasOwnProperty.call(n3.choices, t4) && [].concat(s4[t4]).forEach((e4) => {
              n3.choices[t4].indexOf(e4) === -1 && e4 !== undefined && (r3[t4] = (r3[t4] || []).concat(e4));
            });
          });
          const o3 = Object.keys(r3);
          if (!o3.length)
            return;
          let a3 = i2("Invalid values:");
          o3.forEach((t4) => {
            a3 += `
  ${i2("Argument: %s, Given: %s, Choices: %s", t4, e3.stringifiedValues(r3[t4]), e3.stringifiedValues(n3.choices[t4]))}`;
          }), e3.fail(a3);
        } };
        let o2 = {};
        function a2(t4, e4) {
          const s4 = Number(e4);
          return typeof (e4 = isNaN(s4) ? e4 : s4) == "number" ? e4 = t4._.length >= e4 : e4.match(/^--no-.+/) ? (e4 = e4.match(/^--no-(.+)/)[1], e4 = !Object.prototype.hasOwnProperty.call(t4, e4)) : e4 = Object.prototype.hasOwnProperty.call(t4, e4), e4;
        }
        r2.implies = function(e4, i3) {
          h("<string|object> [array|number|string]", [e4, i3], arguments.length), typeof e4 == "object" ? Object.keys(e4).forEach((t4) => {
            r2.implies(t4, e4[t4]);
          }) : (t3.global(e4), o2[e4] || (o2[e4] = []), Array.isArray(i3) ? i3.forEach((t4) => r2.implies(e4, t4)) : (d(i3, undefined, s3), o2[e4].push(i3)));
        }, r2.getImplied = function() {
          return o2;
        }, r2.implications = function(t4) {
          const s4 = [];
          if (Object.keys(o2).forEach((e4) => {
            const i3 = e4;
            (o2[e4] || []).forEach((e5) => {
              let n3 = i3;
              const r3 = e5;
              n3 = a2(t4, n3), e5 = a2(t4, e5), n3 && !e5 && s4.push(` ${i3} -> ${r3}`);
            });
          }), s4.length) {
            let t5 = `${i2("Implications failed:")}
`;
            s4.forEach((e4) => {
              t5 += e4;
            }), e3.fail(t5);
          }
        };
        let l2 = {};
        r2.conflicts = function(e4, s4) {
          h("<string|object> [array|string]", [e4, s4], arguments.length), typeof e4 == "object" ? Object.keys(e4).forEach((t4) => {
            r2.conflicts(t4, e4[t4]);
          }) : (t3.global(e4), l2[e4] || (l2[e4] = []), Array.isArray(s4) ? s4.forEach((t4) => r2.conflicts(e4, t4)) : l2[e4].push(s4));
        }, r2.getConflicting = () => l2, r2.conflicting = function(n3) {
          Object.keys(n3).forEach((t4) => {
            l2[t4] && l2[t4].forEach((s4) => {
              s4 && n3[t4] !== undefined && n3[s4] !== undefined && e3.fail(i2("Arguments %s and %s are mutually exclusive", t4, s4));
            });
          }), t3.getInternalMethods().getParserConfiguration()["strip-dashed"] && Object.keys(l2).forEach((t4) => {
            l2[t4].forEach((r3) => {
              r3 && n3[s3.Parser.camelCase(t4)] !== undefined && n3[s3.Parser.camelCase(r3)] !== undefined && e3.fail(i2("Arguments %s and %s are mutually exclusive", t4, r3));
            });
          });
        }, r2.recommendCommands = function(t4, s4) {
          s4 = s4.sort((t5, e4) => e4.length - t5.length);
          let n3 = null, r3 = 1 / 0;
          for (let e4, i3 = 0;(e4 = s4[i3]) !== undefined; i3++) {
            const s5 = N(t4, e4);
            s5 <= 3 && s5 < r3 && (r3 = s5, n3 = e4);
          }
          n3 && e3.fail(i2("Did you mean %s?", n3));
        }, r2.reset = function(t4) {
          return o2 = g(o2, (e4) => !t4[e4]), l2 = g(l2, (e4) => !t4[e4]), r2;
        };
        const c2 = [];
        return r2.freeze = function() {
          c2.push({ implied: o2, conflicting: l2 });
        }, r2.unfreeze = function() {
          const t4 = c2.pop();
          d(t4, undefined, s3), { implied: o2, conflicting: l2 } = t4;
        }, r2;
      }(this, v(this, pt, "f"), v(this, ct, "f")), "f"), O(this, z2, v(this, z2, "f") ? v(this, z2, "f").reset() : function(t3, e3, s3, i2) {
        return new _(t3, e3, s3, i2);
      }(v(this, pt, "f"), v(this, yt, "f"), v(this, Y, "f"), v(this, ct, "f")), "f"), v(this, U, "f") || O(this, U, function(t3, e3, s3, i2) {
        return new D(t3, e3, s3, i2);
      }(this, v(this, pt, "f"), v(this, z2, "f"), v(this, ct, "f")), "f"), v(this, Y, "f").reset(), O(this, F, null, "f"), O(this, tt, "", "f"), O(this, V, null, "f"), O(this, J, false, "f"), this.parsed = false, this;
    }
    [Yt](t2, e2) {
      return v(this, ct, "f").path.relative(t2, e2);
    }
    [Jt](t2, s2, i2, n2 = 0, r2 = false) {
      let o2 = !!i2 || r2;
      t2 = t2 || v(this, ht, "f"), v(this, et, "f").__ = v(this, ct, "f").y18n.__, v(this, et, "f").configuration = this[Mt]();
      const a2 = !!v(this, et, "f").configuration["populate--"], h2 = Object.assign({}, v(this, et, "f").configuration, { "populate--": true }), l2 = v(this, ct, "f").Parser.detailed(t2, Object.assign({}, v(this, et, "f"), { configuration: { "parse-positional-numbers": false, ...h2 } })), c2 = Object.assign(l2.argv, v(this, rt, "f"));
      let d2;
      const u2 = l2.aliases;
      let p2 = false, g2 = false;
      Object.keys(c2).forEach((t3) => {
        t3 === v(this, Z, "f") && c2[t3] ? p2 = true : t3 === v(this, mt, "f") && c2[t3] && (g2 = true);
      }), c2.$0 = this.$0, this.parsed = l2, n2 === 0 && v(this, pt, "f").clearCachedHelpMessage();
      try {
        if (this[kt](), s2)
          return this[Bt](c2, a2, !!i2, false);
        if (v(this, Z, "f")) {
          [v(this, Z, "f")].concat(u2[v(this, Z, "f")] || []).filter((t3) => t3.length > 1).includes("" + c2._[c2._.length - 1]) && (c2._.pop(), p2 = true);
        }
        O(this, X, false, "f");
        const h3 = v(this, z2, "f").getCommands(), m2 = v(this, U, "f").completionKey in c2, y2 = p2 || m2 || r2;
        if (c2._.length) {
          if (h3.length) {
            let t3;
            for (let e2, s3 = n2 || 0;c2._[s3] !== undefined; s3++) {
              if (e2 = String(c2._[s3]), h3.includes(e2) && e2 !== v(this, F, "f")) {
                const t4 = v(this, z2, "f").runCommand(e2, this, l2, s3 + 1, r2, p2 || g2 || r2);
                return this[Bt](t4, a2, !!i2, false);
              }
              if (!t3 && e2 !== v(this, F, "f")) {
                t3 = e2;
                break;
              }
            }
            !v(this, z2, "f").hasDefaultCommand() && v(this, lt, "f") && t3 && !y2 && v(this, yt, "f").recommendCommands(t3, h3);
          }
          v(this, F, "f") && c2._.includes(v(this, F, "f")) && !m2 && (v(this, T, "f") && E(true), this.showCompletionScript(), this.exit(0));
        }
        if (v(this, z2, "f").hasDefaultCommand() && !y2) {
          const t3 = v(this, z2, "f").runCommand(null, this, l2, 0, r2, p2 || g2 || r2);
          return this[Bt](t3, a2, !!i2, false);
        }
        if (m2) {
          v(this, T, "f") && E(true);
          const s3 = (t2 = [].concat(t2)).slice(t2.indexOf(`--${v(this, U, "f").completionKey}`) + 1);
          return v(this, U, "f").getCompletion(s3, (t3, s4) => {
            if (t3)
              throw new e(t3.message);
            (s4 || []).forEach((t4) => {
              v(this, Q, "f").log(t4);
            }), this.exit(0);
          }), this[Bt](c2, !a2, !!i2, false);
        }
        if (v(this, J, "f") || (p2 ? (v(this, T, "f") && E(true), o2 = true, this.showHelp("log"), this.exit(0)) : g2 && (v(this, T, "f") && E(true), o2 = true, v(this, pt, "f").showVersion("log"), this.exit(0))), !o2 && v(this, et, "f").skipValidation.length > 0 && (o2 = Object.keys(c2).some((t3) => v(this, et, "f").skipValidation.indexOf(t3) >= 0 && c2[t3] === true)), !o2) {
          if (l2.error)
            throw new e(l2.error.message);
          if (!m2) {
            const t3 = this[Zt](u2, {}, l2.error);
            i2 || (d2 = C(c2, this, v(this, Y, "f").getMiddleware(), true)), d2 = this[zt](t3, d2 != null ? d2 : c2), f(d2) && !i2 && (d2 = d2.then(() => C(c2, this, v(this, Y, "f").getMiddleware(), false)));
          }
        }
      } catch (t3) {
        if (!(t3 instanceof e))
          throw t3;
        v(this, pt, "f").fail(t3.message, t3);
      }
      return this[Bt](d2 != null ? d2 : c2, a2, !!i2, true);
    }
    [Zt](t2, s2, i2, n2) {
      const r2 = { ...this.getDemandedOptions() };
      return (o2) => {
        if (i2)
          throw new e(i2.message);
        v(this, yt, "f").nonOptionCount(o2), v(this, yt, "f").requiredArguments(o2, r2);
        let a2 = false;
        v(this, dt, "f") && (a2 = v(this, yt, "f").unknownCommands(o2)), v(this, ft, "f") && !a2 ? v(this, yt, "f").unknownArguments(o2, t2, s2, !!n2) : v(this, ut, "f") && v(this, yt, "f").unknownArguments(o2, t2, {}, false, false), v(this, yt, "f").limitedChoices(o2), v(this, yt, "f").implications(o2), v(this, yt, "f").conflicting(o2);
      };
    }
    [Xt]() {
      O(this, J, true, "f");
    }
    [Qt](t2) {
      if (typeof t2 == "string")
        v(this, et, "f").key[t2] = true;
      else
        for (const e2 of t2)
          v(this, et, "f").key[e2] = true;
    }
  }
  var ee;
  var se;
  var { readFileSync: ie } = __require("fs");
  var { inspect: ne } = __require("util");
  var { resolve: re } = __require("path");
  var oe = require_build();
  var ae = require_build2();
  var he;
  var le = { assert: { notStrictEqual: t.notStrictEqual, strictEqual: t.strictEqual }, cliui: require_build3(), findUp: require_sync(), getEnv: (t2) => process.env[t2], getCallerFile: require_get_caller_file(), getProcessArgvBin: y, inspect: ne, mainFilename: (se = (ee = __require === null || __require === undefined ? undefined : __require.main) === null || ee === undefined ? undefined : ee.filename) !== null && se !== undefined ? se : process.cwd(), Parser: ae, path: __require("path"), process: { argv: () => process.argv, cwd: process.cwd, emitWarning: (t2, e2) => process.emitWarning(t2, e2), execPath: () => process.execPath, exit: (t2) => {
    process.exit(t2);
  }, nextTick: process.nextTick, stdColumns: process.stdout.columns !== undefined ? process.stdout.columns : null }, readFileSync: ie, require: __require, requireDirectory: require_require_directory(), stringWidth: require_string_width(), y18n: oe({ directory: re(__dirname, "../locales"), updateFiles: false }) };
  var ce = ((he = process === null || process === undefined ? undefined : process.env) === null || he === undefined ? undefined : he.YARGS_MIN_NODE_VERSION) ? Number(process.env.YARGS_MIN_NODE_VERSION) : 12;
  if (process && process.version) {
    if (Number(process.version.match(/v([^.]+)/)[1]) < ce)
      throw Error(`yargs supports a minimum Node.js version of ${ce}. Read our version support policy: https://github.com/yargs/yargs#supported-nodejs-versions`);
  }
  var fe = require_build2();
  var de;
  var ue = { applyExtends: n, cjsPlatformShim: le, Yargs: (de = le, (t2 = [], e2 = de.process.cwd(), s2) => {
    const i2 = new te(t2, e2, s2, de);
    return Object.defineProperty(i2, "argv", { get: () => i2.parse(), enumerable: true }), i2.help(), i2.version(), i2;
  }), argsert: h, isPromise: f, objFilter: g, parseCommand: o, Parser: fe, processArgv: b, YError: e };
  module.exports = ue;
});

// src/cli.ts
import child_process from "node:child_process";
import path2 from "node:path";

// src/config.ts
var import_yaml = __toESM(require_dist(), 1);
import fs from "node:fs";
import path from "node:path";

// node_modules/zod/lib/index.mjs
var util;
(function(util2) {
  util2.assertEqual = (val) => val;
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error;
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};

class ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
        fieldErrors[sub.path[0]].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
}
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var overrideErrorMap = errorMap;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== undefined) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      ctx.schemaErrorMap,
      overrideMap,
      overrideMap === errorMap ? undefined : errorMap
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}

class ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
}
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m")
    throw new TypeError("Private method is not writable");
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message === null || message === undefined ? undefined : message.message;
})(errorUtil || (errorUtil = {}));
var _ZodEnum_cache;
var _ZodNativeEnum_cache;

class ParseInputLazyPath {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (this._key instanceof Array) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
}
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    var _a, _b;
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message !== null && message !== undefined ? message : ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: (_a = message !== null && message !== undefined ? message : required_error) !== null && _a !== undefined ? _a : ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: (_b = message !== null && message !== undefined ? message : invalid_type_error) !== null && _b !== undefined ? _b : ctx.defaultError };
  };
  return { errorMap: customMap, description };
}

class ZodType {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus,
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    var _a;
    const ctx = {
      common: {
        issues: [],
        async: (_a = params === null || params === undefined ? undefined : params.async) !== null && _a !== undefined ? _a : false,
        contextualErrorMap: params === null || params === undefined ? undefined : params.errorMap
      },
      path: (params === null || params === undefined ? undefined : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    var _a, _b;
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if ((_b = (_a = err === null || err === undefined ? undefined : err.message) === null || _a === undefined ? undefined : _a.toLowerCase()) === null || _b === undefined ? undefined : _b.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params === null || params === undefined ? undefined : params.errorMap,
        async: true
      },
      path: (params === null || params === undefined ? undefined : params.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(undefined).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let regex = `([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d`;
  if (args.precision) {
    regex = `${regex}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    regex = `${regex}(\\.\\d+)?`;
  }
  return regex;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if (!decoded.typ || !decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch (_a) {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}

class ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus;
    let ctx = undefined;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch (_a) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    var _a, _b;
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof (options === null || options === undefined ? undefined : options.precision) === "undefined" ? null : options === null || options === undefined ? undefined : options.precision,
      offset: (_a = options === null || options === undefined ? undefined : options.offset) !== null && _a !== undefined ? _a : false,
      local: (_b = options === null || options === undefined ? undefined : options.local) !== null && _b !== undefined ? _b : false,
      ...errorUtil.errToObj(options === null || options === undefined ? undefined : options.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof (options === null || options === undefined ? undefined : options.precision) === "undefined" ? null : options === null || options === undefined ? undefined : options.precision,
      ...errorUtil.errToObj(options === null || options === undefined ? undefined : options.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options === null || options === undefined ? undefined : options.position,
      ...errorUtil.errToObj(options === null || options === undefined ? undefined : options.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
}
ZodString.create = (params) => {
  var _a;
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: (_a = params === null || params === undefined ? undefined : params.coerce) !== null && _a !== undefined ? _a : false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / Math.pow(10, decCount);
}

class ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = undefined;
    const status = new ParseStatus;
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null, min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
}
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: (params === null || params === undefined ? undefined : params.coerce) || false,
    ...processCreateParams(params)
  });
};

class ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch (_a) {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = undefined;
    const status = new ParseStatus;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
}
ZodBigInt.create = (params) => {
  var _a;
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: (_a = params === null || params === undefined ? undefined : params.coerce) !== null && _a !== undefined ? _a : false,
    ...processCreateParams(params)
  });
};

class ZodBoolean extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: (params === null || params === undefined ? undefined : params.coerce) || false,
    ...processCreateParams(params)
  });
};

class ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus;
    let ctx = undefined;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
}
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: (params === null || params === undefined ? undefined : params.coerce) || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};

class ZodSymbol extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};

class ZodUndefined extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};

class ZodNull extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};

class ZodAny extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};

class ZodUnknown extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
}
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};

class ZodNever extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
}
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};

class ZodVoid extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
}
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};

class ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : undefined,
          maximum: tooBig ? def.exactLength.value : undefined,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}

class ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    return this._cached = { shape, keys };
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip")
        ;
      else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== undefined ? {
        errorMap: (issue, ctx) => {
          var _a, _b, _c, _d;
          const defaultError = (_c = (_b = (_a = this._def).errorMap) === null || _b === undefined ? undefined : _b.call(_a, issue, ctx).message) !== null && _c !== undefined ? _c : ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: (_d = errorUtil.errToObj(message).message) !== null && _d !== undefined ? _d : defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  extend(augmentation) {
    return new ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  merge(merging) {
    const merged = new ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  catchall(index) {
    return new ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    util.objectKeys(mask).forEach((key) => {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    util.objectKeys(this.shape).forEach((key) => {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key) => {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    util.objectKeys(this.shape).forEach((key) => {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    });
    return new ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
}
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};

class ZodUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = undefined;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
}
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [undefined];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [undefined, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};

class ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  static create(discriminator, options, params) {
    const optionsMap = new Map;
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0;index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}

class ZodIntersection extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
}
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};

class ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new ZodTuple({
      ...this._def,
      rest
    });
  }
}
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};

class ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
}

class ZodMap extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = new Map;
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = new Map;
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
}
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};

class ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = new Set;
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
}
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};

class ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [
          ctx.common.contextualErrorMap,
          ctx.schemaErrorMap,
          getErrorMap(),
          errorMap
        ].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
}

class ZodLazy extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
}
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};

class ZodLiteral extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
}
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}

class ZodEnum extends ZodType {
  constructor() {
    super(...arguments);
    _ZodEnum_cache.set(this, undefined);
  }
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!__classPrivateFieldGet(this, _ZodEnum_cache, "f")) {
      __classPrivateFieldSet(this, _ZodEnum_cache, new Set(this._def.values), "f");
    }
    if (!__classPrivateFieldGet(this, _ZodEnum_cache, "f").has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
}
_ZodEnum_cache = new WeakMap;
ZodEnum.create = createZodEnum;

class ZodNativeEnum extends ZodType {
  constructor() {
    super(...arguments);
    _ZodNativeEnum_cache.set(this, undefined);
  }
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!__classPrivateFieldGet(this, _ZodNativeEnum_cache, "f")) {
      __classPrivateFieldSet(this, _ZodNativeEnum_cache, new Set(util.getValidEnumValues(this._def.values)), "f");
    }
    if (!__classPrivateFieldGet(this, _ZodNativeEnum_cache, "f").has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
}
_ZodNativeEnum_cache = new WeakMap;
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};

class ZodPromise extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
}
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};

class ZodEffects extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return base;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return base;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
        });
      }
    }
    util.assertNever(effect);
  }
}
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};

class ZodOptional extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(undefined);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};

class ZodNullable extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};

class ZodDefault extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};

class ZodCatch extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
}
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};

class ZodNaN extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
}
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");

class ZodBranded extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
}

class ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
}

class ZodReadonly extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function custom(check, params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      var _a, _b;
      if (!check(data)) {
        const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
        const _fatal = (_b = (_a = p.fatal) !== null && _a !== undefined ? _a : fatal) !== null && _b !== undefined ? _b : true;
        const p2 = typeof p === "string" ? { message: p } : p;
        ctx.addIssue({ code: "custom", ...p2, fatal: _fatal });
      }
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: (arg) => ZodString.create({ ...arg, coerce: true }),
  number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
  boolean: (arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  }),
  bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
  date: (arg) => ZodDate.create({ ...arg, coerce: true })
};
var NEVER = INVALID;
var z = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  defaultErrorMap: errorMap,
  setErrorMap,
  getErrorMap,
  makeIssue,
  EMPTY_PATH,
  addIssueToContext,
  ParseStatus,
  INVALID,
  DIRTY,
  OK,
  isAborted,
  isDirty,
  isValid,
  isAsync,
  get util() {
    return util;
  },
  get objectUtil() {
    return objectUtil;
  },
  ZodParsedType,
  getParsedType,
  ZodType,
  datetimeRegex,
  ZodString,
  ZodNumber,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodSymbol,
  ZodUndefined,
  ZodNull,
  ZodAny,
  ZodUnknown,
  ZodNever,
  ZodVoid,
  ZodArray,
  ZodObject,
  ZodUnion,
  ZodDiscriminatedUnion,
  ZodIntersection,
  ZodTuple,
  ZodRecord,
  ZodMap,
  ZodSet,
  ZodFunction,
  ZodLazy,
  ZodLiteral,
  ZodEnum,
  ZodNativeEnum,
  ZodPromise,
  ZodEffects,
  ZodTransformer: ZodEffects,
  ZodOptional,
  ZodNullable,
  ZodDefault,
  ZodCatch,
  ZodNaN,
  BRAND,
  ZodBranded,
  ZodPipeline,
  ZodReadonly,
  custom,
  Schema: ZodType,
  ZodSchema: ZodType,
  late,
  get ZodFirstPartyTypeKind() {
    return ZodFirstPartyTypeKind;
  },
  coerce,
  any: anyType,
  array: arrayType,
  bigint: bigIntType,
  boolean: booleanType,
  date: dateType,
  discriminatedUnion: discriminatedUnionType,
  effect: effectsType,
  enum: enumType,
  function: functionType,
  instanceof: instanceOfType,
  intersection: intersectionType,
  lazy: lazyType,
  literal: literalType,
  map: mapType,
  nan: nanType,
  nativeEnum: nativeEnumType,
  never: neverType,
  null: nullType,
  nullable: nullableType,
  number: numberType,
  object: objectType,
  oboolean,
  onumber,
  optional: optionalType,
  ostring,
  pipeline: pipelineType,
  preprocess: preprocessType,
  promise: promiseType,
  record: recordType,
  set: setType,
  strictObject: strictObjectType,
  string: stringType,
  symbol: symbolType,
  transformer: effectsType,
  tuple: tupleType,
  undefined: undefinedType,
  union: unionType,
  unknown: unknownType,
  void: voidType,
  NEVER,
  ZodIssueCode,
  quotelessJson,
  ZodError
});

// node_modules/zod-validation-error/dist/index.mjs
function isZodErrorLike(err) {
  return err instanceof Error && err.name === "ZodError" && "issues" in err && Array.isArray(err.issues);
}
var ValidationError = class extends Error {
  name;
  details;
  constructor(message, options) {
    super(message, options);
    this.name = "ZodValidationError";
    this.details = getIssuesFromErrorOptions(options);
  }
  toString() {
    return this.message;
  }
};
function getIssuesFromErrorOptions(options) {
  if (options) {
    const cause = options.cause;
    if (isZodErrorLike(cause)) {
      return cause.issues;
    }
  }
  return [];
}
function isNonEmptyArray(value) {
  return value.length !== 0;
}
var identifierRegex = /[$_\p{ID_Start}][$\u200c\u200d\p{ID_Continue}]*/u;
function joinPath(path) {
  if (path.length === 1) {
    return path[0].toString();
  }
  return path.reduce((acc, item) => {
    if (typeof item === "number") {
      return acc + "[" + item.toString() + "]";
    }
    if (item.includes('"')) {
      return acc + '["' + escapeQuotes(item) + '"]';
    }
    if (!identifierRegex.test(item)) {
      return acc + '["' + item + '"]';
    }
    const separator = acc.length === 0 ? "" : ".";
    return acc + separator + item;
  }, "");
}
function escapeQuotes(str) {
  return str.replace(/"/g, "\\\"");
}
var ISSUE_SEPARATOR = "; ";
var MAX_ISSUES_IN_MESSAGE = 99;
var PREFIX = "Validation error";
var PREFIX_SEPARATOR = ": ";
var UNION_SEPARATOR = ", or ";
function createMessageBuilder(props = {}) {
  const {
    issueSeparator = ISSUE_SEPARATOR,
    unionSeparator = UNION_SEPARATOR,
    prefixSeparator = PREFIX_SEPARATOR,
    prefix = PREFIX,
    includePath = true,
    maxIssuesInMessage = MAX_ISSUES_IN_MESSAGE
  } = props;
  return (issues) => {
    const message = issues.slice(0, maxIssuesInMessage).map((issue) => getMessageFromZodIssue({
      issue,
      issueSeparator,
      unionSeparator,
      includePath
    })).join(issueSeparator);
    return prefixMessage(message, prefix, prefixSeparator);
  };
}
function getMessageFromZodIssue(props) {
  const { issue, issueSeparator, unionSeparator, includePath } = props;
  if (issue.code === ZodIssueCode.invalid_union) {
    return issue.unionErrors.reduce((acc, zodError) => {
      const newIssues = zodError.issues.map((issue2) => getMessageFromZodIssue({
        issue: issue2,
        issueSeparator,
        unionSeparator,
        includePath
      })).join(issueSeparator);
      if (!acc.includes(newIssues)) {
        acc.push(newIssues);
      }
      return acc;
    }, []).join(unionSeparator);
  }
  if (issue.code === ZodIssueCode.invalid_arguments) {
    return [
      issue.message,
      ...issue.argumentsError.issues.map((issue2) => getMessageFromZodIssue({
        issue: issue2,
        issueSeparator,
        unionSeparator,
        includePath
      }))
    ].join(issueSeparator);
  }
  if (issue.code === ZodIssueCode.invalid_return_type) {
    return [
      issue.message,
      ...issue.returnTypeError.issues.map((issue2) => getMessageFromZodIssue({
        issue: issue2,
        issueSeparator,
        unionSeparator,
        includePath
      }))
    ].join(issueSeparator);
  }
  if (includePath && isNonEmptyArray(issue.path)) {
    if (issue.path.length === 1) {
      const identifier = issue.path[0];
      if (typeof identifier === "number") {
        return `${issue.message} at index ${identifier}`;
      }
    }
    return `${issue.message} at "${joinPath(issue.path)}"`;
  }
  return issue.message;
}
function prefixMessage(message, prefix, prefixSeparator) {
  if (prefix !== null) {
    if (message.length > 0) {
      return [prefix, message].join(prefixSeparator);
    }
    return prefix;
  }
  if (message.length > 0) {
    return message;
  }
  return PREFIX;
}
function fromZodErrorWithoutRuntimeCheck(zodError, options = {}) {
  const zodIssues = zodError.errors;
  let message;
  if (isNonEmptyArray(zodIssues)) {
    const messageBuilder = createMessageBuilderFromOptions2(options);
    message = messageBuilder(zodIssues);
  } else {
    message = zodError.message;
  }
  return new ValidationError(message, { cause: zodError });
}
function createMessageBuilderFromOptions2(options) {
  if ("messageBuilder" in options) {
    return options.messageBuilder;
  }
  return createMessageBuilder(options);
}
var toValidationError = (options = {}) => (err) => {
  if (isZodErrorLike(err)) {
    return fromZodErrorWithoutRuntimeCheck(err, options);
  }
  if (err instanceof Error) {
    return new ValidationError(err.message, { cause: err });
  }
  return new ValidationError("Unknown error");
};
function fromError(err, options = {}) {
  return toValidationError(options)(err);
}

// src/handlers.ts
var handlerInstanceCache = new Map;

// src/extension.ts
var EXTENSION_NAME = "harperdb-proxy-transform";

// src/config.ts
async function getValidOrigins() {
  const edgioConfig = await ConfigLoader.loadEdgioConfig();
  return edgioConfig.origins.map((origin) => origin.name);
}
var createHandlerConfigSchema = async () => {
  const validOrigins = await getValidOrigins();
  return z.object({
    type: z.union([z.literal("proxy"), z.literal("compute")]).describe('The handler type must be either "proxy" or "compute".'),
    path: z.string().nonempty('The "path" property cannot be empty.').describe("The path to be handled by this configuration."),
    origin: z.string().nonempty('The "origin" property cannot be empty.').refine((origin) => validOrigins.includes(origin), (origin) => ({
      message: `Invalid origin '${origin}'. Must be one of: ${validOrigins.join(", ")}`
    })).describe("The origin server for the handler configuration."),
    always: z.boolean().default(false).describe("Whether the handler should always be applied.")
  });
};
var createHDBConfigSchema = async () => {
  const handlerConfigSchema = await createHandlerConfigSchema();
  return z.object({
    [EXTENSION_NAME]: z.object({
      package: z.string().nonempty('The "package" property is required and cannot be empty.').describe("The name of the package being used."),
      outputDir: z.string().nonempty('The "outputDir" property is required and cannot be empty.').describe("The output directory for the build files."),
      handlers: z.record(handlerConfigSchema).describe("The handlers configuration must be an object where keys represent handler names.")
    })
  });
};

class ConfigLoader {
  static _edgioConfig;
  static async loadHDBConfig(configPath = "config.yaml") {
    configPath = path.resolve(process.cwd(), configPath);
    let parsedConfig;
    try {
      const fileContent = fs.readFileSync(configPath, "utf8");
      parsedConfig = import_yaml.default.parse(fileContent);
    } catch (error) {
      throw new Error(`Failed to load or parse the configuration file at ${configPath}: ${error.message}`);
    }
    const hdbConfigSchema = await createHDBConfigSchema();
    const validationResult = hdbConfigSchema.safeParse(parsedConfig);
    if (!validationResult.success) {
      const message = fromError(validationResult.error);
      throw new Error(`Invalid HDBConfig:
${message}`);
    }
    return validationResult.data[EXTENSION_NAME];
  }
  static async loadEdgioConfig() {
    return this._edgioConfig || (this._edgioConfig = (await import(path.resolve(process.cwd(), "edgio.config.js"))).default);
  }
}

// node_modules/yargs/yargs.mjs
var import_build = __toESM(require_build4(), 1);
var { applyExtends, cjsPlatformShim, Parser, processArgv, Yargs } = import_build.default;
Yargs.applyExtends = (config, cwd, mergeExtends) => {
  return applyExtends(config, cwd, mergeExtends, cjsPlatformShim);
};
Yargs.hideBin = processArgv.hideBin;
Yargs.Parser = Parser;
var yargs_default = Yargs;

// node_modules/yargs/build/lib/yerror.js
class YError extends Error {
  constructor(msg) {
    super(msg || "yargs error");
    this.name = "YError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, YError);
    }
  }
}

// node_modules/yargs/build/lib/utils/process-argv.js
function getProcessArgvBinIndex() {
  if (isBundledElectronApp())
    return 0;
  return 1;
}
function isBundledElectronApp() {
  return isElectronApp() && !process.defaultApp;
}
function isElectronApp() {
  return !!process.versions.electron;
}
function hideBin(argv) {
  return argv.slice(getProcessArgvBinIndex() + 1);
}
function getProcessArgvBin() {
  return process.argv[getProcessArgvBinIndex()];
}

// node_modules/yargs-parser/build/lib/index.js
import { format } from "util";
import { normalize, resolve } from "path";

// node_modules/yargs-parser/build/lib/string-utils.js
function camelCase(str) {
  const isCamelCase = str !== str.toLowerCase() && str !== str.toUpperCase();
  if (!isCamelCase) {
    str = str.toLowerCase();
  }
  if (str.indexOf("-") === -1 && str.indexOf("_") === -1) {
    return str;
  } else {
    let camelcase = "";
    let nextChrUpper = false;
    const leadingHyphens = str.match(/^-+/);
    for (let i = leadingHyphens ? leadingHyphens[0].length : 0;i < str.length; i++) {
      let chr = str.charAt(i);
      if (nextChrUpper) {
        nextChrUpper = false;
        chr = chr.toUpperCase();
      }
      if (i !== 0 && (chr === "-" || chr === "_")) {
        nextChrUpper = true;
      } else if (chr !== "-" && chr !== "_") {
        camelcase += chr;
      }
    }
    return camelcase;
  }
}
function decamelize(str, joinString) {
  const lowercase = str.toLowerCase();
  joinString = joinString || "-";
  let notCamelcase = "";
  for (let i = 0;i < str.length; i++) {
    const chrLower = lowercase.charAt(i);
    const chrString = str.charAt(i);
    if (chrLower !== chrString && i > 0) {
      notCamelcase += `${joinString}${lowercase.charAt(i)}`;
    } else {
      notCamelcase += chrString;
    }
  }
  return notCamelcase;
}
function looksLikeNumber(x) {
  if (x === null || x === undefined)
    return false;
  if (typeof x === "number")
    return true;
  if (/^0x[0-9a-f]+$/i.test(x))
    return true;
  if (/^0[^.]/.test(x))
    return false;
  return /^[-]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}

// node_modules/yargs-parser/build/lib/tokenize-arg-string.js
function tokenizeArgString(argString) {
  if (Array.isArray(argString)) {
    return argString.map((e) => typeof e !== "string" ? e + "" : e);
  }
  argString = argString.trim();
  let i = 0;
  let prevC = null;
  let c = null;
  let opening = null;
  const args = [];
  for (let ii = 0;ii < argString.length; ii++) {
    prevC = c;
    c = argString.charAt(ii);
    if (c === " " && !opening) {
      if (!(prevC === " ")) {
        i++;
      }
      continue;
    }
    if (c === opening) {
      opening = null;
    } else if ((c === "'" || c === '"') && !opening) {
      opening = c;
    }
    if (!args[i])
      args[i] = "";
    args[i] += c;
  }
  return args;
}

// node_modules/yargs-parser/build/lib/yargs-parser-types.js
var DefaultValuesForTypeKey;
(function(DefaultValuesForTypeKey2) {
  DefaultValuesForTypeKey2["BOOLEAN"] = "boolean";
  DefaultValuesForTypeKey2["STRING"] = "string";
  DefaultValuesForTypeKey2["NUMBER"] = "number";
  DefaultValuesForTypeKey2["ARRAY"] = "array";
})(DefaultValuesForTypeKey || (DefaultValuesForTypeKey = {}));

// node_modules/yargs-parser/build/lib/yargs-parser.js
var mixin;

class YargsParser {
  constructor(_mixin) {
    mixin = _mixin;
  }
  parse(argsInput, options) {
    const opts = Object.assign({
      alias: undefined,
      array: undefined,
      boolean: undefined,
      config: undefined,
      configObjects: undefined,
      configuration: undefined,
      coerce: undefined,
      count: undefined,
      default: undefined,
      envPrefix: undefined,
      narg: undefined,
      normalize: undefined,
      string: undefined,
      number: undefined,
      __: undefined,
      key: undefined
    }, options);
    const args = tokenizeArgString(argsInput);
    const inputIsString = typeof argsInput === "string";
    const aliases = combineAliases(Object.assign(Object.create(null), opts.alias));
    const configuration = Object.assign({
      "boolean-negation": true,
      "camel-case-expansion": true,
      "combine-arrays": false,
      "dot-notation": true,
      "duplicate-arguments-array": true,
      "flatten-duplicate-arrays": true,
      "greedy-arrays": true,
      "halt-at-non-option": false,
      "nargs-eats-options": false,
      "negation-prefix": "no-",
      "parse-numbers": true,
      "parse-positional-numbers": true,
      "populate--": false,
      "set-placeholder-key": false,
      "short-option-groups": true,
      "strip-aliased": false,
      "strip-dashed": false,
      "unknown-options-as-args": false
    }, opts.configuration);
    const defaults = Object.assign(Object.create(null), opts.default);
    const configObjects = opts.configObjects || [];
    const envPrefix = opts.envPrefix;
    const notFlagsOption = configuration["populate--"];
    const notFlagsArgv = notFlagsOption ? "--" : "_";
    const newAliases = Object.create(null);
    const defaulted = Object.create(null);
    const __ = opts.__ || mixin.format;
    const flags = {
      aliases: Object.create(null),
      arrays: Object.create(null),
      bools: Object.create(null),
      strings: Object.create(null),
      numbers: Object.create(null),
      counts: Object.create(null),
      normalize: Object.create(null),
      configs: Object.create(null),
      nargs: Object.create(null),
      coercions: Object.create(null),
      keys: []
    };
    const negative = /^-([0-9]+(\.[0-9]+)?|\.[0-9]+)$/;
    const negatedBoolean = new RegExp("^--" + configuration["negation-prefix"] + "(.+)");
    [].concat(opts.array || []).filter(Boolean).forEach(function(opt) {
      const key = typeof opt === "object" ? opt.key : opt;
      const assignment = Object.keys(opt).map(function(key2) {
        const arrayFlagKeys = {
          boolean: "bools",
          string: "strings",
          number: "numbers"
        };
        return arrayFlagKeys[key2];
      }).filter(Boolean).pop();
      if (assignment) {
        flags[assignment][key] = true;
      }
      flags.arrays[key] = true;
      flags.keys.push(key);
    });
    [].concat(opts.boolean || []).filter(Boolean).forEach(function(key) {
      flags.bools[key] = true;
      flags.keys.push(key);
    });
    [].concat(opts.string || []).filter(Boolean).forEach(function(key) {
      flags.strings[key] = true;
      flags.keys.push(key);
    });
    [].concat(opts.number || []).filter(Boolean).forEach(function(key) {
      flags.numbers[key] = true;
      flags.keys.push(key);
    });
    [].concat(opts.count || []).filter(Boolean).forEach(function(key) {
      flags.counts[key] = true;
      flags.keys.push(key);
    });
    [].concat(opts.normalize || []).filter(Boolean).forEach(function(key) {
      flags.normalize[key] = true;
      flags.keys.push(key);
    });
    if (typeof opts.narg === "object") {
      Object.entries(opts.narg).forEach(([key, value]) => {
        if (typeof value === "number") {
          flags.nargs[key] = value;
          flags.keys.push(key);
        }
      });
    }
    if (typeof opts.coerce === "object") {
      Object.entries(opts.coerce).forEach(([key, value]) => {
        if (typeof value === "function") {
          flags.coercions[key] = value;
          flags.keys.push(key);
        }
      });
    }
    if (typeof opts.config !== "undefined") {
      if (Array.isArray(opts.config) || typeof opts.config === "string") {
        [].concat(opts.config).filter(Boolean).forEach(function(key) {
          flags.configs[key] = true;
        });
      } else if (typeof opts.config === "object") {
        Object.entries(opts.config).forEach(([key, value]) => {
          if (typeof value === "boolean" || typeof value === "function") {
            flags.configs[key] = value;
          }
        });
      }
    }
    extendAliases(opts.key, aliases, opts.default, flags.arrays);
    Object.keys(defaults).forEach(function(key) {
      (flags.aliases[key] || []).forEach(function(alias) {
        defaults[alias] = defaults[key];
      });
    });
    let error = null;
    checkConfiguration();
    let notFlags = [];
    const argv = Object.assign(Object.create(null), { _: [] });
    const argvReturn = {};
    for (let i = 0;i < args.length; i++) {
      const arg = args[i];
      const truncatedArg = arg.replace(/^-{3,}/, "---");
      let broken;
      let key;
      let letters;
      let m;
      let next;
      let value;
      if (arg !== "--" && /^-/.test(arg) && isUnknownOptionAsArg(arg)) {
        pushPositional(arg);
      } else if (truncatedArg.match(/^---+(=|$)/)) {
        pushPositional(arg);
        continue;
      } else if (arg.match(/^--.+=/) || !configuration["short-option-groups"] && arg.match(/^-.+=/)) {
        m = arg.match(/^--?([^=]+)=([\s\S]*)$/);
        if (m !== null && Array.isArray(m) && m.length >= 3) {
          if (checkAllAliases(m[1], flags.arrays)) {
            i = eatArray(i, m[1], args, m[2]);
          } else if (checkAllAliases(m[1], flags.nargs) !== false) {
            i = eatNargs(i, m[1], args, m[2]);
          } else {
            setArg(m[1], m[2], true);
          }
        }
      } else if (arg.match(negatedBoolean) && configuration["boolean-negation"]) {
        m = arg.match(negatedBoolean);
        if (m !== null && Array.isArray(m) && m.length >= 2) {
          key = m[1];
          setArg(key, checkAllAliases(key, flags.arrays) ? [false] : false);
        }
      } else if (arg.match(/^--.+/) || !configuration["short-option-groups"] && arg.match(/^-[^-]+/)) {
        m = arg.match(/^--?(.+)/);
        if (m !== null && Array.isArray(m) && m.length >= 2) {
          key = m[1];
          if (checkAllAliases(key, flags.arrays)) {
            i = eatArray(i, key, args);
          } else if (checkAllAliases(key, flags.nargs) !== false) {
            i = eatNargs(i, key, args);
          } else {
            next = args[i + 1];
            if (next !== undefined && (!next.match(/^-/) || next.match(negative)) && !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts)) {
              setArg(key, next);
              i++;
            } else if (/^(true|false)$/.test(next)) {
              setArg(key, next);
              i++;
            } else {
              setArg(key, defaultValue(key));
            }
          }
        }
      } else if (arg.match(/^-.\..+=/)) {
        m = arg.match(/^-([^=]+)=([\s\S]*)$/);
        if (m !== null && Array.isArray(m) && m.length >= 3) {
          setArg(m[1], m[2]);
        }
      } else if (arg.match(/^-.\..+/) && !arg.match(negative)) {
        next = args[i + 1];
        m = arg.match(/^-(.\..+)/);
        if (m !== null && Array.isArray(m) && m.length >= 2) {
          key = m[1];
          if (next !== undefined && !next.match(/^-/) && !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts)) {
            setArg(key, next);
            i++;
          } else {
            setArg(key, defaultValue(key));
          }
        }
      } else if (arg.match(/^-[^-]+/) && !arg.match(negative)) {
        letters = arg.slice(1, -1).split("");
        broken = false;
        for (let j = 0;j < letters.length; j++) {
          next = arg.slice(j + 2);
          if (letters[j + 1] && letters[j + 1] === "=") {
            value = arg.slice(j + 3);
            key = letters[j];
            if (checkAllAliases(key, flags.arrays)) {
              i = eatArray(i, key, args, value);
            } else if (checkAllAliases(key, flags.nargs) !== false) {
              i = eatNargs(i, key, args, value);
            } else {
              setArg(key, value);
            }
            broken = true;
            break;
          }
          if (next === "-") {
            setArg(letters[j], next);
            continue;
          }
          if (/[A-Za-z]/.test(letters[j]) && /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next) && checkAllAliases(next, flags.bools) === false) {
            setArg(letters[j], next);
            broken = true;
            break;
          }
          if (letters[j + 1] && letters[j + 1].match(/\W/)) {
            setArg(letters[j], next);
            broken = true;
            break;
          } else {
            setArg(letters[j], defaultValue(letters[j]));
          }
        }
        key = arg.slice(-1)[0];
        if (!broken && key !== "-") {
          if (checkAllAliases(key, flags.arrays)) {
            i = eatArray(i, key, args);
          } else if (checkAllAliases(key, flags.nargs) !== false) {
            i = eatNargs(i, key, args);
          } else {
            next = args[i + 1];
            if (next !== undefined && (!/^(-|--)[^-]/.test(next) || next.match(negative)) && !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts)) {
              setArg(key, next);
              i++;
            } else if (/^(true|false)$/.test(next)) {
              setArg(key, next);
              i++;
            } else {
              setArg(key, defaultValue(key));
            }
          }
        }
      } else if (arg.match(/^-[0-9]$/) && arg.match(negative) && checkAllAliases(arg.slice(1), flags.bools)) {
        key = arg.slice(1);
        setArg(key, defaultValue(key));
      } else if (arg === "--") {
        notFlags = args.slice(i + 1);
        break;
      } else if (configuration["halt-at-non-option"]) {
        notFlags = args.slice(i);
        break;
      } else {
        pushPositional(arg);
      }
    }
    applyEnvVars(argv, true);
    applyEnvVars(argv, false);
    setConfig(argv);
    setConfigObjects();
    applyDefaultsAndAliases(argv, flags.aliases, defaults, true);
    applyCoercions(argv);
    if (configuration["set-placeholder-key"])
      setPlaceholderKeys(argv);
    Object.keys(flags.counts).forEach(function(key) {
      if (!hasKey(argv, key.split(".")))
        setArg(key, 0);
    });
    if (notFlagsOption && notFlags.length)
      argv[notFlagsArgv] = [];
    notFlags.forEach(function(key) {
      argv[notFlagsArgv].push(key);
    });
    if (configuration["camel-case-expansion"] && configuration["strip-dashed"]) {
      Object.keys(argv).filter((key) => key !== "--" && key.includes("-")).forEach((key) => {
        delete argv[key];
      });
    }
    if (configuration["strip-aliased"]) {
      [].concat(...Object.keys(aliases).map((k) => aliases[k])).forEach((alias) => {
        if (configuration["camel-case-expansion"] && alias.includes("-")) {
          delete argv[alias.split(".").map((prop) => camelCase(prop)).join(".")];
        }
        delete argv[alias];
      });
    }
    function pushPositional(arg) {
      const maybeCoercedNumber = maybeCoerceNumber("_", arg);
      if (typeof maybeCoercedNumber === "string" || typeof maybeCoercedNumber === "number") {
        argv._.push(maybeCoercedNumber);
      }
    }
    function eatNargs(i, key, args2, argAfterEqualSign) {
      let ii;
      let toEat = checkAllAliases(key, flags.nargs);
      toEat = typeof toEat !== "number" || isNaN(toEat) ? 1 : toEat;
      if (toEat === 0) {
        if (!isUndefined(argAfterEqualSign)) {
          error = Error(__("Argument unexpected for: %s", key));
        }
        setArg(key, defaultValue(key));
        return i;
      }
      let available = isUndefined(argAfterEqualSign) ? 0 : 1;
      if (configuration["nargs-eats-options"]) {
        if (args2.length - (i + 1) + available < toEat) {
          error = Error(__("Not enough arguments following: %s", key));
        }
        available = toEat;
      } else {
        for (ii = i + 1;ii < args2.length; ii++) {
          if (!args2[ii].match(/^-[^0-9]/) || args2[ii].match(negative) || isUnknownOptionAsArg(args2[ii]))
            available++;
          else
            break;
        }
        if (available < toEat)
          error = Error(__("Not enough arguments following: %s", key));
      }
      let consumed = Math.min(available, toEat);
      if (!isUndefined(argAfterEqualSign) && consumed > 0) {
        setArg(key, argAfterEqualSign);
        consumed--;
      }
      for (ii = i + 1;ii < consumed + i + 1; ii++) {
        setArg(key, args2[ii]);
      }
      return i + consumed;
    }
    function eatArray(i, key, args2, argAfterEqualSign) {
      let argsToSet = [];
      let next = argAfterEqualSign || args2[i + 1];
      const nargsCount = checkAllAliases(key, flags.nargs);
      if (checkAllAliases(key, flags.bools) && !/^(true|false)$/.test(next)) {
        argsToSet.push(true);
      } else if (isUndefined(next) || isUndefined(argAfterEqualSign) && /^-/.test(next) && !negative.test(next) && !isUnknownOptionAsArg(next)) {
        if (defaults[key] !== undefined) {
          const defVal = defaults[key];
          argsToSet = Array.isArray(defVal) ? defVal : [defVal];
        }
      } else {
        if (!isUndefined(argAfterEqualSign)) {
          argsToSet.push(processValue(key, argAfterEqualSign, true));
        }
        for (let ii = i + 1;ii < args2.length; ii++) {
          if (!configuration["greedy-arrays"] && argsToSet.length > 0 || nargsCount && typeof nargsCount === "number" && argsToSet.length >= nargsCount)
            break;
          next = args2[ii];
          if (/^-/.test(next) && !negative.test(next) && !isUnknownOptionAsArg(next))
            break;
          i = ii;
          argsToSet.push(processValue(key, next, inputIsString));
        }
      }
      if (typeof nargsCount === "number" && (nargsCount && argsToSet.length < nargsCount || isNaN(nargsCount) && argsToSet.length === 0)) {
        error = Error(__("Not enough arguments following: %s", key));
      }
      setArg(key, argsToSet);
      return i;
    }
    function setArg(key, val, shouldStripQuotes = inputIsString) {
      if (/-/.test(key) && configuration["camel-case-expansion"]) {
        const alias = key.split(".").map(function(prop) {
          return camelCase(prop);
        }).join(".");
        addNewAlias(key, alias);
      }
      const value = processValue(key, val, shouldStripQuotes);
      const splitKey = key.split(".");
      setKey(argv, splitKey, value);
      if (flags.aliases[key]) {
        flags.aliases[key].forEach(function(x) {
          const keyProperties = x.split(".");
          setKey(argv, keyProperties, value);
        });
      }
      if (splitKey.length > 1 && configuration["dot-notation"]) {
        (flags.aliases[splitKey[0]] || []).forEach(function(x) {
          let keyProperties = x.split(".");
          const a = [].concat(splitKey);
          a.shift();
          keyProperties = keyProperties.concat(a);
          if (!(flags.aliases[key] || []).includes(keyProperties.join("."))) {
            setKey(argv, keyProperties, value);
          }
        });
      }
      if (checkAllAliases(key, flags.normalize) && !checkAllAliases(key, flags.arrays)) {
        const keys = [key].concat(flags.aliases[key] || []);
        keys.forEach(function(key2) {
          Object.defineProperty(argvReturn, key2, {
            enumerable: true,
            get() {
              return val;
            },
            set(value2) {
              val = typeof value2 === "string" ? mixin.normalize(value2) : value2;
            }
          });
        });
      }
    }
    function addNewAlias(key, alias) {
      if (!(flags.aliases[key] && flags.aliases[key].length)) {
        flags.aliases[key] = [alias];
        newAliases[alias] = true;
      }
      if (!(flags.aliases[alias] && flags.aliases[alias].length)) {
        addNewAlias(alias, key);
      }
    }
    function processValue(key, val, shouldStripQuotes) {
      if (shouldStripQuotes) {
        val = stripQuotes(val);
      }
      if (checkAllAliases(key, flags.bools) || checkAllAliases(key, flags.counts)) {
        if (typeof val === "string")
          val = val === "true";
      }
      let value = Array.isArray(val) ? val.map(function(v) {
        return maybeCoerceNumber(key, v);
      }) : maybeCoerceNumber(key, val);
      if (checkAllAliases(key, flags.counts) && (isUndefined(value) || typeof value === "boolean")) {
        value = increment();
      }
      if (checkAllAliases(key, flags.normalize) && checkAllAliases(key, flags.arrays)) {
        if (Array.isArray(val))
          value = val.map((val2) => {
            return mixin.normalize(val2);
          });
        else
          value = mixin.normalize(val);
      }
      return value;
    }
    function maybeCoerceNumber(key, value) {
      if (!configuration["parse-positional-numbers"] && key === "_")
        return value;
      if (!checkAllAliases(key, flags.strings) && !checkAllAliases(key, flags.bools) && !Array.isArray(value)) {
        const shouldCoerceNumber = looksLikeNumber(value) && configuration["parse-numbers"] && Number.isSafeInteger(Math.floor(parseFloat(`${value}`)));
        if (shouldCoerceNumber || !isUndefined(value) && checkAllAliases(key, flags.numbers)) {
          value = Number(value);
        }
      }
      return value;
    }
    function setConfig(argv2) {
      const configLookup = Object.create(null);
      applyDefaultsAndAliases(configLookup, flags.aliases, defaults);
      Object.keys(flags.configs).forEach(function(configKey) {
        const configPath = argv2[configKey] || configLookup[configKey];
        if (configPath) {
          try {
            let config = null;
            const resolvedConfigPath = mixin.resolve(mixin.cwd(), configPath);
            const resolveConfig = flags.configs[configKey];
            if (typeof resolveConfig === "function") {
              try {
                config = resolveConfig(resolvedConfigPath);
              } catch (e) {
                config = e;
              }
              if (config instanceof Error) {
                error = config;
                return;
              }
            } else {
              config = mixin.require(resolvedConfigPath);
            }
            setConfigObject(config);
          } catch (ex) {
            if (ex.name === "PermissionDenied")
              error = ex;
            else if (argv2[configKey])
              error = Error(__("Invalid JSON config file: %s", configPath));
          }
        }
      });
    }
    function setConfigObject(config, prev) {
      Object.keys(config).forEach(function(key) {
        const value = config[key];
        const fullKey = prev ? prev + "." + key : key;
        if (typeof value === "object" && value !== null && !Array.isArray(value) && configuration["dot-notation"]) {
          setConfigObject(value, fullKey);
        } else {
          if (!hasKey(argv, fullKey.split(".")) || checkAllAliases(fullKey, flags.arrays) && configuration["combine-arrays"]) {
            setArg(fullKey, value);
          }
        }
      });
    }
    function setConfigObjects() {
      if (typeof configObjects !== "undefined") {
        configObjects.forEach(function(configObject) {
          setConfigObject(configObject);
        });
      }
    }
    function applyEnvVars(argv2, configOnly) {
      if (typeof envPrefix === "undefined")
        return;
      const prefix = typeof envPrefix === "string" ? envPrefix : "";
      const env = mixin.env();
      Object.keys(env).forEach(function(envVar) {
        if (prefix === "" || envVar.lastIndexOf(prefix, 0) === 0) {
          const keys = envVar.split("__").map(function(key, i) {
            if (i === 0) {
              key = key.substring(prefix.length);
            }
            return camelCase(key);
          });
          if ((configOnly && flags.configs[keys.join(".")] || !configOnly) && !hasKey(argv2, keys)) {
            setArg(keys.join("."), env[envVar]);
          }
        }
      });
    }
    function applyCoercions(argv2) {
      let coerce2;
      const applied = new Set;
      Object.keys(argv2).forEach(function(key) {
        if (!applied.has(key)) {
          coerce2 = checkAllAliases(key, flags.coercions);
          if (typeof coerce2 === "function") {
            try {
              const value = maybeCoerceNumber(key, coerce2(argv2[key]));
              [].concat(flags.aliases[key] || [], key).forEach((ali) => {
                applied.add(ali);
                argv2[ali] = value;
              });
            } catch (err) {
              error = err;
            }
          }
        }
      });
    }
    function setPlaceholderKeys(argv2) {
      flags.keys.forEach((key) => {
        if (~key.indexOf("."))
          return;
        if (typeof argv2[key] === "undefined")
          argv2[key] = undefined;
      });
      return argv2;
    }
    function applyDefaultsAndAliases(obj, aliases2, defaults2, canLog = false) {
      Object.keys(defaults2).forEach(function(key) {
        if (!hasKey(obj, key.split("."))) {
          setKey(obj, key.split("."), defaults2[key]);
          if (canLog)
            defaulted[key] = true;
          (aliases2[key] || []).forEach(function(x) {
            if (hasKey(obj, x.split(".")))
              return;
            setKey(obj, x.split("."), defaults2[key]);
          });
        }
      });
    }
    function hasKey(obj, keys) {
      let o = obj;
      if (!configuration["dot-notation"])
        keys = [keys.join(".")];
      keys.slice(0, -1).forEach(function(key2) {
        o = o[key2] || {};
      });
      const key = keys[keys.length - 1];
      if (typeof o !== "object")
        return false;
      else
        return key in o;
    }
    function setKey(obj, keys, value) {
      let o = obj;
      if (!configuration["dot-notation"])
        keys = [keys.join(".")];
      keys.slice(0, -1).forEach(function(key2) {
        key2 = sanitizeKey(key2);
        if (typeof o === "object" && o[key2] === undefined) {
          o[key2] = {};
        }
        if (typeof o[key2] !== "object" || Array.isArray(o[key2])) {
          if (Array.isArray(o[key2])) {
            o[key2].push({});
          } else {
            o[key2] = [o[key2], {}];
          }
          o = o[key2][o[key2].length - 1];
        } else {
          o = o[key2];
        }
      });
      const key = sanitizeKey(keys[keys.length - 1]);
      const isTypeArray = checkAllAliases(keys.join("."), flags.arrays);
      const isValueArray = Array.isArray(value);
      let duplicate = configuration["duplicate-arguments-array"];
      if (!duplicate && checkAllAliases(key, flags.nargs)) {
        duplicate = true;
        if (!isUndefined(o[key]) && flags.nargs[key] === 1 || Array.isArray(o[key]) && o[key].length === flags.nargs[key]) {
          o[key] = undefined;
        }
      }
      if (value === increment()) {
        o[key] = increment(o[key]);
      } else if (Array.isArray(o[key])) {
        if (duplicate && isTypeArray && isValueArray) {
          o[key] = configuration["flatten-duplicate-arrays"] ? o[key].concat(value) : (Array.isArray(o[key][0]) ? o[key] : [o[key]]).concat([value]);
        } else if (!duplicate && Boolean(isTypeArray) === Boolean(isValueArray)) {
          o[key] = value;
        } else {
          o[key] = o[key].concat([value]);
        }
      } else if (o[key] === undefined && isTypeArray) {
        o[key] = isValueArray ? value : [value];
      } else if (duplicate && !(o[key] === undefined || checkAllAliases(key, flags.counts) || checkAllAliases(key, flags.bools))) {
        o[key] = [o[key], value];
      } else {
        o[key] = value;
      }
    }
    function extendAliases(...args2) {
      args2.forEach(function(obj) {
        Object.keys(obj || {}).forEach(function(key) {
          if (flags.aliases[key])
            return;
          flags.aliases[key] = [].concat(aliases[key] || []);
          flags.aliases[key].concat(key).forEach(function(x) {
            if (/-/.test(x) && configuration["camel-case-expansion"]) {
              const c = camelCase(x);
              if (c !== key && flags.aliases[key].indexOf(c) === -1) {
                flags.aliases[key].push(c);
                newAliases[c] = true;
              }
            }
          });
          flags.aliases[key].concat(key).forEach(function(x) {
            if (x.length > 1 && /[A-Z]/.test(x) && configuration["camel-case-expansion"]) {
              const c = decamelize(x, "-");
              if (c !== key && flags.aliases[key].indexOf(c) === -1) {
                flags.aliases[key].push(c);
                newAliases[c] = true;
              }
            }
          });
          flags.aliases[key].forEach(function(x) {
            flags.aliases[x] = [key].concat(flags.aliases[key].filter(function(y) {
              return x !== y;
            }));
          });
        });
      });
    }
    function checkAllAliases(key, flag) {
      const toCheck = [].concat(flags.aliases[key] || [], key);
      const keys = Object.keys(flag);
      const setAlias = toCheck.find((key2) => keys.includes(key2));
      return setAlias ? flag[setAlias] : false;
    }
    function hasAnyFlag(key) {
      const flagsKeys = Object.keys(flags);
      const toCheck = [].concat(flagsKeys.map((k) => flags[k]));
      return toCheck.some(function(flag) {
        return Array.isArray(flag) ? flag.includes(key) : flag[key];
      });
    }
    function hasFlagsMatching(arg, ...patterns) {
      const toCheck = [].concat(...patterns);
      return toCheck.some(function(pattern) {
        const match = arg.match(pattern);
        return match && hasAnyFlag(match[1]);
      });
    }
    function hasAllShortFlags(arg) {
      if (arg.match(negative) || !arg.match(/^-[^-]+/)) {
        return false;
      }
      let hasAllFlags = true;
      let next;
      const letters = arg.slice(1).split("");
      for (let j = 0;j < letters.length; j++) {
        next = arg.slice(j + 2);
        if (!hasAnyFlag(letters[j])) {
          hasAllFlags = false;
          break;
        }
        if (letters[j + 1] && letters[j + 1] === "=" || next === "-" || /[A-Za-z]/.test(letters[j]) && /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next) || letters[j + 1] && letters[j + 1].match(/\W/)) {
          break;
        }
      }
      return hasAllFlags;
    }
    function isUnknownOptionAsArg(arg) {
      return configuration["unknown-options-as-args"] && isUnknownOption(arg);
    }
    function isUnknownOption(arg) {
      arg = arg.replace(/^-{3,}/, "--");
      if (arg.match(negative)) {
        return false;
      }
      if (hasAllShortFlags(arg)) {
        return false;
      }
      const flagWithEquals = /^-+([^=]+?)=[\s\S]*$/;
      const normalFlag = /^-+([^=]+?)$/;
      const flagEndingInHyphen = /^-+([^=]+?)-$/;
      const flagEndingInDigits = /^-+([^=]+?\d+)$/;
      const flagEndingInNonWordCharacters = /^-+([^=]+?)\W+.*$/;
      return !hasFlagsMatching(arg, flagWithEquals, negatedBoolean, normalFlag, flagEndingInHyphen, flagEndingInDigits, flagEndingInNonWordCharacters);
    }
    function defaultValue(key) {
      if (!checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts) && `${key}` in defaults) {
        return defaults[key];
      } else {
        return defaultForType(guessType(key));
      }
    }
    function defaultForType(type) {
      const def = {
        [DefaultValuesForTypeKey.BOOLEAN]: true,
        [DefaultValuesForTypeKey.STRING]: "",
        [DefaultValuesForTypeKey.NUMBER]: undefined,
        [DefaultValuesForTypeKey.ARRAY]: []
      };
      return def[type];
    }
    function guessType(key) {
      let type = DefaultValuesForTypeKey.BOOLEAN;
      if (checkAllAliases(key, flags.strings))
        type = DefaultValuesForTypeKey.STRING;
      else if (checkAllAliases(key, flags.numbers))
        type = DefaultValuesForTypeKey.NUMBER;
      else if (checkAllAliases(key, flags.bools))
        type = DefaultValuesForTypeKey.BOOLEAN;
      else if (checkAllAliases(key, flags.arrays))
        type = DefaultValuesForTypeKey.ARRAY;
      return type;
    }
    function isUndefined(num) {
      return num === undefined;
    }
    function checkConfiguration() {
      Object.keys(flags.counts).find((key) => {
        if (checkAllAliases(key, flags.arrays)) {
          error = Error(__("Invalid configuration: %s, opts.count excludes opts.array.", key));
          return true;
        } else if (checkAllAliases(key, flags.nargs)) {
          error = Error(__("Invalid configuration: %s, opts.count excludes opts.narg.", key));
          return true;
        }
        return false;
      });
    }
    return {
      aliases: Object.assign({}, flags.aliases),
      argv: Object.assign(argvReturn, argv),
      configuration,
      defaulted: Object.assign({}, defaulted),
      error,
      newAliases: Object.assign({}, newAliases)
    };
  }
}
function combineAliases(aliases) {
  const aliasArrays = [];
  const combined = Object.create(null);
  let change = true;
  Object.keys(aliases).forEach(function(key) {
    aliasArrays.push([].concat(aliases[key], key));
  });
  while (change) {
    change = false;
    for (let i = 0;i < aliasArrays.length; i++) {
      for (let ii = i + 1;ii < aliasArrays.length; ii++) {
        const intersect = aliasArrays[i].filter(function(v) {
          return aliasArrays[ii].indexOf(v) !== -1;
        });
        if (intersect.length) {
          aliasArrays[i] = aliasArrays[i].concat(aliasArrays[ii]);
          aliasArrays.splice(ii, 1);
          change = true;
          break;
        }
      }
    }
  }
  aliasArrays.forEach(function(aliasArray) {
    aliasArray = aliasArray.filter(function(v, i, self) {
      return self.indexOf(v) === i;
    });
    const lastAlias = aliasArray.pop();
    if (lastAlias !== undefined && typeof lastAlias === "string") {
      combined[lastAlias] = aliasArray;
    }
  });
  return combined;
}
function increment(orig) {
  return orig !== undefined ? orig + 1 : 1;
}
function sanitizeKey(key) {
  if (key === "__proto__")
    return "___proto___";
  return key;
}
function stripQuotes(val) {
  return typeof val === "string" && (val[0] === "'" || val[0] === '"') && val[val.length - 1] === val[0] ? val.substring(1, val.length - 1) : val;
}

// node_modules/yargs-parser/build/lib/index.js
var _a;
var _b;
var _c;
var minNodeVersion = process && process.env && process.env.YARGS_MIN_NODE_VERSION ? Number(process.env.YARGS_MIN_NODE_VERSION) : 12;
var nodeVersion = (_b = (_a = process === null || process === undefined ? undefined : process.versions) === null || _a === undefined ? undefined : _a.node) !== null && _b !== undefined ? _b : (_c = process === null || process === undefined ? undefined : process.version) === null || _c === undefined ? undefined : _c.slice(1);
if (nodeVersion) {
  const major = Number(nodeVersion.match(/^([^.]+)/)[1]);
  if (major < minNodeVersion) {
    throw Error(`yargs parser supports a minimum Node.js version of ${minNodeVersion}. Read our version support policy: https://github.com/yargs/yargs-parser#supported-nodejs-versions`);
  }
}
var env = process ? process.env : {};
var parser = new YargsParser({
  cwd: process.cwd,
  env: () => {
    return env;
  },
  format,
  normalize,
  resolve,
  require: (path2) => {
    if (true) {
      return __require(path2);
    } else
      ;
  }
});
var yargsParser = function Parser2(args, opts) {
  const result = parser.parse(args.slice(), opts);
  return result.argv;
};
yargsParser.detailed = function(args, opts) {
  return parser.parse(args.slice(), opts);
};
yargsParser.camelCase = camelCase;
yargsParser.decamelize = decamelize;
yargsParser.looksLikeNumber = looksLikeNumber;
var lib_default = yargsParser;

// node_modules/yargs/lib/platform-shims/esm.mjs
import { notStrictEqual, strictEqual } from "assert";

// node_modules/cliui/build/lib/index.js
var align = {
  right: alignRight,
  center: alignCenter
};
var top = 0;
var right = 1;
var bottom = 2;
var left = 3;

class UI {
  constructor(opts) {
    var _a2;
    this.width = opts.width;
    this.wrap = (_a2 = opts.wrap) !== null && _a2 !== undefined ? _a2 : true;
    this.rows = [];
  }
  span(...args) {
    const cols = this.div(...args);
    cols.span = true;
  }
  resetOutput() {
    this.rows = [];
  }
  div(...args) {
    if (args.length === 0) {
      this.div("");
    }
    if (this.wrap && this.shouldApplyLayoutDSL(...args) && typeof args[0] === "string") {
      return this.applyLayoutDSL(args[0]);
    }
    const cols = args.map((arg) => {
      if (typeof arg === "string") {
        return this.colFromString(arg);
      }
      return arg;
    });
    this.rows.push(cols);
    return cols;
  }
  shouldApplyLayoutDSL(...args) {
    return args.length === 1 && typeof args[0] === "string" && /[\t\n]/.test(args[0]);
  }
  applyLayoutDSL(str) {
    const rows = str.split(`
`).map((row) => row.split("\t"));
    let leftColumnWidth = 0;
    rows.forEach((columns) => {
      if (columns.length > 1 && mixin2.stringWidth(columns[0]) > leftColumnWidth) {
        leftColumnWidth = Math.min(Math.floor(this.width * 0.5), mixin2.stringWidth(columns[0]));
      }
    });
    rows.forEach((columns) => {
      this.div(...columns.map((r, i) => {
        return {
          text: r.trim(),
          padding: this.measurePadding(r),
          width: i === 0 && columns.length > 1 ? leftColumnWidth : undefined
        };
      }));
    });
    return this.rows[this.rows.length - 1];
  }
  colFromString(text) {
    return {
      text,
      padding: this.measurePadding(text)
    };
  }
  measurePadding(str) {
    const noAnsi = mixin2.stripAnsi(str);
    return [0, noAnsi.match(/\s*$/)[0].length, 0, noAnsi.match(/^\s*/)[0].length];
  }
  toString() {
    const lines = [];
    this.rows.forEach((row) => {
      this.rowToString(row, lines);
    });
    return lines.filter((line) => !line.hidden).map((line) => line.text).join(`
`);
  }
  rowToString(row, lines) {
    this.rasterize(row).forEach((rrow, r) => {
      let str = "";
      rrow.forEach((col, c) => {
        const { width } = row[c];
        const wrapWidth = this.negatePadding(row[c]);
        let ts = col;
        if (wrapWidth > mixin2.stringWidth(col)) {
          ts += " ".repeat(wrapWidth - mixin2.stringWidth(col));
        }
        if (row[c].align && row[c].align !== "left" && this.wrap) {
          const fn = align[row[c].align];
          ts = fn(ts, wrapWidth);
          if (mixin2.stringWidth(ts) < wrapWidth) {
            ts += " ".repeat((width || 0) - mixin2.stringWidth(ts) - 1);
          }
        }
        const padding = row[c].padding || [0, 0, 0, 0];
        if (padding[left]) {
          str += " ".repeat(padding[left]);
        }
        str += addBorder(row[c], ts, "| ");
        str += ts;
        str += addBorder(row[c], ts, " |");
        if (padding[right]) {
          str += " ".repeat(padding[right]);
        }
        if (r === 0 && lines.length > 0) {
          str = this.renderInline(str, lines[lines.length - 1]);
        }
      });
      lines.push({
        text: str.replace(/ +$/, ""),
        span: row.span
      });
    });
    return lines;
  }
  renderInline(source, previousLine) {
    const match = source.match(/^ */);
    const leadingWhitespace = match ? match[0].length : 0;
    const target = previousLine.text;
    const targetTextWidth = mixin2.stringWidth(target.trimRight());
    if (!previousLine.span) {
      return source;
    }
    if (!this.wrap) {
      previousLine.hidden = true;
      return target + source;
    }
    if (leadingWhitespace < targetTextWidth) {
      return source;
    }
    previousLine.hidden = true;
    return target.trimRight() + " ".repeat(leadingWhitespace - targetTextWidth) + source.trimLeft();
  }
  rasterize(row) {
    const rrows = [];
    const widths = this.columnWidths(row);
    let wrapped;
    row.forEach((col, c) => {
      col.width = widths[c];
      if (this.wrap) {
        wrapped = mixin2.wrap(col.text, this.negatePadding(col), { hard: true }).split(`
`);
      } else {
        wrapped = col.text.split(`
`);
      }
      if (col.border) {
        wrapped.unshift("." + "-".repeat(this.negatePadding(col) + 2) + ".");
        wrapped.push("'" + "-".repeat(this.negatePadding(col) + 2) + "'");
      }
      if (col.padding) {
        wrapped.unshift(...new Array(col.padding[top] || 0).fill(""));
        wrapped.push(...new Array(col.padding[bottom] || 0).fill(""));
      }
      wrapped.forEach((str, r) => {
        if (!rrows[r]) {
          rrows.push([]);
        }
        const rrow = rrows[r];
        for (let i = 0;i < c; i++) {
          if (rrow[i] === undefined) {
            rrow.push("");
          }
        }
        rrow.push(str);
      });
    });
    return rrows;
  }
  negatePadding(col) {
    let wrapWidth = col.width || 0;
    if (col.padding) {
      wrapWidth -= (col.padding[left] || 0) + (col.padding[right] || 0);
    }
    if (col.border) {
      wrapWidth -= 4;
    }
    return wrapWidth;
  }
  columnWidths(row) {
    if (!this.wrap) {
      return row.map((col) => {
        return col.width || mixin2.stringWidth(col.text);
      });
    }
    let unset = row.length;
    let remainingWidth = this.width;
    const widths = row.map((col) => {
      if (col.width) {
        unset--;
        remainingWidth -= col.width;
        return col.width;
      }
      return;
    });
    const unsetWidth = unset ? Math.floor(remainingWidth / unset) : 0;
    return widths.map((w, i) => {
      if (w === undefined) {
        return Math.max(unsetWidth, _minWidth(row[i]));
      }
      return w;
    });
  }
}
function addBorder(col, ts, style) {
  if (col.border) {
    if (/[.']-+[.']/.test(ts)) {
      return "";
    }
    if (ts.trim().length !== 0) {
      return style;
    }
    return "  ";
  }
  return "";
}
function _minWidth(col) {
  const padding = col.padding || [];
  const minWidth = 1 + (padding[left] || 0) + (padding[right] || 0);
  if (col.border) {
    return minWidth + 4;
  }
  return minWidth;
}
function getWindowWidth() {
  if (typeof process === "object" && process.stdout && process.stdout.columns) {
    return process.stdout.columns;
  }
  return 80;
}
function alignRight(str, width) {
  str = str.trim();
  const strWidth = mixin2.stringWidth(str);
  if (strWidth < width) {
    return " ".repeat(width - strWidth) + str;
  }
  return str;
}
function alignCenter(str, width) {
  str = str.trim();
  const strWidth = mixin2.stringWidth(str);
  if (strWidth >= width) {
    return str;
  }
  return " ".repeat(width - strWidth >> 1) + str;
}
var mixin2;
function cliui(opts, _mixin) {
  mixin2 = _mixin;
  return new UI({
    width: (opts === null || opts === undefined ? undefined : opts.width) || getWindowWidth(),
    wrap: opts === null || opts === undefined ? undefined : opts.wrap
  });
}

// node_modules/cliui/build/lib/string-utils.js
var ansi = new RegExp("\x1B(?:\\[(?:\\d+[ABCDEFGJKSTm]|\\d+;\\d+[Hfm]|" + "\\d+;\\d+;\\d+m|6n|s|u|\\?25[lh])|\\w)", "g");
function stripAnsi(str) {
  return str.replace(ansi, "");
}
function wrap(str, width) {
  const [start, end] = str.match(ansi) || ["", ""];
  str = stripAnsi(str);
  let wrapped = "";
  for (let i = 0;i < str.length; i++) {
    if (i !== 0 && i % width === 0) {
      wrapped += `
`;
    }
    wrapped += str.charAt(i);
  }
  if (start && end) {
    wrapped = `${start}${wrapped}${end}`;
  }
  return wrapped;
}

// node_modules/cliui/index.mjs
function ui(opts) {
  return cliui(opts, {
    stringWidth: (str) => {
      return [...str].length;
    },
    stripAnsi,
    wrap
  });
}

// node_modules/escalade/sync/index.mjs
import { dirname, resolve as resolve2 } from "path";
import { readdirSync, statSync } from "fs";
function sync_default(start, callback) {
  let dir = resolve2(".", start);
  let tmp, stats = statSync(dir);
  if (!stats.isDirectory()) {
    dir = dirname(dir);
  }
  while (true) {
    tmp = callback(dir, readdirSync(dir));
    if (tmp)
      return resolve2(dir, tmp);
    dir = dirname(tmp = dir);
    if (tmp === dir)
      break;
  }
}

// node_modules/yargs/lib/platform-shims/esm.mjs
import { inspect } from "util";
import { readFileSync as readFileSync2 } from "fs";
import { fileURLToPath } from "url";
import { basename, dirname as dirname2, extname, relative, resolve as resolve4 } from "path";

// node_modules/y18n/build/lib/platform-shims/node.js
import { readFileSync, statSync as statSync2, writeFile } from "fs";
import { format as format2 } from "util";
import { resolve as resolve3 } from "path";
var node_default = {
  fs: {
    readFileSync,
    writeFile
  },
  format: format2,
  resolve: resolve3,
  exists: (file) => {
    try {
      return statSync2(file).isFile();
    } catch (err) {
      return false;
    }
  }
};

// node_modules/y18n/build/lib/index.js
var shim;

class Y18N {
  constructor(opts) {
    opts = opts || {};
    this.directory = opts.directory || "./locales";
    this.updateFiles = typeof opts.updateFiles === "boolean" ? opts.updateFiles : true;
    this.locale = opts.locale || "en";
    this.fallbackToLanguage = typeof opts.fallbackToLanguage === "boolean" ? opts.fallbackToLanguage : true;
    this.cache = Object.create(null);
    this.writeQueue = [];
  }
  __(...args) {
    if (typeof arguments[0] !== "string") {
      return this._taggedLiteral(arguments[0], ...arguments);
    }
    const str = args.shift();
    let cb = function() {
    };
    if (typeof args[args.length - 1] === "function")
      cb = args.pop();
    cb = cb || function() {
    };
    if (!this.cache[this.locale])
      this._readLocaleFile();
    if (!this.cache[this.locale][str] && this.updateFiles) {
      this.cache[this.locale][str] = str;
      this._enqueueWrite({
        directory: this.directory,
        locale: this.locale,
        cb
      });
    } else {
      cb();
    }
    return shim.format.apply(shim.format, [this.cache[this.locale][str] || str].concat(args));
  }
  __n() {
    const args = Array.prototype.slice.call(arguments);
    const singular = args.shift();
    const plural = args.shift();
    const quantity = args.shift();
    let cb = function() {
    };
    if (typeof args[args.length - 1] === "function")
      cb = args.pop();
    if (!this.cache[this.locale])
      this._readLocaleFile();
    let str = quantity === 1 ? singular : plural;
    if (this.cache[this.locale][singular]) {
      const entry = this.cache[this.locale][singular];
      str = entry[quantity === 1 ? "one" : "other"];
    }
    if (!this.cache[this.locale][singular] && this.updateFiles) {
      this.cache[this.locale][singular] = {
        one: singular,
        other: plural
      };
      this._enqueueWrite({
        directory: this.directory,
        locale: this.locale,
        cb
      });
    } else {
      cb();
    }
    const values = [str];
    if (~str.indexOf("%d"))
      values.push(quantity);
    return shim.format.apply(shim.format, values.concat(args));
  }
  setLocale(locale) {
    this.locale = locale;
  }
  getLocale() {
    return this.locale;
  }
  updateLocale(obj) {
    if (!this.cache[this.locale])
      this._readLocaleFile();
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        this.cache[this.locale][key] = obj[key];
      }
    }
  }
  _taggedLiteral(parts, ...args) {
    let str = "";
    parts.forEach(function(part, i) {
      const arg = args[i + 1];
      str += part;
      if (typeof arg !== "undefined") {
        str += "%s";
      }
    });
    return this.__.apply(this, [str].concat([].slice.call(args, 1)));
  }
  _enqueueWrite(work) {
    this.writeQueue.push(work);
    if (this.writeQueue.length === 1)
      this._processWriteQueue();
  }
  _processWriteQueue() {
    const _this = this;
    const work = this.writeQueue[0];
    const directory = work.directory;
    const locale = work.locale;
    const cb = work.cb;
    const languageFile = this._resolveLocaleFile(directory, locale);
    const serializedLocale = JSON.stringify(this.cache[locale], null, 2);
    shim.fs.writeFile(languageFile, serializedLocale, "utf-8", function(err) {
      _this.writeQueue.shift();
      if (_this.writeQueue.length > 0)
        _this._processWriteQueue();
      cb(err);
    });
  }
  _readLocaleFile() {
    let localeLookup = {};
    const languageFile = this._resolveLocaleFile(this.directory, this.locale);
    try {
      if (shim.fs.readFileSync) {
        localeLookup = JSON.parse(shim.fs.readFileSync(languageFile, "utf-8"));
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        err.message = "syntax error in " + languageFile;
      }
      if (err.code === "ENOENT")
        localeLookup = {};
      else
        throw err;
    }
    this.cache[this.locale] = localeLookup;
  }
  _resolveLocaleFile(directory, locale) {
    let file = shim.resolve(directory, "./", locale + ".json");
    if (this.fallbackToLanguage && !this._fileExistsSync(file) && ~locale.lastIndexOf("_")) {
      const languageFile = shim.resolve(directory, "./", locale.split("_")[0] + ".json");
      if (this._fileExistsSync(languageFile))
        file = languageFile;
    }
    return file;
  }
  _fileExistsSync(file) {
    return shim.exists(file);
  }
}
function y18n(opts, _shim) {
  shim = _shim;
  const y18n2 = new Y18N(opts);
  return {
    __: y18n2.__.bind(y18n2),
    __n: y18n2.__n.bind(y18n2),
    setLocale: y18n2.setLocale.bind(y18n2),
    getLocale: y18n2.getLocale.bind(y18n2),
    updateLocale: y18n2.updateLocale.bind(y18n2),
    locale: y18n2.locale
  };
}

// node_modules/y18n/index.mjs
var y18n2 = (opts) => {
  return y18n(opts, node_default);
};
var y18n_default = y18n2;

// node_modules/yargs/lib/platform-shims/esm.mjs
var REQUIRE_ERROR = "require is not supported by ESM";
var REQUIRE_DIRECTORY_ERROR = "loading a directory of commands is not supported yet for ESM";
var __dirname2;
try {
  __dirname2 = fileURLToPath(import.meta.url);
} catch (e) {
  __dirname2 = process.cwd();
}
var mainFilename = __dirname2.substring(0, __dirname2.lastIndexOf("node_modules"));
var esm_default = {
  assert: {
    notStrictEqual,
    strictEqual
  },
  cliui: ui,
  findUp: sync_default,
  getEnv: (key) => {
    return process.env[key];
  },
  inspect,
  getCallerFile: () => {
    throw new YError(REQUIRE_DIRECTORY_ERROR);
  },
  getProcessArgvBin,
  mainFilename: mainFilename || process.cwd(),
  Parser: lib_default,
  path: {
    basename,
    dirname: dirname2,
    extname,
    relative,
    resolve: resolve4
  },
  process: {
    argv: () => process.argv,
    cwd: process.cwd,
    emitWarning: (warning, type) => process.emitWarning(warning, type),
    execPath: () => process.execPath,
    exit: process.exit,
    nextTick: process.nextTick,
    stdColumns: typeof process.stdout.columns !== "undefined" ? process.stdout.columns : null
  },
  readFileSync: readFileSync2,
  require: () => {
    throw new YError(REQUIRE_ERROR);
  },
  requireDirectory: () => {
    throw new YError(REQUIRE_DIRECTORY_ERROR);
  },
  stringWidth: (str) => {
    return [...str].length;
  },
  y18n: y18n_default({
    directory: resolve4(__dirname2, "../../../locales"),
    updateFiles: false
  })
};

// src/cli.ts
var cwd = process.cwd();
var argv = yargs_default(hideBin(process.argv)).command("bundle", "Bundles the handlers", {
  out: {
    alias: "o",
    type: "string",
    describe: `Output directory for the bundle. Defaults to the 'outputDir' in the config.yaml file.`
  },
  format: {
    alias: "f",
    type: "string",
    default: "esm",
    describe: "Format of the bundle",
    choices: ["esm", "cjs"]
  }
}, async ({ out, format: format3 }) => {
  const hdbConfigPath = path2.resolve(cwd, "config.yaml");
  const hdbConfig = await ConfigLoader.loadHDBConfig(hdbConfigPath);
  const { handlers, outputDir } = hdbConfig;
  Object.entries(handlers).forEach(([key, handler]) => {
    const handlerPath = path2.resolve(cwd, handler.path);
    const extension = format3 === "cjs" ? "cjs" : "mjs";
    const outPath = path2.join(out ?? outputDir, `${key}.${extension}`);
    console.log(`Bundling ${key} to ${outPath}...`);
    const p = child_process.spawnSync("bun", ["build", handlerPath, "--target", "node", "--format", format3, "--outfile", outPath], {
      cwd,
      stdio: "inherit"
    });
    if (p.status !== 0) {
      console.error(`Bundling ${key} exited with code ${p.status}`);
      process.exit(1);
    }
  });
}).help().argv;
