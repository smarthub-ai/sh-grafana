// Core Grafana history https://github.com/grafana/grafana/blob/v11.0.0-preview/public/app/plugins/datasource/prometheus/query_hints.test.ts
import { QueryHint } from '@grafana/data';
import { QueryBuilderLabelFilter } from '@grafana/plugin-ui';

import { PrometheusDatasource } from './datasource';
import {
  getExpandRulesHints,
  getQueryHints,
  getQueryLabelsForRuleName,
  getRecordingRuleIdentifierIdx,
  isRuleInQuery,
  SUM_HINT_THRESHOLD_COUNT,
} from './query_hints';
import { buildVisualQueryFromString } from './querybuilder/parsing';
import { RuleQueryMapping } from './types';

describe('getQueryHints()', () => {
  it('returns no hints for no series', () => {
    expect(getQueryHints('', [])).toEqual([]);
  });

  it('returns no hints for empty series', () => {
    expect(getQueryHints('', [{ datapoints: [] }])).toEqual([]);
  });

  it('returns a rate hint for a counter metric', () => {
    const series = [
      {
        datapoints: [
          [23, 1000],
          [24, 1001],
        ],
      },
    ];
    const hints = getQueryHints('metric_total', series);

    expect(hints!.length).toBe(1);
    expect(hints![0]).toMatchObject({
      label: 'Selected metric looks like a counter.',
      fix: {
        action: {
          type: 'ADD_RATE',
          query: 'metric_total',
        },
      },
    });
  });

  it('returns a certain rate hint for a counter metric', () => {
    const series = [
      {
        datapoints: [
          [23, 1000],
          [24, 1001],
        ],
      },
    ];
    const mock: unknown = { languageProvider: { retrieveMetricsMetadata: () => ({ foo: { type: 'counter' } }) } };
    const datasource = mock as PrometheusDatasource;

    let hints = getQueryHints('foo', series, datasource);
    expect(hints!.length).toBe(1);
    expect(hints![0]).toMatchObject({
      label: 'Selected metric is a counter.',
      fix: {
        action: {
          type: 'ADD_RATE',
          query: 'foo',
        },
      },
    });

    // Test substring match not triggering hint
    hints = getQueryHints('foo_foo', series, datasource);
    expect(hints).toEqual([]);
  });

  it('returns no rate hint for a counter metric that already has a rate', () => {
    const series = [
      {
        datapoints: [
          [23, 1000],
          [24, 1001],
        ],
      },
    ];
    const hints = getQueryHints('rate(metric_total[1m])', series);
    expect(hints).toEqual([]);
  });

  it('returns no rate hint for a counter metric that already has an increase', () => {
    const series = [
      {
        datapoints: [
          [23, 1000],
          [24, 1001],
        ],
      },
    ];
    const hints = getQueryHints('increase(metric_total[1m])', series);
    expect(hints).toEqual([]);
  });

  it('returns a rate hint with action for a counter metric with labels', () => {
    const series = [
      {
        datapoints: [
          [23, 1000],
          [24, 1001],
        ],
      },
    ];
    const hints = getQueryHints('metric_total{job="grafana"}', series);
    expect(hints!.length).toBe(1);
    expect(hints![0].label).toContain('Selected metric looks like a counter');
    expect(hints![0].fix).toBeDefined();
  });

  it('returns a rate hint w/o action for a complex counter metric', () => {
    const series = [
      {
        datapoints: [
          [23, 1000],
          [24, 1001],
        ],
      },
    ];
    const hints = getQueryHints('sum(metric_total)', series);
    expect(hints!.length).toBe(1);
    expect(hints![0].label).toContain('rate()');
    expect(hints![0].fix).toBeUndefined();
  });

  it('returns a histogram hint for a bucket series', () => {
    const series = [{ datapoints: [[23, 1000]] }];
    const hints = getQueryHints('metric_bucket', series);
    expect(hints!.length).toBe(1);
    expect(hints![0]).toMatchObject({
      label: 'Selected metric has buckets.',
      fix: {
        action: {
          type: 'ADD_HISTOGRAM_QUANTILE',
          query: 'metric_bucket',
        },
      },
    });
  });

  it('returns a histogram hint with action for a bucket with labels', () => {
    const series = [
      {
        datapoints: [
          [23, 1000],
          [24, 1001],
        ],
      },
    ];
    const hints = getQueryHints('metric_bucket{job="grafana"}', series);
    expect(hints!.length).toBe(1);
    expect(hints![0].label).toContain('Selected metric has buckets.');
    expect(hints![0].fix).toBeDefined();
  });

  it('returns a sum hint when many time series results are returned for a simple metric', () => {
    const seriesCount = SUM_HINT_THRESHOLD_COUNT;
    const series = Array.from({ length: seriesCount }, (_) => ({
      datapoints: [
        [0, 0],
        [0, 0],
      ],
    }));
    const hints = getQueryHints('metric', series);
    expect(hints!.length).toBe(1);
    expect(hints![0]).toMatchObject({
      type: 'ADD_SUM',
      label: 'Many time series results returned.',
      fix: {
        label: 'Consider aggregating with sum().',
        action: {
          type: 'ADD_SUM',
          query: 'metric',
          preventSubmit: true,
        },
      },
    });
  });

  it('should not return rate hint for a recorded query', () => {
    const seriesCount = SUM_HINT_THRESHOLD_COUNT;
    const series = Array.from({ length: seriesCount }, (_) => ({
      datapoints: [
        [0, 0],
        [0, 0],
      ],
    }));
    let hints = getQueryHints('node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate', series);
    expect(hints!.length).toBe(0);

    hints = getQueryHints('node_namespace_pod_container:container_cpu_usage_seconds_total', series);
    expect(hints!.length).toBe(0);

    hints = getQueryHints('container_cpu_usage_seconds_total:irate_total', series);
    expect(hints!.length).toBe(0);
  });

  // native histograms
  it('returns hints for native histogram by metric type without suffix "_bucket"', () => {
    const series = [
      {
        datapoints: [
          [23, 1000],
          [24, 1001],
        ],
      },
    ];
    const mock: unknown = { languageProvider: { retrieveMetricsMetadata: () => ({ foo: { type: 'histogram' } }) } };
    const datasource = mock as PrometheusDatasource;

    let hints = getQueryHints('foo', series, datasource);
    expect(hints!.length).toBe(3);
    const hintsString = JSON.stringify(hints);
    expect(hintsString).toContain('ADD_HISTOGRAM_AVG');
    expect(hintsString).toContain('ADD_HISTOGRAM_COUNT');
    expect(hintsString).toContain('ADD_HISTOGRAM_QUANTILE');
  });

  it('returns no hints for native histogram when there are native histogram functions in the query', () => {
    const queryWithNativeHistogramFunction = 'histogram_avg(foo)';
    const series = [
      {
        datapoints: [
          [23, 1000],
          [24, 1001],
        ],
      },
    ];
    const mock: unknown = { languageProvider: { retrieveMetricsMetadata: () => ({ foo: { type: 'histogram' } }) } };
    const datasource = mock as PrometheusDatasource;

    let hints = getQueryHints(queryWithNativeHistogramFunction, series, datasource);
    expect(hints!.length).toBe(0);
  });
});

