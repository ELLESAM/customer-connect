import sql from 'mssql'
import { DefaultAzureCredential } from '@azure/identity'

const credential = new DefaultAzureCredential()

export async function getDb() {
  const token = await credential.getToken(
    'https://database.windows.net/.default'
  )

  const pool = await sql.connect({
    server: 'customer-connect-sql.database.windows.net',
    database: 'customerdb',
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
    authentication: {
      type: 'azure-active-directory-access-token',
      options: {
        token: token!.token,
      },
    },
  })

  return pool
}
