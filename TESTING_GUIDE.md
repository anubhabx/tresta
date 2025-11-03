# Testing Guide - Bug Fixes Verification

This guide will help you verify that all the bug fixes work correctly in your Tresta application.

## Prerequisites

Before testing, ensure:
- ✅ Database is running and migrations are applied
- ✅ API server is running (`pnpm dev --filter api`)
- ✅ Web app is running (`pnpm dev --filter web`)
- ✅ Azure Blob Storage credentials are configured in `.env`
- ✅ You're signed in with a test account

---

## 🧪 Test 1: Testimonial Management (Critical Fix)

**Bug Fixed:** React Hooks violation causing mutations to fail

### Steps to Test:

1. **Navigate to a Project:**
   - Go to `/projects`
   - Click on any project with testimonials
   - Click the "Testimonials" tab

2. **Test Approve Action:**
   - Find a pending testimonial (yellow "Pending" badge)
   - Click the green "Approve" button
   - ✅ **Expected:** Success toast appears: "Testimonial approved!"
   - ✅ **Expected:** Badge changes to grey "Approved"
   - ✅ **Expected:** "Publish" button appears

3. **Test Reject Action:**
   - Find a pending testimonial
   - Click the red "Reject" button
   - ✅ **Expected:** Success toast: "Testimonial rejected"
   - ✅ **Expected:** Badge changes to "Pending" with red styling

4. **Test Publish Action:**
   - Find an approved testimonial
   - Click the blue "Publish" button
   - ✅ **Expected:** Success toast: "Testimonial published!"
   - ✅ **Expected:** Badge changes to green "Published"
   - ✅ **Expected:** "Unpublish" button appears

5. **Test Unpublish Action:**
   - Click "Unpublish" on a published testimonial
   - ✅ **Expected:** Success toast: "Testimonial unpublished"
   - ✅ **Expected:** Badge reverts to grey "Approved"

6. **Test Delete Action:**
   - Click the red trash icon
   - Confirm deletion in dialog
   - ✅ **Expected:** Success toast: "Testimonial deleted"
   - ✅ **Expected:** Testimonial removed from list

7. **Test Filtering:**
   - Use the filter dropdown to select "Pending Review"
   - ✅ **Expected:** Only pending testimonials show
   - Try other filters (Approved, Published, All)
   - ✅ **Expected:** Filters work correctly

8. **Test Search:**
   - Type an author name in the search box
   - ✅ **Expected:** List filters to matching testimonials
   - Try searching by email or content
   - ✅ **Expected:** Search works on all fields

### ❌ What Would Have Failed Before:
- Clicking approve/reject would cause React errors
- Multiple hooks would be called conditionally
- Mutations wouldn't execute properly

---

## 🧪 Test 2: Logo Upload (Critical Fix)

**Bug Fixed:** Logos using temporary URLs instead of Azure Blob Storage

### Steps to Test:

#### Test A: Upload Logo on Project Creation

1. **Create New Project:**
   - Navigate to `/projects/new`
   - Fill in required fields (name, slug)
   - Scroll to "Branding" section

2. **Upload Logo:**
   - Click "Choose File" under Logo URL
   - Select an image file (PNG, JPG, etc.)
   - ✅ **Expected:** Loading state appears briefly
   - ✅ **Expected:** Success toast: "Logo uploaded successfully!"
   - ✅ **Expected:** Image preview appears in form

3. **Submit Form:**
   - Complete the form and click "Create Project"
   - ✅ **Expected:** Project created successfully

4. **Verify Persistence:**
   - Navigate away from the project
   - Return to the project detail page
   - ✅ **Expected:** Logo still displays correctly
   - Open browser DevTools → Network tab
   - ✅ **Expected:** Logo URL points to Azure Blob Storage
   - ✅ **Expected:** URL format: `https://{account}.blob.core.windows.net/media/logos/{userId}/{timestamp}-{uuid}-{filename}`

5. **Refresh Page:**
   - Hard refresh the browser (Ctrl+Shift+R / Cmd+Shift+R)
   - ✅ **Expected:** Logo still displays (not broken)

#### Test B: Upload Logo on Project Edit

1. **Edit Existing Project:**
   - Go to any project
   - Click "Edit" button
   - Scroll to "Branding" section

