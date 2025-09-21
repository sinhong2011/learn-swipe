/* Minimal CSV parser supporting commas and quoted fields with escaped quotes */
import { t } from "@lingui/core/macro";

export type ParsedCSV = {
	headers: string[] | null;
	rows: string[][];
};

export function parseCsv(text: string): ParsedCSV {
	const rows: string[][] = [];
	let i = 0;
	const len = text.length;
	const current: string[] = [];
	let field = "";
	let inQuotes = false;

	function pushField() {
		current.push(field);
		field = "";
	}
	function pushRow() {
		rows.push([...current]);
		current.length = 0;
	}

	while (i < len) {
		const ch = text[i];
		if (inQuotes) {
			if (ch === '"') {
				// escaped quote
				if (text[i + 1] === '"') {
					field += '"';
					i += 2;
					continue;
				}
				inQuotes = false;
				i++;
				continue;
			}
			field += ch;
			i++;
		} else {
			if (ch === '"') {
				inQuotes = true;
				i++;
				continue;
			}
			if (ch === ",") {
				pushField();
				i++;
				continue;
			}
			if (ch === "\n") {
				pushField();
				pushRow();
				i++;
				continue;
			}
			if (ch === "\r") {
				i++;
				continue;
			}
			field += ch;
			i++;
		}
	}
	// flush last field/row
	pushField();
	if (current.length > 1 || (current.length === 1 && current[0] !== "")) {
		pushRow();
	}

	if (rows.length === 0) return { headers: null, rows: [] };

	// Conservative header detection: treat the first row as header only if it
	// contains at least one known column name like Front/Back/Question/Answer/Tags/Deck.
	const first = rows[0];
	const known = new Set([
		"front",
		"back",
		"question",
		"answer",
		"tags",
		"deck",
	]);
	const hasKnown = first.some((c) => known.has((c || "").trim().toLowerCase()));
	if (hasKnown) {
		return { headers: first.map((h) => h.trim()), rows: rows.slice(1) };
	}
	return { headers: null, rows };
}

export type CardRow = {
	question: string;
	answer: string;
	extra_fields?: Record<string, any>;
};

export function rowsToCards(
	headers: string[] | null,
	rows: string[][],
): CardRow[] {
	const out: CardRow[] = [];
	const hmap = new Map<string, number>();
	if (headers) {
		headers.forEach((h, idx) => hmap.set(h.toLowerCase(), idx));
	}
	for (const r of rows) {
		if (r.length < 2) continue;
		let q = "";
		let a = "";
		if (headers) {
			const qi = hmap.get("front") ?? hmap.get("question") ?? 0;
			const ai = hmap.get("back") ?? hmap.get("answer") ?? 1;
			q = r[qi] ?? "";
			a = r[ai] ?? "";
		} else {
			q = r[0] ?? "";
			a = r[1] ?? "";
		}
		const extra: Record<string, any> = {};
		if (headers) {
			headers.forEach((h, idx) => {
				if (idx !== 0 && idx !== 1 && r[idx] != null && r[idx] !== "")
					extra[h] = r[idx];
			});
		} else if (r.length > 2) {
			for (let i = 2; i < r.length; i++) extra[`col_${i + 1}`] = r[i];
		}
		if (q.trim() && a.trim())
			out.push({
				question: q.trim(),
				answer: a.trim(),
				extra_fields: Object.keys(extra).length ? extra : undefined,
			});
	}
	return out;
}

export function validateAnkiLike(rows: CardRow[]): {
	ok: boolean;
	message?: string;
} {
	if (!rows.length)
		return {
			ok: false,
			message: t`No valid rows found (need at least 1 with two columns).`,
		};
	return { ok: true };
}