describe('getExpandRulesHints', () => {
  it('should return no hint when no rule is present in query', () => {
    const extractedMapping: RuleQueryMapping = {};
    const hints = getExpandRulesHints('metric_5m', extractedMapping);
    const expected: QueryHint[] = [];
    expect(hints).toEqual(expected);
  });

  it('should return expand rule hint, single rules', () => {
    const extractedMapping: RuleQueryMapping = {
      metric_5m: [
        {
          query: 'expanded_metric_query[5m]',
          labels: {},
        },
      ],
      metric_15m: [
        {
          query: 'expanded_metric_query[15m]',
          labels: {},
        },
      ],
    };
    const query = `metric_5m`;
    const hints = getExpandRulesHints('metric_5m', extractedMapping);
    const expected = expect.arrayContaining([expect.objectContaining({ type: 'EXPAND_RULES' })]);
    expect(hints).toEqual(expected);
    expect(hints).toEqual([
      {
        type: 'EXPAND_RULES',
        label: 'Query contains recording rules.',
        fix: {
          label: 'Expand rules',
          action: {
            type: 'EXPAND_RULES',
            query,
            options: {
              metric_5m: {
                expandedQuery: 'expanded_metric_query[5m]',
              },
            },
          },
        },
      },
    ]);
  });

  it('should return no expand rule hint, if the given query does not have a label', () => {
    const extractedMapping: RuleQueryMapping = {
      metric_5m: [
        {
          query: 'expanded_metric_query_111[5m]',
          labels: {
            uuid: '111',
          },
        },
        {
          query: 'expanded_metric_query_222[5m]',
          labels: {
            uuid: '222',
          },
        },
      ],
      metric_15m: [
        {
          query: 'expanded_metric_query[15m]',
          labels: {},
        },
      ],
    };
    const hints = getExpandRulesHints(
      `sum(metric_5m{uuid="5m"} + metric_10m{uuid="10m"}) + metric_66m{uuid="66m"}`,
      extractedMapping
    );
    const expected = expect.arrayContaining([expect.objectContaining({ type: 'EXPAND_RULES_WARNING' })]);
    expect(hints).toEqual(expected);
  });

  it('should return expand rule warning hint, if the given query *does* have a label', () => {
    const extractedMapping: RuleQueryMapping = {
      metric_5m: [
        {
          query: 'expanded_metric_query_111[5m]',
          labels: {
            uuid: '111',
          },
        },
        {
          query: 'expanded_metric_query_222[5m]',
          labels: {
            uuid: '222',
          },
        },
      ],
      metric_15m: [
        {
          query: 'expanded_metric_query[15m]',
          labels: {},
        },
      ],
    };
    const query = `metric_5m{uuid="111"}`;
    const hints = getExpandRulesHints('metric_5m{uuid="111"}', extractedMapping);
    expect(hints).toEqual([
      {
        type: 'EXPAND_RULES',
        label: 'Query contains recording rules.',
        fix: {
          label: 'Expand rules',
          action: {
            type: 'EXPAND_RULES',
            query,
            options: {
              metric_5m: {
                expandedQuery: 'expanded_metric_query_111[5m]',
                identifier: 'uuid',
                identifierValue: '111',
              },
            },
          },
        },
      },
    ]);
  });

  it('should return expand rule hint, when given query include a non-unique rule name', () => {
    const extractedMapping: RuleQueryMapping = {
      'duration:p95': [
        {
          query: 'expanded_duration_p95{}',
          labels: {},
        },
        {
          query: 'expanded_duration_p95_aggregated{}',
          labels: {
            span_name: '__aggregated__',
          },
        },
      ],
      'duration:p95:upper_threshold': [
        {
          query: 'expanded_duration_p95_upper_threshold{}',
          labels: {},
        },
      ],
    };
    const query = 'sum(rate(duration:p95:upper_threshold{label="foo"}[5m])) by(bar)';
    const hints = getExpandRulesHints(query, extractedMapping);
    expect(hints).toEqual([
      {
        type: 'EXPAND_RULES',
        label: 'Query contains recording rules.',
        fix: {
          label: 'Expand rules',
          action: {
            type: 'EXPAND_RULES',
            query,
            options: {
              'duration:p95:upper_threshold': {
                expandedQuery: 'expanded_duration_p95_upper_threshold{}',
              },
            },
          },
        },
      },
    ]);
  });

  it('should return expand rule hint, when given query include a non-unique rule name - second case', () => {
    const extractedMapping: RuleQueryMapping = {
      'duration:p95': [
        {
          query: 'expanded_duration_p95{}',
          labels: {},
        },
        {
          query: 'expanded_duration_p95_aggregated{}',
          labels: {
            span_name: '__aggregated__',
          },
        },
      ],
      'upper_threshold:duration:p95': [
        {
          query: 'expanded_duration_p95_upper_threshold{}',
          labels: {},
        },
      ],
    };
    const query = 'sum(rate(upper_threshold:duration:p95{label="foo"}[5m])) by(bar)';
    const hints = getExpandRulesHints(query, extractedMapping);
    expect(hints).toEqual([
      {
        type: 'EXPAND_RULES',
        label: 'Query contains recording rules.',
        fix: {
          label: 'Expand rules',
          action: {
            type: 'EXPAND_RULES',
            query,
            options: {
              'upper_threshold:duration:p95': {
                expandedQuery: 'expanded_duration_p95_upper_threshold{}',
              },
            },
          },
        },
      },
    ]);
  });
});

