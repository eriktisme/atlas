import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@internal/design-system/components/ui/card'
import { DeleteWorkspaceDialog } from './DeleteWorkspaceDialog'

export const DeleteWorkspaceCard = () => {
  return (
    <Card className="border-red-500">
      <CardHeader className="p-3">
        <CardTitle>Delete Workspace</CardTitle>
        <CardDescription>
          Permanently remove your <strong>workspace</strong> and all of its
          contents from this platform. This action is not reversible, so please
          continue with caution.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end p-3 pt-0">
        <DeleteWorkspaceDialog />
      </CardFooter>
    </Card>
  )
}
