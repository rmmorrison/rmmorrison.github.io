import links from '../data/links.json'
import work_document from '../data/experience.json'
import tech_document from '../data/technologies.json'

const About = () => {
    const work = () => {
        return work_document.map((job, index) => {
            return (
                <div key={index}>
                    <div className="mt-3 text-yellow">{job.title}</div>
                    <div className="mt-1 text-grey-dark">{job.company}</div>
                    <div className="mt-1 text-grey-dark">{job.from} &mdash; {job.to}</div>
                </div>
            )
        });
    }

    const tech = () => {
        return tech_document.map((item) => {
            return (
                <div className="w-full pt-1">
                    <span className="text-grey-light">{`>`}</span> {item}
                </div>
            )
        });
    }

    return (
        <div id="about" className="container gap-20 flex justify-between">
            <div className="text-grey-light basis-6/12 mr-3">
                <div className="text-intellij-comments text-2xl mb-6">{'// about'}</div>
                <p className="mt-3">
                    Hey, I'm Ryan! I'm a backend software and DevOps Engineer based in <span class="text-intellij-comments">Southern Ontario, Canada</span>.
                    Across the past {new Date().getFullYear() - 2013} years I've worked professionally in building quality, high-performance commercial software.
                    I have extensive experience in the entire software development lifecycle, from requirement specifications and
                    software design to development and deployments, including infrastructure management and CI/CD processes.
                </p>
                <p className="mt-3">
                    I enjoy tackling projects that push the limits of my knowledge and continue my pursuit of always
                    learning. My goal is to work with teams interested in building amazing software that
                    drives innovation.
                </p>
                <p className="mt-3">
                    In my free time, I like dabbling in electronics, video games, binge watching
                    a new obsession, and everything Apple.
                </p>
                <p className="mt-3">
                    Here's a few technologies I've worked with recently:
                </p>
                <div className="pl-3 mt-3 text-teal columns-2">
                    {tech()}
                </div>
            </div>
            <div>
                <div className="text-intellij-comments text-2xl mb-6">{'// work experience'}</div>
                <div className="mt-3">{work()}</div>
                <a href={links.linkedin} className="text-grey-light inline-block mt-6 hover:text-grey-dark" target="_blank" rel="noreferrer noopener">view more {'->'}</a>
            </div>
        </div>
    )
}

export default About