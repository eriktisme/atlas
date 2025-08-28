import type { Metadata } from 'next'

type MetadataGenerator = Omit<Metadata, 'description' | 'title'> & {
  description?: string
  image?: string
  title?: string
}

export const createMetadata = ({
  authors = [
    {
      name: 'Erik van Dam',
    },
  ],
  description,
  image,
  title = 'Atlas',
  ...properties
}: MetadataGenerator): Metadata => {
  const defaultMetadata: Metadata = {
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title,
    },
    applicationName: title,
    authors,
    creator: Array.isArray(authors) ? authors?.at(0)?.name : authors?.name,
    description,
    formatDetection: {
      telephone: false,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: title,
      locale: 'en_US',
    },
    title,
  }

  const metadata: Metadata = { ...defaultMetadata, ...properties }

  if (image && metadata.openGraph) {
    metadata.openGraph.images = [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: title,
      },
    ]
  }

  return metadata
}