describe('getRecordingRuleIdentifierIdx', () => {
  it('should return the matching identifier', () => {
    const mapping: RuleQueryMapping[string] = [
      {
        query: 'expanded_metric_query_111[5m]',
        labels: {
          uuid: '111',
        },
      },
      {
        query: 'expanded_metric_query_222[5m]',
        labels: {
          uuid: '222',
        },
      },
    ];
    const ruleName = `metric_5m`;
    const query = `metric_5m{uuid="111"}`;
    const { idx, identifier, identifierValue, expandedQuery } = getRecordingRuleIdentifierIdx(query, ruleName, mapping);
    expect(idx).toEqual(0);
    expect(identifier).toEqual(`uuid`);
    expect(identifierValue).toEqual('111');
    expect(expandedQuery).toEqual(`expanded_metric_query_111[5m]`);
  });

  it('should not return the matching identifier', () => {
    const mapping: RuleQueryMapping[string] = [
      {
        query: 'expanded_metric_query_111[5m]',
        labels: {
          uuid: '111',
        },
      },
      {
        query: 'expanded_metric_query_222[5m]',
        labels: {
          uuid: '222',
        },
      },
    ];
    const ruleName = `metric_5m`;
    const query = `metric_5m{uuid="999"}`;
    const { idx } = getRecordingRuleIdentifierIdx(query, ruleName, mapping);
    expect(idx).toEqual(-1);
  });

  it('should return the matching identifier index for a complex query', () => {
    const mapping: RuleQueryMapping[string] = [
      {
        query: 'expanded_metric_query_111[5m]',
        labels: {
          uuid: '111',
        },
      },
      {
        query: 'expanded_metric_query_222[5m]',
        labels: {
          uuid: '222',
        },
      },
    ];
    const ruleName = `metric_55m`;
    const query = `metric_5m{uuid="111"} + metric_55m{uuid="222"}`;
    const { idx, identifier, identifierValue, expandedQuery } = getRecordingRuleIdentifierIdx(query, ruleName, mapping);
    expect(idx).toEqual(1);
    expect(identifier).toEqual(`uuid`);
    expect(identifierValue).toEqual('222');
    expect(expandedQuery).toEqual(`expanded_metric_query_222[5m]`);
  });

  it('should return the matching identifier index for a complex query with binary operators', () => {
    const mapping: RuleQueryMapping[string] = [
      {
        query: 'expanded_metric_query_111[5m]',
        labels: {
          uuid: '111',
        },
      },
      {
        query: 'expanded_metric_query_222[5m]',
        labels: {
          uuid: '222',
        },
      },
      {
        query: 'expanded_metric_query_333[5m]',
        labels: {
          uuid: '333',
        },
      },
    ];
    const ruleName = `metric_5m`;
    const query = `metric_7n{} + (metric_5m{uuid="333"} + metric_55m{uuid="222"})`;
    const { idx, identifier, identifierValue, expandedQuery } = getRecordingRuleIdentifierIdx(query, ruleName, mapping);
    expect(idx).toEqual(2);
    expect(identifier).toEqual(`uuid`);
    expect(identifierValue).toEqual('333');
    expect(expandedQuery).toEqual(`expanded_metric_query_333[5m]`);
  });
});

