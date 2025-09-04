import type { RequestFunction } from '../request'

export abstract class BaseAPI {
  constructor(protected request: RequestFunction) {
    //
  }
}
