import patent_document from '../data/patents.json';

function Patents() {
  const patents = () => {
    return patent_document.map((patent, index) => {
      return (
        <div key={index}>
          <div className={`mt-3 text-yellow`}>{patent.title}</div>
          <div className={`mt-1 text-gray-dark`}>{patent.inventors.join(', ')}</div>
          <div className={`mt-1 text-gray-dark`}>{patent.country}; assigned number {patent.number}; application year {patent.applicationYear}; granted in {patent.grantYear}</div>
          <a href={patent.link} className={`text-gray-light inline-block mt-3 hover:text-gray-dark`}
             target={`_blank`} rel={`noreferrer noopener`}>view patent {`->`}</a>
        </div>
      )
    });
  }

  return (
    <div id={`patents`} className={`mt-24 w-full`}>
      <div className={`text-intellij-comment text-2xl mb-6`}>{`// patents`}</div>
      <div className={`mt-3`}>{patents()}</div>
    </div>
  )
}

export default Patents