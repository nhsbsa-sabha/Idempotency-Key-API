const idempotencyCache = new Map();
const DEFAULT_TTL = 1 * 60 * 1000;

function idempotencyMiddleware(options = {}) {
  const { ttl = DEFAULT_TTL , enabled = true } = options;
    return (req, res, next) => {
        if (req.method !== 'POST'){
            return next();
        }
        if (!enabled) {
            console.log('Idempotency middleware is disabled.');
            return next();
        }
        const idempotencyKey = req.headers['idempotency-key'];
        if (!idempotencyKey) {
            return next();
        }
        const cachedEntry = idempotencyCache.get(idempotencyKey);
        
        if (cachedEntry) {
            const now = Date.now();
            if (now < cachedEntry.expiresAt) {
               
        console.log(`[Idempotency] Returning cached response for key: ${idempotencyKey}. Payment ID: ${cachedEntry.body?.paymentId}`);
        res.status(cachedEntry.statusCode);
        res.set(cachedEntry.headers);
        return res.json(cachedEntry.body);
      } else {
         console.log(`[Idempotency] Cache expired for key: ${idempotencyKey}. Processing as new request.`);
         idempotencyCache.delete(idempotencyKey);
      }
    } else {
      console.log(`[Idempotency] No cache found for key: ${idempotencyKey}. Processing new request and will cache the response.`);
    }

    const originalJson = res.json.bind(res);
    const originalStatus = res.status.bind(res);
    const originalSet = res.set.bind(res);
    let statusCode = 200;
    const responseHeaders = {};

    res.status = (code) => {
      statusCode = code;
      return originalStatus(code);
    };

    res.set = (field, value) => {
      if (typeof field === 'string') {
        responseHeaders[field] = value;
      } else if (typeof field === 'object') {
        Object.assign(responseHeaders, field);
      }
      return originalSet(field, value);
    };

    res.json = (body) => {
      if (idempotencyKey) {
        const expiresAt = Date.now() + ttl;
        idempotencyCache.set(idempotencyKey, {
          statusCode,
          headers: responseHeaders,
          body,
          expiresAt,
        });
          console.log(`[Idempotency] Successfully cached response for key: ${idempotencyKey}. Expires in ${ttl}ms.`);
      } else {
         console.log(`[Idempotency] Not caching unsuccessful response (Status: ${statusCode}) for key: ${idempotencyKey}.`);
      }
      res.json = originalJson;
      res.status = originalStatus;
      res.set = originalSet;

        return res.json(body);
    };

    next();
};
}


module.exports = idempotencyMiddleware;
