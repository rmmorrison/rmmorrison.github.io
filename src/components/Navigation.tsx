function Navigation() {
  const scroll = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', inline: 'center' });
  }

  return (
    <nav className={`flex w-full items-center justify-between`}>
      <div className={`block`}></div>
      <div className={`flex gap-6 sm:gap-10 items-center text-xs sm:text-[14px]`}>
        <div className={`text-gray-light hover:text-gray-dark cursor-pointer`} onClick={() => scroll('about')}>
          about
        </div>
        <div className={`text-gray-light hover:text-gray-dark cursor-pointer`}
             onClick={() => scroll('contact')}>
          contact
        </div>
      </div>
    </nav>
  )
}

export default Navigation
