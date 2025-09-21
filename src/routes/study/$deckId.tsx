import { useLingui } from "@lingui/react/macro";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { StudyPageHeader } from "@/components/study-page-header";
import { WaveMask } from "@/components/wave-mask";
import { type Card, db, dbHelpers } from "@/lib/dexie-db";
import { useAppStore } from "@/store/useAppStore";
import { useDeckStore } from "@/store/useDeckStore";

export const Route = createFileRoute("/study/$deckId")({
	component: StudyPage,
});

function StudyPage() {
	const { t } = useLingui();
	const { deckId } = useParams({ from: "/study/$deckId" });
	const [cards, setCards] = useState<Card[]>([]);
	const [loading, setLoading] = useState(true);

	// Get blur preference from deck store
	const { deckBlur, setDeckBlur } = useDeckStore();
	const isBlurred = deckBlur[deckId] ?? false;
	const setIsBlurred = (blurred: boolean) => setDeckBlur(deckId, blurred);

	const [deckName, setDeckName] = useState(t`Study`);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const deck = await db.decks.get(deckId);
				if (mounted) setDeckName(deck?.name ?? t`Study`);
			} catch {
				if (mounted) setDeckName(t`Study`);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [deckId]);

	useEffect(() => {
		document.title = `${deckName} - LearnSwipe`;
	}, [deckName]);

	// Set global breadcrumbs for Header
	const { setBreadcrumbs, clearBreadcrumbs } = useAppStore();
	useEffect(() => {
		setBreadcrumbs([
			{ label: t`Home`, to: "/" },
			{ label: t`Study`, to: `/study/${deckId}` },
			{ label: deckName },
		]);
		return () => clearBreadcrumbs();
	}, [deckId, deckName, setBreadcrumbs, clearBreadcrumbs]);
	const [nextCardProgress, setNextCardProgress] = useState(0);

	useEffect(() => {
		let mounted = true;
		(async () => {
			// Always load all cards for study (no due/mastered filtering)
			const allCards = await dbHelpers.getAllCards(deckId);
			if (mounted) {
				setCards(allCards);
				setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, [deckId]);

	const top = cards[0];
	const rest = useMemo(() => cards.slice(1), [cards]);

	const onSwiped = async () => {
		if (!top || top.id == null) return;
		// In Zen mode, just cycle cards without SRS updates
		setCards((prev) => {
			if (prev.length <= 1) return prev;
			const [first, ...rest] = prev;
			return [...rest, first];
		});
		setNextCardProgress(0);
	};

	return (
		<div className="relative max-w-md mx-auto p-4 pb-24 h-full space-y-8">
			<StudyPageHeader
				deckName={String(cards.length)}
				isBlurred={isBlurred}
				onBlurToggle={setIsBlurred}
			/>
			{loading && <p className="text-muted-foreground">{t`Loading…`}</p>}
			{!loading && cards.length === 0 && (
				<div className="text-center space-y-3">
					<p className="text-foreground/80">{t`No cards in this deck!`}</p>
					<p className="text-sm text-muted-foreground">
						{t`Upload some cards to start studying.`}
					</p>
				</div>
			)}
			<div className="relative h-[65vh] w-full max-w-[420px] select-none grid place-items-center">
				{rest.slice(0, 4).map((c, i) => (
					<CardView
						key={c.id ?? i}
						card={c}
						depth={i + 1}
						disabled
						incomingProgress={i === 0 ? nextCardProgress : 0}
						isBlurred={isBlurred}
					/>
				))}
				{top && (
					<CardView
						key={top.id ?? "top"}
						card={top}
						onSwiped={onSwiped}
						onDragProgress={setNextCardProgress}
						isBlurred={isBlurred}
					/>
				)}
			</div>
		</div>
	);
}

function CardView({
	card,
	onSwiped,
	depth = 0,
	disabled = false,
	incomingProgress = 0,
	onDragProgress,
	isBlurred = false,
}: {
	card: Card;
	onSwiped?: () => void;
	depth?: number;
	disabled?: boolean;
	incomingProgress?: number;
	onDragProgress?: (progress: number) => void;
	isBlurred?: boolean;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const pointer = useRef<{
		startX: number;
		startY: number;
		dx: number;
		dy: number;
		dragging: boolean;
	}>({ startX: 0, startY: 0, dx: 0, dy: 0, dragging: false });

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		// stack appearance animation for non-top cards
		if (depth > 0) {
			const baseScale = 1 - depth * 0.03;
			const p =
				depth === 1 ? Math.max(0, Math.min(1, incomingProgress ?? 0)) : 0;
			const scale = baseScale + (1 - baseScale) * p;
			const baseOffset = -depth * 4;
			const offsetY = depth === 1 ? baseOffset * (1 - p) : baseOffset;
			el.style.transform = `translateY(${offsetY}px) scale(${scale})`;
			el.style.opacity = "1";
		} else {
			el.style.transform = "scale(1)";
			el.style.opacity = "1";
		}
	}, [depth, incomingProgress]);

	useEffect(() => {
		const el = ref.current;
		if (!el || disabled) return;

		const onDown = (e: PointerEvent) => {
			pointer.current.dragging = true;
			el.setPointerCapture(e.pointerId);
			pointer.current.startX = e.clientX;
			pointer.current.startY = e.clientY;
			pointer.current.dx = 0;
			pointer.current.dy = 0;
			onDragProgress?.(0);
		};
		const onMove = (e: PointerEvent) => {
			if (!pointer.current.dragging) return;
			pointer.current.dx = e.clientX - pointer.current.startX;
			pointer.current.dy = e.clientY - pointer.current.startY;
			const rot = pointer.current.dx * 0.05;
			el.style.transform = `translate(${pointer.current.dx}px, ${pointer.current.dy}px) rotate(${rot}deg)`;
			const absX = Math.abs(pointer.current.dx);
			const threshold = Math.min(180, window.innerWidth * 0.25);
			const ratio = Math.min(1, absX / threshold);
			onDragProgress?.(ratio);
		};
		const endDrag = async (approve: boolean | null) => {
			const dx = pointer.current.dx;
			const absX = Math.abs(dx);
			const threshold = Math.min(180, window.innerWidth * 0.25);
			if (approve === true || absX > threshold) {
				const dir =
					approve === true ? 1 : approve === false ? -1 : Math.sign(dx) || 1;
				el.style.transition =
					"transform 0.35s ease-out, opacity 0.35s ease-out";
				el.style.transform = `translate(${dir * window.innerWidth * 1.2}px, 0px) rotate(${dir * 25}deg)`;
				el.style.opacity = "0";
				onDragProgress?.(1);
				setTimeout(() => onSwiped?.(), 350);
			} else {
				el.style.transition = "transform 0.25s ease-out";
				el.style.transform = "translate(0px, 0px) rotate(0deg)";
				onDragProgress?.(0);
			}
			pointer.current.dragging = false;
		};
		const onUp = () => void endDrag(null);

		el.addEventListener("pointerdown", onDown);
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp);
		return () => {
			el.removeEventListener("pointerdown", onDown);
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
		};
	}, [disabled, onSwiped, onDragProgress]);

	return (
		<div
			ref={ref}
			className="absolute inset-0 mx-2 flex items-center justify-center"
			style={{ touchAction: "none", zIndex: 10 - depth }}
			aria-disabled={disabled}
		>
			<div className="card-inner w-full h-full rounded-xl border border-border bg-card shadow-lg perspective-1000 overflow-hidden">
				<div className="w-full h-full p-5 grid place-items-center">
					<div className="space-y-4 text-center select-text">
						<div className="text-lg leading-relaxed font-bold">
							{card.question}
						</div>
						<div className="h-px bg-border" />
						<WaveMask isBlurred={isBlurred} className="block min-h-12 py-4">
							<div className="text-base leading-relaxed text-foreground/70 font-light">
								{card.answer}
							</div>
						</WaveMask>
					</div>
				</div>
			</div>
		</div>
	);
}
