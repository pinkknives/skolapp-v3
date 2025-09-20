"use client";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Kbd,
  Divider,
} from "@heroui/react";
import { MoreVertical } from "lucide-react";

export type ActionItem =
  | { key: string; label: string; kbd?: string; onSelect: () => void; disabled?: boolean; danger?: false }
  | { key: string; label: string; kbd?: string; onSelect: () => void; disabled?: boolean; danger: true }
  | { key: "__divider__" };

type Props = {
  triggerLabel?: string;
  items: ActionItem[];
};

export function ActionsMenu({ triggerLabel = "Åtgärder", items }: Props) {
  return (
    <Dropdown placement="bottom-end" shouldCloseOnInteractOutside={() => true}>
      <DropdownTrigger>
        <Button
          variant="light"
          startContent={<MoreVertical className="size-4" aria-hidden="true" />}
          aria-haspopup="menu"
          aria-expanded="false"
        >
          {triggerLabel}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Åtgärdsmeny"
        onAction={(key) => {
          const item = items.find((i) => i.key === key);
          if (item && item.key !== "__divider__") {
            (item as { onSelect: () => void }).onSelect();
          }
        }}
      >
        {items.map((it) => {
          if (it.key === "__divider__") return <Divider key="__divider__" className="my-1" />;
          
          const actionItem = it as { key: string; label: string; kbd?: string; onSelect: () => void; disabled?: boolean; danger?: boolean };
          
          return (
            <DropdownItem
              key={actionItem.key}
              className={actionItem.danger ? "text-danger" : ""}
              color={actionItem.danger ? "danger" : "default"}
              isDisabled={actionItem.disabled}
              endContent={actionItem.kbd ? <Kbd>{actionItem.kbd}</Kbd> : null}
            >
              {actionItem.label}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
}