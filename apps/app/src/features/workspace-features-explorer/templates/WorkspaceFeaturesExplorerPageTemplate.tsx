import { ExploreFeatures } from '../components'

export const WorkspaceFeaturesExplorerPageTemplate = () => {
  return (
    <div
      className="relative flex flex-col overflow-hidden p-6 md:p-10"
      style={{
        overscrollBehavior: 'contain',
        scrollbarGutter: 'stable',
      }}
    >
      <h1 className="mb-1 text-2xl font-medium">Workspace</h1>
      <p className="mb-6 text-base">Manage your workspace settings.</p>
      <ExploreFeatures />
    </div>
  )
}
