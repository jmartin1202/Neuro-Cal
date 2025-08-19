# 🚀 Development Workflow Guide

## **Preventing Common Issues**

### **1. Pre-commit Safety Net**
We've set up Husky to automatically run checks before every commit:
- ✅ TypeScript type checking
- ✅ ESLint code quality checks  
- ✅ Build verification
- ✅ No commits allowed if any checks fail

### **2. Development Commands**

#### **Daily Development**
```bash
# Start development server
npm run dev

# Check for issues without starting server
npm run type-check    # TypeScript errors
npm run lint          # Code quality issues
npm run build         # Build verification
```

#### **Code Quality**
```bash
# Fix auto-fixable issues
npm run lint:fix

# Format code consistently
npm run format

# Check formatting without changing
npm run format:check
```

### **3. VS Code Extensions (Recommended)**
Install these extensions for real-time error detection:
- **ESLint** - Real-time linting
- **Prettier** - Code formatting
- **TypeScript Importer** - Auto-import management
- **Tailwind CSS IntelliSense** - CSS class suggestions
- **Error Lens** - Inline error display

### **4. Common Issues & Prevention**

#### **Syntax Errors**
- **Problem**: Missing parentheses, semicolons, brackets
- **Prevention**: 
  - Use `npm run type-check` before committing
  - Enable "Format on Save" in VS Code
  - Run `npm run build` to catch build errors

#### **Type Errors**
- **Problem**: TypeScript type mismatches
- **Prevention**:
  - Run `npm run type-check` regularly
  - Use strict TypeScript settings
  - Check component prop types

#### **Import Issues**
- **Problem**: Missing or incorrect imports
- **Prevention**:
  - Use `npm run lint` to catch import issues
  - Enable auto-import in VS Code
  - Use relative imports consistently

### **5. Before Committing Checklist**
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes  
- [ ] `npm run build` succeeds
- [ ] Code is formatted (`npm run format`)
- [ ] All tests pass (if applicable)

### **6. Quick Fix Commands**
```bash
# Fix all auto-fixable issues
npm run lint:fix

# Format all code
npm run format

# Check everything before commit
npm run type-check && npm run lint && npm run build
```

### **7. IDE Setup**
- Enable "Format on Save"
- Enable "Fix on Save" for ESLint
- Set Prettier as default formatter
- Enable TypeScript strict mode

### **8. Troubleshooting**
If you encounter issues:

1. **Check TypeScript**: `npm run type-check`
2. **Check Linting**: `npm run lint`
3. **Verify Build**: `npm run build`
4. **Format Code**: `npm run format`
5. **Check Dependencies**: `npm install`

### **9. Best Practices**
- Write code in small, testable chunks
- Commit frequently with clear messages
- Use TypeScript strict mode
- Follow ESLint rules consistently
- Format code before committing
- Test functionality after changes

## **🚨 Emergency Fixes**

If you're stuck with a broken build:

```bash
# Reset to last working state
git stash
git checkout main
git pull origin main

# Or fix incrementally
npm run type-check    # Find type errors
npm run lint          # Find lint errors  
npm run build         # Find build errors
```

## **📚 Additional Resources**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [React Best Practices](https://react.dev/learn)
