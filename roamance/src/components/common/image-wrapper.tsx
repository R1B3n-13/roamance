import Image, { ImageProps } from 'next/image';

interface ImageWrapperProps extends Omit<ImageProps, 'src'> {
  src: string;
  baseDirectory?: string;
}

export function isExternalUrl(url: string): boolean {
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  );
}

export function getImagePath(src: string, baseDirectory = 'images'): string {
  if (isExternalUrl(src)) {
    return src;
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return src.startsWith('/')
    ? `${basePath}${src}`
    : `${basePath}/${baseDirectory}/${src}`;
}

export function ImageWrapper({
  src,
  baseDirectory = 'images',
  ...rest
}: ImageWrapperProps) {
  const fullPath = getImagePath(src, baseDirectory);
  return <Image src={fullPath} {...rest} />;
}
