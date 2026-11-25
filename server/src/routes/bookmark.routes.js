import { Router } from 'express';
import mongoose from 'mongoose';
import Bookmark from '../models/Bookmark.js';
import auth from '../middleware/auth.js';

const router = Router();
router.use(auth);

function normalizeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}
function validUrl(value) {
  try { const parsed = new URL(value); return ['http:', 'https:'].includes(parsed.protocol); }
  catch { return false; }
}
function cleanTags(tags) {
  if (Array.isArray(tags)) return [...new Set(tags.map(t => String(t).trim().toLowerCase()).filter(Boolean))].slice(0, 12);
  return [...new Set(String(tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean))].slice(0, 12);
}

router.get('/', async (req, res, next) => {
  try {
    const { search, favorite } = req.query;
    const filter = { user: req.user._id };
    if (favorite === 'true') filter.favorite = true;
    if (search?.trim()) {
      const term = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ title: new RegExp(term, 'i') }, { url: new RegExp(term, 'i') }, { description: new RegExp(term, 'i') }, { tags: new RegExp(term, 'i') }];
    }
    const bookmarks = await Bookmark.find(filter).sort({ favorite: -1, createdAt: -1 });
    res.json({ bookmarks });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const url = normalizeUrl(req.body.url);
    if (!req.body.title?.trim() || !validUrl(url)) return res.status(400).json({ message: 'A title and valid URL are required.' });
    const bookmark = await Bookmark.create({ user: req.user._id, title: req.body.title.trim(), url, description: req.body.description || '', tags: cleanTags(req.body.tags), favorite: Boolean(req.body.favorite) });
    res.status(201).json({ bookmark });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid bookmark ID.' });
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title.trim();
    if (req.body.url !== undefined) updates.url = normalizeUrl(req.body.url);
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.tags !== undefined) updates.tags = cleanTags(req.body.tags);
    if (req.body.favorite !== undefined) updates.favorite = Boolean(req.body.favorite);
    if (updates.title !== undefined && !updates.title) return res.status(400).json({ message: 'Title cannot be empty.' });
    if (updates.url !== undefined && !validUrl(updates.url)) return res.status(400).json({ message: 'Enter a valid URL.' });
    const bookmark = await Bookmark.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, updates, { new: true, runValidators: true });
    if (!bookmark) return res.status(404).json({ message: 'Bookmark not found.' });
    res.json({ bookmark });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid bookmark ID.' });
    const bookmark = await Bookmark.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!bookmark) return res.status(404).json({ message: 'Bookmark not found.' });
    res.json({ message: 'Bookmark deleted.' });
  } catch (err) { next(err); }
});
export default router;
