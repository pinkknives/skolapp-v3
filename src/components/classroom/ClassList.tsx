'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { ClassWithMembers } from '@/types/quiz'
import { InviteModal } from './InviteModal'
import { Users, UserPlus, PlayCircle, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface ClassListProps {
  classes: ClassWithMembers[]
}

export function ClassList({ classes }: ClassListProps) {
  const [selectedClassForInvite, setSelectedClassForInvite] = useState<ClassWithMembers | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="h-full">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{classItem.name}</CardTitle>
                  {(classItem.grade || classItem.subject) && (
                    <CardDescription>
                      {[classItem.grade, classItem.subject].filter(Boolean).join(' • ')}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-neutral-600">
                  <Users size={16} />
                  <span>{classItem.memberCount}</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Class code */}
                <div className="bg-neutral-50 rounded-lg p-3">
                  <Typography variant="body2" className="text-neutral-600 mb-1">
                    Klasskod
                  </Typography>
                  <Typography variant="h6" className="font-mono text-primary-600">
                    {classItem.inviteCode}
                  </Typography>
                </div>

                {/* Member list preview */}
                {classItem.members.length > 0 && (
                  <div>
                    <Typography variant="body2" className="text-neutral-600 mb-2">
                      Elever ({classItem.memberCount})
                    </Typography>
                    <div className="space-y-1">
                      {classItem.members
                        .filter(m => m.role === 'student')
                        .slice(0, 3)
                        .map((member) => (
                          <div key={member.id} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-success-500 rounded-full flex-shrink-0" />
                            <span className="text-neutral-700 truncate">
                              {member.alias || 'Okänd elev'}
                            </span>
                          </div>
                        ))}
                      {classItem.memberCount > 3 && (
                        <Typography variant="body2" className="text-neutral-500 pl-4">
                          +{classItem.memberCount - 3} till
                        </Typography>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedClassForInvite(classItem)}
                    className="w-full justify-start"
                  >
                    <UserPlus size={16} />
                    Bjud in elever
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="justify-start"
                    >
                      <Link href={`/teacher/quiz/create?classId=${classItem.id}`}>
                        <PlayCircle size={16} />
                        Kör quiz
                      </Link>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="justify-start"
                    >
                      <Link href={`/teacher/classes/${classItem.id}/results`}>
                        <BarChart3 size={16} />
                        Resultat
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invite modal */}
      {selectedClassForInvite && (
        <InviteModal
          classItem={selectedClassForInvite}
          onClose={() => setSelectedClassForInvite(null)}
        />
      )}
    </>
  )
}