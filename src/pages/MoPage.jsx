import ServicePageTemplate from '../components/ServicePageTemplate'

export default function MoPage() {
  return (
    <ServicePageTemplate
      seoTitle="Ask Mo — Motoka's AI Assistant for Vehicle Documents | Motoka"
      seoDescription="Mo is Motoka's AI assistant — ask about renewal steps, document requirements, or your next expiry date, and get an answer instantly, right in the app."
      eyebrow="Ask Mo"
      h1="Mo answers your vehicle document questions instantly"
      subcopy="Not sure what a road worthiness certificate covers, or whether you can renew from a different state? Mo is Motoka's built-in AI assistant — ask in plain language and get a straight answer, without digging through a help center."
      steps={[
        { title: 'Open the chat', description: 'Mo is available directly in the Motoka app and on the website — no separate login.' },
        { title: 'Ask your question', description: 'Renewal steps, document requirements, costs, or your own expiry dates — ask however you\'d normally phrase it.' },
        { title: 'Get a direct answer', description: 'Mo responds instantly, and can point you to the exact renewal flow if you\'re ready to act.' },
      ]}
      benefits={[
        { title: 'Plain-language answers', description: 'No need to know the right official term — ask however makes sense to you.' },
        { title: 'Available anytime', description: 'No waiting for support hours or a callback.' },
        { title: 'Knows Motoka specifically', description: 'Mo understands the actual renewal flows and documents Motoka handles, not generic advice.' },
        { title: 'Points you to the next step', description: 'If your question leads to an action, Mo links you straight to it.' },
      ]}
      faqs={[
        {
          q: 'What kinds of questions can I ask Mo?',
          a: 'Anything about vehicle documents — what you need, how renewal works, what something costs, or what happens if a document has expired.',
        },
        {
          q: 'Is Mo available in the app or just on the website?',
          a: 'Both — Mo is built into the Motoka experience wherever you\'re using it.',
        },
      ]}
      ctaText="Ask Mo a question"
      ctaTo="/#top"
    />
  )
}
