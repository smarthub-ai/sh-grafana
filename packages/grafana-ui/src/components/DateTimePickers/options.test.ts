import { baseQuickOptions, futureOptions, quickOptions } from './options';

describe('DateTimePickers options', () => {
  it('defines futureOptions correctly with the 4 required filters', () => {
    expect(futureOptions).toEqual([
      { from: 'now/d', to: 'now/d', display: 'Today' },
      { from: 'now+1d/d', to: 'now+1d/d', display: 'Next Day' },
      { from: 'now+1w/w', to: 'now+1w/w', display: 'Next Week' },
      { from: 'now+1M/M', to: 'now+1M/M', display: 'Next Month' },
    ]);
  });

  it('defines baseQuickOptions without future filters by default', () => {
    expect(baseQuickOptions.map((o) => o.display)).toEqual([
      'Last 24 hours',
      'Last 7 days',
      'Last 30 days',
      'Last 90 days',
      'Last 6 months',
      'Last 1 year',
      'Last week',
      'Previous month',
      'This month so far',
    ]);
  });

  it('quickOptions matches baseQuickOptions when FUTURE is not enabled', () => {
    if (!process.env.FUTURE || process.env.FUTURE === 'false') {
      expect(quickOptions).toEqual(baseQuickOptions);
    } else {
      expect(quickOptions).toEqual([...futureOptions, ...baseQuickOptions]);
    }
  });
});
