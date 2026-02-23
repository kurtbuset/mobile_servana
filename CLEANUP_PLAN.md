# Cleanup Plan - Remove Unused Files

## Confirmed Unused Files

Based on the audit, these files are confirmed to be unused and can be safely archived:

### 1. Completely Unused (Safe to Remove Now)

#### `components/bottomnavbar.jsx`
- ✅ **Confirmed**: Not imported anywhere
- ✅ **Replaced by**: `navigation/BottomTabs.js`
- ✅ **Used by**: App.jsx uses `navigation/appNavigation.js` → `navigation/BottomTabs.js`
- ✅ **Action**: Archive immediately

### 2. Legacy Screens (Only Used by Unused bottomnavbar.jsx)

Since `bottomnavbar.jsx` is not used, these are also safe to archive:

#### `screens/Dashboard.jsx`
- ✅ **Replaced by**: `screens/dashboard/DashboardScreen.jsx`
- ✅ **Only used by**: `components/bottomnavbar.jsx` (unused)
- ✅ **Action**: Archive

#### `screens/Messages.jsx` (1,160 lines)
- ✅ **Replaced by**: `screens/messaging/MessagesScreen.jsx`
- ✅ **Only used by**: `components/bottomnavbar.jsx` (unused)
- ✅ **Action**: Archive (keep as reference)

#### `screens/Profile.jsx`
- ✅ **Replaced by**: `screens/profile/ProfileScreen.jsx`
- ✅ **Only used by**: `components/bottomnavbar.jsx` (unused)
- ✅ **Action**: Archive

## Execution Plan

### Step 1: Create Archive Directory
```bash
mkdir -p mobile_servana/_archive/components
mkdir -p mobile_servana/_archive/screens
mkdir -p mobile_servana/_archive/slices
```

### Step 2: Archive Unused Files (Immediate)
```bash
# Archive bottomnavbar
mv mobile_servana/components/bottomnavbar.jsx mobile_servana/_archive/components/

# Archive legacy main screens
mv mobile_servana/screens/Dashboard.jsx mobile_servana/_archive/screens/
mv mobile_servana/screens/Messages.jsx mobile_servana/_archive/screens/
mv mobile_servana/screens/Profile.jsx mobile_servana/_archive/screens/
```

### Step 3: Create Archive README
Create `mobile_servana/_archive/README.md` documenting why files were archived.

### Step 4: Test Application
- Run the app
- Test navigation
- Test all main features
- Verify no imports are broken

### Step 5: Commit Changes
```bash
git add mobile_servana/_archive/
git add mobile_servana/components/
git add mobile_servana/screens/
git commit -m "chore: archive unused legacy files

- Archived bottomnavbar.jsx (replaced by BottomTabs.js)
- Archived legacy Dashboard.jsx (replaced by dashboard/DashboardScreen.jsx)
- Archived legacy Messages.jsx (replaced by messaging/MessagesScreen.jsx)
- Archived legacy Profile.jsx (replaced by profile/ProfileScreen.jsx)

All files moved to _archive/ for reference. Can be deleted after 1-2 release cycles."
```

## Files to Keep (For Now)

### Legacy Auth Screens
These are still being used and need migration first:

- `screens/Login.jsx` - Used somewhere, needs verification
- `screens/SignUp.jsx` - Used somewhere, needs verification
- `screens/SignUpVerification.jsx` - Needs refactoring
- `screens/ProfilePicture.jsx` - Needs refactoring
- `screens/SetupComplete.jsx` - Needs refactoring
- `screens/EditProfile.jsx` - Needs refactoring

### Legacy Slices
These are still imported by legacy screens:

- `slices/userSlice.js` - Used by SignUp.jsx and store.js
- `slices/clientSlice.js` - Used by multiple legacy screens and store.js

**Action**: Keep until all screens are refactored

## Next Phase: Refactor Remaining Screens

After archiving unused files, focus on refactoring:

