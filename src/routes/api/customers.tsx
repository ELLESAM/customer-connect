import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '../../lib/db.server'

export const Route = createFileRoute('/api/customers')({
  server: {
    handlers: {
      GET: async () => {
        const db = await getDb()

        const result = await db.request().query(`
          SELECT Id, Name, Email, CreatedAt
          FROM Customers
          ORDER BY Id DESC
        `)

        return Response.json(result.recordset)
      },

      POST: async ({ request }) => {
        const body = await request.json()

        const db = await getDb()

        await db
          .request()
          .input('name', body.name)
          .input('email', body.email)
          .query(`
            INSERT INTO Customers (Name, Email)
            VALUES (@name, @email)
          `)

        return Response.json({ success: true })
      },
    },
  },
})
