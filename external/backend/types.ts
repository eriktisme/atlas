export interface IdentifyGroupParams {
  /**
   * The unique identifier of the user associated with the group.
   */
  distinctId?: string

  /**
   * The unique identifier for that type of group.
   */
  key: string

  /**
   * Additional properties to associate with the group.
   *
   * This can include metadata about the group, such as its name, size, etc.
   */
  properties?: Record<string, unknown>

  /**
   * The type of the group.
   *
   * This can be used to categorize groups, such as 'organization', 'workspace', etc.
   */
  type: string
}
