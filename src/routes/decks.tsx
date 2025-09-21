import { useLingui } from "@lingui/react/macro";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	BarChart3,
	BookOpen,
	Download,
	MoreVertical,
	Play,
	Trash2,
	Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDocumentTitle } from "@/hooks/useDocumentTitle";

import { useAppStore } from "@/store/useAppStore";
import { type DeckWithStats, useDeckStore } from "@/store/useDeckStore";

export const Route = createFileRoute("/decks")({
	component: DecksPage,
});
// Route definition

function DecksPage() {
	const { t } = useLingui();
	const navigate = useNavigate();
	const { setUploadModalOpen } = useAppStore();
	const {
		loadDecksWithStats,
		deleteDeck: deleteDeckFromStore,
		isLoading,
		clearError,
	} = useDeckStore();
	const [decksWithStats, setDecksWithStats] = useState<DeckWithStats[]>([]);
	const [error, setError] = useState<string | null>(null);

	useDocumentTitle(`${t`Deck Management`} - LearnSwipe`);

	const loadDecks = async () => {
		try {
			setError(null);
			clearError();

			// Use deck store to load decks with stats
			const decksWithStatsData = await loadDecksWithStats();
			setDecksWithStats(decksWithStatsData);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to load decks";
			setError(errorMessage);
			console.error("Failed to load decks:", err);
		}
	};

	useEffect(() => {
		loadDecks();
	}, []);

	const handleStudyDeck = (deckId: string) => {
		navigate({ to: "/study/$deckId", params: { deckId } });
	};

	const handleDeleteDeck = async (deck: DeckWithStats) => {
		if (
			!confirm(
				t`Are you sure you want to delete "${deck.name}"? This action cannot be undone.`,
			)
		) {
			return;
		}

		try {
			await deleteDeckFromStore(deck.deck_id);
			await loadDecks(); // Refresh the list
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : t`Failed to delete deck`;
			setError(errorMessage);
		}
	};

	const handleExportDeck = async (_deck: DeckWithStats) => {
		// TODO: Implement CSV export functionality
		alert(t`Export functionality will be implemented soon.`);
	};

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="mt-2 text-muted-foreground">{t`Loading decks...`}</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
				<Button onClick={loadDecks} className="mt-4">
					{t`Try Again`}
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">{t`Deck Management`}</h1>
				<Button onClick={() => setUploadModalOpen(true)}>
					<Upload className="h-4 w-4 mr-2" />
					{t`Add Deck`}
				</Button>
			</div>

			{decksWithStats.length === 0 ? (
				<div className="text-center max-w-md mx-auto">
					<BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
					<h2 className="text-xl font-semibold mb-2">{t`No decks yet`}</h2>
					<p className="text-muted-foreground mb-6">
						{t`Create your first deck to start learning with spaced repetition.`}
					</p>
					<Button onClick={() => setUploadModalOpen(true)} size="lg">
						<Upload className="h-4 w-4 mr-2" />
						{t`Upload Your First Deck`}
					</Button>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{decksWithStats.map((deck) => (
						<Card
							key={deck.deck_id}
							className="hover:shadow-md transition-shadow"
						>
							<CardHeader className="pb-3">
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<CardTitle className="text-lg">{deck.name}</CardTitle>
										<CardDescription className="mt-1">
											{t`${deck.stats?.total || 0} cards • ${deck.stats?.mastered || 0} mastered`}
										</CardDescription>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreVertical className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => handleExportDeck(deck)}>
												<Download className="h-4 w-4 mr-2" />
												{t`Export CSV`}
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleDeleteDeck(deck)}
												className="text-destructive"
											>
												<Trash2 className="h-4 w-4 mr-2" />
												{t`Delete`}
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{/* Progress bar */}
									<div className="space-y-1">
										<div className="flex justify-between text-sm">
											<span>{t`Progress`}</span>
											<span>
												{Math.round(
													((deck.stats?.mastered || 0) /
														(deck.stats?.total || 1)) *
														100,
												)}
												%
											</span>
										</div>
										<div className="w-full bg-secondary rounded-full h-2">
											<div
												className="bg-primary h-2 rounded-full transition-all"
												style={{
													width: `${((deck.stats?.mastered || 0) / (deck.stats?.total || 1)) * 100}%`,
												}}
											/>
										</div>
									</div>

									{/* Stats */}
									<div className="flex justify-between text-sm text-muted-foreground">
										<span className="flex items-center gap-1">
											<BarChart3 className="h-3 w-3" />
											{t`${deck.stats?.due || 0} due`}
										</span>
									</div>

									{/* Actions */}
									<div className="flex gap-2 pt-2">
										<Button
											onClick={() => handleStudyDeck(deck.deck_id)}
											className="flex-1"
											variant={
												(deck.stats?.due || 0) === 0 ? "outline" : "default"
											}
										>
											<Play className="h-4 w-4 mr-2" />
											{(deck.stats?.due || 0) === 0 ? t`Review All` : t`Study`}
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
