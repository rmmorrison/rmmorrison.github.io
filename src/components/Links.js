import { AiFillGithub, AiFillLinkedin } from 'react-icons/ai'
import { RiBlueskyFill } from "react-icons/ri";
import links from '../data/links.json'

const Links = () => {
    return (
        <div className="mt-3 text-grey-light flex items-center">
            <span className="text-sm mr-3 ">{`>> `}</span>
            <a href={links.bluesky} className="px-1 hover:text-grey-dark text-2xl" target="_blank" rel="noreferrer noopener">
                <RiBlueskyFill />
            </a>
            <a href={links.github} className="px-1 hover:text-grey-dark text-2xl" target="_blank" rel="noreferrer noopener">
                <AiFillGithub />
            </a>
            <a href={links.linkedin} className="px-1 hover:text-grey-dark text-2xl" target="_blank" rel="noreferrer noopener">
                <AiFillLinkedin />
            </a>
        </div>
    )
}

export default Links