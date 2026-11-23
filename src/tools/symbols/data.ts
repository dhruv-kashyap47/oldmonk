/**
 * Curated symbol catalog for the symbols page. Every character appears once so
 * a copied symbol has a single name. Framework-free: no DOM, storage, or
 * network access.
 */

export type SymbolCategoryId =
  | "hearts"
  | "stars"
  | "arrows"
  | "currency"
  | "math"
  | "punctuation"
  | "aesthetic"
  | "games";

export interface SymbolEntry {
  readonly char: string;
  readonly name: string;
  readonly keywords: readonly string[];
  readonly category: SymbolCategoryId;
}

export interface SymbolCategory {
  readonly id: SymbolCategoryId;
  readonly name: string;
  readonly symbols: readonly SymbolEntry[];
}

interface RawSymbol {
  readonly char: string;
  readonly name: string;
  readonly keywords: readonly string[];
}

function category(
  id: SymbolCategoryId,
  name: string,
  raw: readonly RawSymbol[],
): SymbolCategory {
  return {
    id,
    name,
    symbols: raw.map((entry) => ({ ...entry, category: id })),
  };
}

export const SYMBOL_CATEGORIES: readonly SymbolCategory[] = [
  category("hearts", "Hearts", [
    { char: "♥", name: "Black heart suit", keywords: ["heart", "love", "card suit"] },
    { char: "♡", name: "White heart suit", keywords: ["heart", "love", "outline"] },
    { char: "❤", name: "Heavy black heart", keywords: ["heart", "love", "red"] },
    { char: "❥", name: "Rotated heart bullet", keywords: ["heart", "love", "bullet"] },
    { char: "❣", name: "Heart exclamation", keywords: ["heart", "love", "exclamation"] },
    { char: "❦", name: "Floral heart", keywords: ["heart", "flower", "ornament"] },
    { char: "❧", name: "Rotated floral heart", keywords: ["heart", "flower", "ornament"] },
    { char: "💖", name: "Sparkling heart", keywords: ["heart", "love", "sparkle"] },
    { char: "💗", name: "Growing heart", keywords: ["heart", "love", "grow"] },
    { char: "💓", name: "Beating heart", keywords: ["heart", "love", "beat"] },
    { char: "💕", name: "Two hearts", keywords: ["hearts", "love", "pair"] },
    { char: "💘", name: "Heart with arrow", keywords: ["heart", "love", "cupid"] },
    { char: "💝", name: "Heart with ribbon", keywords: ["heart", "love", "gift"] },
    { char: "💞", name: "Revolving hearts", keywords: ["hearts", "love", "spin"] },
    { char: "💟", name: "Heart decoration", keywords: ["heart", "love", "decoration"] },
    { char: "💔", name: "Broken heart", keywords: ["heart", "sad", "breakup"] },
    { char: "🩷", name: "Pink heart", keywords: ["heart", "pink", "love"] },
    { char: "🫶", name: "Heart hands", keywords: ["heart", "hands", "love"] },
  ]),
  category("stars", "Stars", [
    { char: "★", name: "Black star", keywords: ["star", "filled", "rating"] },
    { char: "☆", name: "White star", keywords: ["star", "outline", "rating"] },
    { char: "✦", name: "Four pointed star", keywords: ["star", "sparkle", "four point"] },
    { char: "✧", name: "White four pointed star", keywords: ["star", "sparkle", "outline"] },
    { char: "✩", name: "Outlined star", keywords: ["star", "outline"] },
    { char: "✪", name: "Circled star", keywords: ["star", "circle", "badge"] },
    { char: "✫", name: "Open centre star", keywords: ["star", "open centre"] },
    { char: "✬", name: "Black centre star", keywords: ["star", "centre"] },
    { char: "✭", name: "Outlined black star", keywords: ["star", "outline"] },
    { char: "✮", name: "Heavy outlined star", keywords: ["star", "outline", "heavy"] },
    { char: "✯", name: "Pinwheel star", keywords: ["star", "pinwheel"] },
    { char: "✰", name: "Shadowed star", keywords: ["star", "shadow"] },
    { char: "⭐", name: "Star emoji", keywords: ["star", "emoji", "gold"] },
    { char: "🌟", name: "Glowing star", keywords: ["star", "glow", "emoji"] },
    { char: "✨", name: "Sparkles", keywords: ["sparkles", "star", "emoji"] },
    { char: "✴", name: "Eight pointed star", keywords: ["star", "eight point"] },
    { char: "❇", name: "Sparkle", keywords: ["sparkle", "star"] },
    { char: "⁂", name: "Asterism", keywords: ["asterism", "stars", "three"] },
  ]),
  category("arrows", "Arrows", [
    { char: "←", name: "Left arrow", keywords: ["left", "arrow", "back"] },
    { char: "→", name: "Right arrow", keywords: ["right", "arrow", "next"] },
    { char: "↑", name: "Up arrow", keywords: ["up", "arrow"] },
    { char: "↓", name: "Down arrow", keywords: ["down", "arrow"] },
    { char: "↔", name: "Left right arrow", keywords: ["left", "right", "arrow", "both"] },
    { char: "↕", name: "Up down arrow", keywords: ["up", "down", "arrow"] },
    { char: "⇐", name: "Left double arrow", keywords: ["left", "double", "arrow"] },
    { char: "⇒", name: "Right double arrow", keywords: ["right", "double", "arrow"] },
    { char: "⇑", name: "Up double arrow", keywords: ["up", "double", "arrow"] },
    { char: "⇓", name: "Down double arrow", keywords: ["down", "double", "arrow"] },
    { char: "⇔", name: "Left right double arrow", keywords: ["left", "right", "double"] },
    { char: "↖", name: "Up left arrow", keywords: ["up", "left", "diagonal"] },
    { char: "↗", name: "Up right arrow", keywords: ["up", "right", "diagonal"] },
    { char: "↘", name: "Down right arrow", keywords: ["down", "right", "diagonal"] },
    { char: "↙", name: "Down left arrow", keywords: ["down", "left", "diagonal"] },
    { char: "➜", name: "Heavy right arrow", keywords: ["right", "arrow", "heavy"] },
    { char: "➤", name: "Right arrowhead", keywords: ["right", "arrowhead", "bullet"] },
    { char: "▶", name: "Right triangle", keywords: ["play", "right", "triangle"] },
    { char: "◀", name: "Left triangle", keywords: ["play", "left", "triangle"] },
    { char: "↺", name: "Anticlockwise arrow", keywords: ["refresh", "rotate", "anticlockwise"] },
    { char: "↻", name: "Clockwise arrow", keywords: ["refresh", "rotate", "clockwise"] },
    { char: "↩", name: "Left arrow with hook", keywords: ["return", "reply", "arrow"] },
    { char: "↪", name: "Right arrow with hook", keywords: ["forward", "arrow", "hook"] },
  ]),
  category("currency", "Currency", [
    { char: "$", name: "Dollar sign", keywords: ["dollar", "usd", "money"] },
    { char: "€", name: "Euro sign", keywords: ["euro", "eur", "money"] },
    { char: "£", name: "Pound sign", keywords: ["pound", "sterling", "money"] },
    { char: "¥", name: "Yen sign", keywords: ["yen", "yuan", "money"] },
    { char: "₹", name: "Rupee sign", keywords: ["rupee", "inr", "money"] },
    { char: "₩", name: "Won sign", keywords: ["won", "krw", "money"] },
    { char: "₽", name: "Ruble sign", keywords: ["ruble", "rub", "money"] },
    { char: "₿", name: "Bitcoin sign", keywords: ["bitcoin", "crypto", "money"] },
    { char: "¢", name: "Cent sign", keywords: ["cent", "penny", "money"] },
    { char: "₪", name: "Shekel sign", keywords: ["shekel", "ils", "money"] },
    { char: "₫", name: "Dong sign", keywords: ["dong", "vnd", "money"] },
    { char: "₱", name: "Peso sign", keywords: ["peso", "php", "money"] },
    { char: "₴", name: "Hryvnia sign", keywords: ["hryvnia", "uah", "money"] },
    { char: "₦", name: "Naira sign", keywords: ["naira", "ngn", "money"] },
    { char: "₡", name: "Colon sign", keywords: ["colon", "crc", "money"] },
    { char: "₲", name: "Guarani sign", keywords: ["guarani", "pyg", "money"] },
    { char: "₵", name: "Cedi sign", keywords: ["cedi", "ghs", "money"] },
    { char: "₭", name: "Kip sign", keywords: ["kip", "lak", "money"] },
    { char: "₺", name: "Lira sign", keywords: ["lira", "try", "money"] },
    { char: "฿", name: "Baht sign", keywords: ["baht", "thb", "money"] },
    { char: "֏", name: "Dram sign", keywords: ["dram", "amd", "money"] },
    { char: "₣", name: "Franc sign", keywords: ["franc", "money"] },
  ]),
  category("math", "Math", [
    { char: "±", name: "Plus minus", keywords: ["plus minus", "math", "tolerance"] },
    { char: "×", name: "Multiplication sign", keywords: ["multiply", "times", "math"] },
    { char: "÷", name: "Division sign", keywords: ["divide", "math", "obelus"] },
    { char: "≠", name: "Not equal", keywords: ["not equal", "math", "compare"] },
    { char: "≈", name: "Almost equal", keywords: ["approximately", "math", "compare"] },
    { char: "≤", name: "Less than or equal", keywords: ["less", "math", "compare"] },
    { char: "≥", name: "Greater than or equal", keywords: ["greater", "math", "compare"] },
    { char: "∞", name: "Infinity", keywords: ["infinity", "math", "endless"] },
    { char: "∑", name: "Summation", keywords: ["sum", "sigma", "math"] },
    { char: "∏", name: "Product", keywords: ["product", "pi", "math"] },
    { char: "∫", name: "Integral", keywords: ["integral", "calculus", "math"] },
    { char: "√", name: "Square root", keywords: ["root", "radical", "math"] },
    { char: "∆", name: "Increment", keywords: ["delta", "change", "math"] },
    { char: "∇", name: "Nabla", keywords: ["gradient", "del", "math"] },
    { char: "∂", name: "Partial differential", keywords: ["partial", "calculus", "math"] },
    { char: "Ω", name: "Ohm sign", keywords: ["ohm", "resistance", "math"] },
    { char: "π", name: "Pi", keywords: ["pi", "circle", "math"] },
    { char: "µ", name: "Micro sign", keywords: ["micro", "prefix", "math"] },
    { char: "∠", name: "Angle", keywords: ["angle", "geometry", "math"] },
    { char: "⊥", name: "Perpendicular", keywords: ["perpendicular", "up tack", "math"] },
    { char: "∈", name: "Element of", keywords: ["element", "set", "math"] },
    { char: "∉", name: "Not an element of", keywords: ["not element", "set", "math"] },
    { char: "∅", name: "Empty set", keywords: ["empty set", "null", "math"] },
    { char: "∩", name: "Intersection", keywords: ["intersection", "set", "math"] },
    { char: "∪", name: "Union", keywords: ["union", "set", "math"] },
    { char: "∴", name: "Therefore", keywords: ["therefore", "logic", "math"] },
  ]),
  category("punctuation", "Punctuation", [
    { char: "•", name: "Bullet", keywords: ["bullet", "dot", "list"] },
    { char: "·", name: "Middle dot", keywords: ["dot", "separator", "middle"] },
    { char: "…", name: "Ellipsis", keywords: ["ellipsis", "dots", "more"] },
    { char: "¡", name: "Inverted exclamation", keywords: ["exclamation", "spanish", "punctuation"] },
    { char: "¿", name: "Inverted question", keywords: ["question", "spanish", "punctuation"] },
    { char: "«", name: "Left guillemet", keywords: ["quote", "guillemet", "punctuation"] },
    { char: "»", name: "Right guillemet", keywords: ["quote", "guillemet", "punctuation"] },
    { char: "“", name: "Left double quote", keywords: ["quote", "punctuation"] },
    { char: "”", name: "Right double quote", keywords: ["quote", "punctuation"] },
    { char: "‘", name: "Left single quote", keywords: ["quote", "punctuation"] },
    { char: "’", name: "Right single quote", keywords: ["apostrophe", "quote"] },
    { char: "‽", name: "Interrobang", keywords: ["interrobang", "question", "exclamation"] },
    { char: "⁉", name: "Exclamation question", keywords: ["interrobang", "emoji", "question"] },
    { char: "⁈", name: "Question exclamation", keywords: ["interrobang", "question"] },
    { char: "※", name: "Reference mark", keywords: ["reference", "note", "punctuation"] },
    { char: "‣", name: "Triangular bullet", keywords: ["bullet", "triangle", "list"] },
    { char: "⁃", name: "Hyphen bullet", keywords: ["bullet", "hyphen", "list"] },
    { char: "⁌", name: "Leftwards bullet", keywords: ["bullet", "ornament"] },
    { char: "⁍", name: "Rightwards bullet", keywords: ["bullet", "ornament"] },
    { char: "⁎", name: "Low asterisk", keywords: ["asterisk", "note", "reference"] },
    { char: "†", name: "Dagger", keywords: ["dagger", "footnote", "reference"] },
    { char: "‡", name: "Double dagger", keywords: ["dagger", "footnote", "reference"] },
    { char: "§", name: "Section sign", keywords: ["section", "legal", "reference"] },
    { char: "¶", name: "Pilcrow", keywords: ["paragraph", "pilcrow", "reference"] },
  ]),
  category("aesthetic", "Aesthetic", [
    { char: "✿", name: "Black florette", keywords: ["flower", "floral", "aesthetic"] },
    { char: "❀", name: "White florette", keywords: ["flower", "floral", "aesthetic"] },
    { char: "❁", name: "Outlined florette", keywords: ["flower", "floral", "outline"] },
    { char: "❃", name: "Teardrop asterisk", keywords: ["flower", "asterisk", "aesthetic"] },
    { char: "❋", name: "Propeller asterisk", keywords: ["flower", "asterisk", "propeller"] },
    { char: "✺", name: "Sixteen pointed asterisk", keywords: ["asterisk", "sparkle"] },
    { char: "✻", name: "Heavy teardrop asterisk", keywords: ["asterisk", "sparkle", "heavy"] },
    { char: "✼", name: "Open centre asterisk", keywords: ["asterisk", "sparkle"] },
    { char: "✽", name: "Pinwheel asterisk", keywords: ["asterisk", "pinwheel"] },
    { char: "❉", name: "Balloon asterisk", keywords: ["asterisk", "snowflake", "aesthetic"] },
    { char: "❊", name: "Eight teardrop asterisk", keywords: ["asterisk", "snowflake"] },
    { char: "☾", name: "Last quarter moon", keywords: ["moon", "night", "aesthetic"] },
    { char: "☽", name: "First quarter moon", keywords: ["moon", "night", "aesthetic"] },
    { char: "☁", name: "Cloud", keywords: ["cloud", "weather", "sky"] },
    { char: "☂", name: "Umbrella", keywords: ["umbrella", "rain", "weather"] },
    { char: "☘", name: "Shamrock", keywords: ["clover", "luck", "plant"] },
    { char: "☯", name: "Yin yang", keywords: ["yin yang", "balance", "symbol"] },
    { char: "⚘", name: "Flower", keywords: ["flower", "bulb", "plant"] },
    { char: "༄", name: "Tibetan initial mark", keywords: ["tibetan", "swirl", "ornament"] },
    { char: "・", name: "Katakana middle dot", keywords: ["dot", "japanese", "separator"] },
    { char: "｡", name: "Halfwidth full stop", keywords: ["dot", "japanese", "period"] },
    { char: "˚", name: "Ring above", keywords: ["ring", "dot", "aesthetic"] },
  ]),
  category("games", "Games", [
    { char: "♠", name: "Spade suit", keywords: ["spade", "card", "game"] },
    { char: "♣", name: "Club suit", keywords: ["club", "card", "game"] },
    { char: "♦", name: "Diamond suit", keywords: ["diamond", "card", "game"] },
    { char: "♤", name: "White spade suit", keywords: ["spade", "outline", "card"] },
    { char: "♧", name: "White club suit", keywords: ["club", "outline", "card"] },
    { char: "♢", name: "White diamond suit", keywords: ["diamond", "outline", "card"] },
    { char: "♔", name: "White chess king", keywords: ["chess", "king", "game"] },
    { char: "♕", name: "White chess queen", keywords: ["chess", "queen", "game"] },
    { char: "♖", name: "White chess rook", keywords: ["chess", "rook", "game"] },
    { char: "♗", name: "White chess bishop", keywords: ["chess", "bishop", "game"] },
    { char: "♘", name: "White chess knight", keywords: ["chess", "knight", "game"] },
    { char: "♙", name: "White chess pawn", keywords: ["chess", "pawn", "game"] },
    { char: "♚", name: "Black chess king", keywords: ["chess", "king", "game"] },
    { char: "♛", name: "Black chess queen", keywords: ["chess", "queen", "game"] },
    { char: "♜", name: "Black chess rook", keywords: ["chess", "rook", "game"] },
    { char: "♝", name: "Black chess bishop", keywords: ["chess", "bishop", "game"] },
    { char: "♞", name: "Black chess knight", keywords: ["chess", "knight", "game"] },
    { char: "♟", name: "Black chess pawn", keywords: ["chess", "pawn", "game"] },
    { char: "⚀", name: "Die face one", keywords: ["dice", "one", "game"] },
    { char: "⚁", name: "Die face two", keywords: ["dice", "two", "game"] },
    { char: "⚂", name: "Die face three", keywords: ["dice", "three", "game"] },
    { char: "⚃", name: "Die face four", keywords: ["dice", "four", "game"] },
    { char: "⚄", name: "Die face five", keywords: ["dice", "five", "game"] },
    { char: "⚅", name: "Die face six", keywords: ["dice", "six", "game"] },
    { char: "🎲", name: "Game die", keywords: ["dice", "game", "emoji"] },
    { char: "🎮", name: "Game controller", keywords: ["game", "controller", "emoji"] },
    { char: "🕹", name: "Joystick", keywords: ["joystick", "game", "emoji"] },
    { char: "🃏", name: "Joker card", keywords: ["joker", "card", "game"] },
    { char: "🎯", name: "Direct hit", keywords: ["target", "dart", "game"] },
    { char: "🏆", name: "Trophy", keywords: ["trophy", "win", "game"] },
  ]),
];

export const ALL_SYMBOLS: readonly SymbolEntry[] = SYMBOL_CATEGORIES.flatMap(
  (entry) => entry.symbols,
);

export function categoryName(id: SymbolCategoryId): string {
  return SYMBOL_CATEGORIES.find((entry) => entry.id === id)?.name ?? id;
}
