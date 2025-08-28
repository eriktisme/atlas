import type { CdkCustomResourceEvent } from 'aws-lambda'

interface CustomEvent {
  direction: 'up' | 'down'
}

export type MigrationEvent = CdkCustomResourceEvent | CustomEvent
