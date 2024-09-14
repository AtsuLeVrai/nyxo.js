/**
 * Represents a node in the doubly linked list used by the Cache.
 *
 * @template K - The type of the key.
 * @template V - The type of the value.
 */
export class Node<K, V> {
    /**
     * The next node in the list.
     */
    public next: Node<K, V> | null = null;

    /**
     * The previous node in the list.
     */
    public prev: Node<K, V> | null = null;

    /**
     * Creates a new Node.
     *
     * @param key - The key associated with the node.
     * @param value - The value associated with the node.
     * @param timestamp - The timestamp when the node was created or last accessed.
     */
    public constructor(
        public key: K,
        public value: V,
        public timestamp: number
    ) {}
}
