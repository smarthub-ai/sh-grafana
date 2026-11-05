import { isInPulseDashboardViewer } from './pulseDashboardViewer';

describe('pulseDashboardViewer', () => {
  const originalParent = window.parent;

  const setParent = (parent: unknown) => {
    Object.defineProperty(window, 'parent', { value: parent, configurable: true, writable: true });
  };

  afterEach(() => {
    setParent(originalParent);
  });

  it('is false when Grafana is not embedded', () => {
    expect(isInPulseDashboardViewer()).toBe(false);
  });

  it.each`
    hash                                                | expected
    ${'#/insights/Andon%20Analytics'}                   | ${true}
    ${'#/insights/d/abc/my-dash?orgId=1'}               | ${true}
    ${'#/ops/flow-intelligence/insights/d/abc/my-dash'} | ${true}
    ${'#/insights'}                                     | ${false}
    ${'#/ops/flow-intelligence'}                        | ${false}
    ${'#/assets'}                                       | ${false}
    ${''}                                               | ${false}
  `("is $expected when the parent hash is '$hash'", ({ hash, expected }) => {
    setParent({ location: { hash } });

    expect(isInPulseDashboardViewer()).toBe(expected);
  });

  it('is false when the parent is on another origin', () => {
    setParent({
      get location() {
        throw new Error('cross-origin');
      },
    });

    expect(isInPulseDashboardViewer()).toBe(false);
  });
});
