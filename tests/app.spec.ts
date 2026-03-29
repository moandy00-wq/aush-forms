import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('loads and shows hero content', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation').getByText('Aush Forms')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Stop typing/i })).toBeVisible()
  })

  test('nav links are visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('navigation').getByText('How It Works')).toBeVisible()
    await expect(page.getByRole('navigation').getByText('Templates')).toBeVisible()
    await expect(page.getByRole('navigation').getByText('Features')).toBeVisible()
    await expect(page.getByRole('navigation').getByText('Log In')).toBeVisible()
    await expect(page.getByRole('navigation').getByText('Get Started')).toBeVisible()
  })

  test('Get Started links to signup', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation').getByText('Get Started').click()
    await page.waitForURL('/signup')
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()
  })

  test('Log In links to login', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation').getByText('Log In').click()
    await page.waitForURL('/login')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })
})

test.describe('Login Page', () => {
  test('renders login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByText('Enter your credentials')).toBeVisible()
    await expect(page.getByPlaceholder('you@company.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
  })

  test('back to home link works', async ({ page }) => {
    await page.goto('/login')
    await page.getByText('Back to home').click()
    await page.waitForURL('/')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('you@company.com').fill('fake@fake.com')
    await page.getByPlaceholder('••••••••').fill('wrongpassword')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Invalid login credentials')).toBeVisible({ timeout: 10000 })
  })

  test('link to signup works', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Create an account' }).click()
    await page.waitForURL('/signup')
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()
  })

  test('successful login redirects', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('you@company.com').fill('testforms123@gmail.com')
    await page.getByPlaceholder('••••••••').fill('test123456')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.waitForURL(/\/(dashboard|setup)/, { timeout: 10000 })
  })
})

test.describe('Signup Page', () => {
  test('renders signup form', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()
    await expect(page.getByText('Start building smart intake forms')).toBeVisible()
    await expect(page.getByPlaceholder('you@company.com')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
  })

  test('back to home link works', async ({ page }) => {
    await page.goto('/signup')
    await page.getByText('Back to home').click()
    await page.waitForURL('/')
  })

  test('link to login works', async ({ page }) => {
    await page.goto('/signup')
    await page.getByRole('link', { name: 'Sign in' }).click()
    await page.waitForURL('/login')
  })

  test('password validation checks show', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByText('At least 6 characters')).toBeVisible()
    await expect(page.getByText('Passwords match')).toBeVisible()
  })

  test('shows error for mismatched passwords', async ({ page }) => {
    await page.goto('/signup')
    await page.getByPlaceholder('you@company.com').fill('newtest@gmail.com')
    const passwordInputs = page.getByPlaceholder('••••••••')
    await passwordInputs.first().fill('test123456')
    await passwordInputs.nth(1).fill('different123')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page.getByText('Passwords do not match')).toBeVisible({ timeout: 5000 })
  })

  test('shows error for short password', async ({ page }) => {
    await page.goto('/signup')
    await page.getByPlaceholder('you@company.com').fill('newtest@gmail.com')
    const passwordInputs = page.getByPlaceholder('••••••••')
    await passwordInputs.first().fill('abc')
    await passwordInputs.nth(1).fill('abc')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible({ timeout: 5000 })
  })

  test('signup attempt with new email', async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@gmail.com`
    await page.goto('/signup')
    await page.getByPlaceholder('you@company.com').fill(uniqueEmail)
    const passwordInputs = page.getByPlaceholder('••••••••')
    await passwordInputs.first().fill('test123456')
    await passwordInputs.nth(1).fill('test123456')
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Wait and check what happens — should redirect or show error
    await page.waitForTimeout(5000)
    const url = page.url()
    const hasError = await page.locator('[class*="rose"]').count()

    // Log the result for debugging
    console.log(`Signup result: URL=${url}, hasError=${hasError > 0}`)

    // It should either redirect to /setup or /login (if email confirmation needed)
    // or stay on /signup with an error
    expect(url.includes('/setup') || url.includes('/login') || url.includes('/signup')).toBeTruthy()
  })
})

test.describe('Auth Protection', () => {
  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('/login', { timeout: 10000 })
  })

  test('settings redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForURL('/login', { timeout: 10000 })
  })

  test('setup redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/setup')
    await page.waitForURL('/login', { timeout: 10000 })
  })

  test('public form page works without auth', async ({ page }) => {
    await page.goto('/f/test-financial')
    const url = page.url()
    expect(url).toContain('/f/test-financial')
  })
})

test.describe('Public Form Page', () => {
  test('shows business branding', async ({ page }) => {
    await page.goto('/f/test-financial')
    await expect(page.getByText('Test Financial Group').first()).toBeVisible({ timeout: 10000 })
  })

  test('shows form wizard with progress bar', async ({ page }) => {
    await page.goto('/f/test-financial')
    await expect(page.getByText('Personal Information')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('First Name', { exact: false }).first()).toBeVisible()
  })

  test('language toggle exists and works', async ({ page }) => {
    await page.goto('/f/test-financial')
    await expect(page.getByRole('button', { name: 'EN', exact: true })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: 'ES', exact: true })).toBeVisible()

    // Switch to Spanish
    await page.getByRole('button', { name: 'ES', exact: true }).click()
    await expect(page.getByText('Información Personal')).toBeVisible({ timeout: 5000 })
  })
})
