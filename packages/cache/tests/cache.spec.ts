import {Cache} from '../src';

describe('Cache', () => {
    let cache: Cache<string, number>;

    beforeEach(() => {
        cache = new Cache<string, number>({capacity: 3, ttl: 1000});
    });

    it('should set and get a value', () => {
        cache.set('key1', 1);
        expect(cache.get('key1')).toBe(1);
    });

    it('should return undefined for a missing key', () => {
        expect(cache.get('missingKey')).toBeUndefined();
    });

    it('should evict the oldest item when capacity is reached', () => {
        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.set('key3', 3);
        cache.set('key4', 4); // This should evict key1

        expect(cache.get('key1')).toBeUndefined();
        expect(cache.get('key2')).toBe(2);
        expect(cache.get('key3')).toBe(3);
        expect(cache.get('key4')).toBe(4);
    });

    it('should handle TTL expiration', (done) => {
        cache.set('key1', 1);
        setTimeout(() => {
            expect(cache.get('key1')).toBeUndefined();
            done();
        }, 1100);
    });

    it('should delete a key', () => {
        cache.set('key1', 1);
        cache.delete('key1');
        expect(cache.get('key1')).toBeUndefined();
    });

    it('should clear the cache', () => {
        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.clear();
        expect(cache.get('key1')).toBeUndefined();
        expect(cache.get('key2')).toBeUndefined();
    });

    it('should emit debug events', () => {
        const mockListener = jest.fn();
        cache.on('debug', mockListener);

        cache.set('key1', 1);
        cache.get('key1');
        cache.delete('key1');

        expect(mockListener).toHaveBeenCalledWith(expect.stringContaining('[CACHE: '));
    });

    it('should emit warn events when evicting items', () => {
        const mockListener = jest.fn();
        cache.on('warn', mockListener);

        cache.set('key1', 1);
        cache.set('key2', 2);
        cache.set('key3', 3);
        cache.set('key4', 4); // This should emit a warn event

        expect(mockListener).toHaveBeenCalledWith(expect.stringContaining('[CACHE: '));
    });

    it('should emit error events when trying to evict from an empty cache', () => {
        const mockListener = jest.fn();
        cache.on('error', mockListener);

        cache['evict'](); // Directly call evict to force the error

        expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('[CACHE: ')
        }));
    });
});
