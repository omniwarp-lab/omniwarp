import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SettingSelectOption<T extends string = string> {
  value: T
  label: string
}

interface SettingSelectProps<T extends string = string> {
  value: T
  options: readonly SettingSelectOption<T>[]
  onValueChange: (value: T) => void
  className?: string
}

function SettingSelect<T extends string>({
  value,
  options,
  onValueChange,
  className = 'w-auto shrink-0',
}: SettingSelectProps<T>) {
  return (
    <Select
      value={value}
      onValueChange={(val) => {
        if (typeof val === 'string') onValueChange(val as T)
      }}
    >
      <SelectTrigger className={className} size='sm'>
        <SelectValue>
          {(val: unknown) => options.find((opt) => opt.value === val)?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { SettingSelect }
export type { SettingSelectOption }
