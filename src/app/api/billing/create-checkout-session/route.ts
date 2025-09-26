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
		const { priceId, plan, orgId, uid, billingPeriod } = await request.json()

		if (!priceId || !plan) {
			return NextResponse.json({ error: 'priceId and plan are required' }, { status: 400 })
		}

		const stripe = await getStripe()

		const session = await stripe.checkout.sessions.create({
			line_items: [{ price: priceId, quantity: 1 }],
			mode: 'subscription',
			success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`,
			metadata: {
				plan, // 'teacher_bas' | 'teacher_pro' | 'school'
				org_id: orgId || '',
				uid: uid || '',
				billingPeriod: billingPeriod || 'monthly',
			},
			automatic_tax: { enabled: true },
			customer_creation: 'always',
			subscription_data: { trial_period_days: 14 },
			billing_address_collection: 'required',
		})

		return NextResponse.json({ url: session.url })
	} catch (error) {
		console.error('Error creating checkout session:', error)
		return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
	}
}
