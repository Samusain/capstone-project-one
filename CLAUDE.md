# AI Development Conventions

This file documents standards for AI-assisted development in this project.

## Stack & Tools

- **Framework**: React 18+
- **Build**: Vite
- **Styling**: Vanilla CSS (modular, no Tailwind)
- **AI IDE**: Blackbox
- **Node version**: 18+ (LTS)
- **Package manager**: npm
- **Testing**: React Testing Library + Jest

## Development Workflow

### File Structure
```
src/
  components/    # Reusable React components
  pages/         # Page-level components
  hooks/         # Custom React hooks
  utils/         # Utility functions
  styles/        # Global CSS
  App.jsx        # Root component
  main.jsx       # Entry point
```

### Commit Convention

All commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body (optional)>
<footer (optional)>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring (no behavior change)
- `style`: Formatting, missing semicolons, etc.
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `chore`: Build, dependencies, tooling

**Examples**:
- `feat(auth): add login form component`
- `fix(navbar): correct mobile menu toggle`
- `docs: update README setup instructions`

---

## AI Collaboration Rules (Learned in Foundations Phase)

### Rule 1: Explicit Constraints Beat Vague Requests

When asking AI to build a component, **list every constraint** for each field/property.

**Bad prompt:**
```
Build a name field for my form.
```

**Good prompt:**
```
Name field: 
- Type: text input
- Required: yes
- Min length: 2 characters
- Max length: 50 characters
- Validation: reject if only spaces after trimming
- Styling: border-red-500 on error, clear error when user starts typing
```

**Why it matters:** AI cannot guess what "valid" means. Without constraints, it writes minimal validation (just `required` attribute). With constraints, it writes complete logic.

**Real example from this project:**
- Vague version: Only checked if name was empty → accepted single-character names
- Precise version: Added min/max length validation → rejected names outside 2-50 range
- Test caught this: `test('rejects name with only spaces')`

---

### Rule 2: Name Edge Cases Before Building

Before the AI starts coding, **think through edge cases** and list them as requirements.

**Edge case thinking process:**
- What malicious input could break this? (e.g., "+admin" in email)
- What boundary cases exist? (e.g., 2-char vs 1-char name)
- What user mistakes should we handle? (e.g., spaces-only input)
- What should fail validation? (list specific examples)

**Example prompt section:**
```
EDGE CASES TO HANDLE:
- Email already in use (mock check: if email includes "+admin", reject it)
- Name with only spaces should fail validation
- Pasting into email field should trigger validation
- Timezone change should update immediately (optimistic UI)
```

**Why it matters:** Edge cases don't emerge from general prompts like "add validation." They come from explicit thinking. List them, AI codes to them.

**Real example from this project:**
- Vague version: Didn't mention "+admin" email → no special handling
- Precise version: Spec said "reject '+admin'" → added `if (email.includes('+admin')) return false`
- Test verified: `test('rejects email containing "+admin"')`

---

### Rule 3: Write Test Names Before Asking for Code

Before the AI builds, **write out test names** (structure, no implementation). This forces you to think through the spec, and the AI will build code to pass those tests.

**Example (write these BEFORE asking AI to code):**
```javascript
// Test names only—don't implement yet
test('renders with all required labels')
test('shows validation errors for empty required fields')
test('shows validation error for invalid email format')
test('shows validation error for "+admin" in email')
test('shows success message on valid submit')
test('success message disappears after 3 seconds')
test('rejects name with only spaces')
test('shows char count for bio textarea')
test('error clears when user starts typing in field')
test('aria-invalid and aria-describedby present when error exists')
```

**Then ask AI:** *"Write the component and tests to pass these test cases. Run the tests and confirm they pass."*

**Why it matters:** Tests are a spec. AI will build logic to satisfy them. This forces precision without writing a 50-line requirements doc.

