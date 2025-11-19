/**
 * ランク表示のスタイルとアイコンを管理
 */

import { RANK_STYLES } from './constants';

/**
 * ランクに応じたスタイルクラスを取得
 */
export function getRankStyle(rank: number): string {
  if (rank === 1) return `${RANK_STYLES.GOLD.text} ${RANK_STYLES.GOLD.shadow}`;
  if (rank === 2) return `${RANK_STYLES.SILVER.text} ${RANK_STYLES.SILVER.shadow}`;
  if (rank === 3) return `${RANK_STYLES.BRONZE.text} ${RANK_STYLES.BRONZE.shadow}`;
  return `${RANK_STYLES.DEFAULT.text} ${RANK_STYLES.DEFAULT.shadow}`;
}

/**
 * ランクに応じたアイコンクラスを取得
 */
export function getRankIcon(rank: number): string | null {
  if (rank <= 3) return 'ri-medal-line';
  return null;
}

