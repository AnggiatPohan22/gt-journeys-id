import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: false,
    // Phase 3.24 — izinkan import runtime dari packages/shared (di luar root cms),
    // dipakai untuk template-registry (single source header/footer templates).
    externalDir: true,
  },
}

export default withPayload(nextConfig)
