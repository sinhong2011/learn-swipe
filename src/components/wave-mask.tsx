import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

interface WaveMaskProps {
	children: React.ReactNode;
	isBlurred: boolean;
	onReveal?: () => void;
	className?: string;
}

export function WaveMask({
	children,
	isBlurred,
	onReveal,
	className,
}: WaveMaskProps) {
	const [isRevealed, setIsRevealed] = useState(false);

	const handleClick = () => {
		if (isBlurred && !isRevealed) {
			setIsRevealed(true);
			onReveal?.();
		}
	};

	// Reset revealed state when blur state changes
	useEffect(() => {
		if (!isBlurred) {
			setIsRevealed(false);
		}
	}, [isBlurred]);

	const shouldShowMask = useMemo(() => {
		return isBlurred && !isRevealed;
	}, [isBlurred, isRevealed]);

	return (
		<div className={`relative ${className || ""}`}>
			{children}

			<AnimatePresence initial={false}>
				{shouldShowMask && (
					<motion.button
						type="button"
						onPointerDown={handleClick}
						initial={{ opacity: 1, scale: 1, backdropFilter: "blur(12px)" }}
						animate={{ opacity: 1, scale: 1, backdropFilter: "blur(12px)" }}
						exit={{ opacity: 0, scale: 0.98, backdropFilter: "blur(0px)" }}
						transition={{ duration: 0.25, ease: "easeOut" }}
						aria-label="Reveal answer"
						className="absolute inset-0 cursor-pointer overflow-hidden rounded-md bg-background/40 backdrop-blur-md p-0 focus:outline-none"
					>
						{/* Subtle gradient & vignette */}
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background/30" />
						<div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] bg-foreground/5" />

						{/* Shimmer */}
						<motion.div
							className="pointer-events-none absolute inset-0"
							initial={{ x: "-100%" }}
							animate={{ x: "100%" }}
							transition={{
								duration: 1.6,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
							}}
							style={{
								background:
									"linear-gradient(90deg, transparent, hsl(var(--primary)/0.08), transparent)",
							}}
						/>

						{/* CTA */}
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="px-3 py-1.5 text-xs font-medium">Reveal</div>
						</div>
					</motion.button>
				)}
			</AnimatePresence>
		</div>
	);
}
