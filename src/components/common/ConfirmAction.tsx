import {
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactElement,
} from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {Button} from '@/components/ui/button';

type ConfirmActionTrigger =
  | string
  | number
  | ReactElement<ComponentProps<typeof Button>, typeof Button>
  | ReactElement<ComponentProps<'button'>, 'button'>;

export type ConfirmActionProps = {
  trigger: ConfirmActionTrigger;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
};

const invalidTriggerMessage =
  'ConfirmAction trigger must be text, a native button, or a shadcn Button without asChild';

function renderTrigger(trigger: ConfirmActionTrigger) {
  if (typeof trigger === 'string' || typeof trigger === 'number') {
    return (
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive">
          {trigger}
        </Button>
      </AlertDialogTrigger>
    );
  }

  if (isValidElement(trigger) && trigger.type === 'button') {
    return (
      <AlertDialogTrigger asChild>
        {cloneElement(trigger, {type: 'button'})}
      </AlertDialogTrigger>
    );
  }

  if (
    isValidElement(trigger) &&
    trigger.type === Button &&
    (trigger.props as ComponentProps<typeof Button>).asChild !== true
  ) {
    return (
      <AlertDialogTrigger asChild>
        {cloneElement(trigger, {type: 'button'})}
      </AlertDialogTrigger>
    );
  }

  throw new Error(invalidTriggerMessage);
}

export function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel = '确认删除',
  cancelLabel = '取消',
  onConfirm,
}: ConfirmActionProps) {
  return (
    <AlertDialog>
      {renderTrigger(trigger)}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
