import { markAllTilesForUpdate } from '../utils/tile-refresh.js';

const GROUP_ORDER = ['Transport', 'Urban planning', 'Heritage', 'Risk'];

function setLayerVisibility(view, layer, visible) {
    layer.visible = visible;

    const labelLayer = view.getLayerById(`${layer.id}-label`);
    if (labelLayer) {
        labelLayer.visible = visible;
    }

    markAllTilesForUpdate(view);
}

function createMenuRow(item) {
    const row = document.createElement('label');
    row.className = 'layer-menu__row layer-menu__row--loading';

    const checkCell = document.createElement('span');
    checkCell.className = 'layer-menu__check';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.defaultVisible ?? true;
    checkbox.disabled = true;
    checkbox.setAttribute('aria-label', item.label);

    const label = document.createElement('span');
    label.className = 'layer-menu__label';
    label.textContent = item.label;

    checkCell.appendChild(checkbox);
    row.append(checkCell, label);

    return { row, checkbox, label };
}

function bindMenuItem(view, item, row, checkbox, label) {
    item.whenReady
        .then((layer) => {
            row.classList.remove('layer-menu__row--loading');
            checkbox.disabled = false;
            checkbox.checked = item.defaultVisible ?? layer.visible;

            setLayerVisibility(view, layer, checkbox.checked);

            checkbox.addEventListener('change', () => {
                setLayerVisibility(view, layer, checkbox.checked);
            });
        })
        .catch(() => {
            row.classList.remove('layer-menu__row--loading');
            row.classList.add('layer-menu__row--error');
            label.textContent = `${item.label} (unavailable)`;
            checkbox.disabled = true;
            checkbox.checked = false;
        });
}

export function createLayerMenu(view, items) {
    const panel = document.createElement('aside');
    panel.className = 'layer-menu';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'layer-menu__toggle';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-controls', 'layer-menu-panel');

    const title = document.createElement('span');
    title.className = 'layer-menu__title';
    title.textContent = 'Layers';

    const chevron = document.createElement('span');
    chevron.className = 'layer-menu__chevron';
    chevron.setAttribute('aria-hidden', 'true');

    toggle.append(title, chevron);

    const body = document.createElement('div');
    body.id = 'layer-menu-panel';
    body.className = 'layer-menu__body';

    const grouped = new Map();
    for (const item of items) {
        const group = item.group ?? 'Other';
        if (!grouped.has(group)) {
            grouped.set(group, []);
        }
        grouped.get(group).push(item);
    }

    const orderedGroups = [
        ...GROUP_ORDER.filter((g) => grouped.has(g)),
        ...[...grouped.keys()].filter((g) => !GROUP_ORDER.includes(g)),
    ];

    for (const group of orderedGroups) {
        const section = document.createElement('section');
        section.className = 'layer-menu__group';

        const groupTitle = document.createElement('h3');
        groupTitle.className = 'layer-menu__group-title';
        groupTitle.textContent = group;

        const list = document.createElement('div');
        list.className = 'layer-menu__list';

        for (const item of grouped.get(group)) {
            const { row, checkbox, label } = createMenuRow(item);
            list.appendChild(row);
            bindMenuItem(view, item, row, checkbox, label);
        }

        section.append(groupTitle, list);
        body.appendChild(section);
    }

    panel.append(toggle, body);
    document.body.appendChild(panel);

    toggle.addEventListener('click', () => {
        const collapsed = panel.classList.toggle('layer-menu--collapsed');
        toggle.setAttribute('aria-expanded', String(!collapsed));
    });
}
