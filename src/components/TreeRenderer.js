import * as d3 from 'd3';

export function renderTree(selector, rootData, options = {}) {
  const svg = d3.select(selector);
  svg.selectAll('*').remove(); // очищаем предыдущую отрисовку

  const { width, height } = svg.node().getBoundingClientRect();

  const g = svg.append('g').attr('class', 'tree-root');

  const zoomBehavior = d3.zoom()
    .scaleExtent([0.1, 3])
    .on('zoom', (event) => g.attr('transform', event.transform));

  svg.call(zoomBehavior);

  const root = d3.hierarchy(rootData);

  const nodeSize = { x: 180, y: 90 };
  const treeLayout = d3.tree().nodeSize([nodeSize.x, nodeSize.y]);
  treeLayout(root);

  g.append('g')
    .attr('class', 'links')
    .selectAll('path')
    .data(root.links())
    .join('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y));

  const nodes = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(root.descendants())
    .join('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .on('click', (event, d) => {
        nodes.classed('node--selected', false);
        d3.select(event.currentTarget).classed('node--selected', true);
        options.onNodeClick?.(d.data);
      });

  nodes.append('circle')
    .attr('r', 20);

  nodes.append('text')
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .attr('font-size', 11)
    .text(d => getInitials(d.data.name));

  nodes.append('text')
    .attr('dy', '2.8em')
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .text(d => d.data.name ?? '?');

  nodes.append('text')
    .attr('dy', '4.2em')
    .attr('text-anchor', 'middle')
    .attr('font-size', 10)
    .attr('fill', '#888')
    .text(d => formatYears(d.data));

  fitView();

  function zoom(factor) {
    svg.transition().duration(300)
      .call(zoomBehavior.scaleBy, factor);
  }

  function fitView() {
    const bounds = g.node().getBBox();
    const svgW   = width  || svg.node().clientWidth;
    const svgH   = height || svg.node().clientHeight;
    const scale  = Math.min(svgW / bounds.width, svgH / bounds.height) * 0.85;
    const tx     = svgW / 2 - scale * (bounds.x + bounds.width  / 2);
    const ty     = svgH / 2 - scale * (bounds.y + bounds.height / 2);

    svg.transition().duration(500)
      .call(zoomBehavior.transform,
        d3.zoomIdentity.translate(tx, ty).scale(scale));
  }

  return { zoom, fit: fitView };
}

function getInitials(name = '') {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

function formatYears({ birthDate, deathDate } = {}) {
  if (!birthDate) return '';
  const birth = new Date(birthDate).getFullYear();
  const death = deathDate ? new Date(deathDate).getFullYear() : '…';
  return `${birth} – ${death}`;
}
