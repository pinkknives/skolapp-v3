"use client";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Button,
  Kbd,
} from "@heroui/react";
import { MoreVertical } from "lucide-react";

export type ActionItem =
  | { key: string; label: string; kbd?: string; onSelect: () => void; disabled?: boolean; danger?: false }
  | { key: string; label: string; kbd?: string; onSelect: () => void; disabled?: boolean; danger: true };

type Props = {
  triggerLabel?: string;
  items: ActionItem[];
};

export function ActionsMenu({ triggerLabel = "Åtgärder", items }: Props) {
  // Split items into sections based on danger property
  const regularItems = items.filter(item => !item.danger);
  const dangerItems = items.filter(item => item.danger);

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
          if (item) {
            item.onSelect();
          }
        }}
      >
        {regularItems.length > 0 ? (
          <DropdownSection>
            {regularItems.map((item) => (
              <DropdownItem
                key={item.key}
                isDisabled={item.disabled}
                endContent={item.kbd ? <Kbd>{item.kbd}</Kbd> : null}
              >
                {item.label}
              </DropdownItem>
            ))}
          </DropdownSection>
        ) : null}
        {dangerItems.length > 0 ? (
          <DropdownSection showDivider={regularItems.length > 0}>
            {dangerItems.map((item) => (
              <DropdownItem
                key={item.key}
                className="text-danger"
                color="danger"
                isDisabled={item.disabled}
                endContent={item.kbd ? <Kbd>{item.kbd}</Kbd> : null}
              >
                {item.label}
              </DropdownItem>
            ))}
          </DropdownSection>
        ) : null}
      </DropdownMenu>
    </Dropdown>
  );
}