describe('getQueryLabelsForRuleName', () => {
  it('should return labels for the metric name', () => {
    const metricName = `metric_5m`;
    const query = `metric_5m{uuid="111"}`;
    const { query: visualQuery } = buildVisualQueryFromString(query);
    const result = getQueryLabelsForRuleName(metricName, visualQuery);
    const expected: QueryBuilderLabelFilter[] = [{ label: 'uuid', op: '=', value: '111' }];
    expect(result).toEqual(expected);
  });

  it('should return labels from a query with binary operations', () => {
    const metricName = `metric_5m`;
    const query = `metric_55m{uuid="222"} + metric_33m{uuid="333"} + metric_5m{uuid="111"}`;
    const { query: visualQuery } = buildVisualQueryFromString(query);
    const result = getQueryLabelsForRuleName(metricName, visualQuery);
    const expected: QueryBuilderLabelFilter[] = [{ label: 'uuid', op: '=', value: '111' }];
    expect(result).toEqual(expected);
  });

  it('should return labels from a query with binary operations with parentheses', () => {
    const metricName = `metric_5m`;
    const query = `(metric_55m{uuid="222"} + metric_33m{uuid="333"}) + metric_5m{uuid="111"}`;
    const { query: visualQuery } = buildVisualQueryFromString(query);
    const result = getQueryLabelsForRuleName(metricName, visualQuery);
    const expected: QueryBuilderLabelFilter[] = [{ label: 'uuid', op: '=', value: '111' }];
    expect(result).toEqual(expected);
  });

  it('should return labels from a query for the first metricName match', () => {
    const metricName = `metric_5m`;
    const query = `(metric_55m{uuid="222"} + metric_33m{uuid="333"}) + metric_5m{uuid="999"} + metric_5m{uuid="555"}`;
    const { query: visualQuery } = buildVisualQueryFromString(query);
    const result = getQueryLabelsForRuleName(metricName, visualQuery);
    const expected: QueryBuilderLabelFilter[] = [{ label: 'uuid', op: '=', value: '999' }];
    expect(result).toEqual(expected);
  });
});

