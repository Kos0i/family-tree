/**
 * api/treeApi.js
 *
 * Все сетевые запросы сосредоточены здесь.
 * Компоненты никогда не вызывают fetch напрямую.
 */

/** Базовый URL можно переопределить через .env */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * Внутренняя обёртка над fetch с обработкой ошибок.
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<unknown>}
 */
async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!response.ok) {
    // Пробуем достать текст ошибки из тела ответа
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`HTTP ${response.status}: ${message}`);
  }

  return response.json();
}

/**
 * Загружает всё генеалогическое дерево с API.
 * Ожидаемый формат ответа: { nodes: Node[], links: Link[] }
 * или иерархический формат для d3.hierarchy().
 *
 * @returns {Promise<TreeData>}
 */
export async function fetchTree() {
  return request(`${BASE_URL}/api/tree`);
}

/**
 * Загружает дерево по произвольному URL (введённому пользователем).
 * @param {string} url
 * @returns {Promise<TreeData>}
 */
export async function fetchTreeByUrl(url) {
  return request(url);
}

/**
 * Загружает данные об одном человеке по ID.
 * @param {string|number} personId
 * @returns {Promise<Person>}
 */
export async function fetchPerson(personId) {
  return request(`${BASE_URL}/api/persons/${personId}`);
}

// ──────────────────────────────────────────────
// JSDoc-типы для удобства (без TypeScript)
// ──────────────────────────────────────────────

/**
 * @typedef {Object} Person
 * @property {string|number} id
 * @property {string} name
 * @property {string} [birthDate]
 * @property {string} [deathDate]
 * @property {string} [gender]   - "male" | "female" | "other"
 * @property {string} [photoUrl]
 * @property {Person[]} [children]
 */

/**
 * @typedef {Object} TreeData
 * Иерархический объект, совместимый с d3.hierarchy()
 * @property {Person} root - корневой узел
 */
