import ContextMenu from '@imengyu/vue3-context-menu';

function isEnabled(item: ContextMenuGroup | ContextMenuItem): boolean {
    if ('onClick' in item) {
        return item.condition !== false;
    }
    return true;
}

export interface ContextMenuGroup {
    icon?: string;
    items: (ContextMenuGroup | ContextMenuItem)[];
    label: string;
}

export interface ContextMenuItem {
    condition?: boolean;
    icon?: string;
    label: string;
    onClick: VoidFunction;
}

export interface ContextMenuParams {
    e: MouseEvent;
    items: (ContextMenuGroup | ContextMenuItem)[];
}

export function showContextMenu({ e, items }: ContextMenuParams): void {
    e.preventDefault();
    ContextMenu.showContextMenu({
        items: items.filter(isEnabled),
        x: e.x,
        y: e.y,
    });
}
