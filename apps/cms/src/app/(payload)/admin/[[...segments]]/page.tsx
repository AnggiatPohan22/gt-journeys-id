import type { Metadata } from 'next'
import { generatePageMetadata, RootPage } from '@payloadcms/next/views'
import config from '../../../../payload.config'
import { importMap } from '../importMap.js'

// Phase 4.74.4.3 (Stage 4) — Match Payload's `generatePageMetadata` /
// `RootPage` prop types which don't declare `| undefined` in the
// searchParams value union. Next.js 15 runtime values CAN be undefined,
// but this scaffold only passes them through to Payload (we don't read
// them), so the narrower type is safe and silences TS2322.
type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params, searchParams, importMap })

export default Page
