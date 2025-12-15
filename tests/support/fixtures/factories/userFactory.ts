/**
 * User Factory
 *
 * Creates test user data with faker for unique values.
 * Supports override pattern for specific test scenarios.
 */

import { faker } from '@faker-js/faker';

export interface User {
  id: string;
  email: string;
  name: string;
  deviceName: string;
  createdAt: string;
}

export interface UserOverrides {
  id?: string;
  email?: string;
  name?: string;
  deviceName?: string;
  createdAt?: string;
}

/**
 * Creates a user with default values and optional overrides
 * @param overrides - Partial user data to override defaults
 * @returns Complete user object
 */
export function createUser(overrides: UserOverrides = {}): User {
  return {
    id: overrides.id ?? faker.string.uuid(),
    email: overrides.email ?? faker.internet.email(),
    name: overrides.name ?? faker.person.fullName(),
    deviceName: overrides.deviceName ?? `${faker.word.adjective()}-${faker.word.noun()}`,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
  };
}

/**
 * Creates multiple users
 * @param count - Number of users to create
 * @param overrides - Overrides applied to all users
 * @returns Array of users
 */
export function createUsers(count: number, overrides: UserOverrides = {}): User[] {
  return Array.from({ length: count }, () => createUser(overrides));
}
