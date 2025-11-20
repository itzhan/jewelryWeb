export default function MainNav() {
  const navItems = [
    'FINE JEWELRY',
    'ENGAGEMENT RINGS',
    'WEDDING BANDS',
    'DIAMONDS',
    'GEMSTONES',
    'EDUCATION'
  ];

  return (
    <nav className="border-b overflow-x-auto">
      <div className="page-width">
        <ul className="flex items-center justify-center gap-4 md:gap-8 py-4 whitespace-nowrap">
          {navItems.map((item) => (
            <li key={item}>
              <a href="#" className="text-xs md:text-sm hover:opacity-70 transition-opacity">
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