describe('ruleInQuery', () => {
  it('should return true when ruleName is present in the query', () => {
    expect(isRuleInQuery('rate(http_requests_total{job="api"}[5m])', 'http_requests_total')).toBe(true);
  });

  it('should return false when ruleName is not present in the query', () => {
    expect(isRuleInQuery('rate(cpu_usage{instance="localhost"}[5m])', 'http_requests_total')).toBe(false);
  });

  it('should return true for ruleName at the start of the query', () => {
    expect(isRuleInQuery('http_requests_total{job="api"}', 'http_requests_total')).toBe(true);
  });

  it('should return true for ruleName at the end of the query', () => {
    expect(isRuleInQuery('sum by (instance) (http_requests_total)', 'http_requests_total')).toBe(true);
    expect(isRuleInQuery('sum(http_requests_total)', 'http_requests_total')).toBe(true);
    expect(isRuleInQuery('http_requests_total', 'http_requests_total')).toBe(true);
  });

  it('should return true when ruleName is followed by spaces', () => {
    expect(isRuleInQuery('http_requests_total { job="api" }', 'http_requests_total')).toBe(true);
  });

  it('should return false when ruleName is a substring of another metric', () => {
    expect(isRuleInQuery('rate(http_requests_total_new{job="api"}[5m])', 'http_requests_total')).toBe(false);
  });

  it('should return false for escaped ruleName usage', () => {
    expect(isRuleInQuery('rate(\"http_requests_total\"{job="api"}[5m])', 'http_requests_total')).toBe(false);
  });

  it('should return false when query is empty', () => {
    expect(isRuleInQuery('', 'http_requests_total')).toBe(false);
  });

  it('should return false when ruleName is an empty string', () => {
    expect(isRuleInQuery('rate(http_requests_total{job="api"}[5m])', '')).toBe(false);
  });

  it('should return false when both query and ruleName are empty', () => {
    expect(isRuleInQuery('', '')).toBe(false);
  });

  it('should return true when used with binary operations', () => {
    expect(isRuleInQuery('rate(http_requests_total{job="api"}[5m]) + my:rule', 'my:rule')).toBe(true);
    expect(isRuleInQuery('rate(http_requests_total{job="api"}[5m])+my:rule', 'my:rule')).toBe(true);
  });

  it('should return true when ruleName is inside nested functions', () => {
    expect(isRuleInQuery('sum(rate(http_requests_total[5m]))', 'http_requests_total')).toBe(true);
  });

  it('should return false when ruleName is part of a label value', () => {
    expect(isRuleInQuery('http_requests_total_bytes{rule="http_requests_total"}', 'http_requests_total')).toBe(false);
  });

  it('should return true when ruleName contains special characters like colon', () => {
    expect(isRuleInQuery('rate(my_namespace:http_requests_total[5m])', 'my_namespace:http_requests_total')).toBe(true);
  });

  it('should return false when ruleName appears within string literals', () => {
    expect(
      isRuleInQuery(
        'label_replace(http_requests_total, "label", "value", "instance", "http_requests_total")',
        'http_requests_total'
      )
    ).toBe(false);
  });
});
