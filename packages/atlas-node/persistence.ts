import type { Atlas } from './core'

export class Persistence {
  protected readonly store: { [key: string]: unknown } = {}

  constructor(protected readonly instance: Atlas) {
    this.store = {}
  }

  register(key: string, value: unknown) {
    this.store[key] = value
  }

  read<T>(key: string): T | null {
    if (key in this.store) {
      return this.store[key] as T
    }

    return null
  }
}
