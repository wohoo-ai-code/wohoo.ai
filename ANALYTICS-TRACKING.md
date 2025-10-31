# wohoo.ai - Enhanced Analytics Tracking

## Overview

Enhanced Google Analytics event tracking has been added to [index.html](index.html) to provide detailed insights into user behavior and engagement.

---

## Events Being Tracked

### 1. Form Engagement Events

#### `form_field_focus`
**Triggered:** When user clicks/focuses on any form field
**Parameters:**
- `event_category`: 'engagement'
- `event_label`: Field name ('name_field', 'email_field', 'phone_field')
- `field_name`: The input field ID

**Use Case:** Understand which fields users interact with most

---

#### `form_start`
**Triggered:** When user starts typing in any form field (fires once per session)
**Parameters:**
- `event_category`: 'engagement'
- `event_label`: 'user_started_typing'

**Use Case:** Track how many users start filling out the form vs just viewing

---

#### `form_submit_attempt`
**Triggered:** When user clicks "Join Waitlist" button and validation passes
**Parameters:**
- `event_category`: 'form'
- `event_label`: 'waitlist_form'
- `has_phone`: 'yes' or 'no' (whether phone number was provided)

**Use Case:** Track submission attempts, see phone number opt-in rate

---

### 2. Conversion Events

#### `signup_success`
**Triggered:** When form submission succeeds and user is added to waitlist
**Parameters:**
- `event_category`: 'conversion'
- `event_label`: 'waitlist_join'
- `value`: 1

**Use Case:** Primary conversion event - track successful signups

**Note:** This is your main KPI event. Set it as a conversion goal in GA4.

---

#### `form_error`
**Triggered:** When form submission fails (validation, duplicate email, network error)
**Parameters:**
- `event_category`: 'form'
- `event_label`: 'submission_error'
- `error_message`: The specific error message shown to user

**Use Case:** Track error rates, identify common issues

---

### 3. Navigation Events

#### `link_click`
**Triggered:** When user clicks any link on the page
**Parameters:**
- `event_category`: 'navigation'
- `event_label`: Link text or aria-label
- `link_url`: The href destination
- `link_type`: 'external' or 'internal'

**Use Case:** Track which links users click (social media, privacy, terms)

---

### 4. Engagement Events

#### `page_view`
**Triggered:** When page loads
**Parameters:**
- `event_category`: 'engagement'
- `event_label`: 'landing_page'
- `page_title`: Document title
- `page_location`: Full URL

**Use Case:** Track page views with referrer data

---

#### `engaged_user`
**Triggered:** After user spends 10 seconds on page
**Parameters:**
- `event_category`: 'engagement'
- `event_label`: '10_seconds_on_page'
- `value`: 10

**Use Case:** Measure quality traffic vs bounces

---

#### `scroll_depth`
**Triggered:** When user scrolls to 25%, 50%, 75%, and 100% of page
**Parameters:**
- `event_category`: 'engagement'
- `event_label`: '25_percent', '50_percent', '75_percent', or '100_percent'
- `value`: 25, 50, 75, or 100

**Use Case:** Understand how far users scroll, identify drop-off points

---

## Setup Required

### 1. Install Google Analytics

Add this code to the `<head>` section of [index.html](index.html) (after line 12):

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Replace `G-XXXXXXXXXX`** with your actual Google Analytics 4 Measurement ID.

### 2. Get Your Measurement ID

1. Go to [https://analytics.google.com](https://analytics.google.com)
2. Create a new GA4 property for `wohoo.ai`
3. Go to **Admin** → **Data Streams** → **Web**
4. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)
5. Replace both occurrences in the script above

### 3. Set Up Conversion Goals (Recommended)

In Google Analytics 4:

1. Go to **Admin** → **Events**
2. Mark these events as conversions:
   - ✅ `signup_success` (PRIMARY - track successful signups)
   - ✅ `form_submit_attempt` (SECONDARY - track attempt rate)

---

## How to View Analytics

### Google Analytics 4 Dashboard

**Realtime Reports:**
- Go to **Reports** → **Realtime**
- See active users and events happening right now
- Test your tracking here first

**Events Report:**
- Go to **Reports** → **Engagement** → **Events**
- See all custom events and their counts
- View parameters for each event

**Conversions:**
- Go to **Reports** → **Engagement** → **Conversions**
- See `signup_success` conversion rate
- Track your primary KPI

**Exploration:**
- Go to **Explore** → **Create New**
- Build custom reports with event parameters
- Example: "Users who focused on email field but didn't submit"

---

## Key Metrics to Track

### Conversion Funnel

1. **Page Views** (`page_view`)
   ↓
2. **Form Start** (`form_start`) - User begins typing
   ↓
3. **Submit Attempt** (`form_submit_attempt`) - User clicks button
   ↓
4. **Signup Success** (`signup_success`) - Conversion!

**Calculate:**
- **Form Start Rate:** `form_start / page_view`
- **Submit Rate:** `form_submit_attempt / form_start`
- **Success Rate:** `signup_success / form_submit_attempt`
- **Overall Conversion:** `signup_success / page_view`

### Engagement Metrics

- **Engaged Users:** Users who stay 10+ seconds (`engaged_user`)
- **Scroll Depth:** How far users scroll (25%, 50%, 75%, 100%)
- **Phone Opt-In Rate:** `has_phone: 'yes'` vs `has_phone: 'no'` in `form_submit_attempt`

### Error Analysis

- **Error Rate:** `form_error / form_submit_attempt`
- **Error Types:** Check `error_message` parameter
  - "This email is already on the waitlist!" = Duplicate signups
  - "Please enter a valid email address" = Validation issues
  - "Something went wrong" = Technical issues

### Link Tracking

