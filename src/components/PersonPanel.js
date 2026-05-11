/**
 * components/PersonPanel.js
 * Заполняет боковую карточку данными выбранного человека.
 */

const panel    = document.getElementById('person-panel');
const card     = document.getElementById('person-card');

/**
 * @param {import('../api/treeApi.js').Person} person
 */
export function showPersonCard(person) {
  panel.hidden = false;

  const fields = [
    ['Имя',       person.name],
    ['Пол',       formatGender(person.gender)],
    ['Рождение',  formatDate(person.birthDate)],
    ['Смерть',    formatDate(person.deathDate)],
    ['Дети',      person.children?.length ?? 0],
  ].filter(([, v]) => v !== '' && v != null);

  card.innerHTML = fields
    .map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`)
    .join('');
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
}

function formatGender(g) {
  return { male: 'Мужской', female: 'Женский', other: 'Другой' }[g] ?? null;
}
