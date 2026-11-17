/**
 * CooptaIQ — Brevo newsletter bridge
 *
 * Receives newsletter opt-ins from the waitlist form and adds the contact
 * to a Brevo list. The Brevo API key stays in Cloudflare secrets.
 *
 * Required environment variables:
 *   BREVO_API_KEY  — Brevo API key with contacts permission
 *   BREVO_LIST_ID  — numeric Brevo list ID
 *   SITE_ORIGIN    — production origin, e.g. https://zackworkspace2.github.io
 */

const LOCAL_ORIGINS = [
  'http://127.0.0.1:4173',
  'http://localhost:4173',
  'http://192.168.0.183:4173'
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function corsHeaders(origin, env) {
  const allowed = [env.SITE_ORIGIN, ...LOCAL_ORIGINS].filter(Boolean);
  const allowOrigin = origin ? (allowed.includes(origin) ? origin : '') : '*';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    Vary: 'Origin'
  };
}

function json(body, status, origin, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(origin, env)
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = [env.SITE_ORIGIN, ...LOCAL_ORIGINS].filter(Boolean);

    if (origin && !allowed.includes(origin)) {
      return json({ error: 'Origin not allowed.' }, 403, origin, env);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed.' }, 405, origin, env);
    }

    let data;

    try {
      data = await request.json();
    } catch (error) {
      return json({ error: 'Invalid JSON.' }, 400, origin, env);
    }

    const subscribed =
      data?.newsletter === true ||
      data?.newsletter === 'true' ||
      data?.newsletter === 'yes';

    if (!subscribed) {
      return json({ ok: true, skipped: 'not subscribed' }, 200, origin, env);
    }

    const email = String(data.email || '').trim().toLowerCase();
    const fullName = String(data.full_name || '').trim().slice(0, 120);

    if (!EMAIL_PATTERN.test(email)) {
      return json({ error: 'Invalid email.' }, 400, origin, env);
    }

    const listId = Number(env.BREVO_LIST_ID);

    if (!env.BREVO_API_KEY || !Number.isInteger(listId) || listId <= 0) {
      return json({ error: 'Newsletter service is not configured.' }, 500, origin, env);
    }

    const parts = fullName.split(/\s+/).filter(Boolean);
    const firstName = parts.shift() || '';
    const lastName = parts.join(' ');
    const attributes = {};

    if (firstName) attributes.FIRSTNAME = firstName;
    if (lastName) attributes.LASTNAME = lastName;

    const contact = {
      email,
      attributes,
      listIds: [listId],
      updateEnabled: true
    };

    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(contact)
    });

    if (!brevoResponse.ok) {
      const detail = await brevoResponse.text();
      console.error('Brevo rejected contact:', brevoResponse.status, detail);
      return json({ error: 'Brevo rejected the contact.' }, 502, origin, env);
    }

    return json({ ok: true }, 200, origin, env);
  }
};
