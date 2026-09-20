import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Customers — Customer Manager" },
      {
        name: "description",
        content: "A simple Azure SQL customer manager.",
      },
    ],
  }),
  component: Index,
});

type Customer = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

type ApiCustomer = {
  Id: number;
  Name: string;
  Email: string;
  CreatedAt: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function Index() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadCustomers() {
    try {
      setLoading(true);

      const response = await fetch("/api/customers");

      if (!response.ok) {
        throw new Error("Failed to load customers.");
      }

      const data: ApiCustomer[] = await response.json();

      setCustomers(
        data.map((customer) => ({
          id: customer.Id,
          name: customer.Name,
          email: customer.Email,
          createdAt: customer.CreatedAt,
        }))
      );
    } catch (err) {
      console.error(err);
      setError("Could not load customers from the database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleSave(e: React.FormEvent) {
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

    const duplicate = customers.some(
      (customer) =>
        customer.email.toLowerCase() === trimmedEmail.toLowerCase()
    );

    if (duplicate) {
      setError("A customer with this email already exists.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save customer.");
      }

      setName("");
      setEmail("");
      setSaved(true);

      await loadCustomers();

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      console.error(err);
      setError("Could not save the customer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:py-14">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Customers
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Customers are stored securely in Azure SQL Database.
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
                Customer saved to Azure SQL.
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 sm:w-auto sm:justify-self-end"
            >
              {saving ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </form>

        <section className="mt-8" aria-label="Customer list">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Customer list{" "}
            {!loading && customers.length > 0 && (
              <span className="font-normal normal-case tracking-normal">
                ({customers.length})
              </span>
            )}
          </h2>

          {loading ? (
            <p className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
              Loading customers...
            </p>
          ) : customers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
              No customers yet.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {customers.map((customer) => (
                <li
                  key={customer.id}
                  className="px-4 py-3 sm:px-5"
                >
                  <p className="truncate text-sm font-medium text-foreground">
                    {customer.name}
                  </p>

                  <p className="truncate text-sm text-muted-foreground">
                    {customer.email}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
