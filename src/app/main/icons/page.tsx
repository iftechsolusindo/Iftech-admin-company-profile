import TechnologyManager from "../../components/techmanager";

export default function TechnologiesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Technology Stack
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Manage technology names and their icons used across projects.
        </p>
      </div>

      <TechnologyManager />
    </div>
  );
}