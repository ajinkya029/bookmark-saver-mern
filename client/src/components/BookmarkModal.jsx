import { useEffect, useState } from 'react';
import { X, Link2, Tag, AlignLeft } from 'lucide-react';

export default function BookmarkModal({ bookmark, onClose, onSave }) {
  const [form, setForm] = useState({ title: '', url: '', description: '', tags: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (bookmark) setForm({ title: bookmark.title, url: bookmark.url, description: bookmark.description || '', tags: (bookmark.tags || []).join(', ') });
  }, [bookmark]);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try { await onSave({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }); }
    catch (err) { setError(err.response?.data?.message || 'Could not save this bookmark.'); }
    finally { setBusy(false); }
  };
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="bookmark-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-head"><div><span className="eyebrow">{bookmark ? 'MAKE AN UPDATE' : 'SAVE FOR LATER'}</span><h2 id="modal-title">{bookmark ? 'Edit bookmark' : 'Add a bookmark'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
      <form onSubmit={submit} className="bookmark-form">
        <label>Title<input name="title" value={form.title} onChange={update} placeholder="A great article about design" maxLength="120" required autoFocus /></label>
        <label>URL<div className="field-icon"><Link2 size={16} /><input name="url" value={form.url} onChange={update} placeholder="https://example.com" required /></div></label>
        <label>Description <span className="optional">OPTIONAL</span><div className="field-icon textarea-icon"><AlignLeft size={16} /><textarea name="description" value={form.description} onChange={update} placeholder="What makes this worth saving?" rows="3" maxLength="500" /></div></label>
        <label>Tags <span className="optional">COMMA SEPARATED</span><div className="field-icon"><Tag size={16} /><input name="tags" value={form.tags} onChange={update} placeholder="design, inspiration, read-later" /></div></label>
        {error && <div className="form-error">{error}</div>}
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={busy}>{busy ? 'Saving…' : bookmark ? 'Save changes' : 'Save bookmark'}</button></div>
      </form>
    </section>
  </div>;
}
