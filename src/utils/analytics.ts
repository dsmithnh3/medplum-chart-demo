// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  timestamp?: number;
}

export interface PageViewEvent {
  path: string;
  title: string;
  referrer?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  timestamp?: number;
}

class Analytics {
  private enabled: boolean;
  private deviceType: 'mobile' | 'tablet' | 'desktop';
  private events: AnalyticsEvent[] = [];
  private pageViews: PageViewEvent[] = [];
  private sessionStartTime: number;

  constructor() {
    this.enabled = import.meta.env.PROD;
    this.deviceType = this.detectDeviceType();
    this.sessionStartTime = Date.now();

    // Log device type on initialization
    if (this.enabled) {
      console.log('[Analytics] Initialized:', {
        deviceType: this.deviceType,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
      });
    }
  }

  /**
   * Detect device type based on screen width and user agent
   */
  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();

    // Check for mobile keywords in user agent
    const isMobileUA =
      /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTabletUA = /ipad|tablet|playbook|silk/i.test(userAgent);

    // Combine user agent and screen width
    if (isMobileUA || width < 768) {
      return 'mobile';
    } else if (isTabletUA || (width >= 768 && width < 1024)) {
      return 'tablet';
    }
    return 'desktop';
  }

  /**
   * Get current device type
   */
  getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    return this.deviceType;
  }

  /**
   * Check if user is on mobile device
   */
  isMobile(): boolean {
    return this.deviceType === 'mobile';
  }

  /**
   * Track a custom event
   */
  trackEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'deviceType'>): void {
    if (!this.enabled) {
      return;
    }

    const fullEvent: AnalyticsEvent = {
      ...event,
      deviceType: this.deviceType,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);

    // Log to console in development/production for debugging
    console.log('[Analytics] Event:', fullEvent);

    // Here you would send to your analytics service (Google Analytics, Mixpanel, etc.)
    // Example: this.sendToAnalyticsService(fullEvent);
  }

  /**
   * Track a page view
   */
  trackPageView(path: string, title: string): void {
    if (!this.enabled) {
      return;
    }

    const pageView: PageViewEvent = {
      path,
      title,
      referrer: document.referrer,
      deviceType: this.deviceType,
      timestamp: Date.now(),
    };

    this.pageViews.push(pageView);

    console.log('[Analytics] Page View:', pageView);

    // Send to analytics service
    // Example: this.sendPageViewToService(pageView);
  }

  /**
   * Track mobile-specific interactions
   */
  trackMobileInteraction(action: string, label?: string): void {
    if (!this.enabled || !this.isMobile()) {
      return;
    }

    this.trackEvent({
      category: 'Mobile Interaction',
      action,
      label,
    });
  }

  /**
   * Track touch vs click events
   */
  trackInteractionType(
    element: string,
    interactionType: 'touch' | 'click'
  ): void {
    this.trackEvent({
      category: 'User Interaction',
      action: interactionType,
      label: element,
    });
  }

  /**
   * Track navigation events
   */
  trackNavigation(from: string, to: string): void {
    this.trackEvent({
      category: 'Navigation',
      action: 'route_change',
      label: `${from} → ${to}`,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number): void {
    this.trackEvent({
      category: 'Performance',
      action: metric,
      value: Math.round(value),
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, action: string): void {
    this.trackEvent({
      category: 'Feature Usage',
      action,
      label: feature,
    });
  }

  /**
   * Track form interactions
   */
  trackForm(formName: string, action: 'start' | 'submit' | 'error'): void {
    this.trackEvent({
      category: 'Form',
      action,
      label: formName,
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error, context?: string): void {
    this.trackEvent({
      category: 'Error',
      action: error.name,
      label: `${context ? context + ': ' : ''}${error.message}`,
    });
  }

  /**
   * Get session duration
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }

  /**
   * Get analytics summary
   */
  getSummary(): {
    deviceType: string;
    eventsCount: number;
    pageViewsCount: number;
    sessionDuration: number;
  } {
    return {
      deviceType: this.deviceType,
      eventsCount: this.events.length,
      pageViewsCount: this.pageViews.length,
      sessionDuration: this.getSessionDuration(),
    };
  }

  /**
   * Export analytics data (for debugging or sending to backend)
   */
  exportData(): {
    events: AnalyticsEvent[];
    pageViews: PageViewEvent[];
    summary: ReturnType<typeof this.getSummary>;
  } {
    return {
      events: this.events,
      pageViews: this.pageViews,
      summary: this.getSummary(),
    };
  }

  /**
   * Clear stored analytics data
   */
  clear(): void {
    this.events = [];
    this.pageViews = [];
    this.sessionStartTime = Date.now();
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export hook for React components
export function useAnalytics(): Analytics {
  return analytics;
}

// Helper to track component mount
export function trackComponentMount(componentName: string): void {
  analytics.trackEvent({
    category: 'Component Lifecycle',
    action: 'mount',
    label: componentName,
  });
}

// Helper to track button clicks
export function trackButtonClick(buttonName: string): void {
  analytics.trackEvent({
    category: 'Button Click',
    action: 'click',
    label: buttonName,
  });
}

// Helper to track modal open/close
export function trackModal(modalName: string, action: 'open' | 'close'): void {
  analytics.trackEvent({
    category: 'Modal',
    action,
    label: modalName,
  });
}
