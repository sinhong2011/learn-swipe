import { useLingui } from "@lingui/react/macro";
import { useId } from "react";
import { Switch } from "@/components/animate-ui/components/radix/switch";

interface BlurAnswerToggleProps {
	isBlurred: boolean;
	onToggle: (blurred: boolean) => void;
	className?: string;
}

export function BlurAnswerToggle({
	isBlurred,
	onToggle,
	className,
}: BlurAnswerToggleProps) {
	const { t } = useLingui();
	const switchId = useId();
	return (
		<div className={`flex items-center gap-2 ${className || ""}`}>
			<label
				htmlFor={switchId}
				className="text-sm font-medium text-foreground cursor-pointer select-none"
			>
				{t`Blur Answer`}
			</label>
			<Switch
				id={switchId}
				checked={isBlurred}
				onCheckedChange={onToggle}
				className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
			/>
		</div>
	);
}
