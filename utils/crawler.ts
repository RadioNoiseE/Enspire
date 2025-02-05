import fetch, { Headers } from 'node-fetch'
import * as dotenv from 'dotenv'
import crypto from 'uncrypto'
import * as Iron from 'iron-webcrypto'
import { createStorage } from 'unstorage'
import fsLiteDriver from 'unstorage/drivers/fs-lite'
import type { Club, Clubs } from '~/types/clubs'

const storage = createStorage({
  driver: fsLiteDriver({ base: './data' }),
})

dotenv.config()

class TSession {
  private readonly headers: Headers

  constructor() {
    const PHPSESSID = process.env.PHPSESSID
    if (!PHPSESSID || !process.env.TSIMS_URL)
      throw new Error('PHPSESSID or TSIMS_URL environment variable is not set')

    this.headers = new Headers({
      Cookie: `PHPSESSID=${PHPSESSID}`,
    })
  }

  async fetchClubCategories(): Promise<any> {
    const response = await fetch(`${process.env.TSIMS_URL}/php/cas_init_category_dropdown.php`, {
      method: 'POST',
      headers: this.headers,
    })
    return await response.json()
  }

  async fetchClubsInCategory(categoryId: number): Promise<any> {
    const formData = new URLSearchParams()
    formData.append('categoryid', categoryId.toString())

    const response = await fetch(`${process.env.TSIMS_URL}/php/cas_init_groups_dropdown.php`, {
      method: 'POST',
      headers: this.headers,
      body: formData,
    })
    return await response.json()
  }

  async fetchClubDetails(clubId: number): Promise<Club> {
    const formData = new URLSearchParams()
    formData.append('groupid', clubId.toString())

    const response = await fetch(`${process.env.TSIMS_URL}/php/cas_add_group_info.php`, {
      method: 'POST',
      headers: this.headers,
      body: formData,
    })
    return await response.json()
  }
}

export default async function main(): Promise<Clubs> {
  const tSession = new TSession()
  const output: Clubs = {} as Clubs

  const clubCategories = await tSession.fetchClubCategories()
  for (const category of clubCategories) {
    const clubs = await tSession.fetchClubsInCategory(category.C_CategoryID)
    output[category.C_Category as keyof Clubs] = []
    for (const club of clubs) {
      const clubDetails = await tSession.fetchClubDetails(club.C_GroupsID)
      output[category.C_Category as keyof Clubs]!.push(clubDetails)
    }
  }

  const encrypted = await Iron.seal(crypto, output, process.env.CLUB_DATA_SECRET_KEY!, Iron.defaults)
  await storage.setItem('clubs:encrypted', encrypted)

  return output
}
