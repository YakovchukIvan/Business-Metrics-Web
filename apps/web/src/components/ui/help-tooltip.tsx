import { AlertCircle, HelpCircle } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

type Props = {
  content: React.ReactNode;
  icon?: 'help' | 'alert';
  className?: string;
  contentClassName?: string;
};

export const TOOLTIP_DELAY = 50;

export function HelpTooltip({ content, icon = 'help', className, contentClassName }: Props) {
  const Icon = icon === 'alert' ? AlertCircle : HelpCircle;

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={TOOLTIP_DELAY}
        closeDelay={TOOLTIP_DELAY}
        type="button"
        className={cn(
          'text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full cursor-help inline-flex items-center justify-center',
          className,
        )}
      >
        <Icon className="w-4 h-4" />
        <span className="sr-only">Help</span>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="center"
        className={cn(
          'w-72 p-4 shadow-xl border-gray-200 text-sm font-medium text-gray-700 leading-relaxed',
          contentClassName,
        )}
      >
        {content}
      </HoverCardContent>
    </HoverCard>
  );
}
