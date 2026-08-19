import { CommandGroup as CommandGroupPrimitive } from 'cmdk'
import { ReactNode } from 'react'

function CommandGroup({
  heading,
  children,
}: {
  heading: string
  children: ReactNode
}) {
  return (
    <CommandGroupPrimitive
      heading={heading}
      className='**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground'
      children={children}
    />
  )
}

export { CommandGroup }
