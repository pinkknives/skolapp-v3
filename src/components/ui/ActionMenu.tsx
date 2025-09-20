"use client";

import React from 'react';
import { 
  Button, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Kbd
} from '@heroui/react';
import { 
  Plus, 
  Copy, 
  Edit3, 
  Trash2, 
  MoreVertical 
} from 'lucide-react';

interface ActionMenuProps {
  onNew?: () => void;
  onCopy?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ActionMenu({ onNew, onCopy, onEdit, onDelete }: ActionMenuProps) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button 
          variant="bordered" 
          startContent={<MoreVertical size={16} />}
          aria-label="Åtgärder"
        >
          Åtgärder
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Åtgärder för quiz" variant="flat">
        <DropdownItem
          key="new"
          startContent={<Plus size={16} />}
          endContent={<Kbd keys={["command"]}>N</Kbd>}
          onPress={onNew}
        >
          Nytt quiz
        </DropdownItem>
        <DropdownItem
          key="copy"
          startContent={<Copy size={16} />}
          endContent={<Kbd keys={["command"]}>C</Kbd>}
          onPress={onCopy}
        >
          Kopiera länk
        </DropdownItem>
        <DropdownItem
          key="edit"
          startContent={<Edit3 size={16} />}
          endContent={<Kbd keys={["command"]}>E</Kbd>}
          onPress={onEdit}
        >
          Redigera
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          startContent={<Trash2 size={16} />}
          endContent={<Kbd keys={["command", "shift"]}>D</Kbd>}
          onPress={onDelete}
        >
          Radera
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}