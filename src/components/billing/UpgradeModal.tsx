"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { logTelemetryEvent } from '@/lib/telemetry'

interface UpgradeModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onUpgrade: () => void
}

const plans = [
	{ id: 'gratis', name: 'Gratis', price: '0 kr/mån', features: ['Upp till 3 quiz', 'Grundläggande funktioner'] },
	{ id: 'teacher_bas', name: 'Bas', price: '99 kr/mån', features: ['Upp till 50 quiz', 'AI-hjälp (begränsad)'] },
	{ id: 'teacher_pro', name: 'Pro', price: '199 kr/mån', features: ['Avancerad AI', 'Fler quiz och elever'] },
	{ id: 'school', name: 'Skola', price: 'Offert', features: ['Administrationsverktyg', 'Obegränsat för lärare'] },
]

export function UpgradeModal({ open, onOpenChange, onUpgrade }: UpgradeModalProps) {
	React.useEffect(() => {
		if (open) {
			logTelemetryEvent('upgrade_prompt_shown')
		}
	}, [open])

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Uppgradera för att använda AI</DialogTitle>
					<DialogDescription>
						För att använda AI‑funktionerna behöver du en betald plan. Välj en plan som passar dig.
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
					{plans.map((p) => (
						<div key={p.id} className="border rounded-lg p-4">
							<Typography variant="h6" className="mb-1">{p.name}</Typography>
							<Typography variant="subtitle2" className="text-primary-600 mb-2">{p.price}</Typography>
							<ul className="list-disc pl-5 space-y-1">
								{p.features.map((f) => (
									<li key={f} className="text-sm">{f}</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<DialogFooter>
					<Button
						size="lg"
						onClick={() => {
							logTelemetryEvent('upgrade_cta_clicked', { source: 'upgrade_modal' })
							onUpgrade()
						}}
					>
						Uppgradera
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default UpgradeModal
