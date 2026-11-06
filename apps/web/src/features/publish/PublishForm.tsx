'use client';

import { useState, type FormEvent } from 'react';
import { ErrorCode, MAX_HTML_BYTES, type PersonView } from '@smallweb/shared';
import { ApiError, createSite } from '@/lib/api-client';

interface PublishFormProps {
  author: PersonView | null;
  onPublished: (address: string) => void;
  onPersonGone: () => void;
  onCancel: () => void;
}

type FieldErrors = Partial<Record<'address' | 'title' | 'html', string>>;

// Anyone can add a site: an address, a title, and a page of HTML. The author is whoever is
// browsing. The API validates and sanitizes; this form only shows what it says.
export function PublishForm({ author, onPublished, onPersonGone, onCancel }: PublishFormProps) {
  const [address, setAddress] = useState('');
  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!author) return;
    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);
    createSite({ address, title, html, authorId: author.id })
      .then((site) => onPublished(site.address))
      .catch((error: unknown) => {
        setSubmitting(false);
        if (!(error instanceof ApiError)) {
          setFormError('Something went wrong');
          return;
        }
        if (error.code === ErrorCode.ADDRESS_TAKEN) {
          setFieldErrors({ address: error.message });
        } else if (error.code === ErrorCode.VALIDATION_FAILED && error.details) {
          // One message under each field the API rejected.
          const errors: FieldErrors = {};
          for (const detail of error.details) {
            const field = detail.field as keyof FieldErrors;
            errors[field] ??= detail.message;
          }
          setFieldErrors(errors);
        } else if (error.code === ErrorCode.PERSON_NOT_FOUND) {
          onPersonGone();
          setFormError('That person no longer exists. Pick someone else and try again.');
        } else {
          setFormError(error.message);
        }
      });
  }

  return (
    <form className="publish-form" onSubmit={handleSubmit}>
      <h1>Publish a site</h1>
      <p>Publishing as {author?.name ?? '…'}.</p>

      <label>
        Address
        <input
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="myplace.zz"
          spellCheck={false}
          autoComplete="off"
        />
      </label>
      {fieldErrors.address && <p className="field-error">{fieldErrors.address}</p>}

      <label>
        Title
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}

      <label>
        HTML
        <textarea
          value={html}
          onChange={(event) => setHtml(event.target.value)}
          rows={14}
          maxLength={MAX_HTML_BYTES}
          spellCheck={false}
          placeholder='<h1>Hello</h1><p>Link to other sites like <a href="tidepool.zz">this</a>.</p>'
        />
      </label>
      {fieldErrors.html && <p className="field-error">{fieldErrors.html}</p>}
      <p className="publish-note">
        HTML and CSS only. Scripts, images and forms are removed, and links can only point at
        addresses on the small web.
      </p>

      {formError && (
        <p className="field-error" role="alert">
          {formError}
        </p>
      )}
      <div className="publish-actions">
        <button type="submit" disabled={submitting || !author}>
          {submitting ? 'Publishing…' : 'Publish'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
