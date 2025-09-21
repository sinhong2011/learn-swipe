import { useLingui } from "@lingui/react/macro";
import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, Home, Settings } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/animate-ui/components/radix/sidebar";

export function AppSidebar() {
	const { t } = useLingui();
	const location = useLocation();

	const navigationItems = [
		{
			title: t`Home`,
			url: "/",
			icon: Home,
			isActive: location.pathname === "/",
		},
		{
			title: t`Decks`,
			url: "/decks",
			icon: BookOpen,
			isActive: location.pathname === "/decks",
		},
		{
			title: t`Settings`,
			url: "/settings",
			icon: Settings,
			isActive: location.pathname === "/settings",
		},
	];

	return (
		<Sidebar variant="inset">
			<SidebarHeader>
				<div className="flex items-center gap-2 px-2 py-2">
					<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-background text-sidebar-primary-foreground overflow-hidden">
						<img
							src="/icons/apple-touch-icon.png"
							alt="LearnSwipe"
							className="size-6 rounded-sm"
						/>
					</div>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">LearnSwipe</span>
						<span className="truncate text-xs">{t`Flashcard Learning`}</span>
					</div>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>{t`Navigation`}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navigationItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={item.isActive}>
										<Link to={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<div className="p-2 text-xs text-muted-foreground">
					{t`Version 1.0.0`}
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
