import assert from "node:assert";

export type IdMapper<T, K> = (item: Partial<T>) => K | undefined;
export type ItemMerger<T> = (a: T, b: Partial<T>) => T;

export interface Lookup<T, K = string> {
  /**
   * Find item based on id.
   */
  find(id: K): T | undefined;

  /**
   * Return item with id or throw
   */
  require(id: K): T;

  /**
   * Check if item with id exists.
   */
  has(id: K): boolean;

  /**
   * List all items in repository.
   */
  list(): IterableIterator<T>;

  /**
   * Count all items in repository
   */
  count(): number;

  /**
   * Check if item exists.
   */
  hasItem(item: T): boolean;
}

/**
 * In-memory repository class
 *
 * @typeParam T - item type
 * @typeParam K - ID type
 */
export class Repository<T, K = string> implements Lookup<T, K> {
  protected items = new Map<K, T>();

  constructor(
    private getId: IdMapper<T, K>,
    private merge: ItemMerger<T> = (a, b) => ({ ...a, ...b }),
  ) {}

  /**
   * Add item to repository.
   * @throws if item id is already in use
   */
  add(item: T): T {
    const id = this.requireId(item);

    assert(!this.has(id), `ID already in use: ${id}`);

    this.items.set(id, item);
    return item;
  }

  /**
   * Update an existing item.
   * @throws if item id not known
   */
  update(item: Partial<T>) {
    const id = this.requireId(item);

    const base = this.find(id);
    assert(base !== undefined, `Unknown ID: ${id}`);

    this.items.set(id, this.merge(base, item));
  }

  /**
   * Find item based on id.
   */
  find(id: K): T | undefined {
    return this.items.get(id);
  }

  /**
   * Return item with id or throw
   */
  require(id: K): T {
    const item = this.find(id);
    if (item === undefined) throw this.notFoundError(id);

    return item;
  }

  /**
   * Check if item with id exists.
   */
  has(id: K): boolean {
    return this.items.has(id);
  }

  /**
   * List all items in repository.
   */
  list(): IterableIterator<T> {
    return this.items.values();
  }

  /**
   * Count all items in repository
   */
  count(): number {
    return this.items.size;
  }

  /**
   * Remove item by id.
   */
  remove(id: K): boolean {
    return this.items.delete(id);
  }

  /**
   * Check if item exists.
   */
  hasItem(item: T): boolean {
    return this.items.has(this.requireId(item));
  }

  /**
   * Remove item.
   */
  removeItem(item: T): boolean {
    return this.items.delete(this.requireId(item));
  }

  /**
   * Remove all items from the repository
   */
  clear() {
    this.items.clear();
  }

  protected notFoundError(id: K): Error {
    return new Error(`No item with ID: ${id}`);
  }

  private requireId(item: Partial<T>): K {
    const id = this.getId(item);
    assert(id !== undefined, "Item has no ID set!");
    return id;
  }
}
