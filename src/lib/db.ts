import { randomUUID } from "crypto";
import dns from "dns";
import { MongoClient } from "mongodb";
import type { AnyBulkWriteOperation, Db } from "mongodb";

/**
 * MongoDB-backed database with a Prisma-compatible query API.
 * The store is a Service and each model lives in its own collection:
 *   users, products, auctions, bids, payments, notifications, watchlists
 * inside the database from the DATABASE_URL environment variable.
 */

const COLLECTIONS: CollectionName[] = [
  "users",
  "products",
  "auctions",
  "bids",
  "payments",
  "notifications",
  "watchlists",
];

type Row = Record<string, unknown>;
type ModelName =
  | "user"
  | "product"
  | "auction"
  | "bid"
  | "payment"
  | "notification"
  | "watchlist";
type CollectionName =
  | "users"
  | "products"
  | "auctions"
  | "bids"
  | "payments"
  | "notifications"
  | "watchlists";

interface DBData {
  users: Row[];
  products: Row[];
  auctions: Row[];
  bids: Row[];
  payments: Row[];
  notifications: Row[];
  watchlists: Row[];
}

interface RelationDef {
  model: ModelName;
  collection: CollectionName;
  fk: string;
  many?: boolean;
}

const MODEL_COLLECTION: Record<ModelName, CollectionName> = {
  user: "users",
  product: "products",
  auction: "auctions",
  bid: "bids",
  payment: "payments",
  notification: "notifications",
  watchlist: "watchlists",
};

const RELATIONS: Record<ModelName, Record<string, RelationDef>> = {
  user: {
    products: { model: "product", collection: "products", fk: "sellerId", many: true },
    bids: { model: "bid", collection: "bids", fk: "userId", many: true },
    notifications: { model: "notification", collection: "notifications", fk: "userId", many: true },
    payments: { model: "payment", collection: "payments", fk: "userId", many: true },
    watchlist: { model: "watchlist", collection: "watchlists", fk: "userId", many: true },
  },
  product: {
    seller: { model: "user", collection: "users", fk: "sellerId" },
    auction: { model: "auction", collection: "auctions", fk: "productId" },
  },
  auction: {
    product: { model: "product", collection: "products", fk: "productId" },
    bids: { model: "bid", collection: "bids", fk: "auctionId", many: true },
    payments: { model: "payment", collection: "payments", fk: "auctionId", many: true },
    watchlist: { model: "watchlist", collection: "watchlists", fk: "auctionId", many: true },
  },
  bid: {
    user: { model: "user", collection: "users", fk: "userId" },
    auction: { model: "auction", collection: "auctions", fk: "auctionId" },
  },
  payment: {
    user: { model: "user", collection: "users", fk: "userId" },
    auction: { model: "auction", collection: "auctions", fk: "auctionId" },
  },
  notification: {
    user: { model: "user", collection: "users", fk: "userId" },
  },
  watchlist: {
    user: { model: "user", collection: "users", fk: "userId" },
    auction: { model: "auction", collection: "auctions", fk: "auctionId" },
  },
};

const OPERATOR_KEYS = new Set([
  "equals",
  "not",
  "in",
  "notIn",
  "lt",
  "lte",
  "gt",
  "gte",
  "contains",
  "startsWith",
  "endsWith",
  "mode",
]);

interface MongoHandle {
  client: MongoClient;
  db: Db;
}

const globalForMongo = globalThis as unknown as { mongoHandle?: Promise<MongoHandle> };

const FALLBACK_RESOLVERS = ["8.8.8.8", "1.1.1.1"];
const DNS_TRANSPORT_ERRORS = new Set([
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ESERVFAIL",
]);

let dnsChecked = false;

function probeHostname(url: string): Promise<void> {
  const hostname = new URL(url).hostname;
  return url.startsWith("mongodb+srv://")
    ? dns.promises.resolveSrv(`_mongodb._tcp.${hostname}`).then(() => undefined)
    : dns.promises.resolve4(hostname).then(() => undefined);
}

/**
 * Some local networks (e.g. phone hotspots) hand out a DNS server that
 * refuses queries from Node's resolver while the rest of the system works.
 * On transport-level DNS failures this re-points Node's resolver at a public
 * one (8.8.8.8 / 1.1.1.1) so the Mongo hostname still resolves. Only runs
 * once per process.
 */
