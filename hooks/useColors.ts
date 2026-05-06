import { Colors } from '@/constants/theme';
import { useThemeStore } from '@/stores/themeStore';

export function useColors() {
  const isDark = useThemeStore((s) => s.isDark);
  return isDark ? Colors.dark : Colors.light;
}
