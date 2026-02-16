'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DAY_LABELS: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

// Generate time options in 30-min increments from 5:00 AM to 11:30 PM
const TIMES: string[] = [];
for (let h = 5; h <= 23; h++) {
  for (const m of ['00', '30']) {
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const ampm = h >= 12 ? 'PM' : 'AM';
    TIMES.push(`${hour12}:${m} ${ampm}`);
  }
}

interface ParsedHours {
  open: string;
  close: string;
  closed: boolean;
}

function parseHourString(value: string | undefined): ParsedHours {
  if (!value || value.toLowerCase() === 'closed') {
    return { open: '', close: '', closed: true };
  }
  // Try to parse "9:00 AM - 5:00 PM" format
  const parts = value.split(/\s*[-–]\s*/);
  if (parts.length === 2) {
    const open = parts[0].trim();
    const close = parts[1].trim();
    // Check if both parts match a known time
    const openMatch = TIMES.find((t) => t === open);
    const closeMatch = TIMES.find((t) => t === close);
    if (openMatch && closeMatch) {
      return { open: openMatch, close: closeMatch, closed: false };
    }
  }
  return { open: '', close: '', closed: false };
}

function formatHours(parsed: ParsedHours): string {
  if (parsed.closed) return 'Closed';
  if (parsed.open && parsed.close) return `${parsed.open} - ${parsed.close}`;
  return '';
}

interface HoursEditorProps {
  hours: Record<string, string> | null;
  onChange: (hours: Record<string, string>) => void;
}

export function HoursEditor({ hours, onChange }: HoursEditorProps) {
  const current = hours || {};

  function updateDay(day: string, parsed: ParsedHours) {
    onChange({ ...current, [day]: formatHours(parsed) });
  }

  function applyToWeekdays() {
    const monHours = current['mon'];
    if (!monHours) return;
    const updated = { ...current };
    for (const day of ['tue', 'wed', 'thu', 'fri']) {
      updated[day] = monHours;
    }
    onChange(updated);
  }

  function applyToAll() {
    const monHours = current['mon'];
    if (!monHours) return;
    const updated = { ...current };
    for (const day of DAYS) {
      updated[day] = monHours;
    }
    onChange(updated);
  }

  return (
    <div className="space-y-2">
      {DAYS.map((day) => {
        const parsed = parseHourString(current[day]);
        return (
          <div key={day} className="flex items-center gap-2">
            <span className="w-10 text-sm font-medium text-muted-foreground shrink-0">{DAY_LABELS[day]}</span>
            <button
              type="button"
              onClick={() => {
                if (parsed.closed) {
                  // Toggle to open with default hours
                  updateDay(day, { open: '9:00 AM', close: '5:00 PM', closed: false });
                } else {
                  updateDay(day, { open: '', close: '', closed: true });
                }
              }}
              className={`shrink-0 text-xs px-2 py-1 rounded border transition-colors ${
                parsed.closed
                  ? 'bg-muted text-muted-foreground border-border'
                  : 'bg-primary/10 text-primary border-primary/20'
              }`}
            >
              {parsed.closed ? 'Closed' : 'Open'}
            </button>
            {!parsed.closed && (
              <>
                <Select
                  value={parsed.open}
                  onValueChange={(v) => updateDay(day, { ...parsed, open: v })}
                >
                  <SelectTrigger className="w-[120px] h-8 text-sm">
                    <SelectValue placeholder="Open" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMES.map((t) => (
                      <SelectItem key={t} value={t} className="text-sm">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground text-sm">to</span>
                <Select
                  value={parsed.close}
                  onValueChange={(v) => updateDay(day, { ...parsed, close: v })}
                >
                  <SelectTrigger className="w-[120px] h-8 text-sm">
                    <SelectValue placeholder="Close" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMES.map((t) => (
                      <SelectItem key={t} value={t} className="text-sm">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        );
      })}
      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={applyToWeekdays}>
          <Copy className="h-3 w-3 mr-1" /> Mon → Weekdays
        </Button>
        <Button type="button" variant="outline" size="sm" className="text-xs h-7" onClick={applyToAll}>
          <Copy className="h-3 w-3 mr-1" /> Mon → All
        </Button>
      </div>
    </div>
  );
}
