import { useLingui } from "@lingui/react/macro";
import { Link, useLocation } from "@tanstack/react-router";
import { Fragment } from "react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAppStore } from "@/store/useAppStore";

export function AppBreadcrumbs() {
	const { t } = useLingui();
	const location = useLocation();
	const { breadcrumbs } = useAppStore();

	// Fallback: generate breadcrumbs from the current URL when store is empty
	const segments = location.pathname.split("/").filter(Boolean);

	// Direct translation mapping for known routes
	const getSegmentLabel = (seg: string): string => {
		switch (seg.toLowerCase()) {
			case "settings":
				return t`Settings`;
			case "decks":
				return t`Decks`;
			case "study":
				return t`Study`;
			case "about":
				return t`About`;
			default:
				// Fallback: Format the segment nicely
				return seg
					.replace(/([A-Z])/g, " $1") // Add space before capitals
					.replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
					.trim();
		}
	};

	const auto = [
		{ label: t`Home`, to: "/" },
		...segments.map((seg, idx) => {
			const to = `/${segments.slice(0, idx + 1).join("/")}`;
			const label = getSegmentLabel(seg);
			return { label: label || seg, to };
		}),
	];

	const items = breadcrumbs.length > 0 ? breadcrumbs : auto;

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{items.map((item, idx) => (
					<Fragment key={`${item.label}-${idx}`}>
						<BreadcrumbItem>
							{idx < items.length - 1 && item.to ? (
								<BreadcrumbLink asChild>
									<Link to={item.to}>{item.label}</Link>
								</BreadcrumbLink>
							) : (
								<BreadcrumbPage>{item.label}</BreadcrumbPage>
							)}
						</BreadcrumbItem>
						{idx < items.length - 1 ? <BreadcrumbSeparator /> : null}
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
