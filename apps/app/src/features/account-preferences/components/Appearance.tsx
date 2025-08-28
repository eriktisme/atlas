import { Card, CardContent } from '@internal/design-system/components/ui/card'
import { ThemeToggle } from '@internal/design-system/components/theme-toggle'

export const Appearance = () => {
  return (
    <>
      <h3 className="mb-1 text-lg font-medium">Appearance</h3>
      <p className="mb-4 text-base">
        Customize the appearance of the app. Automatically switch between day
        and night themes.
      </p>
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center px-3 py-2">
            <div className="flex-1">
              <div className="font-medium">Interface theme</div>
              <div>Select or customize your interface scheme</div>
            </div>
            <div>
              <ThemeToggle />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
