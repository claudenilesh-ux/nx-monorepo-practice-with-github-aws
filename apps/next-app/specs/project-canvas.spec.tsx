import { act, fireEvent, render, screen } from '@testing-library/react';
import ProjectCanvas from '../src/app/editor/project-canvas';

it('zooms, clamps, pans by keyboard and resets the view', () => {
  render(<ProjectCanvas />);
  const canvas = screen.getByLabelText('Project canvas');
  fireEvent.keyDown(canvas, { key: 'ArrowRight' });
  for (let i = 0; i < 20; i++) fireEvent.click(screen.getByText('Zoom in'));
  expect(screen.getByText('200%')).toBeTruthy();
  expect(screen.getByText('Zoom in').hasAttribute('disabled')).toBe(true);
  fireEvent.click(screen.getByText('Reset'));
  expect(screen.getByText('100%')).toBeTruthy();
});

it('moves the grid with keyboard pan and resets it', () => {
  render(<ProjectCanvas />);
  const canvas = screen.getByLabelText('Project canvas');
  fireEvent.keyDown(canvas, { key: 'ArrowRight' });
  expect(canvas.style.getPropertyValue('--grid-x')).toBe('20px');
  fireEvent.click(screen.getByText('Reset'));
  expect(canvas.style.getPropertyValue('--grid-x')).toBe('0px');
});

it('clamps zoom out at 25 percent', () => {
  render(<ProjectCanvas />);
  for (let i = 0; i < 20; i++) fireEvent.click(screen.getByText('Zoom out'));
  expect(screen.getByText('25%')).toBeTruthy();
  expect(screen.getByText('Zoom out').hasAttribute('disabled')).toBe(true);
});

it('opens and closes the component library without resetting the canvas', () => {
  render(<ProjectCanvas />);
  const canvas = screen.getByLabelText('Project canvas');
  fireEvent.keyDown(canvas, { key: 'ArrowRight' });
  fireEvent.click(screen.getByText('Components'));
  expect(document.querySelector('sic-component-library')).toBeTruthy();
  act(() => { document.querySelector('sic-component-library')!.dispatchEvent(new CustomEvent('component-library-close', { bubbles: true })); });
  expect(document.querySelector('sic-component-library')).toBeNull();
  expect(canvas.style.getPropertyValue('--grid-x')).toBe('20px');
});
