import { addDateSeparators, formatDateLabel } from '../features/messaging/utils/messageHelpers';

const makeMsg = (id, timestamp) => ({
  id,
  sender: 'user',
  content: 'hello',
  timestamp,
});

describe('addDateSeparators', () => {
  it('returns empty array for empty input', () => {
    expect(addDateSeparators([])).toEqual([]);
  });

  it('inserts one date separator for messages on same day', () => {
    const msgs = [
      makeMsg('1', '2024-01-15T10:00:00Z'),
      makeMsg('2', '2024-01-15T11:00:00Z'),
    ];
    const result = addDateSeparators(msgs);
    const separators = result.filter((m) => m.type === 'date');
    expect(separators).toHaveLength(1);
  });

  it('inserts two date separators for messages on different days', () => {
    const msgs = [
      makeMsg('1', '2024-01-14T10:00:00Z'),
      makeMsg('2', '2024-01-15T10:00:00Z'),
    ];
    const result = addDateSeparators(msgs);
    const separators = result.filter((m) => m.type === 'date');
    expect(separators).toHaveLength(2);
  });

  it('preserves message order (separator → message)', () => {
    const msgs = [makeMsg('1', '2024-01-15T10:00:00Z')];
    const result = addDateSeparators(msgs);
    expect(result[0].type).toBe('date');
    expect(result[1].id).toBe('1');
  });

  it('strips existing date separators before re-inserting', () => {
    const msgs = [
      { id: 'date-old', type: 'date', date: 'old' },
      makeMsg('1', '2024-01-15T10:00:00Z'),
    ];
    const result = addDateSeparators(msgs);
    const separators = result.filter((m) => m.type === 'date');
    expect(separators).toHaveLength(1);
  });
});

describe('formatDateLabel', () => {
  it('returns "Today" for today\'s date', () => {
    const today = new Date().toISOString();
    expect(formatDateLabel(today)).toBe('Today');
  });

  it('returns "Yesterday" for yesterday\'s date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatDateLabel(yesterday.toISOString())).toBe('Yesterday');
  });

  it('returns formatted date for older dates', () => {
    const old = '2020-06-15T10:00:00Z';
    const label = formatDateLabel(old);
    expect(label).toMatch(/Jun/);
    expect(label).toMatch(/2020/);
  });
});
