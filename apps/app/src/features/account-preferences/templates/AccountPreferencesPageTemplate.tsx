import { Appearance } from '../components'

export const AccountPreferencesPageTemplate = () => {
  return (
    <div
      className="relative mx-auto flex w-full max-w-2xl flex-col overflow-hidden p-6 md:p-10"
      style={{
        overscrollBehavior: 'contain',
        scrollbarGutter: 'stable',
      }}
    >
      <h1 className="mb-6 text-2xl font-medium">Preferences</h1>
      <Appearance />
    </div>
  )
}