async function ensureDnsResolves(url: string): Promise<void> {
  if (dnsChecked) return;
  try {
    await probeHostname(url);
    dnsChecked = true;
    return;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code ?? "";
    if (!DNS_TRANSPORT_ERRORS.has(code)) {
      // genuine lookup failure (e.g. unknown host) - do not mask it
      dnsChecked = true;
      return;
    }
  }
  const originalServers = dns.getServers();
  for (const server of FALLBACK_RESOLVERS) {
    try {
      dns.setServers([server]);
      await probeHostname(url);
      dnsChecked = true;
      return;
    } catch {
      // try the next resolver
    }
  }
  dns.setServers(originalServers);
}

/**
 * Lazily connects to MongoDB (DATABASE_URL) exactly once per process and
 * resolves the database handle. A rejected connection is cleared so a later
 * request can retry.
 */
function getMongo(): Promise<MongoHandle> {
  if (!globalForMongo.mongoHandle) {
    globalForMongo.mongoHandle = (async () => {
      const url = process.env.DATABASE_URL;
      if (!url) throw new Error("DATABASE_URL is not set");
      await ensureDnsResolves(url);
      const client = new MongoClient(url, { serverSelectionTimeoutMS: 5000 });
      await client.connect();
      const dbName = (() => {
        try {
          const name = decodeURIComponent(new URL(url).pathname.replace(/^\//, ""));
          return name || "auction_db";
        } catch {
          return "auction_db";
        }
      })();
      return { client, db: client.db(dbName) };
    })();
  }
  return globalForMongo.mongoHandle.catch((error) => {
    globalForMongo.mongoHandle = undefined;
    throw error;
  });
}

async function getDb(): Promise<Db> {
  return (await getMongo()).db;
}

function emptyData(): DBData {
  return { users: [], products: [], auctions: [], bids: [], payments: [], notifications: [], watchlists: [] };
}

function isOperatorObject(value: unknown): boolean {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value as Record<string, unknown>).every((k) => OPERATOR_KEYS.has(k))
  );
}

function matchesOperator(field: unknown, op: Record<string, unknown>): boolean {
  for (const [key, value] of Object.entries(op)) {
    if (key === "mode") continue;
    switch (key) {
      case "equals":
        if (field !== value) return false;
        break;
      case "not":
        if (field === value) return false;
        break;
      case "in":
        if (!(value as unknown[]).includes(field)) return false;
        break;
      case "notIn":
        if ((value as unknown[]).includes(field)) return false;
        break;
      case "contains": {
        const haystack = String(field ?? "").toLowerCase();
        if (!haystack.includes(String(value).toLowerCase())) return false;
        break;
      }
      case "startsWith":
        if (!String(field ?? "").startsWith(String(value))) return false;
        break;
      case "endsWith":
        if (!String(field ?? "").endsWith(String(value))) return false;
        break;
      case "lt":
        if (!((field as number) < (value as number))) return false;
        break;
      case "lte":
        if (!((field as number) <= (value as number))) return false;
        break;
      case "gt":
        if (!((field as number) > (value as number))) return false;
        break;
      case "gte":
        if (!((field as number) >= (value as number))) return false;
        break;
      default:
        return false;
    }
  }
  return true;
}

function buildComparator(orderBy: unknown): (a: Row, b: Row) => number {
  const orders = (Array.isArray(orderBy) ? orderBy : [orderBy]) as Record<string, string>[];
  return (a, b) => {
    for (const order of orders) {
      for (const [key, dir] of Object.entries(order)) {
        const av = a[key];
        const bv = b[key];
        if (av === bv) continue;
        const asc = dir === "asc";
        let cmp = 0;
        if (av instanceof Date && bv instanceof Date) {
          cmp = av.getTime() - bv.getTime();
        } else if (typeof av === "number" && typeof bv === "number") {
          cmp = av - bv;
        } else {
          cmp = String(av).localeCompare(String(bv));
        }
        if (!asc) cmp = -cmp;
        return cmp;
      }
    }
    return 0;
  };
}

