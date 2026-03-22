import { expect, test } from '@playwright/test';

const sessionUser = {
  id: 'user-1',
  email: 'ana@example.com',
  name: 'Ana',
  wellnessScore: 50,
  streakDays: 3,
};

async function mockRegister(page: import('@playwright/test').Page) {
  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
        body: JSON.stringify({
          user: sessionUser,
        }),
      });
  });
}

async function mockLogin(page: import('@playwright/test').Page) {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
        body: JSON.stringify({
          user: sessionUser,
        }),
      });
  });
}

async function mockMoodApi(page: import('@playwright/test').Page) {
  await page.route('**/api/mood?limit=30', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        entries: [],
        total: 0,
        todayCount: 0,
      }),
    });
  });

  await page.route('**/api/mood', async (route) => {
    const body = route.request().postDataJSON() as { score?: number; emotion?: string };
    const isCrisis = (body.score ?? 10) <= 3;

    await route.fulfill({
      status: isCrisis ? 200 : 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'mood-entry-1',
        score: body.score ?? 5,
        emotion: body.emotion ?? 'tranquilo',
        isCrisis,
        createdAt: new Date().toISOString(),
        wellnessScore: isCrisis ? 47 : 55,
      }),
    });
  });
}

async function mockChatApi(page: import('@playwright/test').Page) {
  await page.route('**/api/chat', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          conversationId: null,
          messages: [],
          crisis: { detected: false, source: 'none' },
          dailyCount: 0,
          remainingMessages: 50,
        }),
      });
      return;
    }

    const body = route.request().postDataJSON() as { message?: string };
    const isCrisis = /want to die|suicidio/i.test(body.message ?? '');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        conversationId: 'chat-1',
        messages: [
          {
            id: 'message-1',
            role: 'user',
            content: body.message ?? '',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'message-2',
            role: 'assistant',
            content: isCrisis
              ? 'Please contact a crisis line or someone you trust right now. I am here with you.'
              : 'Let us work through this together, one step at a time.',
            createdAt: new Date().toISOString(),
          },
        ],
        crisis: { detected: isCrisis, source: isCrisis ? 'user_message' : 'none' },
        dailyCount: 1,
        remainingMessages: 49,
      }),
    });
  });
}

async function mockSession(page: import('@playwright/test').Page) {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: sessionUser,
      }),
    });
  });
}

test.describe('Critical user flows', () => {
  test('register happy path reaches the dashboard', async ({ page }) => {
    await mockRegister(page);

    await page.goto('/register');
    await page.getByLabel(/name|nombre/i).fill('Ana');
    await page.getByLabel(/email/i).fill('ana@example.com');
    await page.getByLabel(/password|contrase\u00f1a/i).fill('Password123');
    await page.getByRole('button', { name: /create account|crear cuenta/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Ana' })).toBeVisible();
  });

  test('login happy path reaches the dashboard', async ({ page }) => {
    await mockLogin(page);

    await page.goto('/login');
    await page.getByLabel(/email/i).fill('ana@example.com');
    await page.getByLabel(/password|contrase\u00f1a/i).fill('Password123');
    await page.getByRole('button', { name: /sign in|iniciar sesi\u00f3n/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Ana' })).toBeVisible();
  });

  test('mood entry flow shows the crisis modal for crisis scores', async ({ page }) => {
    await mockSession(page);
    await mockMoodApi(page);

    await page.goto('/mood');
    const slider = page.getByRole('slider');
    await slider.press('Home');
    await page.getByRole('button', { name: /sad|triste/i }).click();
    await page.getByRole('button', { name: /save entry|guardar registro/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('link', { name: /call 988 now|call 106 now|llamar al 106 ahora/i })).toBeVisible();
  });

  test('chat crisis flow surfaces the support modal', async ({ page }) => {
    await mockSession(page);
    await mockChatApi(page);

    await page.goto('/chat');
    await page.getByLabel(/what feels most present right now|que se siente mas presente ahora mismo/i).fill('I want to die');
    await page.getByRole('button', { name: /send message|enviar mensaje/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('link', { name: /call 988 now|call 106 now|llamar al 106 ahora/i })).toBeVisible();
  });
});
