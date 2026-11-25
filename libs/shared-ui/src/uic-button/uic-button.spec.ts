import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { uicButtonStyles } from './uic-button.styles';

it('uses design tokens with AA contrast for the destructive button', () => {
  const tokens = readFileSync(resolve(process.cwd(), '../design-tokens/src/_colors.scss'), 'utf8');
  const rule = uicButtonStyles.cssText.match(/button\.destructive\s*\{([^}]+)\}/)?.[1] ?? '';
  const foreground = rule.match(/color:\s*var\((--[\w-]+)\)/)?.[1];
  const background = rule.match(/background:\s*var\((--[\w-]+)\)/)?.[1];
  const luminance = (name: string | undefined) => {
    const value = tokens.match(new RegExp(`${name}:\\s*#([0-9a-f]{6})`, 'i'))?.[1];
    if (!value) throw new Error(`Missing color token ${name}`);
    const channels = [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16) / 255)
      .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const colors = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  expect((colors[1] + 0.05) / (colors[0] + 0.05)).toBeGreaterThanOrEqual(4.5);
});
