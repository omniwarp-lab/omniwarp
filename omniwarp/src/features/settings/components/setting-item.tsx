import type { ComponentType, ReactNode } from 'react'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface BaseSettingConfig {
  id?: string
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  className?: string
}

interface SwitchSettingConfig extends BaseSettingConfig {
  type: 'switch'
  checked: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

interface SelectOption<T extends string = string> {
  value: T
  label: string
}

interface SelectSettingConfig<T extends string = string>
  extends BaseSettingConfig {
  type: 'select'
  value: T
  options: readonly SelectOption<T>[]
  disabled?: boolean
  triggerClassName?: string
  onChange?: (value: T) => void
}

interface CustomSettingConfig extends BaseSettingConfig {
  type?: 'custom'
  control?: ReactNode
}

type SettingItemConfig =
  | SwitchSettingConfig
  | SelectSettingConfig<any>
  | CustomSettingConfig

function SettingItem(props: SettingItemConfig) {
  const { icon: Icon, title, description, className } = props

  let control: ReactNode = null

  if (props.type === 'switch') {
    control = (
      <Switch
        disabled={props.disabled}
        checked={props.checked}
        onCheckedChange={props.onChange}
      />
    )
  } else if (props.type === 'select') {
    control = (
      <Select
        value={props.value}
        disabled={props.disabled}
        onValueChange={(val) => {
          if (val !== null && val !== undefined) {
            props.onChange?.(val)
          }
        }}
      >
        <SelectTrigger
          className={cn('w-fit shrink-0', props.triggerClassName)}
          size='sm'
        >
          <SelectValue>
            {(val: unknown) =>
              props.options.find((option) => option.value === val)?.label
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {props.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  } else {
    control = props.control
  }

  return (
    <div className={cn('flex items-center gap-3 px-3.5 py-3', className)}>
      <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground'>
        <Icon className='size-4' />
      </span>

      <div className='min-w-0 flex-1'>
        <p className='text-[13px] font-medium leading-snug'>{title}</p>
        <bdi
          title={description}
          className='mt-0.5 block truncate text-xs leading-snug text-muted-foreground'
        >
          {description}
        </bdi>
      </div>

      {control !== undefined && <div className='shrink-0'>{control}</div>}
    </div>
  )
}

interface SettingsListProps {
  items: SettingItemConfig[]
  className?: string
}

function SettingsList({ items, className }: SettingsListProps) {
  return (
    <div
      className={cn(
        'divide-y divide-border overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
    >
      {items.map((item, index) => (
        <SettingItem key={item.id ?? index} {...item} />
      ))}
    </div>
  )
}

export { SettingItem, SettingsList }
export type {
  SettingItemConfig,
  SwitchSettingConfig,
  SelectSettingConfig,
  CustomSettingConfig,
  SelectOption,
  SettingsListProps,
}
