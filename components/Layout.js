import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="container">
      <header>
        <nav>
          <h1>Soundviz</h1>
          <ul>
            <li>
              {/* link without <a> */}
              <Link href="/login">Sign In</Link>
            </li>
            <li>
              <Link href="/signup">Sign Up</Link>
            </li>
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>© 2024 Sonify for Graphs Project</p>
      </footer>
    </div>
  );
}
