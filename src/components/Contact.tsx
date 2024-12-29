import Obfuscate from 'react-obfuscate';
import Links from './Links';

function Contact() {
  // obfuscate email in code: https://stackoverflow.com/questions/7885096/how-do-i-decode-a-string-with-escaped-unicode
  const email = decodeURIComponent(JSON.parse('"ryan.morrison04\\u0040icloud\\u002ecom"'));

  return (
    <div id={`contact`} className={`my-24 w-full`}>
      <div className={`text-intellij-comment text-2xl mb-6`}>{`// contact`}</div>
      <span className={`text-gray-light`}>Want to get in touch? Reach out to me via </span>
      <span className={`text-intellij-orange`}><Obfuscate email={email} /></span>
      <span className={`text-gray-light`}> for inquiries.</span>
      <div className={`mt-9 credits text-intellij-white`}>
        <div className={`text-sm`}>
          System.<span className={`text-intellij-purple`}>out</span>.println(thanks);
        </div>
        <div className={`text-sm`}>
          System.<span className={`text-intellij-purple`}>out</span>.println(bluesky, github, linkedin);
        </div>
        <div className={`text-gray-light`}>{`>>`} thanks for stopping by!</div>
        <Links />
      </div>
    </div>
  )
}

export default Contact
