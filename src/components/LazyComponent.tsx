// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Box, Loader } from '@mantine/core';
import type { JSX, ReactNode } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  minHeight?: string | number;
  rootMargin?: string;
}

/**
 * Wrapper component that only renders children when visible in viewport.
 * Useful for expensive components like charts, tables, or complex forms.
 */
export function LazyComponent({
  children,
  fallback,
  minHeight = '200px',
  rootMargin = '100px',
}: LazyComponentProps): JSX.Element {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0,
    rootMargin,
    freezeOnceVisible: true,
  });

  return (
    <Box ref={ref} style={{ minHeight: isVisible ? 'auto' : minHeight }}>
      {isVisible ? (
        children
      ) : (
        fallback || (
          <Box display="flex" style={{ justifyContent: 'center', alignItems: 'center', minHeight }}>
            <Loader size="md" />
          </Box>
        )
      )}
    </Box>
  );
}
