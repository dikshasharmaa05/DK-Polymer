/**
 * Client-side validation for prototype forms (form[data-validate]).
 * Nothing is stored or sent: a valid form redirects to data-success.
 */
type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function messageFor(el: Control): string {
  const custom = el.closest('[data-error]')?.getAttribute('data-error');
  if (el.validity.valueMissing) return custom ?? 'This field is required.';
  if (el.validity.typeMismatch && el.type === 'email') return 'Enter an email address like name@company.com.';
  if (el.validity.patternMismatch) return el.getAttribute('data-pattern-error') ?? 'Check the format of this field.';
  if (el.validity.rangeUnderflow) return `Enter a number of at least ${(el as HTMLInputElement).min}.`;
  return 'Check this field.';
}

function labelFor(el: Control): string {
  const group = el.closest('fieldset');
  const text = el.type === 'radio' && group
    ? group.querySelector('legend')?.textContent
    : document.querySelector(`label[for="${el.id}"]`)?.textContent;
  return text?.replace('(required)', '').trim() ?? el.name;
}

function setError(form: HTMLFormElement, name: string, message: string) {
  const box = form.querySelector<HTMLElement>(`#${name}-error`);
  if (box) box.textContent = message;
  form.querySelectorAll<Control>(`[name="${name}"]`).forEach((c) => {
    if (message) c.setAttribute('aria-invalid', 'true');
    else c.removeAttribute('aria-invalid');
  });
}

function validate(form: HTMLFormElement): { name: string; id: string; label: string; message: string }[] {
  const seen = new Set<string>();
  const errors: { name: string; id: string; label: string; message: string }[] = [];
  form.querySelectorAll<Control>('input, select, textarea').forEach((el) => {
    if (!el.name || seen.has(el.name)) return;
    seen.add(el.name);
    if (el.type === 'text' || el.type === 'tel' || el.type === 'email' || el.tagName === 'TEXTAREA') el.value = el.value.trim();
    if (el.checkValidity()) {
      setError(form, el.name, '');
    } else {
      const message = messageFor(el);
      setError(form, el.name, message);
      errors.push({ name: el.name, id: el.id, label: labelFor(el), message });
    }
  });
  return errors;
}

document.querySelectorAll<HTMLFormElement>('form[data-validate]').forEach((form) => {
  form.noValidate = true;
  const summary = form.querySelector<HTMLElement>('[data-error-summary]');
  const list = summary?.querySelector('ul');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errors = validate(form);
    if (errors.length === 0) {
      if (summary) summary.hidden = true;
      window.location.href = form.dataset.success!;
      return;
    }
    if (summary && list) {
      list.innerHTML = '';
      errors.forEach((err) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${err.id}`;
        a.textContent = `${err.label}: ${err.message}`;
        li.append(a);
        list.append(li);
      });
      summary.hidden = false;
      summary.focus();
    }
  });

  // Re-validate a field once the user corrects it.
  form.addEventListener('change', (e) => {
    const el = e.target as Control;
    if (el.name && el.getAttribute('aria-invalid') === 'true' && el.checkValidity()) setError(form, el.name, '');
  });
});
