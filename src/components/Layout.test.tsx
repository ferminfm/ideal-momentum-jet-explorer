import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TRANSLATIONS } from '../i18n/translations'
import { Layout } from './Layout'

describe('Layout', () => {
  it('renders the obfuscated contact email without a mailto link', () => {
    render(
      <Layout language="en" text={TRANSLATIONS.en} onLanguageChange={vi.fn()}>
        <div>Content</div>
      </Layout>,
    )

    expect(screen.getByText(/fermin\.franco \*at\* uabc\.edu\.mx/)).toBeTruthy()
    expect(
      screen.queryByRole('link', { name: /fermin\.franco \*at\* uabc\.edu\.mx/ }),
    ).toBeNull()
  })
})
