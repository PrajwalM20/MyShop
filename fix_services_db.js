const fetch = global.fetch || require('node-fetch');
(async () => {
  const API = 'http://localhost:5000/api/settings/services';
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(res.statusText);
    const services = await res.json();
    let changed = false;
    const updated = services.map(s => {
      if (s.id === 'print_4x6') {
        if (s.price !== 30) { changed = true; s.price = 30; }
        if (s.copies !== 1) { changed = true; s.copies = 1; }
        if (s.unit !== 'piece') { changed = true; s.unit = 'piece'; }
      }
      if (s.id === 'school_id') {
        if (s.copies !== 8) { changed = true; s.copies = 8; }
        if (s.unit !== 'set of 8') { changed = true; s.unit = 'set of 8'; }
        if (s.price !== 50) { changed = true; s.price = 50; }
      }
      return s;
    });

    if (!changed) {
      console.log('No DB update required (already correct).');
      return;
    }

    const put = await fetch(API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services: updated }),
    });

    if (!put.ok) throw new Error('Update failed: ' + put.statusText);
    console.log('DB services updated.');
  } catch (err) {
    console.error('Error updating service DB:', err.message);
  }
})();