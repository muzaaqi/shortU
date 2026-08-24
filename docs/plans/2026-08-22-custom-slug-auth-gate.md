# Custom Slug Alias Auth-Gate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restrict custom slug alias creation to authenticated/logged-in users only, showing a locked trigger with one-click sign-in modal for anonymous visitors, and enforcing validation at the server function layer.

**Architecture:** 
- In `src/server/functions/links.ts`, verify user session in `createLink` handler: if `customSlug` is provided and user is unauthenticated, reject with a user-friendly error message.
- In `src/components/link-form.tsx`, use `useSession()` from Better Auth client: if unauthenticated, render a locked "Sign in to unlock" trigger that opens `<AuthModal />`; if authenticated, render the interactive custom slug input accordion.
- In `src/server/functions/links.test.ts`, add unit test coverage for validation rules.

**Tech Stack:** TanStack Start, TanStack Form, Better Auth, Drizzle ORM, Base UI (shadcn), Bun Test.

---

### Task 1: Server-Side Gating in `createLink` Server Function

**Files:**
- Modify: `src/server/functions/links.ts`
- Test: `src/server/functions/links.test.ts`

**Step 1: Write the failing unit test**
Add test case in `src/server/functions/links.test.ts` verifying custom slug requirements and validation.

**Step 2: Run test to verify**
Run: `bun test src/server/functions/links.test.ts`

**Step 3: Implement server validation**
In `src/server/functions/links.ts` inside `createLink.handler`:
```ts
const session = await getSession();
const userId = session?.user?.id || null;

if (data.customSlug && !userId) {
  throw new Error("Custom slug aliases require signing in to shortU.");
}
```

**Step 4: Run tests to verify they pass**
Run: `bun test`
Expected: PASS

**Step 5: Commit**
```bash
git add src/server/functions/links.ts src/server/functions/links.test.ts
git commit -m "feat(links): require authentication for custom slug alias creation"
```

---

### Task 2: Client-Side UI Lock & Auth Modal Trigger in `LinkForm`

**Files:**
- Modify: `src/components/link-form.tsx`

**Step 1: Update LinkForm with Session Check & AuthModal**
In `src/components/link-form.tsx`:
1. Import `useSession` from `~/lib/auth` and `AuthModal` from `~/components/auth-modal`.
2. Import `Lock` icon from `lucide-react`.
3. Check `session?.user`:
   - If `!session?.user`: render a locked button `<button type="button" onClick={() => setShowAuthModal(true)} ...><Lock className="size-3 text-muted-foreground" /> <span>Custom slug alias (Sign in to unlock)</span></button>`.
   - If `session?.user`: render the interactive toggle button for custom slug.
4. Mount `<AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />`.

**Step 2: Verify UI and types**
Run: `bun typecheck && bun lint`
Expected: 0 errors

**Step 3: Commit**
```bash
git add src/components/link-form.tsx
git commit -m "feat(ui): display locked state and sign-in modal trigger for custom slug in LinkForm"
```

---

### Task 3: Quality Gate & Polish Verification

**Files:**
- Audit: `src/components/link-form.tsx`
- Audit: `src/server/functions/links.ts`

**Step 1: Run Impeccable Detector**
Run: `node C:/Users/muzaaqi/.gemini/skills/impeccable/scripts/detect.mjs --json src/components/link-form.tsx`
Expected: 0 violations

**Step 2: Run Full Quality Gate**
Run: `bun lint && bun typecheck && bun test && bun run build`
Expected: All checks pass and production build succeeds.

**Step 3: Commit / Merge**
```bash
git checkout staging
git rebase feat/custom-slug-auth-gate
```