**Real example from this project:**
- Vague version: 0 tests (code wasn't verified against spec)
- Precise version: 13 passing tests (every behavior defined and verified)
- Tests caught the "+admin" edge case, char count display, error clearing behavior

---

### Rule 4: Accessibility is a Checklist, Not an Afterthought

When requesting a form, **explicitly list accessibility requirements** with attribute names, not just "make it accessible."

**Bad:**
```
Make the form accessible.
```

**Good:**
```
ACCESSIBILITY REQUIREMENTS:
- All required fields must show red asterisk (*)
- All inputs with errors must have aria-invalid="true"
- All inputs with errors must have aria-describedby pointing to error message ID
- All error messages must have matching id (e.g., id="email-error")
- Labels must use htmlFor to link to input id
- Focus states must be visible (outline or box-shadow)
```

**Why it matters:** "Accessible" is too vague. Specific attributes (aria-invalid, aria-describedby, role, etc.) get implemented. Generic requests get ignored.

**Real example from this project:**
- Vague version: No aria-* attributes anywhere (would fail WCAG audit)
- Precise version: aria-invalid + aria-describedby on all error fields (passes accessibility checks)
- Test verified: `test('error messages have aria-invalid and aria-describedby')`

---

### Rule 5: Separate Validation Logic from UI State

When designing form logic, **isolate concerns**:
- Validation functions (pure logic, no React state)
- State management (only track what's necessary)
- Rendering (separate from logic)

**Bad pattern:**
```javascript
const [touched, setTouched] = useState({})
const [saving, setSaving] = useState(false)
const [savedAt, setSavedAt] = useState(null)
const [errors, setErrors] = useState({})
// 4+ state variables mixed together
```

**Good pattern:**
```javascript
// Validation logic (pure functions)
const validateEmail = (email) => { ... }
const validateForm = () => { ... }

// Only necessary state
const [formData, setFormData] = useState({...})
const [errors, setErrors] = useState({})
const [successMessage, setSuccessMessage] = useState('')
```

**Why it matters:** Pure validation logic is testable, reusable, and easy to understand. Mixed state becomes hard to debug.

**Real example from this project:**
- Vague version: 5 state variables (touched, saving, savedAt, errors, submitError)
- Precise version: 3 state variables (formData, errors, successMessage)
- Result: Half the code, easier to test, clearer intent

---

### Rule 6: Always Diff and Review Before Accepting

After AI builds a feature, **run `git diff` and study it** for:
- Missing accessibility attributes (aria-*, htmlFor, role)
- Skipped validation (did it assume browser validation is enough?)
- Untested code (are there branches no test covers?)
- Naming (does variable name match spec?)

**Workflow:**
```bash
git diff vague..precise src/components/SettingsForm.jsx
# Read through entire diff
# Ask: "What did vague miss that precise has?"
# Ask: "Are there aria-* attributes? Validation logic? Tests?"
```

**Why it matters:** A 2-minute diff review catches 80% of AI mistakes before they ship.

**Real example from this project:**
Diff revealed:
- Vague: No aria-invalid (accessibility miss)
- Vague: No "+admin" email check (edge case miss)
- Vague: No error clearing on input (UX miss)
- Precise: All three implemented (because spec was explicit)

---

## Code Quality Standards

### React Components
- **Functional components only** (hooks-based)
- **Clear naming:** `SettingsForm` not `Form`
- **Prop types or TypeScript** when component accepts props
- **No prop drilling:** Use context if 3+ levels deep

### Validation Functions
- **Pure functions:** No side effects, same input → same output
- **Descriptive names:** `validateEmail()` not `check()`
- **Single responsibility:** One function per field or entity
- **Return boolean or error message** (not throwing exceptions)

### Testing
- **Test names describe behavior:** `test('rejects email with "+admin"')` not `test('email')`
- **At least 5 tests per component:** Render, validation, success, errors, edge cases
- **Test edge cases explicitly:** Spaces-only, "+admin", length boundaries
- **Run tests before committing:** Verify they pass

### CSS (Vanilla CSS)
- **Modular files:** One `.css` per component (e.g., `SettingsForm.css`)
- **BEM naming optional:** Use descriptive class names
- **Mobile-first:** `@media (max-width: 640px)` for responsive design
- **No inline styles:** All CSS in `.css` files

### Error Handling
- **Validate on submit:** Check entire form, collect all errors
- **Show inline messages:** Below each field, not in alert()
- **Clear on input:** Remove error when user starts typing fix
- **Descriptive messages:** "Name must be 2-50 characters" not "Invalid input"

---

## AI Assistant Prompts

### When to Use AI

**Good uses:**
- Generate component structure given detailed spec
- Write boilerplate (file scaffolds, test templates)
- Refactor existing code for readability
- Explain patterns or debug errors

**Be cautious:**
- Complex business logic (you should own the decisions)
- Security-critical code (review thoroughly, don't trust blindly)
- Architecture decisions (think first, then ask AI to build)

### Prompt Structure

1. **Context:** What is this component's job?
2. **Fields:** List each field/prop with type and constraints
3. **Behavior:** What happens on submit, error, success?
4. **Edge cases:** List specific cases to handle
5. **Verification:** "Write it, then write tests and run them"

### Example Good Prompt

```
Build a SettingsForm component with these specs:

FIELDS:
- Full Name (text, required, min 2 chars, max 50)
- Email (email, required, validate format, reject if "+admin")
- Timezone (select: UTC, EST, PST, IST)
- Bio (textarea, max 200 chars, show live char count)

BEHAVIOR:
- Show red asterisk (*) on required fields
- Show inline error messages below each invalid field
- On submit: validate all, show "Settings saved!" for 3 sec
- Error clears when user starts typing

ACCESSIBILITY:
- aria-invalid and aria-describedby on error fields
- htmlFor on all labels

THEN:
Write tests (React Testing Library):
- renders with all labels
- shows errors for empty required fields
- shows success message on valid submit
- rejects email containing "+admin"
Run tests and confirm they pass.
```

---

## Debugging Checklist

When AI-generated code doesn't work:

- [ ] Run `npm test` — any test failures?
- [ ] Check console errors — what's the error message?
- [ ] `git diff` against previous version — what changed?
- [ ] Is validation logic separate from state? (pure function)
- [ ] Are accessibility attributes present? (aria-*, htmlFor)
- [ ] Are edge cases handled? (spaces-only, length boundaries)
- [ ] Did I review the diff before committing?

---

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN: ARIA Attributes](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)