### Priority 1: Sign Up Flow
1. Verify `screens/SignUp.jsx` is replaced by `screens/auth/SignUpScreen.jsx`
2. Refactor `screens/SignUpVerification.jsx`
3. Refactor `screens/ProfilePicture.jsx`
4. Refactor `screens/SetupComplete.jsx`

### Priority 2: Profile Management
1. Verify `screens/Login.jsx` is replaced by `screens/auth/LoginScreen.jsx`
2. Refactor `screens/EditProfile.jsx`

### Priority 3: Remove Legacy Slices
After all screens are refactored:
1. Remove `slices/userSlice.js`
2. Remove `slices/clientSlice.js`
3. Update `store.js` to remove legacy reducers

## Verification Checklist

Before archiving each file, verify:

- [ ] File is not imported anywhere (use grep/search)
- [ ] Component is not used in navigation
- [ ] No references in App.jsx or main entry points
- [ ] Replacement file exists and is working
- [ ] All tests pass (if applicable)

## Rollback Plan

If issues are found after archiving:

1. **Immediate rollback**:
   ```bash
   mv mobile_servana/_archive/path/to/file.jsx mobile_servana/path/to/file.jsx
   ```

2. **Git rollback**:
   ```bash
   git revert <commit-hash>
   ```

3. **Investigate issue**:
   - Check what's importing the file
   - Update imports to use new version
   - Re-archive after fix

## Expected Results

### Before Cleanup
```
mobile_servana/
├── components/
│   ├── bottomnavbar.jsx (UNUSED)
│   └── ... (other components)
├── screens/
│   ├── Dashboard.jsx (UNUSED)
│   ├── Messages.jsx (UNUSED)
│   ├── Profile.jsx (UNUSED)
│   ├── dashboard/ (NEW)
│   ├── messaging/ (NEW)
│   ├── profile/ (NEW)
│   └── ... (other screens)
└── slices/
    ├── userSlice.js (LEGACY)
    └── clientSlice.js (LEGACY)
```

### After Cleanup
```
mobile_servana/
├── _archive/
│   ├── README.md
│   ├── components/
│   │   └── bottomnavbar.jsx
│   └── screens/
│       ├── Dashboard.jsx
│       ├── Messages.jsx
│       └── Profile.jsx
├── components/
│   └── ... (active components only)
├── screens/
│   ├── dashboard/ (ACTIVE)
│   ├── messaging/ (ACTIVE)
│   ├── profile/ (ACTIVE)
│   └── ... (other screens)
└── slices/
    ├── userSlice.js (TO BE REMOVED LATER)
    └── clientSlice.js (TO BE REMOVED LATER)
```

## Benefits

### Code Clarity
- ✅ Easier to find active code
- ✅ No confusion about which file to use
- ✅ Cleaner project structure

### Maintenance
- ✅ Less code to maintain
- ✅ Faster searches
- ✅ Smaller bundle size

### Developer Experience
- ✅ Clear which files are active
- ✅ Easier onboarding
- ✅ Better IDE performance

## Timeline

### Week 1: Archive Unused Files
- Day 1: Create archive structure
- Day 2: Archive files and test
- Day 3: Commit and deploy to staging
- Day 4-5: Monitor for issues

### Week 2-3: Refactor Remaining Screens
- Refactor SignUpVerification, ProfilePicture, SetupComplete
- Refactor EditProfile
- Update navigation

### Week 4: Remove Legacy Slices
- Remove userSlice.js and clientSlice.js
- Update store.js
- Final testing

## Success Criteria

- ✅ All unused files archived
- ✅ Application runs without errors
- ✅ All features work as expected
- ✅ No broken imports
- ✅ Tests pass (if applicable)
- ✅ Documentation updated

---

**Status**: 📋 Ready to Execute
**Risk Level**: Low (files confirmed unused)
**Estimated Time**: 1-2 hours
**Rollback Time**: < 5 minutes
**Next Action**: Execute Step 1 - Create archive directory
