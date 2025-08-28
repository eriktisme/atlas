import { ClickHereButton } from '@/features/dashboard'

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 pb-20 lg:p-14">
      <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
        Congratulations, your account is ready!
      </h1>

      <ClickHereButton />
    </div>
  )
}
