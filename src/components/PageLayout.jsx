import Header from './Header'
import Footer from './Footer'
import ChatWidget from './ChatWidget'

export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