/**
 * A promise that does not start executing until it is awaited (or `.then`
 * is called). This lets `$transaction([...])` run its operations with the
 * transaction flag already set, so they mutate memory atomically and are
 * persisted to MongoDB exactly once.
 */
function lazy<T>(executor: () => Promise<T>): Promise<T> {
  let promise: Promise<T> | null = null;
  const run = () => {
    if (!promise) promise = executor();
    return promise;
  };
  const thenable: Promise<T> = {
    then<TResult1 = T, TResult2 = never>(
      onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ) {
      return run().then(onFulfilled, onRejected);
    },
    catch<TResult = never>(
      onRejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null
    ) {
      return run().catch(onRejected);
    },
    finally(onFinally?: (() => void) | null) {
      return run().finally(onFinally);
    },
    get [Symbol.toStringTag]() {
      return "Promise";
    },
  } as Promise<T>;
  return thenable;
}

interface QuerySpec {
  select?: Record<string, unknown>;
  include?: Record<string, unknown>;
  where?: Record<string, unknown>;
  orderBy?: unknown;
  take?: number;
}

class MongoDBStore {
  private data: DBData | null = null;
  private loadPromise: Promise<void> | null = null;
  private dirty: Set<CollectionName> = new Set();
  private saveQueue: Promise<void> = Promise.resolve();
  private inTransaction = false;

  private async ensureLoaded(): Promise<void> {
    if (this.data) return;
    if (!this.loadPromise) {
      this.loadPromise = this.doLoad();
    }
    await this.loadPromise;
  }

  private async doLoad(): Promise<void> {
    const db = await getDb();
    const data = emptyData();
    for (const name of COLLECTIONS) {
      const docs = await db.collection(name).find({}).toArray();
      // strip the Mongo _id: the wrapper keys everything by the string `id` field
      data[name] = docs.map(({ _id, ...rest }) => rest as Row);
    }
    this.data = data;
  }

  private async persist(collection?: CollectionName): Promise<void> {
    const targets: CollectionName[] = collection ? [collection] : [...this.dirty];
    if (targets.length === 0) return;
    const db = await getDb();
    for (const name of targets) {
      const rows = this.data?.[name] ?? [];
      const col = db.collection(name);
      const rowIds = new Set(rows.map((r) => String(r.id)));
      const existing = await col.find({}, { projection: { id: 1 } }).toArray();
      const writes: AnyBulkWriteOperation[] = [];
      for (const row of rows) {
        writes.push({ replaceOne: { filter: { id: row.id }, replacement: row, upsert: true } });
      }
      for (const doc of existing) {
        if (!rowIds.has(String(doc.id))) {
          writes.push({ deleteOne: { filter: { id: doc.id } } });
        }
      }
      if (writes.length > 0) await col.bulkWrite(writes, { ordered: false });
    }
    for (const name of targets) this.dirty.delete(name);
  }

  private schedulePersist(collection: CollectionName): void {
    this.saveQueue = this.saveQueue
      .then(() => this.persist(collection))
      .catch((error) => {
        console.error(`[db] failed to persist "${collection}" to MongoDB:`, error);
      });
  }

  private mutate<T>(collection: CollectionName, mutator: () => T): T {
    const result = mutator();
    this.dirty.add(collection);
    if (!this.inTransaction) this.schedulePersist(collection);
    return result;
  }

  private rows(collection: CollectionName): Row[] {
    return this.data?.[collection] as Row[];
  }

  private relatedRow(rel: RelationDef, row: Row): Row | null {
    const fkValue = row[rel.fk];
    if (fkValue == null) return null;
    return this.rows(rel.collection).find((r) => r.id === fkValue) ?? null;
  }

  private relatedRows(rel: RelationDef, row: Row): Row[] {
    const selfId = row.id;
    return this.rows(rel.collection).filter((r) => r[rel.fk] === selfId);
  }

  private resolveCount(model: ModelName, row: Row, spec: Record<string, unknown>): Row {
    const counts: Row = {};
    const select = (spec.select ?? {}) as Record<string, unknown>;
    for (const [relName, enabled] of Object.entries(select)) {
      if (!enabled) continue;
      const rel = RELATIONS[model]?.[relName];
      counts[relName] = rel ? this.relatedRows(rel, row).length : 0;
    }
    return counts;
  }

