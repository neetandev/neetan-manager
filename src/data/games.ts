import type { Game } from "../state/types";

export const GAMES: Game[] = [
  // PC-9800 (16 titles)
  { id: 1, system: "PC-9800", latin_name: "Princess Maker 2", japanese_name: "プリンセスメーカー2", developer_name: "Gainax", release_year: 1993 },
  { id: 2, system: "PC-9800", latin_name: "Touhou Project: Highly Responsive to Prayers", japanese_name: "東方靈異伝", developer_name: "Team Shanghai Alice", release_year: 1996 },
  { id: 3, system: "PC-9800", latin_name: "Rusty", japanese_name: "ラスティ", developer_name: "C-Lab", release_year: 1993 },
  { id: 4, system: "PC-9800", latin_name: "Brandish", japanese_name: "ブランディッシュ", developer_name: "Nihon Falcom", release_year: 1991 },
  { id: 5, system: "PC-9800", latin_name: "Sorcerian", japanese_name: "ソーサリアン", developer_name: "Nihon Falcom", release_year: 1988 },
  { id: 6, system: "PC-9800", latin_name: "Ys II", japanese_name: "イースII", developer_name: "Nihon Falcom", release_year: 1988 },
  { id: 7, system: "PC-9800", latin_name: "Xanadu Next", japanese_name: "ザナドゥ・ネクスト", developer_name: "Nihon Falcom", release_year: 1995 },
  { id: 8, system: "PC-9800", latin_name: "Dragon Slayer: The Legend of Heroes", japanese_name: "英雄伝説", developer_name: "Nihon Falcom", release_year: 1989 },
  { id: 9, system: "PC-9800", latin_name: "Policenauts", japanese_name: "ポリスノーツ", developer_name: "Konami", release_year: 1994 },
  { id: 10, system: "PC-9800", latin_name: "Snatcher", japanese_name: "スナッチャー", developer_name: "Konami", release_year: 1988 },
  { id: 11, system: "PC-9800", latin_name: "Lunatic Dawn", japanese_name: "ルナティックドーン", developer_name: "Artdink", release_year: 1993 },
  { id: 12, system: "PC-9800", latin_name: "Princess Quest", japanese_name: "プリンセスクエスト", developer_name: "Forest", release_year: 1992 },
  { id: 13, system: "PC-9800", latin_name: "Wizardry V", japanese_name: "ウィザードリィV", developer_name: "ASCII", release_year: 1992 },
  { id: 14, system: "PC-9800", latin_name: "Daiva Story 6", japanese_name: "ディーヴァ", developer_name: "T&E Soft", release_year: 1987 },
  { id: 15, system: "PC-9800", latin_name: "Emerald Dragon", japanese_name: "エメラルドドラゴン", developer_name: "Glodia", release_year: 1989 },
  { id: 16, system: "PC-9800", latin_name: "Tokio: The Legend of Hero", japanese_name: "東京", developer_name: "Microcabin", release_year: 1990 },

  // PC-8800 (10 titles)
  { id: 17, system: "PC-8800", latin_name: "Ys", japanese_name: "イース", developer_name: "Nihon Falcom", release_year: 1987 },
  { id: 18, system: "PC-8800", latin_name: "Hydlide", japanese_name: "ハイドライド", developer_name: "T&E Soft", release_year: 1984 },
  { id: 19, system: "PC-8800", latin_name: "Xanadu", japanese_name: "ザナドゥ", developer_name: "Nihon Falcom", release_year: 1985 },
  { id: 20, system: "PC-8800", latin_name: "Dragon Slayer", japanese_name: "ドラゴンスレイヤー", developer_name: "Nihon Falcom", release_year: 1984 },
  { id: 21, system: "PC-8800", latin_name: "The Black Onyx", japanese_name: "ブラックオニキス", developer_name: "BPS", release_year: 1984 },
  { id: 22, system: "PC-8800", latin_name: "Thexder", japanese_name: "テグザー", developer_name: "Game Arts", release_year: 1985 },
  { id: 23, system: "PC-8800", latin_name: "Romancia", japanese_name: "ロマンシア", developer_name: "Nihon Falcom", release_year: 1986 },
  { id: 24, system: "PC-8800", latin_name: "Snatcher", japanese_name: "スナッチャー", developer_name: "Konami", release_year: 1988 },
  { id: 25, system: "PC-8800", latin_name: "Mugen no Shinzou II", japanese_name: "夢幻の心臓II", developer_name: "Crystal Soft", release_year: 1985 },
  { id: 26, system: "PC-8800", latin_name: "Silpheed", japanese_name: "シルフィード", developer_name: "Game Arts", release_year: 1986 },

  // PC-8000 (5 titles)
  { id: 27, system: "PC-8000", latin_name: "Galaxian", japanese_name: "ギャラクシアン", developer_name: "Namco", release_year: 1981 },
  { id: 28, system: "PC-8000", latin_name: "Mystery House", japanese_name: "ミステリーハウス", developer_name: "Microcabin", release_year: 1982 },
  { id: 29, system: "PC-8000", latin_name: "Heiankyo Alien", japanese_name: "平安京エイリアン", developer_name: "TSG", release_year: 1980 },
  { id: 30, system: "PC-8000", latin_name: "Star Trek", japanese_name: "スタートレック", developer_name: "ASCII", release_year: 1981 },
  { id: 31, system: "PC-8000", latin_name: "Tiny Xevious", japanese_name: "タイニーゼビウス", developer_name: "Dempa Shimbunsha", release_year: 1984 },

  // PC-6000 (5 titles)
  { id: 32, system: "PC-6000", latin_name: "AX-2: Bombs Away", japanese_name: "AX-2 爆弾投下", developer_name: "ASCII", release_year: 1982 },
  { id: 33, system: "PC-6000", latin_name: "Mr. Pac", japanese_name: "ミスターパック", developer_name: "Hudson Soft", release_year: 1983 },
  { id: 34, system: "PC-6000", latin_name: "Punchball Mario Bros.", japanese_name: "パンチボール マリオブラザーズ", developer_name: "Hudson Soft", release_year: 1984 },
  { id: 35, system: "PC-6000", latin_name: "Colony Odyssey", japanese_name: "コロニーオデッセイ", developer_name: "Bond Soft", release_year: 1984 },
  { id: 36, system: "PC-6000", latin_name: "Utopia", japanese_name: "ユートピア", developer_name: "Mattel", release_year: 1983 },
];
