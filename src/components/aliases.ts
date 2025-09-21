/**
 * Component Aliases - Consistent naming conventions
 *
 * This file provides consistent, clean aliases for all components
 * to resolve naming inconsistencies across the codebase.
 */

// Animated Tabs
export {
	Tabs as AnimatedTabs,
	TabsContent as AnimatedTabsContent,
	TabsList as AnimatedTabsList,
	TabsTrigger as AnimatedTabsTrigger,
} from "./animate-ui/components/animate/tabs";
// Tooltip
export {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./animate-ui/components/animate/tooltip";
// === ANIMATE UI COMPONENTS ===
// Sheet (Modal/Drawer)
export {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetOverlay,
	SheetPortal,
	SheetTitle,
	SheetTrigger,
} from "./animate-ui/components/radix/sheet";
// Animated Sidebar
export {
	Sidebar as AnimatedSidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInput,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarSeparator,
	SidebarTrigger,
	useSidebar,
} from "./animate-ui/components/radix/sidebar";
// Switch
export { Switch } from "./animate-ui/components/radix/switch";
// === ANIMATE UI PRIMITIVES ===
// Slot
export { Slot } from "./animate-ui/primitives/animate/slot";
// Primitive Tabs
export {
	Tabs as PrimitiveTabs,
	TabsContent as PrimitiveTabsContent,
	TabsList as PrimitiveTabsList,
	TabsTrigger as PrimitiveTabsTrigger,
} from "./animate-ui/primitives/animate/tabs";
// Effects
export {
	Highlight,
	HighlightItem,
} from "./animate-ui/primitives/effects/highlight";
// Primitive Controls
export { Checkbox } from "./animate-ui/primitives/radix/checkbox";
export { Switch as PrimitiveSwitch } from "./animate-ui/primitives/radix/switch";
// === MAIN APPLICATION COMPONENTS ===
export { AppBreadcrumbs as Breadcrumbs } from "./app-breadcrumbs";
export { AppSidebar as Sidebar } from "./app-sidebar";
export { BlurAnswerToggle } from "./blur-answer-toggle";
export { default as Header } from "./header";
export { default as LanguageSwitcher } from "./language-switcher";
export { StudyPageHeader } from "./study-page-header";
// === THEME COMPONENTS ===
export { ThemeProvider } from "./theme-provider";
export { ThemeToggle } from "./theme-toggle";
// === UI COMPONENTS (Shadcn) ===
// Alert
export {
	Alert,
	AlertDescription,
	AlertTitle,
} from "./ui/alert";
// Breadcrumb (UI)
export {
	Breadcrumb as UIBreadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "./ui/breadcrumb";
// Button
export { Button, buttonVariants } from "./ui/button";
// Card
export {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
// Dialog
export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
// Dropdown Menu
export {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
// Form Controls
export { Input } from "./ui/input";
export { Progress } from "./ui/progress";
// Select
export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
// Layout
export { Separator } from "./ui/separator";
export { Skeleton } from "./ui/skeleton";
export { UploadModal } from "./upload-modal";
export { WaveMask } from "./wave-mask";
