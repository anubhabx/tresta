import { prisma } from '@workspace/database/prisma';
import { isFreeColor } from '@workspace/types';
import { ForbiddenError } from '../lib/errors.js';

type ColorGateKind = 'brand' | 'accent';

type ColorGateInput = {
  primaryColor?: string | null;
  secondaryColor?: string | null;
};

const PLAN_GATE_MESSAGE: Record<ColorGateKind, string> = {
  brand:
    'Custom brand colors are available only for Pro plans. Please choose from the preset palette or upgrade.',
  accent:
    'Custom accent colors are available only for Pro plans. Please choose from the preset palette or upgrade.',
};

export async function assertCanUseCustomColors(
  userId: string,
  colors: ColorGateInput,
  kind: ColorGateKind = 'brand',
): Promise<void> {
  const { primaryColor, secondaryColor } = colors;

  if (!primaryColor && !secondaryColor) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (user?.plan !== 'FREE') {
    return;
  }

  const hasNonFreeColor = [primaryColor, secondaryColor].some(
    (color) => Boolean(color && !isFreeColor(color)),
  );

  if (hasNonFreeColor) {
    throw new ForbiddenError(PLAN_GATE_MESSAGE[kind]);
  }
}
