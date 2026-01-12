// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Box, Skeleton } from '@mantine/core';
import type { JSX } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  style,
  onLoad,
  onError,
}: LazyImageProps): JSX.Element {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    freezeOnceVisible: true,
  });

  return (
    <Box ref={ref} w={width} h={height} className={className} style={style}>
      {isVisible ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{ width: '100%', height: 'auto' }}
          onLoad={onLoad}
          onError={onError}
          loading="lazy"
        />
      ) : (
        <Skeleton width={width || '100%'} height={height || 200} />
      )}
    </Box>
  );
}
