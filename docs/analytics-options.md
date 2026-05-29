# Analytics Options

The app does not include in-app tracking by default.

## GitHub Repository Traffic

- Built into GitHub for users with repository access.
- Requires no app code changes.
- Covers repository/page traffic with limited retention and detail.
- Recommended first step for basic public-interest monitoring.

## Privacy-Friendly Analytics, Future Option

- Services such as Plausible, GoatCounter, or similar tools can provide simple
  page-view metrics with less tracking overhead than advertising-oriented
  analytics.
- Any future integration should be configurable, documented, and easy to remove.
- Privacy notes should state what is collected and whether cookies are used.

## Google Analytics 4, Future Option

- Possible through a GA4 Measurement ID and a tracking tag.
- Requires explicit configuration and public privacy/cookie-consent review.
- Should not be enabled by default in this static research prototype.

## Recommended Current Stance

Use GitHub traffic first. Add no tracking script by default. If in-app analytics
are needed later, make them opt-in/configurable and document the privacy impact
before deployment.
