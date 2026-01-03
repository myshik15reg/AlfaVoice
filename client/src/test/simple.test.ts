import { describe, it, expect } from 'vitest';

describe('Simple Test Suite', () => {
	it('should add numbers', () => {
		expect(1 + 1).toBe(2);
	});

	it('should multiply numbers', () => {
		expect(2 * 3).toBe(6);
	});

	it('should compare strings', () => {
		expect('hello').toBe('hello');
	});
});
