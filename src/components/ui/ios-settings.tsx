import { ChevronRight } from 'lucide-react'
import type * as React from 'react'
import { cn } from '@/lib/utils'

// iOS-style Settings Section
interface SettingsSectionProps {
  title?: string
  children: React.ReactNode
  className?: string
}

function SettingsSection({ title, children, className }: SettingsSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {title && (
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-4">
          {title}
        </h2>
      )}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

// iOS-style Settings Group (for multiple items in a section)
interface SettingsGroupProps {
  children: React.ReactNode
  className?: string
}

function SettingsGroup({ children, className }: SettingsGroupProps) {
  return (
    <div className={cn('divide-y divide-border/50', className)}>{children}</div>
  )
}

// iOS-style Settings Row
interface SettingsRowProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  value?: string
  rightElement?: React.ReactNode
  onClick?: () => void
  showChevron?: boolean
  className?: string
}

function SettingsRow({
  icon,
  title,
  subtitle,
  value,
  rightElement,
  onClick,
  showChevron = false,
  className,
}: SettingsRowProps) {
  const isClickable = onClick || showChevron
  const Component = isClickable ? 'button' : 'div'

  return (
    <Component
      type={isClickable ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between p-4 transition-colors text-left',
        isClickable && 'hover:bg-accent/50 cursor-pointer',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-medium text-foreground truncate">{title}</div>
          {subtitle && (
            <div className="text-sm text-muted-foreground truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {value && <div className="text-sm text-muted-foreground">{value}</div>}
        {rightElement}
        {showChevron && (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </Component>
  )
}

// iOS-style Settings Toggle Row (with Switch)
interface SettingsToggleRowProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  switchComponent: React.ComponentType<{
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    className?: string
  }>
  className?: string
}

function SettingsToggleRow({
  icon,
  title,
  subtitle,
  checked,
  onCheckedChange,
  switchComponent: SwitchComponent,
  className,
}: SettingsToggleRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 hover:bg-accent/50 transition-colors',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-medium text-foreground truncate">{title}</div>
          {subtitle && (
            <div className="text-sm text-muted-foreground truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>
      <SwitchComponent
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-primary flex-shrink-0"
      />
    </div>
  )
}

// iOS-style Settings Header
interface SettingsHeaderProps {
  title: string
  className?: string
}

function SettingsHeader({ title, className }: SettingsHeaderProps) {
  return (
    <div className={cn('bg-background border-b border-border/50', className)}>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      </div>
    </div>
  )
}

// iOS-style Settings Container
interface SettingsContainerProps {
  children: React.ReactNode
  className?: string
}

function SettingsContainer({ children, className }: SettingsContainerProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {children}
    </div>
  )
}

// iOS-style Settings Content
interface SettingsContentProps {
  children: React.ReactNode
  className?: string
}

function SettingsContent({ children, className }: SettingsContentProps) {
  return (
    <div
      className={cn(
        'container mx-auto px-4 py-6 max-w-2xl space-y-8',
        className
      )}
    >
      {children}
    </div>
  )
}

export {
  SettingsSection,
  SettingsGroup,
  SettingsRow,
  SettingsToggleRow,
  SettingsHeader,
  SettingsContainer,
  SettingsContent,
  type SettingsSectionProps,
  type SettingsGroupProps,
  type SettingsRowProps,
  type SettingsToggleRowProps,
  type SettingsHeaderProps,
  type SettingsContainerProps,
  type SettingsContentProps,
}
