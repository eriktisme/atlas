import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@internal/design-system/components/ui/select'
import type { OrganizationCustomRoleKey } from '@clerk/types'

interface Props {
  disabled?: boolean
  onChange: (value: string) => void
  options: OrganizationCustomRoleKey[]
  value: string
}

export const SelectRole = (props: Props) => {
  return (
    <Select
      onValueChange={props.onChange}
      defaultValue={props.value}
      disabled={props.disabled}
    >
      <SelectTrigger className="w-[180px] capitalize">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {props.options.map((option) => (
            <SelectItem
              className="[&>span]:capitalize"
              key={`role-${option}`}
              value={option}
            >
              {option.replace('org:', '')}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
