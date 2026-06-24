import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Button} from '@/components/ui/button';

describe('Button', () => {
  it('renders the compact small variant', () => {
    render(<Button size="sm">保存</Button>);

    expect(screen.getByRole('button', {name: '保存'})).toHaveClass(
      'h-8',
      'gap-1.5',
      'text-xs',
    );
  });
});
