// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { analytics } from '../utils/analytics';

interface AnalyticsProviderProps {
  children: ReactNode;
}

/**
 * Provider component that sets up global analytics tracking
 * Tracks touch vs click events, online/offline status, and performance metrics
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps): ReactNode {
  useEffect(() => {
    // Track initial load performance
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;

      if (loadTime > 0) {
        analytics.trackPerformance('page_load_time', loadTime);
      }
    }

    // Track touch vs click events globally
    const handleTouchStart = (e: TouchEvent): void => {
      const target = e.target as HTMLElement;
      const elementName = target.tagName.toLowerCase();
      const elementId = target.id || target.className || elementName;

      analytics.trackInteractionType(elementId, 'touch');
      analytics.trackMobileInteraction('touch', elementId);
    };

    const handleClick = (e: MouseEvent): void => {
      const target = e.target as HTMLElement;
      const elementName = target.tagName.toLowerCase();
      const elementId = target.id || target.className || elementName;

      // Only track if it wasn't a touch event (avoid double counting)
      if (e.detail > 0) {
        // detail > 0 means real click, not programmatic
        analytics.trackInteractionType(elementId, 'click');
      }
    };

    // Track online/offline events
    const handleOnline = (): void => {
      analytics.trackEvent({
        category: 'Network',
        action: 'online',
        label: 'Connection restored',
      });
    };

    const handleOffline = (): void => {
      analytics.trackEvent({
        category: 'Network',
        action: 'offline',
        label: 'Connection lost',
      });
    };

    // Track visibility changes (mobile users switching tabs/apps)
    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        analytics.trackEvent({
          category: 'Engagement',
          action: 'page_hidden',
          label: 'User switched away',
        });
      } else {
        analytics.trackEvent({
          category: 'Engagement',
          action: 'page_visible',
          label: 'User returned',
        });
      }
    };

    // Track orientation changes (mobile)
    const handleOrientationChange = (): void => {
      const orientation = window.screen.orientation?.type || 'unknown';
      analytics.trackMobileInteraction('orientation_change', orientation);
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('click', handleClick);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Track errors globally
    const handleError = (event: ErrorEvent): void => {
      analytics.trackError(event.error || new Error(event.message), 'Global Error');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
      analytics.trackError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        'Unhandled Promise Rejection'
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Log session start
    analytics.trackEvent({
      category: 'Session',
      action: 'start',
      label: `Device: ${analytics.getDeviceType()}`,
    });

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);

      // Log session end
      const summary = analytics.getSummary();
      analytics.trackEvent({
        category: 'Session',
        action: 'end',
        label: `Duration: ${Math.round(summary.sessionDuration / 1000)}s, Events: ${summary.eventsCount}`,
        value: summary.sessionDuration,
      });
    };
  }, []);

  return children;
}
