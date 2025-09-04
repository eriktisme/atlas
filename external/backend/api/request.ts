interface BuildRequestOptions {
  /**
   * The URL of the Backend API.
   */
  apiUrl: string
  /**
   * The secret key used for authentication.
   */
  secretKey: string
}

type BackendApiOptionsBody =
  | {
      body: Record<string, unknown> | Array<Record<string, unknown>>
    }
  | {
      body?: undefined
    }

export interface BackendApiSuccessResponse<T> {
  data: T
}

export interface BackendApiErrorResponse {
  code: string
  requestId: string
  statusCode: number
  type: string
}

export type BackendApiResponse<T> =
  | BackendApiSuccessResponse<T>
  | BackendApiErrorResponse

export type RequestFunction = ReturnType<typeof buildRequest>

export type BackendApiRequestOptions = {
  header?: Record<string, string>
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'
  path: string
  query?: Record<string, unknown>
} & BackendApiOptionsBody

export function buildRequest(options: BuildRequestOptions) {
  return async <T>(
    requestOptions: BackendApiRequestOptions
  ): Promise<BackendApiResponse<T>> => {
    const url = new URL(options.apiUrl)

    if (requestOptions.query) {
      Object.entries(requestOptions.query).forEach(([key, value]) => {
        if (value) {
          ;[value]
            .flat()
            .forEach((v) => url.searchParams.append(key, String(v)))
        }
      })
    }

    /**
     * Future improvements:
     *
     * - Have some versioning strategy for the API, e.g., date-based or semantic versioning.
     */
    const headers = new Headers({
      'Atlas-API-Version': 'v1',
      'User-Agent': 'Atlas SDK',
      'Content-Type': 'application/json',
      ...requestOptions.header,
    })

    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${options.secretKey}`)
    }

    const buildBody = () => {
      if (requestOptions.method === 'GET') {
        return
      }

      if (!requestOptions.body) {
        return
      }

      if (Object.keys(requestOptions.body).length === 0) {
        return
      }

      return {
        body: JSON.stringify(requestOptions.body),
      }
    }

    const request = await fetch([url, requestOptions.path].join('/'), {
      method: requestOptions.method,
      headers,
      ...buildBody(),
    })

    const response = await request.json()

    if (!request.ok) {
      return {
        ...(response as BackendApiErrorResponse),
        statusCode: request.status,
      }
    }

    return response as BackendApiSuccessResponse<T>
  }
}
