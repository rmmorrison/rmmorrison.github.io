import { FaApple } from "react-icons/fa";
import links from '../data/links.json';
import experience_document from '../data/experience.json';
import tech_document from '../data/technologies.json';

function About() {
  const experience = () => {
    return experience_document.map((job, index) => {
      return (
        <div key={index}>
          <div className={`mt-3 text-yellow`}>{job.title}</div>
          <div className={`mt-1 text-gray-dark`}>{job.company}</div>
          <div className={`mt-1 text-gray-dark`}>{job.from} &mdash; {job.to}</div>
        </div>
      )
    });
  }

  const technologies = () => {
    return tech_document.map((tech) => {
      return (
        <div className={`w-full pt-1`}>
          <span className={`text-gray-light`}>{`>`}</span> {tech}
        </div>
      )
    });
  }

  return (
    <div id={`about`} className={`container gap-20 flex justify-between`}>
      <div className={`text-gray-light basis-6/12 mr-3`}>
        <div className={`text-intellij-comment text-2xl mb-6`}>{`// about`}</div>
        <p className={`mt-3`}>
          I'm a backend software and DevOps Engineer based in <span className={`text-intellij-comment`}>Southern Ontario, Canada</span>.
          Across the past {new Date().getFullYear() - 2013} years I've worked professionally in building quality,
          high performance commercial software. I have extensive experience in the entire software development
          lifecycle, from requirement specification and software design to development and deployment, including
          infrastructure management and CI/CD pipelines.
        </p>
        <p className={`mt-3`}>
          I enjoy tackling projects that push the limits of my knowledge and continue my pursuit of continuous learning.
          My goal is to work with teams interested in building amazing software that drives innovation.
        </p>
        <p className={`mt-3`}>
          In my free time, I like dabbling in electronics, video games, binge watching some new obsession and
          everything <FaApple className={`inline align-middle`}/>.
        </p>
        <p className={`mt-3`}>
          Here's a few technologies I've worked with recently:
        </p>
        <div className={`pl-3 mt-3 text-teal columns-2`}>
          {technologies()}
        </div>
      </div>
      <div>
        <div className={`text-intellij-comment text-2xl mb-6`}>{`// work experience`}</div>
        <div className={`mt-3`}>{experience()}</div>
        <a href={links.linkedin} className={`text-gray-light inline-block mt-6 hover:text-gray-dark`} target={`_blank`} rel={`noreferrer noopener`}>view more {`->`}</a>
      </div>
    </div>
  )
}

export default About