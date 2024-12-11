import Links from './Links.js'

const Intro = () => {
    return (
        <>
            <div className="container gap-14 flex items-center my-24 w-full justify-between">
                <div>
                    <p className="text-2xl">
                        <span className="text-intellij-orange">public void</span>
                        <span className="text-intellij-white">
                            {' '}
                            ryanMorrison()
                        </span>
                        <span className="text-intellij-brackets"> {`{`}</span>{' '}
                    </p>
                    <div className="my-9">
                        <p className="pl-6 text-lg text-intellij-comments">
                            {'// backend software engineer'}<span class="blink">|</span>
                        </p>
                    </div>
                    <p className="text-intellij-brackets text-2xl"> {`}`} </p>
                    <div className="mt-10">
                        <div className="text-sm text-intellij-white">
                            System.<span className="text-intellij-purple">out</span>.println(bluesky, github, linkedin);
                        </div>
                        <Links />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Intro