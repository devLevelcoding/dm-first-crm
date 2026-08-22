export interface Lead {
  id: number
  name: string
  category?: string | null
  city?: string | null
  country?: string | null
  website?: string | null
  instagramUrl?: string | null
  instagramStatus: string
  instagramDmAt?: string | null
  createdAt: string
}

export interface DmTemplate {
  id: number
  name: string
  body: string
}
