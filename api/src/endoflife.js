/**
 * Cliente para la API de endoflife.date v1
 * Docs: https://endoflife.date/docs/api/v1/
 */

const BASE = process.env.ENDOFLIFE_API_URL || 'https://endoflife.date/api/v1';

/**
 * Obtiene la info completa de un producto (releases, EOL, etc.)
 * GET /products/{product}
 */
async function getProduct(product) {
  const url = `${BASE}/products/${encodeURIComponent(product)}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`endoflife.date ${res.status} para ${product}`);
  }
  return res.json();
}

/**
 * Busca el ciclo que corresponde a una versión concreta.
 * Ej: version "8.1" → busca cycle "8.1" o "8" en las releases del producto.
 */
function findCycle(releases, version) {
  // Intenta match exacto primero
  const exact = releases.find((r) => r.name === version);
  if (exact) return exact;

  // Match por major.minor (ej: "8.1" matchea cycle "8.1")
  const major = version.split('.')[0];
  const majorMinor = version.split('.').slice(0, 2).join('.');

  const byMajorMinor = releases.find((r) => r.name === majorMinor);
  if (byMajorMinor) return byMajorMinor;

  const byMajor = releases.find((r) => r.name === major);
  if (byMajor) return byMajor;

  return null;
}

/**
 * Consulta endoflife.date y devuelve datos EOL para un producto + versión.
 */
async function getEolInfo(product, version) {
  try {
    const data = await getProduct(product);
    const releases = data.result?.releases || [];
    const cycle = findCycle(releases, version);

    if (!cycle) {
      return {
        product,
        cycle: version,
        found: false,
        releaseDate: null,
        eolDate: null,
        isEol: null,
        latestVersion: null,
        latestDate: null,
        isLts: null,
        eoasDate: null,
        isEoas: null,
        isMaintained: null,
      };
    }

    return {
      product,
      cycle: cycle.name,
      found: true,
      releaseDate: cycle.releaseDate || null,
      eolDate: cycle.eolFrom || null,
      isEol: cycle.isEol ?? null,
      latestVersion: cycle.latest?.name || null,
      latestDate: cycle.latest?.date || null,
      isLts: cycle.isLts ?? null,
      eoasDate: cycle.eoasFrom || null,
      isEoas: cycle.isEoas ?? null,
      isMaintained: cycle.isMaintained ?? null,
    };
  } catch (err) {
    console.error(`Error consultando endoflife.date para ${product}:`, err.message);
    return { product, cycle: version, found: false, error: err.message };
  }
}

module.exports = { getProduct, getEolInfo };