2. **Change Logo:**
   - Upload a different image
   - ✅ **Expected:** Upload succeeds with toast
   - Click "Save Changes"
   - ✅ **Expected:** New logo displays

3. **Verify in Project List:**
   - Go to `/projects`
   - ✅ **Expected:** New logo shows in project card
   - Refresh page
   - ✅ **Expected:** Logo persists

### ❌ What Would Have Failed Before:
- Logo URLs were temporary `blob:http://localhost...`
- Logos disappeared on page refresh
- Broken image icons everywhere
- Files never uploaded to Azure

---

## 🧪 Test 3: Dashboard Page (Critical Fix)

**Bug Fixed:** Dashboard showing only "DashboardPage" text

### Steps to Test:

1. **Navigate to Dashboard:**
   - Go to `/dashboard`
   - ✅ **Expected:** NOT just text "DashboardPage"
   - ✅ **Expected:** Full dashboard UI loads

2. **Verify Stats Cards:**
   - ✅ **Expected:** "Total Projects" card shows correct count
   - ✅ **Expected:** "Total Testimonials" card shows sum across all projects
   - ✅ **Expected:** "Average per Project" card shows calculated average

3. **Verify Recent Projects:**
   - ✅ **Expected:** "Recent Projects" section lists up to 5 projects
   - ✅ **Expected:** Each project shows:
     - Project name and slug
     - Testimonial count
     - "Inactive" badge if not active
     - Time since creation
   - Click a project card
   - ✅ **Expected:** Navigates to project detail page

4. **Verify Quick Actions:**
   - ✅ **Expected:** "Create New Project" button present
   - ✅ **Expected:** "View All Projects" button present
   - Click "Create New Project"
   - ✅ **Expected:** Navigates to `/projects/new`

5. **Verify Getting Started Guide:**
   - ✅ **Expected:** 4-step guide visible
   - ✅ **Expected:** Numbered steps (1-4) with descriptions

6. **Test Empty State (New User):**
   - Create a fresh account with no projects
   - Go to `/dashboard`
   - ✅ **Expected:** Welcome message appears
   - ✅ **Expected:** "Create Your First Project" CTA button
   - ✅ **Expected:** Sparkle icon and welcoming design

### ❌ What Would Have Failed Before:
- Dashboard was completely empty
- No navigation or stats
- Poor user experience

---

## 🧪 Test 4: Blob Deletion Authorization (Security Fix)

**Bug Fixed:** Any user could delete any file

### Steps to Test:

**⚠️ This requires two user accounts for proper testing**

#### Test A: User Can Delete Own Files

1. **Sign in as User A:**
   - Create a project with a logo
   - Note the logo URL from browser DevTools
   - Extract the blob name from URL

2. **Test API Delete (Optional - using Postman/Curl):**
   ```bash
   DELETE /api/media/{blobName}
   Authorization: Bearer {user-a-token}
   ```
   - ✅ **Expected:** 200 Success - "File deleted successfully"

#### Test B: User Cannot Delete Other User's Files

1. **Get User B's Blob Name:**
   - Have User B create a project with logo
   - Copy User B's blob name

2. **Sign in as User A:**
   - Try to delete User B's blob via API
   ```bash
   DELETE /api/media/{user-b-blob-name}
   Authorization: Bearer {user-a-token}
   ```
   - ✅ **Expected:** 400 Bad Request
   - ✅ **Expected:** Error: "You do not have permission to delete this file"

3. **Verify Blob Still Exists:**
   - Sign in as User B
   - ✅ **Expected:** Logo still displays
   - ✅ **Expected:** File not deleted

#### Test C: Verify Path-Based Authorization

1. **Check Blob Path Structure:**
   - Logo URL should be: `https://{account}.blob.core.windows.net/media/logos/{userId}/{filename}`
   - ✅ **Expected:** userId in path matches authenticated user
   - Authorization check parses this path

### ❌ What Would Have Failed Before:
- Any authenticated user could delete any blob
- No ownership verification
- Major security vulnerability

---

## 🎯 Integration Test: Complete User Flow

Test the entire workflow end-to-end:

### Scenario: New User Signs Up and Collects Testimonial

1. **Sign Up:**
   - Create new account
   - ✅ **Expected:** Redirected to `/dashboard`
   - ✅ **Expected:** Welcome message shows

