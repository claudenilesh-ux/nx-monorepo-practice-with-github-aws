import Page from '../src/app/page';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('next/navigation', () => ({ redirect: jest.fn() }));

it('sends signed-out visitors to sign-in', async () => {
  jest.mocked(auth).mockResolvedValue({ userId: null } as Awaited<ReturnType<typeof auth>>);
  await Page();
  expect(redirect).toHaveBeenCalledWith('/sign-in');
});

it('sends signed-in visitors to the editor', async () => {
  jest.mocked(auth).mockResolvedValue({ userId: 'user_test' } as Awaited<ReturnType<typeof auth>>);
  await Page();
  expect(redirect).toHaveBeenCalledWith('/editor');
});
