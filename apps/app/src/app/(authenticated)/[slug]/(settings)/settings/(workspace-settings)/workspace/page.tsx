import { WorkspaceSettingsPageTemplate } from '@/features/workspace-settings'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workspace',
}

export default async function Page() {
  return <WorkspaceSettingsPageTemplate />
}
