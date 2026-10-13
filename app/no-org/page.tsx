export default function NoOrgPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <h1 className="text-3xl font-semibold">Store not found</h1>
        <p className="mt-4 text-neutral-500">
          No store is configured at this address. Check the URL or contact the
          site owner.
        </p>
      </div>
    </div>
  );
}
