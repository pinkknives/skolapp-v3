import { NextRequest, NextResponse } from 'next/server'

const getStripe = async () => {
	if (!process.env.STRIPE_SECRET_KEY) {
		throw new Error('STRIPE_SECRET_KEY is not set')
	}
	const { default: Stripe } = await import('stripe')
	return new Stripe(process.env.STRIPE_SECRET_KEY, {
		apiVersion: '2025-08-27.basil',
	})
}

export async function POST(request: NextRequest) {
	try {
		const { customerId } = await request.json()
		if (!customerId) {
			return NextResponse.json({ error: 'customerId required' }, { status: 400 })
		}

		const stripe = await getStripe()
		const portalSession = await stripe.billingPortal.sessions.create({
			customer: customerId,
			return_url: `${request.nextUrl.origin}/teacher`,
		})

		return NextResponse.json({ url: portalSession.url })
	} catch (error) {
		console.error('Billing portal error:', error)
		return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
	}
}
