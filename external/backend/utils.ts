export const isSecretKey = (key: string): boolean => {
  return key.startsWith('sk_')
}
