// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { analytics } from '../utils/analytics';

/**
 * Hook to automatically track page views when route changes
 */
export function usePageTracking(): void {
  const location = useLocation();
  const prevPathRef = useRef<string>('');

  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const previousPath = prevPathRef.current;

    // Track page view
    analytics.trackPageView(currentPath, document.title);

    // Track navigation if there was a previous page
    if (previousPath && previousPath !== currentPath) {
      analytics.trackNavigation(previousPath, currentPath);
    }

    // Update previous path
    prevPathRef.current = currentPath;
  }, [location]);
}
