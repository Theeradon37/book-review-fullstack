'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';

// ฟอร์มใช้ร่วมกันทั้งหน้า "เพิ่มหนังสือ" และ "แก้ไขหนังสือ"
export default function BookForm({ initial, submitLabel, onSubmit }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [author, setAuthor] = useState(initial?.author || '');
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt ? initial.publishedAt.slice(0, 10) : ''
  );
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl || ''); // รูปปกปัจจุบันบน server
  const [file, setFile] = useState(null); // ไฟล์ใหม่ที่เพิ่งเลือก (ยังไม่อัปโหลด)
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // สร้าง preview ของไฟล์ที่เลือก
  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return setError('Please choose an image file');
    if (f.size > 5 * 1024 * 1024) return setError('Image must be 5 MB or smaller');
    setError('');
    setFile(f);
  }

  function removeCover() {
    setFile(null);
    setCoverUrl('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!title.trim() || !author.trim()) return setError('Title and author are required');

    setBusy(true);
    try {
      let finalCover = coverUrl || null;
      if (file) {
        const uploaded = await api.uploadImage(file); // 1) อัปโหลดรูปก่อน
        finalCover = uploaded.url; // 2) ได้ url กลับมา เก็บลง coverUrl
      }
      await onSubmit({
        title: title.trim(),
        author: author.trim(),
        ...(publishedAt && { publishedAt: new Date(publishedAt).toISOString() }),
        coverUrl: finalCover,
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const shownCover = preview || coverUrl;

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && <div className="alert error">{error}</div>}

      <label>
        Title <span className="req">*</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Clean Code" />
      </label>

      <label>
        Author <span className="req">*</span>
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="e.g. Robert C. Martin" />
      </label>

      <label>
        Published date
        <input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
        <span className="hint">Leave empty to use today (on create)</span>
      </label>

      <div className="field">
        <span className="label">Cover image</span>
        <div className="upload">
          {shownCover ? (
            <img className="cover-preview" src={shownCover} alt="Cover preview" />
          ) : (
            <div className="cover-preview placeholder">📚</div>
          )}
          <div className="upload-actions">
            <label className="btn file-btn">
              {shownCover ? 'Change image' : 'Choose image'}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onPickFile} hidden />
            </label>
            {shownCover && (
              <button type="button" className="btn danger" onClick={removeCover}>
                Remove
              </button>
            )}
            <span className="hint">JPG, PNG, WEBP or GIF — up to 5 MB</span>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn primary" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

