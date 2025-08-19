# ✅ NeuroCal Deployment Checklist

Use this checklist before every deployment to ensure everything goes smoothly.

## 🔍 Pre-Deployment Checks

- [ ] All tests pass (`npm run test`)
- [ ] Application builds successfully (`npm run build`)
- [ ] No console errors in development
- [ ] All environment variables are set
- [ ] Git repository is clean and up to date

## 🚀 Deployment Steps

### Option 1: Full Auto-Deploy (Recommended)
```bash
npm run deploy
```

### Option 2: Step-by-Step
1. [ ] Run tests: `npm run test`
2. [ ] Build app: `npm run build`
3. [ ] Commit changes: `git add . && git commit -m "Your message"`
4. [ ] Push to GitHub: `git push origin main`
5. [ ] Deploy to Heroku: `npm run deploy:heroku`

## ✅ Post-Deployment Verification

- [ ] Heroku app is running: `heroku ps --app your-app-name`
- [ ] App is accessible in browser
- [ ] No errors in Heroku logs: `heroku logs --tail --app your-app-name`
- [ ] GitHub Actions completed successfully
- [ ] All features work as expected

## 🚨 Rollback Plan

If deployment fails:
1. Check Heroku logs: `heroku logs --tail --app your-app-name`
2. Check GitHub Actions for errors
3. Rollback to previous version: `heroku rollback --app your-app-name`
4. Investigate and fix the issue
5. Redeploy when ready

## 📞 Emergency Contacts

- **Heroku Support**: https://help.heroku.com/
- **GitHub Support**: https://support.github.com/
- **Project Issues**: Create issue in repository

---

**Remember**: Always test in development before deploying to production!
