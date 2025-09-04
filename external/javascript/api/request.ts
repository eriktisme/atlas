interface BuildRequestOptions {
  /**
   * The API key used for authentication.
   */
  apiKey: string
  /**
   * The URL of the API.
   */
  apiUrl: string
  /**
   * The API version to use.
   */
  apiVersion: 'v1'
}

type ApiOptionsBody =
  | {
      body: Record<string, unknown> | Array<Record<string, unknown>>
    }
  | {
      body?: undefined
    }

export interface ApiSuccessResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  code: string
  requestId: string
  statusCode: number
  type: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export type RequestFunction = ReturnType<typeof buildRequest>

export type ApiRequestOptions = {
  header?: Record<string, string>
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'
  path: string
  query?: Record<string, unknown>
} & ApiOptionsBody

export function buildRequest(options: BuildRequestOptions) {
  return async <T>(
    requestOptions: ApiRequestOptions
  ): Promise<ApiResponse<T>> => {
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
      headers.set('Authorization', `Bearer ${options.apiKey}`)
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

    const request = await fetch(
      [url, options.apiVersion, requestOptions.path].join('/'),
      {
        method: requestOptions.method,
        headers,
        ...buildBody(),
      }
    )

    const response = await request.json()

    if (!request.ok) {
      return {
        ...(response as ApiErrorResponse),
        statusCode: request.status,
      }
    }

    return response as ApiSuccessResponse<T>
  }
}
