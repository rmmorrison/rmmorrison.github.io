function Introduction() {
  return (
    <>
      <div className={`container gap-14 flex items-center my-24 w-full justify-between`}>
        <div>
          <p className={`text-2xl`}>
            <span className={`text-intellij-orange`}>public void</span>
            <span className={`text-intellij-white`}>
              {' '}
              ryanMorrison()
            </span>
            <span className={`text-intellij-brace`}> {`{`}</span>{' '}
          </p>
          <div className={`my-9`}>
            <p className={`pl-6 text-lg text-intellij-comment`}>
              {'// backend software engineer'}
            </p>
          </div>
          <p className={`text-intellij-brace text-2x1`}> {`}`} </p>
        </div>
      </div>
    </>
  )
}

export default Introduction
