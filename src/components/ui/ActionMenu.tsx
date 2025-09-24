"use client";

import React from 'react';
import { 
  Button, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  DropdownSection,
  Kbd
} from '@heroui/react';
import type { KbdKey } from '@heroui/kbd';
import { 
  Plus, 
  Copy, 
  Edit3, 
  Trash2, 
  MoreVertical 
} from 'lucide-react';
import { actions } from '@/locales/sv/quiz';

export interface ActionItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: KbdKey[];
  onPress?: () => void;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export interface ActionSection {
  key: string;
  title?: string;
  items: ActionItem[];
}

interface ActionMenuProps {
  onNew?: () => void;
  onCopy?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  // Enhanced API for custom actions
  sections?: ActionSection[];
  triggerLabel?: string;
  triggerVariant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow' | 'ghost';
  className?: string;
}

export function ActionMenu({ 
  onNew, 
  onCopy, 
  onEdit, 
  onDelete,
  sections,
  triggerLabel = actions.menu.label,
  triggerVariant = "bordered",
  className
}: ActionMenuProps) {
  // Default sections if not provided
  const defaultSections: ActionSection[] = [
    {
      key: 'general',
      title: actions.separators.general,
      items: [
        {
          key: 'new',
          label: 'Nytt quiz',
          icon: <Plus size={16} />,
          shortcut: ['command'] as KbdKey[],
          onPress: onNew
        },
        {
          key: 'copy',
          label: 'Kopiera länk',
          icon: <Copy size={16} />,
          shortcut: ['command'] as KbdKey[],
          onPress: onCopy
        },
        {
          key: 'edit',
          label: 'Redigera',
          icon: <Edit3 size={16} />,
          shortcut: ['command'] as KbdKey[],
          onPress: onEdit
        }
      ].filter(item => item.onPress) // Only include items with handlers
    },
    {
      key: 'danger',
      title: actions.separators.danger,
      items: [
        {
          key: 'delete',
          label: 'Radera',
          icon: <Trash2 size={16} />,
          shortcut: ['command', 'shift'] as KbdKey[],
          onPress: onDelete,
          color: 'danger' as const,
          className: 'text-danger'
        }
      ].filter(item => item.onPress) // Only include items with handlers
    }
  ].filter(section => section.items.length > 0); // Only include sections with items

  const renderItems = sections || defaultSections;

  return (
    <Dropdown className={className}>
      <DropdownTrigger>
        <Button 
          variant={triggerVariant}
          startContent={<MoreVertical size={16} />}
          aria-label={actions.menu.ariaLabel}
          className="min-w-[44px] min-h-[44px]" // Touch target requirements
        >
          {triggerLabel}
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label={actions.menu.ariaLabel}
        variant="flat"
        disallowEmptySelection
        closeOnSelect={true}
      >
        {renderItems.map((section, sectionIndex) => (
          <DropdownSection 
            key={section.key} 
            title={section.title}
            showDivider={sectionIndex < renderItems.length - 1}
          >
            {section.items.map((item) => (
              <DropdownItem
                key={item.key}
                startContent={item.icon}
                endContent={
                  item.shortcut ? (
                    <Kbd keys={item.shortcut}>{item.key.charAt(0).toUpperCase()}</Kbd>
                  ) : undefined
                }
                onPress={item.onPress}
                color={item.color}
                className={item.className}
              >
                {item.label}
              </DropdownItem>
            ))}
          </DropdownSection>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}