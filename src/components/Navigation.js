const Navigation = () => {
    const scroll = (id) => {
        const element = document.getElementById(id);
        element.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }

    return (
        <nav className="flex w-full items-center justify-between">
            <div className="block"></div>
            <div className="flex gap-6 sm:gap-10 items-center text-xs sm:text-[14px]">
                <div className="text-grey-light hover:text-grey-dark cursor-pointer"
                     onClick={() => scroll('about')}>
                        about
                </div>
                <div className="text-grey-light hover:text-grey-dark cursor-pointer"
                     onClick={() => scroll('contact')}>
                        contact
                </div>
            </div>
        </nav>
    )
}

export default Navigation