- **Social Click Rate:** `link_click` with `link_label` = 'X (Twitter)' or 'Instagram'
- **Privacy/Terms Views:** Track clicks to privacy.html and terms.html
- **External vs Internal:** Use `link_type` parameter

---

## Example Google Analytics Queries

### Query 1: Conversion Rate by Traffic Source
```
Dimension: Session source/medium
Metric: signup_success (conversion rate)
```
**Insight:** Which marketing channels convert best?

### Query 2: Form Abandonment
```
Dimension: Event name
Filter: form_start = true, signup_success = false
```
**Insight:** How many users start but don't complete the form?

### Query 3: Phone Number Opt-In Rate
```
Dimension: has_phone (custom parameter)
Metric: Count of form_submit_attempt
```
**Insight:** What % of users provide phone numbers?

### Query 4: Scroll Depth Distribution
```
Dimension: Event label (for scroll_depth events)
Metric: Event count
```
**Insight:** Where do users drop off on the page?

---

## Testing Your Tracking

### Method 1: Real-Time Reports

1. Open [https://analytics.google.com](https://analytics.google.com)
2. Go to **Reports** → **Realtime**
3. In another tab, open your website
4. See yourself appear as an active user
5. Interact with the page (scroll, focus fields, submit form)
6. Watch events appear in real-time

### Method 2: Browser Console

Open browser console (F12) and run:
```javascript
// Check if gtag is loaded
console.log(typeof gtag); // Should output: "function"

// Manually trigger test event
trackEvent('test_event', { test: 'value' });
```

### Method 3: DebugView (Advanced)

1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) Chrome extension
2. Enable the extension
3. Visit your site
4. In GA4, go to **Admin** → **DebugView**
5. See all events in real-time with full details

---

## Privacy Considerations

### What's Being Tracked

✅ **Anonymous behavioral data:**
- Page views, clicks, scrolls
- Form interactions (NOT the actual data entered)
- Time on page, engagement metrics

❌ **NOT tracked:**
- User names entered in forms
- Email addresses
- Phone numbers
- Any personally identifiable information (PII)

### GDPR/Privacy Compliance

Your analytics setup is privacy-friendly:
- No PII is sent to Google Analytics
- Form data (name, email, phone) goes only to Supabase
- Users are informed via Privacy Policy link
- Consider adding a cookie consent banner if targeting EU users

**Recommended:** Update your [privacy.html](privacy.html) to mention Google Analytics usage.

---

## Performance Impact

### Script Size
- Google Analytics script: ~45 KB (loaded async)
- Custom tracking code: ~3 KB
- **Total:** <50 KB additional load

### Performance Optimizations
- ✅ GA script loaded with `async` attribute (non-blocking)
- ✅ Events sent asynchronously (no UI delay)
- ✅ Scroll events throttled by browser
- ✅ One-time events tracked with flags (no duplicates)

**Impact:** Minimal - page load time increased by <0.2 seconds

---

## Troubleshooting

### Events Not Showing Up

**Check 1: Is GA installed?**
```javascript
// In browser console:
typeof gtag === 'undefined' ? 'NOT INSTALLED' : 'INSTALLED'
```

**Check 2: Is Measurement ID correct?**
- Look at the GA script tag in your HTML
- Should be format: `G-XXXXXXXXXX`
- Verify it matches your GA4 property

**Check 3: Ad Blockers**
- Disable ad blockers (they block GA)
- Test in incognito mode
- Use DebugView for testing

**Check 4: Delay in reporting**
- Realtime: Events appear within seconds
- Standard reports: Can take 24-48 hours
- Always test with Realtime first

### Duplicate Events

If events fire multiple times:
- Check you haven't added GA script twice
- Ensure flags are used for one-time events (like `form_start`)
- Clear browser cache and test again

### Wrong Data

If parameters seem incorrect:
- Check browser console for JavaScript errors
- Verify field IDs match (`name`, `email`, `phone`)
- Test in different browsers

---

## Advanced: Custom Dashboards

Create a custom GA4 dashboard for wohoo.ai:

### Dashboard Components

1. **Overview Card**
   - Total signups (conversions)
   - Conversion rate
   - New vs returning users

2. **Funnel Visualization**
   - Page view → Form start → Submit → Success
   - Show drop-off at each stage

3. **Traffic Sources**
   - Top sources/mediums
   - Conversion rate by source
   - Social media performance

4. **Engagement Metrics**
   - Average scroll depth
   - Time on page distribution
   - Engaged users %

5. **Error Monitoring**
   - Error count by type
   - Error rate trend
   - Most common error messages

---

## Event Summary Table

| Event Name | Category | When It Fires | Key Use Case |
|-----------|----------|---------------|--------------|
| `page_view` | engagement | Page loads | Track traffic |
| `form_field_focus` | engagement | User clicks form field | Field interaction |
| `form_start` | engagement | User starts typing | Form engagement |
| `form_submit_attempt` | form | User submits form | Attempt tracking |
| `signup_success` | conversion | Successful signup | **Main KPI** |
| `form_error` | form | Submission fails | Error monitoring |
| `link_click` | navigation | User clicks link | Navigation tracking |
| `engaged_user` | engagement | 10 seconds on page | Quality traffic |
| `scroll_depth` | engagement | Scrolls to 25/50/75/100% | Content engagement |

---

## Next Steps

1. **Install GA4** - Add tracking code to [index.html](index.html)
2. **Set conversion goal** - Mark `signup_success` as conversion
3. **Test in Realtime** - Verify events fire correctly
4. **Monitor for 1 week** - Gather baseline data
5. **Optimize based on data** - Improve conversion funnel

---

## Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9267735)
- [Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)

---

**Questions?** See [PRODUCTION-READY-CHECKLIST.md](PRODUCTION-READY-CHECKLIST.md) for Google Analytics setup details.