  private resolveRelation(rel: RelationDef, row: Row, spec: QuerySpec): Row | Row[] | null {
    if (rel.many) {
      let items = this.relatedRows(rel, row);
      if (spec.where) items = items.filter((r) => this.matchesWhere(rel.model, r, spec.where!));
      if (spec.orderBy) items = [...items].sort(buildComparator(spec.orderBy));
      if (spec.take != null) items = items.slice(0, spec.take);
      return items.map((r) => this.resolveRow(rel.model, r, spec));
    }
    const target = this.relatedRow(rel, row);
    if (!target) return null;
    return this.resolveRow(rel.model, target, spec);
  }

  private resolveRow(model: ModelName, row: Row, spec?: QuerySpec): Row {
    if (!spec || (!spec.select && !spec.include)) return { ...row };

    const fields = spec.select ? Object.entries(spec.select) : Object.entries(spec.include!);
    const out: Row = spec.select ? {} : { ...row };

    for (const [key, value] of fields) {
      if (key === "_count") {
        out[key] = this.resolveCount(model, row, (value as Record<string, unknown>) ?? {});
        continue;
      }
      const rel = RELATIONS[model]?.[key];
      if (rel) {
        const nested: QuerySpec =
          value && typeof value === "object" && !Array.isArray(value)
            ? (value as QuerySpec)
            : {};
        out[key] = this.resolveRelation(rel, row, nested);
      } else if (spec.select) {
        out[key] = row[key];
      }
    }
    return out;
  }

  private matchesWhere(model: ModelName, row: Row, where: Record<string, unknown>): boolean {
    for (const [key, value] of Object.entries(where)) {
      if (key === "OR") {
        const clauses = value as Record<string, unknown>[];
        if (!clauses.some((w) => this.matchesWhere(model, row, w))) return false;
        continue;
      }
      if (key === "AND") {
        const clauses = value as Record<string, unknown>[];
        if (!clauses.every((w) => this.matchesWhere(model, row, w))) return false;
        continue;
      }
      const rel = RELATIONS[model]?.[key];
      if (rel) {
        if (rel.many) {
          const related = this.relatedRows(rel, row);
          const clause = value as Record<string, unknown>;
          if (!related.some((r) => this.matchesWhere(rel.model, r, clause))) return false;
        } else {
          const related = this.relatedRow(rel, row);
          if (!related || !this.matchesWhere(rel.model, related, value as Record<string, unknown>)) {
            return false;
          }
        }
        continue;
      }
      if (isOperatorObject(value)) {
        if (!matchesOperator(row[key], value as Record<string, unknown>)) return false;
        continue;
      }
      if (value && typeof value === "object" && !Array.isArray(value)) {
        // compound key, e.g. { userId, auctionId }
        for (const [subKey, subValue] of Object.entries(value)) {
          if (row[subKey] !== subValue) return false;
        }
        continue;
      }
      if (row[key] !== value) return false;
    }
    return true;
  }

  private collection(model: ModelName): Row[] {
    return this.rows(MODEL_COLLECTION[model]);
  }

  private findRows(model: ModelName, spec: QuerySpec): Row[] {
    let rows = this.collection(model);
    if (spec.where) rows = rows.filter((r) => this.matchesWhere(model, r, spec.where!));
    if (spec.orderBy) rows = [...rows].sort(buildComparator(spec.orderBy));
    if (spec.take != null) rows = rows.slice(0, spec.take);
    return rows;
  }

  async findMany(model: ModelName, spec: QuerySpec = {}): Promise<Row[]> {
    await this.ensureLoaded();
    return this.findRows(model, spec).map((r) => this.resolveRow(model, r, spec));
  }

  async findFirst(model: ModelName, spec: QuerySpec = {}): Promise<Row | null> {
    await this.ensureLoaded();
    const rows = this.findRows(model, { ...spec, take: spec.take ?? 1 });
    return rows.length ? this.resolveRow(model, rows[0], spec) : null;
  }

  async findUnique(model: ModelName, spec: QuerySpec = {}): Promise<Row | null> {
    await this.ensureLoaded();
    const rows = this.findRows(model, { ...spec, take: 1 });
    return rows.length ? this.resolveRow(model, rows[0], spec) : null;
  }

