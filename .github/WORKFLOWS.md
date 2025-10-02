# GitHub Actions Workflows Documentation

This repository includes several automated GitHub Actions workflows to ensure code quality, security, and streamlined deployments.

---

## 📋 Available Workflows

### 1. **CI - Build and Test** (`ci.yml`)
**Triggers:** Push/PR to `main` or `develop` branches

**What it does:**
- ✅ Tests build on Node.js 18.x and 20.x
- ✅ Runs ESLint checks
- ✅ TypeScript type checking
- ✅ Security audit with npm audit
- ✅ Validates successful build

**Status Badge:**
```markdown
![CI Status](https://github.com/engrhammadkhurshid/MyClinicAdmin/actions/workflows/ci.yml/badge.svg)
```

---

### 2. **Code Quality & Linting** (`code-quality.yml`)
**Triggers:** Push/PR to `main` or `develop` branches

**What it does:**
- ✅ Runs ESLint on all code
- ✅ Checks code formatting with Prettier
- ✅ Annotates PRs with linting issues
- ✅ Ensures code quality standards

**Benefit:** Catches code quality issues before merge

---

### 3. **Dependency Updates** (`dependency-updates.yml`)
**Triggers:** 
- Every Monday at 9 AM UTC (automatic)
- Manual trigger via GitHub Actions tab

**What it does:**
- ✅ Checks for outdated packages
- ✅ Runs security audit
- ✅ Creates GitHub issue if vulnerabilities found
- ✅ Keeps dependencies current

**Benefit:** Proactive security and dependency management

---

### 4. **Auto Release** (`release.yml`)
**Triggers:** When you push a tag (e.g., `v0.1.0-beta`)

**What it does:**
- ✅ Automatically creates GitHub Release
- ✅ Generates changelog from commits
- ✅ Detects if it's a pre-release (beta, alpha, rc)
- ✅ Adds release notes

**How to use:**
```bash
git tag v0.1.0-beta
git push origin v0.1.0-beta
# Release created automatically!
```

---

### 5. **Deploy to Vercel** (`deploy-vercel.yml`) - Optional
**Triggers:** Push to `main` or new tags

**What it does:**
- ✅ Builds the application
- ✅ Deploys to Vercel production
- ✅ Sends deployment notification

**Setup required:** See configuration section below

---

## 🚀 Quick Start

### Enable Workflows

All workflows are automatically enabled once you push them to GitHub!

```bash
git add .github/workflows/
git commit -m "Add GitHub Actions workflows"
git push origin main
```

### View Workflow Runs

1. Go to your repository on GitHub
2. Click **"Actions"** tab
3. See all workflow runs and their status

---

## ⚙️ Configuration

### For CI & Code Quality Workflows
✅ **No configuration needed!** Works out of the box.

### For Vercel Deployment Workflow (Optional)

You need to add these secrets in GitHub:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add these secrets:

| Secret Name | Where to Find | Description |
|------------|---------------|-------------|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens | Vercel API Token |
| `VERCEL_ORG_ID` | Vercel Project Settings | Organization ID |
| `VERCEL_PROJECT_ID` | Vercel Project Settings | Project ID |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard | Your Supabase anon key |

**How to get Vercel credentials:**
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Get your IDs
cat .vercel/project.json
```

---

## 🎯 Recommended Workflow

### For Daily Development

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   ```

3. **Push and create PR:**
   ```bash
   git push origin feature/new-feature
   # Create PR on GitHub
   ```

4. **CI runs automatically:**
   - ✅ Build check
   - ✅ Linting
   - ✅ Type checking
   - ✅ Security audit

5. **Merge to main:**
   - Auto-deploys to Vercel (if configured)

### For Releases

1. **Update version in package.json:**
   ```json
   {
     "version": "0.2.0-beta"
   }
   ```

2. **Commit and create tag:**
   ```bash
   git add package.json
   git commit -m "chore: Bump version to 0.2.0-beta"
   git push origin main
   
   git tag v0.2.0-beta
   git push origin v0.2.0-beta
   ```

3. **GitHub Release created automatically!** 🎉

---

## 📊 Status Badges

Add these to your README.md:

```markdown
## Build Status

![CI](https://github.com/engrhammadkhurshid/MyClinicAdmin/actions/workflows/ci.yml/badge.svg)
![Code Quality](https://github.com/engrhammadkhurshid/MyClinicAdmin/actions/workflows/code-quality.yml/badge.svg)
![Security](https://github.com/engrhammadkhurshid/MyClinicAdmin/actions/workflows/dependency-updates.yml/badge.svg)
```

---

## 🔧 Customization

### Modify CI Node Versions

Edit `.github/workflows/ci.yml`:
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 21.x]  # Add more versions
```

### Change Dependency Check Schedule

Edit `.github/workflows/dependency-updates.yml`:
```yaml
schedule:
  - cron: '0 9 * * 1'  # Every Monday at 9 AM
  # Change to: '0 0 * * *' for daily
```

### Disable a Workflow

Add to the top of any workflow file:
```yaml
on:
  workflow_dispatch: # Only manual trigger
```

---

## 🐛 Troubleshooting

### Workflow Fails

1. **Check the logs:**
   - Go to Actions tab
   - Click on failed workflow
   - Expand failed step to see error

2. **Common issues:**
   - **Build fails:** Check if `npm run build` works locally
   - **Secrets missing:** Add required secrets in repository settings
   - **Permission denied:** Enable read/write permissions in Settings → Actions → General

### Enable Workflow Permissions

1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions":
   - Select: ✅ **"Read and write permissions"**
   - Check: ✅ **"Allow GitHub Actions to create and approve pull requests"**
3. Click **Save**

---

## 📚 Best Practices

### Commit Messages

Use conventional commits for automatic changelog:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `chore:` - Maintenance
- `refactor:` - Code refactoring
- `test:` - Tests
- `style:` - Formatting

**Example:**
```bash
git commit -m "feat: Add toast notifications"
git commit -m "fix: Resolve source column bug"
git commit -m "docs: Update README"
```

### Branch Protection

Recommended settings for `main` branch:

1. Go to **Settings** → **Branches**
2. Click **"Add rule"** for `main`
3. Enable:
   - ✅ Require status checks to pass (select CI workflows)
   - ✅ Require branches to be up to date
   - ✅ Require review before merging (optional)

---

## ✅ Workflows Summary

| Workflow | Purpose | Auto/Manual | Setup Required |
|----------|---------|-------------|----------------|
| CI | Build & test | Auto on push/PR | ❌ None |
| Code Quality | Linting | Auto on push/PR | ❌ None |
| Dependency Updates | Security | Auto weekly | ❌ None |
| Auto Release | Create releases | Auto on tags | ❌ None |
| Vercel Deploy | Production deploy | Auto on push | ✅ Secrets needed |

---

## 🎉 Benefits

With these workflows, you get:

- ✅ **Automated testing** on every commit
- ✅ **Code quality** enforcement
- ✅ **Security scanning** weekly
- ✅ **Automatic releases** from tags
- ✅ **CI/CD pipeline** for deployments
- ✅ **Professional development** workflow

---

## 📞 Support

If you need help with workflows:
- Email: engr.hammadkhurshid@gmail.com
- GitHub Issues: [Report an issue](https://github.com/engrhammadkhurshid/MyClinicAdmin/issues)

---

**Your repository now has professional CI/CD workflows!** 🚀