2. **Create Project:**
   - Click "Create Your First Project"
   - Fill form with logo upload
   - ✅ **Expected:** Logo uploads to Azure
   - Submit form
   - ✅ **Expected:** Project created

3. **Copy Collection URL:**
   - View project details
   - Click "Copy" on collection URL
   - ✅ **Expected:** Toast: "Collection URL copied to clipboard!"

4. **Submit Testimonial (Public Form):**
   - Open collection URL in incognito window
   - Fill testimonial form
   - Submit
   - ✅ **Expected:** Success screen appears

5. **Moderate Testimonial:**
   - Return to project in authenticated session
   - Go to Testimonials tab
   - ✅ **Expected:** New testimonial appears as "Pending"
   - Approve testimonial
   - ✅ **Expected:** Status changes to "Approved"
   - Publish testimonial
   - ✅ **Expected:** Status changes to "Published"

6. **Verify Dashboard:**
   - Go to `/dashboard`
   - ✅ **Expected:** Stats show 1 project, 1 testimonial
   - ✅ **Expected:** Recent projects shows the new project

---

## 📊 Performance Tests

### Test Response Times:

1. **Logo Upload Speed:**
   - Upload 1MB image
   - ✅ **Expected:** Complete in < 3 seconds

2. **Testimonial Mutations:**
   - Approve/reject actions
   - ✅ **Expected:** Complete in < 500ms

3. **Dashboard Load:**
   - With 10+ projects
   - ✅ **Expected:** Load in < 1 second

---

## 🐛 Error Handling Tests

### Test Error Scenarios:

1. **Upload Oversized Logo:**
   - Try uploading 10MB+ file
   - ✅ **Expected:** Error message appears

2. **Network Error During Upload:**
   - Throttle network in DevTools
   - Try uploading logo
   - ✅ **Expected:** Error toast appears
   - ✅ **Expected:** Form doesn't break

3. **Delete Non-Existent Blob:**
   - Try deleting invalid blob name
   - ✅ **Expected:** Proper error handling

---

## ✅ Final Checklist

- [ ] All testimonial actions work without React errors
- [ ] Logos persist after page refresh
- [ ] Dashboard shows meaningful content
- [ ] Users can only delete their own files
- [ ] Toast notifications appear for all actions
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly
- [ ] No console errors in browser DevTools
- [ ] TypeScript compiles without errors
- [ ] API returns proper status codes

---

## 🚨 If Tests Fail

### Common Issues:

1. **Logo Upload Fails:**
   - Check Azure Storage credentials in `.env`
   - Verify CORS is configured on Azure container
   - Check API is running and accessible

2. **Testimonial Actions Don't Work:**
   - Clear browser cache
   - Check React DevTools for hook errors
   - Verify API authentication is working

3. **Dashboard Shows Errors:**
   - Check if projects query is returning data
   - Verify user is authenticated
   - Check browser console for errors

4. **Authorization Fails:**
   - Verify userId is present in auth token
   - Check blob path format
   - Review API logs for auth errors

---

## 📝 Test Results Template

Use this template to document your test results:

```
## Test Session: [Date]
**Tester:** [Your Name]
**Environment:** [Local/Staging/Production]

### Bug Fix 1: Testimonial Management
- [ ] Approve: Pass/Fail
- [ ] Reject: Pass/Fail
- [ ] Publish: Pass/Fail
- [ ] Unpublish: Pass/Fail
- [ ] Delete: Pass/Fail
- [ ] Filter: Pass/Fail
- [ ] Search: Pass/Fail

### Bug Fix 2: Logo Upload
- [ ] Upload on Create: Pass/Fail
- [ ] Upload on Edit: Pass/Fail
- [ ] Persistence: Pass/Fail
- [ ] Azure URL: Pass/Fail

### Bug Fix 3: Dashboard
- [ ] Stats Display: Pass/Fail
- [ ] Recent Projects: Pass/Fail
- [ ] Quick Actions: Pass/Fail
- [ ] Empty State: Pass/Fail

### Bug Fix 4: Security
- [ ] Delete Own File: Pass/Fail
- [ ] Block Other User: Pass/Fail

**Notes:**
[Add any observations or issues found]
```

---

**Happy Testing! 🎉**

If all tests pass, your bug fixes are working correctly and the application is ready for production use.