  async create(model: ModelName, data: Row, spec: QuerySpec = {}): Promise<Row> {
    await this.ensureLoaded();
    const row: Row = { id: data.id ?? randomUUID(), ...data };
    if (!row.createdAt) row.createdAt = new Date();
    if (!row.updatedAt) row.updatedAt = new Date();
    return this.mutate(MODEL_COLLECTION[model], () => {
      this.collection(model).push(row);
      return this.resolveRow(model, row, spec);
    });
  }

  async update(
    model: ModelName,
    where: Record<string, unknown>,
    data: Row,
    spec: QuerySpec = {}
  ): Promise<Row> {
    await this.ensureLoaded();
    return this.mutate(MODEL_COLLECTION[model], () => {
      const rows = this.collection(model);
      const index = rows.findIndex((r) => this.matchesWhere(model, r, where));
      if (index < 0) throw new Error(`Record not found for ${model} update`);
      rows[index] = { ...rows[index], ...data, updatedAt: new Date() };
      return this.resolveRow(model, rows[index], spec);
    });
  }

  async updateMany(
    model: ModelName,
    where: Record<string, unknown>,
    data: Row
  ): Promise<{ count: number }> {
    await this.ensureLoaded();
    return this.mutate(MODEL_COLLECTION[model], () => {
      const rows = this.collection(model);
      let count = 0;
      for (const row of rows) {
        if (this.matchesWhere(model, row, where)) {
          Object.assign(row, data);
          row.updatedAt = new Date();
          count++;
        }
      }
      return { count };
    });
  }

  async delete(model: ModelName, where: Record<string, unknown>): Promise<Row> {
    await this.ensureLoaded();
    return this.mutate(MODEL_COLLECTION[model], () => {
      const rows = this.collection(model);
      const index = rows.findIndex((r) => this.matchesWhere(model, r, where));
      if (index < 0) throw new Error(`Record not found for ${model} delete`);
      const [removed] = rows.splice(index, 1);
      return removed;
    });
  }

  async deleteMany(model: ModelName, where: Record<string, unknown>): Promise<{ count: number }> {
    await this.ensureLoaded();
    return this.mutate(MODEL_COLLECTION[model], () => {
      const rows = this.collection(model);
      const remaining: Row[] = [];
      let count = 0;
      for (const row of rows) {
        if (this.matchesWhere(model, row, where)) count++;
        else remaining.push(row);
      }
      if (this.data) this.data[MODEL_COLLECTION[model]] = remaining;
      return { count };
    });
  }

  async count(model: ModelName, where: Record<string, unknown> = {}): Promise<number> {
    await this.ensureLoaded();
    return this.collection(model).filter((r) => this.matchesWhere(model, r, where)).length;
  }

  async groupBy(
    model: ModelName,
    spec: { by: string[]; _count?: Record<string, boolean>; where?: Record<string, unknown> } = { by: [] }
  ): Promise<Row[]> {
    await this.ensureLoaded();
    const rows = spec.where
      ? this.collection(model).filter((r) => this.matchesWhere(model, r, spec.where!))
      : this.collection(model);
    const groups = new Map<string, Row>();
    for (const row of rows) {
      const key = spec.by.map((b) => String(row[b])).join("\u0001");
      if (!groups.has(key)) {
        const group: Row = {};
        for (const b of spec.by) group[b] = row[b];
        if (spec._count) group._count = {};
        groups.set(key, group);
      }
      const group = groups.get(key)!;
      if (spec._count) {
        for (const field of Object.keys(spec._count)) {
          group._count = {
            ...(group._count as Row),
            [field]: ((group._count as Row)[field] as number | undefined ?? 0) + 1,
          };
        }
      }
    }
    return Array.from(groups.values());
  }

  async aggregate(
    model: ModelName,
    spec: { _sum?: Record<string, boolean>; where?: Record<string, unknown> } = {}
  ): Promise<{ _sum: Row }> {
    await this.ensureLoaded();
    const rows = spec.where
      ? this.collection(model).filter((r) => this.matchesWhere(model, r, spec.where!))
      : this.collection(model);
    const sums: Row = {};
    for (const field of Object.keys(spec._sum ?? {})) {
      sums[field] = rows.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
    }
    return { _sum: sums };
  }

