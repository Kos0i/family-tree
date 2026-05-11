/**
 * main.js — точка входа приложения
 *
 * Связывает UI, API-слой и визуализацию D3.
 * Здесь только «склейка»; логика вынесена в отдельные модули.
 */

import * as d3 from 'd3';

import { fetchTreeByUrl } from './api/treeApi.js';
import { renderTree } from './components/TreeRenderer.js';
import { showPersonCard } from './components/PersonPanel.js';

const apiUrlInput = document.getElementById('api-url');
const btnFetch = document.getElementById('btn-fetch');
const btnLoadSample = document.getElementById('btn-load-sample');
const fileInput = document.getElementById('file-input');
const fileDropZone = document.getElementById('file-drop-zone');
const statusBar = document.getElementById('status-bar');
const loader = document.getElementById('loader');
const emptyState = document.getElementById('empty-state');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const btnZoomFit = document.getElementById('btn-zoom-fit');

let treeControls = null;

function setStatus(text, type = '') {
  statusBar.textContent = text;
  statusBar.className = 'status-bar' + (type ? ` status-bar--${type}` : '');
}

function setLoading(active) {
  loader.hidden = !active;
  loader.setAttribute('aria-hidden', String(!active));
}

function loadData(data) {
  emptyState.hidden = true;
  const root = data.root ?? data;

  treeControls = renderTree('#tree-svg', root, {
    onNodeClick: (person) => showPersonCard(person),
  });

  setStatus(`Загружено узлов: ${countNodes(root)}`, 'success');
}

function countNodes(node) {
  if (!node) return 0;
  return 1 + (node.children ?? []).reduce((s, c) => s + countNodes(c), 0);
}

//Хэндлеры

//Загрузка по URL
btnFetch.addEventListener('click', async () => {
  const url = apiUrlInput.value.trim();
  if (!url) { setStatus('Введите URL', 'error'); return; }

  setLoading(true);
  setStatus('Загрузка…', 'loading');

  try {
    const data = await fetchTreeByUrl(url);
    loadData(data);
  } catch (err) {
    setStatus(`Ошибка: ${err.message}`, 'error');
    emptyState.hidden = false;
  } finally {
    setLoading(false);
  }
});

//Загрузка примера (js файлом)
btnLoadSample.addEventListener('click', async () => {
  setLoading(true);
  setStatus('Загрузка примера…', 'loading');

  // Динамически импортируем мок-данные, чтобы не тянуть их в prod-сборку
  const { SAMPLE_TREE } = await import('./api/sampleData.js');
  loadData(SAMPLE_TREE);
  setLoading(false);
});

// Загрузка локального JSON-файла
function handleFile(file) {
  if (!file || file.type !== 'application/json') {
    setStatus('Поддерживаются только .json файлы', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      loadData(data);
    } catch {
      setStatus('Ошибка парсинга JSON', 'error');
    }
  };
  reader.readAsText(file);
}

fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

// Управление масштабом
btnZoomIn.addEventListener('click',  () => treeControls?.zoom(1.3));
btnZoomOut.addEventListener('click', () => treeControls?.zoom(0.77));
btnZoomFit.addEventListener('click', () => treeControls?.fit());
