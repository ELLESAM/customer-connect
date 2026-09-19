import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Customers — Customer Manager" },
      {
        name: "description",
        content:
          "A simple customer manager: save customers with name and email, and keep a list of everyone you've added.",
      },
      { property: "og:title", content: "Customers — Customer Manager" },
      {
        property: "og:description",
        content:
          "A simple customer manager: save customers with name and email, and keep a list of everyone you've added.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Customer = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

const STORAGE_KEY = "customers";

function loadCustomers(): Customer[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is Customer =>
        typeof c?.id === "string" &&
        typeof c?.name === "string" &&
        typeof c?.email === "string"
    );
  } catch {
    return [];
  }
}

function saveCustomers(customers: Customer[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch {
    // Storage unavailable (private mode, quota) — list still works in-session
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function Index() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [customers, setCustomers] = useState<Customer[] | null>(null);

  useEffect(() => {
    setCustomers(loadCustomers());
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter a customer name.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    const duplicate = (customers ?? []).some(
      (c) => c.email.toLowerCase() === trimmedEmail.toLowerCase()
    );
    if (duplicate) {
      setError("A customer with this email is already in your list.");
      return;
    }

    const customer: Customer = {
      id: crypto.randomUUID(),
      name: trimmedName,
      email: trimmedEmail,
      createdAt: new Date().toISOString(),
    };

    const next = [customer, ...(customers ?? [])];
    setCustomers(next);
    saveCustomers(next);
    setName("");
    setEmail("");
    setError(null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  function handleDelete(id: string) {
    const next = (customers ?? []).filter((c) => c.id !== id);
    setCustomers(next);
    saveCustomers(next);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:py-14">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Customers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a customer below — your list is saved on this device.
          </p>
        </header>

        <form
          onSubmit={handleSave}
          noValidate
          className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"
        >
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <label
                htmlFor="customer-name"
                className="text-sm font-medium text-foreground"
              >
                Name
              </label>
              <input
                id="customer-name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="customer-email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="customer-email"
                type="email"
                autoComplete="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {saved && !error && (
              <p className="text-sm text-muted-foreground" role="status">
                Customer saved.
              </p>
            )}

            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto sm:justify-self-end"
            >
              Save Customer
            </button>
          </div>
        </form>

        <section className="mt-8" aria-label="Customer list">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Customer list{" "}
            {customers !== null && customers.length > 0 && (
              <span className="font-normal normal-case tracking-normal">
                ({customers.length})
              </span>
            )}
          </h2>

          {customers === null ? null : customers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
              No customers yet. Save your first one above.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {customers.map((customer) => (
                <li
                  key={customer.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {customer.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {customer.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(customer.id)}
                    aria-label={`Remove ${customer.name}`}
                    className="shrink-0 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