  async $transaction<T>(arg: (tx: DbProxy) => Promise<T> | T, proxy: DbProxy): Promise<T>;
  async $transaction<T>(arg: Promise<T>[], proxy: DbProxy): Promise<T[]>;
  async $transaction(arg: any, proxy: DbProxy): Promise<any> {
    await this.ensureLoaded();
    const previousTx = this.inTransaction;
    this.inTransaction = true;
    try {
      if (typeof arg === "function") {
        const result = await arg(proxy);
        if (this.dirty.size > 0) await this.persist();
        return result;
      }
      const results: any[] = [];
      for (const op of arg as Promise<any>[]) {
        results.push(await op);
      }
      if (this.dirty.size > 0) await this.persist();
      return results;
    } catch (error) {
      // roll back to the last persisted state
      this.data = null;
      this.loadPromise = null;
      this.dirty.clear();
      throw error;
    } finally {
      this.inTransaction = previousTx;
    }
  }
}

class DbModel {
  constructor(
    private db: MongoDBStore,
    private model: ModelName
  ) {}

  findUnique(spec: QuerySpec = {}): Promise<any | null> {
    return lazy(() => this.db.findUnique(this.model, spec));
  }

  findFirst(spec: QuerySpec = {}): Promise<any | null> {
    return lazy(() => this.db.findFirst(this.model, spec));
  }

  findMany(spec: QuerySpec = {}): Promise<any[]> {
    return lazy(() => this.db.findMany(this.model, spec));
  }

  create(spec: { data: Row; include?: QuerySpec["include"]; select?: QuerySpec["select"] }): Promise<any> {
    return lazy(() => this.db.create(this.model, spec.data, { include: spec.include, select: spec.select }));
  }

  update(spec: {
    where: Record<string, unknown>;
    data: Row;
    include?: QuerySpec["include"];
    select?: QuerySpec["select"];
  }): Promise<any> {
    return lazy(() =>
      this.db.update(this.model, spec.where, spec.data, { include: spec.include, select: spec.select })
    );
  }

  updateMany(spec: { where: Record<string, unknown>; data: Row }): Promise<{ count: number }> {
    return lazy(() => this.db.updateMany(this.model, spec.where, spec.data));
  }

  delete(spec: { where: Record<string, unknown> }): Promise<any> {
    return lazy(() => this.db.delete(this.model, spec.where));
  }

  deleteMany(spec: { where: Record<string, unknown> }): Promise<{ count: number }> {
    return lazy(() => this.db.deleteMany(this.model, spec.where));
  }

  count(spec: { where?: Record<string, unknown> } = {}): Promise<number> {
    return lazy(() => this.db.count(this.model, spec.where));
  }

  groupBy(
    spec: { by: string[]; _count?: Record<string, boolean>; where?: Record<string, unknown> }
  ): Promise<any[]> {
    return lazy(() => this.db.groupBy(this.model, spec));
  }

  aggregate(
    spec: { _sum?: Record<string, boolean>; where?: Record<string, unknown> }
  ): Promise<any> {
    return lazy(() => this.db.aggregate(this.model, spec));
  }
}

class DbProxy {
  private db = new MongoDBStore();

  user = new DbModel(this.db, "user");
  product = new DbModel(this.db, "product");
  auction = new DbModel(this.db, "auction");
  bid = new DbModel(this.db, "bid");
  payment = new DbModel(this.db, "payment");
  notification = new DbModel(this.db, "notification");
  watchlist = new DbModel(this.db, "watchlist");

  $transaction<T>(arg: (tx: DbProxy) => Promise<T> | T): Promise<T>;
  $transaction<T>(arg: Promise<T>[]): Promise<T[]>;
  $transaction(arg: any): Promise<any> {
    return this.db.$transaction(arg, this);
  }
}

const globalForDb = globalThis as unknown as { mongoPrisma?: DbProxy };

export const prisma = globalForDb.mongoPrisma ?? new DbProxy();

if (process.env.NODE_ENV !== "production") globalForDb.mongoPrisma = prisma;

export default prisma;
