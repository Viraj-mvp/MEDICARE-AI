"use client"

import { ChevronDown } from "lucide-react"
import {
    Button as AriaButton,
    ButtonProps as AriaButtonProps,
    ListBox as AriaListBox,
    ListBoxProps as AriaListBoxProps,
    Popover as AriaPopover,
    PopoverProps as AriaPopoverProps,
    Select as AriaSelect,
    SelectProps as AriaSelectProps,
    SelectValue as AriaSelectValue,
    SelectValueProps as AriaSelectValueProps,
    ValidationResult as AriaValidationResult,
    composeRenderProps,
    Text,
    Label as AriaLabel,
    LabelProps as AriaLabelProps,
    FieldError as AriaFieldError,
    FieldErrorProps as AriaFieldErrorProps,
    ListBoxItem as AriaListBoxItem,
    ListBoxItemProps as AriaListBoxItemProps,
    Header as AriaHeader,
    Collection as AriaCollection,
    Section as AriaSection,
    SectionProps as AriaSectionProps
} from "react-aria-components"

import { cn } from "@/lib/utils"

// --- Inline implementations of missing dependencies ---

const Label = ({ className, ...props }: AriaLabelProps) => (
    <AriaLabel
        className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
        {...props}
    />
)

const FieldError = ({ className, ...props }: AriaFieldErrorProps) => (
    <AriaFieldError
        className={cn("text-xs text-destructive", className)}
        {...props}
    />
)

const Popover = ({ className, ...props }: AriaPopoverProps) => (
    <AriaPopover
        className={composeRenderProps(className, (className) =>
            cn(
                "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2",
                className
            )
        )}
        {...props}
    />
)

const ListBoxItem = ({ className, ...props }: AriaListBoxItemProps) => (
    <AriaListBoxItem
        className={composeRenderProps(className, (className) =>
            cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[focused]:bg-accent data-[focused]:text-accent-foreground",
                className
            )
        )}
        {...props}
    />
)

const ListBoxHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <AriaHeader className={cn("px-2 py-1.5 text-sm font-semibold opacity-50", className)} {...props} />
)

const ListBoxSection = <T extends object>({ className, ...props }: AriaSectionProps<T>) => (
    <AriaSection className={cn("overflow-hidden p-1 text-foreground", className)} {...props} />
)

const ListBoxCollection = AriaCollection

// --- End Inline implementations ---

const Select = AriaSelect

const SelectItem = ListBoxItem

const SelectHeader = ListBoxHeader

const SelectSection = ListBoxSection

const SelectCollection = ListBoxCollection

const SelectValue = <T extends object>({
    className,
    ...props
}: AriaSelectValueProps<T>) => (
    <AriaSelectValue
        className={composeRenderProps(className, (className) =>
            cn(
                "line-clamp-1 data-[placeholder]:text-muted-foreground",
                /* Description */
                "[&>[slot=description]]:hidden",
                className
            )
        )}
        {...props}
    />
)

const SelectTrigger = ({ className, children, ...props }: AriaButtonProps) => (
    <AriaButton
        className={composeRenderProps(className, (className) =>
            cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background",
                /* Disabled */
                "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
                /* Focused */
                "data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
                /* Resets */
                "focus-visible:outline-none",
                className
            )
        )}
        {...props}
    >
        {composeRenderProps(children, (children) => (
            <>
                {children}
                <ChevronDown aria-hidden="true" className="size-4 opacity-50" />
            </>
        ))}
    </AriaButton>
)

const SelectPopover = ({ className, ...props }: AriaPopoverProps) => (
    <Popover
        className={composeRenderProps(className, (className) =>
            cn("w-[--trigger-width]", className)
        )}
        {...props}
    />
)

const SelectListBox = <T extends object>({
    className,
    ...props
}: AriaListBoxProps<T>) => (
    <AriaListBox
        className={composeRenderProps(className, (className) =>
            cn(
                "max-h-[inherit] overflow-auto p-1 outline-none [clip-path:inset(0_0_0_0_round_calc(var(--radius)-2px))]",
                className
            )
        )}
        {...props}
    />
)

interface JollySelectProps<T extends object>
    extends Omit<AriaSelectProps<T>, "children"> {
    label?: string
    description?: string
    errorMessage?: string | ((validation: AriaValidationResult) => string)
    items?: Iterable<T>
    children: React.ReactNode | ((item: T) => React.ReactNode)
}

function JollySelect<T extends object>({
    label,
    description,
    errorMessage,
    children,
    className,
    items,
    ...props
}: JollySelectProps<T>) {
    return (
        <Select
            className={composeRenderProps(className, (className) =>
                cn("group flex flex-col gap-2", className)
            )}
            {...props}
        >
            <Label>{label}</Label>
            <SelectTrigger>
                <SelectValue />
            </SelectTrigger>
            {description && (
                <Text className="text-sm text-muted-foreground" slot="description">
                    {description}
                </Text>
            )}
            <FieldError>{errorMessage}</FieldError>
            <SelectPopover>
                <SelectListBox items={items}>{children}</SelectListBox>
            </SelectPopover>
        </Select>
    )
}

export {
    Select,
    SelectValue,
    SelectTrigger,
    SelectItem,
    SelectPopover,
    SelectHeader,
    SelectListBox,
    SelectSection,
    SelectCollection,
    JollySelect,
}
export type { JollySelectProps }
