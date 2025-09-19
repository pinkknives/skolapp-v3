'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { Typography, Heading } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { 
  createOrg, 
  getUserOrganizations, 
  getOrganizationMembers, 
  updateMemberRole, 
  removeMember, 
  inviteToOrganization,
  canManageOrganization,
  type Organization,
  type OrganizationMember 
} from '@/lib/orgs'
import { Users, Plus, Settings, Mail, Trash2 } from 'lucide-react'

export default function OrganizationPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [canManage, setCanManage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [newOrgName, setNewOrgName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'teacher'>('teacher')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadOrganizations()
  }, [])

  useEffect(() => {
    if (selectedOrg) {
      loadMembers()
      checkManagePermissions()
    }
  }, [selectedOrg])

  const loadOrganizations = async () => {
    try {
      setLoading(true)
      const { data, error } = await getUserOrganizations()
      if (error) {
        setError('Kunde inte ladda organisationer: ' + error.message)
        return
      }
      setOrganizations(data || [])
      if (data && data.length > 0 && !selectedOrg) {
        setSelectedOrg(data[0])
      }
    } catch (err) {
      setError('Ett oväntat fel inträffade')
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    if (!selectedOrg) return
    
    try {
      const { data, error } = await getOrganizationMembers(selectedOrg.id)
      if (error) {
        setError('Kunde inte ladda medlemmar: ' + error.message)
        return
      }
      setMembers(data || [])
    } catch (err) {
      setError('Ett oväntat fel inträffade vid laddning av medlemmar')
    }
  }

  const checkManagePermissions = async () => {
    if (!selectedOrg) return
    
    try {
      const canManageOrg = await canManageOrganization(selectedOrg.id)
      setCanManage(canManageOrg)
    } catch (err) {
      setCanManage(false)
    }
  }

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName.trim()) return

    try {
      setSubmitting(true)
      const { data, error } = await createOrg(newOrgName.trim())
      if (error) {
        setError('Kunde inte skapa organisation: ' + error.message)
        return
      }
      
      // Reload organizations and select the new one
      await loadOrganizations()
      if (data) {
        setSelectedOrg(data)
      }
      setShowCreateForm(false)
      setNewOrgName('')
    } catch (err) {
      setError('Ett oväntat fel inträffade vid skapande av organisation')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrg || !inviteEmail.trim()) return

    try {
      setSubmitting(true)
      const { error } = await inviteToOrganization(selectedOrg.id, inviteEmail.trim(), inviteRole)
      if (error) {
        setError('Kunde inte skicka inbjudan: ' + error.message)
        return
      }
      
      setShowInviteForm(false)
      setInviteEmail('')
      setInviteRole('teacher')
      // In a real app, you might want to show the invite was sent
    } catch (err) {
      setError('Ett oväntat fel inträffade vid sändning av inbjudan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'teacher') => {
    try {
      const { error } = await updateMemberRole(memberId, newRole)
      if (error) {
        setError('Kunde inte uppdatera roll: ' + error.message)
        return
      }
      await loadMembers()
    } catch (err) {
      setError('Ett oväntat fel inträffade vid uppdatering av roll')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna medlem?')) return
    
    try {
      const { error } = await removeMember(memberId)
      if (error) {
        setError('Kunde inte ta bort medlem: ' + error.message)
        return
      }
      await loadMembers()
    } catch (err) {
      setError('Ett oväntat fel inträffade vid borttagning av medlem')
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'owner': return 'Ägare'
      case 'admin': return 'Administratör'
      case 'teacher': return 'Lärare'
      default: return role
    }
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'active': return 'Aktiv'
      case 'pending': return 'Väntande'
      case 'inactive': return 'Inaktiv'
      default: return status
    }
  }

  const getMemberDisplayName = (member: OrganizationMember) => {
    if (member.user?.user_metadata?.first_name || member.user?.user_metadata?.last_name) {
      return `${member.user.user_metadata.first_name || ''} ${member.user.user_metadata.last_name || ''}`.trim()
    }
    return member.user?.email || 'Okänd användare'
  }

  if (loading) {
    return (
      <Layout>
        <Section spacing="lg">
          <Container>
            <div className="text-center">
              <Typography variant="body1">Laddar organisationer...</Typography>
            </div>
          </Container>
        </Section>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <Section spacing="lg">
          <Container>
            <Card>
              <CardContent>
                <Typography variant="body1" color="error">{error}</Typography>
                <Button onClick={() => {
                  setError(null)
                  loadOrganizations()
                }} className="mt-4">
                  Försök igen
                </Button>
              </CardContent>
            </Card>
          </Container>
        </Section>
      </Layout>
    )
  }

  return (
    <Layout>
      <Section spacing="lg">
        <Container>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Heading level={1} className="mb-2">
                  Organisation
                </Heading>
                <Typography variant="subtitle1" className="text-neutral-600">
                  Hantera din organisation och medlemmar.
                </Typography>
              </div>
              {organizations.length === 0 && (
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  leftIcon={<Plus size={16} />}
                >
                  Skapa organisation
                </Button>
              )}
            </div>
          </div>

          {organizations.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Välkommen till Organisationer</CardTitle>
                <CardDescription>
                  Skapa din första organisation för att börja samarbeta med andra lärare.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showCreateForm ? (
                  <form onSubmit={handleCreateOrganization} className="space-y-4">
                    <div>
                      <label htmlFor="orgName" className="block text-sm font-medium text-neutral-700 mb-1">
                        Organisationsnamn
                      </label>
                      <Input
                        id="orgName"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        placeholder="T.ex. Åkersberga Grundskola"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" loading={submitting}>
                        Skapa organisation
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowCreateForm(false)
                          setNewOrgName('')
                        }}
                        disabled={submitting}
                      >
                        Avbryt
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    leftIcon={<Plus size={16} />}
                  >
                    Skapa organisation
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Organization selector */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Mina organisationer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {organizations.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => setSelectedOrg(org)}
                        className={`w-full p-3 text-left rounded-md transition-colors ${
                          selectedOrg?.id === org.id
                            ? 'bg-primary-50 border-primary-200 border'
                            : 'bg-neutral-50 hover:bg-neutral-100 border border-transparent'
                        }`}
                      >
                        <Typography variant="body1" className="font-medium">
                          {org.name}
                        </Typography>
                        <Typography variant="caption" className="text-neutral-500">
                          Skapad {new Date(org.created_at).toLocaleDateString('sv-SE')}
                        </Typography>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Organization details */}
              <div className="lg:col-span-2">
                {selectedOrg && (
                  <div className="space-y-6">
                    {/* Organization info */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{selectedOrg.name}</CardTitle>
                            <CardDescription>
                              Skapad {new Date(selectedOrg.created_at).toLocaleDateString('sv-SE')}
                            </CardDescription>
                          </div>
                          {canManage && (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Settings size={16} />}
                            >
                              Inställningar
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Members */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Users size={20} />
                              Medlemmar ({members.length})
                            </CardTitle>
                            <CardDescription>
                              Hantera organisationens medlemmar och roller.
                            </CardDescription>
                          </div>
                          {canManage && (
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Mail size={16} />}
                              onClick={() => setShowInviteForm(true)}
                            >
                              Bjud in
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {showInviteForm && (
                          <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
                            <Typography variant="h6" className="mb-3">
                              Bjud in ny medlem
                            </Typography>
                            <form onSubmit={handleInviteMember} className="space-y-4">
                              <div>
                                <label htmlFor="inviteEmail" className="block text-sm font-medium text-neutral-700 mb-1">
                                  E-postadress
                                </label>
                                <Input
                                  id="inviteEmail"
                                  type="email"
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                  placeholder="namn@exempel.se"
                                  required
                                  disabled={submitting}
                                />
                              </div>
                              <div>
                                <label htmlFor="inviteRole" className="block text-sm font-medium text-neutral-700 mb-1">
                                  Roll
                                </label>
                                <select
                                  id="inviteRole"
                                  value={inviteRole}
                                  onChange={(e) => setInviteRole(e.target.value as 'admin' | 'teacher')}
                                  disabled={submitting}
                                  className="flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-all duration-200 hover:border-neutral-400 focus:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <option value="teacher">Lärare</option>
                                  <option value="admin">Administratör</option>
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <Button type="submit" loading={submitting} size="sm">
                                  Skicka inbjudan
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setShowInviteForm(false)
                                    setInviteEmail('')
                                    setInviteRole('teacher')
                                  }}
                                  disabled={submitting}
                                >
                                  Avbryt
                                </Button>
                              </div>
                            </form>
                          </div>
                        )}

                        <div className="space-y-3">
                          {members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                            >
                              <div>
                                <Typography variant="body1" className="font-medium">
                                  {getMemberDisplayName(member)}
                                </Typography>
                                <div className="flex items-center gap-3 mt-1">
                                  <Typography variant="caption" className="text-neutral-600">
                                    {member.user?.email}
                                  </Typography>
                                  <span className="text-neutral-300">•</span>
                                  <Typography variant="caption" className="text-neutral-600">
                                    {getRoleDisplayName(member.role)}
                                  </Typography>
                                  <span className="text-neutral-300">•</span>
                                  <Typography variant="caption" className="text-neutral-600">
                                    {getStatusDisplayName(member.status)}
                                  </Typography>
                                </div>
                              </div>
                              {canManage && member.role !== 'owner' && (
                                <div className="flex items-center gap-2">
                                  <select
                                    value={member.role}
                                    onChange={(e) => handleUpdateRole(member.id, e.target.value as 'admin' | 'teacher')}
                                    className="text-sm flex w-24 rounded-md border border-neutral-300 bg-white px-2 py-1 transition-all duration-200 hover:border-neutral-400 focus:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                                  >
                                    <option value="teacher">Lärare</option>
                                    <option value="admin">Administratör</option>
                                  </select>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="text-error-600 hover:text-error-700 hover:bg-error-50"
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                          {members.length === 0 && (
                            <div className="text-center py-6">
                              <Typography variant="body2" className="text-neutral-500">
                                Inga medlemmar hittades.
                              </Typography>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </Layout>
  )
}