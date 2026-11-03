const { ingestEvents } = require('./eventService');
const { getIndex, suggestTopics } = require('../post_details/topicresolver');

const PERSONAS = ['social', 'professional', 'private']; // optional until personas exist

// POST /events/batch   body: { persona?, events: [{ post, type, dwellMs?, source?, text? }] }
// types: impression | skip | view | open | like | comment | save | share | storyReshare | followCreator | hide | notInterested
async function postEvents(req, res) {
    try {
        const persona = PERSONAS.includes(req.body.persona) ? req.body.persona : null;
        const result = await ingestEvents({ userId: req.user.id, persona, events: req.body.events });
        return res.status(202).json(result); // accepted: processed without blocking the client
    } catch (err) {
        console.error('[postEvents]', err.message);
        return res.status(500).json({ message: 'Failed to record events' });
    }
}

// GET /topics/suggest?q=rea   -> composer chips while the user types
async function suggestTopicsHandler(req, res) {
    try {
        const index = await getIndex();
        return res.json({ topics: suggestTopics(index, String(req.query.q || ''), 8) });
    } catch (err) {
        console.error('[suggestTopics]', err.message);
        return res.status(500).json({ message: 'Failed to load suggestions' });
    }
}

module.exports = { postEvents, suggestTopicsHandler };

/* routes (add to your router; reuse your auth middleware, and rate-limit /events/batch):
   router.post('/events/batch', authMiddleware, postEvents);
   router.get('/topics/suggest', authMiddleware, suggestTopicsHandler);
*/